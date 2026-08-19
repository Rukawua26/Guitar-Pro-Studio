import { Lesson, ChordShape, TuningPreset } from '../types/course';

export const COURSE_LESSONS: Lesson[] = [
  {
    id: "1.1",
    nivel: 1,
    categoria: "Principiante",
    titulo: "Cimientos de la Ergonomía e Iniciación a la Armonía Abierta",
    teoria: "Adopción de la postura ergonómica (clásica con elevador de pie o folclórica sobre muslo derecho) para prevenir lesiones y maximizar movilidad. Introducción a los acordes abiertos fundamentales (Re, La, Mi mayor) y mecánica de independencia lineal de dedos con púa alternada estricta.",
    ejercicios: [
      "La Araña Inicial: Digitación en trastes 5-8 de sexta a primera cuerda con púa alternada constante.",
      "Formación estricta de acordes abiertos: Re Mayor (D), La Mayor (A) y Mi Mayor (E).",
      "Transiciones de un Minuto (One Minute Changes): Alternancia entre Re y La buscando más de 30 cambios limpios por minuto en bloque."
    ],
    cancion_referencia: "Progresiones de Tres Acordes (A, D, E) / Iniciación al Cambio de Bloque",
    canal_youtube: "JustinGuitar / Marty Music",
    youtubeVideoId: "kJvWq6q3sEQ", // Dedicated Guitar Lesson Video
    videoTimestamps: [
      { label: "0:00 - Postura & Pulgar Centrado", seconds: 0, description: "Ergonomía de brazo y ángulo de 90° de nudillos" },
      { label: "1:45 - Digitación de Re Mayor (D)", seconds: 105, description: "Colocación de dedos 1, 2 y 3 cerca del traste" },
      { label: "3:30 - Acordes La (A) y Mi (E)", seconds: 210, description: "Cambios en bloque y optimización motriz" },
      { label: "5:15 - Entrenador de 1 Minuto", seconds: 315, description: "Práctica con metrónomo y conteo limpio" }
    ],
    chords: ["D", "A", "E"],
    bpmObjetivo: 60,
    puntosClave: [
      "Mantener el pulgar detrás del mástil, centrado a la altura del traste 2-3.",
      "Presionar cerca del traste metálico para evitar zumbidos ('trasteos').",
      "Curvar los dedos en ángulo de 90° para no mutear cuerdas adyacentes.",
      "Púa alternada estricta: Abajo (↓) en tiempo fuerte, Arriba (↑) en contratiempo."
    ],
    tabSnippet: `Ejercicio 'La Araña' (Trastes 5-8):
e|---------------------------------5-6-7-8-|
B|-------------------------5-6-7-8---------|
G|-----------------5-6-7-8-----------------|
D|---------5-6-7-8-------------------------|
A|-5-6-7-8---------------------------------|
E|-----------------------------------------|
   ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑`
  },
  {
    id: "2.1",
    nivel: 2,
    categoria: "Principiante",
    titulo: "Consolidación Rítmica y Repertorio Armónico Ampliado",
    teoria: "Subdivisión del compás de 4/4 en negras y corcheas. Concepto del brazo como péndulo rítmico continuo con rasgueo alternado (abajo-arriba) y técnica de rasgueo fantasma sobre silencios. Ampliación armónica a Sol mayor, Do mayor, Mi menor, La menor y Re menor.",
    ejercicios: [
      "Estabilización del Pulso a 60 BPM: Alternar un compás en negras y un compás en corcheas.",
      "Patrón de Rasgueo Universal (The Common Strum): Abajo, Abajo-Arriba, (Fantasma)-Arriba, Abajo-Arriba.",
      "Mecánica de Do Mayor (C) y Sol Mayor (G) evitando apagar cuerdas contiguas."
    ],
    cancion_referencia: "Knockin' on Heaven's Door - Guns N' Roses / Eric Clapton (G, D, Am, C) / Wildflowers - Tom Petty (con Capo)",
    canal_youtube: "Marty Music / JustinGuitar",
    youtubeVideoId: "g4uS1_f1t0g",
    videoTimestamps: [
      { label: "0:00 - Péndulo Rítmico de Brazo", seconds: 0, description: "Movimiento constante del antebrazo a pulso" },
      { label: "2:10 - El Rasgueo Universal", seconds: 130, description: "Patrón ↓ ↓↑ (↓)↑ ↓↑ desglosado" },
      { label: "4:20 - Transición Sol (G) ↔ Do (C)", seconds: 260, description: "Uso del anular y meñique como pivote" },
      { label: "6:40 - Canción de Demostración", seconds: 400, description: "Knockin' on Heaven's Door en contexto" }
    ],
    chords: ["G", "C", "Em", "Am", "Dm"],
    bpmObjetivo: 68,
    puntosClave: [
      "El antebrazo nunca debe detenerse; actúa como un péndulo continuo a tiempo constante.",
      "Rasgueo fantasma: mover la mano rozando el aire sin tocar las cuerdas en los silencios.",
      "Transición fluida G -> C usando dedos anular y meñique como puntos de pivote."
    ],
    tabSnippet: `Patrón Universal de Rasgueo (The Old Faithful):
Compás 4/4:
1     &     2     &     3     &     4     &
↓           ↓     ↑     (↓)   ↑     ↓     ↑
Golpe       Golpe Sub   Fant. Sub   Golpe Sub`
  },
  {
    id: "3.1",
    nivel: 3,
    categoria: "Intermedio",
    titulo: "El Sistema CAGED y la Arquitectura de los Acordes de Cejilla",
    teoria: "Mapeo del diapasón mediante las 5 formas abiertas (C-A-G-E-D) desplazables. Técnica de cejilla mediante rotación radial del índice y presión en pinza del pulgar centrado verticalmente sin tensionar muñeca.",
    ejercicios: [
      "Aislador de Presión de Cejilla: Evaluación de sonoridad limpia de 1ª a 6ª cuerda con solo el índice en traste 5.",
      "Construcción del acorde de Fa Mayor (F) desde la forma de Mi y Si menor (Bm) desde la forma de La.",
      "Ejercicios de Transposición Lineal: Progresión I-IV-V en Sol mayor usando únicamente formas desplazables de cejilla."
    ],
    cancion_referencia: "Sultans of Swing - Dire Straits (Dm, C, Bb, A, F) / Wish You Were Here - Pink Floyd",
    canal_youtube: "Marty Music / Paul Davids",
    youtubeVideoId: "o5Vp-s-M-mQ",
    videoTimestamps: [
      { label: "0:00 - Rotación del Índice en Cejilla", seconds: 0, description: "Apoyo con el borde óseo lateral del dedo" },
      { label: "2:15 - El Acorde de Fa Mayor (F)", seconds: 135, description: "Distribución del peso corporal contra la guitarra" },
      { label: "4:30 - Si menor (Bm) en Traste 2", seconds: 270, description: "Cejilla de 5 cuerdas desde la raíz de La" },
      { label: "7:00 - El Mapeo CAGED Completo", seconds: 420, description: "Conectar las 5 formas a lo largo del diapasón" }
    ],
    chords: ["F", "Bm", "Bb", "C_barre", "G_barre"],
    bpmObjetivo: 75,
    puntosClave: [
      "Girar ligeramente el dedo índice hacia el borde exterior (lado del hueso más duro).",
      "No usar solo fuerza bruta de la mano; tirar levemente con el brazo hacia atrás contra el cuerpo de la guitarra.",
      "Localizar las notas tónicas en 6ª y 5ª cuerda para transportar cualquier acorde al instante."
    ],
    tabSnippet: `Forma CAGED de Fa Mayor (Forma de E en Traste 1):
e|---1---| (Índice en cejilla completa)
B|---1---| (Índice)
G|---2---| (Medio)
D|---3---| (Meñique)
A|---3---| (Anular)
E|---1---| (Índice en raíz F)
   F barre chord (Root on 6th string)`
  },
  {
    id: "4.1",
    nivel: 4,
    categoria: "Intermedio",
    titulo: "Armonía Diatónica y la Escala Pentatónica",
    teoria: "Estructura interválica de la escala pentatónica menor (1 - b3 - 4 - 5 - b7) y su geometría en la guitarra. Articulaciones expresivas de guitarra solista: Hammer-ons, Pull-offs y Bending controlado con soporte multi-dedo.",
    ejercicios: [
      "Primera Caja Pentatónica de La Menor (Traste 5) ejecutada con púa alternada estricta.",
      "Ligados en Cadena (Hammer-on y Pull-off): Secuencia 5-7-5 en tercera cuerda con una sola pulsación de púa.",
      "Calibración de Bending de 1 Tono: Empuje en traste 7 comparando tono objetivo con traste 9 directo."
    ],
    cancion_referencia: "Wish You Were Here (Solos e Intro) - Pink Floyd / Stairway to Heaven (Solo) - Led Zeppelin",
    canal_youtube: "GuitarLessons365 / Paul Davids",
    youtubeVideoId: "V_6Txb_y8_g",
    videoTimestamps: [
      { label: "0:00 - Caja 1 de Pentatónica Menor", seconds: 0, description: "Digitación en traste 5 en tonalidad de Am" },
      { label: "2:20 - Técnica de Bending de 1 Tono", seconds: 140, description: "Rotación de muñeca y soporte de dedos 1 y 2" },
      { label: "4:40 - Ligados Hammer-on & Pull-off", seconds: 280, description: "Ataque percusivo y pellizco con el dedo anular" },
      { label: "6:50 - Fraseo Expresivo y Blue Note", seconds: 410, description: "Resolución melódica sobre acordes de soporte" }
    ],
    chords: ["Am7", "Cmaj7", "Dm7", "Em7", "G7"],
    bpmObjetivo: 85,
    puntosClave: [
      "Bending afinado: apoyar con los dedos 1 y 2 detrás del dedo 3 para máxima fuerza y control.",
      "Rotar la muñeca como si giraras el pomo de una puerta, en lugar de empujar solo con los dedos.",
      "Enfatizar la nota raíz (La en 5º traste) para cerrar las frases con resolución melódica."
    ],
    tabSnippet: `Pentatónica Menor de Am (Caja 1 en Traste 5):
e|-----------------------------5-8-|
B|-------------------------5-8-----|
G|---------------------5-7---------|
D|-----------------5-7-------------|
A|-------------5-7-----------------|
E|---------5-8---------------------|
  Tónica: 5ta cuerda traste 7, 1ra/6ta traste 5, 3ra traste 7`
  },
  {
    id: "5.1",
    nivel: 5,
    categoria: "Intermedio",
    titulo: "Independencia Técnica de la Mano Derecha y Estilo Fingerstyle",
    teoria: "Polifonía e independencia tímbrica. Desvinculación de la púa: el pulgar (p) asume bajos alternados en cuerdas 6ª, 5ª y 4ª, mientras índice (i), medio (m) y anular (a) ejecutan melodía y síncopa armónica en cuerdas agudas.",
    ejercicios: [
      "Arpegios descendentes polifónicos manteniendo independencia de volumen entre bajo y agudos.",
      "Patrón de Travis Picking en compás compuesto aplicado sobre acordes móviles."
    ],
    cancion_referencia: "Stairway to Heaven (Intro) - Led Zeppelin / Estudio de Estilo Acústico Libre",
    canal_youtube: "GuitarLessons365 / Paul Davids",
    youtubeVideoId: "QkF3oxziUi4",
    videoTimestamps: [
      { label: "0:00 - Asignación de Dedos (p-i-m-a)", seconds: 0, description: "Colocación de la mano derecha en forma de arco natural" },
      { label: "2:10 - Pulgar Alternado (Bajos)", seconds: 130, description: "Patrón de bajo continuo entre 5ª y 4ª cuerda" },
      { label: "4:30 - Travis Picking Sincopado", seconds: 270, description: "Superposición de notas agudas a contratiempo" },
      { label: "7:10 - Demostración de Arpegios Clásicos", seconds: 430, description: "Dinámica y balance de volumen polifónico" }
    ],
    chords: ["Am", "C/G", "D/F#", "Fmaj7", "G6"],
    bpmObjetivo: 80,
    puntosClave: [
      "Asignación de dedos clásica: Pulgar (p) -> 6ª, 5ª, 4ª; Índice (i) -> 3ª; Medio (m) -> 2ª; Anular (a) -> 1ª.",
      "El pulgar se mueve hacia abajo y hacia afuera; los dedos agudos tiran hacia la palma.",
      "Mantener el volumen del bajo continuo y dinámico sin eclipsar la línea melódica."
    ],
    tabSnippet: `Patrón Básico de Travis Picking (Acorde C Mayor):
e|-----------0---------------0-----|
B|-------1---------------1---------| (Dedos m / a)
G|---------------0---------------0-| (Dedo i)
D|-------2---------------2---------| (Pulgar p en 4ta)
A|---3---------------3-------------| (Pulgar p en 5ta)
E|---------------------------------|
     1   &   2   &   3   &   4   &`
  },
  {
    id: "6.1",
    nivel: 6,
    categoria: "Avanzado",
    titulo: "Sincronización Bilateral y Mecánica de Alta Velocidad",
    teoria: "Biomecánica de la velocidad sin tensión muscular pasiva. Análisis de la trayectoria tridimensional de la púa y mecánica de escape (picking escape) al cruzar cuerdas.",
    ejercicios: [
      "Púa alternada de alta velocidad combinada con Palm Muting sobre patrones asimétricos.",
      "Desafío de sincronización lineal a alto tempo y economía de movimiento para eliminar ruidos simpáticos."
    ],
    cancion_referencia: "Addicted to Pain (Riff de apertura) - Alter Bridge / Desafío de Limpieza de 30 Días",
    canal_youtube: "Bernth",
    youtubeVideoId: "s4gBchF_y1E",
    videoTimestamps: [
      { label: "0:00 - Ángulo de Púa & Pick Slanting", seconds: 0, description: "Mecánica de escape ascendente y descendente" },
      { label: "2:00 - Palm Muting en Silletas", seconds: 120, description: "Ataque percusivo nítido y control de armónicos" },
      { label: "4:15 - Ejercicio de Sincronización en 16avas", seconds: 255, description: "Práctica progresiva de 80 a 140 BPM" },
      { label: "6:50 - Relajación Muscular Dinámica", seconds: 410, description: "Eliminación de tensión en hombros y antebrazo" }
    ],
    chords: ["E5", "G5", "A5", "D5", "B5"],
    bpmObjetivo: 130,
    puntosClave: [
      "Minimizar el recorrido de la púa a menos de 2 mm de separación de la cuerda.",
      "Palm Muting preciso: el talón de la mano reposa suavemente sobre las silletas del puente.",
      "Usar el escape ascendente (Upward Pick Slanting) o descendente según la dirección de cambio de cuerda."
    ],
    tabSnippet: `Sincronización Rápida en 16avas (130+ BPM):
e|---------------------------------------------------------|
B|---------------------------------------------------------|
G|-------------------------5-7-8-7-5-----------------------|
D|-----------------5-7-8-------------8-7-5-----------------|
A|---------5-6-8---------------------------8-6-5-----------|
E|-5-6-8-----------------------------------------8-6-5-----|
   ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑`
  },
  {
    id: "7.1",
    nivel: 7,
    categoria: "Avanzado",
    titulo: "Técnicas de Alta Complejidad e Improvisación Modal",
    teoria: "Integración de Sweep Picking (barrido continuo de púa con muteo selectivo), legato extremo sin ataque de púa y teoría de los siete modos griegos (Jónico, Dórico, Frigio, Lidio, Mixolidio, Eólico, Locrio).",
    ejercicios: [
      "Barrido de Tríada de 5 Cuerdas en Do Mayor (Traste 12) con muting de mano izquierda.",
      "Ejercicios de Legato Extremo ininterrumpido (trastes 12-14-15-14-12) en primera cuerda sin uso de púa.",
      "Improvisación en Modo Lidio sobre base armónica Cmaj7 resolviendo en la 4ª aumentada (#4)."
    ],
    cancion_referencia: "Waves - Guthrie Govan / For the Love of God - Steve Vai",
    canal_youtube: "Learn Waves by Guthrie Govan / Licklibrary / Alejandra",
    youtubeVideoId: "niT2q0ElP4g",
    videoTimestamps: [
      { label: "0:00 - Mecánica del Barrido (Sweep Picking)", seconds: 0, description: "Movimiento continuo de muñeca a través de las cuerdas" },
      { label: "2:45 - Muting Selectivo de Mano Izquierda", seconds: 165, description: "Despegar dedos al instante para evitar notas solapadas" },
      { label: "5:20 - Los 7 Modos Griegos en el Mástil", seconds: 320, description: "Mapas modales y notas características" },
      { label: "8:00 - Sonoridad Lidia (#4) & Satriani Vibe", seconds: 480, description: "Resoluciones melódicas espaciales" }
    ],
    chords: ["Cmaj7#11", "Am9", "D13", "Em11", "F#m7b5"],
    bpmObjetivo: 140,
    puntosClave: [
      "Sweep Picking: No rasguear; empujar la púa a través de las cuerdas en un solo movimiento fluido continuo.",
      "Muteo sincronizado: Levantar cada dedo justo después de ser tocado para evitar que las notas suenen juntas como acorde.",
      "Característica Lidia: La nota #4 (F# en tonalidad de Do) genera la tensión brillante y espacial característica."
    ],
    tabSnippet: `Sweep Picking Arpegio Mayor (5 cuerdas):
e|---------12-15p12---------|
B|-------13--------13-------|
G|-----12------------12-----|
D|---14----------------14---|
A|-15--------------------15-|
E|--------------------------|
   ↓  ↓  ↓  ↓   ↑  ↑  ↑  ↑`
  }
];

