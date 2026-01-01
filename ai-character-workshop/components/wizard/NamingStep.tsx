/**
 * AI 角色工坊 - 名字生成步骤
 */

import React, { useState } from 'react';
import { NAMING_CULTURES } from '../../constants';
import type { GeneratedName, NamingOptions } from '../../types';

interface NamingStepProps {
  value: { name?: string; nameOrigin?: string; nameMeaning?: string };
  style: { genre?: string; subGenre?: string };
  onChange: (data: { name: string; nameOrigin?: string; nameMeaning?: string }) => void;
  onGenerate: (options: NamingOptions) => Promise<{ names: GeneratedName[] }>;
  onNext: () => void;
  onPrev: () => void;
  isGenerating: boolean;
  isZh: boolean;
}

export const NamingStep: React.FC<NamingStepProps> = ({
  value,
  style,
  onChange,
  onGenerate,
  onNext,
  onPrev,
  isGenerating,
  isZh,
}) => {
  const [culture, setCulture] = useState<NamingOptions['culture']>('fantasy');
  const [gender, setGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [customName, setCustomName] = useState(value.name || '');
  const [selectedName, setSelectedName] = useState<GeneratedName | null>(
    value.name ? { name: value.name, origin: value.nameOrigin, meaning: value.nameMeaning } : null
  );

  // 生成名字
  const handleGenerate = async () => {
    try {
      const result = await onGenerate({
        culture,
        gender,
        style: style.genre,
        count: 6,
      });
      setGeneratedNames(result.names);
    } catch (err) {
      console.error('生成名字失败:', err);
    }
  };

  // 选择名字
  const handleSelectName = (name: GeneratedName) => {
    setSelectedName(name);
    setCustomName(name.name);
    onChange({
      name: name.name,
      nameOrigin: name.origin,
      nameMeaning: name.meaning,
    });
  };

  // 使用自定义名字
  const handleCustomNameChange = (newName: string) => {
    setCustomName(newName);
    setSelectedName(null);
    onChange({ name: newName });
  };

  const canProceed = customName.trim().length > 0;

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 600, 
        marginBottom: 8,
        color: 'var(--ef-text)',
      }}>
        {isZh ? '角色命名' : 'Character Naming'}
      </h3>
      <p style={{ 
        fontSize: 13, 
        color: 'var(--ef-text-muted)', 
        marginBottom: 20,
      }}>
        {isZh 
          ? '为角色生成或输入一个名字' 
          : 'Generate or enter a name for your character'}
      </p>

      {/* 生成选项 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 16, 
        marginBottom: 20,
      }}>
        {/* 文化选择 */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 500, 
            marginBottom: 6,
            color: 'var(--ef-text-muted)',
          }}>
            {isZh ? '名字风格' : 'Name Style'}
          </label>
          <select
            value={culture}
            onChange={e => setCulture(e.target.value as NamingOptions['culture'])}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--ef-bg-tertiary)',
              border: '1px solid var(--ef-border)',
              borderRadius: 6,
              color: 'var(--ef-text)',
              fontSize: 13,
            }}
          >
            {NAMING_CULTURES.map(c => (
              <option key={c.value} value={c.value}>
                {isZh ? c.label.zh : c.label.en}
              </option>
            ))}
          </select>
        </div>

        {/* 性别选择 */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 500, 
            marginBottom: 6,
            color: 'var(--ef-text-muted)',
          }}>
            {isZh ? '性别倾向' : 'Gender'}
          </label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value as 'male' | 'female' | 'neutral')}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--ef-bg-tertiary)',
              border: '1px solid var(--ef-border)',
              borderRadius: 6,
              color: 'var(--ef-text)',
              fontSize: 13,
            }}
          >
            <option value="neutral">{isZh ? '中性' : 'Neutral'}</option>
            <option value="male">{isZh ? '男性' : 'Male'}</option>
            <option value="female">{isZh ? '女性' : 'Female'}</option>
          </select>
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: 'var(--ef-accent)',
          border: 'none',
          borderRadius: 8,
          color: 'white',
          fontSize: 13,
          fontWeight: 500,
          cursor: isGenerating ? 'wait' : 'pointer',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isGenerating ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            {isZh ? '生成中...' : 'Generating...'}
          </>
        ) : (
          <>
            <span>✨</span>
            {isZh ? 'AI 生成名字' : 'Generate Names'}
          </>
        )}
      </button>

      {/* 生成的名字列表 */}
      {generatedNames.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 500, 
            marginBottom: 8,
            color: 'var(--ef-text-muted)',
          }}>
            {isZh ? '选择一个名字' : 'Select a name'}
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 8,
          }}>
            {generatedNames.map((name, index) => (
              <button
                key={index}
                onClick={() => handleSelectName(name)}
                style={{
                  padding: '10px 12px',
                  background: selectedName?.name === name.name 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-bg-tertiary)',
                  border: `1px solid ${selectedName?.name === name.name 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: selectedName?.name === name.name ? 'white' : 'var(--ef-text)',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                  {name.name}
                </div>
                {name.meaning && (
                  <div style={{ 
                    fontSize: 11, 
                    opacity: 0.8,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {name.meaning}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 自定义名字输入 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 500, 
          marginBottom: 6,
          color: 'var(--ef-text-muted)',
        }}>
          {isZh ? '或直接输入名字' : 'Or enter a name directly'}
        </label>
        <input
          type="text"
          value={customName}
          onChange={e => handleCustomNameChange(e.target.value)}
          placeholder={isZh ? '输入角色名字...' : 'Enter character name...'}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'var(--ef-bg-tertiary)',
            border: '1px solid var(--ef-border)',
            borderRadius: 8,
            color: 'var(--ef-text)',
            fontSize: 14,
          }}
        />
      </div>

      {/* 导航按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={onPrev}
          style={{
            padding: '10px 20px',
            background: 'var(--ef-bg-tertiary)',
            border: '1px solid var(--ef-border)',
            borderRadius: 8,
            color: 'var(--ef-text)',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {isZh ? '← 上一步' : '← Back'}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            padding: '10px 24px',
            background: canProceed ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
            border: 'none',
            borderRadius: 8,
            color: canProceed ? 'white' : 'var(--ef-text-muted)',
            fontSize: 14,
            fontWeight: 500,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          {isZh ? '下一步 →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};
