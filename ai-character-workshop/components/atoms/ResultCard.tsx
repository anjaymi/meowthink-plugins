/**
 * 结果卡片 - 原子组件
 */

import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  onCopy?: () => void;
  onAddToCanvas?: () => void;
  isZh: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  children,
  onCopy,
  onAddToCanvas,
  isZh,
}) => {
  return (
    <div style={{
      background: 'var(--ef-bg-tertiary)',
      borderRadius: 8,
      border: '1px solid var(--ef-border)',
      overflow: 'hidden',
    }}>
      {/* 标题栏 */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--ef-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--ef-bg-secondary)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {onCopy && (
            <button
              onClick={onCopy}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                background: 'transparent',
                color: 'var(--ef-text-muted)',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              📋 {isZh ? '复制' : 'Copy'}
            </button>
          )}
          {onAddToCanvas && (
            <button
              onClick={onAddToCanvas}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                background: 'var(--ef-accent-primary)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              ➕ {isZh ? '添加' : 'Add'}
            </button>
          )}
        </div>
      </div>
      
      {/* 内容区 */}
      <div style={{ padding: 12 }}>
        {children}
      </div>
    </div>
  );
};
