'use client';
import {useState} from 'react';
import {normalize,tiers,rarityFor} from '../lib/game.mjs';
import {providers} from '../lib/catalog/providers.mjs';

export function AnswerSources({answer}){
 const sources=[...new Map((answer.sources||[]).map(source=>[source.provider,source])).values()];
 if(!sources.length)return null;
 return <span className="source-links">{sources.map(source=><a key={source.provider} href={source.url} target="_blank" rel="noreferrer" title={`View this answer on ${providers[source.provider]?.name||source.provider}`}>{providers[source.provider]?.name||source.provider}</a>)}</span>;
}
export default function AcceptedAnswers({question}){
 const [open,setOpen]=useState(false),[search,setSearch]=useState(''),[limit,setLimit]=useState(50);
 const query=normalize(search);
 const filtered=open?question.answers.filter(answer=>!query||[answer.title,...answer.aliases].some(title=>normalize(title).includes(query))):[];
 return <details onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary>Explore this round’s {question.answers.length.toLocaleString('en-US')} accepted answers</summary>
  {open&&<div className="accepted-answers">
   <label htmlFor={`answer-search-${question.id}`}>SEARCH ACCEPTED ANSWERS</label>
   <input id={`answer-search-${question.id}`} type="search" value={search} onChange={event=>{setSearch(event.target.value);setLimit(50);}} placeholder="Find a title or alternate name…" />
   <p className="answer-count">{filtered.length.toLocaleString('en-US')} {filtered.length===1?'answer':'answers'}{query?' found':''}</p>
   <div className="answer-list">{filtered.slice(0,limit).map(answer=><div key={answer.title}><span className="answer-title">{answer.title}<AnswerSources answer={answer}/></span><span className={`answer-rarity rarity-${rarityFor(answer.points)}`}><span>{tiers[answer.points]}</span><strong>{answer.points}</strong></span></div>)}</div>
   {filtered.length>limit&&<button className="secondary" onClick={()=>setLimit(limit+50)}>Show 50 more</button>}
   {!filtered.length&&<p>No matching titles in this round’s catalog.</p>}
  </div>}
 </details>;
}
