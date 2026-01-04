
import React from 'react';

// Define the Tabs here to keep it centralized or accept as prop
export type IntegratedTab = 'overview' | 'style' | 'basic' | 'appearance' | 'personality' | 'backstory' | 'agent' | 'export';

interface TabConfig {
  id: IntegratedTab;
  name: { zh: string; en: string };
  icon?: string; // Could be LucideIcon
}

export const WORKSHOP_TABS: TabConfig[] = [
  { id: 'overview', name: { zh: '总览', en: 'Overview' } },
  { id: 'style', name: { zh: '风格', en: 'Style' } },
  { id: 'basic', name: { zh: '基础', en: 'Basic' } },
  { id: 'appearance', name: { zh: '外观', en: 'Look' } },
  { id: 'personality', name: { zh: '性格', en: 'Personality' } },
  { id: 'backstory', name: { zh: '背景', en: 'Story' } },
  { id: 'agent', name: { zh: '智能体', en: 'Agent' } },
  { id: 'export', name: { zh: '导出', en: 'Export' } },
];

interface WorkshopTabBarProps {
  activeTab: IntegratedTab;
  onTabChange: (tab: IntegratedTab) => void;
  isZh: boolean;
}

export const WorkshopTabBar: React.FC<WorkshopTabBarProps> = ({
  activeTab,
  onTabChange,
  isZh,
}) => {
  return (
    <div style={{
      display: 'flex',
      padding: '0 12px',
      background: 'var(--ef-bg-secondary)',
      borderBottom: '1px solid var(--ef-border)',
      overflowX: 'auto',
      gap: 4,
    }}>
      {WORKSHOP_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: 'relative',
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '12px 16px',
                background: 'transparent', 
                border: 'none',
                color: isActive ? 'var(--ef-accent)' : 'var(--ef-text-muted)',
                fontSize: 13, 
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', 
                whiteSpace: 'nowrap', 
                transition: 'all 0.2s ease',
                opacity: isActive ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = '1';
                  if (!isActive) e.currentTarget.style.color = 'var(--ef-text)';
              }}
              onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = '0.7';
                  if (!isActive) e.currentTarget.style.color = 'var(--ef-text-muted)';
              }}
            >
              <span>{isZh ? tab.name.zh : tab.name.en}</span>
              {isActive && (
                  <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'var(--ef-accent)',
                      borderTopLeftRadius: 2,
                      borderTopRightRadius: 2,
                      boxShadow: '0 -2px 8px var(--ef-accent-light)'
                  }} />
              )}
            </button>
          );
      })}
    </div>
  );
};
