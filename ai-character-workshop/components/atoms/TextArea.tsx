/**
 * 文本域 - 原子组件
 */

import React from 'react';

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxLength?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  maxLength,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{
          fontSize: 12,
          color: 'var(--ef-text-muted)',
          fontWeight: 500,
        }}>
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid var(--ef-border)',
          background: 'var(--ef-bg-tertiary)',
          color: 'var(--ef-text-primary)',
          fontSize: 13,
          resize: 'vertical',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
};
