/**
 * 模块标签页按钮 - 原子组件
 */

import React from 'react';
import type { ModuleConfig } from '../../types';

interface ModuleTabProps {
  config: ModuleConfig;
  isActive: boolean;
  onClick: () => void;
  isZh: boolean;
}

export const ModuleTab: React.FC<ModuleTabProps> = ({
  config,
  isActive,
  onClick,
  isZh,
}) => {
  return (
    <button
      onClick={onClick}
      title={isZh ? config.description.zh : config.description.en}
      style={{
        padding: '8px 12px',
        borderRadius: 6,
        border: 'none',
        background: isActive ? 'var(--ef-accent-primary)' : 'transparent',
        color: isActive ? '#fff' : 'var(--ef-text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        fontWeight: isActive ? 500 : 400,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{config.icon}</span>
      <span>{isZh ? config.name.zh : config.name.en}</span>
    </button>
  );
};
