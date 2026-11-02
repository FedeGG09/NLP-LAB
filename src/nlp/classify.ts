import type { Metrics, VectorModel } from '../types';
import {fitVectorizer,transformVectorizer} from './analysis';
export type Algorithm = 'Naive Bayes'|'Regresión logística'|'SVM lineal';
interface Model {algorithm:Algorithm;classes:string[]; model:VectorModel; weights:number[][]; bias:number[]; priors:number[]; method:'tfidf'|'bow';}
export interface RunResult {metrics:Metrics; model:Model; validation:{trueLabel:string;pred:string;text:string}[];}
const algorithms:Algorithm[]=['Naive Bayes','Regresión logística','SVM lineal'];
const seedRand=()=>{let seed=19937;return ()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};};
export function predict(model:Model,tokens:string[]):string {
  const x=transformVectorizer(tokens,model.model,model.method);
  const scores=model.weights.map((w,c)=>w.reduce((s,weight,j)=>s+weight*x[j],model.bias[c]+model.priors[c]));
  return model.classes[scores.indexOf(Math.max(...scores))]||'Sin predicción';
}
function metrics(truth:string[],preds:string[],classes:string[],trained:number):Metrics {
  const matrix=classes.map(()=>classes.map(()=>0));
  truth.forEach((v,i)=>{matrix[classes.indexOf(v)][classes.indexOf(preds[i])]++;});
  const precision:number[]=[],recall:number[]=[],f1:number[]=[],support:number[]=[];
  classes.forEach((_,c)=>{
    const tp=matrix[c][c],fp=matrix.reduce((s,row,i)=>s+(i===c?0:row[c]),0),fn=matrix[c].reduce((s,n,i)=>s+(i===c?0:n),0);
    const p=tp+fp?tp/(tp+fp):0,r=tp+fn?tp/(tp+fn):0;
    precision.push(p);recall.push(r);f1.push(p+r?2*p*r/(p+r):0);support.push(tp+fn);
  });
  return {accuracy:truth.length?truth.filter((v,i)=>v===preds[i]).length/truth.length:0,macroF1:f1.reduce((s,v)=>s+v,0)/Math.max(classes.length,1),classes,matrix,precision,recall,f1,support,tested:truth.length,trained};
}
export function trainModels(docs:string[][], labels:string[], raw:string[]):RunResult[] {
  const usable=labels.map((l,i)=>({label:l.trim(),tokens:docs[i],text:raw[i]})).filter(x=>x.label && x.tokens.length);
  const counts=new Map<string,number>();usable.forEach(x=>counts.set(x.label,(counts.get(x.label)||0)+1));
  const valid=[...counts].filter(([,n])=>n>=3).map(([c])=>c).sort();
  const validRows=usable.filter(x=>valid.includes(x.label));
  if(valid.length<2 || validRows.length<12)throw new Error('Se necesitan al menos 2 clases, con 3 registros por clase y 12 ejemplos válidos en total.');
  // Limitación visible de cómputo: corpus de hasta 800 filas, con muestreo estratificado.
  const rng=seedRand();
  const byClass=valid.map(c=>validRows.filter(v=>v.label===c).map(v=>({v,r:rng()})).sort((a,b)=>a.r-b.r).slice(0,200).map(x=>x.v));
  const train=byClass.flatMap(g=>g.slice(Math.max(1,Math.ceil(g.length*0.2))));
  const test=byClass.flatMap(g=>g.slice(0,Math.max(1,Math.ceil(g.length*0.2))));
  const corpus=train.map(r=>r.tokens);
  const method:'tfidf'='tfidf';
  const vector=fitVectorizer(corpus,'tfidf',Math.min(450,Math.max(60,corpus.length*6)),1,1,1);
  const X=vector.matrix, Y=train.map(x=>valid.indexOf(x.label));
  const K=valid.length,F=vector.terms.length;
  const Xt=test.map(x=>transformVectorizer(x.tokens,vector,method));
  const results:RunResult[]=[];
  for(const algorithm of algorithms){
    const weights=Array.from({length:K},()=>Array(F).fill(0) as number[]);
    const bias=Array(K).fill(0) as number[];
    const priors=Array(K).fill(0) as number[];
    if(algorithm==='Naive Bayes'){
      // Multinomial NB sobre características TF-IDF no negativas, con suavizado aditivo.
      const counts=valid.map(()=>Array(F).fill(1) as number[]),totals=Array(K).fill(F) as number[];
      X.forEach((row,i)=>row.forEach((v,j)=>{counts[Y[i]][j]+=v;totals[Y[i]]+=v;}));
      counts.forEach((row,c)=>row.forEach((v,j)=>weights[c][j]=Math.log(v/totals[c])));
      valid.forEach((_,c)=>priors[c]=Math.log((Y.filter(x=>x===c).length+1)/(Y.length+K)));
    }else{
      // one-vs-rest full-batch SGD with L2 regularization; deterministic.
      const rate=algorithm==='Regresión logística'?0.18:0.08;
      for(let epoch=0;epoch<65;epoch++){
        for(let i=0;i<X.length;i++)for(let c=0;c<K;c++){
          const y=Y[i]===c?1:-1;
          const z=weights[c].reduce((s,w,j)=>s+w*X[i][j],bias[c]);
          let grad:number;
          if(algorithm==='Regresión logística')grad=-y/(1+Math.exp(Math.max(-35,Math.min(35,y*z))));
          else grad=y*z<1?-y:0;
          for(let j=0;j<F;j++)weights[c][j]-=rate*(grad*X[i][j]+0.0008*weights[c][j]);
          bias[c]-=rate*grad;
        }
      }
    }
    const model:Model={algorithm,model:vector,weights,bias,priors,classes:valid,method};
    const predicted=test.map((r,i)=>predict(model,test[i].tokens));
    results.push({model,metrics:metrics(test.map(x=>x.label),predicted,valid,train.length),validation:test.map((r,i)=>({trueLabel:r.label,pred:predicted[i],text:r.text}))});
  }
  return results;
}
