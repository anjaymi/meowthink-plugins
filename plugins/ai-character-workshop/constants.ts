/**
 * AI 角色工坊 - 常量定义
 */

import type { ModuleConfig, WorkshopModule, WizardStepConfig, WizardStep } from './types';

// ==================== 向导步骤配置 ====================
export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 'style',
    name: { zh: '选择风格', en: 'Style' },
    icon: '🎨',
    description: { zh: '选择角色的世界观和风格', en: 'Choose character style and genre' },
  },
  {
    id: 'naming',
    name: { zh: '角色命名', en: 'Naming' },
    icon: '🏷️',
    description: { zh: '为角色生成合适的名字', en: 'Generate character name' },
  },
  {
    id: 'tags',
    name: { zh: '属性标签', en: 'Tags' },
    icon: '🏷️',
    description: { zh: '选择角色的属性和标签', en: 'Select character attributes' },
  },
  {
    id: 'appearance',
    name: { zh: '外观设计', en: 'Appearance' },
    icon: '👤',
    description: { zh: '设计角色的外观', en: 'Design character appearance' },
  },
  {
    id: 'personality',
    name: { zh: '性格设定', en: 'Personality' },
    icon: '💭',
    description: { zh: '设定角色的性格特点', en: 'Define character personality' },
  },
  {
    id: 'backstory',
    name: { zh: '背景故事', en: 'Backstory' },
    icon: '📖',
    description: { zh: '生成角色的背景故事', en: 'Generate character backstory' },
  },
  {
    id: 'agent',
    name: { zh: '角色智能体', en: 'Agent' },
    icon: '🤖',
    description: { zh: '创建可对话的角色AI', en: 'Create character AI agent' },
  },
  {
    id: 'complete',
    name: { zh: '完成', en: 'Complete' },
    icon: '✅',
    description: { zh: '角色创建完成', en: 'Character creation complete' },
  },
];

// ==================== 风格预设 ====================
export const STYLE_PRESETS = [
  {
    id: 'fantasy',
    name: { zh: '奇幻', en: 'Fantasy' },
    icon: '🧙',
    subStyles: [
      { id: 'high-fantasy', name: { zh: '高魔奇幻', en: 'High Fantasy' } },
      { id: 'dark-fantasy', name: { zh: '黑暗奇幻', en: 'Dark Fantasy' } },
      { id: 'urban-fantasy', name: { zh: '都市奇幻', en: 'Urban Fantasy' } },
    ],
  },
  {
    id: 'scifi',
    name: { zh: '科幻', en: 'Sci-Fi' },
    icon: '🚀',
    subStyles: [
      { id: 'cyberpunk', name: { zh: '赛博朋克', en: 'Cyberpunk' } },
      { id: 'space-opera', name: { zh: '太空歌剧', en: 'Space Opera' } },
      { id: 'post-apocalyptic', name: { zh: '末日废土', en: 'Post-Apocalyptic' } },
    ],
  },
  {
    id: 'modern',
    name: { zh: '现代', en: 'Modern' },
    icon: '🏙️',
    subStyles: [
      { id: 'slice-of-life', name: { zh: '日常', en: 'Slice of Life' } },
      { id: 'action', name: { zh: '动作', en: 'Action' } },
      { id: 'mystery', name: { zh: '悬疑', en: 'Mystery' } },
    ],
  },
  {
    id: 'techwear',
    name: { zh: '机能风', en: 'Techwear' },
    icon: '🎽',
    subStyles: [
      { id: 'urban-techwear', name: { zh: '都市机能', en: 'Urban Techwear' } },
      { id: 'military-techwear', name: { zh: '军事机能', en: 'Military Techwear' } },
      { id: 'ninja-techwear', name: { zh: '忍者机能', en: 'Ninja Techwear' } },
    ],
  },
  {
    id: 'historical',
    name: { zh: '历史', en: 'Historical' },
    icon: '🏛️',
    subStyles: [
      { id: 'ancient', name: { zh: '古代', en: 'Ancient' } },
      { id: 'medieval', name: { zh: '中世纪', en: 'Medieval' } },
      { id: 'victorian', name: { zh: '维多利亚', en: 'Victorian' } },
    ],
  },
  {
    id: 'custom',
    name: { zh: '自定义', en: 'Custom' },
    icon: '✨',
    subStyles: [],
  },
];

// ==================== 模块配置 ====================

// 模块配置
export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'dialogue',
    name: { zh: '对话生成', en: 'Dialogue' },
    icon: '💬',
    description: { zh: '基于角色性格生成对话', en: 'Generate dialogues based on character personality' },
  },
  {
    id: 'variant',
    name: { zh: '变体生成', en: 'Variants' },
    icon: '🔄',
    description: { zh: '生成角色的不同版本', en: 'Generate character variants' },
  },
  {
    id: 'worldbuilding',
    name: { zh: '世界观', en: 'World' },
    icon: '🌍',
    description: { zh: '扩展世界观设定', en: 'Expand worldbuilding' },
  },
  {
    id: 'naming',
    name: { zh: '名字生成', en: 'Names' },
    icon: '🏷️',
    description: { zh: '生成角色名字', en: 'Generate character names' },
  },
  {
    id: 'backstory',
    name: { zh: '背景故事', en: 'Backstory' },
    icon: '📖',
    description: { zh: '生成角色背景故事', en: 'Generate character backstory' },
  },
];

