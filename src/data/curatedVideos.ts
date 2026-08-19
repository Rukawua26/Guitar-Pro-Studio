export interface VideoAlternative {
  id: string;
  title: string;
  channel: string;
  language: 'es' | 'en';
  duration: string;
  description: string;
}

export const CURATED_LESSON_VIDEOS: Record<string, VideoAlternative[]> = {
  "1.1": [
    {
      id: "kJvWq6q3sEQ",
      title: "Primera Lección de Guitarra: Postura, D, A y E",
      channel: "JustinGuitar & Marty Music",
      language: "en",
      duration: "12 min",
      description: "La lección más recomendada del mundo para aprender la posición ergonómica, afinación y los primeros 3 acordes."
    },
    {
      id: "mJ9tYp6V7A0",
      title: "Tus Primeros 3 Acordes de Guitarra en Español",
      channel: "GuitarViva",
      language: "es",
      duration: "10 min",
      description: "Explicación detallada en español paso a paso de los acordes Re, La y Mi mayor con ejercicios de transición."
    },
    {
      id: "Wp0g7V3X4hE",
      title: "Cómo Colocar los Dedos y Ejercicio La Araña",
      channel: "Chachi Guitar",
      language: "es",
      duration: "8 min",
      description: "Técnica de digitación, postura de la muñeca y digitación cromática en trastes 5 a 8."
    }
  ],
  "2.1": [
    {
      id: "g4uS1_f1t0g",
      title: "El Rasgueo Universal y Acordes G, C, Em, Am",
      channel: "JustinGuitar",
      language: "en",
      duration: "14 min",
      description: "Mecánica del brazo como péndulo rítmico, rasgueo fantasma y transiciones de acordes."
    },
    {
      id: "8c7TqZ1E_50",
      title: "Aprende a Rasguear al Ritmo Correcto (Español)",
      channel: "GuitarViva",
      language: "es",
      duration: "11 min",
      description: "El patrón universal de rasgueo para tocar el 90% de las canciones de rock y pop."
    },
    {
      id: "o7xY4_w2q1A",
      title: "Tutorial Fácil: Knockin' on Heaven's Door",
      channel: "Marty Music",
      language: "en",
      duration: "9 min",
      description: "Aplicación directa del rasgueo y acordes G, D, Am, C en una canción clásica."
    }
  ],
  "3.1": [
    {
      id: "o5Vp-s-M-mQ",
      title: "Dominando los Acordes de Cejilla y el Sistema CAGED",
      channel: "Paul Davids",
      language: "en",
      duration: "15 min",
      description: "Biomecánica sin tensión, colocación ósea del índice y cómo conectar todo el mástil."
    },
    {
      id: "9m7T_q4P1e2",
      title: "El Secreto para que el Acorde de FA Suene Limpio",
      channel: "GuitarViva",
      language: "es",
      duration: "12 min",
      description: "Elimina los zumbidos y el dolor de muñeca al hacer cejilla en el traste 1."
    },
    {
      id: "1m4Z_t8W3y0",
      title: "El Sistema CAGED Explicado Fácilmente",
      channel: "Chachi Guitar",
      language: "es",
      duration: "13 min",
      description: "Las 5 formas abiertas que te permiten tocar cualquier acorde a lo largo de todo el diapasón."
    }
  ],
  "4.1": [
    {
      id: "V_6Txb_y8_g",
      title: "Mastery de la Escala Pentatónica y Bendings",
      channel: "Paul Davids",
      language: "en",
      duration: "16 min",
      description: "La caja 1 en traste 5, técnica de bending con soporte de 3 dedos y articulaciones expresivas."
    },
    {
      id: "3t8Y_p1M9w0",
      title: "Cómo Solear con la Pentatónica Menor en Español",
      channel: "Chachi Guitar",
      language: "es",
      duration: "14 min",
      description: "Fraseo melódico, ligaduras (hammer-on / pull-off) y notas de resolución."
    },
    {
      id: "5m2K_w8T0q1",
      title: "Solo de Wish You Were Here Paso a Paso",
      channel: "Marty Music",
      language: "en",
      duration: "12 min",
      description: "Estudio del icónico solo acústico de Pink Floyd aplicando la pentatónica de Mi y Sol."
    }
  ],
  "5.1": [
    {
      id: "QkF3oxziUi4",
      title: "Fingerstyle y Técnica Travis Picking",
      channel: "Paul Davids",
      language: "en",
      duration: "15 min",
      description: "Independencia del pulgar en bajos y dedos agudos para arpegios polifónicos."
    },
    {
      id: "7t1M_q8Y3w2",
      title: "Aprende Fingerpicking Acústico Desde Cero",
      channel: "GuitarViva",
      language: "es",
      duration: "13 min",
      description: "Guía completa en español para tocar arpegios con dedos sin púa."
    },
    {
      id: "2m9P_w4T1k0",
      title: "Stairway to Heaven: Intro Acústica Completa",
      channel: "GuitarLessons365",
      language: "en",
      duration: "18 min",
      description: "Desglose compás por compás del clásico fingerstyle de Jimmy Page."
    }
  ],
  "6.1": [
    {
      id: "s4gBchF_y1E",
      title: "Sincronización y Velocidad Extrema de Púa",
      channel: "Bernth",
      language: "en",
      duration: "14 min",
      description: "Pick slanting, economía de movimiento y ejercicios para superar los 130 BPM."
    },
    {
      id: "4e6N3e1Wz_o",
      title: "Por qué Tu Púa Alternada Falla y Cómo Arreglarla",
      channel: "Ben Eller",
      language: "en",
      duration: "16 min",
      description: "Mecánica de escape hacia arriba y hacia abajo al cruzar cuerdas."
    },
    {
      id: "8w1T_m9P4y0",
      title: "Técnica de Púa Alternada a Alta Velocidad",
      channel: "GuitarViva",
      language: "es",
      duration: "12 min",
      description: "Entrenamiento progresivo con metrónomo y palm muting limpio."
    }
  ],
  "7.1": [
    {
      id: "niT2q0ElP4g",
      title: "Sweep Picking y Modos Griegos Avanzados",
      channel: "Learn Waves / LickLibrary",
      language: "en",
      duration: "20 min",
      description: "Barrido continuo de 5 cuerdas, legato y el característico sonido Lidio (#4)."
    },
    {
      id: "Y3_j_z3P7e0",
      title: "Los 7 Modos Griegos Explicados Musicalmente",
      channel: "Paul Davids",
      language: "en",
      duration: "17 min",
      description: "Cómo escuchar y aplicar cada modo para enriquecer tus composiciones y solos."
    },
    {
      id: "9m3E_y1mK4w",
      title: "Sweep Picking: Rutina Diaria de 10 Minutos",
      channel: "Bernth",
      language: "en",
      duration: "11 min",
      description: "Arpegios mayores y menores con muteo sincronizado de ambas manos."
    }
  ]
};
