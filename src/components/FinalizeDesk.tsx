import { useState } from 'react';
import type { EditorState } from '../types';
import { charCount, revisionStats } from '../lib/text';
import { Prose } from './Prose';

type Props = {
  editor: EditorState;
  onChange: (text: string) => void;
  onConfirm: () => void;
  onBack: () => void;
};

export function FinalizeDesk({ editor, onChange, onConfirm, onBack }: Props) {
  const [askBack, setAskBack] = useState(false);
  const stats = revisionStats(editor.originalText, editor.text);
  const empty = editor.text.trim() === '';
  const dirty = editor.text.trim() !== editor.originalText.trim();

  function requestBack() {
    if (!dirty) onBack();
    else setAskBack(true);
  }

  return (
    <div className="desk-wrap">
      <div className="section-head">
        <p className="kicker">人工闸门 · 第 {editor.roundIndex} 轮 · 草案{editor.mark}</p>
        <h2>采纳还不是定稿</h2>
        <p className="lede">
          左侧是模型提案，右侧才是你的文字。改到愿意署名，再确认。确认前不能导出，草案也不会被当成成品。
        </p>
      </div>

      <div className="desk">
        <section className="manuscript" aria-label="草案原文">
          <header>
            <h3>草案原文</h3>
            <span>{editor.angle}</span>
          </header>
          <Prose text={editor.originalText} />
        </section>
        <section className="editor" aria-label="你的定稿">
          <header>
            <h3>你的定稿</h3>
            <span>{charCount(editor.text)} 字</span>
          </header>
          <textarea
            value={editor.text}
            aria-label="定稿编辑器"
            onChange={(event) => onChange(event.target.value)}
          />
          <p className="fine">
            {empty
              ? '定稿不能为空。'
              : stats.changed
                ? `相对草案，约增 ${stats.added} 字、删 ${stats.removed} 字。导出以右侧为准。`
                : '尚未改字。你仍需要确认，系统才承认这是定稿。'}
          </p>
        </section>
      </div>

      {askBack ? (
        <div className="callout warn ask">
          <p>返回会丢弃还没确认的修改。</p>
          <div className="row">
            <button type="button" className="btn btn-ghost" onClick={() => setAskBack(false)}>
              继续编辑
            </button>
            <button type="button" className="btn btn-primary" onClick={onBack}>
              仍然返回
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={requestBack}>
            返回三份草案
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="confirm-final"
            disabled={empty}
            onClick={onConfirm}
          >
            确认定稿
          </button>
        </div>
      )}
    </div>
  );
}
