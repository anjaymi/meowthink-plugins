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
  onGenerateAppearance?: () => Promise<string>;
  onGenerateField?: (field: string, currentValue: string) => Promise<string>;
  isGenerating?: boolean;
  isZh: boolean;
}

// AI 生成按钮组件
const AIFieldButton: React.FC<{
  onClick: () => void;
  isGenerating: boolean;
  isZh: boolean;
  mode: 'generate' | 'refine';
}> = ({ onClick, isGenerating, isZh, mode }) => (
  <button
    onClick={onClick}
    disabled={isGenerating}
    title={mode === 'generate' ? (isZh ? 'AI 生成' : 'AI Generate') : (isZh ? 'AI 优化' : 'AI Refine')}
    style={{
      padding: '4px 6px',
      background: isGenerating ? 'var(--ef-bg-tertiary)' : (mode === 'generate' ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)'),
      border: mode === 'refine' ? '1px solid var(--ef-border)' : 'none',
      borderRadius: 4,
      color: isGenerating ? 'var(--ef-text-muted)' : (mode === 'generate' ? 'white' : 'var(--ef-text-muted)'),
      fontSize: 10,
      cursor: isGenerating ? 'wait' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    {isGenerating ? (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ) : (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )}
    {mode === 'generate' ? (isZh ? '生成' : 'Gen') : (isZh ? '优化' : 'Fix')}
  </button>
);

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  value,
  characterName,
  style,
  tags,
  onChange,
  onImageGenerate,
  onGenerateAppearance,
  onGenerateField,
  isGenerating = false,
  isZh,
}) => {
  const [isImageGenAvailable, setIsImageGenAvailable] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<ImageGenModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  // 检查 AI 生图插件并获取模型列表
  useEffect(() => {
    const checkImageGen = async () => {
      const available = PluginBridge.isAIImageGenAvailable();
      setIsImageGenAvailable(available);
      if (available) {
        const models = await PluginBridge.getImageGenModels();
        setAvailableModels(models);
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0].id);
        }
      }
    };
    checkImageGen();
  }, []);

  // 生成角色图片
  const handleGenerateImage = async () => {
    if (!isImageGenAvailable) return;
    setIsGeneratingImage(true);
    try {
      const prompt = buildImagePrompt();
      const result = await PluginBridge.generateCharacterImage(prompt, { 
        style: style.genre,
        model: selectedModel || undefined,
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

  // 构建图片生成提示词（读取当前页面所有外观数据）
  const buildImagePrompt = () => {
    const parts: string[] = [];
    
    // 角色名
    if (characterName) parts.push(characterName);
    
    // 性别
    if (value.gender && value.gender !== 'unknown') {
      const genderMap: Record<string, string> = {
        male: 'male',
        female: 'female',
        other: 'androgynous',
      };
      parts.push(genderMap[value.gender] || value.gender);
    }
    
    // 年龄
    if (value.age) parts.push(`${value.age} years old`);
    
    // 发色/发型
    if (value.hairColor) parts.push(`${value.hairColor} hair`);
    
    // 瞳色
    if (value.eyeColor) parts.push(`${value.eyeColor} eyes`);
    
    // 服装
    if (value.clothing) parts.push(value.clothing);
    
    // 外观描述（取前100字符避免过长）
    if (value.description) {
      const desc = value.description.slice(0, 100);
      parts.push(desc);
    }
    
    // 标签（最多5个）
    if (tags.length > 0) parts.push(tags.slice(0, 5).join(', '));
    
    // 风格
    if (style.genre) parts.push(`${style.genre} style`);
    
    return parts.join(', ');
  };

  // 更新外观字段
  const updateField = (field: keyof CharacterAppearance, val: string) => {
    onChange({ ...value, [field]: val });
  };

  // AI 生成单个字段
  const handleGenerateFieldValue = async (field: string) => {
    if (!onGenerateField || generatingField) return;
    setGeneratingField(field);
    try {
      const result = await onGenerateField(field, (value as Record<string, string>)[field] || '');
      if (result) {
        updateField(field as keyof CharacterAppearance, result);
      }
    } finally {
      setGeneratingField(null);
    }
  };

  // 渲染带 AI 按钮的输入框
  const renderFieldWithAI = (
    field: keyof CharacterAppearance,
    label: string,
    placeholder: string,
    isSelect?: boolean,
    options?: { value: string; label: string }[]
  ) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ef-text-muted)' }}>{label}</label>
        {onGenerateField && (
          <div style={{ display: 'flex', gap: 4 }}>
            <AIFieldButton
              onClick={() => handleGenerateFieldValue(field)}
              isGenerating={generatingField === field}
              isZh={isZh}
              mode="generate"
            />
            {(value as Record<string, string>)[field] && (
              <AIFieldButton
                onClick={() => handleGenerateFieldValue(field)}
                isGenerating={generatingField === field}
                isZh={isZh}
                mode="refine"
              />
            )}
          </div>
        )}
      </div>
      {isSelect ? (
        <select
          value={(value as Record<string, string>)[field] || 'unknown'}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField(field, e.target.value)}
          style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
        >
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={(value as Record<string, string>)[field] || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(field, e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '7px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
        />
      )}
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 24 }}>
      {/* 左侧：表单 */}
      <div>
        {/* 已选标签展示 */}
        {tags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text-muted)' }}>
              {isZh ? '已选标签' : 'Selected Tags'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(tag => (
                <span key={tag} style={{ padding: '4px 10px', background: 'var(--ef-accent-bg, rgba(99,102,241,0.15))', borderRadius: 12, fontSize: 11, color: 'var(--ef-accent)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ef-text)' }}>
          {isZh ? '外观特征' : 'Appearance Features'}
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {renderFieldWithAI('gender', isZh ? '性别' : 'Gender', '', true, [
            { value: 'unknown', label: isZh ? '未设定' : 'Unknown' },
            { value: 'male', label: isZh ? '男性' : 'Male' },
            { value: 'female', label: isZh ? '女性' : 'Female' },
            { value: 'other', label: isZh ? '其他' : 'Other' },
          ])}
          {renderFieldWithAI('age', isZh ? '年龄' : 'Age', isZh ? '例如：25岁' : 'e.g., 25')}
          {renderFieldWithAI('hairColor', isZh ? '发色' : 'Hair', isZh ? '黑色长发' : 'Black long')}
          {renderFieldWithAI('eyeColor', isZh ? '瞳色' : 'Eyes', isZh ? '蓝色' : 'Blue')}
        </div>

        {/* 服装 */}
        <div style={{ marginBottom: 12 }}>
          {renderFieldWithAI('clothing', isZh ? '服装' : 'Clothing', isZh ? '描述角色的服装风格...' : 'Describe clothing style...')}
        </div>

        {/* 外观描述 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ef-text-muted)' }}>
              {isZh ? '外观描述' : 'Description'}
            </label>
            {onGenerateAppearance && (
              <button
                onClick={async () => {
                  const desc = await onGenerateAppearance();
                  if (desc) onChange({ ...value, description: desc });
                }}
                disabled={isGenerating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                  background: isGenerating ? 'var(--ef-bg-tertiary)' : 'var(--ef-accent)',
                  border: 'none', borderRadius: 6,
                  color: isGenerating ? 'var(--ef-text-muted)' : 'white',
                  fontSize: 11, cursor: isGenerating ? 'wait' : 'pointer',
                }}
              >
                {isGenerating ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    {isZh ? '生成中...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    {isZh ? 'AI 扩写' : 'AI Expand'}
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={value.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...value, description: e.target.value })}
            placeholder={isZh ? '详细描述角色的外观特征...' : 'Describe the character\'s appearance in detail...'}
            style={{ width: '100%', minHeight: 100, padding: 10, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12, resize: 'vertical' }}
          />
        </div>
      </div>

      {/* 右侧：图片生成 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ef-text)', margin: 0 }}>
          {isZh ? '角色图片' : 'Portrait'}
        </h4>

        {isImageGenAvailable ? (
          <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 10, padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 模型选择 */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--ef-text-muted)' }}>
                  {isZh ? '图像模型' : 'Model'}
                </label>
                <button
                  onClick={async () => {
                    const models = await PluginBridge.getImageGenModels();
                    setAvailableModels(models);
                    if (models.length > 0 && !models.find(m => m.id === selectedModel)) {
                      setSelectedModel(models[0].id);
                    }
                  }}
                  title={isZh ? '刷新模型列表' : 'Refresh models'}
                  style={{
                    padding: '2px 6px',
                    background: 'transparent',
                    border: '1px solid var(--ef-border)',
                    borderRadius: 4,
                    color: 'var(--ef-text-muted)',
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  {isZh ? '刷新' : 'Refresh'}
                </button>
              </div>
              <select
                value={selectedModel}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedModel(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', background: 'var(--ef-bg-secondary)', border: '1px solid var(--ef-border)', borderRadius: 4, color: 'var(--ef-text)', fontSize: 11 }}
              >
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))
                ) : (
                  <option value="">{isZh ? '暂无模型' : 'No models'}</option>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ef-success, #22c55e)' }} />
              <span style={{ fontSize: 10, color: 'var(--ef-success, #22c55e)' }}>{isZh ? '已连接' : 'Connected'}</span>
            </div>
            
            {/* 图片预览区 */}
            <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column' }}>
              {generatedImageUrl ? (
                <div style={{ position: 'relative', flex: 1 }}>
                  <img src={generatedImageUrl} alt="Generated" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  {/* 重新生成按钮组 */}
                  <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      title={isZh ? '重新生成图片' : 'Regenerate image'}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        borderRadius: 6,
                        color: 'white',
                        fontSize: 11,
                        cursor: isGeneratingImage ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {isGeneratingImage ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 4v6h-6" />
                          <path d="M1 20v-6h6" />
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                      )}
                      {isZh ? '重新生成' : 'Regen'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--ef-bg-secondary)', border: '2px dashed var(--ef-border)', borderRadius: 8,
                    cursor: isGeneratingImage ? 'wait' : 'pointer', color: 'var(--ef-text-muted)', fontSize: 11,
                  }}
                >
                  {isGeneratingImage ? (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: 8, animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      {isZh ? '生成中...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                        <path d="M2 2l7.586 7.586" />
                        <circle cx="11" cy="11" r="2" />
                      </svg>
                      {isZh ? '点击生成角色图片' : 'Click to generate'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 10, padding: 24, textAlign: 'center', color: 'var(--ef-text-muted)', fontSize: 11, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 10, opacity: 0.5 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div style={{ marginBottom: 4 }}>{isZh ? 'AI 生图未连接' : 'AI Image Gen not connected'}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{isZh ? '请先启用 AI 生图插件' : 'Enable AI Image Gen plugin first'}</div>
          </div>
        )}
      </div>
    </div>
  );
};
