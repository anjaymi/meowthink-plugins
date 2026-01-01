/**
 * AI 角色工坊 - 插件入口
 * 综合性角色创建工具，支持向导模式和自由模式
 */

import type { ExtensionContext } from '../../../types/extension';
import { PluginBridge } from './api/pluginBridge';

export function activate(context: ExtensionContext) {
  const { ui, commands, storage } = context;

  // 注册命令
  commands.register('ai-character-workshop.open', () => {
    window.dispatchEvent(new CustomEvent('meowthink:openCharacterWorkshop'));
  });

  commands.register('ai-character-workshop.openWizard', () => {
    window.dispatchEvent(new CustomEvent('meowthink:openCharacterWorkshop', { detail: { mode: 'wizard' } }));
  });

  commands.register('ai-character-workshop.openFree', () => {
    window.dispatchEvent(new CustomEvent('meowthink:openCharacterWorkshop', { detail: { mode: 'free' } }));
  });

  commands.register('ai-character-workshop.toggleToolbar', () => {
    // 通过事件通知悬浮工具栏切换显示状态
    window.dispatchEvent(new CustomEvent('workshop-toolbar-toggle'));
  });

  commands.register('ai-character-workshop.showToolbar', () => {
    window.dispatchEvent(new CustomEvent('workshop-toolbar-show'));
  });

  commands.register('ai-character-workshop.hideToolbar', () => {
    window.dispatchEvent(new CustomEvent('workshop-toolbar-hide'));
  });

  // 注册侧边栏按钮
  ui.registerSidebarButton({
    id: 'ai-character-workshop',
    icon: '🎭',
    tooltip: { zh: 'AI 角色工坊', en: 'AI Character Workshop' },
    onClick: () => commands.execute('ai-character-workshop.open'),
  });

  // 注册面板
  ui.registerPanel({
    id: 'ai-character-workshop',
    title: { zh: 'AI 角色工坊', en: 'AI Character Workshop' },
    component: 'WorkshopPanel',
  });

  // 注册右键菜单
  ui.registerContextMenu({
    id: 'ai-character-workshop-context',
    label: { zh: 'AI 角色工坊', en: 'AI Character Workshop' },
    items: [
      { id: 'wizard', label: { zh: '向导模式创建角色', en: 'Create with Wizard' }, command: 'ai-character-workshop.openWizard' },
      { id: 'free', label: { zh: '自由模式', en: 'Free Mode' }, command: 'ai-character-workshop.openFree' },
    ],
  });

  console.log('[AI Character Workshop] 插件已激活');
}

export function deactivate() {
  console.log('[AI Character Workshop] 插件已停用');
}

// 导出组件供面板使用
export { WorkshopPanel } from './components/WorkshopPanel';
export { IntegratedPanel } from './components/IntegratedPanel';
export { FloatingToolbar } from './components/FloatingToolbar';
export * from './types';
export * from './constants';

// 导出 Hooks
export { useToolbarVisibility } from './hooks/useToolbarVisibility';
export { useWorkshopState } from './hooks/useWorkshopState';

// 导出工具函数
export * from './utils/pdfExport';

// 导出插件桥接接口（供其他插件调用）
export { PluginBridge } from './api/pluginBridge';
