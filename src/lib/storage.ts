import { emptyBrief } from '../data/presets';
import type { AppState } from '../types';

const KEY = 'wsh.session.v1';

export function freshState(): AppState {
  return {
    brief: emptyBrief(),
    phase: 'idle',
    rounds: [],
    editor: null,
    finalDoc: null,
    log: [],
    error: null,
  };
}

function coerce(state: AppState): AppState {
  const next: AppState = { ...state, error: null };
  if (next.phase === 'generating') {
    next.phase = next.rounds.length > 0 ? 'review' : 'idle';
  }
  if (next.phase === 'review' && next.rounds.length === 0) next.phase = 'idle';
  if (next.phase === 'editing' && !next.editor) {
    next.phase = next.rounds.length > 0 ? 'review' : 'idle';
  }
  if (next.phase === 'final' && !next.finalDoc) {
    next.phase = next.rounds.length > 0 ? 'review' : 'idle';
  }
  return next;
}

export function loadState(): AppState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !parsed.brief || !Array.isArray(parsed.rounds) || !Array.isArray(parsed.log)) {
      return freshState();
    }
    return coerce(parsed);
  } catch {
    return freshState();
  }
}

export function saveState(state: AppState): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(coerce(state)));
  } catch {
    // The demo still works if the browser refuses session storage.
  }
}

export function clearState(): void {
  sessionStorage.removeItem(KEY);
}
