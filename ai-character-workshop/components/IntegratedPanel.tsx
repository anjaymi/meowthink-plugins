
/**
 * AI 角色工坊 - 集成式主面板
 * Refactored Version: Atomic Design & Modular
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useWorkshopState, getSavedCharacters, deleteSavedCharacter, getAutoSave, clearAutoSave, type SavedCharacter } from '../hooks/useWorkshopState';
import { useAIGenerate, getAvailableApiConfigs, setOverrideModel } from '../hooks/useAIGenerate';
import { VersionManager } from './wizard/VersionManager';
import { StyleTab, BasicTab, AppearanceTab, PersonalityTab, BackstoryTab, AgentTab } from './integrated';
import { OverviewTab } from './integrated/OverviewTab'; // New
import { ExportTab } from './integrated/ExportTab'; // New
import type { CharacterInput, NamingOptions, BackstoryOptions, CharacterPersonality, CharacterAgent } from '../types';

// New Modular Components
import { usePanelDrag } from '../hooks/usePanelDrag';
import { useCharacterStats } from '../hooks/useCharacterStats';
import { WorkshopHeader } from './molecules/WorkshopHeader';
import { SaveLoadManager } from './molecules/SaveLoadManager';
import { WorkshopTabBar, IntegratedTab } from './molecules/WorkshopTabBar';
import { IconButton } from './atoms/IconButton';
import { Save, FolderOpen, Plus, Bot, ChevronDown } from 'lucide-react';

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
  
  // Custom Hooks
  const { 
    panelSize, panelPosition, isDragging, isResizing, 
    handleDragStart, handleResizeStart 
  } = usePanelDrag(isOpen);

  const { completionPercent } = useCharacterStats(state.wizardCharacter);

  // Local State
  const [availableModels, setAvailableModels] = useState<{ name: string; model: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Initialization & Data Loading
  useEffect(() => {
    if (isOpen) {
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
      
      setSavedCharacters(getSavedCharacters());
      
      // Auto-save check
      const autoSaved = getAutoSave();
      if (autoSaved && autoSaved.data.name) {
        const timeDiff = Date.now() - autoSaved.savedAt;
        if (timeDiff < 24 * 60 * 60 * 1000) {
          if (!state.wizardCharacter.name && !state.wizardCharacter.style?.genre) {
            setSaveMessage(isZh ? '检测到未保存的进度，是否恢复？' : 'Unsaved progress detected. Restore?');
          }
        }
      }
    }
  }, [isOpen, state.wizardCharacter.name, state.wizardCharacter.style?.genre, isZh]);

  // AI Actions (Delegates)
  const handleGenerateNames = async (options: NamingOptions) => aiGenerate.generateNames(options, state.wizardCharacter.style, isZh);
  const handleGeneratePersonality = async () => aiGenerate.generatePersonality(state.wizardCharacter);
  const handleGenerateBackstory = async (options: BackstoryOptions) => aiGenerate.generateBackstory(state.wizardCharacter, options);
  const handleGenerateAgent = async () => aiGenerate.generateAgent(state.wizardCharacter);
  const handleGenerateAppearance = async () => aiGenerate.generateAppearance(state.wizardCharacter, isZh);
  const handleGenerateField = async (field: string, currentValue: string) => aiGenerate.generateAppearanceField(field, currentValue, state.wizardCharacter, isZh);

  // Save/Load Actions
  const handleSave = useCallback(() => {
    const saved = actions.saveCurrentCharacter();
    setSavedCharacters(getSavedCharacters());
    setSaveMessage(isZh ? `已保存: ${saved.name}` : `Saved: ${saved.name}`);
    setTimeout(() => setSaveMessage(null), 2000);
  }, [actions, isZh]);

  const handleLoad = useCallback((saved: SavedCharacter) => {
    actions.loadCharacter(saved);
    setShowSavePanel(false);
    setSaveMessage(isZh ? `已加载: ${saved.name}` : `Loaded: ${saved.name}`);
    setTimeout(() => setSaveMessage(null), 2000);
  }, [actions, isZh]);

  const handleDelete = useCallback((id: string) => {
    deleteSavedCharacter(id);
    setSavedCharacters(getSavedCharacters());
  }, []);

  const handleNew = useCallback(() => {
    actions.resetCharacter();
    clearAutoSave();
    setShowSavePanel(false);
    setSaveMessage(isZh ? '已创建新角色' : 'New character created');
    setTimeout(() => setSaveMessage(null), 2000);
  }, [actions, isZh]);

  const handleRestoreAutoSave = useCallback(() => {
    const autoSaved = getAutoSave();
    if (autoSaved) {
      actions.loadCharacter({ id: autoSaved.data.id || '', name: autoSaved.data.name || '', savedAt: autoSaved.savedAt, data: autoSaved.data, versions: autoSaved.versions });
      setSaveMessage(isZh ? '已恢复自动保存的进度' : 'Auto-saved progress restored');
      setTimeout(() => setSaveMessage(null), 2000);
    }
  }, [actions, isZh]);

  if (!isOpen) return null;

  // Resize Handle Component Helper
  const ResizeHandle = ({ cursor, style, onMouseDown }: { cursor: string, style: React.CSSProperties, onMouseDown: (e: React.MouseEvent) => void }) => (
    <div style={{ position: 'absolute', zIndex: 10, cursor, ...style }} onMouseDown={onMouseDown} />
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      backdropFilter: 'blur(2px)' // Frosted glass effect for overlay
    }} onClick={onClose}>
      <div style={{
        position: 'absolute',
        left: panelPosition.x, top: panelPosition.y,
        width: panelSize.width, height: panelSize.height,
        background: 'var(--ef-bg-primary)',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        border: '1px solid var(--ef-border)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)', // Deeper shadow
      }} onClick={e => e.stopPropagation()}>
        
        {/* Resize Handles */}
        <ResizeHandle cursor="ns-resize" style={{ top: 0, left: 10, right: 10, height: 6 }} onMouseDown={e => handleResizeStart(e, 'n')} />
        <ResizeHandle cursor="ns-resize" style={{ bottom: 0, left: 10, right: 10, height: 6 }} onMouseDown={e => handleResizeStart(e, 's')} />
        <ResizeHandle cursor="ew-resize" style={{ left: 0, top: 10, bottom: 10, width: 6 }} onMouseDown={e => handleResizeStart(e, 'w')} />
        <ResizeHandle cursor="ew-resize" style={{ right: 0, top: 10, bottom: 10, width: 6 }} onMouseDown={e => handleResizeStart(e, 'e')} />
        <ResizeHandle cursor="nwse-resize" style={{ top: 0, left: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'nw')} />
        <ResizeHandle cursor="nesw-resize" style={{ top: 0, right: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'ne')} />
        <ResizeHandle cursor="nesw-resize" style={{ bottom: 0, left: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'sw')} />
        <ResizeHandle cursor="nwse-resize" style={{ bottom: 0, right: 0, width: 12, height: 12 }} onMouseDown={e => handleResizeStart(e, 'se')} />

        {/* Header Molecule */}
        <WorkshopHeader 
            title={state.wizardCharacter.name || (isZh ? '新角色' : 'New Character')}
            isZh={isZh}
            completionPercent={completionPercent}
            isDragging={isDragging}
            onDragStart={handleDragStart}
            onClose={onClose}
        />

        {/* Action Toolbar (Model + Save/Load) - placed below header for better organization */}
        <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '8px 20px', background: 'var(--ef-bg-secondary)', borderBottom: '1px solid var(--ef-border)' 
        }}>
             {/* Model Selector */}
             {availableModels.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bot size={14} className="text-muted" />
                    <div style={{ position: 'relative' }}>
                        <select
                            value={selectedModel}
                            onChange={e => { setSelectedModel(e.target.value); setOverrideModel(e.target.value); }}
                            style={{
                                padding: '4px 24px 4px 8px',
                                background: 'transparent',
                                border: '1px solid transparent',
                                borderRadius: 4,
                                color: 'var(--ef-text-secondary)',
                                fontSize: 12,
                                cursor: 'pointer',
                                appearance: 'none',
                                hover: { background: 'var(--ef-bg-tertiary)' }
                            }}
                        >
                            {availableModels.map((m, i) => (
                                <option key={i} value={m.model}>{m.model}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ef-text-muted)' }} />
                    </div>
                </div>
             )}

             {/* Action Buttons */}
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconButton icon={Save} onClick={handleSave} title={isZh ? '保存' : 'Save'} />
                <IconButton icon={FolderOpen} onClick={() => { setSavedCharacters(getSavedCharacters()); setShowSavePanel(!showSavePanel); }} title={isZh ? '加载' : 'Load'} />
                <IconButton icon={Plus} onClick={handleNew} title={isZh ? '新建' : 'New'} />
             </div>
        </div>

        {/* Tab Bar Molecule */}
        <WorkshopTabBar activeTab={activeTab} onTabChange={setActiveTab} isZh={isZh} />

        {/* Main Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: 0, position: 'relative', background: 'var(--ef-bg-primary)' }}>
            <div style={{ height: '100%', padding: '20px 24px' }}>
                {/* Save/Restore Message Toast */}
                {saveMessage && (
                    <div style={{
                        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, zIndex: 100,
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: saveMessage.includes('恢复') || saveMessage.includes('Restore') ? 'var(--ef-warning-bg)' : 'var(--ef-success-bg)',
                        color: saveMessage.includes('恢复') || saveMessage.includes('Restore') ? 'var(--ef-warning)' : 'var(--ef-success)',
                        border: `1px solid ${saveMessage.includes('恢复') || saveMessage.includes('Restore') ? 'var(--ef-warning)' : 'var(--ef-success)'}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {saveMessage}
                        {(saveMessage.includes('恢复') || saveMessage.includes('Restore')) && (
                            <button onClick={handleRestoreAutoSave} style={{ 
                                padding: '2px 8px', background: 'var(--ef-warning)', border: 'none', 
                                borderRadius: 4, color: 'white', fontSize: 11, cursor: 'pointer' 
                            }}>
                                {isZh ? '恢复' : 'Restore'}
                            </button>
                        )}
                    </div>
                )}

                {/* Save/Load Slide-out Panel */}
                <SaveLoadManager 
                    isOpen={showSavePanel}
                    onClose={() => setShowSavePanel(false)}
                    savedCharacters={savedCharacters}
                    onLoad={handleLoad}
                    onDelete={handleDelete}
                    isZh={isZh}
                />
                
                {/* Organisms / Tab Content */}
                {activeTab === 'overview' && <OverviewTab character={state.wizardCharacter} isZh={isZh} onTabChange={setActiveTab} />}
                {activeTab === 'style' && <StyleTab value={state.wizardCharacter.style || {}} onChange={s => actions.updateWizardCharacter({ style: s })} isZh={isZh} />}
                {activeTab === 'basic' && <BasicTab name={state.wizardCharacter.name || ''} tags={state.wizardCharacter.tags || []} style={state.wizardCharacter.style || {}} gender={state.wizardCharacter.appearance?.gender} onNameChange={(n, o, m) => actions.updateWizardCharacter({ name: n, nameOrigin: o, nameMeaning: m })} onTagsChange={t => actions.updateWizardCharacter({ tags: t })} onGenderChange={g => actions.updateWizardCharacter({ appearance: { ...state.wizardCharacter.appearance, gender: g } })} onGenerateNames={handleGenerateNames} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
                {activeTab === 'appearance' && <AppearanceTab value={state.wizardCharacter.appearance || {}} characterName={state.wizardCharacter.name || ''} style={state.wizardCharacter.style || {}} tags={state.wizardCharacter.tags || []} onChange={a => actions.updateWizardCharacter({ appearance: a })} onGenerateAppearance={handleGenerateAppearance} onGenerateField={handleGenerateField} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
                {activeTab === 'personality' && <PersonalityTab value={state.wizardCharacter.personality || {}} characterName={state.wizardCharacter.name || ''} onChange={p => actions.updateWizardCharacter({ personality: p })} onGenerate={handleGeneratePersonality} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
                {activeTab === 'backstory' && <BackstoryTab value={state.wizardCharacter.backstory || {}} characterName={state.wizardCharacter.name || ''} onChange={b => actions.updateWizardCharacter({ backstory: b })} onGenerate={handleGenerateBackstory} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
                {activeTab === 'agent' && <AgentTab value={state.wizardCharacter.agent || {}} character={state.wizardCharacter} onChange={a => actions.updateWizardCharacter({ agent: a })} onGenerate={handleGenerateAgent} isGenerating={aiGenerate.isGenerating} isZh={isZh} />}
                {activeTab === 'export' && <ExportTab character={state.wizardCharacter} isZh={isZh} />}
            </div>
        </div>

        {/* Version History (Footer) */}
        {state.versions.length > 0 && (
          <VersionManager versions={state.versions} currentIndex={state.currentVersionIndex} onRestore={actions.restoreVersion} onClear={actions.clearVersions} isZh={isZh} />
        )}
      </div>
    </div>
  );
};
