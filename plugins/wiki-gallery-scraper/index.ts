/**
 * Wiki Gallery Scraper Extension - Wiki立绘数据库
 * 从游戏Wiki提取角色立绘/画廊图片，支持数据库管理
 */

import { IExtensionContext, IExtensionAPI, IExtensionModule } from '../../../types/extension';

// 扩展状态
let panelVisible = false;

// 打开Wiki立绘数据库面板
const openWikiGalleryDatabasePanel = (api: IExtensionAPI) => {
  window.dispatchEvent(new CustomEvent('meowthink:openWikiGalleryDatabasePanel'));
  panelVisible = true;
  
  const locale = api.i18n.getLocale();
  api.ui.showNotification(
    locale === 'zh' ? 'Wiki立绘数据库已打开' : 'Wiki Gallery Database opened',
    'info'
  );
};

// 关闭面板
const closeWikiGalleryDatabasePanel = () => {
  window.dispatchEvent(new CustomEvent('meowthink:closeWikiGalleryDatabasePanel'));
  panelVisible = false;
};

// 切换面板
const toggleWikiGalleryDatabasePanel = (api: IExtensionAPI) => {
  if (panelVisible) {
    closeWikiGalleryDatabasePanel();
  } else {
    openWikiGalleryDatabasePanel(api);
  }
};

// 扩展模块
const extensionModule: IExtensionModule = {
  activate: async (_context: IExtensionContext, api: IExtensionAPI) => {
    const locale = api.i18n.getLocale();
    
    // 注册命令
    api.ui.registerCommand({
      id: 'meowthink.wiki-gallery-scraper.openWikiGalleryDatabase',
      title: locale === 'zh' ? '打开Wiki立绘数据库' : 'Open Wiki Gallery Database',
      icon: 'database',
      handler: () => toggleWikiGalleryDatabasePanel(api),
    });
    
    api.ui.registerCommand({
      id: 'meowthink.wiki-gallery-scraper.addSource',
      title: locale === 'zh' ? '添加数据源' : 'Add Data Source',
      icon: 'plus',
      handler: () => {
        openWikiGalleryDatabasePanel(api);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('meowthink:openAddSourceDialog'));
        }, 100);
      },
    });
    
    // 注册工具栏按钮
    api.ui.registerToolbarButton({
      id: 'wikiGalleryDatabaseBtn',
      title: locale === 'zh' ? 'Wiki立绘库' : 'Wiki Gallery DB',
      icon: 'database',
      command: 'meowthink.wiki-gallery-scraper.openWikiGalleryDatabase',
      order: 30,
    });
    
    console.log('[WikiGalleryDatabase] Extension activated');
  },
  
  deactivate: async () => {
    panelVisible = false;
    console.log('[WikiGalleryDatabase] Extension deactivated');
  },
};

export default extensionModule;
