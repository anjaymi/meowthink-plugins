/**
 * AI 角色工坊 - 悬浮入口按钮
 * 点击展开功能面板
 */

import React, { useState, useEffect } from 'react';
import { PluginBridge } from '../api/pluginBridge';

interface PluginStatus {
  id: string;
  name: string;
  connected: boolean;
  onClick?: () => void;
}

interface FloatingToolbarProps {
  isVisible: boolean;
  onOpenWorkshop: (mode?: 'wizard' | 'free') => void;
  onOpenPlugin?: (pluginId: string) => void;
  isZh: boolean;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  isVisible,
  onOpenWorkshop,
  onOpenPlugin,
  isZh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [plugins, setPlugins] = useState<PluginStatus[]>([]);

  // 检查插件连接状态
  useEffect(() => {
    const checkPlugins = () => {
      setPlugins([
        {
          id: 'character-fusion',
          name: '角色融合',
          connected: PluginBridge.isCharacterFusionAvailable(),
          onClick: () => onOpenPlugin?.('character-fusion'),
        },
        {
          id: 'ai-image-gen',
          name: 'AI 生图',
          connected: PluginBridge.isAIImageGenAvailable(),
          onClick: () => onOpenPlugin?.('ai-image-gen'),
        },
        {
          id: 'wiki-gallery',
          name: '图库数据库',
          connected: true,
          onClick: () => onOpenPlugin?.('wiki-gallery'),
        },
      ]);
    };
    checkPlugins();
    const interval = setInterval(checkPlugins, 5000);
    return () => clearInterval(interval);
  }, [onOpenPlugin]);

  if (!isVisible) return null;

  const connectedCount = plugins.filter(p => p.connected).length;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* 主按钮 - 悬浮图标 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'var(--ef-accent)',
          border: 'none',
          borderRadius: 8,
          color: 'white',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <span>角色工坊</span>
        <span style={{ 
          fontSize: 10, 
          opacity: 0.8,
          background: 'rgba(255,255,255,0.2)',
          padding: '2px 6px',
          borderRadius: 4,
        }}>
          {connectedCount}/{plugins.length}
        </span>
      </button>

      {/* 展开的功能面板 */}
      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            padding: 12,
            background: 'var(--ef-bg-secondary)',
            borderRadius: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1px solid var(--ef-border)',
            minWidth: 220,
            zIndex: 1000,
          }}
        >
          {/* 关联插件 */}
          <div style={{ 
            fontSize: 11, 
            color: 'var(--ef-text-muted)', 
            marginBottom: 10,
            fontWeight: 500,
          }}>
            关联插件
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {plugins.map(plugin => (
              <button
                key={plugin.id}
                onClick={plugin.onClick}
                disabled={!plugin.connected}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: plugin.connected ? 'var(--ef-bg-tertiary)' : 'transparent',
                  border: `1px solid ${plugin.connected ? 'var(--ef-border)' : 'var(--ef-border)'}`,
                  borderRadius: 8,
                  cursor: plugin.connected ? 'pointer' : 'not-allowed',
                  opacity: plugin.connected ? 1 : 0.5,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 500, 
                    color: 'var(--ef-text)',
                  }}>
                    {plugin.name}
                  </div>
                  <div style={{ 
                    fontSize: 10, 
                    color: plugin.connected ? 'var(--ef-success, #22c55e)' : 'var(--ef-text-muted)',
                  }}>
                    {plugin.connected ? '已连接' : '未安装'}
                  </div>
                </div>
                {plugin.connected && (
                  <span style={{ color: 'var(--ef-text-muted)', fontSize: 12 }}>→</span>
                )}
              </button>
            ))}
          </div>

          {/* 快捷操作 */}
          <div style={{ 
            marginTop: 12, 
            paddingTop: 12, 
            borderTop: '1px solid var(--ef-border)',
          }}>
            <div style={{ 
              fontSize: 11, 
              color: 'var(--ef-text-muted)', 
              marginBottom: 8,
              fontWeight: 500,
            }}>
              快捷操作
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => { onOpenWorkshop('wizard'); setIsExpanded(false); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'var(--ef-accent)',
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                创建角色
              </button>
              <button
                onClick={() => { onOpenWorkshop('free'); setIsExpanded(false); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'var(--ef-bg-tertiary)',
                  border: '1px solid var(--ef-border)',
                  borderRadius: 6,
                  color: 'var(--ef-text)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                自由模式
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
