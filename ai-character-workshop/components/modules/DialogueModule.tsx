/**
 * 对话生成模块
 */

import React, { useState } from 'react';
import { SelectField, NumberField, TextArea, GenerateButton, ResultCard } from '../atoms';
import { DIALOGUE_STYLES } from '../../constants';
import type { CharacterInput, DialogueOptions, DialogueResult } from '../../types';

interface DialogueModuleProps {
  character: CharacterInput | null;
  isGenerating: boolean;
  onGenerate: (options: DialogueOptions) => Promise<DialogueResult>;
  isZh: boolean;
}

export const DialogueModule: React.FC<DialogueModuleProps> = ({
  character,
  isGenerating,
  onGenerate,
  isZh,
}) => {
  const [style, setStyle] = useState<DialogueOptions['style']>('casual');
  const [scenario, setScenario] = useState('');
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<DialogueResult | null>(null);

  const handleGenerate = async () => {
    if (!character) return;
    
    try {
      const res = await onGenerate({ style, scenario, count });
      setResult(res);
    } catch (err) {
      console.error('生成对话失败:', err);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = result.dialogues.map(d => 
      `${d.speaker}: "${d.text}" ${d.emotion ? `(${d.emotion})` : ''}`
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 选项区 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <SelectField
          label={isZh ? '对话风格' : 'Style'}
          value={style}
          options={DIALOGUE_STYLES}
          onChange={v => setStyle(v as DialogueOptions['style'])}
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

      <TextArea
        label={isZh ? '场景描述（可选）' : 'Scenario (optional)'}
        value={scenario}
        onChange={setScenario}
        placeholder={isZh ? '例如：在战场上、与朋友聊天、面对敌人...' : 'e.g., on battlefield, chatting with friends...'}
        rows={2}
        disabled={isGenerating}
      />

      <GenerateButton
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!character}
        isZh={isZh}
      />

      {/* 结果展示 */}
      {result && (
        <ResultCard
          title={isZh ? '生成的对话' : 'Generated Dialogues'}
          onCopy={copyToClipboard}
          isZh={isZh}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.dialogues.map((dialogue, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  background: 'var(--ef-bg-secondary)',
                  borderRadius: 6,
                  borderLeft: '3px solid var(--ef-accent-primary)',
                }}
              >
                <div style={{
                  fontSize: 12,
                  color: 'var(--ef-text-muted)',
                  marginBottom: 4,
                }}>
                  {dialogue.speaker} {dialogue.emotion && `· ${dialogue.emotion}`}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  "{dialogue.text}"
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
};
