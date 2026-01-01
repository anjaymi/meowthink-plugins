/**
 * 变体生成模块
 */

import React, { useState } from 'react';
import { SelectField, NumberField, TextArea, GenerateButton, ResultCard } from '../atoms';
import { VARIANT_TYPES } from '../../constants';
import type { CharacterInput, VariantOptions, VariantResult } from '../../types';

interface VariantModuleProps {
  character: CharacterInput | null;
  isGenerating: boolean;
  onGenerate: (options: VariantOptions) => Promise<VariantResult>;
  onAddToCanvas?: (variant: { name: string; description: string }) => void;
  isZh: boolean;
}

export const VariantModule: React.FC<VariantModuleProps> = ({
  character,
  isGenerating,
  onGenerate,
  onAddToCanvas,
  isZh,
}) => {
  const [type, setType] = useState<VariantOptions['type']>('costume');
  const [customPrompt, setCustomPrompt] = useState('');
  const [count, setCount] = useState(3);
  const [result, setResult] = useState<VariantResult | null>(null);

  const handleGenerate = async () => {
    if (!character) return;
    
    try {
      const res = await onGenerate({ type, customPrompt, count });
      setResult(res);
    } catch (err) {
      console.error('生成变体失败:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 选项区 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <SelectField
          label={isZh ? '变体类型' : 'Type'}
          value={type}
          options={VARIANT_TYPES}
          onChange={v => setType(v as VariantOptions['type'])}
          isZh={isZh}
          disabled={isGenerating}
        />
        <NumberField
          label={isZh ? '生成数量' : 'Count'}
          value={count}
          onChange={setCount}
          min={1}
          max={5}
          disabled={isGenerating}
        />
      </div>

      {type === 'custom' && (
        <TextArea
          label={isZh ? '自定义要求' : 'Custom Requirements'}
          value={customPrompt}
          onChange={setCustomPrompt}
          placeholder={isZh ? '描述你想要的变体类型...' : 'Describe the variant you want...'}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.variants.map((variant, i) => (
            <ResultCard
              key={variant.id}
              title={variant.name}
              onAddToCanvas={onAddToCanvas ? () => onAddToCanvas(variant) : undefined}
              isZh={isZh}
            >
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 8px 0' }}>{variant.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {variant.changes.map((change, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '2px 8px',
                        background: 'var(--ef-accent-primary-light, rgba(99,102,241,0.1))',
                        borderRadius: 4,
                        fontSize: 11,
                        color: 'var(--ef-accent-primary)',
                      }}
                    >
                      {change}
                    </span>
                  ))}
                </div>
              </div>
            </ResultCard>
          ))}
        </div>
      )}
    </div>
  );
};
