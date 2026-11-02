import { useMemo } from 'react';
interface Item{word:string;count:number}
export function WordCloud({words}:{words:Item[]}){
  const layout=useMemo(()=>{
    const top=words.slice(0,48),max=Math.max(1,...top.map(w=>w.count));
    const boxes:{x:number;y:number;w:number;h:number}[]=[];
    return top.map((item,i)=>{
      const size=Math.min(53,Math.max(13,13+40*Math.sqrt(item.count/max)));
      const w=item.word.length*size*.56,h=size*1.12;
      let hit:{x:number;y:number}|null=null;
      for(let a=0;a<1800;a++){
        const angle=a*0.39+i*2.3,r=2.2*Math.sqrt(a)*4.0;
        const x=380+Math.cos(angle)*r-w/2,y=148+Math.sin(angle)*r-h/2;
        if(x<8||y<6||x+w>752||y+h>294)continue;
        if(boxes.every(b=>x+w+8<b.x||b.x+b.w+8<x||y+h+5<b.y||b.y+b.h+5<y)) {hit={x,y};break;}
      }
      if(!hit)return null;
      boxes.push({...hit,w,h});
      return {word:item.word,count:item.count,x:hit.x,y:hit.y+size,size,color:['#251017','#ff4b94','#ff7d3e','#a83fc9','#e54e60','#6b3060'][i%6]};
    }).filter((x): x is NonNullable<typeof x>=>x!==null);
  },[words]);
  return <svg role="img" aria-label="Nube de palabras según frecuencia" className="word-svg" viewBox="0 0 760 310">
    {layout.map((w)=><text key={w.word} x={w.x} y={w.y} fill={w.color} fontSize={w.size} fontWeight={w.size>30?850:650} fontFamily="Inter, system-ui, sans-serif"><title>{w.word}: {w.count} apariciones</title>{w.word}</text>)}
    {!layout.length&&<text x="380" y="155" fill="#796b74" textAnchor="middle">No hay palabras para mostrar</text>}
  </svg>;
}
