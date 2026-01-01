/**
 * AI 角色工坊 - 悬浮工具栏可见性控制 Hook
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ai-character-workshop-toolbar-visible';

export function useToolbarVisibility() {
  // 从 localStorage 读取初始状态
  const [isVisible, setIsVisible] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // 保存状态到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isVisible));
    } catch {
      // 忽略存储错误
    }
  }, [isVisible]);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible((v: boolean) => !v), []);

  return {
    isVisible,
    show,
    hide,
    toggle,
  };
}
