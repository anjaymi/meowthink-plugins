/**
 * Character Fusion Plugin - Tag Mapping System
 * 标签映射系统 - 将角色属性映射到节点标签
 */

import { 
  CharacterTemplate, 
  NodeSubtype, 
  StyleCategory, 
  TagMappingConfig 
} from './types';
import { DEFAULT_TAG_MAPPING, STYLE_TAG_MAPPINGS } from './constants';

// ============================================================================
// 游戏特定映射配置
// ============================================================================

/** 逆转1999 标签映射 */
const REVERSE1999_MAPPING: Record<string, NodeSubtype> = {
  ...DEFAULT_TAG_MAPPING,
  // 逆转1999 特定字段
  afflatus: 'TRAIT',      // 心相
  damage_type: 'WEAPON',  // 伤害类型
  arcanist: 'FACTION',    // 神秘学家类型
};

/** 明日方舟 标签映射（预留） */
const ARKNIGHTS_MAPPING: Record<string, NodeSubtype> = {
  ...DEFAULT_TAG_MAPPING,
  // 明日方舟 特定字段
  profession: 'FACTION',  // 职业
  subProfession: 'FACTION', // 子职业
  trait: 'TRAIT',         // 特性
  talent: 'PSYCH',        // 天赋
  skill: 'WEAPON',        // 技能
};

/** 原神 标签映射（预留） */
const GENSHIN_MAPPING: Record<string, NodeSubtype> = {
  ...DEFAULT_TAG_MAPPING,
  // 原神 特定字段
  vision: 'TRAIT',        // 神之眼
  weapon_type: 'WEAPON',  // 武器类型
  region: 'FACTION',      // 地区
  constellation: 'DATA',  // 命之座
};

/** 游戏来源映射表 */
const SOURCE_MAPPINGS: Record<string, Record<string, NodeSubtype>> = {
  '逆转1999': REVERSE1999_MAPPING,
  'reverse1999': REVERSE1999_MAPPING,
  '明日方舟': ARKNIGHTS_MAPPING,
  'arknights': ARKNIGHTS_MAPPING,
  '原神': GENSHIN_MAPPING,
  'genshin': GENSHIN_MAPPING,
};

// ============================================================================
// 映射函数
// ============================================================================

/**
 * 获取指定来源的标签映射配置
 * @param source 数据来源（游戏名称）
 * @returns 标签映射配置
 */
export function getMapping(source?: string): Record<string, NodeSubtype> {
  if (!source) {
    return DEFAULT_TAG_MAPPING;
  }
  
  const normalizedSource = source.toLowerCase().trim();
  
  // 检查游戏特定映射
  for (const [key, mapping] of Object.entries(SOURCE_MAPPINGS)) {
    if (key.toLowerCase() === normalizedSource) {
      return mapping;
    }
  }
  
  return DEFAULT_TAG_MAPPING;
}

/**
 * 获取风格分类的标签映射
 * @param category 风格分类
 * @returns 标签映射配置
 */
export function getStyleMapping(category: StyleCategory): Record<string, NodeSubtype> {
  return STYLE_TAG_MAPPINGS[category] || DEFAULT_TAG_MAPPING;
}

/**
 * 将角色属性映射到节点子类型
 * @param attribute 属性名称
 * @param source 数据来源
 * @param category 风格分类
 * @returns 节点子类型
 */
export function mapAttributeToSubtype(
  attribute: string,
  source?: string,
  category?: StyleCategory
): NodeSubtype {
  // 优先使用来源特定映射
  if (source) {
    const sourceMapping = getMapping(source);
    if (sourceMapping[attribute]) {
      return sourceMapping[attribute];
    }
  }
  
  // 其次使用风格分类映射
  if (category) {
    const styleMapping = getStyleMapping(category);
    if (styleMapping[attribute]) {
      return styleMapping[attribute];
    }
  }
  
  // 最后使用默认映射
  if (DEFAULT_TAG_MAPPING[attribute]) {
    return DEFAULT_TAG_MAPPING[attribute];
  }
  
  // 默认返回 DATA
  return 'DATA';
}

