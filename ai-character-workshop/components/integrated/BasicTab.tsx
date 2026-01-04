/**
 * AI 角色工坊 - 集成面板基础信息标签页
 * 合并名字和标签功能，显示已选风格，添加 AI 配置检查
 */

import React, { useState, useEffect } from 'react';
import { NAMING_CULTURES, TAG_PRESETS, STYLE_PRESETS } from '../../constants';
import { PluginBridge } from '../../api/pluginBridge';
import { storage } from '../../../../../utils/storage';
import type { NamingOptions, GeneratedName, CharacterStyle } from '../../types';

interface BasicTabProps {
  name: string;
  tags: string[];
  style: Partial<CharacterStyle>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  onNameChange: (name: string, origin?: string, meaning?: string) => void;
  onTagsChange: (tags: string[]) => void;
  onGenderChange?: (gender: 'male' | 'female' | 'other' | 'unknown') => void;
  onGenerateNames: (options: NamingOptions) => Promise<{ names: GeneratedName[] }>;
  isGenerating: boolean;
  isZh: boolean;
}

// 检查 AI 配置是否可用（异步，从 IndexedDB 读取）
async function checkAIConfig(): Promise<{ available: boolean; message?: string }> {
  try {
    const config = await storage.get<any>('ef_config');
    if (!config) {
      return { available: false, message: '未找到配置' };
    }
    
    const activeIndex = config.activeApiIndex || 0;
    const activeConfig = config.apiPool?.[activeIndex];
    
    // 检查是否有 API 密钥
    const apiKey = activeConfig?.key || config.key;
    if (!apiKey) {
      return { available: false, message: '未配置 AI API 密钥' };
    }
    
    return { available: true };
  } catch {
    return { available: false, message: '配置读取失败' };
  }
}

