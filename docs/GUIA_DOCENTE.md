# Guía de clase · NLP LAB

**Duración sugerida:** 2 horas (adaptable a un taller de 3 horas).

## Objetivos de aprendizaje

- Diferenciar un dataframe (contenedor tabular) del contenido libre en cada celda.
- Identificar cómo la limpieza puede eliminar información útil.
- Aplicar tokenización, stemming Snowball y comparar con aproximaciones a lematización.
- Interpretar frecuencias, n-gramas y nube de palabras.
- Construir BoW y TF-IDF e interpretar dimensionalidad y sparsity.
- Explicar cómo las subpalabras reducen el OOV sin reemplazar el modelo de lenguaje.
- Interpretar sentimiento, tópicos LDA y métricas de clasificación.

## Secuencia

1. **0–10 min**: Inicio → datos no tabulares, NLU vs NLG, ejemplos industriales.
2. **10–25 min**: Mis datasets → cargar un CSV. Elegir texto y categoría.
3. **25–45 min**: Preprocesamiento → activar/desactivar stop words y negaciones; comparar resultados.
4. **45–60 min**: EDA → word cloud, términos más usados, bigramas.
5. **60–85 min**: Vectorización → comparar BoW vs TF-IDF, cambiar min_df y max_df, ver la matriz y el coseno. Probar BPE.
6. **85–100 min**: Sentimiento → probar «No es bueno» y «¡Genial, se rompió!». Discutir errores.
7. **100–110 min**: Tópicos LDA → detectar grupos y asignar nombres manualmente.
8. **110–120 min**: Clasificación → entrenar NB, LR, SVM y evaluar F1 macro. Quiz final.

## Actividades de discusión

- ¿Eliminar palabras comunes ayuda siempre? Cambiá la configuración de negaciones.
- ¿Un buen accuracy significa que el modelo es confiable? Consultá matriz de confusión, F1 y muestras por clase.
- ¿Una palabra con IDF alto es automáticamente importante? No: depende de frecuencia y contexto.
- ¿LDA descubre nombres para los temas? No: las palabras deben interpretarse.
- ¿Por qué no podemos igualar stemming y lematización? Snowball aplica reglas superficiales; spaCy aprovecha el análisis lingüístico.

## Ejercicio práctico evaluable

1. Cargar un dataset con al menos 30 reseñas y una columna de categoría.
2. Proponer y justificar un pipeline, incluyendo la política de stop words.
3. Comparar dos configuraciones TF-IDF y explicar cambios de sparsity.
4. Probar 4 frases de sentimiento y documentar al menos un falso positivo.
5. Entrenar los 3 modelos y seleccionar uno con F1 macro; identificar un error y explicarlo.
6. Escribir conclusiones sobre limitaciones de dominio y la necesidad de un conjunto de test independiente.

## Advertencias técnicas para enseñar correctamente

La afirmación «80%–90% de datos globales no estructurados» es una estimación repetida en material divulgativo, no una medición universal; no se usa como hecho cuantitativo verificado en la plataforma. Los ejemplos de aritmética de embeddings son ilustrativos, no una garantía matemática. Este laboratorio no simula NER o BERT ocultando un diccionario: distingue los métodos implementados de los conceptos explicados.
