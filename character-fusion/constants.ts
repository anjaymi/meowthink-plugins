/**
 * Character Fusion Plugin - Constants
 * 角色融合插件常量定义
 */

import { FusionMode, SettingsStorage, NodeSubtype, StyleCategory } from './types';

// ============================================================================
// 存储键
// ============================================================================

export const STORAGE_KEYS = {
  /** 用户数据包 */
  DATA_PACKS: 'meowthink_ext_character-fusion_packs',
  
  /** 生成的角色 */
  GENERATED_CHARACTERS: 'meowthink_ext_character-fusion_generated',
  
  /** 设置 */
  SETTINGS: 'meowthink_ext_character-fusion_settings',
  
  /** 最近融合记录 */
  RECENT_FUSIONS: 'meowthink_ext_character-fusion_recent',
  
  /** 用户收藏 */
  USER_FAVORITES: 'meowthink_ext_character-fusion_favorites',
} as const;

// ============================================================================
// 默认值
// ============================================================================

/** 默认设置 */
export const DEFAULT_SETTINGS: SettingsStorage = {
  aiProvider: 'shared',
  defaultFusionMode: 'balanced',
  defaultLanguage: 'zh',
  autoSaveGenerated: true,
  showTutorial: true,
};

/** 最大生成角色数量 */
export const MAX_GENERATED_CHARACTERS = 100;

/** 最大用户数据包数量 */
export const MAX_USER_PACKS = 20;

/** 单个数据包最大大小 (10MB) */
export const MAX_PACK_SIZE = 10 * 1024 * 1024;

/** 总存储最大大小 (50MB) */
export const MAX_TOTAL_STORAGE = 50 * 1024 * 1024;

/** 最大融合角色数量 */
export const MAX_FUSION_CHARACTERS = 4;

/** 最小融合角色数量 */
export const MIN_FUSION_CHARACTERS = 2;

/** 最大历史记录数量 */
export const MAX_HISTORY_COUNT = 50;

// ============================================================================
// 标签映射
// ============================================================================

/** 默认标签映射 */
export const DEFAULT_TAG_MAPPING: Record<string, NodeSubtype> = {
  medium: 'TRAIT',
  aesthetic: 'OUTFIT',
  inspiration: 'DATA',
  positioning: 'FACTION',
  quote: 'PSYCH',
  lore: 'DATA',
  element: 'TRAIT',
  role: 'FACTION',
};

/** 风格特定标签映射 */
export const STYLE_TAG_MAPPINGS: Record<StyleCategory, Record<string, NodeSubtype>> = {
  fantasy: {
    ...DEFAULT_TAG_MAPPING,
    magic: 'WEAPON',
    spell: 'WEAPON',
    artifact: 'WEAPON',
  },
  cyberpunk: {
    ...DEFAULT_TAG_MAPPING,
    tech: 'WEAPON',
    augment: 'TRAIT',
    implant: 'TRAIT',
    hack: 'WEAPON',
  },
  urban: {
    ...DEFAULT_TAG_MAPPING,
    style: 'OUTFIT',
    vibe: 'PSYCH',
    brand: 'OUTFIT',
  },
  horror: {
    ...DEFAULT_TAG_MAPPING,
    curse: 'TRAIT',
    entity: 'DATA',
    ritual: 'WEAPON',
    madness: 'PSYCH',
  },
};

// ============================================================================
// AI 提示词模板
// ============================================================================

/** 融合提示词模板 */
export const FUSION_PROMPT_TEMPLATE = `你是一个角色文案设计专家，擅长创作游戏角色的设定文案。请根据以下角色的文案特征，创造一个融合了所有角色特点的新角色。

## 输入角色

{{characters}}

## 融合模式
{{fusionMode}}

## 要求
请生成一个新角色，保持原作的文学风格和艺术调性。输出 JSON 格式：
{
  "name": { "zh": "中文名（符合原作命名风格）" },
  "lore": "背景设定文案（200-300字，保持原作的叙事风格）",
  "medium": "介质/本质（一个核心概念词）",
  "aesthetic": "美学风格描述（香调/质感/氛围词组合）",
  "inspiration": "灵感来源（意象组合）",
  "quote": "角色语录（一句富有哲理或情感的台词）",
  "positioning": ["定位标签1", "定位标签2", "定位标签3"],
  "element": "元素属性",
  "role": "职业定位",
  "tags": ["特征标签1", "特征标签2", "特征标签3", "特征标签4", "特征标签5"]
}

注意：tags 是角色的核心特征标签，用于快速识别角色特点，请生成 5-8 个简短的标签词。

只输出 JSON，不要其他内容。`;

