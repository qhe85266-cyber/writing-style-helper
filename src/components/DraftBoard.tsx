import { useState } from 'react';
import { REASONS } from '../data/presets';
import type { FeedbackInput, RejectReasonId, Round } from '../types';
import { clip } from '../lib/text';
import { Prose } from './Prose';

type Props = {
  round: Round;
  onAdopt: (draftId: string) => void;
  onReject: (feedback: FeedbackInput) => void;
};

export function DraftBoard({ round, onAdopt, onReject }: Props) {
  const [reasons, setReasons] = useState<RejectReasonId[]>([]);
  const [note, setNote] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const originLabel = {
    initial: '初次生成',
    regenerate: '按简报重排',
    reject: '驳回后重写',
  }[round.origin];

  function toggle(id: RejectReasonId) {
    setRejectError(null);
    setReasons((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function submitReject() {
    if (reasons.length === 0 && note.trim() === '') {
      setRejectError('请至少选一个理由，或写一句附注。驳回要能被下一轮执行。');
      return;
    }
    onReject({ reasons, note: note.trim() });
  }

  return (
    <div className="board">
      <div className="section-head">
        <p className="kicker">
          第 {round.index} 轮 · {originLabel}
        </p>
        <h2>三份草案，都还不是成品</h2>
        <p className="lede">
          同一份简报，三个切角。采纳会进入人工闸门，你可以改字；确认之前不能导出。驳回则要留下可执行的理由。
        </p>
      </div>

      {round.adjustments.length > 0 ? (
        <div className="adjustments">
          <h3>本轮如何响应驳回</h3>
          <ul>
            {round.adjustments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="jump" role="list">
        {round.drafts.map((draft) => {
          const first = draft.text.split('。')[0] ?? draft.text;
          return (
            <button
              key={draft.id}
              type="button"
              onClick={() =>
                document.getElementById(`draft-${draft.id}`)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            >
              <strong>
                {draft.mark} · {draft.angle}
              </strong>
              <span>{clip(first, 32)}</span>
            </button>
          );
        })}
      </div>

      <div className="drafts">
        {round.drafts.map((draft) => (
          <article key={draft.id} id={`draft-${draft.id}`} className="draft" data-mark={draft.mark}>
            <header className="draft-head">
              <span className="mark">{draft.mark}</span>
              <div>
                <h3>{draft.angle}</h3>
                <p>{draft.angleHint}</p>
              </div>
              <span className="chars">{draft.charCount} 字</span>
            </header>
            <Prose text={draft.text} />
            <dl className="receipt">
              {draft.receipt.map((row) => (
                <div key={row.label} data-state={row.state}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              className="btn btn-primary"
              data-testid="adopt"
              onClick={() => onAdopt(draft.id)}
            >
              采纳定稿
            </button>
          </article>
        ))}
      </div>

      <section className="reject" aria-label="驳回重写">
        <div className="section-head">
          <p className="kicker">人工闸门</p>
          <h2>驳回，要求重写</h2>
          <p className="lede">
            驳回不是刷新。理由会记入决策记录，并改写下一轮的篇幅、例子、受众或约束落点。风格仍以左侧预设为准，系统不替你换口味。
          </p>
        </div>
        <div className="choice-grid">
          {REASONS.map((reason) => (
            <button
              key={reason.id}
              type="button"
              className="choice"
              aria-pressed={reasons.includes(reason.id)}
              onClick={() => toggle(reason.id)}
            >
              {reason.label}
              <small>{reason.effect}</small>
            </button>
          ))}
        </div>
        <label className="field">
          <span>附注</span>
          <textarea
            value={note}
            maxLength={120}
            placeholder="可选。例如：少一点安抚，直接说导出失败了。"
            onChange={(event) => {
              setNote(event.target.value);
              setRejectError(null);
            }}
          />
        </label>
        {rejectError ? <p className="callout warn">{rejectError}</p> : null}
        <button type="button" className="btn btn-ghost" data-testid="reject" onClick={submitReject}>
          驳回重写
        </button>
      </section>
    </div>
  );
}
