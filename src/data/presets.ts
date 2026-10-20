import type {
  AudienceId,
  Brief,
  LengthId,
  RejectReasonId,
  StructureId,
  StyleId,
} from '../types';

export type AudienceOption = { id: AudienceId; label: string; concern: string };
export type StyleOption = { id: StyleId; label: string; voice: string };
export type LengthOption = { id: LengthId; label: string; hint: string };
export type StructureOption = { id: StructureId; label: string; hint: string };
export type ReasonOption = { id: RejectReasonId; label: string; effect: string };

export const AUDIENCES: AudienceOption[] = [
  { id: 'colleagues', label: '产品同事', concern: '范围、依赖和怎么验收' },
  { id: 'users', label: '终端用户', concern: '要做什么，以及会不会更麻烦' },
  { id: 'investors', label: '投资人', concern: '进展、风险和下一步' },
  { id: 'engineers', label: '技术读者', concern: '机制、取舍和边界' },
  { id: 'customers', label: '企业客户', concern: '影响、责任和补救' },
  { id: 'executives', label: '内部管理层', concern: '决策、资源和时间' },
  { id: 'custom', label: '自定义', concern: '对方的处境，以及希望他们做的下一步' },
];

export const STYLES: StyleOption[] = [
  { id: 'restrained', label: '克制专业', voice: '先给判断，再给边界' },
  { id: 'warm', label: '温暖口语', voice: '像对人说话，不端着' },
  { id: 'sharp', label: '犀利评论', voice: '可反驳，不刻薄' },
  { id: 'lyrical', label: '诗意留白', voice: '少解释，留一句' },
  { id: 'instructional', label: '清晰指令', voice: '读完就能照做' },
  { id: 'academic', label: '学术审慎', voice: '标明证据边界' },
];

export const LENGTHS: LengthOption[] = [
  { id: 'short', label: '短', hint: '两段，适合先读结论' },
  { id: 'medium', label: '中', hint: '三段，判断加依据' },
  { id: 'long', label: '长', hint: '含一个最小例子' },
];

export const STRUCTURES: StructureOption[] = [
  { id: 'free', label: '不限', hint: '三份自由切角' },
  { id: 'pyramid', label: '结论先行', hint: '判断、依据、请求' },
  { id: 'problem', label: '问题—做法', hint: '问题、做法、风险' },
  { id: 'story', label: '场景开场', hint: '时刻、对白、前后' },
];

export const REASONS: ReasonOption[] = [
  { id: 'too-long', label: '篇幅过长', effect: '本轮覆盖篇幅，改为短稿' },
  { id: 'tone-off', label: '语气偏离', effect: '加重所选风格的语气，不擅自换风格' },
  { id: 'need-example', label: '缺少例子', effect: '每份草案补一个最小例子' },
  { id: 'too-generic', label: '太像套话', effect: '用可核对的事实起笔，避开套话起手' },
  { id: 'audience-miss', label: '没对准受众', effect: '点名读者，以及他们此刻关心的事' },
  {
    id: 'constraints-missed',
    label: '约束没落到实处',
    effect: '把「必须出现」写进开头和收束',
  },
];

export type AngleDef = { id: string; name: string; hint: string };

export const ANGLES: Record<StructureId, AngleDef[]> = {
  free: [
    { id: 'lead', name: '结论先行', hint: '第一句就给判断' },
    { id: 'scene', name: '场景切入', hint: '从对方的阅读情境写起' },
    { id: 'contrast', name: '对照说明', hint: '用常见写法和这次的写法对照' },
  ],
  pyramid: [
    { id: 'judge', name: '判断打头', hint: '结论压在第一段' },
    { id: 'evidence', name: '依据收拢', hint: '判断之后只留依据' },
    { id: 'ask', name: '请求单一', hint: '收在一个明确请求上' },
  ],
  problem: [
    { id: 'pain', name: '问题写实', hint: '先写清问题，不写口号' },
    { id: 'move', name: '做法具体', hint: '中间只写做法' },
    { id: 'risk', name: '风险并陈', hint: '把做与不做放在一起' },
  ],
  story: [
    { id: 'morning', name: '一个瞬间', hint: '用一个具体时刻开场' },
    { id: 'dialogue', name: '一段对白', hint: '用对方可能问的一句话开场' },
    { id: 'beforeafter', name: '前后对照', hint: '从变化前后写起' },
  ],
};

