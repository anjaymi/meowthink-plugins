/**
 * 模块标签页组 - 分子组件
 */

import React from 'react';
import { ModuleTab } from '../atoms';
import { MODULE_CONFIGS } from '../../constants';
import type { WorkshopModule } from '../../types';

interface ModuleTabsProps {
  activeModule: WorkshopModule;
  onModuleChange: (module: WorkshopModule) => void;
  isZh: boolean;
}

export const ModuleTabs: React.FC<ModuleTabsProps> = ({
  activeModule,
  onModuleChange,
  isZh,
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: '8px 12px',
      borderBottom: '1px solid var(--ef-border)',
      background: 'var(--ef-bg-secondary)',
      overflowX: 'auto',
    }}>
      {MODULE_CONFIGS.map(config => (
        <ModuleTab
          key={config.id}
          config={config}
          isActive={activeModule === config.id}
          onClick={() => onModuleChange(config.id)}
          isZh={isZh}
        />
      ))}
    </div>
  );
};
