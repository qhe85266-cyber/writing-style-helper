import { useId, useState } from 'react';
import { flushSync } from 'react-dom';
import { AUDIENCES, LENGTHS, SAMPLES, STRUCTURES, STYLES, sameBrief } from '../data/presets';
import type { Brief, LengthId, StructureId, StyleId } from '../types';

type Props = {
  brief: Brief;
  busy: boolean;
  locked: boolean;
  error: string | null;
  hasRounds: boolean;
  dirty: boolean;
  onChange: (brief: Brief) => void;
  onSample: (brief: Brief) => void;
  onSubmit: () => void;
};

export function BriefPanel({
  brief,
  busy,
  locked,
  error,
  hasRounds,
  dirty,
  onChange,
  onSample,
  onSubmit,
}: Props) {
  const disabled = busy || locked;
  const topicCount = [...brief.topic].length;
  const topicHits = brief.mustAvoid.filter((word) => word && brief.topic.includes(word));
  let submitLabel = '生成三份草案';
  if (hasRounds && dirty) submitLabel = '用新简报再生成一轮';
  else if (hasRounds) submitLabel = '按当前简报再生成一轮';

  return (
    <form
      className="brief"
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled) onSubmit();
      }}
    >
      <div className="section-head">
        <p className="kicker">写作简报</p>
        <h2>先把控制项说清</h2>
      </div>

      <div className="samples" role="group" aria-label="示例简报">
        {SAMPLES.map((sample) => {
          const selected = sameBrief(sample.brief, brief);
          return (
            <button
              key={sample.id}
              type="button"
              className="sample"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onSample(sample.brief)}
            >
              <span>{sample.name}</span>
              <small>{sample.blurb}</small>
            </button>
          );
        })}
      </div>

      <label className="field">
        <span>主题</span>
        <textarea
          value={brief.topic}
          maxLength={180}
          disabled={disabled}
          placeholder="例如：向企业客户说明昨晚导出失败，但已定稿的文本没有丢失"
          onChange={(event) => onChange({ ...brief, topic: event.target.value })}
        />
        <small className="count">
          {topicCount}/180
          {topicCount > 0 && topicCount < 4 ? ' · 至少 4 个字' : ''}
        </small>
      </label>

      <fieldset disabled={disabled}>
        <legend>受众</legend>
        <div className="choice-grid">
          {AUDIENCES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="choice"
              aria-pressed={brief.audienceId === item.id}
              onClick={() => onChange({ ...brief, audienceId: item.id })}
            >
              {item.label}
            </button>
          ))}
        </div>
        {brief.audienceId === 'custom' ? (
          <input
            value={brief.audienceCustom}
            maxLength={24}
            placeholder="对方是谁"
            onChange={(event) => onChange({ ...brief, audienceCustom: event.target.value })}
          />
        ) : (
          <small className="field-hint">
            {AUDIENCES.find((item) => item.id === brief.audienceId)?.concern}
          </small>
        )}
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>风格预设</legend>
        <div className="style-grid">
          {STYLES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="style-tile"
              aria-pressed={brief.styleId === item.id}
              onClick={() => onChange({ ...brief, styleId: item.id as StyleId })}
            >
              <strong>{item.label}</strong>
              <small>{item.voice}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>篇幅</legend>
        <div className="choice-grid cols-3">
          {LENGTHS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="choice"
              aria-pressed={brief.lengthId === item.id}
              onClick={() => onChange({ ...brief, lengthId: item.id as LengthId })}
            >
              {item.label}
              <small>{item.hint}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>结构</legend>
        <div className="choice-grid cols-2">
          {STRUCTURES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="choice"
              aria-pressed={brief.structureId === item.id}
              onClick={() => onChange({ ...brief, structureId: item.id as StructureId })}
            >
              {item.label}
              <small>{item.hint}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <TagField
        label="必须出现"
        hint="写进正文的原词。回车或顿号确认。"
        placeholder="例如：人有最终决定权"
        tags={brief.mustInclude}
        disabled={disabled}
        onChange={(mustInclude) => onChange({ ...brief, mustInclude })}
      />
      <TagField
        label="必须避开"
        hint="生成句会去掉这些词。若主题原文里就有，定稿时由你决定。"
        placeholder="例如：赋能"
        tags={brief.mustAvoid}
        disabled={disabled}
        onChange={(mustAvoid) => onChange({ ...brief, mustAvoid })}
      />

      {topicHits.length > 0 ? (
        <p className="callout warn">
          主题里含有要避开的「{topicHits.join('、')}」。草案会保留主题原文，并在参数回执里提醒你定稿时处理。
        </p>
      ) : null}

      {locked ? (
        <p className="callout">定稿已锁定。要改简报，请先清空本次，再写一篇。</p>
      ) : null}
      {error ? <p className="callout warn">{error}</p> : null}
      {!locked && hasRounds && dirty ? (
        <p className="callout">简报已改。右侧草案仍按上一版参数生成。</p>
      ) : null}

      <div className="submit-bar">
        <button className="btn btn-primary" type="submit" disabled={disabled} data-testid="generate">
          {busy ? '正在组稿…' : submitLabel}
        </button>
        <p className="fine">生成在本地完成，不上传简报。</p>
      </div>
    </form>
  );
}

function TagField({
  label,
  hint,
  placeholder,
  tags,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  placeholder: string;
  tags: string[];
  disabled: boolean;
  onChange: (tags: string[]) => void;
}) {
  const labelId = useId();
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const pieces = raw
      .split(/[、,，]/)
      .map((piece) => piece.trim())
      .filter(Boolean);
    if (pieces.length === 0) return;
    const next = [...tags];
    for (const piece of pieces) {
      const clipped = [...piece].slice(0, 24).join('');
      if (!clipped || next.includes(clipped) || next.length >= 6) continue;
      next.push(clipped);
    }
    onChange(next);
    setDraft('');
  }

  return (
    <div className="field">
      <span id={labelId}>{label}</span>
      <span className="tags">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="tag"
            disabled={disabled}
            aria-label={`移除${tag}`}
            onClick={() => onChange(tags.filter((item) => item !== tag))}
          >
            {tag}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        <input
          aria-labelledby={labelId}
          value={draft}
          disabled={disabled || tags.length >= 6}
          placeholder={tags.length >= 6 ? '最多 6 个' : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            flushSync(() => commit(draft));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === '、' || event.key === ',' || event.key === '，') {
              event.preventDefault();
              commit(draft);
            }
            if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
              onChange(tags.slice(0, -1));
            }
          }}
        />
      </span>
      <small className="field-hint">{hint}</small>
    </div>
  );
}
