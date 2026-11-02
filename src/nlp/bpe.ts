// BPE didáctico entrenado con pares de caracteres sobre el corpus local.
// No reproduce los vocabularios ni los pretokenizadores de BERT/GPT.
type Merge = [string,string];
export function learnBPE(documents:string[][], steps:number):Merge[] {
  const counts = new Map<string,number>();
  documents.flat().slice(0,6000).forEach(w=> {if(w.length>1 && w.length<40) counts.set(w,(counts.get(w)||0)+1);});
  const words=[...counts].map(([word,count])=>({parts:[...word],count}));
  const merges:Merge[]=[];
  for(let m=0;m<steps;m++){
    const pairs=new Map<string,{a:string;b:string;count:number}>();
    for(const word of words) for(let i=0;i<word.parts.length-1;i++){
      const a=word.parts[i],b=word.parts[i+1],key=JSON.stringify([a,b]);
      const info=pairs.get(key);if(info)info.count+=word.count;else pairs.set(key,{a,b,count:word.count});
    }
    const best=[...pairs.values()].sort((a,b)=>b.count-a.count)[0];
    if(!best || best.count<2)break;
    merges.push([best.a,best.b]);
    for(const word of words){
      const next:string[]=[];
      for(let i=0;i<word.parts.length;i++){
        if(word.parts[i]===best.a && word.parts[i+1]===best.b){next.push(best.a+best.b);i++;}
        else next.push(word.parts[i]);
      } word.parts=next;
    }
  }
  return merges;
}
export function bpeTokenize(text:string, merges:Merge[]):string[] {
  return (text.toLowerCase().match(/\p{L}+/gu)||[]).flatMap(word=>{
    let parts=[...word];
    for(const [a,b] of merges){
      const next:string[]=[];
      for(let i=0;i<parts.length;i++){
        if(parts[i]===a && parts[i+1]===b){next.push(a+b);i++;}else next.push(parts[i]);
      }parts=next;
    }
    return parts;
  });
}
