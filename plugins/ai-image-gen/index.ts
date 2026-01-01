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

// 注册到角色工坊的 PluginBridge
const registerToCharacterWorkshop = () => {
  const bridge = (window as unknown as Record<string, unknown>).__AI_CHARACTER_WORKSHOP_BRIDGE__ as {
    registerAIImageGenAPI?: (api: {
      generateImage: (prompt: string, options?: { style?: string; model?: string }) => Promise<{ url: string } | null>;
      getModels: () => Promise<{ id: string; name: string }[]>;
    }) => void;
  } | undefined;
  
  if (bridge?.registerAIImageGenAPI) {
    bridge.registerAIImageGenAPI({
      generateImage: async (prompt: string, options?: { style?: string; model?: string }) => {
        // 通过事件触发生成，并等待结果
        return new Promise((resolve) => {
          const handler = (e: CustomEvent<{ url: string }>) => {
            window.removeEventListener('meowthink:imageGenResult', handler as EventListener);
            resolve({ url: e.detail.url });
          };
          window.addEventListener('meowthink:imageGenResult', handler as EventListener);
          
          // 触发生成
          window.dispatchEvent(new CustomEvent('meowthink:generateImage', {
            detail: { prompt, style: options?.style, model: options?.model }
          }));
          
          // 超时处理
          setTimeout(() => {
            window.removeEventListener('meowthink:imageGenResult', handler as EventListener);
            resolve(null);
          }, 60000);
        });
      },
      getModels: async () => {
        // 从存储中读取用户配置的模型列表
        try {
          const stored = localStorage.getItem('ai_image_gen_models');
          if (stored) {
            const models = JSON.parse(stored) as Array<{ id: string; name: string; provider: string; model: string }>;
            return models.map(m => ({ id: m.id, name: m.name || m.model }));
          }
        } catch (e) {
          console.warn('[AIImageGen] Failed to load models from storage:', e);
        }
        // 返回默认模型列表
        return [
          { id: 'flux-schnell', name: 'FLUX.1 Schnell' },
          { id: 'sd-xl', name: 'Stable Diffusion XL' },
          { id: 'dalle-3', name: 'DALL-E 3' },
        ];
      },
    });
    console.log('[AIImageGen] Registered to Character Workshop');
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
    
    // 尝试注册到角色工坊
    registerToCharacterWorkshop();
    // 延迟再试一次（角色工坊可能后加载）
    setTimeout(registerToCharacterWorkshop, 1000);
    
    console.log('[AIImageGen] Extension activated');
  },
  
  deactivate: async () => {
    panelVisible = false;
    console.log('[AIImageGen] Extension deactivated');
  },
};

export default extensionModule;
