/**
 * AI 角色工坊 - 完成步骤
 */

import React from 'react';
import type { CharacterData } from '../../types';

interface CompleteStepProps {
  character: Partial<CharacterData>;
  onExport: (format: 'json' | 'markdown' | 'canvas') => void;
  onCreateVariant: () => void;
  onStartNew: () => void;
  onPrev: () => void;
  isZh: boolean;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  character,
  onExport,
  onCreateVariant,
  onStartNew,
  onPrev,
  isZh,
}) => {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      {/* 成功图标 */}
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--ef-text)' }}>
        {isZh ? '角色创建完成！' : 'Character Created!'}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--ef-text-muted)', marginBottom: 24 }}>
        {isZh 
          ? `${character.name || '角色'} 已成功创建` 
          : `${character.name || 'Character'} has been created successfully`}
      </p>

      {/* 角色预览卡片 */}
      <div style={{
        background: 'var(--ef-bg-tertiary)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        textAlign: 'left',
        maxWidth: 400,
        margin: '0 auto 24px',
      }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {/* 头像占位 */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            background: 'var(--ef-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            flexShrink: 0,
          }}>
            {character.images?.[0]?.url ? (
              <img src={character.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            ) : '👤'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ef-text)', marginBottom: 4 }}>
              {character.name || (isZh ? '未命名' : 'Unnamed')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ef-text-muted)', marginBottom: 8 }}>
              {character.style?.genre} {character.style?.subGenre && `/ ${character.style.subGenre}`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {(character.tags || []).slice(0, 4).map(tag => (
                <span key={tag} style={{ padding: '2px 8px', background: 'var(--ef-accent-bg, rgba(99,102,241,0.15))', borderRadius: 10, fontSize: 10, color: 'var(--ef-accent)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 简要信息 */}
        {character.personality?.description && (
          <div style={{ fontSize: 12, color: 'var(--ef-text)', lineHeight: 1.5, marginBottom: 8 }}>
            <span style={{ fontWeight: 500, color: 'var(--ef-text-muted)' }}>{isZh ? '性格：' : 'Personality: '}</span>
            {character.personality.description.slice(0, 100)}...
          </div>
        )}
        {character.agent?.enabled && (
          <div style={{ fontSize: 11, color: 'var(--ef-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🤖</span> {isZh ? '智能体已启用' : 'Agent enabled'}
          </div>
        )}
      </div>

      {/* 导出选项 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ef-text-muted)', marginBottom: 12 }}>
          {isZh ? '导出角色' : 'Export Character'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={() => onExport('json')}
            style={{ padding: '10px 20px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>📄</span> JSON
          </button>
          <button
            onClick={() => onExport('markdown')}
            style={{ padding: '10px 20px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>📝</span> Markdown
          </button>
          <button
            onClick={() => onExport('canvas')}
            style={{ padding: '10px 20px', background: 'var(--ef-accent)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>🎨</span> {isZh ? '添加到画布' : 'Add to Canvas'}
          </button>
        </div>
      </div>

      {/* 后续操作 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={onCreateVariant}
          style={{ padding: '10px 20px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, cursor: 'pointer' }}
        >
          🔄 {isZh ? '创建变体' : 'Create Variant'}
        </button>
        <button
          onClick={onStartNew}
          style={{ padding: '10px 20px', background: 'var(--ef-bg-tertiary)', border: '1px solid var(--ef-border)', borderRadius: 8, color: 'var(--ef-text)', fontSize: 13, cursor: 'pointer' }}
        >
          ✨ {isZh ? '创建新角色' : 'Create New'}
        </button>
      </div>

      {/* 返回按钮 */}
      <button
        onClick={onPrev}
        style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--ef-text-muted)', fontSize: 12, cursor: 'pointer' }}
      >
        {isZh ? '← 返回编辑' : '← Back to Edit'}
      </button>
    </div>
  );
};
