/**
 * 生成按钮 - 原子组件
 */

import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  isZh: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  disabled,
  isZh,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        padding: '10px 24px',
        borderRadius: 8,
        border: 'none',
        background: disabled ? 'var(--ef-bg-tertiary)' : 'var(--ef-accent-primary)',
        color: disabled ? 'var(--ef-text-muted)' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minWidth: 120,
        transition: 'all 0.15s',
      }}
    >
      {isLoading ? (
        <>
          <span style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          {isZh ? '生成中...' : 'Generating...'}
        </>
      ) : (
        <>
          ✨ {isZh ? '生成' : 'Generate'}
        </>
      )}
    </button>
  );
};
