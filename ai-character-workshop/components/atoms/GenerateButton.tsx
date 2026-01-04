/**
 * 生成按钮 - 原子组件
 */

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  label = 'AI 生成',
  className = '',
  disabled = false,
}) => {
  return (
    <button
      onClick={!isLoading && !disabled ? onClick : undefined}
      className={className}
      disabled={disabled || isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '6px 12px',
        background: 'var(--ef-accent)',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.7 : 1,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => !disabled && !isLoading && (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={(e) => !disabled && !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Sparkles size={14} />
      )}
      <span>{label}</span>
    </button>
  );
};
