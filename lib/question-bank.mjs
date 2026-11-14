import curated from './questions.json' with {type:'json'};
import wikipedia from './catalog/wikipedia.json' with {type:'json'};
import wikidata from './catalog/wikidata.json' with {type:'json'};
import openlibrary from './catalog/openlibrary.json' with {type:'json'};
import musicbrainz from './catalog/musicbrainz.json' with {type:'json'};
import tvmaze from './catalog/tvmaze.json' with {type:'json'};
import derived from './catalog/derived.json' with {type:'json'};
import {mergeAnswers} from './catalog-rules.mjs';
import {october31Questions} from './october31.mjs';
import {editionQuestions} from './editions/index.mjs';
import boxoffice from './catalog/boxoffice.json' with {type:'json'};

export const snapshots=[wikipedia,wikidata,openlibrary,musicbrainz,tvmaze,derived,boxoffice];
export const questionDefinitions=[...curated,...october31Questions,...editionQuestions];
const questions=questionDefinitions.map(question=>({...question,answers:mergeAnswers(question.answers,...snapshots.map(snapshot=>snapshot.answers[question.id]||[]))}));
const curatedCount=questionDefinitions.reduce((count,question)=>count+question.answers.length,0);
export const catalogStats={
 curated:curatedCount,
 total:questions.reduce((count,question)=>count+question.answers.length,0),
 prompts:questions.length,
 expandedPrompts:questions.filter((question,index)=>question.answers.length>questionDefinitions[index].answers.length).length,
 updatedAt:snapshots.map(snapshot=>snapshot.generatedAt||'').sort().at(-1)
};
export default questions;
