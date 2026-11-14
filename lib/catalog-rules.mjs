import {normalize} from './game.mjs';

export const catalogPoints=60;
export function cleanWikiTitle(title){
 return title.replace(/ \([^)]*\b(?:film|novel|book|song|album|TV series|television series|character|band|musician|singer|rapper|instrumental|composition|video game|manga|comic book)\)$/i,'').trim();
}
export function isArticleTitle(title){
 return typeof title==='string'&&title.length>0&&title.length<=180&&!/^(?:List of |Lists of |Index of |Outline of |Category:|Template:|Portal:|Draft:)/i.test(title)&&!/(?:filmography|discography|bibliography|soundtrack|characters|episodes|franchise)\b/i.test(title);
}
const templates={
 film:/^Template:Infobox (?:film|Chinese-language film|Japanese film)$/i,
 book:/^Template:Infobox (?:book|novel|short story|Chinese-language book)$/i,
 song:/^Template:Infobox (?:song|single|musical composition|hymn)$/i,
 album:/^Template:Infobox album$/i,
 television:/^Template:Infobox (?:television|animanga|television season)$/i,
 character:/^Template:Infobox (?:character|television character|Simpsons character|soap character)$/i,
 band:/^Template:Infobox musical artist$/i,
 rapper:/^Template:Infobox (?:musical artist|person|rapper)$/i,
 fiction:/^Template:Infobox (?:film|book|novel|short story|television|television episode|animanga|video game|graphic novel|comic book title|comics series|play|musical)$/i
};
export const wikiTemplates=[...new Set([
 'Infobox film','Infobox Chinese-language film','Infobox Japanese film',
 'Infobox book','Infobox novel','Infobox short story','Infobox Chinese-language book',
 'Infobox song','Infobox single','Infobox musical composition','Infobox hymn','Infobox album',
 'Infobox television','Infobox animanga','Infobox character','Infobox television character',
 'Infobox Simpsons character','Infobox soap character','Infobox musical artist',
 'Infobox person','Infobox rapper','Infobox video game','Infobox graphic novel',
 'Infobox comic book title','Infobox comics series','Infobox television episode','Infobox play','Infobox musical'
])].map(name=>'Template:'+name);
export function isWikiWork(page,kind){
 const description=page.pageprops?.['wikibase-shortdesc']||'';
 const year=description.match(/^(\d{4})\b/);
 return isArticleTitle(page.title)&&!page.missing&&!(page.pageprops&&'disambiguation' in page.pageprops)&&!/^upcoming|^cancelled|^unreleased|^unproduced/i.test(description)&&(!year||Number(year[1])<=new Date().getUTCFullYear())&&page.templates?.some(template=>templates[kind]?.test(template.title));
}
export function hasEntityClaim(entity,property,id){return !!entity?.claims?.[property]?.some(claim=>claim.rank!=='deprecated'&&claim.mainsnak?.datavalue?.value?.id===id);}
export function isStudioAlbum(entity){return hasEntityClaim(entity,'P31','Q208569')||hasEntityClaim(entity,'P7937','Q208569');}
export function isRapper(entity){return hasEntityClaim(entity,'P106','Q2252262');}
export function isFeatureFilm(entity){
 return entity.claims?.P2047?.some(claim=>{
  if(claim.rank==='deprecated')return false;
  const value=claim.mainsnak?.datavalue?.value;
  const unit=value?.unit?.split('/').at(-1),amount=Number(value?.amount);
  const minutes=unit==='Q7727'?amount:unit==='Q11574'?amount/60:unit==='Q25235'?amount*60:NaN;
  return Number.isFinite(minutes)&&minutes>=40;
 })||false;
}
const bookSubjects={
 'v2-q002':/^(?:Magic|Wizards|Witchcraft)(?: in fiction|, fiction)?$/i,
 'v2-q016':/^Talking animals(?: in fiction|, fiction)?$/i,
 'v2-q022':/^(?:Detectives|Private investigators)(?: in fiction|, fiction)?$/i,
 'v2-q036':/^(?:Schools|Boarding schools|School stories)(?: in fiction|, fiction)?$/i,
 'v2-q042':/^(?:Dystopias|Dystopian fiction|Fiction, dystopian)(?: in fiction|, fiction)?$/i,
 'v2-q052':/^(?:Voyages and travels|Journeys|Quests)(?: in fiction|, fiction)?$/i,
 'v2-q056':/^(?:Love stories|Romance fiction|Fiction, romance(?:,.*)?)$/i,
 'v2-q062':/^(?:Children|Teenagers|Adolescence|Boys|Girls)(?: in fiction|, fiction)?$/i,
 'v2-q072':/^Dragons(?: in fiction|, fiction)?$/i,
 'v2-q086':/^(?:Brothers and sisters|Siblings)(?: in fiction|, fiction)?$/i,
 'v2-q096':/^(?:Kings|Queens|Kings and queens|Kings and rulers|Queens and rulers)(?: in fiction|, fiction)?$/i,
 'v2-q102':/^(?:Vampires|Werewolves|Ghosts|Witches|Monsters|Fairies|Elves|Zombies|Demons|Dragons|Unicorns)(?: in fiction|, fiction)?$/i,
 'v2-q106':/^(?:Mystery fiction|Mystery stories|Detective and mystery stories|Fiction, mystery & detective(?:,.*)?)$/i
};
export function bookEvidence(doc,id){
 const predicate=bookSubjects[id];
 if(!predicate)return [];
 return (doc.subject||[]).filter(subject=>predicate.test(subject));
}
export function bookMatchesPrompt(doc,id){return !bookSubjects[id]||bookEvidence(doc,id).length>0;}
const colors=/\b(?:black|white|red|blue|green|yellow|purple|pink|orange|brown|grey|gray|gold|silver|scarlet|crimson|violet|indigo|amber)\b/i;
const animals=/\b(?:cat|cats|dog|dogs|bird|birds|wolf|wolves|fox|foxes|bear|bears|rabbit|rabbits|hare|hares|tiger|tigers|lion|lions|horse|horses|pony|ponies|whale|whales|dolphin|dolphins|shark|sharks|fish|eagle|eagles|crow|crows|raven|ravens|owl|owls|dove|doves|duck|ducks|goose|geese|swan|swans|frog|frogs|toad|toads|snake|snakes|spider|spiders|butterfly|butterflies|bee|bees|monkey|monkeys|ape|apes|elephant|elephants|deer|mouse|mice|rat|rats|pig|pigs|sheep|lamb|lambs|cow|cows|bull|bulls|donkey|donkeys|penguin|penguins|octopus|leopard|leopards|panther|panthers)\b/i;
const numbers=/(?:\d|\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b)/i;
const cities=/\b(?:London|Paris|New York|Tokyo|Chicago|Berlin|Rome|Vienna|Memphis|Nashville|Detroit|Boston|Philadelphia|Atlanta|Miami|Seattle|Portland|Dublin|Belfast|Liverpool|Manchester|Birmingham|Glasgow|Edinburgh|Bristol|Oxford|Cambridge|Amsterdam|Prague|Budapest|Moscow|Beijing|Shanghai|Hong Kong|Mumbai|Bombay|Delhi|Lagos|Johannesburg|Cairo|Sydney|Melbourne|Brisbane|Perth|Toronto|Vancouver|Montreal|Montréal|Mexico City|Havana|Rio|Kingston|San Francisco|Los Angeles|San Diego|San Jose|Las Vegas|New Orleans|Kansas City|Atlantic City|Galveston|Wichita|Phoenix|Tucson|El Paso|Amarillo|Laredo|San Antonio|Dallas|Austin|Houston|Baltimore|Baton Rouge|Pittsburgh|Cleveland|Cincinnati|Dayton|Toledo|Waterloo|Budapest|Istanbul|Constantinople|Jerusalem|Bethlehem|Tupelo|Jackson|Folsom|Luckenbach)\b/i;
export function titleMatches(title,rule){
 if(!rule)return true;
 if(rule==='color')return colors.test(title);
 if(rule==='animal')return animals.test(title);
 if(rule==='number')return numbers.test(title);
 if(rule==='city')return cities.test(title);
 if(rule==='place')return cities.test(title)||/\b(?:America|England|France|Italy|India|Japan|China|Russia|Africa|Australia|Canada|Mexico|Ireland|Scotland|Wales|Dorset|Yorkshire|Venice|Verona|Narnia|Oz|Wonderland|Babylon|Troy|Ithaca|Alaska|California|Texas|Brooklyn|Manhattan|Mars|Earth|Hogwarts|Terabithia|Avonlea)\b/i.test(title);
 if(rule==='day')return /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i.test(title);
 if(rule==='love')return /\blove\b/i.test(title);
 if(rule==='night')return /\bnight\b/i.test(title);
 if(rule==='question')return /\?$/.test(title);
 if(rule==='one-word')return /^\p{L}[\p{L}\p{M}\p{N}’'\-]*$/u.test(title);
 return false;
}
export function mergeAnswers(...groups){
 const merged=new Map();
 for(const answer of groups.flat()){
  const key=normalize(answer.title);
  if(!key)continue;
  const existing=merged.get(key);
  if(!existing){merged.set(key,{...answer,aliases:[...(answer.aliases||[])],sources:[...(answer.sources||[])]});continue;}
  existing.aliases=[...new Set([...existing.aliases,answer.title,...(answer.aliases||[])])].filter(alias=>alias!==existing.title);
  const known=new Set(existing.sources.map(source=>`${source.provider}|${source.url}|${source.criterion}`));
  for(const source of answer.sources||[]){const id=`${source.provider}|${source.url}|${source.criterion}`;if(!known.has(id)){existing.sources.push(source);known.add(id);}}
 }
 return [...merged.values()];
}
