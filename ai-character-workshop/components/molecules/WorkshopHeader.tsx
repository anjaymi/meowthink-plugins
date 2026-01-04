
import React from 'react';
import { X, Maximize2, Minimize2, MoreHorizontal } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';

interface WorkshopHeaderProps {
  title: string;
  isZh: boolean;
  completionPercent: number;
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onClose: () => void;
  onMaximize?: () => void; // Optional maximize functionality
  isMaximized?: boolean;
}

export const WorkshopHeader: React.FC<WorkshopHeaderProps> = ({
  title,
  isZh,
  completionPercent,
  isDragging,
  onDragStart,
  onClose,
}) => {
  return (
    <div
      onMouseDown={onDragStart}
      style={{
        padding: '12px 20px',
        background: 'var(--ef-bg-secondary)',
        borderBottom: '1px solid var(--ef-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: 8, 
          background: 'var(--ef-accent)', 
          backgroundSize: '200% 200%',
          animation: 'gradientBG 3s ease infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}>
          {isZh ? '角' : 'AI'}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ef-text)' }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ef-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
             {isZh ? `完成度 ${completionPercent}%` : `${completionPercent}% Complete`}
             <div style={{ width: 60, height: 3, background: 'var(--ef-bg-tertiary)', borderRadius: 2 }}>
               <div style={{ 
                 height: '100%', 
                 width: `${completionPercent}%`, 
                 background: completionPercent === 100 ? 'var(--ef-success)' : 'var(--ef-accent)',
                 borderRadius: 2,
                 transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
               }} />
             </div>
          </div>
        </div>
      </div>


      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <IconButton icon={MoreHorizontal} onClick={() => {}} title={isZh ? '更多选项' : 'Options'} />
        <div style={{ width: 1, height: 16, background: 'var(--ef-border)', opacity: 0.5 }} />
        <IconButton icon={X} onClick={onClose} variant="danger" title={isZh ? '关闭' : 'Close'} />
      </div>


      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};
