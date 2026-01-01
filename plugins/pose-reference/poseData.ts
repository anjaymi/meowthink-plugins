/**
 * 姿势参考数据
 * 包含各类姿势的分类和标签信息
 */

import { PoseCategory, PoseData } from './index';

// 姿势分类定义
export const POSE_CATEGORIES: { id: PoseCategory; name: { en: string; zh: string }; icon: string }[] = [
  { id: 'all', name: { en: 'All Poses', zh: '全部' }, icon: 'grid' },
  { id: 'standing', name: { en: 'Standing', zh: '站姿' }, icon: 'person-standing' },
  { id: 'sitting', name: { en: 'Sitting', zh: '坐姿' }, icon: 'armchair' },
  { id: 'action', name: { en: 'Action', zh: '动态' }, icon: 'zap' },
  { id: 'lying', name: { en: 'Lying', zh: '躺卧' }, icon: 'bed' },
  { id: 'gesture', name: { en: 'Gestures', zh: '手势' }, icon: 'hand' },
];

// 姿势标签
export const POSE_TAGS = {
  viewAngle: ['正面', '侧面', '背面', '3/4视角', '俯视', '仰视'],
  mood: ['放松', '紧张', '优雅', '力量', '动感', '静态'],
  bodyPart: ['全身', '半身', '特写', '手部', '腿部'],
  difficulty: ['简单', '中等', '困难'],
};

// 练习时间预设
export const PRACTICE_PRESETS = [
  { label: '30秒速写', value: 30 },
  { label: '1分钟', value: 60 },
  { label: '2分钟', value: 120 },
  { label: '5分钟', value: 300 },
];

// 在线姿势资源（免费/开放API）
export const ONLINE_SOURCES = [
  {
    id: 'quickposes',
    name: 'QuickPoses',
    url: 'https://quickposes.com',
    description: { en: 'Timed figure drawing practice', zh: '限时人体速写练习' },
    categories: ['figure', 'hands', 'faces', 'animals'],
  },
  {
    id: 'lineofaction',
    name: 'Line of Action',
    url: 'https://line-of-action.com',
    description: { en: 'Free pose reference for artists', zh: '艺术家免费姿势参考' },
    categories: ['figure', 'hands', 'faces', 'expressions'],
  },
  {
    id: 'sketchdaily',
    name: 'SketchDaily Reference',
    url: 'http://reference.sketchdaily.net',
    description: { en: 'Daily sketch references', zh: '每日速写参考' },
    categories: ['full-body', 'structure', 'animals'],
  },
  {
    id: 'posemaniacs',
    name: 'Posemaniacs',
    url: 'https://www.posemaniacs.com',
    description: { en: '3D pose references', zh: '3D姿势参考' },
    categories: ['3d-model', 'anatomy', 'muscle'],
  },
];

