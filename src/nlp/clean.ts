import snowball from 'snowball-stemmers';
import type { CleanOptions, ProcessedDoc } from '../types';

export const defaults: CleanOptions = {
  lowercase: true, accents: false, removeHtml: true, removeUrls: true, removeEmails: true,
  punctuation: true, numbers: false, stopwords: true, preserveNegation: true, morphology: 'none'
};
const STOP = new Set(`a al algo algunas algunos ante antes como con contra cual cuando de del desde donde durante e el ella ellas ellos en entre era eramos eran eras es esa esas ese esos esta estaba estaban estado estas este esto estos fue fueron ha han hasta hay la las le les lo los mas me mi mis mucho muy o para pero por porque que quien quienes se sea ser si sin sobre son su sus tal tambien te tienen toda todas todo todos tu tus un una unas uno unos y ya yo usted ustedes nos nuestra nuestro nuestra`.split(' '));
const NEG = new Set('no nunca jamas ni tampoco nada nadie sin'.split(' '));
const irregular: Record<string, string> = {
  fui: 'ir', fuiste: 'ir', fue: 'ir', fuimos: 'ir', fueron: 'ir', iba: 'ir', ibamos: 'ir', voy: 'ir', vamos: 'ir', van: 'ir',
  soy: 'ser', eres: 'ser', es: 'ser', somos: 'ser', sois: 'ser', son: 'ser', era: 'ser', eras: 'ser', eramos: 'ser', eran: 'ser',
  estoy: 'estar', estas: 'estar', esta: 'estar', estamos: 'estar', estaban: 'estar', estaba: 'estar', estuvieron: 'estar',
  tengo: 'tener', tienes: 'tener', tiene: 'tener', tenemos: 'tener', tenia: 'tener', tenian: 'tener', tuvieron: 'tener',
  hice: 'hacer', hizo: 'hacer', hicieron: 'hacer', hago: 'hacer', haciendo: 'hacer',
  mejores: 'bueno', mejor: 'bueno', peores: 'malo', peor: 'malo', buenos: 'bueno', buenas: 'bueno', malo: 'malo', malas: 'malo', malos: 'malo',
  niños: 'niño', niñas: 'niña', hombres: 'hombre', mujeres: 'mujer', pies: 'pie', luces: 'luz',
  corriendo: 'correr', corrio: 'correr', corrieron: 'correr', comiendo: 'comer', comieron: 'comer', comio: 'comer',
  jugando: 'jugar', jugaban: 'jugar', jugo: 'jugar', hablando: 'hablar', hablaron: 'hablar',
  pedidos: 'pedido', productos: 'producto', facturas: 'factura', pagos: 'pago', entregas: 'entrega',
  problemas: 'problema', clientes: 'cliente', rapidamente: 'rapidamente'
};
const stemES = snowball.newStemmer('spanish');
const stemEN = snowball.newStemmer('english');
export const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// Lematización pedagógica con un pequeño léxico, NO equivale a spaCy.
export function lemmaApprox(token: string): string {
  const low = stripAccents(token.toLowerCase());
  if (irregular[low]) return irregular[low];
  if (low.length < 5) return low;
  if (low.endsWith('ces') && low.length > 5) return low.slice(0,-3) + 'z';
  if (low.endsWith('es') && low.length > 5 && !low.endsWith('ales')) return low.slice(0,-2);
  if (low.endsWith('s') && low.length > 4 && /[aeiou]s$/.test(low)) return low.slice(0,-1);
  return low;
}
export function tokenize(text: string, preserveSymbols=false): string[] {
  const base=/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*|\p{N}+(?:[.,]\p{N}+)*/gu;
  const extended=/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*|\p{N}+(?:[.,]\p{N}+)*|[!?.,;:¿¡]|\p{Extended_Pictographic}/gu;
  return text.match(preserveSymbols?extended:base) ?? [];
}
export function cleanText(raw: string, o: CleanOptions): string {
  let s = raw.normalize('NFKC');
  if (o.removeHtml) s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ').replace(/<[^>]+>/g, ' ');
  if (o.removeUrls) s = s.replace(/https?:\/\/\S+|www\.\S+/gi, ' ');
  if (o.removeEmails) s = s.replace(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g, ' ');
  if (o.lowercase) s = s.toLowerCase();
  if (o.accents) s = stripAccents(s);
  if (o.numbers) s = s.replace(/\p{N}+/gu, ' ');
  if (o.punctuation) s = s.replace(/[\p{P}\p{S}]/gu, ' ');
  return s.replace(/\s+/g, ' ').trim();
}
export function processText(raw: string, opts: CleanOptions, lang: 'es'|'en'='es'): ProcessedDoc {
  const cleaned = cleanText(raw, opts);
  const tokens = tokenize(cleaned, !opts.punctuation);
  const kept = opts.stopwords ? tokens.filter(t => {
    const l = stripAccents(t.toLowerCase());
    return !(STOP.has(l) && !(opts.preserveNegation && NEG.has(l)));
  }) : tokens;
  const normalized = kept.map(w => !/\p{L}/u.test(w) ? w : opts.morphology === 'stemming' ? (lang === 'es' ? stemES : stemEN).stem(w.toLowerCase()) : opts.morphology === 'lemma' ? lemmaApprox(w) : w);
  return { original: raw, cleaned, tokens, normalized, result: normalized.join(' ') };
}
export const pythonReference = `import spacy\nnlp = spacy.load("es_core_news_sm")\ntexto = "Los clientes estaban corriendo"\nprint([(t.text, t.lemma_, t.pos_) for t in nlp(texto)])`;
