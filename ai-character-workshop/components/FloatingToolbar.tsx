/**
 * AI 角色工坊 - 顶部悬浮工具栏
 * 组合型插件的快捷入口，显示关联插件状态和快捷操作
 */

import React, { useState, useEffect } from 'react';
import { PluginBridge } from '../api/pluginBridge';

interface PluginStatus {
  id: string;
  name: { zh: string; en: string };
  icon: string;
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
          name: { zh: '角色融合', en: 'Character Fusion' },
          icon: '🔀',
          connected: PluginBridge.isCharacterFusionAvailable(),
          onClick: () => onOpenPlugin?.('character-fusion'),
        },
        {
          id: 'ai-image-gen',
          name: { zh: 'AI 生图', en: 'AI Image Gen' },
          icon: '🎨',
          connected: PluginBridge.isAIImageGenAvailable(),
          onClick: () => onOpenPlugin?.('ai-image-gen'),
        },
        {
          id: 'wiki-gallery',
          name: { zh: '图库数据库', en: 'Gallery DB' },
          icon: '🖼️',
          connected: true, // 假设总是可用
          onClick: () => onOpenPlugin?.('wiki-gallery'),
        },
      ]);
    };
    checkPlugins();
    // 定期检查
    const interval = setInterval(checkPlugins, 5000);
    return () => clearInterval(interval);
  }, [onOpenPlugin]);

  if (!isVisible) return null;

  const connectedCount = plugins.filter(p => p.connected).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 主工具栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 8px',
          background: 'var(--ef-bg-secondary)',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          border: '1px solid var(--ef-border)',
        }}
      >
        {/* Logo 和标题 */}
        <button
          onClick={() => onOpenWorkshop()}
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
          <span>🎭</span>
          <span>{isZh ? '角色工坊' : 'Workshop'}</span>
        </button>

        {/* 分隔线 */}
        <div style={{ width: 1, height: 24, background: 'var(--ef-border)', margin: '0 4px' }} />

        {/* 快捷模式按钮 */}
        <button
          onClick={() => onOpenWorkshop('wizard')}
          title={isZh ? '向导模式 - 引导式创建角色' : 'Wizard Mode'}
          style={{
            padding: '6px 10px',
            background: 'var(--ef-bg-tertiary)',
            border: '1px solid var(--ef-border)',
            borderRadius: 6,
            color: 'var(--ef-text)',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>✨</span>
          <span>{isZh ? '新建' : 'New'}</span>
        </button>

        {/* 分隔线 */}
        <div style={{ width: 1, height: 24, background: 'var(--ef-border)', margin: '0 4px' }} />

        {/* 关联插件状态指示器 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--ef-text-muted)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <span style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: connectedCount > 0 ? 'var(--ef-success, #22c55e)' : 'var(--ef-text-muted)',
          }} />
          <span>{connectedCount}/{plugins.length}</span>
          <span style={{ 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}>▼</span>
        </button>
      </div>

      {/* 展开的插件面板 */}
      {isExpanded && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            background: 'var(--ef-bg-secondary)',
            borderRadius: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '1px solid var(--ef-border)',
            minWidth: 240,
          }}
        >
          <div style={{ 
            fontSize: 11, 
            color: 'var(--ef-text-muted)', 
            marginBottom: 10,
            fontWeight: 500,
          }}>
            {isZh ? '关联插件' : 'Connected Plugins'}
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
                <span style={{ fontSize: 18 }}>{plugin.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 500, 
                    color: 'var(--ef-text)',
                  }}>
                    {isZh ? plugin.name.zh : plugin.name.en}
                  </div>
                  <div style={{ 
                    fontSize: 10, 
                    color: plugin.connected ? 'var(--ef-success, #22c55e)' : 'var(--ef-text-muted)',
                  }}>
                    {plugin.connected 
                      ? (isZh ? '已连接' : 'Connected') 
                      : (isZh ? '未安装' : 'Not installed')}
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
              {isZh ? '快捷操作' : 'Quick Actions'}
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
                {isZh ? '✨ 创建角色' : '✨ Create'}
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
                {isZh ? '🔧 自由模式' : '🔧 Free Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
