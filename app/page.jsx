'use client';
import {useEffect,useState,useRef} from 'react';
import {flushSync} from 'react-dom';
import questions,{catalogStats} from '../lib/question-bank.mjs';
import AcceptedAnswers,{AnswerSources} from './accepted-answers';
import {providers} from '../lib/catalog/providers.mjs';
import days from '../lib/days.json';
import {matchAnswer,totalScore,todayKey,tiers,suggestAnswers,rarityFor,restoreProgress} from '../lib/game.mjs';
const dates=Object.keys(days).sort().reverse();
const format=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
const icons={Film:'◉',Literature:'▤',Music:'♫',Television:'▣',Screen:'◈',Culture:'✳'};
export default function Home(){
 const [view,setViewState]=useState('home'),[date,setDate]=useState(dates[0]),[today,setToday]=useState(dates[0]),[saved,setSaved]=useState({}),[ready,setReady]=useState(false),[answer,setAnswer]=useState(''),[error,setError]=useState(''),[reveal,setReveal]=useState(null),[notice,setNotice]=useState(''),[suggestions,setSuggestions]=useState([]),[leaving,setLeaving]=useState(false);
 const screenRef=useRef(null),roundRef=useRef(null),transitioning=useRef(false),animations=useRef([]);
 useEffect(()=>()=>animations.current.forEach(animation=>animation.cancel()),[]);
 async function transition(change,{round=false,scrollTop=false}={}){
  if(transitioning.current)return;
  const target=round?roundRef.current:screenRef.current;
  const focusNext=()=>{(screenRef.current?.querySelector('[data-screen-focus]')||screenRef.current)?.focus({preventScroll:true});};
  if(!target?.animate){flushSync(change);if(scrollTop)window.scrollTo(0,0);focusNext();return;}
  transitioning.current=true;setLeaving(true);
  const playAnimation=(frames,options)=>{
   const animation=target.animate(frames,{fill:'both',...options});
   animations.current.push(animation);
   return animation.finished.catch(()=>{});
  };
  try{
   const previousHeight=target.getBoundingClientRect().height;
   await playAnimation([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-14px)'}],{duration:240,easing:'cubic-bezier(.4,0,1,1)'});
   if(!target.isConnected)return;
   flushSync(change);
   if(scrollTop)window.scrollTo(0,0);
   const nextHeight=target.getBoundingClientRect().height;
   target.style.overflow='clip';
   const duration=420;
   await Promise.all([
    playAnimation([{height:`${previousHeight}px`},{height:`${nextHeight}px`}],{duration,easing:'cubic-bezier(.22,1,.36,1)'}),
    playAnimation([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration,easing:'cubic-bezier(.22,1,.36,1)'})
   ]);
  }finally{
   animations.current.forEach(animation=>animation.cancel());animations.current=[];
   target.style.overflow='';
   transitioning.current=false;
   if(target.isConnected){flushSync(()=>setLeaving(false));focusNext();}
  }
 }
 function setView(next){if(next===view)return;transition(()=>{setViewState(next);setSuggestions([]);});}
 useEffect(()=>{setToday(todayKey());try{const data=JSON.parse(localStorage.getItem('gta-v2')||'{}'); setSaved(restoreProgress(data,days));}catch{}setReady(true);},[]);
 const results=saved[date]||[], edition=(days[date]||[]).map(id=>questions.find(q=>q.id===id)),q=edition[results.length];
 function play(d){transition(()=>{setDate(d);setAnswer('');setError('');setReveal(null);setNotice('');setSuggestions([]);setViewState('play');},{scrollTop:true});}
 function submit(skip=false, correctedAnswer=answer){
  if(!q||reveal||transitioning.current)return;
  const found=skip?null:matchAnswer(q,correctedAnswer);
  if(!skip&&!found){const near=suggestAnswers(q,correctedAnswer);setSuggestions(near);setError(near.length?'':'We couldn’t find that answer in this round’s catalog. Check the title, try another answer, or skip.');return;}
  transition(()=>{
   const result={title:found?.title||'Skipped',points:found?.points||0,rarity:found?.rarity||'skipped',questionId:q.id};
   const next={...saved,[date]:[...results,result]};setSaved(next);
   try{localStorage.setItem('gta-v2',JSON.stringify(next));}catch{setNotice('Progress could not be saved in this browser.');}
   setReveal({question:q,result});setError('');setSuggestions([]);
  },{round:true});
 }
 async function share(){const text=`Guess the Arts · ${format(date)}\n${totalScore(results)}/1000 · ${results.filter(r=>r.points).length}/10 correct\n${results.map(r=>({20:'⬜',40:'🟩',60:'🟦',80:'🟪',100:'🟨'}[r.points]||'⬛')).join('')}`;try{await navigator.clipboard.writeText(text);setNotice('Results copied!');}catch{setNotice(text);}}
 const completed=Object.values(saved).filter(r=>r.length===10).length;
 return <><header><button className="brand" onClick={()=>setView('home')} aria-label="Guess the Arts home"><img className="brand-image" src="/cosine.png" alt="" width="48" height="48" /><span>guess the arts<span className="brand-sub">A DAILY CULTURE GAME</span></span></button><nav aria-label="Main navigation"><button className={view==='home'?'selected':''} onClick={()=>setView('home')}>Daily game</button><button className={view==='archive'?'selected':''} onClick={()=>setView('archive')}>The archive <span className="count">10</span></button><button className={view==='help'?'selected':''} onClick={()=>setView('help')}>How to play <span>↗</span></button></nav></header>
 <main ref={screenRef} className="screen" tabIndex={-1} aria-busy={leaving} inert={leaving?true:undefined}>{view==='home'?<><div className="eyebrow"><span className="dot"/> A LITTLE KNOWLEDGE. A LITTLE OBSESSION.</div><section className="hero"><div><h1>Good taste.<br/><em>Great guesses.</em></h1><p className="intro">For the films you quote. The books you love.<br/>The songs you know a little too well.</p><p className="subintro">Ten questions. Countless right answers.<br/>Go beyond the obvious to score more.</p><div className="hero-actions"><button className="primary" disabled={!ready||!days[today]} onClick={()=>play(today)}>{days[today]?(saved[today]?.length===10?'View today’s results':saved[today]?.length?'Continue today’s game':'Play today’s game'):'New edition coming soon'} <span>↗</span></button><span className="small">UNTIMED · PLAY AT YOUR PACE</span></div>{!days[today]&&<p>Explore the October 21–31 editions in the archive.</p>}</div><div className="art" aria-hidden="true"><div className="art-caption">THE THINGS<br/>THAT STAY<br/>WITH YOU.</div><div className="record"><div className="record-label">GUESS<br/>THE ARTS<span>33⅓ RPM</span></div></div><div className="book"><span>ONE MORE CHAPTER</span><b>A world<br/>between<br/>the lines.</b><i>VOL. 01 &nbsp; ✳</i></div><div className="ticket"><span>ADMIT ONE</span><strong>THE BIG<br/>PICTURE</strong><span>ROW G &nbsp; SEAT 10</span></div><div className="star">✳</div></div></section>
 <section className="today-strip"><div><span className="eyebrow">{days[today]?'TODAY’S EDITION':'LATEST SEEDED EDITION'}</span><h2>{format(days[today]?today:dates[0])}</h2></div><div className="category-list">{['Film','Literature','Music','Television'].map(c=><span key={c}>{icons[c]} {c}</span>)}</div><span className="edition-number">№ {String(dates.length).padStart(3,'0')}</span></section>
 <section className="lower"><div><span className="eyebrow">THE LESS OBVIOUS, THE BETTER</span><h2>Your deep cuts deserve<br/>their moment.</h2></div><div className="step"><span>01 /</span><h3>Find your answer</h3><p>Each prompt has multiple correct answers. You only need one.</p></div><div className="step"><span>02 /</span><h3>Dig a little deeper</h3><p>From Common to Legendary: five rarity tiers, worth 20 to 100 points.</p></div><div className="step"><span>03 /</span><h3>Come back for more</h3><p>Missed a day? Past editions are waiting in the archive.</p><button className="text-link" onClick={()=>setView('archive')}>Explore the archive ↗</button></div></section></>:
 view==='archive'?<><div className="eyebrow">GOOD CULTURE DOESN’T EXPIRE</div><div className="section-heading"><div><h1>The archive<span className="orange">.</span></h1><p>Past editions. Take them at your own pace.</p></div><span className="small">{completed} / {dates.length} EDITIONS COMPLETED</span></div><div className="archive-grid">{dates.map((d,i)=>{const r=saved[d]||[];return <button className="archive-card" key={d} onClick={()=>play(d)} disabled={!ready}><div className="archive-meta"><span>EDITION {String(11-i).padStart(3,'0')}</span><span>{d===today?'TODAY':r.length===10?'COMPLETED':r.length?'IN PROGRESS':'READY TO PLAY'}</span></div><h2>{new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</h2><p>Film · Books · Music · TV</p><div className="archive-bottom"><span>{r.length===10?`${totalScore(r)} / 1000 pts`:r.length?`${r.length} / 10 answered`:'10 questions'}</span><span className="circle-arrow">↗</span></div></button>})}</div></>:
 view==='help'?<section className="help"><div className="eyebrow">A GAME FOR THE CULTURALLY CURIOUS</div><h1>Trust your taste.</h1><p>Every edition has ten prompts. Name one correct answer for each, and aim for the less obvious choice. There’s no timer.</p><div className="tier-grid">{Object.entries(tiers).map(([score,name])=><div key={score} className={`rarity-panel rarity-${rarityFor(Number(score))}`}><strong>{score}</strong><span>{name}</span></div>)}</div><h2>A few things to know</h2><ul><li>The catalog combines curated answers with sourced records from film, book, music, and television databases. Coverage is broad, but some valid answers may still be missing.</li><li>Rarity points are editorial demo values, not real player statistics. New database answers receive 60 points; curated scores stay the same.</li><li>Capitalization, punctuation, accents, and leading “The” don’t matter. Some common alternate titles are accepted. Close spellings offer a correction for you to confirm; nothing is submitted automatically.</li><li>Unrecognized answers let you retry. Skipping scores zero and reveals the list.</li><li>Your progress is saved in this browser. Each date keeps its own score.</li><li>October 21–31, 2026 are available. Future editions require adding questions to the schedule. The daily date follows America/Chicago.</li></ul><div className="catalog-credits"><h2>A bigger world of right answers</h2><p>{catalogStats.total.toLocaleString('en-US')} accepted answers across {catalogStats.prompts} prompts. Source links appear beside imported titles after each round.</p><div className="catalog-provider-list">{Object.entries(providers).map(([key,provider])=><span key={key}><a href={provider.url} target="_blank" rel="noreferrer">{provider.name} ↗</a><a className="source-license" href={provider.licenseUrl} target="_blank" rel="noreferrer">{provider.license}</a></span>)}</div><p className="catalog-footnote">The catalog is downloaded ahead of time, so playing doesn’t depend on live database access.</p></div><button className="primary" onClick={()=>setView('archive')}>Choose an edition ↗</button></section>:
 <section className="game"><div className="game-top"><button className="text-link" onClick={()=>setView('archive')}>← All editions</button><span>{format(date)}</span><strong>{totalScore(results)} <small>/ 1000</small></strong></div><div className="progress" aria-label={`${results.length} of 10 answered`}>{Array.from({length:10},(_,i)=><span key={i} className={i<results.length?'done':i===results.length?'current':''}/>)}</div>
 <div ref={roundRef} className="round-stage">{reveal?<div className={`question-card reveal-card rarity-${rarityFor(reveal.result.points)}`}><span className="rarity-badge">{reveal.result.points?tiers[reveal.result.points]:'ON TO THE NEXT ONE'}</span><div className="result-score">+{reveal.result.points}<small> pts</small></div><h2>{reveal.result.title}</h2><p>{reveal.question.prompt}</p><AcceptedAnswers key={reveal.question.id} question={reveal.question}/>{reveal.result.points>0&&<AnswerSources answer={reveal.question.answers.find(answer=>answer.title===reveal.result.title)||{}}/>}<button data-screen-focus className="primary" onClick={()=>transition(()=>{setReveal(null);setAnswer('');setSuggestions([]);},{round:true})}>{results.length===10?'See my results':'Next question'} →</button></div>:
 results.length===10?<div className="question-card finish"><div className="eyebrow">THAT’S A WRAP · {format(date)}</div><h1>A fine collection.</h1><div className="result-score">{totalScore(results)}<small> / 1000</small></div><p>{results.filter(r=>r.points).length} correct answers. {results.filter(r=>r.points===100).length} Legendary answers.</p><div className="answer-list">{results.map((r,i)=><div key={i}><span><small>{String(i+1).padStart(2,'0')} · </small>{r.title}</span><span className={`answer-rarity rarity-${rarityFor(r.points)}`}><span>{tiers[r.points]||'Skipped'}</span><strong>+{r.points}</strong></span></div>)}</div><div className="finish-actions"><button data-screen-focus className="primary" onClick={share}>Copy results ↗</button><button className="secondary" onClick={()=>setView('archive')}>Play another edition</button></div></div>:
 q?<div className="question-card"><div className="question-meta"><span className="category-tag">{icons[q.category]} {q.category}</span><span className="small">QUESTION {String(results.length+1).padStart(2,'0')} / 10</span></div><h1>{q.prompt}</h1><p className="hint">{q.hint||'Think past the obvious. One good answer is all it takes.'}</p><form onSubmit={e=>{e.preventDefault();submit();}}><label htmlFor="answer">YOUR ANSWER</label><div className="input-row"><input key={q.id} data-screen-focus id="answer" value={answer} onChange={e=>{setAnswer(e.target.value);setError('');setSuggestions([]);}} placeholder="Something comes to mind…" autoComplete="off" maxLength={180} aria-describedby={error?'answer-error':undefined}/><button className="primary" disabled={!answer.trim()}>Lock it in ↗</button></div>{error&&<p id="answer-error" className="error" role="alert">{error}</p>}{suggestions.length>0&&<div className="correction-box" role="status"><p>Did you mean…?</p>{suggestions.map(candidate=><button type="button" className="correction-option" key={candidate.title} onClick={()=>submit(false,candidate.title)}><strong>{candidate.title}</strong><span>Use this answer ↗</span></button>)}<button type="button" className="text-link" onClick={()=>{setSuggestions([]);document.getElementById('answer')?.focus();}}>No, let me edit</button></div>}</form><div className="question-foot"><span>20–100 points · No time limit</span><button className="text-link" onClick={()=>submit(true)}>Skip question →</button></div></div>:null}</div>{notice&&<p className="notice" role="status">{notice}</p>}<p className="game-note">Expanded answer catalog · Demo rarity scores · Progress saved on this device</p></section>}
 </main><footer><span>guess the arts <span className="orange">✳</span></span><span>A daily celebration of knowing a little too much.</span><span>FILM / WORDS / SOUND / STORIES</span></footer></>;
}