export const BasicTab: React.FC<BasicTabProps> = ({
  name,
  tags,
  style,
  gender: externalGender,
  onNameChange,
  onTagsChange,
  onGenderChange,
  onGenerateNames,
  isGenerating,
  isZh,
}) => {
  const [culture, setCulture] = useState<NamingOptions['culture']>('fantasy');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unknown'>(externalGender || 'unknown');
  const [translateToChinese, setTranslateToChinese] = useState(true); // 翻译成中文选项
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [customName, setCustomName] = useState(name);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);
  const [customTag, setCustomTag] = useState('');
  const [fusionTags, setFusionTags] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showSettingsHint, setShowSettingsHint] = useState(false);

  // 同步外部值
  useEffect(() => { setCustomName(name); }, [name]);
  useEffect(() => { setSelectedTags(tags); }, [tags]);
  useEffect(() => { if (externalGender) setGender(externalGender); }, [externalGender]);

  // 性别变更时同步到外部
  const handleGenderChange = (newGender: 'male' | 'female' | 'other' | 'unknown') => {
    setGender(newGender);
    onGenderChange?.(newGender);
  };

  // 从角色融合插件获取标签
  useEffect(() => {
    const loadFusionTags = async () => {
      if (style.genre && PluginBridge.isCharacterFusionAvailable()) {
        const t = await PluginBridge.getFusionTagsByStyle(style.genre);
        setFusionTags(t);
      }
    };
    loadFusionTags();
  }, [style.genre]);

  // 生成名字
  const handleGenerate = async () => {
    setAiError(null);
    setShowSettingsHint(false);
    
    // 先检查 AI 配置（异步检查 IndexedDB）
    const configCheck = await checkAIConfig();
    if (!configCheck.available) {
      setAiError(configCheck.message || (isZh ? '未配置 AI 接口' : 'AI not configured'));
      setShowSettingsHint(true);
      return;
    }
    
    try {
      // 映射性别值用于 AI 生成（unknown/other 映射为 neutral）
      const aiGender = gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'neutral';
      const result = await onGenerateNames({ 
        culture, 
        gender: aiGender, 
        style: style.genre, 
        count: 6,
        translateToChinese, // 传递翻译选项
      });
      setGeneratedNames(result.names);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : (isZh ? '生成失败' : 'Generation failed');
      setAiError(errorMsg);
      // 如果是配置相关错误，显示设置提示
      if (errorMsg.includes('API') || errorMsg.includes('配置') || errorMsg.includes('key') || errorMsg.includes('密钥')) {
        setShowSettingsHint(true);
      }
    }
  };

  // 打开设置
  const openSettings = () => {
    window.dispatchEvent(new CustomEvent('meowthink:openSettings', { detail: { tab: 'ai' } }));
  };

  // 选择名字
  const handleSelectName = (n: GeneratedName) => {
    setCustomName(n.name);
    onNameChange(n.name, n.origin, n.meaning);
  };

  // 切换标签
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onTagsChange(newTags);
  };

  // 添加自定义标签
  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()];
      setSelectedTags(newTags);
      onTagsChange(newTags);
      setCustomTag('');
    }
  };

  // 移除标签
  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    onTagsChange(newTags);
  };

  const stylePresets = TAG_PRESETS[style.genre || 'fantasy'] || TAG_PRESETS.fantasy;
  const currentStylePreset = STYLE_PRESETS.find(p => p.id === style.genre);
  const currentSubStyle = currentStylePreset?.subStyles.find(s => s.id === style.subGenre);

  return (
    <div>
      {/* 已选风格信息卡片 */}
      {style.genre && (
        <div style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, var(--ef-accent-bg, rgba(99,102,241,0.1)), transparent)',
          borderRadius: 10,
          border: '1px solid var(--ef-accent)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--ef-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            {/* SVG 图标替代 emoji */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--ef-text-muted)', marginBottom: 2 }}>
              {isZh ? '当前风格' : 'Current Style'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ef-text)' }}>
              {isZh ? currentStylePreset?.name.zh : currentStylePreset?.name.en}
              {currentSubStyle && (
                <span style={{ fontWeight: 400, color: 'var(--ef-text-muted)' }}>
                  {' · '}
                  {isZh ? currentSubStyle.name.zh : currentSubStyle.name.en}
                </span>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ef-text-muted)' }}>
            {isZh ? '影响名字和标签推荐' : 'Affects name & tag suggestions'}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 左侧：名字 */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ef-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {isZh ? '角色名字' : 'Character Name'}
          </h4>

          {/* AI 错误提示 */}
          {aiError && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--ef-error-bg, rgba(239,68,68,0.1))',
              border: '1px solid var(--ef-error, #ef4444)',
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 12,
              color: 'var(--ef-error, #ef4444)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: showSettingsHint ? 8 : 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {aiError}
              </div>
              {showSettingsHint && (
                <button
                  onClick={openSettings}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--ef-accent)',
                    border: 'none',
                    borderRadius: 6,
                    color: 'white',
                    fontSize: 11,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  {isZh ? '前往设置 AI 接口' : 'Go to AI Settings'}
                </button>
              )}
            </div>
          )}

          {/* 生成选项 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <select
              value={culture}
              onChange={e => setCulture(e.target.value as NamingOptions['culture'])}
              style={{ padding: '8px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
            >
              {NAMING_CULTURES.map(c => (
                <option key={c.value} value={c.value}>{isZh ? c.label.zh : c.label.en}</option>
              ))}
            </select>
            <select
              value={gender}
              onChange={e => handleGenderChange(e.target.value as 'male' | 'female' | 'other' | 'unknown')}
              style={{ padding: '8px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
            >
              <option value="unknown">{isZh ? '未设定' : 'Unknown'}</option>
              <option value="male">{isZh ? '男性' : 'Male'}</option>
              <option value="female">{isZh ? '女性' : 'Female'}</option>
              <option value="other">{isZh ? '其他' : 'Other'}</option>
            </select>
          </div>

          {/* 翻译成中文选项 */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--ef-text)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={translateToChinese}
              onChange={e => setTranslateToChinese(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            {isZh ? '翻译成中文' : 'Translate to Chinese'}
            <span style={{ fontSize: 11, color: 'var(--ef-text-muted)' }}>
              {isZh ? '（外国名字将显示中文译名）' : '(Foreign names will be translated)'}
            </span>
          </label>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: isGenerating ? 'var(--ef-bg-tertiary)' : 'var(--ef-accent)',
              border: 'none',
              borderRadius: 8,
              color: isGenerating ? 'var(--ef-text-muted)' : 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: isGenerating ? 'wait' : 'pointer',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            {isGenerating ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {isZh ? '生成中...' : 'Generating...'}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {isZh ? 'AI 生成名字' : 'Generate Names'}
              </>
            )}
          </button>

          {/* 生成的名字 */}
          {generatedNames.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
              {generatedNames.map((n, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectName(n)}
                  style={{
                    padding: '10px',
                    background: customName === n.name ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
                    border: `1px solid ${customName === n.name ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: customName === n.name ? 'white' : 'var(--ef-text)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{n.name}</div>
                  {n.meaning && (
                    <div style={{ fontSize: 11, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {n.meaning}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 自定义名字 */}
          <input
            type="text"
            value={customName}
            onChange={e => { setCustomName(e.target.value); onNameChange(e.target.value); }}
            placeholder={isZh ? '输入角色名字...' : 'Enter character name...'}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--ef-bg-tertiary)',
              border: '1px solid var(--ef-border)',
              borderRadius: 8,
              color: 'var(--ef-text)',
              fontSize: 14,
            }}
          />
        </div>

        {/* 右侧：标签 */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ef-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            {isZh ? '属性标签' : 'Tags'}
          </h4>

          {/* 已选标签 */}
          {selectedTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {selectedTags.map(tag => (
                <span key={tag} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  background: 'var(--ef-accent)',
                  borderRadius: 14,
                  fontSize: 12,
                  color: 'white',
                }}>
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1, opacity: 0.8 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 融合插件标签 */}
          {fusionTags.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text-muted)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {isZh ? '来自角色融合' : 'From Fusion'}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {fusionTags.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '5px 12px',
                      background: selectedTags.includes(tag) ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
                      border: `1px solid ${selectedTags.includes(tag) ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
                      borderRadius: 14,
                      cursor: 'pointer',
                      fontSize: 12,
                      color: selectedTags.includes(tag) ? 'white' : 'var(--ef-text)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 预设标签 */}
          <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
            {stylePresets.map(category => (
              <div key={category.category} style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text-muted)' }}>
                  {category.category}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {category.tags.map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      style={{
                        padding: '5px 12px',
                        background: selectedTags.includes(tag.value) ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
                        border: `1px solid ${selectedTags.includes(tag.value) ? 'var(--ef-accent)' : 'var(--ef-border)'}`,
                        borderRadius: 14,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: selectedTags.includes(tag.value) ? 'white' : 'var(--ef-text)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isZh ? tag.label.zh : tag.label.en}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 自定义标签 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              placeholder={isZh ? '添加自定义标签...' : 'Add custom tag...'}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--ef-bg-tertiary)',
                border: '1px solid var(--ef-border)',
                borderRadius: 8,
                color: 'var(--ef-text)',
                fontSize: 12,
              }}
            />
            <button
              onClick={addCustomTag}
              disabled={!customTag.trim()}
              style={{
                padding: '8px 14px',
                background: customTag.trim() ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)',
                border: 'none',
                borderRadius: 8,
                color: customTag.trim() ? 'white' : 'var(--ef-text-muted)',
                fontSize: 12,
                cursor: customTag.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