/**
 * 创建标签映射配置
 * @param category 风格分类
 * @param source 数据来源
 * @returns 标签映射配置
 */
export function createTagMappingConfig(
  category: StyleCategory,
  source?: string
): TagMappingConfig {
  // 合并映射：默认 < 风格 < 来源
  const mappings: Record<string, NodeSubtype> = {
    ...DEFAULT_TAG_MAPPING,
    ...getStyleMapping(category),
    ...(source ? getMapping(source) : {}),
  };
  
  return {
    category,
    mappings,
  };
}

// ============================================================================
// 节点转换
// ============================================================================

/** 节点数据接口（简化版） */
interface NodeData {
  id: number;
  type: 'root' | 'normal';
  subtype?: NodeSubtype;
  x: number;
  y: number;
  text: string;
  img?: string;
  parentId?: number;
}

/**
 * 将角色转换为思维导图节点
 * @param character 角色模板
 * @param mapping 标签映射配置
 * @param options 转换选项
 * @returns 节点数据数组
 */
export function characterToNodes(
  character: CharacterTemplate,
  mapping?: TagMappingConfig,
  options: {
    includeAvatar?: boolean;
    language?: 'zh' | 'en';
    startX?: number;
    startY?: number;
  } = {}
): NodeData[] {
  const {
    includeAvatar = true,
    language = 'zh',
    startX = 0,
    startY = 0,
  } = options;
  
  const effectiveMapping = mapping || createTagMappingConfig(character.category);
  const nodes: NodeData[] = [];
  const baseId = Date.now();
  
  // 获取角色名称
  const characterName = language === 'zh' 
    ? (character.name.zh || character.name.en || 'Unknown')
    : (character.name.en || character.name.zh || 'Unknown');
  
  // 根节点
  const rootNode: NodeData = {
    id: baseId,
    type: 'root',
    x: startX,
    y: startY,
    text: characterName,
    img: includeAvatar ? character.avatar : undefined,
  };
  nodes.push(rootNode);
  
  // 子节点配置
  const childConfigs: Array<{
    key: keyof CharacterTemplate;
    label: { zh: string; en: string };
    value?: string | string[];
  }> = [
    { key: 'medium', label: { zh: '介质', en: 'Medium' }, value: character.medium },
    { key: 'aesthetic', label: { zh: '香调', en: 'Aesthetic' }, value: character.aesthetic },
    { key: 'inspiration', label: { zh: '灵感', en: 'Inspiration' }, value: character.inspiration },
    { key: 'quote', label: { zh: '语录', en: 'Quote' }, value: character.quote },
    { key: 'lore', label: { zh: '背景', en: 'Lore' }, value: character.lore },
    { key: 'element', label: { zh: '元素', en: 'Element' }, value: character.element },
    { key: 'role', label: { zh: '定位', en: 'Role' }, value: character.role },
  ];
  
  // 创建子节点
  let childIndex = 0;
  const childSpacing = 80;
  const childOffsetX = 250;
  
  for (const config of childConfigs) {
    if (!config.value) continue;
    
    const label = language === 'zh' ? config.label.zh : config.label.en;
    const subtype = effectiveMapping.mappings[config.key as string] || 'DATA';
    
    // 处理字符串值
    const text = typeof config.value === 'string' 
      ? `${label}: ${config.value}`
      : `${label}: ${config.value.join(', ')}`;
    
    // 截断过长的文本
    const truncatedText = text.length > 100 ? text.slice(0, 97) + '...' : text;
    
    nodes.push({
      id: baseId + (++childIndex),
      type: 'normal',
      subtype,
      x: startX + childOffsetX,
      y: startY + (childIndex - 1) * childSpacing - (childConfigs.filter(c => c.value).length * childSpacing / 2),
      text: truncatedText,
      parentId: rootNode.id,
    });
  }
  
  // 处理定位标签（positioning）
  if (character.positioning && character.positioning.length > 0) {
    const label = language === 'zh' ? '定位' : 'Positioning';
    const subtype = effectiveMapping.mappings.positioning || 'FACTION';
    
    nodes.push({
      id: baseId + (++childIndex),
      type: 'normal',
      subtype,
      x: startX + childOffsetX,
      y: startY + (childIndex - 1) * childSpacing - (childConfigs.filter(c => c.value).length * childSpacing / 2),
      text: `${label}: ${character.positioning.join(' / ')}`,
      parentId: rootNode.id,
    });
  }
  
  return nodes;
}