export const STANDARD_TUNING_NOTES = [
  { note: "E", octave: 4, freq: 329.63, stringName: "1ª Cuerda (E4)" },
  { note: "B", octave: 3, freq: 246.94, stringName: "2ª Cuerda (B3)" },
  { note: "G", octave: 3, freq: 196.00, stringName: "3ª Cuerda (G3)" },
  { note: "D", octave: 3, freq: 146.83, stringName: "4ª Cuerda (D3)" },
  { note: "A", octave: 2, freq: 110.00, stringName: "5ª Cuerda (A2)" },
  { note: "E", octave: 2, freq: 82.41, stringName: "6ª Cuerda (E2)" }
];

export const TUNING_PRESETS: TuningPreset[] = [
  {
    id: "standard",
    name: "Estándar (E A D G B E)",
    description: "La afinación universal para el 90% del repertorio de guitarra.",
    notes: STANDARD_TUNING_NOTES
  },
  {
    id: "drop_d",
    name: "Drop D (D A D G B E)",
    description: "6ª cuerda bajada a Re. Usada en Rock, Grunge, Metal y acústica clásica.",
    notes: [
      { note: "E", octave: 4, freq: 329.63, stringName: "1ª Cuerda (E4)" },
      { note: "B", octave: 3, freq: 246.94, stringName: "2ª Cuerda (B3)" },
      { note: "G", octave: 3, freq: 196.00, stringName: "3ª Cuerda (G3)" },
      { note: "D", octave: 3, freq: 146.83, stringName: "4ª Cuerda (D3)" },
      { note: "A", octave: 2, freq: 110.00, stringName: "5ª Cuerda (A2)" },
      { note: "D", octave: 2, freq: 73.42, stringName: "6ª Cuerda (D2)" }
    ]
  },
  {
    id: "dadgad",
    name: "DADGAD (Celta / Acústico)",
    description: "Afinación modal abierta con resonancias ricas. Ideal para Fingerstyle y folk.",
    notes: [
      { note: "D", octave: 4, freq: 293.66, stringName: "1ª Cuerda (D4)" },
      { note: "A", octave: 3, freq: 220.00, stringName: "2ª Cuerda (A3)" },
      { note: "G", octave: 3, freq: 196.00, stringName: "3ª Cuerda (G3)" },
      { note: "D", octave: 3, freq: 146.83, stringName: "4ª Cuerda (D3)" },
      { note: "A", octave: 2, freq: 110.00, stringName: "5ª Cuerda (A2)" },
      { note: "D", octave: 2, freq: 73.42, stringName: "6ª Cuerda (D2)" }
    ]
  },
  {
    id: "half_step_down",
    name: "Medio Tono Abajo (Eb Ab Db Gb Bb Eb)",
    description: "Afinación emblemática de Jimi Hendrix, Stevie Ray Vaughan, Guns N' Roses.",
    notes: [
      { note: "Eb", octave: 4, freq: 311.13, stringName: "1ª Cuerda (Eb4)" },
      { note: "Bb", octave: 3, freq: 233.08, stringName: "2ª Cuerda (Bb3)" },
      { note: "Gb", octave: 3, freq: 185.00, stringName: "3ª Cuerda (Gb3)" },
      { note: "Db", octave: 3, freq: 138.59, stringName: "4ª Cuerda (Db3)" },
      { note: "Ab", octave: 2, freq: 103.83, stringName: "5ª Cuerda (Ab2)" },
      { note: "Eb", octave: 2, freq: 77.78, stringName: "6ª Cuerda (Eb2)" }
    ]
  },
  {
    id: "open_g",
    name: "Open G (D G D G B D)",
    description: "Afinación abierta favorita de Keith Richards (The Rolling Stones) y blues slide.",
    notes: [
      { note: "D", octave: 4, freq: 293.66, stringName: "1ª Cuerda (D4)" },
      { note: "B", octave: 3, freq: 246.94, stringName: "2ª Cuerda (B3)" },
      { note: "G", octave: 3, freq: 196.00, stringName: "3ª Cuerda (G3)" },
      { note: "D", octave: 3, freq: 146.83, stringName: "4ª Cuerda (D3)" },
      { note: "G", octave: 2, freq: 98.00, stringName: "5ª Cuerda (G2)" },
      { note: "D", octave: 2, freq: 73.42, stringName: "6ª Cuerda (D2)" }
    ]
  }
];

