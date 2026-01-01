/**
 * AI 角色工坊 - 背景故事步骤
 */

import React, { useState } from 'react';
import { BACKSTORY_FOCUSES, BACKSTORY_TONES } from '../../constants';
import type { CharacterBackstory, BackstoryOptions } from '../../types';

interface BackstoryStepProps {
  value: Partial<CharacterBackstory>;
  characterName: string;
  onChange: (backstory: Partial<CharacterBackstory>) => void;
  onGenerate: (options: BackstoryOptions) => Promise<{ sections: { title: string; content: string }[] }>;
  onNext: () => void;
  onPrev: () => void;
  isGenerating: boolean;
  isZh: boolean;
}

export const BackstoryStep: React.FC<BackstoryStepProps> = ({
  value,
  characterName,
  onChange,
  onGenerate,
  onNext,
  onPrev,
  isGenerating,
  isZh,
}) => {
  const [focus, setFocus] = useState<BackstoryOptions['focus']>('full');
  const [tone, setTone] = useState<BackstoryOptions['tone']>('neutral');
  const [length, setLength] = useState<BackstoryOptions['length']>('medium');

  // AI 生成背景故事
  const handleGenerate = async () => {
    try {
      const result = await onGenerate({ focus, tone, length });
      // 合并生成的内容
      const fullStory = result.sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');
      onChange({ ...value, fullStory });
    } catch (err) {
      console.error('生成背景故事失败:', err);
    }
  };

  const canProceed = value.fullStory && value.fullStory.trim().length > 0;

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ef-text)' }}>
        {isZh ? '背景故事' : 'Backstory'}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--ef-text-muted)', marginBottom: 16 }}>
        {isZh ? `为 ${characterName} 创作背景故事` : `Create backstory for ${characterName}`}
      </p>

      {/* 生成选项 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {/* 焦点 */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '故事焦点' : 'Focus'}
          </label>
          <select
            value={focus}
            onChange={e => setFocus(e.target.value as BackstoryOptions['focus'])}
            style={{ width: '100%', padding: '8px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          >
            {BACKSTORY_FOCUSES.map(f => (
              <option key={f.value} value={f.value}>{isZh ? f.label.zh : f.label.en}</option>
            ))}
          </select>
        </div>

        {/* 语调 */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '故事语调' : 'Tone'}
          </label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value as BackstoryOptions['tone'])}
            style={{ width: '100%', padding: '8px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          >
            {BACKSTORY_TONES.map(t => (
              <option key={t.value} value={t.value}>{isZh ? t.label.zh : t.label.en}</option>
            ))}
          </select>
        </div>

        {/* 长度 */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '故事长度' : 'Length'}
          </label>
          <select
            value={length}
            onChange={e => setLength(e.target.value as BackstoryOptions['length'])}
            style={{ width: '100%', padding: '8px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          >
            <option value="short">{isZh ? '简短' : 'Short'}</option>
            <option value="medium">{isZh ? '中等' : 'Medium'}</option>
            <option value="long">{isZh ? '详细' : 'Long'}</option>
          </select>
        </div>
      </div>

      {/* AI 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{ width: '100%', padding: '10px 16px', background: 'var(--ef-accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: isGenerating ? 'wait' : 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {isGenerating ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>{isZh ? '生成中...' : 'Generating...'}</>) : (<><span>✨</span>{isZh ? 'AI 生成背景故事' : 'Generate Backstory'}</>)}
      </button>

      {/* 出身 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '出身' : 'Origin'}
        </label>
        <input
          type="text"
          value={value.origin || ''}
          onChange={e => onChange({ ...value, origin: e.target.value })}
          placeholder={isZh ? '角色的出身背景...' : 'Character\'s origin...'}
          style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
        />
      </div>

      {/* 转折点 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '人生转折点' : 'Turning Point'}
        </label>
        <input
          type="text"
          value={value.turningPoint || ''}
          onChange={e => onChange({ ...value, turningPoint: e.target.value })}
          placeholder={isZh ? '改变角色命运的事件...' : 'Event that changed their life...'}
          style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
        />
      </div>

      {/* 完整故事 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '完整背景故事 *' : 'Full Backstory *'}
        </label>
        <textarea
          value={value.fullStory || ''}
          onChange={e => onChange({ ...value, fullStory: e.target.value })}
          placeholder={isZh ? '详细的背景故事...' : 'Detailed backstory...'}
          style={{ width: '100%', minHeight: 150, padding: 12, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </div>

      {/* 导航按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onPrev} style={{ padding: '10px 20px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 14, cursor: 'pointer' }}>
          {isZh ? '← 上一步' : '← Back'}
        </button>
        <button onClick={onNext} disabled={!canProceed} style={{ padding: '10px 24px', background: canProceed ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: 'none', borderRadius: 8, color: canProceed ? 'white' : 'var(--ef-text-muted)', fontSize: 14, fontWeight: 500, cursor: canProceed ? 'pointer' : 'not-allowed' }}>
          {isZh ? '下一步 →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};