export const MARKS = ['甲', '乙', '丙'] as const;

export type Sample = { id: string; name: string; blurb: string; brief: Brief };

export const SAMPLES: Sample[] = [
  {
    id: 'launch',
    name: '发布说明',
    blurb: '写给用户，温暖，避开套话',
    brief: {
      topic: '向独立开发者介绍文稿室：先按风格给出草案，再由人编辑并确认定稿',
      audienceId: 'users',
      audienceCustom: '',
      styleId: 'warm',
      lengthId: 'medium',
      structureId: 'story',
      mustInclude: ['人有最终决定权'],
      mustAvoid: ['颠覆', '赋能'],
    },
  },
  {
    id: 'investor',
    name: '投资人周报',
    blurb: '短、克制、结论先行',
    brief: {
      topic: '本周做出了写作助手的可用原型，重点是风格预设和人工定稿闸门',
      audienceId: 'investors',
      audienceCustom: '',
      styleId: 'restrained',
      lengthId: 'short',
      structureId: 'pyramid',
      mustInclude: ['人工定稿闸门'],
      mustAvoid: ['颠覆'],
    },
  },
  {
    id: 'incident',
    name: '事故说明',
    blurb: '对企业客户，把责任写清',
    brief: {
      topic: '向企业客户说明昨晚导出曾短暂失败，已定稿的文本没有丢失',
      audienceId: 'customers',
      audienceCustom: '',
      styleId: 'restrained',
      lengthId: 'medium',
      structureId: 'problem',
      mustInclude: ['已定稿的文本没有丢失'],
      mustAvoid: ['绝对', '永远'],
    },
  },
  {
    id: 'essay',
    name: '技术导语',
    blurb: '犀利，讨论显式参数',
    brief: {
      topic: '为什么可控生成要把风格做成显式参数，而不是一句模糊的提示词',
      audienceId: 'engineers',
      audienceCustom: '',
      styleId: 'sharp',
      lengthId: 'medium',
      structureId: 'free',
      mustInclude: ['显式参数'],
      mustAvoid: ['黑魔法'],
    },
  },
];

export const emptyBrief = (): Brief => ({
  topic: '',
  audienceId: 'users',
  audienceCustom: '',
  styleId: 'restrained',
  lengthId: 'medium',
  structureId: 'free',
  mustInclude: [],
  mustAvoid: [],
});

export function audienceLabel(brief: Brief): string {
  if (brief.audienceId === 'custom') {
    const custom = brief.audienceCustom.trim();
    return custom || '未填写受众';
  }
  return AUDIENCES.find((item) => item.id === brief.audienceId)?.label ?? '读者';
}

export function audienceConcern(brief: Brief): string {
  return AUDIENCES.find((item) => item.id === brief.audienceId)?.concern ?? '下一步';
}

export function styleLabel(id: StyleId): string {
  return STYLES.find((item) => item.id === id)?.label ?? id;
}

export function lengthLabel(id: LengthId): string {
  return LENGTHS.find((item) => item.id === id)?.label ?? id;
}

export function structureLabel(id: StructureId): string {
  return STRUCTURES.find((item) => item.id === id)?.label ?? id;
}

export function reasonLabel(id: RejectReasonId): string {
  return REASONS.find((item) => item.id === id)?.label ?? id;
}

export function normalizeBrief(brief: Brief): Brief {
  return {
    ...brief,
    topic: brief.topic.trim(),
    audienceCustom: brief.audienceCustom.trim(),
    mustInclude: brief.mustInclude.map((tag) => tag.trim()).filter(Boolean),
    mustAvoid: brief.mustAvoid.map((tag) => tag.trim()).filter(Boolean),
  };
}

export function sameBrief(a: Brief, b: Brief): boolean {
  const left = normalizeBrief(a);
  const right = normalizeBrief(b);
  return JSON.stringify(left) === JSON.stringify(right);
}

export function briefError(brief: Brief): string | null {
  const topic = brief.topic.trim();
  if ([...topic].length < 4) return '主题至少写 4 个字，草案才有东西可响应。';
  if (brief.audienceId === 'custom' && brief.audienceCustom.trim().length < 2) {
    return '选了自定义受众，请写上对方是谁。';
  }
  return null;
}
