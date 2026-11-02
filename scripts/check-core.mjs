// Smoke test real de algoritmos core. Corre con `npm test` tras `npm install`.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const project=process.cwd();
const runtime=fs.mkdtempSync(path.join(project,'.runtime-tests-'));
const modules=['data/samples','nlp/clean','nlp/analysis','nlp/sentiment','nlp/bpe','nlp/lda','nlp/classify'];
try{
  for(const name of modules){
    const file=path.join(project,'src',name+'.ts');
    let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
    js=js.replace(/from '(\.\.?\/[^']+)'/g,(_,source)=>`from '${source}.mjs'`);
    const output=path.join(runtime,name+'.mjs');
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,js);
  }
  const mod=name=>import(pathToFileURL(path.join(runtime,name+'.mjs')).href);
  const [{examples},{defaults,processText},{fitVectorizer,cosine},{scoreSentiment},{runLDA},{learnBPE,bpeTokenize},{trainModels}]=await Promise.all([
    mod('data/samples'),mod('nlp/clean'),mod('nlp/analysis'),mod('nlp/sentiment'),mod('nlp/lda'),mod('nlp/bpe'),mod('nlp/classify')
  ]);
  assert.equal(examples[0].rows.length,52);
  assert.equal(examples[1].rows.length,24);
  assert.equal(scoreSentiment('No es bueno').label,'Negativo');
  assert.equal(scoreSentiment('Muy excelente servicio').label,'Positivo');
  assert.equal(processText('Me gustan los pedidos',defaults).normalized.includes('los'),false);
  const rows=examples[0].rows,texts=rows.map(r=>r.comentario),tokens=texts.map(t=>processText(t,defaults).normalized);
  const vec=fitVectorizer(tokens,'tfidf',40);
  assert.equal(vec.matrix.length,52);assert.equal(vec.terms.length,40);
  assert.ok(vec.sparse>0);assert.ok(cosine(vec.matrix[0],vec.matrix[0])>.99);
  assert.equal(runLDA(tokens,3,25).topics.length,3);
  const merges=learnBPE(tokens,20);assert.ok(Array.isArray(bpeTokenize('aprendiendo',merges)));
  const models=trainModels(tokens,rows.map(r=>r.area),texts);
  assert.equal(models.length,3);
  models.forEach(m=>{assert.equal(m.metrics.classes.length,4);assert.ok(m.metrics.accuracy>=0&&m.metrics.accuracy<=1);});
  console.log('✓ 10 comprobaciones de algoritmos NLP completadas.');
} finally {
  fs.rmSync(runtime,{recursive:true,force:true});
}
