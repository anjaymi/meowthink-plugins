
import React from 'react';
import { User, Edit3, CheckCircle2 } from 'lucide-react';
import type { CharacterData } from '../../types';
import type { IntegratedTab } from '../molecules/WorkshopTabBar'; // Import type

interface OverviewTabProps {
  character: Partial<CharacterData>;
  isZh: boolean;
  onTabChange: (tab: IntegratedTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ character, isZh, onTabChange }) => {
  const steps = [
    { tab: 'style' as IntegratedTab, title: isZh ? '风格设定' : 'Style', desc: character.style?.genre || (isZh ? '点击设定' : 'Click to set'), done: !!character.style?.genre },
    { tab: 'basic' as IntegratedTab, title: isZh ? '基础信息' : 'Basic Info', desc: character.name || (isZh ? '点击设定' : 'Click to set'), done: !!character.name },
    { tab: 'appearance' as IntegratedTab, title: isZh ? '外观设计' : 'Appearance', desc: character.appearance?.description?.slice(0, 30) || (isZh ? '点击设定' : 'Click to set'), done: !!character.appearance?.description },
    { tab: 'personality' as IntegratedTab, title: isZh ? '性格设定' : 'Personality', desc: character.personality?.traits?.join(', ')?.slice(0, 30) || (isZh ? '点击设定' : 'Click to set'), done: !!character.personality?.description },
    { tab: 'backstory' as IntegratedTab, title: isZh ? '背景故事' : 'Backstory', desc: character.backstory?.origin?.slice(0, 30) || (isZh ? '点击设定' : 'Click to set'), done: !!character.backstory?.fullStory },
    { tab: 'agent' as IntegratedTab, title: isZh ? '角色智能体' : 'Agent', desc: character.agent?.enabled ? (isZh ? '已启用' : 'Enabled') : (isZh ? '点击创建' : 'Click to create'), done: !!character.agent?.systemPrompt },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 24, height: '100%', overflow: 'hidden' }}>
      {/* Left: Character Card */}
      <div style={{ 
        background: 'var(--ef-bg-secondary)', 
        borderRadius: 16, 
        padding: 24, 
        textAlign: 'center',
        border: '1px solid var(--ef-border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          width: 140, 
          height: 140, 
          borderRadius: 20, // More rounded
          background: 'var(--ef-bg-tertiary)', 
          margin: '0 auto 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 48, 
          overflow: 'hidden', 
          color: 'var(--ef-text-muted)',
          border: '2px solid var(--ef-bg-primary)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {character.images?.[0]?.url ? (
            <img src={character.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={64} strokeWidth={1} />
          )}
        </div>
        
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ef-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            {character.name || (isZh ? '未命名角色' : 'Unnamed Character')}
        </div>
        
        <div style={{ 
            fontSize: 13, 
            color: 'var(--ef-text-muted)', 
            marginBottom: 20,
            padding: '4px 12px',
            background: 'var(--ef-bg-tertiary)',
            borderRadius: 100
        }}>
            {character.style?.genre || (isZh ? '暂无风格' : 'No Style Set')}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', width: '100%' }}>
          {(character.tags || []).slice(0, 6).map(tag => (
            <span key={tag} style={{ 
                padding: '4px 10px', 
                background: 'var(--ef-accent-bg, rgba(99,102,241,0.1))', 
                borderRadius: 8, 
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--ef-accent)' 
            }}>
                {tag}
            </span>
          ))}
          {(!character.tags || character.tags.length === 0) && (
              <span style={{ fontSize: 13, color: 'var(--ef-text-muted)', fontStyle: 'italic' }}>
                  {isZh ? '添加标签以描述角色...' : 'Add tags to describe character...'}
              </span>
          )}
        </div>
      </div>

      {/* Right: Quick Edit Grid */}
      <div style={{ overflowY: 'auto', paddingRight: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {steps.map(item => (
            <button 
                key={item.tab} 
                onClick={() => onTabChange(item.tab)} 
                style={{ 
                    padding: 20, 
                    background: 'var(--ef-bg-secondary)', 
                    border: `1px solid ${item.done ? 'var(--ef-success-border, rgba(34,197,94,0.3))' : 'var(--ef-border)'}`, 
                    borderRadius: 12, 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = 'var(--ef-accent)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = item.done ? 'var(--ef-success-border, rgba(34,197,94,0.3))' : 'var(--ef-border)';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ef-text)' }}>{item.title}</span>
                    {item.done ? (
                        <CheckCircle2 size={18} color="var(--ef-success, #22c55e)" fill="var(--ef-success-bg, rgba(34,197,94,0.1))" />
                    ) : (
                        <Edit3 size={16} color="var(--ef-text-muted)" />
                    )}
                </div>
                <div style={{ 
                    fontSize: 13, 
                    color: item.done ? 'var(--ef-text-secondary)' : 'var(--ef-text-muted)', 
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    opacity: item.done ? 1 : 0.7
                }}>
                    {item.desc}
                </div>
            </button>
            ))}
        </div>
      </div>
    </div>
  );
};
