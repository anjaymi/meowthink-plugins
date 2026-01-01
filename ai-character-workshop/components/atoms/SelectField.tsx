/**
 * 选择框 - 原子组件
 */

import React from 'react';

interface SelectOption {
  value: string;
  label: { zh: string; en: string };
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  isZh: boolean;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  isZh,
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
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid var(--ef-border)',
          background: 'var(--ef-bg-tertiary)',
          color: 'var(--ef-text-primary)',
          fontSize: 13,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {isZh ? opt.label.zh : opt.label.en}
          </option>
        ))}
      </select>
    </div>
  );
};
