import type { VectorModel } from '../types';
export function frequencies(docs: string[][]): {word:string;count:number}[] {
  const counts = new Map<string, number>();
  for(const doc of docs) for(const word of doc) if(word.trim()) counts.set(word, (counts.get(word)||0)+1);
  return [...counts].map(([word,count])=>({word,count})).sort((a,b)=>b.count-a.count || a.word.localeCompare(b.word));
}
export function makeNgrams(tokens: string[], ngram: 1|2): string[] {
  if(ngram===1) return tokens;
  return [...tokens,...tokens.slice(0,-1).map((v,i)=>v+' '+tokens[i+1])];
}
export function fitVectorizer(docs:string[][], mode:'bow'|'tfidf'='tfidf', maxFeatures=40, minDf=1, maxDf=1, ngram:1|2=1):VectorModel {
  const n=docs.length;
  if(!n) return {terms:[],matrix:[],df:[],idf:[],sparse:0};
  const perDoc = docs.map(d => makeNgrams(d,ngram));
  const countDf = new Map<string,number>();
  perDoc.forEach(d => new Set(d).forEach(w=>countDf.set(w,(countDf.get(w)||0)+1)));
  const terms=[...countDf.entries()].filter(([,v])=>v>=minDf && v/n<=maxDf+1e-9)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,maxFeatures).map(([word])=>word);
  const df=terms.map(t=>countDf.get(t)||0);
  const idf=df.map(v=> Math.log((1+n)/(1+v))+1); // smoothing estilo scikit-learn
  const index=new Map(terms.map((w,i)=>[w,i]));
  const matrix=perDoc.map(d=>{
    const out=Array(terms.length).fill(0) as number[];
    d.forEach(w=> {const i=index.get(w);if(i!==undefined)out[i]++;});
    if(mode==='tfidf') {out.forEach((v,i)=>out[i]=v*idf[i]);const norm=Math.hypot(...out)||1;out.forEach((v,i)=>out[i]=v/norm);}
    return out;
  });
  const nonzero=matrix.reduce((sum,row)=>sum+row.filter(v=>v!==0).length,0);
  return {terms,matrix,df,idf,sparse:matrix.length*terms.length ? 1-nonzero/(matrix.length*terms.length):0};
}
export function transformVectorizer(tokens:string[], model: VectorModel, mode:'bow'|'tfidf', ngram:1|2=1):number[] {
  const out=Array(model.terms.length).fill(0) as number[];
  const index = new Map(model.terms.map((w,i)=>[w,i]));
  makeNgrams(tokens,ngram).forEach(w=> {const i=index.get(w); if(i!==undefined)out[i]++;});
  if(mode==='tfidf') {out.forEach((v,i)=>out[i]=v*model.idf[i]); const norm=Math.hypot(...out)||1;out.forEach((v,i)=>out[i]=v/norm);}
  return out;
}
export function cosine(a:number[],b:number[]):number {
  const x=Math.hypot(...a), y=Math.hypot(...b);
  return x && y ? a.reduce((s,v,i)=>s+v*b[i],0)/(x*y) : 0;
}
export function documentLengths(docs:string[][]):{bucket:string;count:number}[]{
  const ranges=[0,5,10,15,25,40,65,100,Number.POSITIVE_INFINITY];
  return ranges.slice(0,-1).map((x,i)=>({bucket:Number.isFinite(ranges[i+1])?`${x}–${ranges[i+1]-1}`:`${x}+`,count:docs.filter(d=>d.length>=x && d.length<ranges[i+1]).length}));
}
