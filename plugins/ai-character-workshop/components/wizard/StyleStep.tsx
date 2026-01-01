/**
 * AI 角色工坊 - 风格选择步骤
 */

import React, { useState, useEffect } from 'react';
import { STYLE_PRESETS } from '../../constants';
import { PluginBridge } from '../../api/pluginBridge';
import type { CharacterStyle, FusionStyle } from '../../types';

interface StyleStepProps {
  value: Partial<CharacterStyle>;
  onChange: (style: Partial<CharacterStyle>) => void;
  onNext: () => void;
  isZh: boolean;
}

export const StyleStep: React.FC<StyleStepProps> = ({
  value,
  onChange,
  onNext,
  isZh,
}) => {
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

  // 是否可以继续
  const canProceed = selectedPreset && (selectedPreset === 'custom' ? customStyle.trim() : true);

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 600, 
        marginBottom: 8,
        color: 'var(--ef-text)',
      }}>
        {isZh ? '选择角色风格' : 'Choose Character Style'}
      </h3>
      <p style={{ 
        fontSize: 13, 
        color: 'var(--ef-text-muted)', 
        marginBottom: 20,
      }}>
        {isZh 
          ? '选择角色所属的世界观和风格类型' 
          : 'Select the genre and style for your character'}
      </p>

      {/* 角色融合插件提示 */}
      {isFusionAvailable && fusionStyles.length > 0 && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--ef-accent-bg, rgba(99,102,241,0.1))',
          border: '1px solid var(--ef-accent)',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 12,
        }}>
          <span style={{ marginRight: 6 }}>🔗</span>
          {isZh 
            ? '已连接角色融合插件，可使用更多风格数据' 
            : 'Character Fusion plugin connected'}
        </div>
      )}

      {/* 风格预设网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
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
                ? 'var(--ef-accent)' 
                : 'var(--ef-bg-tertiary)',
              border: `2px solid ${selectedPreset === preset.id 
                ? 'var(--ef-accent)' 
                : 'var(--ef-border)'}`,
              borderRadius: 10,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
              color: selectedPreset === preset.id ? 'white' : 'var(--ef-text)',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{preset.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {isZh ? preset.name.zh : preset.name.en}
            </div>
          </button>
        ))}
      </div>

      {/* 子风格选择 */}
      {currentPreset && currentPreset.subStyles.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 13, 
            fontWeight: 500, 
            marginBottom: 8,
            color: 'var(--ef-text)',
          }}>
            {isZh ? '细分风格' : 'Sub-style'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {currentPreset.subStyles.map(sub => (
              <button
                key={sub.id}
                onClick={() => handleSubStyleSelect(sub.id)}
                style={{
                  padding: '6px 14px',
                  background: selectedSubStyle === sub.id 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-bg-tertiary)',
                  border: `1px solid ${selectedSubStyle === sub.id 
                    ? 'var(--ef-accent)' 
                    : 'var(--ef-border)'}`,
                  borderRadius: 16,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: selectedSubStyle === sub.id ? 'white' : 'var(--ef-text)',
                  transition: 'all 0.15s ease',
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
        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 13, 
            fontWeight: 500, 
            marginBottom: 8,
            color: 'var(--ef-text)',
          }}>
            {isZh ? '描述你的风格' : 'Describe your style'}
          </label>
          <textarea
            value={customStyle}
            onChange={e => {
              setCustomStyle(e.target.value);
              onChange({ genre: 'custom', inspiration: e.target.value });
            }}
            placeholder={isZh 
              ? '例如：蒸汽朋克与东方武侠的融合...' 
              : 'e.g., A fusion of steampunk and wuxia...'}
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
            }}
          />
        </div>
      )}

      {/* 下一步按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            transition: 'all 0.15s ease',
          }}
        >
          {isZh ? '下一步 →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};
