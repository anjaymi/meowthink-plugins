/**
 * AI 角色工坊 - 集成面板外观标签页
 */

import React, { useState, useEffect } from 'react';
import { PluginBridge } from '../../api/pluginBridge';
import type { CharacterAppearance, ImageGenModel } from '../../types';

interface AppearanceTabProps {
  value: Partial<CharacterAppearance>;
  characterName: string;
  style: { genre?: string };
  tags: string[];
  onChange: (appearance: Partial<CharacterAppearance>) => void;
  onImageGenerate?: (url: string) => void;
  isZh: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  value,
  characterName,
  style,
  tags,
  onChange,
  onImageGenerate,
  isZh,
}) => {
  const [isImageGenAvailable, setIsImageGenAvailable] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // 检查 AI 生图插件
  useEffect(() => {
    const checkImageGen = async () => {
      const available = PluginBridge.isAIImageGenAvailable();
      setIsImageGenAvailable(available);
    };
    checkImageGen();
  }, []);

  // 生成角色图片
  const handleGenerateImage = async () => {
    if (!isImageGenAvailable) return;
    setIsGeneratingImage(true);
    try {
      const prompt = buildImagePrompt();
      const result = await PluginBridge.generateCharacterImage(prompt, { style: style.genre });
      if (result) {
        setGeneratedImageUrl(result.url);
        onImageGenerate?.(result.url);
      }
    } catch (err) {
      console.error('生成图片失败:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 构建图片生成提示词
  const buildImagePrompt = () => {
    const parts = [characterName];
    if (value.gender) parts.push(value.gender);
    if (value.hairColor) parts.push(`${value.hairColor} hair`);
    if (value.eyeColor) parts.push(`${value.eyeColor} eyes`);
    if (value.clothing) parts.push(value.clothing);
    if (tags.length > 0) parts.push(tags.slice(0, 5).join(', '));
    if (style.genre) parts.push(`${style.genre} style`);
    return parts.join(', ');
  };

  // 更新外观字段
  const updateField = (field: keyof CharacterAppearance, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20 }}>
      {/* 左侧：表单 */}
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ef-text)' }}>
          {isZh ? '外观特征' : 'Appearance Features'}
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {/* 性别 */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '性别' : 'Gender'}
            </label>
            <select
              value={value.gender || ''}
              onChange={e => updateField('gender', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
            >
              <option value="">{isZh ? '选择...' : 'Select...'}</option>
              <option value="male">{isZh ? '男性' : 'Male'}</option>
              <option value="female">{isZh ? '女性' : 'Female'}</option>
              <option value="other">{isZh ? '其他' : 'Other'}</option>
            </select>
          </div>

          {/* 年龄 */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '年龄' : 'Age'}
            </label>
            <input
              type="text"
              value={value.age || ''}
              onChange={e => updateField('age', e.target.value)}
              placeholder={isZh ? '例如：25岁' : 'e.g., 25'}
              style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
            />
          </div>

          {/* 发色 */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '发色' : 'Hair'}
            </label>
            <input
              type="text"
              value={value.hairColor || ''}
              onChange={e => updateField('hairColor', e.target.value)}
              placeholder={isZh ? '黑色长发' : 'Black long'}
              style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
            />
          </div>

          {/* 瞳色 */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '瞳色' : 'Eyes'}
            </label>
            <input
              type="text"
              value={value.eyeColor || ''}
              onChange={e => updateField('eyeColor', e.target.value)}
              placeholder={isZh ? '蓝色' : 'Blue'}
              style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
            />
          </div>
        </div>

        {/* 服装 */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '服装' : 'Clothing'}
          </label>
          <input
            type="text"
            value={value.clothing || ''}
            onChange={e => updateField('clothing', e.target.value)}
            placeholder={isZh ? '描述角色的服装风格...' : 'Describe clothing style...'}
            style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          />
        </div>

        {/* 外观描述 */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
            {isZh ? '外观描述' : 'Description'}
          </label>
          <textarea
            value={value.description || ''}
            onChange={e => onChange({ ...value, description: e.target.value })}
            placeholder={isZh ? '详细描述角色的外观特征...' : 'Describe the character\'s appearance in detail...'}
            style={{ width: '100%', minHeight: 100, padding: 10, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12, resize: 'vertical' }}
          />
        </div>
      </div>

      {/* 右侧：图片生成 */}
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ef-text)' }}>
          {isZh ? '角色图片' : 'Portrait'}
        </h4>

        {isImageGenAvailable ? (
          <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 8, padding: 10, height: 'calc(100% - 30px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--ef-success)' }}>🔗 {isZh ? '已连接' : 'Connected'}</span>
            </div>
            
            {generatedImageUrl ? (
              <div style={{ position: 'relative' }}>
                <img src={generatedImageUrl} alt="Generated" style={{ width: '100%', borderRadius: 6 }} />
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  style={{ position: 'absolute', bottom: 6, right: 6, padding: '4px 10px', background: 'var(--ef-accent)', border: 'none', borderRadius: 4, color: 'white', fontSize: 10, cursor: 'pointer' }}
                >
                  {isZh ? '重新生成' : 'Regen'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                style={{ width: '100%', padding: '30px 15px', background: 'var(--ef-bg-secondary)', border: '2px dashed var(--ef-border)', borderRadius: 6, cursor: isGeneratingImage ? 'wait' : 'pointer', color: 'var(--ef-text-muted)', fontSize: 11, textAlign: 'center' }}
              >
                {isGeneratingImage ? (
                  <><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span><br />{isZh ? '生成中...' : 'Generating...'}</>
                ) : (
                  <><span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>🎨</span>{isZh ? '点击生成' : 'Generate'}</>
                )}
              </button>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 8, padding: 20, textAlign: 'center', color: 'var(--ef-text-muted)', fontSize: 11 }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>🖼️</span>
            {isZh ? 'AI 生图未连接' : 'AI Image Gen not connected'}
          </div>
        )}
      </div>
    </div>
  );
};
