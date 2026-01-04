/**
 * AI 角色工坊 - 版本管理组件（后悔药功能）
 */

import React, { useState } from 'react';
import type { CharacterVersion } from '../../types';

interface VersionManagerProps {
  versions: CharacterVersion[];
  currentIndex: number;
  onRestore: (index: number) => void;
  onClear: () => void;
  isZh: boolean;
}

export const VersionManager: React.FC<VersionManagerProps> = ({
  versions,
  currentIndex,
  onRestore,
  onClear,
  isZh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (versions.length === 0) return null;

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1001,
    }}>
      {/* 展开的版本列表 */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          bottom: 50,
          right: 0,
          width: 280,
          maxHeight: 300,
          background: 'var(--ef-bg-secondary)',
          border: '1px solid var(--ef-border)',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          {/* 头部 */}
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--ef-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--ef-bg-tertiary)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {isZh ? '版本历史' : 'Version History'}
            </span>
            <button
              onClick={onClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ef-error)',
                cursor: 'pointer',
                fontSize: 11,
                padding: '2px 6px',
              }}
            >
              {isZh ? '清空' : 'Clear'}
            </button>
          </div>

          {/* 版本列表 */}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {versions.map((version, index) => (
              <div
                key={version.id}
                onClick={() => onRestore(index)}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--ef-border)',
                  cursor: 'pointer',
                  background: index === currentIndex 
                    ? 'var(--ef-accent-bg, rgba(99,102,241,0.1))' 
                    : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (index !== currentIndex) {
                    e.currentTarget.style.background = 'var(--ef-bg-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (index !== currentIndex) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: index === currentIndex ? 600 : 400,
                    color: index === currentIndex ? 'var(--ef-accent)' : 'var(--ef-text)',
                  }}>
                    v{index + 1}
                    {index === currentIndex && (
                      <span style={{ 
                        marginLeft: 6, 
                        fontSize: 10, 
                        color: 'var(--ef-accent)',
                      }}>
                        {isZh ? '当前' : 'Current'}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ef-text-muted)' }}>
                    {formatTime(version.timestamp)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: 11, 
                  color: 'var(--ef-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {version.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 触发按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          background: 'var(--ef-bg-secondary)',
          border: '1px solid var(--ef-border)',
          borderRadius: 20,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          color: 'var(--ef-text)',
          fontSize: 12,
        }}
      >
        <span>⏪</span>
        <span>{isZh ? '后悔药' : 'Undo'}</span>
        <span style={{
          background: 'var(--ef-accent)',
          color: 'white',
          padding: '1px 6px',
          borderRadius: 10,
          fontSize: 10,
        }}>
          {versions.length}
        </span>
      </button>
    </div>
  );
};
