/**
 * AI 角色工坊 - 标签选择步骤
 */

import React, { useState, useEffect } from 'react';
import { TAG_PRESETS, PERSONALITY_TRAITS } from '../../constants';
import { PluginBridge } from '../../api/pluginBridge';

interface TagsStepProps {
  value: string[];
  style: { genre?: string };
  onChange: (tags: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isZh: boolean;
}

export const TagsStep: React.FC<TagsStepProps> = ({
  value,
  style,
  onChange,
  onNext,
  onPrev,
  isZh,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(value);
  const [customTag, setCustomTag] = useState('');
  const [fusionTags, setFusionTags] = useState<string[]>([]);

  // 从角色融合插件获取标签
  useEffect(() => {
    const loadFusionTags = async () => {
      if (style.genre && PluginBridge.isCharacterFusionAvailable()) {
        const tags = await PluginBridge.getFusionTagsByStyle(style.genre);
        setFusionTags(tags);
      }
    };
    loadFusionTags();
  }, [style.genre]);

  // 获取当前风格的预设标签
  const stylePresets = TAG_PRESETS[style.genre || 'fantasy'] || TAG_PRESETS.fantasy;

  // 切换标签
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onChange(newTags);
  };

  // 添加自定义标签
  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()];
      setSelectedTags(newTags);
      onChange(newTags);
      setCustomTag('');
    }
  };

  // 移除标签
  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    onChange(newTags);
  };

  const canProceed = selectedTags.length > 0;

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 600, 
        marginBottom: 8,
        color: 'var(--ef-text)',
      }}>
        {isZh ? '属性标签' : 'Character Tags'}
      </h3>
      <p style={{ 
        fontSize: 13, 
        color: 'var(--ef-text-muted)', 
        marginBottom: 20,
      }}>
        {isZh 
          ? '选择角色的属性和特征标签' 
          : 'Select attributes and traits for your character'}
      </p>

      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 500, 
            marginBottom: 8,
            color: 'var(--ef-text-muted)',
          }}>
            {isZh ? '已选择' : 'Selected'} ({selectedTags.length})
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedTags.map(tag => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  background: 'var(--ef-accent)',
                  borderRadius: 14,
                  fontSize: 12,
                  color: 'white',
                }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 14,
                    lineHeight: 1,
                    opacity: 0.8,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 角色融合插件标签 */}
      {fusionTags.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 6,
            fontSize: 12, 
            fontWeight: 500, 
            marginBottom: 8,
            color: 'var(--ef-text-muted)',
          }}>
            <span>🔗</span>
            {isZh ? '来自角色融合插件' : 'From Character Fusion'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {fusionTags.slice(0, 12).map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: '5px 12px',
                  background: selectedTags.includes(tag) 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-bg-tertiary)',
                  border: `1px solid ${selectedTags.includes(tag) 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-border)'}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: selectedTags.includes(tag) ? 'white' : 'var(--ef-text)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 预设标签分类 */}
      {stylePresets.map(category => (
        <div key={category.category} style={{ marginBottom: 16 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 12, 
            fontWeight: 500, 
            marginBottom: 8,
            color: 'var(--ef-text-muted)',
          }}>
            {category.category}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {category.tags.map(tag => (
              <button
                key={tag.value}
                onClick={() => toggleTag(tag.value)}
                style={{
                  padding: '5px 12px',
                  background: selectedTags.includes(tag.value) 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-bg-tertiary)',
                  border: `1px solid ${selectedTags.includes(tag.value) 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-border)'}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: selectedTags.includes(tag.value) ? 'white' : 'var(--ef-text)',
                }}
              >
                {isZh ? tag.label.zh : tag.label.en}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 性格特质 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 500, 
          marginBottom: 8,
          color: 'var(--ef-text-muted)',
        }}>
          {isZh ? '性格特质' : 'Personality Traits'}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {PERSONALITY_TRAITS.map(trait => (
            <button
              key={trait.value}
              onClick={() => toggleTag(trait.value)}
              style={{
                padding: '5px 12px',
                background: selectedTags.includes(trait.value) 
                  ? 'var(--ef-accent)' 
                  : 'var(--ef-bg-tertiary)',
                border: `1px solid ${selectedTags.includes(trait.value) 
                  ? 'var(--ef-accent)' 
                  : 'var(--ef-border)'}`,
                borderRadius: 14,
                cursor: 'pointer',
                fontSize: 12,
                color: selectedTags.includes(trait.value) ? 'white' : 'var(--ef-text)',
              }}
            >
              {isZh ? trait.label.zh : trait.label.en}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义标签 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ 
          display: 'block', 
          fontSize: 12, 
          fontWeight: 500, 
          marginBottom: 6,
          color: 'var(--ef-text-muted)',
        }}>
          {isZh ? '添加自定义标签' : 'Add custom tag'}
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomTag()}
            placeholder={isZh ? '输入标签...' : 'Enter tag...'}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'var(--ef-bg-tertiary)',
              border: '1px solid var(--ef-border)',
              borderRadius: 6,
              color: 'var(--ef-text)',
              fontSize: 13,
            }}
          />
          <button
            onClick={addCustomTag}
            disabled={!customTag.trim()}
            style={{
              padding: '8px 16px',
              background: customTag.trim() ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
              border: 'none',
              borderRadius: 6,
              color: customTag.trim() ? 'white' : 'var(--ef-text-muted)',
              fontSize: 13,
              cursor: customTag.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {isZh ? '添加' : 'Add'}
          </button>
        </div>
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
