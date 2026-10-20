import {
  audienceLabel,
  lengthLabel,
  structureLabel,
  styleLabel,
} from '../data/presets';
import type { AppState, FinalDoc, LogItem } from '../types';
import { clip } from './text';

function list(items: string[]): string {
  return items.length > 0 ? items.join('、') : '无';
}

export function buildMarkdown(state: AppState, doc: FinalDoc, log: LogItem[]): string {
  const brief = state.rounds.find((round) => round.index === doc.roundIndex)?.brief ?? state.brief;
  const changed = doc.added > 0 || doc.removed > 0;
  const revision = changed
    ? `有人工修订（相对草案约增 ${doc.added} 字、删 ${doc.removed} 字）`
    : '未经改字，与所采纳草案一致';
  const lines = [
    `# ${clip(brief.topic, 32) || '定稿'}`,
    '',
    doc.text.trim(),
    '',
    '---',
    '',
    '> 定稿权在人。此文件只在确认定稿后生成。离线样例不调用模型，正文以你确认的文字为准。',
    '',
    '## 稿签',
    '',
    `- 产品：文稿室（Writing Style Helper）`,
    `- 模式：离线样例`,
    `- 主题：${brief.topic.trim() || '未填写'}`,
    `- 受众：${audienceLabel(brief)}`,
    `- 风格：${styleLabel(brief.styleId)}`,
    `- 篇幅：${lengthLabel(brief.lengthId)}`,
    `- 结构：${structureLabel(brief.structureId)}`,
    `- 必须出现：${list(brief.mustInclude)}`,
    `- 必须避开：${list(brief.mustAvoid)}`,
    `- 来源：第 ${doc.roundIndex} 轮 · 草案${doc.mark}「${doc.angle}」`,
    `- 人工修订：${revision}`,
    `- 定稿时间：${doc.at}`,
    '',
    '## 决策记录',
    '',
    ...log.map((item, index) => `${index + 1}. ${item.title}。${item.detail}`),
    '',
  ];
  return lines.join('\n');
}

export function filenameFor(topic: string): string {
  const base =
    [...topic.trim()]
      .slice(0, 16)
      .join('')
      .replace(/[\\/:*?"<>|\n\r]/g, '')
      .trim() || '未命名';
  return `文稿室-定稿-${base}.md`;
}

export function downloadMarkdown(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