// 对话风格选项
export const DIALOGUE_STYLES = [
  { value: 'casual', label: { zh: '日常', en: 'Casual' } },
  { value: 'formal', label: { zh: '正式', en: 'Formal' } },
  { value: 'emotional', label: { zh: '情感', en: 'Emotional' } },
  { value: 'humorous', label: { zh: '幽默', en: 'Humorous' } },
];

// 变体类型选项
export const VARIANT_TYPES = [
  { value: 'costume', label: { zh: '服装变体', en: 'Costume' } },
  { value: 'age', label: { zh: '年龄变体', en: 'Age' } },
  { value: 'timeline', label: { zh: 'IF线', en: 'Timeline' } },
  { value: 'style', label: { zh: '风格变体', en: 'Style' } },
  { value: 'custom', label: { zh: '自定义', en: 'Custom' } },
];

// 世界观方面选项
export const WORLDBUILDING_ASPECTS = [
  { value: 'faction', label: { zh: '势力/组织', en: 'Faction' } },
  { value: 'location', label: { zh: '地点', en: 'Location' } },
  { value: 'history', label: { zh: '历史', en: 'History' } },
  { value: 'culture', label: { zh: '文化', en: 'Culture' } },
  { value: 'relationship', label: { zh: '人物关系', en: 'Relationships' } },
];

// 名字文化选项
export const NAMING_CULTURES = [
  { value: 'chinese', label: { zh: '中文', en: 'Chinese' } },
  { value: 'japanese', label: { zh: '日文', en: 'Japanese' } },
  { value: 'western', label: { zh: '西方', en: 'Western' } },
  { value: 'fantasy', label: { zh: '奇幻', en: 'Fantasy' } },
  { value: 'scifi', label: { zh: '科幻', en: 'Sci-Fi' } },
  { value: 'custom', label: { zh: '自定义', en: 'Custom' } },
];

// 背景故事焦点选项
export const BACKSTORY_FOCUSES = [
  { value: 'origin', label: { zh: '出身', en: 'Origin' } },
  { value: 'motivation', label: { zh: '动机', en: 'Motivation' } },
  { value: 'secret', label: { zh: '秘密', en: 'Secret' } },
  { value: 'trauma', label: { zh: '创伤', en: 'Trauma' } },
  { value: 'achievement', label: { zh: '成就', en: 'Achievement' } },
  { value: 'full', label: { zh: '完整故事', en: 'Full Story' } },
];

// 背景故事语调选项
export const BACKSTORY_TONES = [
  { value: 'tragic', label: { zh: '悲剧', en: 'Tragic' } },
  { value: 'heroic', label: { zh: '英雄', en: 'Heroic' } },
  { value: 'mysterious', label: { zh: '神秘', en: 'Mysterious' } },
  { value: 'comedic', label: { zh: '喜剧', en: 'Comedic' } },
  { value: 'neutral', label: { zh: '中性', en: 'Neutral' } },
];

// 默认状态
export const DEFAULT_MODULE: WorkshopModule = 'dialogue';
export const DEFAULT_WIZARD_STEP: WizardStep = 'style';

// ==================== 标签预设（按风格分类） ====================
export const TAG_PRESETS: Record<string, { category: string; tags: { value: string; label: { zh: string; en: string } }[] }[]> = {
  fantasy: [
    {
      category: '种族',
      tags: [
        { value: 'human', label: { zh: '人类', en: 'Human' } },
        { value: 'elf', label: { zh: '精灵', en: 'Elf' } },
        { value: 'dwarf', label: { zh: '矮人', en: 'Dwarf' } },
        { value: 'dragon', label: { zh: '龙族', en: 'Dragon' } },
      ],
    },
    {
      category: '职业',
      tags: [
        { value: 'warrior', label: { zh: '战士', en: 'Warrior' } },
        { value: 'mage', label: { zh: '法师', en: 'Mage' } },
        { value: 'rogue', label: { zh: '盗贼', en: 'Rogue' } },
        { value: 'healer', label: { zh: '治疗师', en: 'Healer' } },
      ],
    },
  ],
  scifi: [
    {
      category: '身份',
      tags: [
        { value: 'cyborg', label: { zh: '改造人', en: 'Cyborg' } },
        { value: 'android', label: { zh: '仿生人', en: 'Android' } },
        { value: 'hacker', label: { zh: '黑客', en: 'Hacker' } },
        { value: 'pilot', label: { zh: '飞行员', en: 'Pilot' } },
      ],
    },
  ],
  techwear: [
    {
      category: '风格',
      tags: [
        { value: 'tactical', label: { zh: '战术风', en: 'Tactical' } },
        { value: 'streetwear', label: { zh: '街头风', en: 'Streetwear' } },
        { value: 'minimalist', label: { zh: '极简风', en: 'Minimalist' } },
      ],
    },
  ],
};

// ==================== 性格特质预设 ====================
export const PERSONALITY_TRAITS = [
  { value: 'brave', label: { zh: '勇敢', en: 'Brave' } },
  { value: 'cautious', label: { zh: '谨慎', en: 'Cautious' } },
  { value: 'cheerful', label: { zh: '开朗', en: 'Cheerful' } },
  { value: 'mysterious', label: { zh: '神秘', en: 'Mysterious' } },
  { value: 'cold', label: { zh: '冷漠', en: 'Cold' } },
  { value: 'passionate', label: { zh: '热情', en: 'Passionate' } },
  { value: 'intelligent', label: { zh: '聪明', en: 'Intelligent' } },
  { value: 'naive', label: { zh: '天真', en: 'Naive' } },
  { value: 'cunning', label: { zh: '狡猾', en: 'Cunning' } },
  { value: 'loyal', label: { zh: '忠诚', en: 'Loyal' } },
];
