export function normalize(value) { return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/^the\s+/,'').replace(/&/g,'and').replace(/[^\p{L}\p{M}\p{N}]/gu,''); }
export function matchAnswer(question,input) { const n=normalize(input); return n ? question.answers.find(a=>[a.title,...a.aliases].some(v=>normalize(v)===n)) : undefined; }
// Damerau-Levenshtein: additions, omissions, substitutions and swapped neighbors.
export function editDistance(a,b) {
 const d=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=0;i<=a.length;i++)d[i][0]=i;
 for(let j=0;j<=b.length;j++)d[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){
  d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
 }
 return d[a.length][b.length];
}
export function suggestAnswers(question,input) {
 const n=normalize(input);
 if(n.length<4||n.length>180||matchAnswer(question,input))return [];
 return question.answers.map(answer=>{
  const distance=Math.min(...[answer.title,...answer.aliases].map(title=>{
   const candidate=normalize(title),limit=n.length<8?1:n.length<14?2:3;
   if(Math.abs(candidate.length-n.length)>limit)return Infinity;
   const edits=editDistance(n,candidate);
   return edits<=limit&&edits/Math.max(n.length,candidate.length)<=.25?edits:Infinity;
  }));return {answer,distance};
 }).filter(r=>Number.isFinite(r.distance)).sort((a,b)=>a.distance-b.distance||a.answer.title.localeCompare(b.answer.title)).slice(0,3).map(r=>r.answer);
}
export function totalScore(results) { return results.reduce((sum,r)=>sum+(r.points||0),0); }
export function todayKey(now=new Date()) { return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export const tiers = {20:'Common',40:'Uncommon',60:'Rare',80:'Epic',100:'Legendary'};
export const rarityFor = points => tiers[points]?.toLowerCase() || 'skipped';
export function restoreProgress(data,schedule){
 if(!data||typeof data!=='object'||Array.isArray(data))return {};
 return Object.fromEntries(Object.entries(data).filter(([date,results])=>{
  const ids=schedule[date];
  return ids&&Array.isArray(results)&&results.length<=ids.length&&results.every((result,index)=>result&&result.questionId===ids[index]&&Number.isFinite(result.points)&&[0,20,40,60,80,100].includes(result.points));
 }));
}
