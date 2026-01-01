/**
 * AI 角色工坊 - 向导进度条组件
 */

import React from 'react';
import { WIZARD_STEPS } from '../../constants';
import type { WizardStep } from '../../types';

interface WizardProgressProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  isZh: boolean;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  onStepClick,
  isZh,
}) => {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      background: 'var(--ef-bg-tertiary)',
      borderBottom: '1px solid var(--ef-border)',
      overflowX: 'auto',
      gap: 4,
    }}>
      {WIZARD_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isClickable = isCompleted && onStepClick;

        return (
          <React.Fragment key={step.id}>
            {/* 步骤指示器 */}
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 6,
                border: 'none',
                background: isActive 
                  ? 'var(--ef-accent)' 
                  : isCompleted 
                    ? 'var(--ef-success-bg, rgba(34,197,94,0.15))' 
                    : 'transparent',
                color: isActive 
                  ? 'white' 
                  : isCompleted 
                    ? 'var(--ef-success, #22c55e)' 
                    : 'var(--ef-text-muted)',
                cursor: isClickable ? 'pointer' : 'default',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                opacity: index > currentIndex ? 0.5 : 1,
              }}
              title={isZh ? step.description.zh : step.description.en}
            >
              <span style={{ fontSize: 14 }}>
                {isCompleted ? '✓' : step.icon}
              </span>
              <span>{isZh ? step.name.zh : step.name.en}</span>
            </button>

            {/* 连接线 */}
            {index < WIZARD_STEPS.length - 1 && (
              <div style={{
                width: 20,
                height: 2,
                background: index < currentIndex 
                  ? 'var(--ef-success, #22c55e)' 
                  : 'var(--ef-border)',
                borderRadius: 1,
                flexShrink: 0,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