/**
 * 将角色转换为单个节点（简化版）
 * @param character 角色模板
 * @param options 转换选项
 * @returns 单个节点数据
 */
export function characterToSingleNode(
  character: CharacterTemplate,
  options: {
    includeAvatar?: boolean;
    language?: 'zh' | 'en';
    x?: number;
    y?: number;
  } = {}
): NodeData {
  const {
    includeAvatar = true,
    language = 'zh',
    x = 0,
    y = 0,
  } = options;
  
  const characterName = language === 'zh' 
    ? (character.name.zh || character.name.en || 'Unknown')
    : (character.name.en || character.name.zh || 'Unknown');
  
  return {
    id: Date.now(),
    type: 'normal',
    subtype: 'DATA',
    x,
    y,
    text: characterName,
    img: includeAvatar ? character.avatar : undefined,
  };
}

// ============================================================================
// 映射预览
// ============================================================================

/**
 * 获取角色的标签映射预览
 * @param character 角色模板
 * @param mapping 标签映射配置
 * @returns 映射预览数组
 */
export function getMappingPreview(
  character: CharacterTemplate,
  mapping?: TagMappingConfig
): Array<{ attribute: string; value: string; subtype: NodeSubtype }> {
  const effectiveMapping = mapping || createTagMappingConfig(character.category);
  const preview: Array<{ attribute: string; value: string; subtype: NodeSubtype }> = [];
  
  const attributes: Array<{ key: keyof CharacterTemplate; label: string }> = [
    { key: 'medium', label: '介质' },
    { key: 'aesthetic', label: '香调' },
    { key: 'inspiration', label: '灵感' },
    { key: 'quote', label: '语录' },
    { key: 'lore', label: '背景' },
    { key: 'element', label: '元素' },
    { key: 'role', label: '定位' },
  ];
  
  for (const attr of attributes) {
    const value = character[attr.key];
    if (value && typeof value === 'string') {
      preview.push({
        attribute: attr.label,
        value: value.length > 50 ? value.slice(0, 47) + '...' : value,
        subtype: effectiveMapping.mappings[attr.key as string] || 'DATA',
      });
    }
  }
  
  if (character.positioning && character.positioning.length > 0) {
    preview.push({
      attribute: '定位标签',
      value: character.positioning.join(', '),
      subtype: effectiveMapping.mappings.positioning || 'FACTION',
    });
  }
  
  return preview;
}

/**
 * 获取所有可用的节点子类型
 * @returns 节点子类型列表
 */
export function getAvailableSubtypes(): Array<{ value: NodeSubtype; label: { zh: string; en: string } }> {
  return [
    { value: 'FACTION', label: { zh: '阵营', en: 'Faction' } },
    { value: 'WEAPON', label: { zh: '武器', en: 'Weapon' } },
    { value: 'OUTFIT', label: { zh: '服装', en: 'Outfit' } },
    { value: 'PSYCH', label: { zh: '心理', en: 'Psychology' } },
    { value: 'TRAIT', label: { zh: '特质', en: 'Trait' } },
    { value: 'DATA', label: { zh: '数据', en: 'Data' } },
    { value: 'EYES', label: { zh: '眼睛', en: 'Eyes' } },
    { value: 'HAIR', label: { zh: '发型', en: 'Hair' } },
    { value: 'EAR', label: { zh: '耳朵', en: 'Ear' } },
  ];
}
