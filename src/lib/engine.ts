import {
  ANGLES,
  audienceConcern,
  audienceLabel,
  lengthLabel,
  reasonLabel,
  structureLabel,
  styleLabel,
} from '../data/presets';
import type {
  Brief,
  Draft,
  FeedbackInput,
  LengthId,
  ReceiptRow,
  StructureId,
  StyleId,
} from '../types';
import { charCount, clip } from './text';

type Mode = 'lead' | 'scene' | 'contrast';
type Line = (ctx: Ctx) => string;

type Ctx = {
  topic: string;
  audience: string;
  anchor: string;
  concern: string;
};

const VOICE: Record<StyleId, Record<Mode, [Line, Line]>> = {
  restrained: {
    lead: [
      (ctx) =>
        `「${ctx.topic}」。判断先写在这里：值得推进，但只按写明的范围推进。`,
      (ctx) =>
        `给${ctx.audience}的结论不需要铺垫：「${ctx.topic}」。范围之外的，这篇不承诺。`,
    ],
    scene: [
      (ctx) =>
        `${ctx.audience}多半会在间隙里打开这篇。他们要立刻知道：「${ctx.topic}」，以及自己要不要动作。`,
      (ctx) =>
        `把阅读场景想具体一点。${ctx.audience}只有两分钟，所以先写「${ctx.topic}」现在的状态，再写请求。`,
    ],
    contrast: [
      (ctx) =>
        `一种写法是把这件事写成愿景。这份改成范围说明：「${ctx.topic}」。什么算完成，什么不算，都写在句内。`,
      (ctx) =>
        `含糊版本会让${ctx.audience}自己猜下一步。这份把下一步写成一个动作，事项仍是：「${ctx.topic}」。`,
    ],
  },
  warm: {
    lead: [
      (ctx) =>
        `想直接跟${ctx.audience}说：「${ctx.topic}」。我在意的是你们读完不会觉得被扔下。`,
      (ctx) => `「${ctx.topic}」。这句话我想写得像当面讲，而不是一张通知。`,
    ],
    scene: [
      (ctx) => `你大概刚忙完一件事才点开这篇。所以我不绕：「${ctx.topic}」。`,
      (ctx) =>
        `如果我坐在${ctx.audience}对面，会先说人话：「${ctx.topic}」。后面再补你们可能担心的地方。`,
    ],
    contrast: [
      (ctx) =>
        `正式通告会写「请知悉」。我想换成另一种口气：我们要说的是「${ctx.topic}」，希望你知道自己可以怎样参与。`,
      (ctx) =>
        `冷的版本只交代事实。这份保留事实，但把${ctx.audience}当成会回复的人。事项是：「${ctx.topic}」。`,
    ],
  },
  sharp: {
    lead: [
      (ctx) =>
        `「${ctx.topic}」。如果这句话不能改成一个可反驳的判断，就先别发给${ctx.audience}。`,
      (ctx) => `别用气氛开头。「${ctx.topic}」——成立还是不成立，第一段就要表态。`,
    ],
    scene: [
      (ctx) =>
        `${ctx.audience}已经听过太多次「接下来会优化」。这次只讨论一件事：「${ctx.topic}」。`,
      (ctx) =>
        `想象${ctx.audience}会在第一段提问。那就把问题写在前面：「${ctx.topic}」，到底改变了什么？`,
    ],
    contrast: [
      (ctx) =>
        `套话版本是「我们高度重视」。这份版本只有信息：「${ctx.topic}」。重视不构成信息。`,
      (ctx) =>
        `常见稿会把责任写没。这里把责任留在句子里：围绕「${ctx.topic}」，谁在什么时候前做什么。`,
    ],
  },
  lyrical: {
    lead: [
      (ctx) => `「${ctx.topic}」。先把这句话单独放着，别急着解释。`,
      (ctx) =>
        `有些话要慢一点说。「${ctx.topic}」。说给${ctx.audience}，留一点他们自己走近的空隙。`,
    ],
    scene: [
      (ctx) =>
        `灯还亮着的时候，${ctx.audience}才会把这篇读完。那就从一句安静的话开始：「${ctx.topic}」。`,
      (ctx) =>
        `先写场景，不写口号。一个人面对「${clip(ctx.topic, 28)}」，真正需要的是一句能留下来的话。`,
    ],
    contrast: [
      (ctx) =>
        `把所有理由都写满，句子会变重。这份只留对照：喧闹的说法旁边，放一句「${ctx.topic}」。`,
      (ctx) =>
        `不必说服${ctx.audience}全部同意。先让「${clip(ctx.topic, 24)}」站稳，其余的留白。`,
    ],
  },
  instructional: {
    lead: [
      (ctx) => `目的：让${ctx.audience}读完就知道怎么做。事项：「${ctx.topic}」。`,
      (ctx) => `按说明书来写，不按演讲稿来写。主题：「${ctx.topic}」。读者：${ctx.audience}。`,
    ],
    scene: [
      (ctx) =>
        `${ctx.audience}打开文档时，手边应该就能操作。所以第一步之前，只说明：「${ctx.topic}」。`,
      (ctx) =>
        `从对方已经坐在任务前写起。任务是：「${ctx.topic}」。下面只给步骤和完成标准。`,
    ],
    contrast: [
      (ctx) =>
        `解释性文章会讲很多为什么。这份把为什么挪到最后，正文只回答：围绕「${ctx.topic}」，按什么顺序做。`,
      (ctx) =>
        `观点放前面会打乱操作。这里让${ctx.audience}先看步骤，事项是：「${ctx.topic}」。`,
    ],
  },
  academic: {
    lead: [
      (ctx) =>
        `讨论范围限于：「${ctx.topic}」。预期读者是${ctx.audience}。这里不把推测写成定论。`,
      (ctx) =>
        `问题陈述：「${ctx.topic}」。下文只给出材料能够支撑的说法，并标明限制。`,
    ],
    scene: [
      (ctx) =>
        `进入论述前先固定情境：${ctx.audience}需要判断的是「${ctx.topic}」，而不是一个更宽的口号。`,
      (ctx) =>
        `把使用情境写进问题定义。${ctx.audience}会在决策前读到：「${ctx.topic}」。`,
    ],
    contrast: [
      (ctx) =>
        `宣传文体倾向把「应当」写成「是」。这里拆开：先描述「${ctx.topic}」的范围，再单独写建议。`,
      (ctx) =>
        `强陈述缺少边界。本草案采用弱陈述，写明不适用于哪些情况。核心问题仍是：「${ctx.topic}」。`,
    ],
  },
};

