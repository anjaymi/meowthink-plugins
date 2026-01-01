/**
 * AI 角色工坊 - 集成面板基础信息标签页
 * 合并名字和标签功能
 */

import React, { useState, useEffect } from 'react';
import { NAMING_CULTURES, TAG_PRESETS, PERSONALITY_TRAITS } from '../../constants';
import { PluginBridge } from '../../api/pluginBridge';
import type { NamingOptions, GeneratedName } from '../../types';

interface BasicTabProps {
  name: string;
  tags: string[];
  style: { genre?: string };
  onNameChange: (name: string, origin?: string, meaning?: string) => void;
  onTagsChange: (tags: string[]) => void;
  onGenerateNames: (options: NamingOptions) => Promise<{ names: GeneratedName[] }>;
  isGenerating: boolean;
  isZh: boolean;
}

export const BasicTab: React.FC<BasicTabProps> = ({
  name,
  tags,
  style,
  onNameChange,
  onTagsChange,
  onGenerateNames,
  isGenerating,
  isZh,
}) => {
  const [culture, setCulture] = useState<NamingOptions['culture']>('fantasy');
  const [gender, setGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [customName, setCustomName] = useState(name);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);
  const [customTag, setCustomTag] = useState('');
  const [fusionTags, setFusionTags] = useState<string[]>([]);

  // 同步外部值
  useEffect(() => { setCustomName(name); }, [name]);
  useEffect(() => { setSelectedTags(tags); }, [tags]);

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
    try {
      const result = await onGenerateNames({ culture, gender, style: style.genre, count: 6 });
      setGeneratedNames(result.names);
    } catch (err) {
      console.error('生成名字失败:', err);
    }
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* 左侧：名字 */}
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ef-text)' }}>
          {isZh ? '角色名字' : 'Character Name'}
        </h4>

        {/* 生成选项 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <select
            value={culture}
            onChange={e => setCulture(e.target.value as NamingOptions['culture'])}
            style={{ padding: '6px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          >
            {NAMING_CULTURES.map(c => (
              <option key={c.value} value={c.value}>{isZh ? c.label.zh : c.label.en}</option>
            ))}
          </select>
          <select
            value={gender}
            onChange={e => setGender(e.target.value as 'male' | 'female' | 'neutral')}
            style={{ padding: '6px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          >
            <option value="neutral">{isZh ? '中性' : 'Neutral'}</option>
            <option value="male">{isZh ? '男性' : 'Male'}</option>
            <option value="female">{isZh ? '女性' : 'Female'}</option>
          </select>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{ width: '100%', padding: '8px 14px', background: 'var(--ef-accent)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 500, cursor: isGenerating ? 'wait' : 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          {isGenerating ? '⏳' : '✨'} {isZh ? 'AI 生成名字' : 'Generate Names'}
        </button>

        {/* 生成的名字 */}
        {generatedNames.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
            {generatedNames.map((n, i) => (
              <button
                key={i}
                onClick={() => handleSelectName(n)}
                style={{ padding: '8px', background: customName === n.name ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: `1px solid ${customName === n.name ? 'var(--ef-accent)' : 'var(--ef-border)'}`, borderRadius: 6, cursor: 'pointer', textAlign: 'left', color: customName === n.name ? 'white' : 'var(--ef-text)' }}
              >
                <div style={{ fontSize: 13, fontWeight: 500 }}>{n.name}</div>
                {n.meaning && <div style={{ fontSize: 10, opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.meaning}</div>}
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
          style={{ width: '100%', padding: '10px 12px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
        />
      </div>

      {/* 右侧：标签 */}
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ef-text)' }}>
          {isZh ? '属性标签' : 'Tags'}
        </h4>

        {/* 已选标签 */}
        {selectedTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {selectedTags.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', background: 'var(--ef-accent)', borderRadius: 12, fontSize: 11, color: 'white' }}>
                {tag}
                <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1, opacity: 0.8 }}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* 融合插件标签 */}
        {fusionTags.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text-muted)' }}>
              <span>🔗</span> {isZh ? '来自角色融合' : 'From Fusion'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {fusionTags.slice(0, 8).map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} style={{ padding: '4px 10px', background: selectedTags.includes(tag) ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: `1px solid ${selectedTags.includes(tag) ? 'var(--ef-accent)' : 'var(--ef-border)'}`, borderRadius: 12, cursor: 'pointer', fontSize: 11, color: selectedTags.includes(tag) ? 'white' : 'var(--ef-text)' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 预设标签 */}
        <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 10 }}>
          {stylePresets.slice(0, 2).map(category => (
            <div key={category.category} style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>{category.category}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {category.tags.slice(0, 6).map(tag => (
                  <button key={tag.value} onClick={() => toggleTag(tag.value)} style={{ padding: '4px 10px', background: selectedTags.includes(tag.value) ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: `1px solid ${selectedTags.includes(tag.value) ? 'var(--ef-accent)' : 'var(--ef-border)'}`, borderRadius: 12, cursor: 'pointer', fontSize: 11, color: selectedTags.includes(tag.value) ? 'white' : 'var(--ef-text)' }}>
                    {isZh ? tag.label.zh : tag.label.en}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 自定义标签 */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomTag()}
            placeholder={isZh ? '添加标签...' : 'Add tag...'}
            style={{ flex: 1, padding: '6px 10px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 12 }}
          />
          <button onClick={addCustomTag} disabled={!customTag.trim()} style={{ padding: '6px 12px', background: customTag.trim() ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: 'none', borderRadius: 6, color: customTag.trim() ? 'white' : 'var(--ef-text-muted)', fontSize: 12, cursor: customTag.trim() ? 'pointer' : 'not-allowed' }}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};
