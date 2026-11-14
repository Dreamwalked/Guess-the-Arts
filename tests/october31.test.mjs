import test from 'node:test';
import assert from 'node:assert/strict';
import questions,{snapshots} from '../lib/question-bank.mjs';
import days from '../lib/days.json' with {type:'json'};
import {matchAnswer,restoreProgress} from '../lib/game.mjs';
import {isStudioAlbum,isRapper} from '../lib/catalog-rules.mjs';
import {billionDollarFilms} from '../lib/edition-rules.mjs';

test('October 31 uses the ten user-selected prompts in order',()=>{
 assert.deepEqual(days['2026-10-31'].map(id=>questions.find(question=>question.id===id).prompt),[
  'Name a movie featuring a supernatural entity.',
  'Name a song with a color in its title.',
  'Name an animated television series.',
  'Name a movie with a worldwide box-office gross of over $1 billion.',
  'Name an artist’s first studio album.',
  'Name a song by Taylor Swift.',
  'Name a rapper from the West Coast.',
  'Name a book adapted into a movie.',
  'Name a song with no lyrics.',
  'Name a work of fiction featuring time travel.'
 ]);
 assert.ok(days['2026-10-21'].includes('v2-q009'));
 assert.ok(days['2026-10-25'].includes('v2-q047'));
});
test('the new prompts have broad sourced coverage and accept representative answers',()=>{
 const cases=[
  ['oct31-supernatural','The Exorcist',500],
  ['v2-q009','Purple Rain',15],
  ['v2-q010','The Simpsons',100],
  ['oct31-billion','Avatar',40],
  ['oct31-debut','Please Please Me',50],
  ['v2-q047','Love Story',100],
  ['oct31-west-coast','Kendrick Lamar',25],
  ['v2-q012','The Hobbit',100],
  ['oct31-instrumental','Cliffs of Dover',50],
  ['oct31-time-travel','Chrono Trigger',100]
 ];
 for(const [id,title,minimum] of cases){
  const question=questions.find(question=>question.id===id);
  assert.ok(question.answers.length>=minimum,`${id}: ${question.answers.length}`);
  assert.ok(matchAnswer(question,title),`${id}: ${title}`);
 }
 assert.equal(matchAnswer(questions.find(question=>question.id==='oct31-billion'),'Back to the Future'),undefined);
 assert.equal(matchAnswer(questions.find(question=>question.id==='oct31-west-coast'),'Eminem'),undefined);
 assert.equal(matchAnswer(questions.find(question=>question.id==='oct31-instrumental'),'Tequila'),undefined);
 assert.equal(matchAnswer(questions.find(question=>question.id==='oct31-supernatural'),'The Martian'),undefined);
});
test('box-office parsing uses worldwide gross and a strict billion-dollar threshold',()=>{
 const row=(title,gross,domestic)=>`<tr><td>1</td><td><a href="/title/tt1234567/">${title}</a></td><td>$${gross}</td><td>$${domestic}</td><td>2026</td></tr>`;
 const html=row('Over', '1,000,000,001','10')+row('Exactly','1,000,000,000','2,000,000,000')+row('Under','999,999,999','2,000,000,000');
 assert.deepEqual(billionDollarFilms(html,'https://www.boxofficemojo.com').map(record=>record.title),['Over']);
 const snapshot=snapshots.find(snapshot=>snapshot.provider==='boxoffice');
 assert.ok(snapshot.answers['oct31-billion'].length>=40);
 for(const answer of snapshot.answers['oct31-billion']){
  assert.ok(answer.facts.worldwideGrossUSD>1_000_000_000);
  assert.equal(answer.facts.asOf,'2026-10-31');
 }
});
test('studio album and rapper checks require the appropriate source claims',()=>{
 const claim=id=>({mainsnak:{datavalue:{value:{id}}}});
 assert.equal(isStudioAlbum({claims:{P31:[claim('Q208569')]}}),true);
 assert.equal(isStudioAlbum({claims:{P7937:[claim('Q208569')]}}),true);
 assert.equal(isStudioAlbum({claims:{P31:[claim('Q169930')]}}),false);
 assert.equal(isRapper({claims:{P106:[claim('Q2252262')]}}),true);
 assert.equal(isRapper({claims:{P106:[claim('Q183945')]}}),false);
});
test('replacing October 31 questions resets only incompatible saved progress',()=>{
 const archive=[{questionId:'v2-q001',title:'Primer',points:100}];
 const oldToday=[{questionId:'v2-q101',title:'Ghostbusters',points:20}];
 assert.deepEqual(restoreProgress({'2026-10-21':archive,'2026-10-31':oldToday},days),{'2026-10-21':archive});
 const newToday=[{questionId:'oct31-supernatural',title:'Ghostbusters',points:20}];
 assert.deepEqual(restoreProgress({'2026-10-31':newToday},days),{'2026-10-31':newToday});
 const mixed=[...newToday,{questionId:'v2-q102',title:'Dracula',points:40}];
 assert.deepEqual(restoreProgress({'2026-10-31':mixed},days),{});
 assert.deepEqual(restoreProgress(null,days),{});
});
