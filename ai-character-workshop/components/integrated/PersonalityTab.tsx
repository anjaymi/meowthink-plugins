/**
 * AI 角色工坊 - 集成面板性格标签页
 */

import React, { useState, useEffect } from 'react';
import { PERSONALITY_TRAITS } from '../../constants';
import type { CharacterPersonality } from '../../types';

interface PersonalityTabProps {
  value: Partial<CharacterPersonality>;
  characterName: string;
  onChange: (personality: Partial<CharacterPersonality>) => void;
  onGenerate: () => Promise<Partial<CharacterPersonality>>;
  isGenerating: boolean;
  isZh: boolean;
}

export const PersonalityTab: React.FC<PersonalityTabProps> = ({
  value,
  characterName,
  onChange,
  onGenerate,
  isGenerating,
  isZh,
}) => {
  const [selectedTraits, setSelectedTraits] = useState<string[]>(value.traits || []);

  // 同步外部值
  useEffect(() => {
    setSelectedTraits(value.traits || []);
  }, [value.traits]);

  // 切换性格特质
  const toggleTrait = (trait: string) => {
    const newTraits = selectedTraits.includes(trait)
      ? selectedTraits.filter(t => t !== trait)
      : [...selectedTraits, trait].slice(0, 6);
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

  // 更新数组字段
  const updateArrayField = (field: keyof CharacterPersonality, val: string) => {
    const arr = val.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    onChange({ ...value, [field]: arr });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ef-text)', margin: 0 }}>
          {isZh ? `${characterName || '角色'}的性格` : `${characterName || 'Character'}'s Personality`}
        </h4>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{ padding: '6px 14px', background: 'var(--ef-accent)', border: 'none', borderRadius: 6, color: 'white', fontSize: 11, fontWeight: 500, cursor: isGenerating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {isGenerating ? '⏳' : '✨'} {isZh ? 'AI 生成' : 'Generate'}
        </button>
      </div>

      {/* 性格特质选择 */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text-muted)' }}>
          {isZh ? '性格特质（选择1-6个）' : 'Traits (select 1-6)'}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {PERSONALITY_TRAITS.map(trait => (
            <button
              key={trait.value}
              onClick={() => toggleTrait(trait.value)}
              style={{ padding: '4px 10px', background: selectedTraits.includes(trait.value) ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: `1px solid ${selectedTraits.includes(trait.value) ? 'var(--ef-accent)' : 'var(--ef-border)'}`, borderRadius: 12, cursor: 'pointer', fontSize: 11, color: selectedTraits.includes(trait.value) ? 'white' : 'var(--ef-text)' }}
            >
              {isZh ? trait.label.zh : trait.label.en}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* 优点 */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '优点' : 'Strengths'}
          </label>
          <input
            type="text"
            value={(value.strengths || []).join(', ')}
            onChange={e => updateArrayField('strengths', e.target.value)}
            placeholder={isZh ? '用逗号分隔' : 'Comma separated'}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          />
        </div>

        {/* 缺点 */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '缺点' : 'Weaknesses'}
          </label>
          <input
            type="text"
            value={(value.weaknesses || []).join(', ')}
            onChange={e => updateArrayField('weaknesses', e.target.value)}
            placeholder={isZh ? '用逗号分隔' : 'Comma separated'}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          />
        </div>
      </div>

      {/* 说话风格 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '说话风格' : 'Speech Style'}
        </label>
        <input
          type="text"
          value={value.speechStyle || ''}
          onChange={e => updateField('speechStyle', e.target.value)}
          placeholder={isZh ? '例如：冷静、简洁、偶尔讽刺' : 'e.g., Calm, concise, occasionally sarcastic'}
          style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
        />
      </div>

      {/* 性格描述 */}
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '性格描述' : 'Personality Description'}
        </label>
        <textarea
          value={value.description || ''}
          onChange={e => onChange({ ...value, description: e.target.value })}
          placeholder={isZh ? '详细描述角色的性格...' : 'Describe the character\'s personality in detail...'}
          style={{ width: '100%', minHeight: 80, padding: 10, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12, resize: 'vertical' }}
        />
      </div>
    </div>
  );
};