const DEVELOP: Record<StyleId, [Line, Line, Line]> = {
  restrained: [
    (ctx) =>
      `依据只留可核对的部分：读者是${ctx.audience}，时间与范围以这篇写明的为准。做不到的不提前说。`,
    (ctx) =>
      `表述上控制形容词。每个判断尽量配一个边界，例如只覆盖这一次，不包含后续。${ctx.audience}不需要新的口号。`,
    () => '数字和范围能写就写。写不出的，标成待确认，不换成形容词。',
  ],
  warm: [
    () =>
      `你们可能会担心麻烦，也会担心被忽略。这很正常。我会把真正影响到人的地方说具体，而不是用热情把空隙填上。`,
    (ctx) =>
      `如果有不确定的地方，我直接说不确定。${ctx.audience}值得听到老实的版本，包括现在还不知道的部分。`,
    () => '我会把你们接下来可以做的那一步写短，不把态度写长。',
  ],
  sharp: [
    (ctx) =>
      `标准也写清：${ctx.audience}可以用一句话反驳这篇。反驳不了，通常是因为还写得不够具体。`,
    () => `少评价动机，多写行为和后果。动机对读者没有用。`,
    () => '如果一段删掉后信息量不变，这段就不该出现。',
  ],
  lyrical: [
    (ctx) => `细节只取一个，取最能被${ctx.audience}记住的那个。其余的让他们自己补全。`,
    () => `句子短一些，段与段之间留白。解释太多，语气就散了。`,
    () => '能停的地方就停。多出来的解释，会把语气写散。',
  ],
  instructional: [
    (ctx) =>
      `步骤控制在三步以内。每步一个动词。完成标准写成${ctx.audience}可以自行打勾的句子。`,
    () => `常见偏差单独成行，不混进步骤。偏差不是装饰，是防错。`,
    () => '每一步都能被勾掉。勾不掉的句子，改成动作。',
  ],
  academic: [
    (ctx) =>
      `证据不足处写「有待核对」，不补想象中的数据。${ctx.audience}需要的是边界，不是完整感。`,
    () => `概念只用一次定义。后文不再换近义词，以免把范围写漂。`,
    () => '范围写在句内。换一个近义词，并不等于扩大了证据。',
  ],
};

