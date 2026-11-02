import type { Sentiment } from '../types';
import { stripAccents, tokenize } from './clean';
// Léxico demostrativo español, pesos simples. No es un modelo contextual entrenado.
const POS = `excelente magnifico fantastico increible maravilloso maravilloso genial bueno buena buenos buenas agradable perfecto perfecta impecable puntual rapido rapida rapidez seguro segura facil sencillo sencilla comodo comoda claro claridad mejor gracias amable ayudaron ayudaron soluciona resolvio resolvieron satisfecho satisfecha encantado encantada encanto feliz util confiable eficaz recomendable precioso hermosa resistente encantadora supero completa correctamente puntualidad`.split(' ');
const NEG = `malo mala malos malas terrible pesimo pesima horrible desastre roto rota rotos rota demorado demora demorado tardanza tarde problema problemas incorrecto incorrecta falla falla fallan defectuoso defectuosa decepcion disgusto fraudulento lento lenta dificil dificilmente engañosa engañoso fragil molesto molesta rechazada rechazada perdio perdi desperdicio descortes mal estafa frustrante insuficiente nunca error`.split(' ');
const INTENSIFIERS = new Set(['muy','super','extremadamente','realmente','totalmente','bastante']);
const NEGATIONS = new Set(['no','nunca','ni','jamas','tampoco','sin']);
const lexicon = new Map<string,number>();POS.forEach(w=>lexicon.set(stripAccents(w),1));NEG.forEach(w=>lexicon.set(stripAccents(w),-1));
export function scoreSentiment(text:string):Sentiment {
  const tokens=tokenize(stripAccents(text.toLowerCase()));
  const hits:Sentiment['hits']=[];
  for(let i=0;i<tokens.length;i++){
    const word=tokens[i];const raw=lexicon.get(word);
    if(raw===undefined)continue;
    const before=tokens.slice(Math.max(0,i-3),i);
    const negation=before.filter(x=>NEGATIONS.has(x)).length%2===1;
    const intensity=before.some(x=>INTENSIFIERS.has(x))?1.5:1;
    hits.push({word,weight:raw*(negation?-1:1)*intensity});
  }
  const value=hits.reduce((s,h)=>s+h.weight,0);
  return {value,label:value>0.1?'Positivo':value< -0.1?'Negativo':'Neutro',hits};
}
export function sentimentCounts(texts:string[]):{name:string;value:number}[] {
  const scores=texts.map(scoreSentiment);
  return (['Positivo','Neutro','Negativo'] as const).map(name=>({name,value:scores.filter(s=>s.label===name).length}));
}
