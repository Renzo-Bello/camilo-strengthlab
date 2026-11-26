'use strict';

const CARDIO_MINUTES = 20;

// Each occurrence gets its own set prescription. Exercise IDs link load history across days.
function exercise(id, name, blocks, options = {}) {
  const { image = '', note = '', body = false } = options;
  return {
    id, name, image, note, body, video: '',
    blocks: blocks.map(({ type, sets, reps }) => ({ type, sets, reps })),
    targetRir: blocks.flatMap(({ sets, rir }) => Array(sets).fill(rir)),
  };
}

const topAndBackOff = (topReps, backOffReps) => [
  { type: 'Top set', sets: 1, reps: topReps, rir: '2' },
  { type: 'Back off', sets: 2, reps: backOffReps, rir: '3' },
];
const basic = (sets, reps) => [{ type: 'Básico', sets, reps, rir: '2' }];
const accessory = (sets, reps) => [{ type: 'Accesorio', sets, reps, rir: '2' }];
const abs = (reps) => [{ type: 'Abdominales', sets: 2, reps, rir: '2' }];

const bench = (topReps) => exercise('press-banca', 'Press banca con barra', topAndBackOff(topReps, '10–12'), {
  note: 'Referencia previa: 60 kg × 12. Elige la carga del día con RIR 2 y bájala en los back off para dejar unas 3 repeticiones en reserva.',
});
const hipThrust = () => exercise('hip-thrust', 'Hip thrust', basic(3, '12'), {
  note: 'Referencia previa: 120 kg × 12. Haz una pausa breve arriba con la pelvis estable.',
});
const legCurl = (sets) => exercise('leg-curl', 'Curl femoral', accessory(sets, '10–15'), {
  image: 'assets/ai-leg-curl.jpg',
  note: 'Ajusta la máquina y registra tu carga inicial cuando completes el rango con el RIR pautado.',
});
const legExtension = () => exercise('leg-extension', 'Extensión de piernas', accessory(3, '12'), {
  image: 'assets/ai-leg-extension.jpg',
  note: 'Referencia previa: 126 kg × 12 en tu máquina. Controla la bajada durante 2–3 segundos.',
});
const calves = () => exercise('gemelos-maquina', 'Elevación de gemelos en máquina', accessory(2, '12–15'), {
  note: 'Carga previa por confirmar. Anota los kg reales que permitan completar el rango con el RIR pautado. Pausa abajo y sube sin rebote.',
});
const peck = (sets) => exercise('peck', 'Pec deck', accessory(sets, '12–15'), {
  image: 'assets/ai-peck.jpg',
});
const biceps = (sets) => exercise('curl-polea', 'Curl de bíceps en polea', accessory(sets, '12'), {
  note: 'Referencia previa: 54 kg × 12 en tu polea. Mantén los codos estables.',
});
const triceps = (sets) => exercise('triceps-polea', 'Extensión de tríceps en polea', accessory(sets, '10–15'), {
  note: 'Carga anterior por confirmar: unos 64 kg. Anota el peso real y mantén los codos cerca del cuerpo.',
});
const reverseCrunch = () => exercise('crunch-inverso', 'Crunch inverso', abs('10–15'), {
  body: true, note: 'Eleva la pelvis sin balancear las piernas.',
});
const crunch = () => exercise('crunch-suelo', 'Crunch en suelo', abs('12–15'), {
  body: true, note: 'Acerca las costillas a la pelvis sin tirar del cuello.',
});

const TRAINING_DAYS = [
  {
    name: 'Piernas A',
    subtitle: 'Sentadilla pendular, glúteos y abdominales',
    cardioMinutes: CARDIO_MINUTES,
    exercises: [
      exercise('sentadilla-pendular', 'Sentadilla pendular', topAndBackOff('8–12', '10–12'), {
        note: 'Referencia previa: 80 kg × 12. Tras el top set, reduce la carga para cumplir las repeticiones con RIR 3.',
      }),
      hipThrust(),
      legCurl(3),
      legExtension(),
      calves(),
      exercise('abduccion-cadera', 'Abducción de cadera en máquina', accessory(2, '12–20'), {
        note: 'Abre las rodillas con control y mantén estable la pelvis.',
      }),
      reverseCrunch(),
    ],
  },
  {
    name: 'Torso A',
    subtitle: 'Pecho, brazos, remo y abdominales',
    cardioMinutes: CARDIO_MINUTES,
    exercises: [
      bench('8–10'),
      exercise('remo-polea-baja', 'Remo sentado en polea baja', basic(3, '8–12'), {
        note: 'Lleva los codos hacia atrás sin balancear el torso.',
      }),
      peck(3),
      biceps(3),
      triceps(3),
      crunch(),
    ],
  },
  {
    name: 'Piernas B',
    subtitle: 'Sentadilla libre, glúteos y abdominales',
    cardioMinutes: CARDIO_MINUTES,
    exercises: [
      exercise('sentadilla-libre', 'Sentadilla libre con barra', topAndBackOff('8–10', '10–12'), {
        note: 'Referencia previa: 125 kg × 12. Haz las series de aproximación y ajusta la carga del día según el RIR y la técnica.',
      }),
      hipThrust(),
      legCurl(2),
      legExtension(),
      calves(),
      exercise('aductores', 'Aducción de cadera en máquina', accessory(2, '12–20'), {
        image: 'assets/ai-aductores.jpg',
        note: 'Cierra las piernas de forma controlada y mantén la espalda apoyada.',
      }),
      reverseCrunch(),
    ],
  },
  {
    name: 'Torso B',
    subtitle: 'Pecho, brazos, jalón, remo al pecho y abdominales',
    cardioMinutes: CARDIO_MINUTES,
    exercises: [
      bench('8–12'),
      exercise('jalon', 'Jalón al pecho en polea alta', basic(3, '8–12'), {
        image: 'assets/ai-jalon.jpg',
        note: 'Baja el agarre hacia la parte alta del pecho con el torso estable.',
      }),
      exercise('remo-al-pecho', 'Remo al pecho en polea', basic(2, '10–12'), {
        note: 'Lleva el agarre a la parte alta del pecho con los codos abiertos y los hombros lejos de las orejas.',
      }),
      peck(2),
      biceps(2),
      triceps(2),
      crunch(),
    ],
  },
];

const ROUTINE = structuredClone(TRAINING_DAYS);