export const CHORD_LIBRARY: Record<string, ChordShape> = {
  "D": { name: "Re Mayor (D)", frets: ['x', 'x', 0, 2, 3, 2], fingers: ['x', 'x', 0, 1, 3, 2], category: 'Abierto' },
  "A": { name: "La Mayor (A)", frets: ['x', 0, 2, 2, 2, 0], fingers: ['x', 0, 1, 2, 3, 0], category: 'Abierto' },
  "E": { name: "Mi Mayor (E)", frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], category: 'Abierto' },
  "G": { name: "Sol Mayor (G)", frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], category: 'Abierto' },
  "C": { name: "Do Mayor (C)", frets: ['x', 3, 2, 0, 1, 0], fingers: ['x', 3, 2, 0, 1, 0], category: 'Abierto' },
  "Em": { name: "Mi menor (Em)", frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], category: 'Abierto' },
  "Am": { name: "La menor (Am)", frets: ['x', 0, 2, 2, 1, 0], fingers: ['x', 0, 2, 3, 1, 0], category: 'Abierto' },
  "Dm": { name: "Re menor (Dm)", frets: ['x', 'x', 0, 2, 3, 1], fingers: ['x', 'x', 0, 2, 3, 1], category: 'Abierto' },
  "F": { name: "Fa Mayor (F - Cejilla)", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, category: 'Cejilla' },
  "Bm": { name: "Si menor (Bm - Cejilla)", frets: ['x', 2, 4, 4, 3, 2], fingers: ['x', 1, 3, 4, 2, 1], baseFret: 2, category: 'Cejilla' },
  "Bb": { name: "Si bemol (Bb)", frets: ['x', 1, 3, 3, 3, 1], fingers: ['x', 1, 2, 3, 4, 1], baseFret: 1, category: 'Cejilla' },
  "C_barre": { name: "Do Mayor (Cejilla Traste 8)", frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], baseFret: 8, category: 'Cejilla' },
  "G_barre": { name: "Sol Mayor (Cejilla Traste 3)", frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], baseFret: 3, category: 'Cejilla' },
  "Am7": { name: "La menor 7 (Am7)", frets: ['x', 0, 2, 0, 1, 0], fingers: ['x', 0, 2, 0, 1, 0], category: 'Séptima' },
  "Cmaj7": { name: "Do Mayor 7 (Cmaj7)", frets: ['x', 3, 2, 0, 0, 0], fingers: ['x', 3, 2, 0, 0, 0], category: 'Séptima' },
  "Dm7": { name: "Re menor 7 (Dm7)", frets: ['x', 'x', 0, 2, 1, 1], fingers: ['x', 'x', 0, 2, 1, 1], category: 'Séptima' },
  "Em7": { name: "Mi menor 7 (Em7)", frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], category: 'Séptima' },
  "G7": { name: "Sol Dominante 7 (G7)", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], category: 'Séptima' },
  "E5": { name: "Mi Power Chord (E5)", frets: [0, 2, 2, 'x', 'x', 'x'], fingers: [0, 1, 2, 'x', 'x', 'x'], category: 'Power Chord' },
  "A5": { name: "La Power Chord (A5)", frets: ['x', 0, 2, 2, 'x', 'x'], fingers: ['x', 0, 1, 2, 'x', 'x'], category: 'Power Chord' },
  "D5": { name: "Re Power Chord (D5)", frets: ['x', 'x', 0, 2, 3, 'x'], fingers: ['x', 'x', 0, 1, 2, 'x'], category: 'Power Chord' },
  "G5": { name: "Sol Power Chord (G5)", frets: [3, 5, 5, 'x', 'x', 'x'], fingers: [1, 3, 4, 'x', 'x', 'x'], baseFret: 3, category: 'Power Chord' },
  "B5": { name: "Si Power Chord (B5)", frets: ['x', 2, 4, 4, 'x', 'x'], fingers: ['x', 1, 3, 4, 'x', 'x'], baseFret: 2, category: 'Power Chord' },
  "Cmaj7#11": { name: "Do Lidio Extendido (Cmaj7#11)", frets: ['x', 3, 2, 0, 0, 2], fingers: ['x', 3, 2, 0, 0, 1], category: 'Extendido' },
  "Am9": { name: "La menor 9 (Am9)", frets: [5, 7, 5, 5, 5, 7], fingers: [1, 3, 1, 1, 1, 4], baseFret: 5, category: 'Extendido' },
  "D13": { name: "Re Dominante 13 (D13)", frets: ['x', 5, 4, 5, 5, 7], fingers: ['x', 2, 1, 3, 3, 4], baseFret: 4, category: 'Extendido' },
  "Em11": { name: "Mi menor 11 (Em11)", frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 4, 0], category: 'Extendido' },
  "F#m7b5": { name: "Fa# Semidisminuido (F#m7b5)", frets: [2, 'x', 2, 2, 1, 'x'], fingers: [2, 'x', 3, 4, 1, 'x'], baseFret: 2, category: 'Extendido' }
};

