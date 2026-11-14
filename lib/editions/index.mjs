// One folder per release date (editions/YYYY-MM-DD/questions.json). Add the
// folder here and map the date to its question IDs in lib/days.json.
import nov01 from './2026-11-01/questions.json' with {type:'json'};

export const editionQuestions=[...nov01];
