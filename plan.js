'use strict';

const Plan = (() => {
  const REVISION = 3;
  const RIR = ['', '5+', '5', '4', '3', '2', '1', '0', 'F'];
  const BLOCK_TYPES = ['Main', 'Básico', 'Top set', 'Back off', 'Accesorio', 'Abdominales'];

  const key = (day, id) => day + ':' + id;
  const slots = () => ROUTINE.flatMap((day, index) => day.exercises.map((ex, i) => ({
    id: key(index, ex.id),
    ex,
    base: TRAINING_DAYS[index].exercises[i],
  })));
  const repsText = ex => ex.blocks.map(block => block.reps).join(' / ');

  function safeVideo(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && value.length <= 2048 ? url.href : '';
    } catch {
      return '';
    }
  }

  function validate(input) {
    const available = new Set(slots().map(slot => slot.id));
    if (!input || input.version !== 1 || input.revision !== REVISION || input.athlete !== 'camilo' ||
        !Array.isArray(input.exercises) || input.exercises.length !== available.size) {
      throw Error('Pauta inválida para Camilo.');
    }

    const exercises = input.exercises.map(item => {
      if (!available.delete(item?.id) ||
          !Number.isInteger(item.sets) || item.sets < 1 || item.sets > 8 ||
          typeof item.reps !== 'string' || item.reps.length > 60 ||
          !Array.isArray(item.rir) || item.rir.length !== item.sets || item.rir.some(rir => !RIR.includes(rir)) ||
          typeof item.video !== 'string' || (item.video && !safeVideo(item.video))) {
        throw Error('Revisa los valores RIR y las direcciones de los videos.');
      }
      return { id: item.id, sets: item.sets, reps: item.reps, rir: [...item.rir], video: safeVideo(item.video) };
    });
    return { version: 1, revision: REVISION, athlete: 'camilo', exercises };
  }

  function current() {
    return {
      version: 1, revision: REVISION, athlete: 'camilo',
      exercises: slots().map(({ id, ex }) => ({
        id,
        sets: ex.targetRir.length,
        reps: repsText(ex),
        rir: [...ex.targetRir],
        video: ex.video,
      })),
    };
  }

  function apply(input) {
    const clean = validate(input);
    const byId = new Map(clean.exercises.map(item => [item.id, item]));
    for (const { id, ex, base } of slots()) {
      const item = byId.get(id);
      const [first, backOff] = base.blocks;
      // A pair of rep ranges edits the top set and back off independently.
      // One range applies to both blocks.
      const ranges = backOff ? item.reps.split(/\s*\/\s*/, 2) : [item.reps];
      const firstReps = ranges[0] || 'Por pautar';
      const hasBackOff = backOff && item.sets > 1;
      ex.blocks = [{ type: first.type, sets: hasBackOff ? 1 : item.sets, reps: firstReps }];
      if (hasBackOff) {
        ex.blocks.push({ type: backOff.type, sets: item.sets - 1, reps: ranges[1] || firstReps });
      }
      ex.targetRir = item.rir;
      ex.video = item.video;
    }
    return clean;
  }

  function hasRecord(session) {
    return session.cardioDone || session.cardioSkipped || session.finished ||
      Object.values(session.entries || {}).some(sets => sets.some(set =>
        set && (set.kg !== '' || set.reps !== '' || (set.rir ?? '') !== '' || set.done)));
  }

  const forDay = day => structuredClone(ROUTINE[day]);
  function refreshEmptySessions(state) {
    for (const session of Object.values(state.sessions)) {
      if (session.routineRevision === REVISION && !hasRecord(session)) {
        session.plan = forDay(session.day);
        session.entries = {};
      }
    }
  }

  function upgrade(input) {
    if (input?.revision === REVISION) return validate(input);
    if (input?.athlete !== 'camilo' || input.version !== 1 ||
        ![undefined, 1, 2].includes(input.revision) || !Array.isArray(input.exercises)) {
      throw Error('Pauta anterior inválida.');
    }

    // The new program owns its training dose. Keep coach videos for matching exercises.
    const videos = new Map(input.exercises.map(item => [item?.id, item?.video]));
    const next = current();
    for (const item of next.exercises) {
      const video = videos.get(item.id.split(':')[1]);
      if (typeof video === 'string' && safeVideo(video)) item.video = video;
    }
    return validate(next);
  }

  function encode(plan) {
    const bytes = new TextEncoder().encode(JSON.stringify(validate(plan)));
    return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
      .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  }

  function decode(text) {
    if (text.length > 140000) throw Error('Enlace demasiado largo.');
    const bytes = Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
    return validate(JSON.parse(new TextDecoder().decode(bytes)));
  }

  return { REVISION, RIR, BLOCK_TYPES, key, repsText, safeVideo, validate, current, apply, upgrade,
    forDay, hasRecord, refreshEmptySessions, encode, decode };
})();
