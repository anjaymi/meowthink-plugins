/**
 * 世界观扩展模块
 */

import React, { useState } from 'react';
import { SelectField, GenerateButton, ResultCard } from '../atoms';
import { WORLDBUILDING_ASPECTS } from '../../constants';
import type { CharacterInput, WorldbuildingOptions, WorldbuildingResult } from '../../types';

interface WorldbuildingModuleProps {
  character: CharacterInput | null;
  isGenerating: boolean;
  onGenerate: (options: WorldbuildingOptions) => Promise<WorldbuildingResult>;
  onAddToCanvas?: (element: { name: string; description: string }) => void;
  isZh: boolean;
}

const DEPTH_OPTIONS = [
  { value: 'brief', label: { zh: '简要', en: 'Brief' } },
  { value: 'detailed', label: { zh: '详细', en: 'Detailed' } },
  { value: 'comprehensive', label: { zh: '全面', en: 'Comprehensive' } },
];

export const WorldbuildingModule: React.FC<WorldbuildingModuleProps> = ({
  character,
  isGenerating,
  onGenerate,
  onAddToCanvas,
  isZh,
}) => {
  const [aspect, setAspect] = useState<WorldbuildingOptions['aspect']>('faction');
  const [depth, setDepth] = useState<WorldbuildingOptions['depth']>('detailed');
  const [result, setResult] = useState<WorldbuildingResult | null>(null);

  const handleGenerate = async () => {
    if (!character) return;
    
    try {
      const res = await onGenerate({ aspect, depth });
      setResult(res);
    } catch (err) {
      console.error('生成世界观失败:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 选项区 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <SelectField
          label={isZh ? '扩展方向' : 'Aspect'}
          value={aspect}
          options={WORLDBUILDING_ASPECTS}
          onChange={v => setAspect(v as WorldbuildingOptions['aspect'])}
          isZh={isZh}
          disabled={isGenerating}
        />
        <SelectField
          label={isZh ? '详细程度' : 'Depth'}
          value={depth}
          options={DEPTH_OPTIONS}
          onChange={v => setDepth(v as WorldbuildingOptions['depth'])}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.elements.map((element, i) => (
            <ResultCard
              key={element.id}
              title={`${element.type}: ${element.name}`}
              onAddToCanvas={onAddToCanvas ? () => onAddToCanvas(element) : undefined}
              isZh={isZh}
            >
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 8px 0' }}>{element.description}</p>
                {element.relatedTo && element.relatedTo.length > 0 && (
                  <div style={{
                    fontSize: 12,
                    color: 'var(--ef-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexWrap: 'wrap',
                  }}>
                    <span>{isZh ? '相关:' : 'Related:'}</span>
                    {element.relatedTo.map((rel, j) => (
                      <span
                        key={j}
                        style={{
                          padding: '2px 6px',
                          background: 'var(--ef-bg-secondary)',
                          borderRadius: 4,
                        }}
                      >
                        {rel}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </ResultCard>
          ))}
        </div>
      )}
    </div>
  );
};
