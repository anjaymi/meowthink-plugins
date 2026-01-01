/**
 * Pose Reference Library Extension - 姿势参考库
 * 提供姿势参考图浏览、分类筛选、限时练习功能
 */

import { IExtensionContext, IExtensionAPI, IExtensionModule } from '../../../types/extension';

// 姿势分类
export type PoseCategory = 'all' | 'standing' | 'sitting' | 'action' | 'lying' | 'gesture';

// 姿势数据接口
export interface PoseData {
  id: string;
  url: string;
  thumbnail: string;
  category: PoseCategory;
  tags: string[];
  source: string;
  isFavorite?: boolean;
}

// 练习模式状态
interface PracticeState {
  isActive: boolean;
  timeRemaining: number;
  currentPose: PoseData | null;
  completedCount: number;
}

// 扩展状态
let panelVisible = false;
let practiceState: PracticeState = {
  isActive: false,
  timeRemaining: 0,
  currentPose: null,
  completedCount: 0,
};
let practiceTimer: ReturnType<typeof setInterval> | null = null;

// API 基础 URL
const API_BASE = 'http://localhost:23333/api';

// 从后端获取姿势列表
const fetchPoses = async (category: PoseCategory = 'all', limit: number = 20): Promise<PoseData[]> => {
  try {
    const response = await fetch(`${API_BASE}/pose/list?category=${category}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return data.poses || [];
    }
  } catch (error) {
    console.error('[PoseReference] Failed to fetch poses:', error);
  }
  return [];
};

// 从后端获取随机姿势
const fetchRandomPose = async (category: PoseCategory = 'all'): Promise<PoseData | null> => {
  try {
    const response = await fetch(`${API_BASE}/pose/random?category=${category}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('[PoseReference] Failed to fetch random pose:', error);
  }
  return null;
};

// 打开姿势参考面板
const openPosePanel = (api: IExtensionAPI) => {
  window.dispatchEvent(new CustomEvent('meowthink:openPosePanel'));
  panelVisible = true;
  
  const locale = api.i18n.getLocale();
  api.ui.showNotification(
    locale === 'zh' ? '姿势参考面板已打开' : 'Pose reference panel opened',
    'info'
  );
};

// 关闭面板
const closePosePanel = () => {
  window.dispatchEvent(new CustomEvent('meowthink:closePosePanel'));
  panelVisible = false;
};

// 切换面板
const togglePosePanel = (api: IExtensionAPI) => {
  if (panelVisible) {
    closePosePanel();
  } else {
    openPosePanel(api);
  }
};

// 获取随机姿势（从后端 API）
const getRandomPose = async (category: PoseCategory = 'all'): Promise<PoseData | null> => {
  return await fetchRandomPose(category);
};

// 添加姿势到画布
const addPoseToCanvas = (api: IExtensionAPI, pose: PoseData) => {
  if (!pose.url) {
    api.ui.showNotification(
      api.i18n.getLocale() === 'zh' ? '该姿势暂无图片' : 'No image available for this pose',
      'warning'
    );
    return;
  }
  
  // 获取画布中心位置
  const centerX = 400;
  const centerY = 300;
  
  // 创建图片节点
  api.nodes.create({
    type: 'image',
    x: centerX - 100,
    y: centerY - 150,
    w: 200,
    h: 300,
    img: pose.url,
    text: `Pose: ${pose.tags.join(', ')}`,
    subtype: 'REFERENCE',
    locked: true,
  });
  
  api.ui.showNotification(
    api.i18n.getLocale() === 'zh' ? '姿势已添加到画布' : 'Pose added to canvas',
    'success'
  );
};

// 开始限时练习
const startPractice = async (api: IExtensionAPI) => {
  const settings = api.storage.get('settings') || {};
  const practiceTime = settings.practiceTime || 60;
  const category = settings.defaultCategory || 'all';
  
  // 停止现有计时器
  if (practiceTimer) {
    clearInterval(practiceTimer);
  }
  
  // 获取随机姿势（从后端 API）
  const pose = await getRandomPose(category as PoseCategory);
  
  if (!pose) {
    api.ui.showNotification(
      api.i18n.getLocale() === 'zh' ? '获取姿势失败，请检查网络' : 'Failed to fetch pose, check network',
      'error'
    );
    return;
  }
  
  practiceState = {
    isActive: true,
    timeRemaining: practiceTime,
    currentPose: pose,
    completedCount: practiceState.completedCount,
  };
  
  // 发送练习开始事件
  window.dispatchEvent(new CustomEvent('meowthink:practiceStart', {
    detail: { pose, timeRemaining: practiceTime }
  }));
  
  // 开始倒计时
  practiceTimer = setInterval(async () => {
    practiceState.timeRemaining--;
    
    window.dispatchEvent(new CustomEvent('meowthink:practiceUpdate', {
      detail: { timeRemaining: practiceState.timeRemaining }
    }));
    
    if (practiceState.timeRemaining <= 0) {
      // 时间到，自动切换下一个姿势
      practiceState.completedCount++;
      const nextPose = await getRandomPose(category as PoseCategory);
      
      if (nextPose) {
        practiceState.currentPose = nextPose;
        practiceState.timeRemaining = practiceTime;
        
        window.dispatchEvent(new CustomEvent('meowthink:practiceNext', {
          detail: { pose: nextPose, completedCount: practiceState.completedCount }
        }));
      }
      
      // 播放提示音（如果支持）
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAA');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    }
  }, 1000);
  
  const locale = api.i18n.getLocale();
  api.ui.showNotification(
    locale === 'zh' ? `限时练习开始！${practiceTime}秒` : `Practice started! ${practiceTime}s`,
    'info'
  );
};

// 停止练习
const stopPractice = (api: IExtensionAPI) => {
  if (practiceTimer) {
    clearInterval(practiceTimer);
    practiceTimer = null;
  }
  
  const completed = practiceState.completedCount;
  practiceState = {
    isActive: false,
    timeRemaining: 0,
    currentPose: null,
    completedCount: 0,
  };
  
  window.dispatchEvent(new CustomEvent('meowthink:practiceStop', {
    detail: { completedCount: completed }
  }));
  
  const locale = api.i18n.getLocale();
  api.ui.showNotification(
    locale === 'zh' ? `练习结束！完成 ${completed} 个姿势` : `Practice ended! Completed ${completed} poses`,
    'success'
  );
};

// 切换收藏
const toggleFavorite = (api: IExtensionAPI, poseId: string) => {
  const favorites = api.storage.get('favorites') || [];
  const index = favorites.indexOf(poseId);
  
  if (index === -1) {
    favorites.push(poseId);
  } else {
    favorites.splice(index, 1);
  }
  
  api.storage.set('favorites', favorites);
  
  window.dispatchEvent(new CustomEvent('meowthink:favoritesUpdated', {
    detail: { favorites }
  }));
};

// 扩展模块
const extensionModule: IExtensionModule = {
  activate: async (_context: IExtensionContext, api: IExtensionAPI) => {
    const locale = api.i18n.getLocale();
    
    // 注册命令：打开面板
    api.ui.registerCommand({
      id: 'meowthink.pose-reference.openPosePanel',
      title: locale === 'zh' ? '打开姿势参考' : 'Open Pose Reference',
      icon: 'person-standing',
      handler: () => togglePosePanel(api),
    });
    
    // 注册命令：随机姿势
    api.ui.registerCommand({
      id: 'meowthink.pose-reference.randomPose',
      title: locale === 'zh' ? '随机姿势' : 'Random Pose',
      icon: 'shuffle',
      handler: async () => {
        const settings = api.storage.get('settings') || {};
        const category = settings.defaultCategory || 'all';
        const pose = await getRandomPose(category as PoseCategory);
        
        if (pose) {
          window.dispatchEvent(new CustomEvent('meowthink:showPose', {
            detail: { pose }
          }));
        } else {
          api.ui.showNotification(
            locale === 'zh' ? '获取姿势失败' : 'Failed to fetch pose',
            'error'
          );
        }
      },
    });
    
    // 注册命令：开始练习
    api.ui.registerCommand({
      id: 'meowthink.pose-reference.startPractice',
      title: locale === 'zh' ? '开始限时练习' : 'Start Timed Practice',
      icon: 'timer',
      handler: () => {
        if (practiceState.isActive) {
          stopPractice(api);
        } else {
          startPractice(api);
        }
      },
    });
    
    // 注册命令：添加到画布
    api.ui.registerCommand({
      id: 'meowthink.pose-reference.addToCanvas',
      title: locale === 'zh' ? '添加到画布' : 'Add to Canvas',
      icon: 'plus',
      handler: () => {
        if (practiceState.currentPose) {
          addPoseToCanvas(api, practiceState.currentPose);
        }
      },
    });
    
    // 注册工具栏按钮
    api.ui.registerToolbarButton({
      id: 'poseReferenceBtn',
      title: locale === 'zh' ? '姿势参考' : 'Pose Reference',
      icon: 'person-standing',
      command: 'meowthink.pose-reference.openPosePanel',
      order: 26,
    });
    
    // 监听添加姿势到画布的事件
    const handleAddPose = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.pose) {
        addPoseToCanvas(api, detail.pose);
      }
    };
    window.addEventListener('meowthink:addPoseToCanvas', handleAddPose);
    
    // 监听收藏切换事件
    const handleToggleFavorite = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.poseId) {
        toggleFavorite(api, detail.poseId);
      }
    };
    window.addEventListener('meowthink:togglePoseFavorite', handleToggleFavorite);
    
    console.log('[PoseReference] Extension activated');
    
    // 返回清理函数
    return () => {
      window.removeEventListener('meowthink:addPoseToCanvas', handleAddPose);
      window.removeEventListener('meowthink:togglePoseFavorite', handleToggleFavorite);
    };
  },
  
  deactivate: async () => {
    // 停止练习计时器
    if (practiceTimer) {
      clearInterval(practiceTimer);
      practiceTimer = null;
    }
    
    panelVisible = false;
    practiceState = {
      isActive: false,
      timeRemaining: 0,
      currentPose: null,
      completedCount: 0,
    };
    
    console.log('[PoseReference] Extension deactivated');
  },
};

export default extensionModule;

// 导出工具函数供面板组件使用
export { getRandomPose, fetchPoses, API_BASE };
export type { PracticeState };
