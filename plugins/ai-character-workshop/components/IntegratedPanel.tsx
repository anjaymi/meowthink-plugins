/**
 * AI 角色工坊 - 集成式主面板
 * 所有功能通过顶部标签切换，无需跳转
 * 支持拖拽移动和调整大小
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkshopState } from '../hooks/useWorkshopState';
import { useAIGenerate, getAvailableApiConfigs, setOverrideModel } from '../hooks/useAIGenerate';
import { VersionManager } from './wizard/VersionManager';
import { StyleTab, BasicTab, AppearanceTab, PersonalityTab, BackstoryTab, AgentTab } from './integrated';
import type { CharacterData, CharacterInput, NamingOptions, BackstoryOptions, CharacterPersonality, CharacterAgent } from '../types';

// 集成面板的标签页类型
type IntegratedTab = 'overview' | 'style' | 'basic' | 'appearance' | 'personality' | 'backstory' | 'agent' | 'export';

interface TabConfig {
  id: IntegratedTab;
  name: { zh: string; en: string };
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'overview', name: { zh: '总览', en: 'Overview' }, icon: '' },
  { id: 'style', name: { zh: '风格', en: 'Style' }, icon: '' },
  { id: 'basic', name: { zh: '基础', en: 'Basic' }, icon: '' },
  { id: 'appearance', name: { zh: '外观', en: 'Look' }, icon: '' },
  { id: 'personality', name: { zh: '性格', en: 'Personality' }, icon: '' },
  { id: 'backstory', name: { zh: '背景', en: 'Story' }, icon: '' },
  { id: 'agent', name: { zh: '智能体', en: 'Agent' }, icon: '' },
  { id: 'export', name: { zh: '导出', en: 'Export' }, icon: '' },
];

// 最小/最大尺寸限制
const MIN_WIDTH = 600;
const MIN_HEIGHT = 400;
const MAX_WIDTH_RATIO = 0.95;
const MAX_HEIGHT_RATIO = 0.95;

interface IntegratedPanelProps {
  isOpen: boolean;
  onClose: () => void;
  characters?: CharacterInput[];
  isZh: boolean;
}

export const IntegratedPanel: React.FC<IntegratedPanelProps> = ({
  isOpen,
  onClose,
  characters = [],
  isZh,
}) => {
  const { state, actions } = useWorkshopState();
  const aiGenerate = useAIGenerate();
  const [activeTab, setActiveTab] = useState<IntegratedTab>('overview');
  
  // 面板尺寸和位置状态
  const [panelSize, setPanelSize] = useState({ width: 1000, height: 700 });
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [isPositionInitialized, setIsPositionInitialized] = useState(false);
  
  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0, width: 0, height: 0 });
  
  // 模型选择状态
  const [availableModels, setAvailableModels] = useState<{ name: string; model: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // 初始化面板尺寸和位置
  useEffect(() => {
    if (isOpen && !isPositionInitialized) {
      const w = Math.min(1000, window.innerWidth * 0.92);
      const h = Math.min(700, window.innerHeight * 0.88);
      setPanelSize({ width: w, height: h });
      setPanelPosition({
        x: (window.innerWidth - w) / 2,
        y: (window.innerHeight - h) / 2,
      });
      setIsPositionInitialized(true);
      
      getAvailableApiConfigs().then(({ configs, activeIndex }) => {
        if (configs.length > 0) {
          const models = configs.map((c) => ({
            name: c.name || `${c.provider} - ${c.model}`,
            model: c.model,
          }));
          setAvailableModels(models);
          setSelectedModel(configs[activeIndex]?.model || configs[0]?.model || '');
        }
      });
    }
    if (!isOpen) {
      setIsPositionInitialized(false);
    }
  }, [isOpen, isPositionInitialized]);

  // 拖拽移动处理
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, select, input')) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: panelPosition.x,
      posY: panelPosition.y,
      width: panelSize.width,
      height: panelSize.height,
    };
  }, [panelPosition, panelSize]);

  // 调整大小处理
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(direction);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: panelPosition.x,
      posY: panelPosition.y,
      width: panelSize.width,
      height: panelSize.height,
    };
  }, [panelPosition, panelSize]);

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newX = Math.max(0, Math.min(window.innerWidth - panelSize.width, dragStartRef.current.posX + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - panelSize.height, dragStartRef.current.posY + dy));
        setPanelPosition({ x: newX, y: newY });
      } else if (isResizing) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const maxW = window.innerWidth * MAX_WIDTH_RATIO;
        const maxH = window.innerHeight * MAX_HEIGHT_RATIO;
        
        let newWidth = dragStartRef.current.width;
        let newHeight = dragStartRef.current.height;
        let newX = dragStartRef.current.posX;
        let newY = dragStartRef.current.posY;
        
        if (isResizing.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, Math.min(maxW, dragStartRef.current.width + dx));
        }
        if (isResizing.includes('w')) {
          const potentialWidth = dragStartRef.current.width - dx;
          if (potentialWidth >= MIN_WIDTH && potentialWidth <= maxW) {
            newWidth = potentialWidth;
            newX = dragStartRef.current.posX + dx;
          }
        }
        if (isResizing.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, Math.min(maxH, dragStartRef.current.height + dy));
        }
        if (isResizing.includes('n')) {
          const potentialHeight = dragStartRef.current.height - dy;
          if (potentialHeight >= MIN_HEIGHT && potentialHeight <= maxH) {
            newHeight = potentialHeight;
            newY = dragStartRef.current.posY + dy;
          }
        }
        
        setPanelSize({ width: newWidth, height: newHeight });
        setPanelPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, panelSize]);

  // 计算完成度
  const getCompletionPercent = useCallback(() => {
    const char = state.wizardCharacter;
    let completed = 0;
    if (char.style?.genre) completed++;
    if (char.name) completed++;
    if (char.tags && char.tags.length > 0) completed++;
    if (char.appearance?.description) completed++;
    if (char.personality?.description) completed++;
    if (char.backstory?.fullStory) completed++;
    if (char.agent?.systemPrompt) completed++;
    return Math.round((completed / 7) * 100);
  }, [state.wizardCharacter]);

  // AI 生成回调
  const handleGenerateNames = async (options: NamingOptions) => {
    return aiGenerate.generateNames(options, state.wizardCharacter.style, isZh);
  };

  const handleGeneratePersonality = async (): Promise<Partial<CharacterPersonality>> => {
    return aiGenerate.generatePersonality(state.wizardCharacter);
  };

  const handleGenerateBackstory = async (options: BackstoryOptions) => {
    return aiGenerate.generateBackstory(state.wizardCharacter, options);
  };

  const handleGenerateAgent = async (): Promise<CharacterAgent> => {
    return aiGenerate.generateAgent(state.wizardCharacter);
  };

  const handleGenerateAppearance = async (): Promise<string> => {
    return aiGenerate.generateAppearance(state.wizardCharacter, isZh);
  };

  const handleGenerateField = async (field: string, currentValue: string): Promise<string> => {
    return aiGenerate.generateAppearanceField(field, currentValue, state.wizardCharacter, isZh);
  };

  if (!isOpen) return null;

  // 调整大小手柄的样式
  const resizeHandleStyle = (cursor: string): React.CSSProperties => ({
    position: 'absolute',
    zIndex: 10,
    cursor,
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          left: panelPosition.x,
          top: panelPosition.y,
          width: panelSize.width,
          height: panelSize.height,
          background: 'var(--ef-bg-primary)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--ef-border)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 调整大小手柄 - 四边 */}
        <div style={{ ...resizeHandleStyle('ns-resize'), top: 0, left: 10, right: 10, height: 6 }} onMouseDown={e => handleResizeStart(e, 'n')} />
        <div style={{ ...resizeHandleStyle('ns-resize'), bottom: 0, left: 10, right: 10, height: 6 }} onMouseDown={e => handleResizeStart(e, 's')} />
        <div style={{ ...resizeHandleStyle('ew-resize'), left: 0, top: 10, bottom: 10, width: 6 }} onMouseDown={e => handleResizeStart(e, 'w')} />
        <div style={{ ...resizeHandleStyle('ew-resize'), right: 0, top: 10, bottom: 10, width: 6 }} onMouseDown={e => handleResizeStart(e, 'e')} />
        {/* 调整大小手柄 - 四角 */}
        <div style={{ ...resizeHandleStyle('nwse-resize'), top: 0, left: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'nw')} />
        <div style={{ ...resizeHandleStyle('nesw-resize'), top: 0, right: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'ne')} />
        <div style={{ ...resizeHandleStyle('nesw-resize'), bottom: 0, left: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'sw')} />
        <div style={{ ...resizeHandleStyle('nwse-resize'), bottom: 0, right: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'se')} />

        {/* 顶部标题栏 - 可拖拽移动 */}
        <div
          onMouseDown={handleDragStart}
          style={{
            padding: '12px 20px',
            background: 'var(--ef-bg-secondary)',
            borderBottom: '1px solid var(--ef-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 32, height: 32, borderRadius: 8, 
              background: 'var(--ef-accent)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 14, fontWeight: 600,
            }}>
              角
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ef-text)' }}>
                {state.wizardCharacter.name || (isZh ? '新角色' : 'New Character')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ef-text-muted)' }}>
                {isZh ? `完成度 ${getCompletionPercent()}%` : `${getCompletionPercent()}% Complete`}
              </div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div style={{ flex: 1, maxWidth: 200, margin: '0 20px' }}>
            <div style={{ height: 4, background: 'var(--ef-bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${getCompletionPercent()}%`,
                background: getCompletionPercent() === 100 ? 'var(--ef-success, #22c55e)' : 'var(--ef-accent)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* 文字 AI 模型选择器 */}
          {availableModels.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ef-text-muted)" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <path d="M12 2a10 10 0 0 1 10 10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <select
                value={selectedModel}
                onChange={e => {
                  setSelectedModel(e.target.value);
                  setOverrideModel(e.target.value);
                }}
                style={{
                  padding: '6px 10px',
                  background: 'var(--ef-bg-tertiary)',
                  border: '1px solid var(--ef-border)',
                  borderRadius: 6,
                  color: 'var(--ef-text)',
                  fontSize: 12,
                  cursor: 'pointer',
                  minWidth: 120,
                }}
                title={isZh ? '文字 AI 模型' : 'Text AI Model'}
              >
                {availableModels.map((m, i) => (
                  <option key={i} value={m.model}>{m.model}</option>
                ))}
              </select>
            </div>
          )}

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ef-text-muted)', fontSize: 20, padding: 4 }}>✕</button>
        </div>

        {/* 顶部标签栏 */}
        <div style={{ display: 'flex', padding: '0 12px', background: 'var(--ef-bg-secondary)', borderBottom: '1px solid var(--ef-border)', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--ef-accent)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--ef-accent)' : 'var(--ef-text-muted)',
                fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease',
              }}
            >
              <span>{isZh ? tab.name.zh : tab.name.en}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {state.error && (
            <div style={{ padding: '12px 16px', background: 'var(--ef-error-bg, rgba(239,68,68,0.1))', border: '1px solid var(--ef-error)', borderRadius: 8, color: 'var(--ef-error)', marginBottom: 16, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
              <span>{state.error}</span>
              <button onClick={actions.clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ef-error)' }}>✕</button>
            </div>
          )}

          {activeTab === 'overview' && <OverviewTab character={state.wizardCharacter} isZh={isZh} onTabChange={setActiveTab} />}
          {activeTab === 'style' && <StyleTab value={state.wizardCharacter.style || {}} onChange={s => actions.updateWizardCharacter({ style: s })} isZh={isZh} />}
          {activeTab === 'basic' && <BasicTab name={state.wizardCharacter.name || ''} tags={state.wizardCharacter.tags || []} style={state.wizardCharacter.style || {}} gender={state.wizardCharacter.appearance?.gender} onNameChange={(n, o, m) => actions.updateWizardCharacter({ name: n, nameOrigin: o, nameMeaning: m })} onTagsChange={t => actions.updateWizardCharacter({ tags: t })} onGenderChange={g => actions.updateWizardCharacter({ appearance: { ...state.wizardCharacter.appearance, gender: g } })} onGenerateNames={handleGenerateNames} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
          {activeTab === 'appearance' && <AppearanceTab value={state.wizardCharacter.appearance || {}} characterName={state.wizardCharacter.name || ''} style={state.wizardCharacter.style || {}} tags={state.wizardCharacter.tags || []} onChange={a => actions.updateWizardCharacter({ appearance: a })} onGenerateAppearance={handleGenerateAppearance} onGenerateField={handleGenerateField} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
          {activeTab === 'personality' && <PersonalityTab value={state.wizardCharacter.personality || {}} characterName={state.wizardCharacter.name || ''} onChange={p => actions.updateWizardCharacter({ personality: p })} onGenerate={handleGeneratePersonality} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
          {activeTab === 'backstory' && <BackstoryTab value={state.wizardCharacter.backstory || {}} characterName={state.wizardCharacter.name || ''} onChange={b => actions.updateWizardCharacter({ backstory: b })} onGenerate={handleGenerateBackstory} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
          {activeTab === 'agent' && <AgentTab value={state.wizardCharacter.agent || {}} character={state.wizardCharacter} onChange={a => actions.updateWizardCharacter({ agent: a })} onGenerate={handleGenerateAgent} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
          {activeTab === 'export' && <ExportTab character={state.wizardCharacter} isZh={isZh} />}
        </div>

        {/* 版本管理（后悔药） */}
        {state.versions.length > 0 && (
          <VersionManager versions={state.versions} currentIndex={state.currentVersionIndex} onRestore={actions.restoreVersion} onClear={actions.clearVersions} isZh={isZh} />
        )}
      </div>
    </div>
  );
};


// ==================== 总览标签页 ====================
interface OverviewTabProps {
  character: Partial<CharacterData>;
  isZh: boolean;
  onTabChange: (tab: IntegratedTab) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ character, isZh, onTabChange }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
      {/* 左侧：角色卡片 */}
      <div style={{ background: 'var(--ef-bg-secondary)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: 12, background: 'var(--ef-bg-tertiary)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, overflow: 'hidden', color: 'var(--ef-text-muted)' }}>
          {character.images?.[0]?.url ? <img src={character.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '头像'}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ef-text)', marginBottom: 4 }}>{character.name || (isZh ? '未命名' : 'Unnamed')}</div>
        <div style={{ fontSize: 12, color: 'var(--ef-text-muted)', marginBottom: 12 }}>{character.style?.genre || (isZh ? '未设定风格' : 'No style set')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {(character.tags || []).slice(0, 6).map(tag => (
            <span key={tag} style={{ padding: '2px 8px', background: 'var(--ef-accent-bg, rgba(99,102,241,0.15))', borderRadius: 10, fontSize: 10, color: 'var(--ef-accent)' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* 右侧：快速编辑入口 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { tab: 'style' as IntegratedTab, title: isZh ? '风格设定' : 'Style', desc: character.style?.genre || (isZh ? '点击设定' : 'Click to set'), done: !!character.style?.genre },
          { tab: 'basic' as IntegratedTab, title: isZh ? '基础信息' : 'Basic Info', desc: character.name || (isZh ? '点击设定' : 'Click to set'), done: !!character.name },
          { tab: 'appearance' as IntegratedTab, title: isZh ? '外观设计' : 'Appearance', desc: character.appearance?.description?.slice(0, 30) || (isZh ? '点击设定' : 'Click to set'), done: !!character.appearance?.description },
          { tab: 'personality' as IntegratedTab, title: isZh ? '性格设定' : 'Personality', desc: character.personality?.traits?.join(', ')?.slice(0, 30) || (isZh ? '点击设定' : 'Click to set'), done: !!character.personality?.description },
          { tab: 'backstory' as IntegratedTab, title: isZh ? '背景故事' : 'Backstory', desc: character.backstory?.origin?.slice(0, 30) || (isZh ? '点击设定' : 'Click to set'), done: !!character.backstory?.fullStory },
          { tab: 'agent' as IntegratedTab, title: isZh ? '角色智能体' : 'Agent', desc: character.agent?.enabled ? (isZh ? '已启用' : 'Enabled') : (isZh ? '点击创建' : 'Click to create'), done: !!character.agent?.systemPrompt },
        ].map(item => (
          <button key={item.tab} onClick={() => onTabChange(item.tab)} style={{ padding: 16, background: 'var(--ef-bg-secondary)', border: `1px solid ${item.done ? 'var(--ef-success, #22c55e)' : 'var(--ef-border)'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ef-text)' }}>{item.title}</span>
              {item.done && <span style={{ fontSize: 12, color: 'var(--ef-success, #22c55e)' }}>✓</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ef-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};


// ==================== 导出标签页 ====================
interface ExportTabProps {
  character: Partial<CharacterData>;
  isZh: boolean;
}

const ExportTab: React.FC<ExportTabProps> = ({ character, isZh }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'detailed' | 'minimal'>('standard');

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/character-workshop/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, options: { template: selectedTemplate, includeImages: true, includeAgent: false, language: isZh ? 'zh' : 'en' } }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${character.name || 'character'}_character_sheet.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        handlePrintPDF();
      }
    } catch (err) {
      console.error('PDF export failed, using print fallback:', err);
      handlePrintPDF();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPDF = () => {
    const html = generatePrintHTML(character, isZh);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--ef-text)' }}>{isZh ? '导出角色设定' : 'Export Character'}</h3>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 12, color: 'var(--ef-text-muted)' }}>{isZh ? 'PDF 模板' : 'PDF Template'}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { id: 'standard' as const, name: isZh ? '标准版' : 'Standard', desc: isZh ? '完整信息，适合分享' : 'Full info, good for sharing' },
            { id: 'detailed' as const, name: isZh ? '详细版' : 'Detailed', desc: isZh ? '包含所有细节' : 'All details included' },
            { id: 'minimal' as const, name: isZh ? '简洁版' : 'Minimal', desc: isZh ? '核心信息，一页纸' : 'Core info, one page' },
          ].map(tpl => (
            <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)} style={{ padding: 16, background: selectedTemplate === tpl.id ? 'var(--ef-accent)' : 'var(--ef-bg-tertiary)', border: `2px solid ${selectedTemplate === tpl.id ? 'var(--ef-accent)' : 'var(--ef-border)'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'center', color: selectedTemplate === tpl.id ? 'white' : 'var(--ef-text)' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{tpl.name}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{tpl.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={handleExportPDF} disabled={isExporting} style={{ flex: 1, padding: '14px 20px', background: 'var(--ef-accent)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 500, cursor: isExporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {isExporting ? (isZh ? '生成中...' : 'Generating...') : (isZh ? '导出 PDF' : 'Export PDF')}
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 12, color: 'var(--ef-text-muted)' }}>{isZh ? '其他格式' : 'Other Formats'}</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${character.name || 'character'}.json`; a.click(); }} style={{ flex: 1, padding: '12px 16px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            JSON
          </button>
          <button onClick={() => { const md = generateMarkdown(character, isZh); const blob = new Blob([md], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${character.name || 'character'}.md`; a.click(); }} style={{ flex: 1, padding: '12px 16px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Markdown
          </button>
        </div>
      </div>

      <div style={{ padding: 16, background: 'var(--ef-bg-tertiary)', borderRadius: 10, fontSize: 12, color: 'var(--ef-text-muted)', lineHeight: 1.6 }}>
        <div style={{ fontWeight: 500, marginBottom: 8, color: 'var(--ef-text)' }}>{isZh ? 'PDF 包含内容' : 'PDF Contents'}</div>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>{isZh ? '角色立绘/头像' : 'Character portrait'}</li>
          <li>{isZh ? '基础信息与标签' : 'Basic info & tags'}</li>
          <li>{isZh ? '外观描述' : 'Appearance description'}</li>
          <li>{isZh ? '性格特点与说话风格' : 'Personality & speech style'}</li>
          <li>{isZh ? '背景故事' : 'Backstory'}</li>
        </ul>
      </div>
    </div>
  );
};


// 生成 Markdown 内容
function generateMarkdown(character: Partial<CharacterData>, isZh: boolean): string {
  const lines: string[] = [];
  lines.push(`# ${character.name || (isZh ? '未命名角色' : 'Unnamed Character')}`);
  lines.push('');
  if (character.style?.genre) {
    lines.push(`**${isZh ? '风格' : 'Style'}:** ${character.style.genre}${character.style.subGenre ? ` / ${character.style.subGenre}` : ''}`);
    lines.push('');
  }
  if (character.tags && character.tags.length > 0) {
    lines.push(`**${isZh ? '标签' : 'Tags'}:** ${character.tags.join(', ')}`);
    lines.push('');
  }
  if (character.appearance?.description) {
    lines.push(`## ${isZh ? '外观' : 'Appearance'}`);
    lines.push(character.appearance.description);
    lines.push('');
  }
  if (character.personality?.description) {
    lines.push(`## ${isZh ? '性格' : 'Personality'}`);
    if (character.personality.traits?.length) lines.push(`**${isZh ? '特质' : 'Traits'}:** ${character.personality.traits.join(', ')}`);
    lines.push(character.personality.description);
    lines.push('');
  }
  if (character.backstory?.fullStory) {
    lines.push(`## ${isZh ? '背景故事' : 'Backstory'}`);
    lines.push(character.backstory.fullStory);
    lines.push('');
  }
  return lines.join('\n');
}

// 生成打印用 HTML
function generatePrintHTML(character: Partial<CharacterData>, isZh: boolean): string {
  const name = character.name || (isZh ? '未命名角色' : 'Unnamed Character');
  const style = character.style;
  const appearance = character.appearance;
  const personality = character.personality;
  const backstory = character.backstory;
  const tags = character.tags || [];
  const images = character.images || [];

  return `<!DOCTYPE html>
<html lang="${isZh ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${name} - Character Sheet</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Noto Sans SC', sans-serif; line-height: 1.7; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 28px; border-bottom: 4px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px; }
    h2 { font-size: 18px; color: #6366f1; margin-top: 24px; margin-bottom: 12px; }
    .header { display: flex; gap: 24px; margin-bottom: 24px; }
    .avatar { width: 140px; height: 140px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 56px; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .tag { background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 16px; font-size: 12px; }
    .traits { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .trait { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    .story { white-space: pre-wrap; background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <div class="header">
    <div class="avatar">${images[0]?.url ? `<img src="${images[0].url}" alt="">` : '👤'}</div>
    <div>
      <p><strong>${isZh ? '风格' : 'Style'}:</strong> ${style?.genre || '-'}${style?.subGenre ? ` / ${style.subGenre}` : ''}</p>
      ${appearance?.gender ? `<p><strong>${isZh ? '性别' : 'Gender'}:</strong> ${appearance.gender}</p>` : ''}
      ${appearance?.age ? `<p><strong>${isZh ? '年龄' : 'Age'}:</strong> ${appearance.age}</p>` : ''}
      <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
  </div>
  ${appearance?.description ? `<h2>${isZh ? '外观' : 'Appearance'}</h2><p>${appearance.description}</p>` : ''}
  ${personality?.description ? `<h2>${isZh ? '性格' : 'Personality'}</h2>${personality.traits?.length ? `<div class="traits">${personality.traits.map(t => `<span class="trait">${t}</span>`).join('')}</div>` : ''}<p>${personality.description}</p>${personality.speechStyle ? `<p><strong>${isZh ? '说话风格' : 'Speech Style'}:</strong> ${personality.speechStyle}</p>` : ''}` : ''}
  ${backstory?.fullStory ? `<h2>${isZh ? '背景故事' : 'Backstory'}</h2>${backstory.origin ? `<p><strong>${isZh ? '出身' : 'Origin'}:</strong> ${backstory.origin}</p>` : ''}<div class="story">${backstory.fullStory}</div>` : ''}
</body>
</html>`;
}
