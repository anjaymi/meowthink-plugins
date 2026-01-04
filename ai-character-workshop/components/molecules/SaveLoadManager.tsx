
import React from 'react';
import { Trash2, User, X } from 'lucide-react';
import type { SavedCharacter } from '../../hooks/useWorkshopState';
import { IconButton } from '../atoms/IconButton';

interface SaveLoadManagerProps {
  isOpen: boolean;
  onClose: () => void;
  savedCharacters: SavedCharacter[];
  onLoad: (saved: SavedCharacter) => void;
  onDelete: (id: string) => void;
  isZh: boolean;
}

export const SaveLoadManager: React.FC<SaveLoadManagerProps> = ({
  isOpen,
  onClose,
  savedCharacters,
  onLoad,
  onDelete,
  isZh,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 320,
      background: 'var(--ef-bg-secondary)',
      borderLeft: '1px solid var(--ef-border)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--ef-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--ef-bg-primary)', // Slightly different header bg
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ef-text)' }}>
          {isZh ? '已保存的角色' : 'Saved Characters'}
        </span>
        <IconButton icon={X} onClick={onClose} />
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 12 }}>
        {savedCharacters.length === 0 ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--ef-text-muted)', 
            fontSize: 13,
            opacity: 0.7 
          }}>
            <User size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.5 }} />
            {isZh ? '暂无保存的角色' : 'No saved characters'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedCharacters.map(saved => (
              <div
                key={saved.id}
                className="saved-char-card"
                style={{
                  padding: 12,
                  background: 'var(--ef-bg-tertiary)',
                  borderRadius: 10,
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => onLoad(saved)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(-2px)';
                  e.currentTarget.style.borderColor = 'var(--ef-accent-light, rgba(99,102,241,0.3))';
                  e.currentTarget.style.background = 'var(--ef-bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'var(--ef-bg-tertiary)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'var(--ef-bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    overflow: 'hidden',
                    border: '1px solid var(--ef-border)',
                  }}>
                    {saved.thumbnail ? (
                      <img src={saved.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={20} className="text-muted" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ef-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 2,
                    }}>
                      {saved.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ef-text-muted)' }}>
                      {new Date(saved.savedAt).toLocaleString(isZh ? 'zh-CN' : 'en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(isZh ? '确定删除此角色？' : 'Delete this character?')) {
                        onDelete(saved.id);
                      }
                    }}
                    className="delete-btn"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--ef-text-muted)',
                      padding: 6,
                      borderRadius: 6,
                      transition: 'all 0.2s',
                    }}
                    title={isZh ? '删除' : 'Delete'}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--ef-error)';
                        e.currentTarget.style.background = 'var(--ef-error-bg, rgba(239, 68, 68, 0.1))';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--ef-text-muted)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {/* Minimal tags to save space */}
                {saved.data.style?.genre && (
                    <div style={{ 
                        marginTop: 8, 
                        fontSize: 10, 
                        display: 'flex', 
                        gap: 4 
                    }}>
                        <span style={{ 
                            padding: '2px 6px', 
                            background: 'var(--ef-accent-bg)', 
                            color: 'var(--ef-accent)',
                            borderRadius: 4
                        }}>
                            {saved.data.style.genre}
                        </span>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
