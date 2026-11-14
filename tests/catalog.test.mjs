import test from 'node:test';
import assert from 'node:assert/strict';
import questions,{catalogStats,snapshots,questionDefinitions} from '../lib/question-bank.mjs';
import curated from '../lib/questions.json' with {type:'json'};
import {normalize,matchAnswer,tiers} from '../lib/game.mjs';
import {mergeAnswers,isWikiWork,isFeatureFilm,titleMatches,cleanWikiTitle,bookMatchesPrompt} from '../lib/catalog-rules.mjs';
import {providers} from '../lib/catalog/providers.mjs';

test('populated, attributed database snapshots expand over 100 prompts',()=>{
 assert.equal(questions.length,questionDefinitions.length);
 assert.ok(catalogStats.total>20000);
 assert.ok(catalogStats.expandedPrompts>=100);
 const sources=snapshots.flatMap(snapshot=>Object.values(snapshot.answers).flat()).flatMap(answer=>answer.sources||[]);
 for(const provider of Object.keys(providers))assert.ok(sources.some(source=>source.provider===provider),provider);
 for(const snapshot of snapshots)assert.ok(snapshot.generatedAt,snapshot.provider);
 const ids=new Set(questions.map(question=>question.id));
 for(const snapshot of snapshots)for(const id of Object.keys(snapshot.answers))assert.ok(ids.has(id),id);
 for(const question of questions){
  assert.equal(new Set(question.answers.map(answer=>normalize(answer.title))).size,question.answers.length);
  for(const answer of question.answers){
   assert.ok(Array.isArray(answer.aliases));
   assert.equal(answer.rarity,tiers[answer.points]?.toLowerCase());
   for(const source of answer.sources||[]){
    assert.ok(providers[source.provider]);assert.ok(source.criterion);
    assert.equal(new URL(source.url).protocol,'https:');
   }
  }
 }
});
test('database additions preserve all curated titles, aliases, and scores',()=>{
 for(const original of curated){
  const expanded=questions.find(question=>question.id===original.id);
  for(const answer of original.answers)for(const title of [answer.title,...answer.aliases]){
   const found=matchAnswer(expanded,title);assert.ok(found,`${original.id}: ${title}`);assert.equal(found.points,answer.points);
  }
 }
});
test('new valid answers match while unrelated and misleading source hits do not',()=>{
 const question=id=>questions.find(question=>question.id===id);
 assert.ok(matchAnswer(question('v2-q101'),'The Others'));
 assert.ok(matchAnswer(question('v2-q107'),'Cloudbusting'));
 assert.ok(matchAnswer(question('v2-q004'),'Richard Burke'));
 assert.equal(matchAnswer(question('v2-q101'),'Back to the Future'),undefined);
 assert.equal(matchAnswer(question('v2-q102'),'Misery'),undefined);
 assert.equal(matchAnswer(question('v2-q096'),'King of Wrath'),undefined);
 assert.equal(matchAnswer(question('v2-q013'),'The Seven Years of Christmas'),undefined);
});
test('category membership alone cannot admit lists, non-film pages, shorts, or future films',()=>{
 const film={title:'Example (film)',templates:[{title:'Template:Infobox film'}],pageprops:{'wikibase-shortdesc':'2020 film'}};
 assert.ok(isWikiWork(film,'film'));
 assert.equal(isWikiWork({...film,title:'List of ghost films'},'film'),false);
 assert.equal(isWikiWork({...film,templates:[{title:'Template:Infobox television'}]},'film'),false);
 assert.equal(isWikiWork({...film,pageprops:{disambiguation:''}},'film'),false);
 assert.equal(isWikiWork({...film,pageprops:{'wikibase-shortdesc':'Upcoming American film'}},'film'),false);
 const duration=(amount,unit='Q7727')=>({claims:{P2047:[{mainsnak:{datavalue:{value:{amount,unit:'http://www.wikidata.org/entity/'+unit}}}}]}});
 assert.equal(isFeatureFilm(duration('+85')),true);
 assert.equal(isFeatureFilm(duration('+12')),false);
 assert.equal(isFeatureFilm(duration('+3000','Q11574')),true);
 assert.equal(isFeatureFilm({claims:{}}),false);
});
test('literal title rules and exact book subjects reject broad search matches',()=>{
 assert.equal(titleMatches('Blue Monday','color'),true);
 assert.equal(titleMatches('Somewhere','number'),false);
 assert.equal(titleMatches('One','number'),true);
 assert.equal(titleMatches('How Soon Is Now?','question'),true);
 assert.equal(titleMatches('Coraline','one-word'),true);
 assert.equal(titleMatches('The Hobbit','one-word'),false);
 assert.equal(bookMatchesPrompt({subject:['Horror & ghost stories','Fiction']},'v2-q102'),false);
 assert.equal(bookMatchesPrompt({subject:['Ghosts, fiction']},'v2-q102'),true);
 assert.equal(bookMatchesPrompt({subject:['Serie:Kings_of_Sin']},'v2-q096'),false);
 assert.equal(bookMatchesPrompt({subject:['Detective and mystery stories']},'v2-q022'),false);
 assert.equal(bookMatchesPrompt({subject:['Detectives']},'v2-q022'),true);
 assert.equal(cleanWikiTitle('Up (2009 film)'),'Up');
 assert.equal(cleanWikiTitle('Dark Matter (Paver novel)'),'Dark Matter');
 assert.equal(cleanWikiTitle('Help!'),'Help!');
});
test('merging adds aliases and evidence without mutating seeds or changing their score',()=>{
 const seed={title:'Example',aliases:['A title'],points:100,rarity:'legendary'};
 const imported={title:'EXAMPLE',aliases:['Another title'],points:60,rarity:'rare',sources:[{provider:'wikidata',url:'https://www.wikidata.org/wiki/Q1',criterion:'Example'}]};
 const merged=mergeAnswers([seed],[imported,imported]);
 assert.equal(merged.length,1);assert.equal(merged[0].points,100);assert.ok(merged[0].aliases.includes('Another title'));assert.equal(merged[0].sources.length,1);
 assert.deepEqual(seed.aliases,['A title']);assert.equal(seed.sources,undefined);
 assert.notEqual(normalize('千と千尋の神隠し'),normalize('となりのトトロ'));
 assert.ok(matchAnswer({answers:[{title:'千と千尋の神隠し',aliases:[]}]},'千と千尋の神隠し'));
});
