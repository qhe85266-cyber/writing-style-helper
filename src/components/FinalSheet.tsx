import { useMemo, useState } from 'react';
import {
  audienceLabel,
  lengthLabel,
  structureLabel,
  styleLabel,
} from '../data/presets';
import { buildMarkdown, downloadMarkdown, filenameFor } from '../lib/markdown';
import { charCount } from '../lib/text';
import type { AppState } from '../types';
import { Prose } from './Prose';

type Props = {
  state: AppState;
  onReset: () => void;
};

export function FinalSheet({ state, onReset }: Props) {
  const doc = state.finalDoc;
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'fail'>('idle');
  const [askReset, setAskReset] = useState(false);
  const markdown = useMemo(() => (doc ? buildMarkdown(state, doc, state.log) : ''), [doc, state]);
  if (!doc) return null;

  const brief = state.rounds.find((round) => round.index === doc.roundIndex)?.brief ?? state.brief;
  const changed = doc.added > 0 || doc.removed > 0;
  const filename = filenameFor(brief.topic);

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(markdown);
      setCopyState('done');
    } catch {
      setCopyState('fail');
    }
  }

  return (
    <div className="final">
      <div className="final-head">
        <div>
          <p className="kicker">人工闸门已通过</p>
          <h2>这篇已由你定稿</h2>
          <p className="lede">
            导出会使用下面的正文，而不是草案。稿签和决策记录附在文后，用来说明控制项和你的决定。
          </p>
        </div>
        <div className="seal" aria-hidden="true">
          <span>已定稿</span>
        </div>
      </div>

      <article className="manuscript final-body">
        <header>
          <h3>{brief.topic.trim() || '定稿'}</h3>
          <span>{charCount(doc.text)} 字</span>
        </header>
        <Prose text={doc.text} />
      </article>

      <dl className="meta">
        <div>
          <dt>来源</dt>
          <dd>
            第 {doc.roundIndex} 轮 · 草案{doc.mark}「{doc.angle}」
          </dd>
        </div>
        <div>
          <dt>风格 / 受众</dt>
          <dd>
            {styleLabel(brief.styleId)} · {audienceLabel(brief)}
          </dd>
        </div>
        <div>
          <dt>篇幅 / 结构</dt>
          <dd>
            {lengthLabel(brief.lengthId)} · {structureLabel(brief.structureId)}
          </dd>
        </div>
        <div>
          <dt>人工修订</dt>
          <dd>{changed ? `约增 ${doc.added} 字、删 ${doc.removed} 字` : '未改字，但已经你确认'}</dd>
        </div>
      </dl>

      <div className="row">
        <button
          type="button"
          className="btn btn-primary"
          data-testid="export-md"
          onClick={() => downloadMarkdown(filename, markdown)}
        >
          导出 Markdown
        </button>
        <button type="button" className="btn btn-ghost" data-testid="copy-md" onClick={copy}>
          {copyState === 'done' ? '已复制' : '复制 Markdown'}
        </button>
      </div>
      {copyState === 'fail' ? (
        <p className="callout warn">复制被浏览器拦住了。可以下载，或从下方预览里手动复制。</p>
      ) : (
        <p className="fine">文件名：{filename}。正文在前，稿签和决策记录在后。</p>
      )}

      <details className="preview">
        <summary>预览将导出的 Markdown</summary>
        <pre>{markdown}</pre>
      </details>

      {askReset ? (
        <div className="callout ask">
          <p>再写一篇会清掉这次定稿。已经下载的文件不受影响。</p>
          <div className="row">
            <button type="button" className="btn btn-ghost" onClick={() => setAskReset(false)}>
              留下
            </button>
            <button type="button" className="btn btn-primary" onClick={onReset}>
              清空重写
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-text" onClick={() => setAskReset(true)}>
          再写一篇
        </button>
      )}
    </div>
  );
}
