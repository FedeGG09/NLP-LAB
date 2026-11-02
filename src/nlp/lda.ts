import type { TopicResult } from '../types';
import { frequencies } from './analysis';
const randomGenerator=(seed=109)=>{let t=seed>>>0;return ()=>{t+=0x6D2B79F5;let r=Math.imul(t^(t>>>15),t|1);r^=r+Math.imul(r^(r>>>7),r|61);return ((r^(r>>>14))>>>0)/4294967296;};};
// LDA real: muestreo de Gibbs colapsado; corpus pequeño y ejecución local.
export function runLDA(docs:string[][], k=3, iterations=65, topN=9): TopicResult {
  const texts=docs.slice(0,300).map(d=>d.slice(0,75));
  const frequent=frequencies(texts).filter(x=>x.count>=2).slice(0,220).map(x=>x.word);
  const index=new Map(frequent.map((w,i)=>[w,i]));
  const V=frequent.length,D=texts.length;
  if(!V || !D) return {topics:[],assignments:[],distribution:[]};
  const terms=texts.map(d=>d.map(w=>index.get(w)).filter((v):v is number=>v!==undefined));
  const rng=randomGenerator();
  const alpha=0.25,beta=0.05;
  const docTopic=Array.from({length:D},()=>Array(k).fill(0) as number[]);
  const topicWord=Array.from({length:k},()=>Array(V).fill(0) as number[]);
  const topicSum=Array(k).fill(0) as number[];
  const assignments=terms.map((d,di)=>d.map(w=>{
    const topic=Math.floor(rng()*k);docTopic[di][topic]++;topicWord[topic][w]++;topicSum[topic]++;return topic;
  }));
  for(let it=0;it<iterations;it++)for(let di=0;di<D;di++)for(let j=0;j<terms[di].length;j++){
    const word=terms[di][j];const old=assignments[di][j];
    docTopic[di][old]--;topicWord[old][word]--;topicSum[old]--;
    const probs=Array.from({length:k},(_,t)=>(docTopic[di][t]+alpha)*(topicWord[t][word]+beta)/(topicSum[t]+V*beta));
    const total=probs.reduce((s,p)=>s+p,0);const sample=rng()*total;
    let sum=0,chosen=k-1;
    for(let t=0;t<k;t++){sum+=probs[t];if(sample<=sum){chosen=t;break;}}
    assignments[di][j]=chosen;docTopic[di][chosen]++;topicWord[chosen][word]++;topicSum[chosen]++;
  }
  const topics=topicWord.map((freq,t)=>freq.map((count,i)=>({word:frequent[i],weight:(count+beta)/(topicSum[t]+V*beta)})).sort((a,b)=>b.weight-a.weight).slice(0,topN));
  const distribution=docTopic.map((row,i)=>row.map(x=>(x+alpha)/(terms[i].length+k*alpha)));
  return {topics,distribution,assignments:distribution.map(row=>row.indexOf(Math.max(...row)))};
}
