import React, { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface UsePanelDragReturn {
  panelSize: Size;
  panelPosition: Position;
  isDragging: boolean;
  isResizing: string | null;
  handleDragStart: (e: React.MouseEvent) => void;
  handleResizeStart: (e: React.MouseEvent, direction: string) => void;
}

const MIN_WIDTH = 600;
const MIN_HEIGHT = 400;
const MAX_WIDTH_RATIO = 0.95;
const MAX_HEIGHT_RATIO = 0.95;

export const usePanelDrag = (isOpen: boolean): UsePanelDragReturn => {
  const [panelSize, setPanelSize] = useState<Size>({ width: 1000, height: 700 });
  const [panelPosition, setPanelPosition] = useState<Position>({ x: 0, y: 0 });
  const [isPositionInitialized, setIsPositionInitialized] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0, width: 0, height: 0 });

  // Initialize position on open
  useEffect(() => {
    if (isOpen && !isPositionInitialized) {
      const w = Math.min(1000, window.innerWidth * 0.92);
      const h = Math.min(700, window.innerHeight * 0.88);
      setPanelSize({ width: w, height: h });
      setPanelPosition({
        x: (window.innerWidth - w) / 2,
        y: (window.innerHeight - h) / 2,
      });
      setIsPositionInitialized(true);
    }
    if (!isOpen) {
      setIsPositionInitialized(false);
    }
  }, [isOpen, isPositionInitialized]);

  // Drag Handler
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    // Prevent drag if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, select, input, .no-drag')) return;
    
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: panelPosition.x,
      posY: panelPosition.y,
      width: panelSize.width,
      height: panelSize.height,
    };
  }, [panelPosition, panelSize]);

  // Resize Handler
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(direction);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: panelPosition.x,
      posY: panelPosition.y,
      width: panelSize.width,
      height: panelSize.height,
    };
  }, [panelPosition, panelSize]);

  // Mouse Move & Up Listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newX = Math.max(0, Math.min(window.innerWidth - panelSize.width, dragStartRef.current.posX + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - panelSize.height, dragStartRef.current.posY + dy));
        setPanelPosition({ x: newX, y: newY });
      } else if (isResizing) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const maxW = window.innerWidth * MAX_WIDTH_RATIO;
        const maxH = window.innerHeight * MAX_HEIGHT_RATIO;
        
        let newWidth = dragStartRef.current.width;
        let newHeight = dragStartRef.current.height;
        let newX = dragStartRef.current.posX;
        let newY = dragStartRef.current.posY;
        
        if (isResizing.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, Math.min(maxW, dragStartRef.current.width + dx));
        }
        if (isResizing.includes('w')) {
          const potentialWidth = dragStartRef.current.width - dx;
          if (potentialWidth >= MIN_WIDTH && potentialWidth <= maxW) {
            newWidth = potentialWidth;
            newX = dragStartRef.current.posX + dx;
          }
        }
        if (isResizing.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, Math.min(maxH, dragStartRef.current.height + dy));
        }
        if (isResizing.includes('n')) {
          const potentialHeight = dragStartRef.current.height - dy;
          if (potentialHeight >= MIN_HEIGHT && potentialHeight <= maxH) {
            newHeight = potentialHeight;
            newY = dragStartRef.current.posY + dy;
          }
        }
        
        setPanelSize({ width: newWidth, height: newHeight });
        setPanelPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, panelSize]);

  return {
    panelSize,
    panelPosition,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart
  };
};
