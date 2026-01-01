/**
 * 数字输入框 - 原子组件
 */

import React from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{
        fontSize: 12,
        color: 'var(--ef-text-muted)',
        fontWeight: 500,
      }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
        min={min}
        max={max}
        disabled={disabled}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid var(--ef-border)',
          background: 'var(--ef-bg-tertiary)',
          color: 'var(--ef-text-primary)',
          fontSize: 13,
          width: 80,
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
        }}
      />
    </div>
  );
};
