/**
 * AI 角色工坊 - 集成面板风格标签页
 * 复用 StyleStep 组件，去掉导航按钮
 */

import React, { useState, useEffect } from 'react';
import { STYLE_PRESETS } from '../../constants';
import { PluginBridge } from '../../api/pluginBridge';
import type { CharacterStyle, FusionStyle } from '../../types';

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

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--ef-text)' }}>
        {isZh ? '选择角色风格' : 'Choose Character Style'}
      </h3>
      <p style={{ fontSize: 12, color: 'var(--ef-text-muted)', marginBottom: 16 }}>
        {isZh ? '选择角色所属的世界观和风格类型' : 'Select the genre and style for your character'}
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
        }}>
          <span style={{ marginRight: 6 }}>🔗</span>
          {isZh ? '已连接角色融合插件，可使用更多风格数据' : 'Character Fusion plugin connected'}
        </div>
      )}

      {/* 风格预设网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        {STYLE_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset.id)}
            style={{
              padding: '12px 10px',
              background: selectedPreset === preset.id ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
              border: `2px solid ${selectedPreset === preset.id ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
              color: selectedPreset === preset.id ? 'white' : 'var(--ef-text)',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{preset.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>
              {isZh ? preset.name.zh : preset.name.en}
            </div>
          </button>
        ))}
      </div>

      {/* 子风格选择 */}
      {currentPreset && currentPreset.subStyles.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text)' }}>
            {isZh ? '细分风格' : 'Sub-style'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {currentPreset.subStyles.map(sub => (
              <button
                key={sub.id}
                onClick={() => handleSubStyleSelect(sub.id)}
                style={{
                  padding: '5px 12px',
                  background: selectedSubStyle === sub.id ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
                  border: `1px solid ${selectedSubStyle === sub.id ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontSize: 11,
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
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text)' }}>
            {isZh ? '描述你的风格' : 'Describe your style'}
          </label>
          <textarea
            value={customStyle}
            onChange={e => {
              setCustomStyle(e.target.value);
              onChange({ genre: 'custom', inspiration: e.target.value });
            }}
            placeholder={isZh ? '例如：蒸汽朋克与东方武侠的融合...' : 'e.g., A fusion of steampunk and wuxia...'}
            style={{
              width: '100%',
              minHeight: 70,
              padding: 10,
              background: 'var(--ef-bg-tertiary)',
              border: '1px solid var(--ef-border)',
              borderRadius: 6,
              color: 'var(--ef-text)',
              fontSize: 12,
              resize: 'vertical',
            }}
          />
        </div>
      )}
    </div>
  );
};
