export type Row = Record<string, string>;
export type Section = 'inicio' | 'datos' | 'limpieza' | 'explorar' | 'vectores' | 'sentimientos' | 'topicos' | 'clasificacion' | 'conceptos';
export interface Dataset { name: string; rows: Row[]; columns: string[]; source: 'demo' | 'archivo'; }
export interface CleanOptions {
  lowercase: boolean; accents: boolean; removeHtml: boolean; removeUrls: boolean; removeEmails: boolean;
  punctuation: boolean; numbers: boolean; stopwords: boolean; preserveNegation: boolean;
  morphology: 'none' | 'stemming' | 'lemma';
}
export interface ProcessedDoc { original: string; cleaned: string; tokens: string[]; normalized: string[]; result: string; }
export interface VectorModel { terms: string[]; matrix: number[][]; df: number[]; idf: number[]; sparse: number; }
export interface Sentiment { value: number; label: 'Positivo' | 'Negativo' | 'Neutro'; hits: { word: string; weight: number }[]; }
export interface TopicResult { topics: { word: string; weight: number }[][]; assignments: number[]; distribution: number[][]; }
export interface Metrics { accuracy: number; macroF1: number; classes: string[]; matrix: number[][]; precision: number[]; recall: number[]; f1: number[]; support: number[]; tested: number; trained: number; }