/** 融合模式描述 */
export const FUSION_MODE_DESCRIPTIONS: Record<FusionMode, string> = {
  balanced: '均衡融合：平等融合所有角色的特征，创造一个综合体',
  dominant: '主导融合：以 {{dominantName}} 为主体，融入其他角色的部分特征',
  concept: '概念融合：重点融合角色的介质/本质和灵感来源，创造新概念',
  style: '风格融合：重点融合美学风格和语录风格，保持独特的文学调性',
};

/** 变体提示词模板 */
export const VARIANT_PROMPTS: Record<string, string> = {
  age_child: '将角色改为儿童版本（8-12岁），保持核心特征但调整为更天真活泼的形象',
  age_elder: '将角色改为年长版本（60+岁），展现岁月沉淀后的智慧与沧桑',
  gender_swap: '将角色性别转换，保持核心性格和能力，调整外观和部分细节',
  role_change: '将角色职业/定位改变为 {{newRole}}，调整技能和背景以匹配新定位',
  element_change: '将角色元素属性改变为 {{newElement}}，调整外观和技能以体现新元素',
  outfit_change: '为角色设计新的服装/造型：{{outfitTheme}}',
  emotion_variant: '展现角色在 {{emotion}} 情绪状态下的形象',
  villain_version: '创造角色的反派/堕落版本，保持能力但扭曲性格和目标',
  custom: '{{customPrompt}}',
};

/** 变体生成提示词模板 */
export const VARIANT_PROMPT_TEMPLATE = `你是一个角色文案设计专家。请根据以下角色信息，生成一个变体版本。

## 原角色
名称: {{name}}
{{#if lore}}背景设定: {{lore}}{{/if}}
{{#if medium}}介质/本质: {{medium}}{{/if}}
{{#if aesthetic}}美学风格: {{aesthetic}}{{/if}}
{{#if inspiration}}灵感来源: {{inspiration}}{{/if}}
{{#if quote}}角色语录: {{quote}}{{/if}}
{{#if positioning}}定位: {{positioning}}{{/if}}

## 变体要求
{{variantDescription}}

## 输出格式
请输出 JSON 格式：
{
  "name": { "zh": "变体角色中文名" },
  "lore": "变体背景设定（200-300字）",
  "medium": "介质/本质",
  "aesthetic": "美学风格描述",
  "inspiration": "灵感来源",
  "quote": "角色语录",
  "positioning": ["定位标签1", "定位标签2", "定位标签3"],
  "element": "元素属性",
  "role": "职业定位"
}

只输出 JSON，不要其他内容。`;

// ============================================================================
// UI 常量
// ============================================================================

/** 角色卡片尺寸 */
export const CARD_SIZES = {
  small: { width: 120, height: 160 },
  medium: { width: 160, height: 200 },
  large: { width: 200, height: 260 },
} as const;

/** 稀有度颜色 */
export const RARITY_COLORS: Record<number, string> = {
  1: '#9ca3af', // 灰色
  2: '#22c55e', // 绿色
  3: '#3b82f6', // 蓝色
  4: '#a855f7', // 紫色
  5: '#f59e0b', // 金色
  6: '#ef4444', // 红色
};

/** 稀有度名称 */
export const RARITY_NAMES: Record<number, { zh: string; en: string }> = {
  1: { zh: '普通', en: 'Common' },
  2: { zh: '稀有', en: 'Rare' },
  3: { zh: '精良', en: 'Epic' },
  4: { zh: '史诗', en: 'Legendary' },
  5: { zh: '传说', en: 'Mythic' },
  6: { zh: '限定', en: 'Limited' },
};

// ============================================================================
// 验证规则
// ============================================================================

/** 角色名称最大长度 */
export const MAX_NAME_LENGTH = 50;

/** 背景设定最大长度 */
export const MAX_LORE_LENGTH = 2000;

/** 语录最大长度 */
export const MAX_QUOTE_LENGTH = 200;

/** 定位标签最大数量 */
export const MAX_POSITIONING_COUNT = 10;

/** 搜索标签最大数量 */
export const MAX_TAGS_COUNT = 20;
