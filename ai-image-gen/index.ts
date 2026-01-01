/**
 * AI Image Generation Extension - AI 生图
 * 使用 AI 模型生成图片，支持多种服务商
 */

import { IExtensionContext, IExtensionAPI, IExtensionModule } from '../../../types/extension';

// 扩展状态
let panelVisible = false;

// 打开 AI 生图面板
const openImageGenPanel = (api: IExtensionAPI) => {
  window.dispatchEvent(new CustomEvent('meowthink:openImageGenPanel'));
  panelVisible = true;
  
  const locale = api.i18n.getLocale();
  api.ui.showNotification(
    locale === 'zh' ? 'AI生图面板已打开' : 'AI Image Gen panel opened',
    'info'
  );
};

// 关闭面板
const closeImageGenPanel = () => {
  window.dispatchEvent(new CustomEvent('meowthink:closeImageGenPanel'));
  panelVisible = false;
};

// 切换面板
const toggleImageGenPanel = (api: IExtensionAPI) => {
  if (panelVisible) {
    closeImageGenPanel();
  } else {
    openImageGenPanel(api);
  }
};

// 从选中内容生成
const generateFromSelection = (api: IExtensionAPI) => {
  // 获取当前选中的节点文本
  const selectedNodes = api.nodes.getSelected();
  if (selectedNodes.length === 0) {
    const locale = api.i18n.getLocale();
    api.ui.showNotification(
      locale === 'zh' ? '请先选择一个节点' : 'Please select a node first',
      'warning'
    );
    return;
  }
  
  // 收集选中节点的文本作为提示词
  const prompts = selectedNodes
    .map(node => node.text || '')
    .filter(Boolean)
    .join(', ');
  
  if (prompts) {
    openImageGenPanel(api);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('meowthink:setImageGenPrompt', { 
        detail: { prompt: prompts } 
      }));
    }, 100);
  }
};

// 扩展模块
const extensionModule: IExtensionModule = {
  activate: async (_context: IExtensionContext, api: IExtensionAPI) => {
    const locale = api.i18n.getLocale();
    
    // 注册命令
    api.ui.registerCommand({
      id: 'meowthink.ai-image-gen.openImageGen',
      title: locale === 'zh' ? '打开AI生图' : 'Open AI Image Gen',
      icon: 'sparkles',
      handler: () => toggleImageGenPanel(api),
    });
    
    api.ui.registerCommand({
      id: 'meowthink.ai-image-gen.generateFromSelection',
      title: locale === 'zh' ? '从选中内容生成' : 'Generate from Selection',
      icon: 'wand-2',
      handler: () => generateFromSelection(api),
    });
    
    // 注册工具栏按钮
    api.ui.registerToolbarButton({
      id: 'aiImageGenBtn',
      title: locale === 'zh' ? 'AI生图' : 'AI Image Gen',
      icon: 'sparkles',
      command: 'meowthink.ai-image-gen.openImageGen',
      order: 25,
    });
    
    console.log('[AIImageGen] Extension activated');
  },
  
  deactivate: async () => {
    panelVisible = false;
    console.log('[AIImageGen] Extension deactivated');
  },
};

export default extensionModule;
