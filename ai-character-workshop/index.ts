/**
 * AI 角色工坊 - 插件入口
 * 综合性角色创建工具，支持向导模式和自由模式
 */

import type { IExtensionContext, IExtensionAPI, IExtensionModule } from '../../../types/extension';

// 扩展模块
const extensionModule: IExtensionModule = {
  activate: async (_context: IExtensionContext, api: IExtensionAPI) => {
    const locale = api.i18n.getLocale();
    const isZh = locale === 'zh';

    // 注册命令：打开角色工坊
    api.ui.registerCommand({
      id: 'meowthink.ai-character-workshop.open',
      title: isZh ? '打开 AI 角色工坊' : 'Open AI Character Workshop',
      icon: '🎭',
      handler: () => {
        window.dispatchEvent(new CustomEvent('meowthink:openCharacterWorkshop'));
      },
    });

    // 注册命令：向导模式
    api.ui.registerCommand({
      id: 'meowthink.ai-character-workshop.openWizard',
      title: isZh ? '向导模式创建角色' : 'Create with Wizard',
      icon: '✨',
      handler: () => {
        window.dispatchEvent(new CustomEvent('meowthink:openCharacterWorkshop', { detail: { mode: 'wizard' } }));
      },
    });

    // 注册命令：自由模式
    api.ui.registerCommand({
      id: 'meowthink.ai-character-workshop.openFree',
      title: isZh ? '自由模式' : 'Free Mode',
      icon: '📝',
      handler: () => {
        window.dispatchEvent(new CustomEvent('meowthink:openCharacterWorkshop', { detail: { mode: 'free' } }));
      },
    });

    // 注册命令：切换悬浮工具栏
    api.ui.registerCommand({
      id: 'meowthink.ai-character-workshop.toggleToolbar',
      title: isZh ? '切换悬浮工具栏' : 'Toggle Floating Toolbar',
      icon: '🔧',
      handler: () => {
        window.dispatchEvent(new CustomEvent('workshop-toolbar-toggle'));
      },
    });

    // 注册命令：显示悬浮工具栏
    api.ui.registerCommand({
      id: 'meowthink.ai-character-workshop.showToolbar',
      title: isZh ? '显示悬浮工具栏' : 'Show Floating Toolbar',
      handler: () => {
        window.dispatchEvent(new CustomEvent('workshop-toolbar-show'));
      },
    });

    // 注册命令：隐藏悬浮工具栏
    api.ui.registerCommand({
      id: 'meowthink.ai-character-workshop.hideToolbar',
      title: isZh ? '隐藏悬浮工具栏' : 'Hide Floating Toolbar',
      handler: () => {
        window.dispatchEvent(new CustomEvent('workshop-toolbar-hide'));
      },
    });

    // 注册工具栏按钮
    api.ui.registerToolbarButton({
      id: 'aiCharacterWorkshopBtn',
      title: isZh ? 'AI 角色工坊' : 'AI Character Workshop',
      icon: '🎭',
      command: 'meowthink.ai-character-workshop.open',
      order: 30,
    });

    console.log('[AI Character Workshop] 插件已激活');
  },

  deactivate: async () => {
    console.log('[AI Character Workshop] 插件已停用');
  },
};

export default extensionModule;

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
