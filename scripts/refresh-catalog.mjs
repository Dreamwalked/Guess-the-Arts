import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {wikipediaJobs,wikiTitleJobs,characterListJobs,televisionJobs,albumJobs,actorJobs,bookJobs,songRules} from './catalog-config.mjs';
import {catalogPoints,cleanWikiTitle,isArticleTitle,isWikiWork,isFeatureFilm,isStudioAlbum,isRapper,wikiTemplates,titleMatches,mergeAnswers,bookMatchesPrompt,bookEvidence} from '../lib/catalog-rules.mjs';
import {normalize} from '../lib/game.mjs';
import {billionDollarFilms} from '../lib/edition-rules.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cacheDir=path.join(root,'.catalog-cache');
const outputDir=path.join(root,'lib','catalog');
await fs.mkdir(cacheDir,{recursive:true});await fs.mkdir(outputDir,{recursive:true});
const args=new Set(process.argv.slice(2));
const force=args.has('--fresh');
const selected=[...args].find(arg=>arg.startsWith('--provider='))?.split('=')[1];
const onlyOctober31=args.has('--only=oct31');
const selectedJobs=jobs=>onlyOctober31?jobs.filter(job=>job.id.startsWith('oct31-')):jobs;
const asOf=new Date().toISOString().slice(0,10);
const userAgent=process.env.CATALOG_USER_AGENT||'GuessTheArts/1.0 (local non-commercial culture-game catalog; https://www.wikidata.org/wiki/Help:Data_access)';
const hosts=new Map();
const failures=[];
const intervals={'musicbrainz.org':1100,'openlibrary.org':1100,'en.wikipedia.org':250,'www.wikidata.org':300,'api.tvmaze.com':250};
async function request(url,{format='json'}={}){
 const key=createHash('sha256').update(format==='json'?url:format+':'+url).digest('hex');
 const file=path.join(cacheDir,key+'.json');
 if(!force){try{const cached=JSON.parse(await fs.readFile(file,'utf8'));if(Date.now()-cached.at<7*86400000)return cached.data;}catch{}}
 const host=new URL(url).hostname;
 for(let attempt=0;attempt<3;attempt++){
  const previous=hosts.get(host)||Promise.resolve();
  let release;hosts.set(host,new Promise(resolve=>{release=resolve;}));
  await previous;
  try{
   const response=await fetch(url,{headers:{'User-Agent':userAgent,Accept:format==='json'?'application/json':'text/html'},signal:AbortSignal.timeout(35000)});
   if(!response.ok){
    if((response.status===429||response.status>=500)&&attempt<2){const retry=Number(response.headers.get('retry-after'));await delay(Math.min(30000,Number.isFinite(retry)&&retry>0?retry*1000:1500*(attempt+1)));continue;}
    throw new Error(`HTTP ${response.status}: ${url}`);
   }
   const data=await (format==='json'?response.json():response.text());
   if(data.error)throw new Error(`${data.error.code}: ${data.error.info}`);
   await fs.writeFile(file,JSON.stringify({at:Date.now(),data}));
   return data;
  }catch(error){if(attempt===2)throw error;await delay(1000*(attempt+1));}
  finally{await delay(intervals[host]||1000);release();}
 }
}
function api(host,params){return `https://${host}/w/api.php?${new URLSearchParams({format:'json',formatversion:'2',...params})}`;}
function source(provider,url,criterion){return {provider,url,criterion};}
function answer(title,aliases,sources){return {title,aliases:[...new Set(aliases||[])].filter(alias=>alias&&alias!==title&&alias.length<=180),points:catalogPoints,rarity:'rare',sources};}
async function previousSnapshot(provider){try{return JSON.parse(await fs.readFile(path.join(outputDir,provider+'.json'),'utf8'));}catch{return {answers:{}};}}
async function save(provider,answers,report){
 const result={provider,generatedAt:new Date().toISOString(),asOf,answers,report};
 const dest=path.join(outputDir,provider+'.json');
 await fs.writeFile(dest+'.tmp',JSON.stringify(result));await fs.rename(dest+'.tmp',dest);
 console.log(`${provider}: ${Object.values(answers).reduce((n,a)=>n+a.length,0)} sourced answers across ${Object.keys(answers).length} prompts`);
}
async function job(provider,id,run,answers,previous){
 try{answers[id]=mergeAnswers(await run());console.log(`${provider} ${id}: ${answers[id].length}`);}
 catch(error){failures.push({provider,id,error:error.message});console.error(`${provider} ${id}: ${error.message}`);if(previous.answers[id])answers[id]=previous.answers[id];}
}
const metadata=new Map();
async function wikiMetadata(titles){
 const missing=[...new Set(titles)].filter(title=>!metadata.has(title));
 for(let offset=0;offset<missing.length;offset+=50){
  const chunk=missing.slice(offset,offset+50);
  const data=await request(api('en.wikipedia.org',{action:'query',titles:chunk.join('|'),prop:'templates|pageprops',tltemplates:wikiTemplates.join('|'),tllimit:'max',redirects:'1'}));
  const pages=data.query?.pages||[];
  for(const page of pages)metadata.set(page.title,page);
  const redirects=[...(data.query?.normalized||[]),...(data.query?.redirects||[])];
  for(const redirect of redirects){const page=pages.find(page=>page.title===redirect.to)||metadata.get(redirect.to);if(page)metadata.set(redirect.from,page);}
  for(const title of chunk)if(!metadata.has(title))metadata.set(title,{title,missing:true});
 }
 return titles.map(title=>metadata.get(title));
}
async function categoryMembers(category){
 const members=[];let continuation;
 do{
  const data=await request(api('en.wikipedia.org',{action:'query',list:'categorymembers',cmtitle:'Category:'+category,cmlimit:'500',cmtype:'page|subcat',...(continuation||{})}));
  members.push(...(data.query?.categorymembers||[]));continuation=data.continue;
 }while(continuation);
 return members;
}
async function categoryArticles(category,depth,seen=new Set()){
 if(seen.has(category))return [];seen.add(category);
 const results=[];
 for(const member of await categoryMembers(category)){
  if(member.ns===0&&isArticleTitle(member.title))results.push({title:member.title,category});
  if(member.ns===14&&depth>0){
   const child=member.title.replace(/^Category:/,'');
   // Cross-category lists of people, awards, individual episodes, and shorts do not establish this criterion.
   if(!/\b(?:actors|actresses|directors|producers|writers|awards|characters|episodes|seasons|soundtracks|short films|upcoming|cancelled|unproduced)\b/i.test(child))results.push(...await categoryArticles(child,depth-1,seen));
  }
 }
 return results;
}
async function wikipedia(){
 const provider='wikipedia',previous=await previousSnapshot(provider),answers=onlyOctober31?{...previous.answers}:{};
 for(const spec of selectedJobs(wikipediaJobs)){
  await job(provider,spec.id,async()=>{
   const members=[];
   for(const category of spec.categories)members.push(...await categoryArticles(category,spec.depth));
   const candidateMembers=spec.kind==='song'?members.filter(member=>! /\balbums\b/i.test(member.category)):members;
   let pages=(await wikiMetadata([...new Set(candidateMembers.map(member=>member.title))])).filter(page=>isWikiWork(page,spec.kind));
   if(spec.studio||spec.rapper){
    const entities=new Map(),ids=[...new Set(pages.map(page=>page.pageprops?.wikibase_item).filter(Boolean))];
    for(let offset=0;offset<ids.length;offset+=50){
     const data=await request(api('www.wikidata.org',{action:'wbgetentities',ids:ids.slice(offset,offset+50).join('|'),props:'claims'}));
     for(const entity of Object.values(data.entities||{}))entities.set(entity.id,entity);
     if(offset>0&&offset%1000===0)console.log(`${spec.id}: checked ${offset} of ${ids.length} source entities`);
    }
    pages=pages.filter(page=>spec.studio?isStudioAlbum(entities.get(page.pageprops?.wikibase_item)):isRapper(entities.get(page.pageprops?.wikibase_item)));
   }
   const features=new Set();
   if(spec.feature){
    const ids=[...new Set(pages.map(page=>page.pageprops?.wikibase_item).filter(Boolean))];
    for(let offset=0;offset<ids.length;offset+=50){
     const data=await request(api('www.wikidata.org',{action:'wbgetentities',ids:ids.slice(offset,offset+50).join('|'),props:'claims'}));
     for(const entity of Object.values(data.entities||{}))if(isFeatureFilm(entity))features.add(entity.id);
    }
   }
   return pages.filter(page=>!spec.feature||features.has(page.pageprops?.wikibase_item)).map(page=>{
    const title=cleanWikiTitle(page.title),membership=candidateMembers.filter(member=>metadata.get(member.title)?.title===page.title);
    if(!membership.length)membership.push({category:spec.categories.join(' / ')});
    const sources=membership.map(member=>source(provider,`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ','_'))}`,`Category:${member.category}`));
    if(spec.feature)sources.push(source('wikidata',`https://www.wikidata.org/wiki/${page.pageprops.wikibase_item}`,'Running time (P2047) is at least 40 minutes'));
    if(spec.studio||spec.rapper)sources.push(source('wikidata',`https://www.wikidata.org/wiki/${page.pageprops.wikibase_item}`,spec.studio?'Classified as a studio album (P31 or form of creative work, P7937)':'Occupation includes rapper (P106)'));
    return answer(title,[page.title],sources);
   }).filter(item=>titleMatches(item.title,spec.rule)&&!(spec.excludedTitles||[]).some(title=>normalize(cleanWikiTitle(title))===normalize(item.title)));
  },answers,previous);
 }
 for(const spec of selectedJobs(wikiTitleJobs)){
  const existing=answers[spec.id]||[];
  await job(provider,spec.id,async()=>{
   const pages=await wikiMetadata(spec.titles);
   return mergeAnswers(existing,pages.filter(page=>isWikiWork(page,spec.kind)).map(page=>answer(cleanWikiTitle(page.title),[page.title],[source(provider,`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ','_'))}`,spec.criterion)])).filter(item=>titleMatches(item.title,spec.rule)));
  },answers,previous);
 }
 for(const spec of selectedJobs(characterListJobs)){
  const existing=answers[spec.id]||[];
  await job(provider,spec.id,async()=>{
   const data=await request(api('en.wikipedia.org',{action:'parse',page:spec.page,prop:'sections'}));
   const additions=(data.parse?.sections||[]).flatMap(section=>(spec.sections[section.line]||[]).map(name=>answer(name,[],[source(provider,`https://en.wikipedia.org/wiki/${encodeURIComponent(spec.page.replaceAll(' ','_'))}#${encodeURIComponent(section.anchor)}`,'Named character in the Friends sections of the character list')])));
   return mergeAnswers(existing,additions);
  },answers,previous);
 }
 await save(provider,answers,{jobs:wikipediaJobs.length+wikiTitleJobs.length+characterListJobs.length});
}
async function wikidata(){
 const provider='wikidata',previous=await previousSnapshot(provider),answers={};
 for(const spec of actorJobs){
  await job(provider,spec.id,async()=>{
   const data=await request(api('www.wikidata.org',{action:'wbgetentities',sites:'enwiki',titles:spec.actor,props:'labels',languages:'en'}));
   const actor=Object.values(data.entities||{}).find(entity=>!('missing' in entity));
   if(!actor?.id)throw new Error('Actor entity not found');
   let continuation;const ids=[];
   do{
    const data=await request(api('www.wikidata.org',{action:'query',list:'search',srsearch:`haswbstatement:P161=${actor.id}`,srnamespace:'0',srlimit:'500',srprop:'',...(continuation||{})}));
    ids.push(...(data.query?.search||[]).map(item=>item.title));continuation=data.continue;
   }while(continuation);
   const entities=[];
   for(let offset=0;offset<ids.length;offset+=50){
    const data=await request(api('www.wikidata.org',{action:'wbgetentities',ids:ids.slice(offset,offset+50).join('|'),props:'labels|aliases|claims|sitelinks',languages:'en',sitefilter:'enwiki'}));
    entities.push(...Object.values(data.entities||{}));
   }
   const candidates=entities.filter(entity=>entity.claims?.P161?.some(claim=>claim.rank!=='deprecated'&&claim.mainsnak?.datavalue?.value?.id===actor.id)&&entity.sitelinks?.enwiki&&entity.claims?.P577?.some(claim=>{const date=claim.mainsnak?.datavalue?.value?.time;return date?.startsWith('+')&&date.slice(1,11)<=asOf;}));
   const pages=await wikiMetadata(candidates.map(entity=>entity.sitelinks.enwiki.title));
   return candidates.flatMap((entity,index)=>{
    if(!isWikiWork(pages[index],'film'))return [];
    const title=cleanWikiTitle(pages[index].title);
    return [answer(title,[entity.labels?.en?.value,...(entity.aliases?.en||[]).map(alias=>alias.value),pages[index].title],[source(provider,`https://www.wikidata.org/wiki/${entity.id}`,`cast member (P161): ${spec.actor} (${actor.id})`)])];
   });
  },answers,previous);
 }
 await save(provider,answers,{jobs:actorJobs.length});
}
async function openlibrary(){
 const provider='openlibrary',previous=await previousSnapshot(provider),answers={};
 const max=Number(process.env.CATALOG_BOOK_LIMIT||600);
 for(const spec of bookJobs){
  await job(provider,spec.id,async()=>{
   const docs=[];
   for(let offset=0;offset<max;offset+=100){
    const url='https://openlibrary.org/search.json?'+new URLSearchParams({q:spec.query,fields:'key,title,alternative_title,first_publish_year,subject',sort:'readinglog',limit:'100',offset:String(offset)});
    const data=await request(url);docs.push(...(data.docs||[]));
    if((data.docs||[]).length<100||docs.length>=(data.numFound??data.num_found??0))break;
   }
   return docs.filter(doc=>doc.key?.startsWith('/works/')&&typeof doc.title==='string'&&doc.title.length<=180&&titleMatches(doc.title,spec.rule)&&bookMatchesPrompt(doc,spec.id)&&(spec.id!=='v2-q092'||(Number.isInteger(doc.first_publish_year)&&doc.first_publish_year>0&&doc.first_publish_year<1900))).map(doc=>answer(doc.title,doc.alternative_title||[],[source(provider,`https://openlibrary.org${doc.key}`,`${spec.query}${bookEvidence(doc,spec.id).length?'; verified subjects: '+bookEvidence(doc,spec.id).join(', '):''}`)]));
  },answers,previous);
 }
 await save(provider,answers,{jobs:bookJobs.length,limitPerQuery:max});
}
async function musicbrainz(){
 const provider='musicbrainz',previous=await previousSnapshot(provider),answers={};
 for(const spec of albumJobs){
  await job(provider,spec.id,async()=>{
   const title=spec.artist==='Nirvana'?'Nirvana (band)':spec.artist;
   const identity=await request(api('www.wikidata.org',{action:'wbgetentities',sites:'enwiki',titles:title,props:'claims'}));
   const entity=Object.values(identity.entities||{}).find(entity=>entity.claims?.P434);
   const artistId=entity?.claims.P434.find(claim=>claim.rank!=='deprecated')?.mainsnak?.datavalue?.value;
   if(!artistId)throw new Error('Exact MusicBrainz artist ID not found in Wikidata');
   const artist={id:artistId};
   const albums=[];
   for(let offset=0;;offset+=100){
    const data=await request('https://musicbrainz.org/ws/2/release-group?'+new URLSearchParams({artist:artist.id,type:'album','release-group-status':'website-default',inc:'artist-credits',fmt:'json',limit:'100',offset:String(offset)}));
    albums.push(...(data['release-groups']||[]));
    if(offset+100>=data['release-group-count']||(data['release-groups']||[]).length<100)break;
   }
   return albums.filter(album=>album['primary-type']==='Album'&&!(album['secondary-types']||[]).length&&album['first-release-date']&&album['first-release-date']<=asOf&&album['artist-credit']?.some(credit=>credit.artist?.id===artist.id)&&isArticleTitle(album.title)).map(album=>answer(album.title,[],[source(provider,`https://musicbrainz.org/release-group/${album.id}`,`Studio album credited to ${spec.artist}; non-studio secondary types excluded`)]));
  },answers,previous);
 }
 await save(provider,answers,{jobs:albumJobs.length});
}
async function tvmaze(){
 const provider='tvmaze',previous=await previousSnapshot(provider),answers={};
 for(const spec of televisionJobs){
  await job(provider,spec.id,async()=>{
   const show=await request('https://api.tvmaze.com/lookup/shows?'+new URLSearchParams({imdb:spec.imdb}));
   const cast=await request(`https://api.tvmaze.com/shows/${show.id}/cast`);
   return cast.filter(credit=>credit.character?.name&&credit.character.name.length<=180&&!/^(?:self|himself|herself|themselves|unknown|various|additional voices)$/i.test(credit.character.name)).map(credit=>answer(credit.character.name,[],[source(provider,credit.character.url||show.url,`Character in ${show.name} (${spec.imdb})`)]));
  },answers,previous);
 }
 await save(provider,answers,{jobs:televisionJobs.length});
}
async function boxoffice(){
 const provider='boxoffice',previous=await previousSnapshot(provider),editionDate='2026-10-31';
 if(asOf>editionDate&&previous.answers?.['oct31-billion']?.length){console.log('boxoffice: retaining the frozen October 31, 2026 snapshot');return;}
 const charts=[
  {provider:'boxofficemojo',url:'https://www.boxofficemojo.com/chart/ww_top_lifetime_gross/'},
  {provider:'thenumbers',url:'https://www.the-numbers.com/box-office-records/worldwide/all-movies/cumulative/all-time'}
 ];
 const records=[];
 for(const chart of charts){
  const html=await request(chart.url,{format:'html'});
  const entries=billionDollarFilms(html,chart.url,editionDate);
  if(entries.length<40)throw new Error(`${chart.provider}: worldwide gross chart could not be verified`);
  records.push(...entries.map(entry=>({...answer(entry.title,[],[source(chart.provider,entry.url,`Worldwide lifetime theatrical gross: US$${entry.gross.toLocaleString('en-US')}; checked ${editionDate}; unadjusted for inflation`)]),facts:{worldwideGrossUSD:entry.gross,asOf:editionDate}})));
 }
 await save(provider,{'oct31-billion':mergeAnswers(records)},{editionDate,definition:'Worldwide lifetime theatrical gross strictly greater than US$1,000,000,000, including re-releases, unadjusted for inflation'});
}
const providers={wikipedia,wikidata,openlibrary,musicbrainz,tvmaze,boxoffice};
if(selected&&!providers[selected])throw new Error(`Unknown provider ${selected}`);
await Promise.all(Object.entries(providers).filter(([name])=>!selected||selected===name).map(async([name,run])=>{try{await run();}catch(error){failures.push({provider:name,error:error.message});console.error(`${name}: ${error.message}`);}}));

