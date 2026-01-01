/**
 * AI 角色工坊 - 外观设计步骤
 */

import React, { useState, useEffect } from 'react';
import { PluginBridge } from '../../api/pluginBridge';
import type { CharacterAppearance, ImageGenModel } from '../../types';

interface AppearanceStepProps {
  value: Partial<CharacterAppearance>;
  characterName: string;
  style: { genre?: string };
  tags: string[];
  onChange: (appearance: Partial<CharacterAppearance>) => void;
  onImageGenerate?: (url: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isZh: boolean;
}

export const AppearanceStep: React.FC<AppearanceStepProps> = ({
  value,
  characterName,
  style,
  tags,
  onChange,
  onImageGenerate,
  onNext,
  onPrev,
  isZh,
}) => {
  const [isImageGenAvailable, setIsImageGenAvailable] = useState(false);
  const [imageModels, setImageModels] = useState<ImageGenModel[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // 检查 AI 生图插件
  useEffect(() => {
    const checkImageGen = async () => {
      const available = PluginBridge.isAIImageGenAvailable();
      setIsImageGenAvailable(available);
      if (available) {
        const models = await PluginBridge.getImageGenModels();
        setImageModels(models);
      }
    };
    checkImageGen();
  }, []);

  // 生成角色图片
  const handleGenerateImage = async () => {
    if (!isImageGenAvailable) return;
    
    setIsGeneratingImage(true);
    try {
      // 构建提示词
      const prompt = buildImagePrompt();
      const result = await PluginBridge.generateCharacterImage(prompt, {
        style: style.genre,
      });
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

  const canProceed = value.description && value.description.trim().length > 0;


  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ef-text)' }}>
        {isZh ? '外观设计' : 'Appearance Design'}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--ef-text-muted)', marginBottom: 20 }}>
        {isZh ? '设计角色的外观特征' : 'Design your character\'s appearance'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 左侧：表单 */}
        <div>
          {/* 性别 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '性别' : 'Gender'}
            </label>
            <select
              value={value.gender || ''}
              onChange={e => updateField('gender', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
            >
              <option value="">{isZh ? '选择...' : 'Select...'}</option>
              <option value="male">{isZh ? '男性' : 'Male'}</option>
              <option value="female">{isZh ? '女性' : 'Female'}</option>
              <option value="other">{isZh ? '其他' : 'Other'}</option>
            </select>
          </div>

          {/* 年龄 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '年龄' : 'Age'}
            </label>
            <input
              type="text"
              value={value.age || ''}
              onChange={e => updateField('age', e.target.value)}
              placeholder={isZh ? '例如：25岁' : 'e.g., 25 years old'}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
            />
          </div>

          {/* 发色 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '发色' : 'Hair Color'}
            </label>
            <input
              type="text"
              value={value.hairColor || ''}
              onChange={e => updateField('hairColor', e.target.value)}
              placeholder={isZh ? '例如：黑色长发' : 'e.g., Black long hair'}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
            />
          </div>

          {/* 瞳色 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '瞳色' : 'Eye Color'}
            </label>
            <input
              type="text"
              value={value.eyeColor || ''}
              onChange={e => updateField('eyeColor', e.target.value)}
              placeholder={isZh ? '例如：蓝色' : 'e.g., Blue'}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
            />
          </div>
        </div>

        {/* 右侧：图片生成 */}
        <div>
          {isImageGenAvailable ? (
            <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 8, padding: 12, height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ef-text-muted)' }}>
                  {isZh ? 'AI 生成图片' : 'AI Generated Image'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--ef-success)' }}>🔗 {isZh ? '已连接' : 'Connected'}</span>
              </div>
              
              {generatedImageUrl ? (
                <div style={{ position: 'relative' }}>
                  <img src={generatedImageUrl} alt="Generated" style={{ width: '100%', borderRadius: 6 }} />
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    style={{ position: 'absolute', bottom: 8, right: 8, padding: '6px 12px', background: 'var(--ef-accent)', border: 'none', borderRadius: 6, color: 'white', fontSize: 11, cursor: 'pointer' }}
                  >
                    {isZh ? '重新生成' : 'Regenerate'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  style={{ width: '100%', padding: '40px 20px', background: 'var(--ef-bg-secondary)', border: '2px dashed var(--ef-border)', borderRadius: 8, cursor: isGeneratingImage ? 'wait' : 'pointer', color: 'var(--ef-text-muted)', fontSize: 13 }}
                >
                  {isGeneratingImage ? (
                    <><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> {isZh ? '生成中...' : 'Generating...'}</>
                  ) : (
                    <><span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>🎨</span>{isZh ? '点击生成角色图片' : 'Click to generate image'}</>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 8, padding: 20, textAlign: 'center', color: 'var(--ef-text-muted)', fontSize: 12 }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🖼️</span>
              {isZh ? 'AI 生图插件未连接' : 'AI Image Gen not connected'}
            </div>
          )}
        </div>
      </div>

      {/* 服装描述 */}
      <div style={{ marginTop: 16, marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '服装' : 'Clothing'}
        </label>
        <input
          type="text"
          value={value.clothing || ''}
          onChange={e => updateField('clothing', e.target.value)}
          placeholder={isZh ? '描述角色的服装风格...' : 'Describe clothing style...'}
          style={{ width: '100%', padding: '8px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
        />
      </div>

      {/* 外观描述 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
          {isZh ? '外观描述 *' : 'Appearance Description *'}
        </label>
        <textarea
          value={value.description || ''}
          onChange={e => onChange({ ...value, description: e.target.value })}
          placeholder={isZh ? '详细描述角色的外观特征...' : 'Describe the character\'s appearance in detail...'}
          style={{ width: '100%', minHeight: 80, padding: 12, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, resize: 'vertical' }}
        />
      </div>

      {/* 导航按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onPrev} style={{ padding: '10px 20px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 14, cursor: 'pointer' }}>
          {isZh ? '← 上一步' : '← Back'}
        </button>
        <button onClick={onNext} disabled={!canProceed} style={{ padding: '10px 24px', background: canProceed ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: 'none', borderRadius: 8, color: canProceed ? 'white' : 'var(--ef-text-muted)', fontSize: 14, fontWeight: 500, cursor: canProceed ? 'pointer' : 'not-allowed' }}>
          {isZh ? '下一步 →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};
