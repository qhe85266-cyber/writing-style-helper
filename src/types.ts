export type StyleId =
  | 'restrained'
  | 'warm'
  | 'sharp'
  | 'lyrical'
  | 'instructional'
  | 'academic';

export type LengthId = 'short' | 'medium' | 'long';

export type StructureId = 'free' | 'pyramid' | 'problem' | 'story';

export type AudienceId =
  | 'colleagues'
  | 'users'
  | 'investors'
  | 'engineers'
  | 'customers'
  | 'executives'
  | 'custom';

export type RejectReasonId =
  | 'too-long'
  | 'tone-off'
  | 'need-example'
  | 'too-generic'
  | 'audience-miss'
  | 'constraints-missed';

export type Brief = {
  topic: string;
  audienceId: AudienceId;
  audienceCustom: string;
  styleId: StyleId;
  lengthId: LengthId;
  structureId: StructureId;
  mustInclude: string[];
  mustAvoid: string[];
};

export type ReceiptState = 'ok' | 'warn' | 'info';

export type ReceiptRow = {
  label: string;
  value: string;
  state: ReceiptState;
};

export type Draft = {
  id: string;
  mark: string;
  angle: string;
  angleHint: string;
  text: string;
  charCount: number;
  receipt: ReceiptRow[];
};

export type FeedbackInput = {
  reasons: RejectReasonId[];
  note: string;
};

export type RoundOrigin = 'initial' | 'regenerate' | 'reject';

export type Round = {
  index: number;
  brief: Brief;
  drafts: Draft[];
  feedback: FeedbackInput | null;
  adjustments: string[];
  origin: RoundOrigin;
};

export type EditorState = {
  roundIndex: number;
  draftId: string;
  mark: string;
  angle: string;
  originalText: string;
  text: string;
};

export type FinalDoc = {
  text: string;
  roundIndex: number;
  draftId: string;
  mark: string;
  angle: string;
  originalText: string;
  added: number;
  removed: number;
  at: string;
};

export type LogTone = 'ink' | 'cinnabar' | 'moss';

export type LogItem = {
  id: string;
  tone: LogTone;
  title: string;
  detail: string;
};

export type Phase = 'idle' | 'generating' | 'review' | 'editing' | 'final';

export type AppState = {
  brief: Brief;
  phase: Phase;
  rounds: Round[];
  editor: EditorState | null;
  finalDoc: FinalDoc | null;
  log: LogItem[];
  error: string | null;
};
