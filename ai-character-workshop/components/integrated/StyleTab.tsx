/**
 * AI 角色工坊 - 集成面板风格标签页
 * 使用 SVG 图标，优化视觉效果
 */

import React, { useState, useEffect } from 'react';
import { STYLE_PRESETS } from '../../constants';
import { PluginBridge } from '../../api/pluginBridge';
import type { CharacterStyle, FusionStyle } from '../../types';

// SVG 图标组件
const StyleIcons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  fantasy: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  scifi: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" />
      <path d="M12 22V12" />
      <path d="M20 7L12 12L4 7" />
      <circle cx="12" cy="7" r="2" />
    </svg>
  ),
  modern: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  techwear: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 6 4 6 6V8C6 10 8 12 12 12C16 12 18 10 18 8V6C18 4 16 2 12 2Z" />
      <path d="M6 12V18C6 20 8 22 12 22C16 22 18 20 18 18V12" />
      <path d="M9 16H15" />
      <path d="M12 12V16" />
    </svg>
  ),
  historical: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21H21" />
      <path d="M5 21V7L12 3L19 7V21" />
      <path d="M9 21V15H15V21" />
      <path d="M9 11H9.01" />
      <path d="M15 11H15.01" />
    </svg>
  ),
  custom: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L14.5 8.5L20.5 9.5L16 14L17 20L12 17.5L7 20L8 14L3.5 9.5L9.5 8.5L12 3Z" />
    </svg>
  ),
};

interface StyleTabProps {
  value: Partial<CharacterStyle>;
  onChange: (style: Partial<CharacterStyle>) => void;
  isZh: boolean;
}

export const StyleTab: React.FC<StyleTabProps> = ({ value, onChange, isZh }) => {
  const [fusionStyles, setFusionStyles] = useState<FusionStyle[]>([]);
  const [isFusionAvailable, setIsFusionAvailable] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>(value.genre || '');
  const [selectedSubStyle, setSelectedSubStyle] = useState<string>(value.subGenre || '');
  const [customStyle, setCustomStyle] = useState(value.inspiration || '');

  // 检查角色融合插件
  useEffect(() => {
    const checkFusion = async () => {
      const available = PluginBridge.isCharacterFusionAvailable();
      setIsFusionAvailable(available);
      if (available) {
        const styles = await PluginBridge.getFusionStyles();
        setFusionStyles(styles);
      }
    };
    checkFusion();
  }, []);

  // 同步外部值变化
  useEffect(() => {
    setSelectedPreset(value.genre || '');
    setSelectedSubStyle(value.subGenre || '');
    setCustomStyle(value.inspiration || '');
  }, [value]);

  // 选择预设风格
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    setSelectedSubStyle('');
    onChange({ genre: presetId, subGenre: undefined });
  };

  // 选择子风格
  const handleSubStyleSelect = (subStyleId: string) => {
    setSelectedSubStyle(subStyleId);
    onChange({ genre: selectedPreset, subGenre: subStyleId });
  };

  // 获取当前预设的子风格
  const currentPreset = STYLE_PRESETS.find(p => p.id === selectedPreset);

  // 渲染图标
  const renderIcon = (presetId: string, isSelected: boolean) => {
    const IconComponent = StyleIcons[presetId];
    if (IconComponent) {
      return <IconComponent size={28} color={isSelected ? 'white' : 'var(--ef-accent)'} />;
    }
    return null;
  };

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--ef-text)' }}>
        {isZh ? '选择角色风格' : 'Choose Character Style'}
      </h3>
      <p style={{ fontSize: 12, color: 'var(--ef-text-muted)', marginBottom: 16 }}>
        {isZh ? '选择角色所属的世界观和风格类型，这将影响后续的名字、外观等生成' : 'Select the genre and style for your character'}
      </p>

      {/* 角色融合插件提示 */}
      {isFusionAvailable && fusionStyles.length > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--ef-accent-bg, rgba(99,102,241,0.1))',
          border: '1px solid var(--ef-accent)',
          borderRadius: 6,
          marginBottom: 12,
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ef-accent)" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {isZh ? '已连接角色融合插件，可使用更多风格数据' : 'Character Fusion plugin connected'}
        </div>
      )}

      {/* 风格预设网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        {STYLE_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset.id)}
            style={{
              padding: '16px 12px',
              background: selectedPreset === preset.id 
                ? 'linear-gradient(135deg, var(--ef-accent), var(--ef-accent-hover, #4f46e5))' 
                : 'var(--ef-bg-tertiary)',
              border: `2px solid ${selectedPreset === preset.id ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              color: selectedPreset === preset.id ? 'white' : 'var(--ef-text)',
              boxShadow: selectedPreset === preset.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            <div style={{ 
              marginBottom: 8, 
              display: 'flex', 
              justifyContent: 'center',
              opacity: selectedPreset === preset.id ? 1 : 0.8,
            }}>
              {renderIcon(preset.id, selectedPreset === preset.id)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {isZh ? preset.name.zh : preset.name.en}
            </div>
          </button>
        ))}
      </div>

      {/* 子风格选择 */}
      {currentPreset && currentPreset.subStyles.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--ef-text)' }}>
            {isZh ? '细分风格' : 'Sub-style'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {currentPreset.subStyles.map(sub => (
              <button
                key={sub.id}
                onClick={() => handleSubStyleSelect(sub.id)}
                style={{
                  padding: '6px 14px',
                  background: selectedSubStyle === sub.id ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
                  border: `1px solid ${selectedSubStyle === sub.id ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
                  borderRadius: 16,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: selectedSubStyle === sub.id ? 'white' : 'var(--ef-text)',
                  transition: 'all 0.15s ease',
                  fontWeight: selectedSubStyle === sub.id ? 500 : 400,
                }}
              >
                {isZh ? sub.name.zh : sub.name.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 自定义风格输入 */}
      {selectedPreset === 'custom' && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--ef-text)' }}>
            {isZh ? '描述你的风格' : 'Describe your style'}
          </label>
          <textarea
            value={customStyle}
            onChange={e => {
              setCustomStyle(e.target.value);
              onChange({ genre: 'custom', inspiration: e.target.value });
            }}
            placeholder={isZh ? '例如：蒸汽朋克与东方武侠的融合，角色穿着改良汉服搭配机械义肢...' : 'e.g., A fusion of steampunk and wuxia...'}
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              background: 'var(--ef-bg-tertiary)',
              border: '1px solid var(--ef-border)',
              borderRadius: 8,
              color: 'var(--ef-text)',
              fontSize: 13,
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />
        </div>
      )}

      {/* 已选风格摘要 */}
      {selectedPreset && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: 'var(--ef-bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--ef-border)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--ef-text-muted)', marginBottom: 4 }}>
            {isZh ? '当前选择' : 'Current Selection'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ef-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {renderIcon(selectedPreset, false)}
            <span>
              {isZh 
                ? STYLE_PRESETS.find(p => p.id === selectedPreset)?.name.zh 
                : STYLE_PRESETS.find(p => p.id === selectedPreset)?.name.en}
              {selectedSubStyle && currentPreset && (
                <span style={{ color: 'var(--ef-text-muted)', fontWeight: 400 }}>
                  {' / '}
                  {isZh 
                    ? currentPreset.subStyles.find(s => s.id === selectedSubStyle)?.name.zh
                    : currentPreset.subStyles.find(s => s.id === selectedSubStyle)?.name.en}
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
