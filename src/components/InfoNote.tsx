import { Info, Lightbulb, AlertTriangle } from 'lucide-react';
export function InfoNote({title,children,tone='info'}:{title:string;children:React.ReactNode;tone?:'info'|'tip'|'warn'}){
  const Icon=tone==='tip'?Lightbulb:tone==='warn'?AlertTriangle:Info;
  return <aside className={`info-note ${tone}`}><Icon size={19} className="note-icon"/><div><strong>{title}</strong><div>{children}</div></div></aside>;
}
