/**
 * AI 角色工坊 - 集成面板背景故事标签页
 */

import React, { useState } from 'react';
import { BACKSTORY_FOCUSES, BACKSTORY_TONES } from '../../constants';
import type { CharacterBackstory, BackstoryOptions } from '../../types';

interface BackstoryTabProps {
  value: Partial<CharacterBackstory>;
  characterName: string;
  onChange: (backstory: Partial<CharacterBackstory>) => void;
  onGenerate: (options: BackstoryOptions) => Promise<{ sections: { title: string; content: string }[] }>;
  isGenerating: boolean;
  isZh: boolean;
}

export const BackstoryTab: React.FC<BackstoryTabProps> = ({
  value,
  characterName,
  onChange,
  onGenerate,
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
      const fullStory = result.sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n');
      onChange({ ...value, fullStory });
    } catch (err) {
      console.error('生成背景故事失败:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ef-text)', margin: 0 }}>
          {isZh ? `${characterName || '角色'}的背景故事` : `${characterName || 'Character'}'s Backstory`}
        </h4>
      </div>

      {/* 生成选项 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '故事焦点' : 'Focus'}
          </label>
          <select
            value={focus}
            onChange={e => setFocus(e.target.value as BackstoryOptions['focus'])}
            style={{ width: '100%', padding: '6px 8px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 11 }}
          >
            {BACKSTORY_FOCUSES.map(f => (
              <option key={f.value} value={f.value}>{isZh ? f.label.zh : f.label.en}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '故事语调' : 'Tone'}
          </label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value as BackstoryOptions['tone'])}
            style={{ width: '100%', padding: '6px 8px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 11 }}
          >
            {BACKSTORY_TONES.map(t => (
              <option key={t.value} value={t.value}>{isZh ? t.label.zh : t.label.en}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '故事长度' : 'Length'}
          </label>
          <select
            value={length}
            onChange={e => setLength(e.target.value as BackstoryOptions['length'])}
            style={{ width: '100%', padding: '6px 8px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 11 }}
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
        style={{ width: '100%', padding: '8px 14px', background: 'var(--ef-accent)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 500, cursor: isGenerating ? 'wait' : 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        {isGenerating ? '⏳' : '✨'} {isZh ? 'AI 生成背景故事' : 'Generate Backstory'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {/* 出身 */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '出身' : 'Origin'}
          </label>
          <input
            type="text"
            value={value.origin || ''}
            onChange={e => onChange({ ...value, origin: e.target.value })}
            placeholder={isZh ? '角色的出身背景...' : 'Character\'s origin...'}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          />
        </div>

        {/* 转折点 */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '人生转折点' : 'Turning Point'}
          </label>
          <input
            type="text"
            value={value.turningPoint || ''}
            onChange={e => onChange({ ...value, turningPoint: e.target.value })}
            placeholder={isZh ? '改变角色命运的事件...' : 'Event that changed their life...'}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          />
        </div>
      </div>

      {/* 完整故事 */}
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '完整背景故事' : 'Full Backstory'}
        </label>
        <textarea
          value={value.fullStory || ''}
          onChange={e => onChange({ ...value, fullStory: e.target.value })}
          placeholder={isZh ? '详细的背景故事...' : 'Detailed backstory...'}
          style={{ width: '100%', minHeight: 150, padding: 10, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </div>
    </div>
  );
};
