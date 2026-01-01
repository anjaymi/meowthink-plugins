/**
 * AI 角色工坊 - 角色智能体生成步骤
 */

import React, { useState } from 'react';
import type { CharacterAgent, CharacterData } from '../../types';

interface AgentStepProps {
  value: Partial<CharacterAgent>;
  character: Partial<CharacterData>;
  onChange: (agent: Partial<CharacterAgent>) => void;
  onGenerate: () => Promise<CharacterAgent>;
  onTestChat?: (message: string) => Promise<string>;
  onNext: () => void;
  onPrev: () => void;
  isGenerating: boolean;
  isZh: boolean;
}

export const AgentStep: React.FC<AgentStepProps> = ({
  value,
  character,
  onChange,
  onGenerate,
  onTestChat,
  onNext,
  onPrev,
  isGenerating,
  isZh,
}) => {
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  // 生成智能体
  const handleGenerate = async () => {
    setProgress(0);
    // 模拟进度
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 300);
    
    try {
      const agent = await onGenerate();
      onChange(agent);
      setProgress(100);
    } catch (err) {
      console.error('生成智能体失败:', err);
    } finally {
      clearInterval(interval);
    }
  };

  // 测试对话
  const handleTestChat = async () => {
    if (!testMessage.trim() || !onTestChat) return;
    setIsTesting(true);
    try {
      const response = await onTestChat(testMessage);
      setTestResponse(response);
    } catch (err) {
      setTestResponse(isZh ? '对话测试失败' : 'Chat test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const canProceed = value.systemPrompt && value.systemPrompt.trim().length > 0;
  const hasAgent = !!value.systemPrompt;

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ef-text)' }}>
        {isZh ? '角色智能体' : 'Character Agent'}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--ef-text-muted)', marginBottom: 16 }}>
        {isZh ? `创建可对话的 ${character.name || '角色'} AI` : `Create a chatbot for ${character.name || 'character'}`}
      </p>

      {/* 生成按钮和进度 */}
      {!hasAgent ? (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ width: '100%', padding: '16px', background: 'var(--ef-accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 500, cursor: isGenerating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isGenerating ? (<><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>{isZh ? '生成中...' : 'Generating...'}</>) : (<><span>🤖</span>{isZh ? '生成角色智能体' : 'Generate Character Agent'}</>)}
          </button>
          
          {/* 进度条 */}
          {isGenerating && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 4, background: 'var(--ef-bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ef-accent)', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--ef-text-muted)', marginTop: 4, textAlign: 'center' }}>
                {isZh ? '正在分析角色数据并生成智能体...' : 'Analyzing character data and generating agent...'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 系统提示词 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '系统提示词' : 'System Prompt'}
            </label>
            <textarea
              value={value.systemPrompt || ''}
              onChange={e => onChange({ ...value, systemPrompt: e.target.value })}
              style={{ width: '100%', minHeight: 100, padding: 12, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 12, resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>

          {/* 示例对话 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '示例对话' : 'Sample Dialogues'}
            </label>
            <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 8, padding: 12, maxHeight: 120, overflowY: 'auto' }}>
              {(value.sampleDialogues || []).map((dialogue, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--ef-text)', marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--ef-accent)' }}>
                  {dialogue}
                </div>
              ))}
              {(!value.sampleDialogues || value.sampleDialogues.length === 0) && (
                <div style={{ fontSize: 12, color: 'var(--ef-text-muted)', fontStyle: 'italic' }}>
                  {isZh ? '暂无示例对话' : 'No sample dialogues'}
                </div>
              )}
            </div>
          </div>

          {/* 测试对话 */}
          {onTestChat && (
            <div style={{ marginBottom: 20, background: 'var(--ef-bg-tertiary)', borderRadius: 8, padding: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 8, color: 'var(--ef-text-muted)' }}>
                {isZh ? '测试对话' : 'Test Chat'}
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTestChat()}
                  placeholder={isZh ? '输入测试消息...' : 'Enter test message...'}
                  style={{ flex: 1, padding: '8px 12px', background: 'var(--ef-bg-secondary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 13 }}
                />
                <button
                  onClick={handleTestChat}
                  disabled={isTesting || !testMessage.trim()}
                  style={{ padding: '8px 16px', background: 'var(--ef-accent)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, cursor: isTesting ? 'wait' : 'pointer' }}
                >
                  {isTesting ? '...' : isZh ? '发送' : 'Send'}
                </button>
              </div>
              {testResponse && (
                <div style={{ padding: 10, background: 'var(--ef-bg-secondary)', borderRadius: 6, fontSize: 12, color: 'var(--ef-text)' }}>
                  <span style={{ fontWeight: 500, color: 'var(--ef-accent)' }}>{character.name}:</span> {testResponse}
                </div>
              )}
            </div>
          )}

          {/* 重新生成 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text-muted)', fontSize: 12, cursor: 'pointer', marginBottom: 16 }}
          >
            {isZh ? '🔄 重新生成智能体' : '🔄 Regenerate Agent'}
          </button>
        </>
      )}

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
