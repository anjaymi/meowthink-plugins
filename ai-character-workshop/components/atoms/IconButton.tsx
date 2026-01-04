
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  size?: number; // Icon size
  className?: string; // Optional for Tailwind/CSS classes
  title?: string;
  variant?: 'default' | 'danger' | 'ghost'; 
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  size = 18, 
  className = '', 
  title,
  variant = 'default' 
}) => {
  const getColors = () => {
    switch(variant) {
      case 'danger': return { color: 'var(--ef-error)', hoverBg: 'var(--ef-error-bg, rgba(239, 68, 68, 0.15))' };
      case 'ghost': return { color: 'var(--ef-text-muted)', hoverBg: 'rgba(255,255,255,0.05)' };
      default: return { color: 'var(--ef-text-secondary)', hoverBg: 'var(--ef-bg-tertiary)' };
    }
  };

  const { color, hoverBg } = getColors();

  return (
    <button
      onClick={onClick}
      title={title}
      className={`workshop-icon-button ${className}`}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 6,
        padding: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Icon size={size} />
    </button>
  );
};
