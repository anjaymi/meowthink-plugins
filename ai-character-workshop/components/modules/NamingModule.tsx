/**
 * 名字生成模块
 */

import React, { useState } from 'react';
import { SelectField, NumberField, TextArea, GenerateButton, ResultCard } from '../atoms';
import { NAMING_CULTURES } from '../../constants';
import type { CharacterInput, NamingOptions, NamingResult } from '../../types';

interface NamingModuleProps {
  character: CharacterInput | null;
  isGenerating: boolean;
  onGenerate: (options: NamingOptions) => Promise<NamingResult>;
  isZh: boolean;
}

const GENDER_OPTIONS = [
  { value: 'male', label: { zh: '男性', en: 'Male' } },
  { value: 'female', label: { zh: '女性', en: 'Female' } },
  { value: 'neutral', label: { zh: '中性', en: 'Neutral' } },
];

export const NamingModule: React.FC<NamingModuleProps> = ({
  character,
  isGenerating,
  onGenerate,
  isZh,
}) => {
  const [culture, setCulture] = useState<NamingOptions['culture']>('chinese');
  const [gender, setGender] = useState<NamingOptions['gender']>('neutral');
  const [style, setStyle] = useState('');
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<NamingResult | null>(null);

  const handleGenerate = async () => {
    if (!character) return;
    
    try {
      const res = await onGenerate({ culture, gender, style, count });
      setResult(res);
    } catch (err) {
      console.error('生成名字失败:', err);
    }
  };

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 选项区 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <SelectField
          label={isZh ? '名字风格' : 'Culture'}
          value={culture}
          options={NAMING_CULTURES}
          onChange={v => setCulture(v as NamingOptions['culture'])}
          isZh={isZh}
          disabled={isGenerating}
        />
        <SelectField
          label={isZh ? '性别倾向' : 'Gender'}
          value={gender || 'neutral'}
          options={GENDER_OPTIONS}
          onChange={v => setGender(v as NamingOptions['gender'])}
          isZh={isZh}
          disabled={isGenerating}
        />
        <NumberField
          label={isZh ? '生成数量' : 'Count'}
          value={count}
          onChange={setCount}
          min={1}
          max={10}
          disabled={isGenerating}
        />
      </div>

      {culture === 'custom' && (
        <TextArea
          label={isZh ? '风格描述' : 'Style Description'}
          value={style}
          onChange={setStyle}
          placeholder={isZh ? '描述你想要的名字风格...' : 'Describe the naming style...'}
          rows={2}
          disabled={isGenerating}
        />
      )}

      <GenerateButton
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!character}
        isZh={isZh}
      />

      {/* 结果展示 */}
      {result && (
        <ResultCard
          title={isZh ? '生成的名字' : 'Generated Names'}
          isZh={isZh}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.names.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  background: 'var(--ef-bg-secondary)',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                    {item.name}
                  </div>
                  {item.meaning && (
                    <div style={{ fontSize: 12, color: 'var(--ef-text-muted)' }}>
                      {isZh ? '含义' : 'Meaning'}: {item.meaning}
                    </div>
                  )}
                  {item.origin && (
                    <div style={{ fontSize: 12, color: 'var(--ef-text-muted)' }}>
                      {isZh ? '来源' : 'Origin'}: {item.origin}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => copyName(item.name)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: 'none',
                    background: 'var(--ef-bg-tertiary)',
                    color: 'var(--ef-text-muted)',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  📋
                </button>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
};
