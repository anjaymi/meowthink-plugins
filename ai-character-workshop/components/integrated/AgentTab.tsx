/**
 * AI 角色工坊 - 集成面板智能体标签页
 */

import React, { useState } from 'react';
import type { CharacterAgent, CharacterData } from '../../types';

interface AgentTabProps {
  value: Partial<CharacterAgent>;
  character: Partial<CharacterData>;
  onChange: (agent: Partial<CharacterAgent>) => void;
  onGenerate: () => Promise<CharacterAgent>;
  onTestChat?: (message: string) => Promise<string>;
  isGenerating: boolean;
  isZh: boolean;
}

export const AgentTab: React.FC<AgentTabProps> = ({
  value,
  character,
  onChange,
  onGenerate,
  onTestChat,
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

  const hasAgent = !!value.systemPrompt;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ef-text)', margin: 0 }}>
          {isZh ? '角色智能体' : 'Character Agent'}
        </h4>
        {hasAgent && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--ef-border)', borderRadius: 4, color: 'var(--ef-text-muted)', fontSize: 10, cursor: 'pointer' }}
          >
            🔄 {isZh ? '重新生成' : 'Regenerate'}
          </button>
        )}
      </div>

      {!hasAgent ? (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ width: '100%', padding: '14px', background: 'var(--ef-accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: isGenerating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {isGenerating ? '⏳' : '🤖'} {isZh ? '生成角色智能体' : 'Generate Character Agent'}
          </button>
          
          {isGenerating && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 3, background: 'var(--ef-bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ef-accent)', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--ef-text-muted)', marginTop: 4, textAlign: 'center' }}>
                {isZh ? '正在分析角色数据并生成智能体...' : 'Analyzing character data...'}
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: 'var(--ef-text-muted)', marginTop: 12, textAlign: 'center' }}>
            {isZh ? '创建可对话的角色 AI，基于角色设定生成系统提示词' : 'Create a chatbot based on character settings'}
          </p>
        </div>
      ) : (
        <>
          {/* 系统提示词 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '系统提示词' : 'System Prompt'}
            </label>
            <textarea
              value={value.systemPrompt || ''}
              onChange={e => onChange({ ...value, systemPrompt: e.target.value })}
              style={{ width: '100%', minHeight: 80, padding: 10, background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 6, color: 'var(--ef-text)', fontSize: 11, resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>

          {/* 示例对话 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 4, color: 'var(--ef-text-muted)' }}>
              {isZh ? '示例对话' : 'Sample Dialogues'}
            </label>
            <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 6, padding: 10, maxHeight: 80, overflowY: 'auto' }}>
              {(value.sampleDialogues || []).map((dialogue, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--ef-text)', marginBottom: 6, paddingLeft: 10, borderLeft: '2px solid var(--ef-accent)' }}>
                  {dialogue}
                </div>
              ))}
              {(!value.sampleDialogues || value.sampleDialogues.length === 0) && (
                <div style={{ fontSize: 11, color: 'var(--ef-text-muted)', fontStyle: 'italic' }}>
                  {isZh ? '暂无示例对话' : 'No sample dialogues'}
                </div>
              )}
            </div>
          </div>

          {/* 测试对话 */}
          {onTestChat && (
            <div style={{ background: 'var(--ef-bg-tertiary)', borderRadius: 6, padding: 10 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, color: 'var(--ef-text-muted)' }}>
                {isZh ? '测试对话' : 'Test Chat'}
              </label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input
                  type="text"
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTestChat()}
                  placeholder={isZh ? '输入测试消息...' : 'Enter test message...'}
                  style={{ flex: 1, padding: '6px 10px', background: 'var(--ef-bg-secondary)', border: '1px solid var(--ef-border)', borderRadius: 4, color: 'var(--ef-text)', fontSize: 12 }}
                />
                <button
                  onClick={handleTestChat}
                  disabled={isTesting || !testMessage.trim()}
                  style={{ padding: '6px 12px', background: 'var(--ef-accent)', border: 'none', borderRadius: 4, color: 'white', fontSize: 11, cursor: isTesting ? 'wait' : 'pointer' }}
                >
                  {isTesting ? '...' : isZh ? '发送' : 'Send'}
                </button>
              </div>
              {testResponse && (
                <div style={{ padding: 8, background: 'var(--ef-bg-secondary)', borderRadius: 4, fontSize: 11, color: 'var(--ef-text)' }}>
                  <span style={{ fontWeight: 500, color: 'var(--ef-accent)' }}>{character.name}:</span> {testResponse}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