const CLOSE: Record<StyleId, [Line, Line, Line]> = {
  restrained: [
    (ctx) =>
      `因此只请求一件事：请${ctx.audience}确认范围是否成立。确认之前，不扩大承诺。`,
    (ctx) =>
      `下一步写在句内：由${ctx.audience}在明确节点前回复。没有回复，这篇就停留在草案，而不是决定。`,
    (ctx) => `确认范围的人是${ctx.audience}。在这之前，这篇只是草案。`,
  ],
  warm: [
    (ctx) =>
      `如果你愿意，直接回复你的顾虑就好。我们按${ctx.audience}的回复改，不按自己的想象改。`,
    () => `谢谢你读到这里。这篇到此为止，把决定权留在你手上。`,
    () => '你要是觉得哪里别扭，直接圈出来。这篇等你改完才算数。',
  ],
  sharp: [
    () => `到此为止。再往下写，就是在稀释判断。`,
    () => `若做不到上述标准，就删掉相应句子，不要换一种更软的说法留下。`,
    () => '判断已经给出。不同意，就指出哪一句不成立。',
  ],
  lyrical: [
    (ctx) => `最后只留一句给${ctx.audience}：${clip(ctx.topic, 18)}。其余的，让它安静。`,
    () => `可以在这里停。没说完的部分，不一定是缺陷。`,
    (ctx) => `剩下的空白留给${ctx.audience}。不必补满。`,
  ],
  instructional: [
    (ctx) =>
      `做完后核对：${ctx.audience}能否不向作者提问就完成任务。不能，就把缺的那一步补进正文。`,
    () => `停笔规则：步骤、标准、偏差都在，就不要再加开场白。`,
    () => '现在就可以按正文做一遍。卡住的那一步，才是该改的地方。',
  ],
  academic: [
    () => `结论的强度不超过上文。若需更强结论，先补材料，而不是改形容词。`,
    (ctx) => `局限至少一条：本文不外推到${ctx.audience}以外的读者，也不外推到未讨论的场景。`,
    () => '以上陈述只在本文范围内成立。超出部分不推断。',
  ],
};

const TONE_LOCK: Record<StyleId, string> = {
  restrained: '语气锁定为克制：不渲染，不铺陈歉意，不追加新的承诺。',
  warm: '语气锁定为温暖：保留事实，同时承认对方的处境。',
  sharp: '语气锁定为犀利：每段都要有可核对的判断，不用态度词代替信息。',
  lyrical: '语气锁定为留白：删掉解释性的句子，只留能站住的画面和一句判断。',
  instructional: '语气锁定为指令：用动词推进，去掉观点性形容词。',
  academic: '语气锁定为审慎：把「证明」改成「表明」，把「必然」改成「在此范围内」。',
};

function angleLead(structure: StructureId, angleId: string, ctx: Ctx): string {
  switch (`${structure}:${angleId}`) {
    case 'story:morning':
      return `${ctx.audience}会在某个具体时刻读到这篇。就从那个时刻写起。`;
    case 'story:dialogue':
      return `${ctx.audience}可能会先问：「这和我有什么关系？」这一份先回答这句。`;
    case 'story:beforeafter':
      return '先写变化前，再写变化后。中间只放一件事。';
    case 'problem:pain':
      return `先把问题写成${ctx.audience}能对上号的处境，不写成口号。`;
    case 'problem:move':
      return '这一份几乎不解释立场，只写做法。';
    case 'problem:risk':
      return '把「做了会怎样」和「不做会怎样」放在同一段里比较。';
    case 'pyramid:judge':
      return '结论放在第一句，后面不再抬高它。';
    case 'pyramid:evidence':
      return '判断之后只留依据，多出来的背景删去。';
    case 'pyramid:ask':
      return '全文可以有多个事实，但请求只留一个。';
    default:
      return '';
  }
}

function modeOf(angleId: string): Mode {
  if (['scene', 'evidence', 'move', 'dialogue', 'morning'].includes(angleId)) return 'scene';
  if (['contrast', 'ask', 'risk', 'beforeafter'].includes(angleId)) return 'contrast';
  return 'lead';
}

function hasReason(feedback: FeedbackInput | null, id: FeedbackInput['reasons'][number]): boolean {
  return Boolean(feedback?.reasons.includes(id));
}

