/**
 * Character Fusion Plugin - Type Definitions
 * 角色融合插件类型定义
 */

// ============================================================================
// 风格分类
// ============================================================================

/** 风格分类类型 */
export type StyleCategory = 'fantasy' | 'cyberpunk' | 'urban' | 'horror';

/** 风格分类信息 */
export interface StyleCategoryInfo {
  zh: string;
  en: string;
  description: string;
  icon: string;
}

/** 风格分类配置 */
export const STYLE_CATEGORIES: Record<StyleCategory, StyleCategoryInfo> = {
  fantasy: {
    zh: '西幻类',
    en: 'Fantasy',
    description: '魔法、中世纪、奇幻风格',
    icon: '🏰',
  },
  cyberpunk: {
    zh: '机能类',
    en: 'Cyberpunk/Sci-Fi',
    description: '科幻、机械、赛博朋克风格',
    icon: '🤖',
  },
  urban: {
    zh: '潮酷类',
    en: 'Urban/Trendy',
    description: '现代、街头、时尚风格',
    icon: '🎨',
  },
  horror: {
    zh: '怪谈类',
    en: 'Horror/Occult',
    description: '恐怖、灵异、克苏鲁风格',
    icon: '👻',
  },
};

// ============================================================================
// 角色模板
// ============================================================================

/** 多语言名称 */
export interface I18nName {
  zh?: string;
  en?: string;
  [key: string]: string | undefined;
}

/** 角色模板接口 */
export interface CharacterTemplate {
  /** 唯一标识符 */
  id: string;
  
  /** 多语言名称 */
  name: I18nName;
  
  /** 风格分类 */
  category: StyleCategory;
  
  // ============================================
  // 核心文案特征字段（用于 AI 融合）
  // ============================================
  
  /** 背景设定文案 */
  lore?: string;
  
  /** 介质/本质 - 角色的核心概念 */
  medium?: string;
  
  /** 美学风格 - 角色的感官特征描述 */
  aesthetic?: string;
  
  /** 灵感来源 - 角色设计的灵感元素 */
  inspiration?: string;
  
  /** 角色语录 - 代表性台词 */
  quote?: string;
  
  /** 定位标签 */
  positioning?: string[];
  
  // ============================================
  // 扩展字段
  // ============================================
  
  /** 稀有度 (1-6) */
  rarity?: number;
  
  /** 元素/属性 */
  element?: string;
  
  /** 职业/定位 */
  role?: string;
  
  /** 搜索标签 */
  tags?: string[];
  
  /** 头像 URL 或 Base64 */
  avatar?: string;
  
  /** 自定义扩展字段 */
  customFields?: Record<string, unknown>;
  
  // ============================================
  // 元数据
  // ============================================
  
  /** 创建时间 */
  createdAt?: number;
  
  /** 更新时间 */
  updatedAt?: number;
  
  /** 是否为 AI 生成 */
  isGenerated?: boolean;
  
  /** 源角色 ID 列表（融合来源） */
  sourceCharacters?: string[];
  
  /** 数据包来源 */
  packId?: string;
}

// ============================================================================
// 数据包
// ============================================================================

/** 数据包接口 */
export interface DataPack {
  /** 数据包 ID */
  id: string;
  
  /** 数据包名称 */
  name: I18nName;
  
  /** 版本号 */
  version: string;
  
  /** 作者 */
  author?: string;
  
  /** 描述 */
  description?: I18nName;
  
  /** 来源（如 "逆转1999", "明日方舟"） */
  source?: string;
  
  /** 角色列表 */
  characters: CharacterTemplate[];
  
  /** 创建时间 */
  createdAt: number;
  
  /** 更新时间 */
  updatedAt: number;
  
  /** 是否为内置数据包 */
  isBuiltIn?: boolean;
}

// ============================================================================
// 融合配置
// ============================================================================

/** 融合模式 */
export type FusionMode = 'balanced' | 'dominant' | 'concept' | 'style';

/** 融合模式信息 */
export interface FusionModeInfo {
  zh: string;
  en: string;
  description: string;
}

/** 融合模式配置 */
export const FUSION_MODES: Record<FusionMode, FusionModeInfo> = {
  balanced: {
    zh: '均衡融合',
    en: 'Balanced',
    description: '平等融合所有角色的特征，创造一个综合体',
  },
  dominant: {
    zh: '主导融合',
    en: 'Dominant',
    description: '以一个角色为主体，融入其他角色的部分特征',
  },
  concept: {
    zh: '概念融合',
    en: 'Concept',
    description: '重点融合角色的介质/本质和灵感来源，创造新概念',
  },
  style: {
    zh: '风格融合',
    en: 'Style',
    description: '重点融合美学风格和语录风格，保持独特的文学调性',
  },
};

