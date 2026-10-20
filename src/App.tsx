import { useEffect, useReducer, useRef, useState } from 'react';
import { BriefPanel } from './components/BriefPanel';
import { DecisionLog } from './components/DecisionLog';
import { DraftBoard } from './components/DraftBoard';
import { FinalSheet } from './components/FinalSheet';
import { FinalizeDesk } from './components/FinalizeDesk';
import {
  audienceLabel,
  briefError,
  normalizeBrief,
  reasonLabel,
  sameBrief,
  styleLabel,
} from './data/presets';
import { buildDrafts } from './lib/engine';
import { clearState, loadState, saveState } from './lib/storage';
import { revisionStats } from './lib/text';
import { reducer } from './state';
import type { FeedbackInput, LogItem, LogTone, RoundOrigin } from './types';

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [pending, setPending] = useState('正在按风格组出三份草案');
  const [live, setLive] = useState('');
  const [askReset, setAskReset] = useState(false);
  const stateRef = useRef(state);
  const runId = useRef(0);
  const lock = useRef(false);
  stateRef.current = state;

  useEffect(() => {
    saveState(state);
    document.title = state.phase === 'final' ? '文稿室 · 已定稿' : '文稿室 · 风格可控，定稿在人';
  }, [state]);

  useEffect(() => {
    if (state.phase === 'idle' || window.innerWidth > 980) return;
    document.getElementById('stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state.phase, state.rounds.length]);

  const lastRound = state.rounds[state.rounds.length - 1];
  const dirty = lastRound ? !sameBrief(lastRound.brief, state.brief) : false;
  const locked = state.phase === 'final';
  const busy = state.phase === 'generating';

  async function runGenerate(origin: RoundOrigin, feedback: FeedbackInput | null) {
    if (lock.current) return;
    const current = stateRef.current;
    if (current.phase === 'final' || current.phase === 'editing' || current.phase === 'generating') return;
    const problem = briefError(current.brief);
    if (problem) {
      dispatch({ type: 'fail', error: problem });
      return;
    }

    const id = runId.current + 1;
    runId.current = id;
    lock.current = true;
    const brief = normalizeBrief(current.brief);
    const roundIndex = current.rounds.length + 1;
    const previous = current.rounds[current.rounds.length - 1];
    const briefChanged = previous ? !sameBrief(previous.brief, brief) : false;
    const { drafts, adjustments } = buildDrafts(brief, roundIndex, feedback);
    setPending(
      origin === 'reject'
        ? '正在按驳回意见重写'
        : origin === 'regenerate'
          ? '正在按当前简报重排切角'
          : '正在按风格组出三份草案',
    );
    dispatch({ type: 'generating' });
    setLive('正在本地组稿');

    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800;
    await new Promise((resolve) => window.setTimeout(resolve, delay));
    if (id !== runId.current) {
      lock.current = false;
      return;
    }

    const logItems: LogItem[] = [];
    if (origin === 'reject' && feedback) {
      const reasonText = feedback.reasons.map((reason) => reasonLabel(reason)).join('、');
      const noteText = feedback.note ? `附注：${feedback.note}。` : '';
      const changedText = briefChanged ? '同时采用了更新后的简报。' : '';
      logItems.push(
        makeLog(
          'cinnabar',
          `驳回 · 第 ${roundIndex - 1} 轮`,
          `${reasonText ? `理由：${reasonText}。` : '未选预设理由。'}${noteText}${changedText}`,
        ),
      );
    }
    const angles = drafts.map((draft) => draft.angle).join('、');
    const response = adjustments.length > 0 ? `响应：${adjustments.join('；')}。` : '';
    const regenerated = origin === 'regenerate' ? '按当前简报重新生成，不携带上一轮驳回。' : '';
    logItems.push(
      makeLog(
        'ink',
        `生成 · 第 ${roundIndex} 轮`,
        `风格「${styleLabel(brief.styleId)}」，受众「${audienceLabel(brief)}」。切角：${angles}。${response}${regenerated}`,
      ),
    );

    dispatch({
      type: 'generated',
      logItems,
      round: { index: roundIndex, brief, drafts, feedback, adjustments, origin },
    });
    setLive(`第 ${roundIndex} 轮草案已生成，共 ${drafts.length} 份`);
    lock.current = false;
  }

  function confirmFinal() {
    const editor = stateRef.current.editor;
    if (!editor || editor.text.trim() === '') return;
    const text = editor.text.trim();
    const stats = revisionStats(editor.originalText, text);
    const doc = {
      text,
      roundIndex: editor.roundIndex,
      draftId: editor.draftId,
      mark: editor.mark,
      angle: editor.angle,
      originalText: editor.originalText,
      added: stats.added,
      removed: stats.removed,
      at: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    const revision = stats.changed
      ? `人工修订，约增 ${stats.added} 字、删 ${stats.removed} 字。`
      : '未经改字，但已由人确认。';
    dispatch({
      type: 'confirm',
      doc,
      logItem: makeLog(
        'moss',
        `定稿 · 第 ${editor.roundIndex} 轮草案${editor.mark}`,
        `采纳「${editor.angle}」。${revision}`,
      ),
    });
    setLive('已确认定稿，现在可以导出 Markdown');
    setAskReset(false);
  }

  function reset() {
    runId.current += 1;
    lock.current = false;
    clearState();
    dispatch({ type: 'reset' });
    setAskReset(false);
    setLive('已清空，可以写下一篇');
  }

  return (
    <div className="studio">
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
      <main className="sheet">
        <header className="masthead">
          <div className="brand">
            <p className="brand-en">Writing Style Helper</p>
            <h1>文稿室</h1>
            <p>风格可控的写作助手。草案是提案，定稿权在人。</p>
          </div>
          <div className="mast-side">
            <p className="pill">离线样例 · 无需密钥</p>
            <p className="status">
              {locked ? '已定稿' : lastRound ? `第 ${lastRound.index} 轮` : '未起稿'}
            </p>
            {state.rounds.length > 0 || locked ? (
              askReset ? (
                <div className="reset-ask">
                  <button type="button" className="btn btn-text" onClick={() => setAskReset(false)}>
                    留下
                  </button>
                  <button type="button" className="btn btn-text danger" onClick={reset}>
                    确认清空
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-text" onClick={() => setAskReset(true)}>
                  清空本次
                </button>
              )
            ) : null}
          </div>
        </header>

        <section className="principles" aria-label="产品要点">
          <article>
            <p>壹</p>
            <h2>显式控制</h2>
            <span>受众、风格、篇幅、结构和用词约束，都是参数，不是一句模糊提示。</span>
          </article>
          <article>
            <p>贰</p>
            <h2>多切角草案</h2>
            <span>同一简报给出三份提案，并附参数回执，方便比较控制落在哪里。</span>
          </article>
          <article>
            <p>叁</p>
            <h2>人工闸门</h2>
            <span>可以驳回重写，也可以改完再定稿。没有确认，就不能导出。</span>
          </article>
        </section>

        <div className="layout">
          <BriefPanel
            brief={state.brief}
            busy={busy}
            locked={locked}
            error={state.error}
            hasRounds={state.rounds.length > 0}
            dirty={dirty}
            onChange={(brief) => dispatch({ type: 'set-brief', brief })}
            onSample={(brief) => dispatch({ type: 'set-brief', brief })}
            onSubmit={() =>
              void runGenerate(state.rounds.length > 0 ? 'regenerate' : 'initial', null)
            }
          />

          <section className="stage" id="stage">
            {state.phase === 'idle' ? <EmptyState /> : null}
            {state.phase === 'generating' ? <Generating note={pending} /> : null}
            {state.phase === 'review' && lastRound ? (
              <DraftBoard
                key={lastRound.index}
                round={lastRound}
                onAdopt={(draftId) => {
                  dispatch({ type: 'adopt', draftId });
                  setLive('已进入人工闸门，可以修改后再确认定稿');
                }}
                onReject={(feedback) => void runGenerate('reject', feedback)}
              />
            ) : null}
            {state.phase === 'editing' && state.editor ? (
              <FinalizeDesk
                editor={state.editor}
                onChange={(text) => dispatch({ type: 'edit', text })}
                onConfirm={confirmFinal}
                onBack={() => {
                  dispatch({ type: 'back' });
                  setLive('已返回草案');
                }}
              />
            ) : null}
            {state.phase === 'final' ? <FinalSheet state={state} onReset={reset} /> : null}
            <DecisionLog items={state.log} />
          </section>
        </div>

        <footer>
          <p>草案是提案。导出文件里只有你确认过的文字，以及这份确认是怎么来的。</p>
        </footer>
      </main>
    </div>
  );
}

function makeLog(tone: LogTone, title: string, detail: string): LogItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tone,
    title,
    detail,
  };
}

function EmptyState() {
  return (
    <div className="empty">
      <p className="kicker">还没有草案</p>
      <h2>先写简报，再请出三份切角</h2>
      <p className="lede">
        左侧选定主题、受众和风格。生成之后，你要做两件事里的一件：采纳并改到能署名，或带着理由驳回。
      </p>
      <ol className="steps">
        <li>
          <strong>填写简报</strong>
          <span>也可以直接用「发布说明」示例。</span>
        </li>
        <li>
          <strong>比较草案</strong>
          <span>每份都有参数回执，标明约束落点。</span>
        </li>
        <li>
          <strong>定稿或驳回</strong>
          <span>未确认的文字不能导出。</span>
        </li>
      </ol>
    </div>
  );
}

function Generating({ note }: { note: string }) {
  return (
    <div className="generating" role="status">
      <p className="kicker">离线样例</p>
      <h2>{note}</h2>
      <ol>
        <li>读取主题、受众和风格</li>
        <li>按结构排出三个切角</li>
        <li>核对必须出现与必须避开</li>
      </ol>
      <p className="fine">这一步不调用模型，也不需要 API key。</p>
    </div>
  );
}
