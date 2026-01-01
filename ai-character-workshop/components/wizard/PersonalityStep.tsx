/**
 * AI 角色工坊 - 性格设定步骤
 */

import React, { useState } from 'react';
import { PERSONALITY_TRAITS } from '../../constants';
import type { CharacterPersonality } from '../../types';

interface PersonalityStepProps {
  value: Partial<CharacterPersonality>;
  characterName: string;
  onChange: (personality: Partial<CharacterPersonality>) => void;
  onGenerate: () => Promise<Partial<CharacterPersonality>>;
  onNext: () => void;
  onPrev: () => void;
  isGenerating: boolean;
  isZh: boolean;
}

export const PersonalityStep: React.FC<PersonalityStepProps> = ({
  value,
  characterName,
  onChange,
  onGenerate,
  onNext,
  onPrev,
  isGenerating,
  isZh,
}) => {
  const [selectedTraits, setSelectedTraits] = useState<string[]>(value.traits || []);

  // 切换性格特质
  const toggleTrait = (trait: string) => {
    const newTraits = selectedTraits.includes(trait)
      ? selectedTraits.filter(t => t !== trait)
      : [...selectedTraits, trait].slice(0, 6); // 最多6个
    setSelectedTraits(newTraits);
    onChange({ ...value, traits: newTraits });
  };

  // AI 生成性格
  const handleGenerate = async () => {
    try {
      const generated = await onGenerate();
      if (generated.traits) setSelectedTraits(generated.traits);
    } catch (err) {
      console.error('生成性格失败:', err);
    }
  };

  // 更新字段
  const updateField = (field: keyof CharacterPersonality, val: string | string[]) => {
    onChange({ ...value, [field]: val });
  };

  // 更新数组字段（逗号分隔）
  const updateArrayField = (field: keyof CharacterPersonality, val: string) => {
    const arr = val.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    onChange({ ...value, [field]: arr });
  };

  const canProceed = selectedTraits.length > 0 && value.description && value.description.trim().length > 0;

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ef-text)' }}>
        {isZh ? '性格设定' : 'Personality'}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--ef-text-muted)', marginBottom: 16 }}>
        {isZh ? `为 ${characterName} 设定性格特点` : `Define personality for ${characterName}`}
      </p>

      {/* AI 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{ width: '100%', padding: '10px 16px', background: 'var(--ef-accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: isGenerating ? 'wait' : 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {isGenerating ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>{isZh ? '生成中...' : 'Generating...'}</>) : (<><span>✨</span>{isZh ? 'AI 生成性格' : 'Generate Personality'}</>)}
      </button>

      {/* 性格特质选择 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 8, color: 'var(--ef-text-muted)' }}>
          {isZh ? '性格特质（选择1-6个）' : 'Traits (select 1-6)'}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PERSONALITY_TRAITS.map(trait => (
            <button
              key={trait.value}
              onClick={() => toggleTrait(trait.value)}
              style={{ padding: '5px 12px', background: selectedTraits.includes(trait.value) ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: `1px solid ${selectedTraits.includes(trait.value) ? 'var(--ef-accent)' : 'var(--ef-border)'}`, borderRadius: 14, cursor: 'pointer', fontSize: 12, color: selectedTraits.includes(trait.value) ? 'white' : 'var(--ef-text)' }}
            >
              {isZh ? trait.label.zh : trait.label.en}
            </button>
          ))}
        </div>
      </div>

      {/* 优点 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '优点' : 'Strengths'}
        </label>
        <input
          type="text"
          value={(value.strengths || []).join(', ')}
          onChange={e => updateArrayField('strengths', e.target.value)}
          placeholder={isZh ? '用逗号分隔，如：勇敢, 聪明' : 'Comma separated, e.g., Brave, Smart'}
          style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
        />
      </div>

      {/* 缺点 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '缺点' : 'Weaknesses'}
        </label>
        <input
          type="text"
          value={(value.weaknesses || []).join(', ')}
          onChange={e => updateArrayField('weaknesses', e.target.value)}
          placeholder={isZh ? '用逗号分隔' : 'Comma separated'}
          style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
        />
      </div>

      {/* 说话风格 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '说话风格' : 'Speech Style'}
        </label>
        <input
          type="text"
          value={value.speechStyle || ''}
          onChange={e => updateField('speechStyle', e.target.value)}
          placeholder={isZh ? '例如：冷静、简洁、偶尔讽刺' : 'e.g., Calm, concise, occasionally sarcastic'}
          style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
        />
      </div>

      {/* 性格描述 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '性格描述 *' : 'Personality Description *'}
        </label>
        <textarea
          value={value.description || ''}
          onChange={e => onChange({ ...value, description: e.target.value })}
          placeholder={isZh ? '详细描述角色的性格...' : 'Describe the character\'s personality in detail...'}
          style={{ width: '100%', minHeight: 80, padding: 12, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, resize: 'vertical' }}
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
