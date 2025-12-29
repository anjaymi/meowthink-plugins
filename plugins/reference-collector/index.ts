/**
 * Reference Collector Extension - 参考素材采集器
 * 支持 ArtStation/Pinterest 搜索、配色提取、项目管理
 */

import { IExtensionContext, IExtensionAPI, IExtensionModule } from '../../../types/extension';
import { NodeData } from '../../../types/index';

// 扩展状态
let panelVisible = false;

// 打开参考素材面板
const openReferencePanel = (api: IExtensionAPI) => {
  // 触发自定义事件打开面板
  window.dispatchEvent(new CustomEvent('meowthink:openReferencePanel'));
  panelVisible = true;
  
  const locale = api.i18n.getLocale();
  api.ui.showNotification(
    locale === 'zh' ? '参考素材面板已打开' : 'Reference panel opened',
    'info'
  );
};

// 关闭参考素材面板
const closeReferencePanel = () => {
  window.dispatchEvent(new CustomEvent('meowthink:closeReferencePanel'));
  panelVisible = false;
};

// 切换面板显示
const toggleReferencePanel = (api: IExtensionAPI) => {
  if (panelVisible) {
    closeReferencePanel();
  } else {
    openReferencePanel(api);
  }
};

// 扩展模块
const extensionModule: IExtensionModule = {
  activate: async (_context: IExtensionContext, api: IExtensionAPI) => {
    
    // 注册命令
    api.ui.registerCommand({
      id: 'meowthink.reference-collector.openReferencePanel',
      title: api.i18n.getLocale() === 'zh' ? '打开参考素材' : 'Open Reference Collector',
      icon: 'image',
      handler: () => toggleReferencePanel(api),
    });
    
    api.ui.registerCommand({
      id: 'meowthink.reference-collector.searchReferences',
      title: api.i18n.getLocale() === 'zh' ? '搜索参考图' : 'Search References',
      icon: 'search',
      handler: () => {
        openReferencePanel(api);
        // 聚焦搜索框
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('meowthink:focusReferenceSearch'));
        }, 100);
      },
    });
    
    api.ui.registerCommand({
      id: 'meowthink.reference-collector.extractColors',
      title: api.i18n.getLocale() === 'zh' ? '提取配色方案' : 'Extract Color Palette',
      icon: 'palette',
      handler: () => {
        // 从选中的图片节点提取颜色
        const selected = api.nodes.getSelected();
        const imageNode = selected.find((n: NodeData) => n.type === 'image' && n.img);
        
        if (imageNode && imageNode.img) {
          window.dispatchEvent(new CustomEvent('meowthink:extractColorsFromNode', {
            detail: { nodeId: imageNode.id, imageUrl: imageNode.img }
          }));
        } else {
          api.ui.showNotification(
            api.i18n.getLocale() === 'zh' ? '请先选中一个图片节点' : 'Please select an image node first',
            'warning'
          );
        }
      },
    });
    
    // 注册工具栏按钮
    api.ui.registerToolbarButton({
      id: 'referenceCollectorBtn',
      title: api.i18n.getLocale() === 'zh' ? '参考素材' : 'References',
      icon: 'image',
      command: 'meowthink.reference-collector.openReferencePanel',
      order: 25,
    });
    
    console.log('[ReferenceCollector] Extension activated');
  },
  
  deactivate: async () => {
    panelVisible = false;
    console.log('[ReferenceCollector] Extension deactivated');
  },
};

export default extensionModule;
