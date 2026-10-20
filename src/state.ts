import type { AppState, Draft, FinalDoc, LogItem, Round } from './types';
import { freshState } from './lib/storage';

export type Action =
  | { type: 'set-brief'; brief: AppState['brief'] }
  | { type: 'generating' }
  | { type: 'generated'; round: Round; logItems: LogItem[] }
  | { type: 'fail'; error: string }
  | { type: 'adopt'; draftId: string }
  | { type: 'edit'; text: string }
  | { type: 'back' }
  | { type: 'confirm'; doc: FinalDoc; logItem: LogItem }
  | { type: 'reset' };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'set-brief':
      if (state.phase === 'final') return state;
      return { ...state, brief: action.brief, error: null };
    case 'generating':
      return { ...state, phase: 'generating', error: null };
    case 'generated':
      return {
        ...state,
        brief: action.round.brief,
        phase: 'review',
        rounds: [...state.rounds, action.round],
        editor: null,
        finalDoc: null,
        error: null,
        log: [...state.log, ...action.logItems],
      };
    case 'fail':
      return { ...state, error: action.error, phase: state.rounds.length > 0 ? 'review' : 'idle' };
    case 'adopt': {
      const round = state.rounds[state.rounds.length - 1];
      const draft = round?.drafts.find((item) => item.id === action.draftId);
      if (!round || !draft) return state;
      return { ...state, phase: 'editing', error: null, editor: toEditor(round.index, draft) };
    }
    case 'edit':
      if (!state.editor) return state;
      return { ...state, editor: { ...state.editor, text: action.text } };
    case 'back':
      return { ...state, phase: 'review', editor: null, error: null };
    case 'confirm':
      return {
        ...state,
        phase: 'final',
        editor: null,
        finalDoc: action.doc,
        error: null,
        log: [...state.log, action.logItem],
      };
    case 'reset':
      return freshState();
    default:
      return state;
  }
}

function toEditor(roundIndex: number, draft: Draft): NonNullable<AppState['editor']> {
  return {
    roundIndex,
    draftId: draft.id,
    mark: draft.mark,
    angle: draft.angle,
    originalText: draft.text,
    text: draft.text,
  };
}
