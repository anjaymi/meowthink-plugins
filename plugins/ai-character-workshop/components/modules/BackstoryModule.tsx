/**
 * 背景故事生成模块
 */

import React, { useState } from 'react';
import { SelectField, GenerateButton, ResultCard } from '../atoms';
import { BACKSTORY_FOCUSES, BACKSTORY_TONES } from '../../constants';
import type { CharacterInput, BackstoryOptions, BackstoryResult } from '../../types';

interface BackstoryModuleProps {
  character: CharacterInput | null;
  isGenerating: boolean;
  onGenerate: (options: BackstoryOptions) => Promise<BackstoryResult>;
  onAddToCanvas?: (content: string) => void;
  isZh: boolean;
}

const LENGTH_OPTIONS = [
  { value: 'short', label: { zh: '简短', en: 'Short' } },
  { value: 'medium', label: { zh: '中等', en: 'Medium' } },
  { value: 'long', label: { zh: '详细', en: 'Long' } },
];

export const BackstoryModule: React.FC<BackstoryModuleProps> = ({
  character,
  isGenerating,
  onGenerate,
  onAddToCanvas,
  isZh,
}) => {
  const [focus, setFocus] = useState<BackstoryOptions['focus']>('full');
  const [tone, setTone] = useState<BackstoryOptions['tone']>('neutral');
  const [length, setLength] = useState<BackstoryOptions['length']>('medium');
  const [result, setResult] = useState<BackstoryResult | null>(null);

  const handleGenerate = async () => {
    if (!character) return;
    
    try {
      const res = await onGenerate({ focus, tone, length });
      setResult(res);
    } catch (err) {
      console.error('生成背景故事失败:', err);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = result.sections.map(s => 
      `## ${s.title}${s.period ? ` (${s.period})` : ''}\n\n${s.content}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  const getFullContent = () => {
    if (!result) return '';
    return result.sections.map(s => s.content).join('\n\n');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 选项区 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <SelectField
          label={isZh ? '故事焦点' : 'Focus'}
          value={focus}
          options={BACKSTORY_FOCUSES}
          onChange={v => setFocus(v as BackstoryOptions['focus'])}
          isZh={isZh}
          disabled={isGenerating}
        />
        <SelectField
          label={isZh ? '叙事语调' : 'Tone'}
          value={tone}
          options={BACKSTORY_TONES}
          onChange={v => setTone(v as BackstoryOptions['tone'])}
          isZh={isZh}
          disabled={isGenerating}
        />
        <SelectField
          label={isZh ? '故事长度' : 'Length'}
          value={length}
          options={LENGTH_OPTIONS}
          onChange={v => setLength(v as BackstoryOptions['length'])}
          isZh={isZh}
          disabled={isGenerating}
        />
      </div>

      <GenerateButton
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!character}
        isZh={isZh}
      />

      {/* 结果展示 */}
      {result && (
        <ResultCard
          title={isZh ? '背景故事' : 'Backstory'}
          onCopy={copyToClipboard}
          onAddToCanvas={onAddToCanvas ? () => onAddToCanvas(getFullContent()) : undefined}
          isZh={isZh}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result.sections.map((section, i) => (
              <div key={i}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  {section.title}
                  {section.period && (
                    <span style={{
                      fontSize: 11,
                      color: 'var(--ef-text-muted)',
                      fontWeight: 400,
                    }}>
                      ({section.period})
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: 'var(--ef-text-secondary)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
};
