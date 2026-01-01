/**
 * AI 角色工坊 - 主面板组件（支持向导模式和自由模式）
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ModuleTabs, CharacterSelector } from './molecules';
import { DialogueModule, VariantModule, WorldbuildingModule, NamingModule, BackstoryModule } from './modules';
import { WizardProgress, VersionManager, StyleStep, NamingStep, TagsStep, AppearanceStep, PersonalityStep, BackstoryStep, AgentStep, CompleteStep } from './wizard';
import { useWorkshopState } from '../hooks/useWorkshopState';
import { useAIGenerate } from '../hooks/useAIGenerate';
import type { CharacterInput, WorkshopMode } from '../types';

interface WorkshopPanelProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterInput[];
  onAddToCanvas?: (content: { type: string; text: string }) => void;
  isZh: boolean;
}

export const WorkshopPanel: React.FC<WorkshopPanelProps> = ({
  isOpen,
  onClose,
  characters,
  onAddToCanvas,
  isZh,
}) => {
  const { state, actions } = useWorkshopState();
  const aiGenerate = useAIGenerate();
  const [panelSize, setPanelSize] = useState({ width: 900, height: 650 });
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });

  // 初始化位置
  useEffect(() => {
    if (isOpen) {
      const w = Math.min(900, window.innerWidth * 0.9);
      const h = Math.min(650, window.innerHeight * 0.85);
      setPanelSize({ width: w, height: h });
      setPanelPosition({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
    }
  }, [isOpen]);

  // 添加到画布
  const handleAddToCanvas = useCallback((content: { name?: string; description?: string; text?: string }) => {
    onAddToCanvas?.({ type: 'text', text: content.description || content.text || content.name || '' });
  }, [onAddToCanvas]);

  // 导出角色
  const handleExport = useCallback((format: 'json' | 'markdown' | 'canvas') => {
    const char = state.wizardCharacter;
    if (format === 'canvas') {
      onAddToCanvas?.({ type: 'character', text: JSON.stringify(char) });
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${char.name || 'character'}.json`;
      a.click();
    }
  }, [state.wizardCharacter, onAddToCanvas]);

  if (!isOpen) return null;

  // 渲染向导步骤
  const renderWizardStep = () => {
    const commonProps = { isZh, isGenerating: state.isGenerating };
    const char = state.wizardCharacter;

    switch (state.wizardStep) {
      case 'style':
        return (
          <StyleStep
            value={char.style || {}}
            onChange={style => actions.updateWizardCharacter({ style: { ...char.style, ...style } as any })}
            onNext={actions.nextStep}
            isZh={isZh}
          />
        );
      case 'naming':
        return (
          <NamingStep
            value={{ name: char.name, nameOrigin: char.nameOrigin, nameMeaning: char.nameMeaning }}
            style={char.style || {}}
            onChange={data => actions.updateWizardCharacter(data)}
            onGenerate={async (options) => {
              actions.startGenerate();
              try {
                const result = await aiGenerate.generateNaming(null, options);
                actions.generateSuccess(result);
                return result;
              } catch (err) {
                actions.generateError(err instanceof Error ? err.message : '生成失败');
                throw err;
              }
            }}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            {...commonProps}
          />
        );
      case 'tags':
        return (
          <TagsStep
            value={char.tags || []}
            style={char.style || {}}
            onChange={tags => actions.updateWizardCharacter({ tags })}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            isZh={isZh}
          />
        );
      case 'appearance':
        return (
          <AppearanceStep
            value={char.appearance || {}}
            characterName={char.name || ''}
            style={char.style || {}}
            tags={char.tags || []}
            onChange={appearance => actions.updateWizardCharacter({ appearance: { ...char.appearance, ...appearance } as any })}
            onImageGenerate={url => actions.updateWizardCharacter({ images: [...(char.images || []), { id: Date.now().toString(), url, type: 'portrait', generatedBy: 'ai' }] })}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            isZh={isZh}
          />
        );
      case 'personality':
        return (
          <PersonalityStep
            value={char.personality || {}}
            characterName={char.name || ''}
            onChange={personality => actions.updateWizardCharacter({ personality: { ...char.personality, ...personality } as any })}
            onGenerate={async () => {
              // TODO: 实现性格生成
              return { traits: ['brave', 'intelligent'], description: '' };
            }}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            {...commonProps}
          />
        );
      case 'backstory':
        return (
          <BackstoryStep
            value={char.backstory || {}}
            characterName={char.name || ''}
            onChange={backstory => actions.updateWizardCharacter({ backstory: { ...char.backstory, ...backstory } as any })}
            onGenerate={async (options) => {
              actions.startGenerate();
              try {
                const result = await aiGenerate.generateBackstory({ id: char.id || '', name: char.name || '' }, options);
                actions.generateSuccess(result);
                return result;
              } catch (err) {
                actions.generateError(err instanceof Error ? err.message : '生成失败');
                throw err;
              }
            }}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            {...commonProps}
          />
        );
      case 'agent':
        return (
          <AgentStep
            value={char.agent || {}}
            character={char}
            onChange={agent => actions.updateWizardCharacter({ agent: { ...char.agent, ...agent } as any })}
            onGenerate={async () => {
              // TODO: 实现智能体生成
              return { systemPrompt: `你是${char.name}...`, sampleDialogues: [], enabled: true };
            }}
            onNext={actions.nextStep}
            onPrev={actions.prevStep}
            {...commonProps}
          />
        );
      case 'complete':
        return (
          <CompleteStep
            character={char}
            onExport={handleExport}
            onCreateVariant={() => actions.setWizardStep('style')}
            onStartNew={() => {
              actions.clearVersions();
              actions.updateWizardCharacter({ id: Date.now().toString(), name: '', tags: [], images: [] });
              actions.setWizardStep('style');
            }}
            onPrev={actions.prevStep}
            isZh={isZh}
          />
        );
      default:
        return null;
    }
  };

  // 渲染自由模式模块
  const renderFreeModule = () => {
    const commonProps = { character: state.selectedCharacter, isGenerating: state.isGenerating, isZh };
    switch (state.activeModule) {
      case 'dialogue':
        return <DialogueModule {...commonProps} onGenerate={async (options) => { actions.startGenerate(); try { const r = await aiGenerate.generateDialogue(state.selectedCharacter!, options); actions.generateSuccess(r); return r; } catch (e) { actions.generateError(e instanceof Error ? e.message : '失败'); throw e; } }} />;
      case 'variant':
        return <VariantModule {...commonProps} onGenerate={async (options) => { actions.startGenerate(); try { const r = await aiGenerate.generateVariant(state.selectedCharacter!, options); actions.generateSuccess(r); return r; } catch (e) { actions.generateError(e instanceof Error ? e.message : '失败'); throw e; } }} onAddToCanvas={handleAddToCanvas} />;
      case 'worldbuilding':
        return <WorldbuildingModule {...commonProps} onGenerate={async (options) => { actions.startGenerate(); try { const r = await aiGenerate.generateWorldbuilding(state.selectedCharacter!, options); actions.generateSuccess(r); return r; } catch (e) { actions.generateError(e instanceof Error ? e.message : '失败'); throw e; } }} onAddToCanvas={handleAddToCanvas} />;
      case 'naming':
        return <NamingModule {...commonProps} onGenerate={async (options) => { actions.startGenerate(); try { const r = await aiGenerate.generateNaming(state.selectedCharacter!, options); actions.generateSuccess(r); return r; } catch (e) { actions.generateError(e instanceof Error ? e.message : '失败'); throw e; } }} />;
      case 'backstory':
        return <BackstoryModule {...commonProps} onGenerate={async (options) => { actions.startGenerate(); try { const r = await aiGenerate.generateBackstory(state.selectedCharacter!, options); actions.generateSuccess(r); return r; } catch (e) { actions.generateError(e instanceof Error ? e.message : '失败'); throw e; } }} onAddToCanvas={(c) => handleAddToCanvas({ text: c })} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div
        style={{ position: 'absolute', left: panelPosition.x, top: panelPosition.y, width: panelSize.width, height: panelSize.height, background: 'var(--ef-bg-secondary)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--ef-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ef-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ef-bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🎭</span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{isZh ? 'AI 角色工坊' : 'AI Character Workshop'}</span>
            {/* 模式切换 */}
            <div style={{ display: 'flex', background: 'var(--ef-bg-tertiary)', borderRadius: 6, padding: 2 }}>
              {(['wizard', 'free'] as WorkshopMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => actions.setMode(mode)}
                  style={{ padding: '4px 12px', background: state.mode === mode ? 'var(--ef-accent)' : 'transparent', border: 'none', borderRadius: 4, color: state.mode === mode ? 'white' : 'var(--ef-text-muted)', fontSize: 12, cursor: 'pointer' }}
                >
                  {mode === 'wizard' ? (isZh ? '向导' : 'Wizard') : (isZh ? '自由' : 'Free')}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ef-text-muted)', fontSize: 20, padding: 4 }}>✕</button>
        </div>

        {/* 向导模式进度条 */}
        {state.mode === 'wizard' && (
          <WizardProgress currentStep={state.wizardStep} onStepClick={actions.setWizardStep} isZh={isZh} />
        )}

        {/* 自由模式标签页 */}
        {state.mode === 'free' && (
          <ModuleTabs activeModule={state.activeModule} onModuleChange={actions.setModule} isZh={isZh} />
        )}

        {/* 内容区 */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
          {state.mode === 'wizard' ? (
            <div style={{ flex: 1, overflow: 'auto' }}>
              {state.error && (
                <div style={{ margin: 16, padding: '12px 16px', background: 'var(--ef-error-bg, rgba(239,68,68,0.1))', border: '1px solid var(--ef-error)', borderRadius: 6, color: 'var(--ef-error)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{state.error}</span>
                  <button onClick={actions.clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ef-error)' }}>✕</button>
                </div>
              )}
              {renderWizardStep()}
            </div>
          ) : (
            <>
              <div style={{ width: 240, borderRight: '1px solid var(--ef-border)', padding: 12, overflow: 'auto' }}>
                <CharacterSelector characters={characters} selected={state.selectedCharacter} onSelect={actions.setCharacter} isZh={isZh} />
              </div>
              <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
                {state.error && (
                  <div style={{ padding: '12px 16px', background: 'var(--ef-error-bg, rgba(239,68,68,0.1))', border: '1px solid var(--ef-error)', borderRadius: 6, color: 'var(--ef-error)', marginBottom: 16, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{state.error}</span>
                    <button onClick={actions.clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ef-error)' }}>✕</button>
                  </div>
                )}
                {!state.selectedCharacter ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ef-text-muted)', gap: 8 }}>
                    <span style={{ fontSize: 48 }}>👈</span>
                    <span>{isZh ? '请先选择一个角色' : 'Please select a character first'}</span>
                  </div>
                ) : renderFreeModule()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 版本管理（后悔药） */}
      {state.mode === 'wizard' && state.versions.length > 0 && (
        <VersionManager versions={state.versions} currentIndex={state.currentVersionIndex} onRestore={actions.restoreVersion} onClear={actions.clearVersions} isZh={isZh} />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
