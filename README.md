# NLP-LAB
Coderhouse NLP LAB


# NLP LAB · Laboratorio interactivo de Procesamiento de Lenguaje Natural

SPA educativa React + TypeScript + Vite inspirada en la paleta **Coderhouse**: rosa, naranja, negro y marfil. Lista para publicar como sitio estático en **Cloudflare Pages** mediante GitHub. El arte incluido en `public/coderhouse-referencia.png` fue provisto por el usuario; esta es una iniciativa educativa independiente, no un producto oficial de Coderhouse.

## Requisitos

- Node.js 22 LTS (o 20.19+) y npm.
- No requiere Python, API keys, base de datos, servidor ni variables de entorno.

## Ejecutar en Windows PowerShell

```powershell
cd coderhouse-nlp-lab
npm install
npm run dev
```

Abrí la URL local indicada por Vite. Para verificar producción:

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

## Despliegue GitHub → Cloudflare Pages

1. Descomprimí el ZIP. Abrí la carpeta `coderhouse-nlp-lab` en VS Code.
2. Ejecutá los comandos de arriba para validar el build en tu equipo.
3. Creá un repositorio nuevo **vacío** en GitHub, por ejemplo `coderhouse-nlp-lab`.
4. Desde PowerShell (reemplazá TU_USUARIO por tu usuario):

```powershell
git init
git add .
git commit -m "feat: plataforma educativa interactiva NLP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/coderhouse-nlp-lab.git
git push -u origin main
```

5. En Cloudflare: **Workers & Pages → Create application → Pages → Connect to Git**. Elegí el repositorio.
6. Configuración Cloudflare Pages:

| Parámetro | Valor |
|---|---|
| Preset | React (Vite) |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Variable `NODE_VERSION` | `22` (si es necesaria) |

7. **Save and Deploy**. Cada push a `main` publicará la nueva versión.

La carpeta `public/_redirects` habilita fallback de SPA y `_headers` incorpora encabezados de seguridad básicos. La integración Git de Cloudflare construye automáticamente después de cada push.

## Funcionalidades implementadas

| Módulo | Interactividad | Algoritmo / alcance |
|---|---|---|
| Datasets | Importación CSV, TSV, XLSX, JSON, TXT; selección texto/etiqueta; vista previa y export CSV | PapaParse, read-excel-file, Blob API |
| Preprocesamiento | Regex básico, HTML/URL/email, minúsculas, tildes, signos, números, stop words y negación | Reglas reproducibles en navegador |
| Morfología | Stemming Snowball en español; comparativa con lemas | Snowball real; lemas **aproximados**, no spaCy |
| Exploración | Word cloud, tokens, top términos, longitudes, bigramas, export CSV | Frecuencias locales |
| Vectorización | BoW/TF-IDF, min_df, max_df, max_features, unigramas y bigramas, sparse heatmap, coseno | TF-IDF con IDF suavizado y normalización L2 |
| Subpalabras | Fusiones BPE ajustables y prueba de frases | Implementación didáctica de BPE entrenada en corpus local |
| Sentimiento | Distribución y auditoría por frase, negación e intensificadores | Baseline de léxico español, no un Transformer |
| Tópicos | Cantidad de temas, iteraciones, ranking de palabras y asignaciones | LDA real por Gibbs colapsado local |
| Clasificación | Entrenamiento supervisado y comparación de NB, LR y SVM, test holdout, confusion matrix, accuracy, precision, recall, F1, predicción | TF-IDF fit solo en train, sin leakage |
| Aula | 16 conceptos, estudios de caso y quiz interactivo | Contenido didáctico |

## Estructura

```text
coderhouse-nlp-lab/
├─ public/                  # referencia visual, _headers, _redirects
├─ src/
│  ├─ components/           # nube y notas pedagógicas
│  ├─ data/samples.ts       # datasets sintéticos etiquetados
│  ├─ nlp/                  # cada algoritmo separado y documentado
│  ├─ App.tsx               # laboratorio con 9 pantallas
│  ├─ styles.css            # sistema visual responsive
│  ├─ types.ts
│  └─ main.tsx
├─ docs/                    # guía de enseñanza y limitaciones
├─ .github/workflows/ci.yml
├─ index.html
├─ vite.config.ts
└─ package.json
```

## Privacidad y límites de funcionamiento

- Archivos procesados **en el navegador**, sin backend ni subida intencional a servicios externos. Las fuentes de Google Fonts se descargan desde Google; si necesitás aislamiento absoluto, sustituí por fuentes del sistema o self-hosted.
- Límite de archivo: **8 MB**; importación de máximo **2000 registros**; se informa si se recortaron. LDA procesa como máximo 300 docs, 75 tokens/doc y 220 términos. Clasificación hasta 200 ejemplos por clase. Más allá de esto requiere Web Workers, streaming y/o backend.
- La **lematización es aproximada**, sin POS ni desambiguación. Para lematización industrial, usar un servicio Python con spaCy y su modelo `es_core_news_sm`.
- El sentimiento es una **heurística léxica** con negación. No detecta correctamente sarcasmo, ironía, contextos de dominio o variantes fuera del léxico; no confundir con un modelo supervisado de sentimientos.
- El BPE es una demostración real de fusiones, no el tokenizador original de un LLM. La app **no** incluye embeddings preentrenados ni NER ni RAG productivo: esos conceptos se explican como material del curso.
- La clasificación usa un split estratificado con semilla fija y etiquetas con mínimo 3 registros. Los resultados de un corpus chico **no** son una estimación robusta de producción.
- LDA tiene un inicializador aleatorio reproducible (semilla fija), pero depende del corpus y sus hiperparámetros.
- El frontend ejecuta los algoritmos de forma sincrónica en el hilo principal; límites establecidos para evitar cargas excesivas.