// 本地示例姿势（使用占位符，实际使用时替换为真实图片URL）
export const LOCAL_POSES: PoseData[] = [
  // 站姿 - Standing
  {
    id: 'stand-front-relaxed',
    url: '',
    thumbnail: '',
    category: 'standing',
    tags: ['正面', '放松', '全身', '简单'],
    source: 'local',
  },
  {
    id: 'stand-side-casual',
    url: '',
    thumbnail: '',
    category: 'standing',
    tags: ['侧面', '休闲', '全身', '简单'],
    source: 'local',
  },
  {
    id: 'stand-back-turn',
    url: '',
    thumbnail: '',
    category: 'standing',
    tags: ['背面', '回头', '全身', '中等'],
    source: 'local',
  },
  {
    id: 'stand-contrapposto',
    url: '',
    thumbnail: '',
    category: 'standing',
    tags: ['3/4视角', '对立式平衡', '优雅', '中等'],
    source: 'local',
  },
  {
    id: 'stand-arms-crossed',
    url: '',
    thumbnail: '',
    category: 'standing',
    tags: ['正面', '双臂交叉', '自信', '简单'],
    source: 'local',
  },
  
  // 坐姿 - Sitting
  {
    id: 'sit-chair-formal',
    url: '',
    thumbnail: '',
    category: 'sitting',
    tags: ['椅子', '正坐', '正式', '简单'],
    source: 'local',
  },
  {
    id: 'sit-floor-cross',
    url: '',
    thumbnail: '',
    category: 'sitting',
    tags: ['地面', '盘腿', '放松', '中等'],
    source: 'local',
  },
  {
    id: 'sit-lean-back',
    url: '',
    thumbnail: '',
    category: 'sitting',
    tags: ['椅子', '后仰', '休闲', '中等'],
    source: 'local',
  },
  {
    id: 'sit-knees-up',
    url: '',
    thumbnail: '',
    category: 'sitting',
    tags: ['地面', '抱膝', '思考', '中等'],
    source: 'local',
  },
  
  // 动态 - Action
  {
    id: 'action-run',
    url: '',
    thumbnail: '',
    category: 'action',
    tags: ['跑步', '运动', '动感', '困难'],
    source: 'local',
  },
  {
    id: 'action-jump',
    url: '',
    thumbnail: '',
    category: 'action',
    tags: ['跳跃', '腾空', '动感', '困难'],
    source: 'local',
  },
  {
    id: 'action-punch',
    url: '',
    thumbnail: '',
    category: 'action',
    tags: ['出拳', '格斗', '力量', '困难'],
    source: 'local',
  },
  {
    id: 'action-kick',
    url: '',
    thumbnail: '',
    category: 'action',
    tags: ['踢腿', '格斗', '力量', '困难'],
    source: 'local',
  },
  {
    id: 'action-dance',
    url: '',
    thumbnail: '',
    category: 'action',
    tags: ['舞蹈', '优雅', '动感', '中等'],
    source: 'local',
  },
  {
    id: 'action-throw',
    url: '',
    thumbnail: '',
    category: 'action',
    tags: ['投掷', '运动', '力量', '中等'],
    source: 'local',
  },
  
  // 躺卧 - Lying
  {
    id: 'lying-back-relaxed',
    url: '',
    thumbnail: '',
    category: 'lying',
    tags: ['仰卧', '放松', '全身', '简单'],
    source: 'local',
  },
  {
    id: 'lying-side-support',
    url: '',
    thumbnail: '',
    category: 'lying',
    tags: ['侧卧', '支撑', '优雅', '中等'],
    source: 'local',
  },
  {
    id: 'lying-prone',
    url: '',
    thumbnail: '',
    category: 'lying',
    tags: ['俯卧', '放松', '全身', '简单'],
    source: 'local',
  },
  {
    id: 'lying-recline',
    url: '',
    thumbnail: '',
    category: 'lying',
    tags: ['斜躺', '休闲', '半身', '中等'],
    source: 'local',
  },
  
  // 手势 - Gestures
  {
    id: 'gesture-fist',
    url: '',
    thumbnail: '',
    category: 'gesture',
    tags: ['握拳', '力量', '手部', '简单'],
    source: 'local',
  },
  {
    id: 'gesture-open',
    url: '',
    thumbnail: '',
    category: 'gesture',
    tags: ['张开', '表达', '手部', '简单'],
    source: 'local',
  },
  {
    id: 'gesture-point',
    url: '',
    thumbnail: '',
    category: 'gesture',
    tags: ['指向', '指示', '手部', '简单'],
    source: 'local',
  },
  {
    id: 'gesture-hold',
    url: '',
    thumbnail: '',
    category: 'gesture',
    tags: ['握持', '物品', '手部', '中等'],
    source: 'local',
  },
  {
    id: 'gesture-peace',
    url: '',
    thumbnail: '',
    category: 'gesture',
    tags: ['剪刀手', '可爱', '手部', '简单'],
    source: 'local',
  },
  {
    id: 'gesture-ok',
    url: '',
    thumbnail: '',
    category: 'gesture',
    tags: ['OK手势', '确认', '手部', '简单'],
    source: 'local',
  },
];

// 获取分类下的姿势
export const getPosesByCategory = (category: PoseCategory): PoseData[] => {
  if (category === 'all') return LOCAL_POSES;
  return LOCAL_POSES.filter(pose => pose.category === category);
};

// 按标签筛选姿势
export const getPosesByTags = (tags: string[]): PoseData[] => {
  if (tags.length === 0) return LOCAL_POSES;
  return LOCAL_POSES.filter(pose => 
    tags.some(tag => pose.tags.includes(tag))
  );
};

// 获取随机姿势
export const getRandomPoseFromCategory = (category: PoseCategory): PoseData => {
  const poses = getPosesByCategory(category);
  return poses[Math.floor(Math.random() * poses.length)];
};

// 获取收藏的姿势
export const getFavoritePoses = (favoriteIds: string[]): PoseData[] => {
  return LOCAL_POSES.filter(pose => favoriteIds.includes(pose.id));
};