// These title rules are factual checks applied to song/film/book entities already sourced above.
const snapshots=await Promise.all(Object.keys(providers).map(previousSnapshot));
const allAnswers=Object.fromEntries(snapshots.flatMap(snapshot=>Object.entries(snapshot.answers)).reduce((map,[id,items])=>map.set(id,mergeAnswers(map.get(id)||[],items)),new Map()));
const songIds=new Set(wikipediaJobs.filter(job=>job.kind==='song'&&job.id!=='v2-q069').map(job=>job.id));
const songs=mergeAnswers(...Object.entries(allAnswers).filter(([id])=>songIds.has(id)).map(([,items])=>items));
const derived={};
for(const rule of songRules)derived[rule.id]=songs.filter(item=>titleMatches(item.title,rule.rule)).map(item=>({...item,sources:item.sources.map(source=>({...source,criterion:`${source.criterion}; title matches ${rule.rule}`}))}));
const films=mergeAnswers(...Object.entries(allAnswers).filter(([id])=>actorJobs.some(job=>job.id===id)||wikipediaJobs.some(job=>job.id===id&&job.kind==='film')).map(([,items])=>items));
derived['v2-q081']=films.filter(item=>titleMatches(item.title,'number'));
// A time-travel film is also a qualifying work of fiction.
derived['oct31-time-travel']=allAnswers['v2-q001']||[];
await save('derived',derived,{rules:songRules.length+1});
await fs.writeFile(path.join(outputDir,'refresh-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),failures},null,2)+'\n');
if(failures.length){console.error(`${failures.length} jobs failed; existing snapshots retained for those jobs. See lib/catalog/refresh-report.json.`);process.exitCode=1;}
