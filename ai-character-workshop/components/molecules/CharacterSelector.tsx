/**
 * 角色选择器 - 分子组件
 */

import React from 'react';
import type { CharacterInput } from '../../types';

interface CharacterSelectorProps {
  characters: CharacterInput[];
  selected: CharacterInput | null;
  onSelect: (char: CharacterInput | null) => void;
  isZh: boolean;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  characters,
  selected,
  onSelect,
  isZh,
}) => {
  if (characters.length === 0) {
    return (
      <div style={{
        padding: 16,
        textAlign: 'center',
        color: 'var(--ef-text-muted)',
        fontSize: 13,
      }}>
        {isZh ? '画布上没有角色节点' : 'No character nodes on canvas'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{
        fontSize: 12,
        color: 'var(--ef-text-muted)',
        fontWeight: 500,
      }}>
        {isZh ? '选择角色' : 'Select Character'}
      </label>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        {characters.map(char => (
          <button
            key={char.id}
            onClick={() => onSelect(selected?.id === char.id ? null : char)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: selected?.id === char.id 
                ? '2px solid var(--ef-accent-primary)' 
                : '1px solid var(--ef-border)',
              background: selected?.id === char.id 
                ? 'var(--ef-accent-primary-light, rgba(99,102,241,0.1))' 
                : 'var(--ef-bg-tertiary)',
              color: 'var(--ef-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              transition: 'all 0.15s',
            }}
          >
            {char.imageUrl && (
              <img
                src={char.imageUrl}
                alt={char.name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  objectFit: 'cover',
                }}
              />
            )}
            <span>{char.name}</span>
          </button>
        ))}
      </div>

      {/* 选中角色的详情 */}
      {selected && (
        <div style={{
          marginTop: 8,
          padding: 12,
          background: 'var(--ef-bg-tertiary)',
          borderRadius: 6,
          fontSize: 12,
          color: 'var(--ef-text-secondary)',
        }}>
          {selected.description && (
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>{isZh ? '描述' : 'Description'}:</strong> {selected.description}
            </p>
          )}
          {selected.personality && (
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>{isZh ? '性格' : 'Personality'}:</strong> {selected.personality}
            </p>
          )}
          {selected.tags && selected.tags.length > 0 && (
            <p style={{ margin: 0 }}>
              <strong>{isZh ? '标签' : 'Tags'}:</strong> {selected.tags.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