export const MODES_LIST = [
  { name: "Jónico (Mayor)", formula: "1 - 2 - 3 - 4 - 5 - 6 - 7", mood: "Brillante, triunfal, alegre", intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: "Dórico", formula: "1 - 2 - b3 - 4 - 5 - 6 - b7", mood: "Melancólico, sofisticado, Jazz/Funk (Carlos Santana)", intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: "Frigio", formula: "1 - b2 - b3 - 4 - 5 - b6 - b7", mood: "Oscuro, exótico, Flamenco y Metal", intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: "Lidio", formula: "1 - 2 - 3 - #4 - 5 - 6 - 7", mood: "Místico, etéreo, cinematográfico (Steve Vai, Joe Satriani)", intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: "Mixolidio", formula: "1 - 2 - 3 - 4 - 5 - 6 - b7", mood: "Bluesy, Rock clásico, dominante (AC/DC, Allman Brothers)", intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: "Eólico (Menor Natural)", formula: "1 - 2 - b3 - 4 - 5 - b6 - b7", mood: "Triste, dramático, baladas épicas", intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: "Locrio", formula: "1 - b2 - b3 - 4 - b5 - b6 - b7", mood: "Tensión extrema, disonante e inestable", intervals: [0, 1, 3, 5, 6, 8, 10] }
];