/** 融合配置接口 */
export interface FusionConfig {
  /** 融合模式 */
  mode: FusionMode;
  
  /** 主导角色 ID（仅 dominant 模式） */
  dominantCharacterId?: string;
  
  /** 角色权重 */
  weights?: Record<string, number>;
  
  /** 输出语言 */
  outputLanguage: 'zh' | 'en';
  
  /** 是否生成图片 */
  generateImage: boolean;
  
  /** 保留的元素 */
  preserveElements?: ('lore' | 'medium' | 'aesthetic' | 'inspiration' | 'quote')[];
}

/** 融合结果接口 */
export interface FusionResult {
  /** 生成的角色 */
  character: CharacterTemplate;
  
  /** 使用的提示词 */
  prompt: string;
  
  /** 生成的图片 URL */
  imageUrl?: string;
  
  /** 置信度 (0-1) */
  confidence: number;
  
  /** AI 建议 */
  suggestions: string[];
  
  /** 源角色 */
  sourceCharacters: CharacterTemplate[];
}

// ============================================================================
// 变体生成
// ============================================================================

/** 变体类型 */
export type VariantType = 
  | 'age_child'
  | 'age_elder'
  | 'gender_swap'
  | 'role_change'
  | 'element_change'
  | 'outfit_change'
  | 'emotion_variant'
  | 'villain_version'
  | 'custom';

/** 变体配置 */
export interface VariantConfig {
  /** 变体类型 */
  type: VariantType;
  
  /** 自定义参数 */
  params?: {
    newRole?: string;
    newElement?: string;
    outfitTheme?: string;
    emotion?: string;
    customPrompt?: string;
  };
  
  /** 输出语言 */
  outputLanguage: 'zh' | 'en';
  
  /** 是否生成图片 */
  generateImage: boolean;
}

/** 变体结果 */
export interface VariantResult {
  /** 生成的变体角色 */
  character: CharacterTemplate;
  
  /** 原角色 */
  sourceCharacter: CharacterTemplate;
  
  /** 变体类型 */
  variantType: VariantType;
  
  /** 使用的提示词 */
  prompt: string;
}

// ============================================================================
// 标签映射
// ============================================================================

/** 节点子类型（来自主应用） */
export type NodeSubtype = 'FACTION' | 'WEAPON' | 'OUTFIT' | 'PSYCH' | 'TRAIT' | 'DATA' | 'EYES' | 'HAIR' | 'EAR';

/** 标签映射配置 */
export interface TagMappingConfig {
  /** 风格分类 */
  category: StyleCategory;
  
  /** 属性到节点类型的映射 */
  mappings: Record<string, NodeSubtype>;
}

// ============================================================================
// 存储结构
// ============================================================================

/** 数据包存储结构 */
export interface DataPacksStorage {
  /** 用户数据包列表 */
  packs: DataPack[];
  
  /** 最后更新时间 */
  lastUpdated: number;
}

/** 生成角色存储结构 */
export interface GeneratedStorage {
  /** 生成的角色列表 */
  characters: CharacterTemplate[];
  
  /** 最大数量 */
  maxCount: number;
}

/** 设置存储结构 */
export interface SettingsStorage {
  /** AI 服务商 */
  aiProvider: 'shared' | 'gemini' | 'siliconflow';
  
  /** 独立 API Key */
  dedicatedApiKey?: string;
  
  /** 默认融合模式 */
  defaultFusionMode: FusionMode;
  
  /** 默认语言 */
  defaultLanguage: 'zh' | 'en';
  
  /** 自动保存生成结果 */
  autoSaveGenerated: boolean;
  
  /** 显示教程 */
  showTutorial: boolean;
}

// ============================================================================
// 错误类型
// ============================================================================

/** 融合错误码 */
export enum FusionErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  AI_API_ERROR = 'AI_API_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/** 融合错误 */
export interface FusionError {
  code: FusionErrorCode;
  message: string;
  details?: unknown;
  suggestion?: string;
}

// ============================================================================
// 导出格式
// ============================================================================

/** 导出格式 */
export type ExportFormat = 'json' | 'markdown' | 'node' | 'nodeGroup';

/** 导出选项 */
export interface ExportOptions {
  /** 导出格式 */
  format: ExportFormat;
  
  /** 是否包含头像 */
  includeAvatar: boolean;
  
  /** 是否使用标签映射 */
  useTagMapping: boolean;
  
  /** 语言 */
  language: 'zh' | 'en';
}