export function describeAdjustments(feedback: FeedbackInput | null): string[] {
  if (!feedback || (feedback.reasons.length === 0 && !feedback.note.trim())) return [];
  const lines = feedback.reasons.map((id) => {
    const effect = {
      'too-long': '本轮覆盖篇幅，改为短稿',
      'tone-off': '加重所选风格的语气，不擅自更换风格',
      'need-example': '每份草案补一个最小例子',
      'too-generic': '用可核对的事实起笔，并避开套话起手',
      'audience-miss': '点名读者，以及他们此刻关心的事',
      'constraints-missed': '把「必须出现」写进开头和收束',
    }[id];
    return `${reasonLabel(id)}：${effect}`;
  });
  if (feedback.note.trim()) lines.push(`附注已写进正文：${feedback.note.trim()}`);
  return lines;
}

function exampleParagraph(style: StyleId, ctx: Ctx): string {
  const anchor = ctx.anchor;
  switch (style) {
    case 'restrained':
      return `${ctx.audience}若只读第一屏，应能看到判断、一条依据、一个请求。若「${anchor}」不在这三行里，就把它从后文提前。`;
    case 'warm':
      return `与其说「我们会持续改进」，不如说：「${anchor}。如果这让你多了一步，你可以这样绕开。」`;
    case 'sharp':
      return `把「高度重视${anchor}」改成：「${anchor}。负责人写在定稿页，不写在态度里。」`;
    case 'lyrical':
      return `例如只留一个画面：有人把「${anchor}」读出声，发现后半句是多余的，于是删掉。`;
    case 'instructional':
      return `示例：1）写明${anchor}；2）让${ctx.audience}按步骤走一遍；3）走不通的地方改成更小的一步。完成标准：陌生人能独立做完。`;
    case 'academic':
      return `边界示例：这里只处理「${anchor}」这一陈述，不由此推断整体效果。未观察到的情况保持未观察。`;
  }
}

function includeLine(phrases: string[], slot: number, audience: string): string {
  const list = phrases.join('、');
  const options = [
    `这里写明：${list}。`,
    `${audience}需要直接看到的是：${list}。`,
    `收在这句话上：${list}。`,
  ];
  return options[slot % options.length] ?? options[0];
}

function stripForbidden(text: string, forbidden: string[]): string {
  if (forbidden.length === 0) return text;
  const paragraphs = text
    .split('\n\n')
    .map((paragraph) => {
      const sentences = paragraph.split(/(?<=[。！？])/);
      return sentences.filter((sentence) => !forbidden.some((word) => sentence.includes(word))).join('').trim();
    })
    .filter(Boolean);
  return paragraphs.join('\n\n');
}

function ensureIncludes(text: string, phrases: string[]): string {
  let next = text;
  for (const phrase of phrases) {
    if (phrase && !next.includes(phrase)) next += `\n\n需要写明：${phrase}。`;
  }
  return next.trim();
}

export function buildDrafts(
  brief: Brief,
  roundIndex: number,
  feedback: FeedbackInput | null,
): { drafts: Draft[]; adjustments: string[] } {
  const audience = audienceLabel(brief);
  const concern = audienceConcern(brief);
  const topic = brief.topic.trim();
  const anchor = brief.mustInclude[0] || clip(topic, 22);
  const ctx: Ctx = { topic, audience, anchor, concern };
  const effectiveLength: LengthId = hasReason(feedback, 'too-long') ? 'short' : brief.lengthId;
  const adjustments = describeAdjustments(feedback);
  const topicHits = brief.mustAvoid.filter((word) => word && topic.includes(word));
  const forbidden = brief.mustAvoid.filter((word) => word && !topic.includes(word));
  const angles = ANGLES[brief.structureId];

  const drafts = angles.map((angle, index) => {
    const mode = modeOf(angle.id);
    const variant = (roundIndex + index + (feedback?.note.length ?? 0)) % 2;
    const voice = VOICE[brief.styleId][mode][variant](ctx);
    const lead = angleLead(brief.structureId, angle.id, ctx);
    const parts: string[] = [];

    if (hasReason(feedback, 'too-generic')) {
      parts.push(`先写一个能被核对的事实，再写观点。事实锚点是：${anchor}。`);
    }
    if (lead) parts.push(lead);
    parts.push(voice);

    const earlyInclude =
      brief.mustInclude.length > 0 &&
      (mode === 'lead' || hasReason(feedback, 'constraints-missed'));
    if (earlyInclude) parts.push(includeLine(brief.mustInclude, index, audience));

    if (effectiveLength !== 'short') {
      parts.push(DEVELOP[brief.styleId][index % 3](ctx));
    }

    if (brief.mustInclude.length > 0 && !earlyInclude) {
      parts.push(includeLine(brief.mustInclude, index + 1, audience));
    }

    if (hasReason(feedback, 'audience-miss')) {
      parts.push(
        `这篇的读者不是所有人，是${audience}。他们此刻更关心：${concern}。与此无关的背景删去。`,
      );
    }

    if (hasReason(feedback, 'tone-off')) parts.push(TONE_LOCK[brief.styleId]);

    const wantExample = effectiveLength === 'long' || hasReason(feedback, 'need-example');
    if (wantExample) parts.push(exampleParagraph(brief.styleId, ctx));

    if (effectiveLength !== 'short' || hasReason(feedback, 'constraints-missed')) {
      parts.push(CLOSE[brief.styleId][index % 3](ctx));
    }

    if (hasReason(feedback, 'constraints-missed') && brief.mustInclude.length > 0) {
      parts.push(includeLine(brief.mustInclude, index + 2, audience));
    }

    let text = parts.filter(Boolean).join('\n\n');
    text = stripForbidden(text, forbidden);
    text = ensureIncludes(text, brief.mustInclude);
    if (feedback?.note.trim()) {
      text = `${text}\n\n按驳回附注调整：${feedback.note.trim()}。`;
    }
    if (!text.includes(topic)) text = `${topic}。\n\n${text}`;

    const receipt = makeReceipt({
      brief,
      audience,
      angle: angle.name,
      length: effectiveLength,
      overridden: effectiveLength !== brief.lengthId,
      text,
      topicHits,
      feedback,
    });

    return {
      id: `r${roundIndex}-${angle.id}`,
      mark: ['甲', '乙', '丙'][index] ?? String(index + 1),
      angle: angle.name,
      angleHint: angle.hint,
      text,
      charCount: charCount(text),
      receipt,
    } satisfies Draft;
  });

  return { drafts, adjustments };
}

function makeReceipt(input: {
  brief: Brief;
  audience: string;
  angle: string;
  length: LengthId;
  overridden: boolean;
  text: string;
  topicHits: string[];
  feedback: FeedbackInput | null;
}): ReceiptRow[] {
  const includeValue =
    input.brief.mustInclude.length === 0
      ? '未设置'
      : input.brief.mustInclude.every((phrase) => input.text.includes(phrase))
        ? `已写入 ${input.brief.mustInclude.join('、')}`
        : `未全部写入 ${input.brief.mustInclude.join('、')}`;
  const includeState: ReceiptRow['state'] =
    input.brief.mustInclude.length === 0
      ? 'info'
      : input.brief.mustInclude.every((phrase) => input.text.includes(phrase))
        ? 'ok'
        : 'warn';

  let avoidValue = '未设置';
  let avoidState: ReceiptRow['state'] = 'info';
  if (input.brief.mustAvoid.length > 0) {
    const leaked = input.brief.mustAvoid.filter(
      (word) => word && input.text.includes(word) && !input.topicHits.includes(word),
    );
    if (leaked.length > 0) {
      avoidValue = `仍出现 ${leaked.join('、')}`;
      avoidState = 'warn';
    } else if (input.topicHits.length > 0) {
      avoidValue = `主题原文含 ${input.topicHits.join('、')}，正文未再扩散`;
      avoidState = 'warn';
    } else {
      avoidValue = `已避开 ${input.brief.mustAvoid.join('、')}`;
      avoidState = 'ok';
    }
  }

  const rows: ReceiptRow[] = [
    { label: '风格', value: styleLabel(input.brief.styleId), state: 'info' },
    { label: '受众', value: input.audience, state: 'info' },
    { label: '切角', value: input.angle, state: 'info' },
    {
      label: '篇幅',
      value: input.overridden
        ? `${lengthLabel(input.length)}稿 · 本轮因驳回压短`
        : `${lengthLabel(input.brief.lengthId)}稿`,
      state: input.overridden ? 'warn' : 'info',
    },
    { label: '结构', value: structureLabel(input.brief.structureId), state: 'info' },
    { label: '必须出现', value: includeValue, state: includeState },
    { label: '必须避开', value: avoidValue, state: avoidState },
  ];

  if (input.feedback && (input.feedback.reasons.length > 0 || input.feedback.note.trim())) {
    const reasonText = input.feedback.reasons.map((id) => reasonLabel(id)).join('、');
    rows.push({
      label: '响应驳回',
      value: reasonText || '仅附注',
      state: 'ok',
    });
  }
  return rows;
}
