/**
 * Character Fusion Plugin - Style Transfer
 * 风格迁移 - 将一个角色的风格应用到另一个角色
 */

import {
  CharacterTemplate,
  FusionError,
  FusionErrorCode,
} from '../types';

// ============================================================================
// Types
// ============================================================================

interface AIProvider {
  name: string;
  generateText: (prompt: string) => Promise<string>;
}

/** 风格迁移配置 */
export interface StyleTransferConfig {
  /** 迁移的风格元素 */
  elements: ('aesthetic' | 'quote' | 'lore' | 'medium' | 'inspiration')[];
  
  /** 迁移强度 (0-1) */
  intensity: number;
  
  /** 输出语言 */
  outputLanguage: 'zh' | 'en';
  
  /** 是否生成图片 */
  generateImage: boolean;
}

/** 风格迁移结果 */
export interface StyleTransferResult {
  /** 迁移后的角色 */
  character: CharacterTemplate;
  
  /** 风格来源角色 */
  styleSource: CharacterTemplate;
  
  /** 内容来源角色 */
  contentSource: CharacterTemplate;
  
  /** 使用的提示词 */
  prompt: string;
  
  /** 迁移描述 */
  description: string;
}

// ============================================================================
// AI Provider
// ============================================================================

let currentProvider: AIProvider | null = null;

/** 设置 AI 提供者 */
export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}

// ============================================================================
// Style Extraction
// ============================================================================

/** 提取角色的风格元素 */
export function extractStyle(character: CharacterTemplate): {
  aesthetic: string | undefined;
  quoteStyle: string | undefined;
  loreStyle: string | undefined;
  mediumConcept: string | undefined;
  inspirationThemes: string | undefined;
} {
  return {
    aesthetic: character.aesthetic,
    quoteStyle: character.quote ? analyzeQuoteStyle(character.quote) : undefined,
    loreStyle: character.lore ? analyzeLoreStyle(character.lore) : undefined,
    mediumConcept: character.medium,
    inspirationThemes: character.inspiration,
  };
}

/** 分析语录风格 */
function analyzeQuoteStyle(quote: string): string {
  const styles: string[] = [];
  
  // 简单的风格分析
  if (quote.includes('？') || quote.includes('?')) {
    styles.push('疑问式');
  }
  if (quote.includes('……') || quote.includes('...')) {
    styles.push('留白式');
  }
  if (quote.length < 20) {
    styles.push('简洁');
  } else if (quote.length > 50) {
    styles.push('详尽');
  }
  if (/[！!]/.test(quote)) {
    styles.push('激昂');
  }
  
  return styles.length > 0 ? styles.join('、') : '平实';
}

/** 分析背景设定风格 */
function analyzeLoreStyle(lore: string): string {
  const styles: string[] = [];
  
  if (lore.length > 200) {
    styles.push('详细叙事');
  } else {
    styles.push('简洁概述');
  }
  
  if (/传说|据说|相传/.test(lore)) {
    styles.push('传说体');
  }
  if (/第一人称|我/.test(lore)) {
    styles.push('第一人称');
  }
  if (/他|她|它/.test(lore)) {
    styles.push('第三人称');
  }
  
  return styles.length > 0 ? styles.join('、') : '客观描述';
}

// ============================================================================
// Prompt Building
// ============================================================================

/** 构建风格迁移提示词 */
function buildStyleTransferPrompt(
  contentSource: CharacterTemplate,
  styleSource: CharacterTemplate,
  config: StyleTransferConfig
): string {
  const contentName = contentSource.name.zh || contentSource.name.en || 'Unknown';
  const styleName = styleSource.name.zh || styleSource.name.en || 'Unknown';
  
  const elementDescriptions: Record<string, string> = {
    aesthetic: '美学风格/香调',
    quote: '语录风格',
    lore: '背景叙事风格',
    medium: '介质/本质概念',
    inspiration: '灵感来源主题',
  };
  
  const selectedElements = config.elements.map(e => elementDescriptions[e]).join('、');
  
  let prompt = `你是一个角色文案设计专家。请将一个角色的风格应用到另一个角色上。

## 内容来源角色: ${contentName}
${contentSource.lore ? `背景设定: ${contentSource.lore}` : ''}
${contentSource.medium ? `介质/本质: ${contentSource.medium}` : ''}
${contentSource.aesthetic ? `美学风格: ${contentSource.aesthetic}` : ''}
${contentSource.inspiration ? `灵感来源: ${contentSource.inspiration}` : ''}
${contentSource.quote ? `角色语录: ${contentSource.quote}` : ''}
${contentSource.positioning ? `定位: ${contentSource.positioning.join(' / ')}` : ''}

## 风格来源角色: ${styleName}
${styleSource.lore ? `背景设定: ${styleSource.lore}` : ''}
${styleSource.medium ? `介质/本质: ${styleSource.medium}` : ''}
${styleSource.aesthetic ? `美学风格: ${styleSource.aesthetic}` : ''}
${styleSource.inspiration ? `灵感来源: ${styleSource.inspiration}` : ''}
${styleSource.quote ? `角色语录: ${styleSource.quote}` : ''}

## 迁移要求
- 保留 ${contentName} 的核心身份和故事
- 应用 ${styleName} 的以下风格元素: ${selectedElements}
- 迁移强度: ${Math.round(config.intensity * 100)}%

## 输出格式
请输出 JSON 格式：
{
  "name": { "zh": "新角色名称" },
  "lore": "融合后的背景设定（保留内容来源的故事，应用风格来源的叙事风格）",
  "medium": "介质/本质",
  "aesthetic": "美学风格描述",
  "inspiration": "灵感来源",
  "quote": "角色语录（应用风格来源的语录风格）",
  "positioning": ["定位标签1", "定位标签2", "定位标签3"],
  "element": "元素属性",
  "role": "职业定位"
}

只输出 JSON，不要其他内容。`;

  if (config.outputLanguage === 'en') {
    prompt += '\n\n请用英文输出所有内容。';
  }

  return prompt;
}

// ============================================================================
// Response Parsing
// ============================================================================

/** 解析 AI 返回的 JSON */
function parseAIResponse(response: string): { success: boolean; data?: Partial<CharacterTemplate>; error?: string } {
  try {
    let jsonStr = response;
    
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
    }
    
    const data = JSON.parse(jsonStr);
    
    if (!data.name || (!data.name.zh && !data.name.en)) {
      return { success: false, error: '缺少角色名称' };
    }
    
    return { success: true, data };
  } catch (e) {
    return { success: false, error: `JSON 解析失败: ${e}` };
  }
}

// ============================================================================
// Main Style Transfer
// ============================================================================

/** 风格迁移 */
export async function transferStyle(
  contentSource: CharacterTemplate,
  styleSource: CharacterTemplate,
  config: StyleTransferConfig
): Promise<{ success: boolean; result?: StyleTransferResult; error?: FusionError }> {
  // 检查 AI 提供者
  if (!currentProvider) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.AI_API_ERROR,
        message: 'AI 服务未配置',
        suggestion: '请在设置中配置 AI 服务',
      },
    };
  }
  
  // 验证输入
  if (!config.elements || config.elements.length === 0) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: '请选择要迁移的风格元素',
        suggestion: '至少选择一个风格元素',
      },
    };
  }
  
  // 构建提示词
  const prompt = buildStyleTransferPrompt(contentSource, styleSource, config);
  
  // 调用 AI
  let response: string;
  try {
    response = await currentProvider.generateText(prompt);
  } catch (e) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.AI_API_ERROR,
        message: 'AI 调用失败',
        details: e,
        suggestion: '请检查网络连接和 API 配置',
      },
    };
  }
  
  // 解析响应
  const parseResult = parseAIResponse(response);
  if (!parseResult.success || !parseResult.data) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.PARSE_ERROR,
        message: parseResult.error || '无法解析 AI 响应',
        suggestion: '请重试',
      },
    };
  }
  
  // 构建结果角色
  const transferredCharacter: CharacterTemplate = {
    id: `style_${contentSource.id}_${styleSource.id}_${Date.now()}`,
    name: parseResult.data.name || { 
      zh: `${contentSource.name.zh || contentSource.name.en} (${styleSource.name.zh || styleSource.name.en} 风格)` 
    },
    category: contentSource.category,
    lore: parseResult.data.lore,
    medium: parseResult.data.medium || contentSource.medium,
    aesthetic: parseResult.data.aesthetic,
    inspiration: parseResult.data.inspiration,
    quote: parseResult.data.quote,
    positioning: parseResult.data.positioning || contentSource.positioning,
    element: parseResult.data.element || contentSource.element,
    role: parseResult.data.role || contentSource.role,
    rarity: contentSource.rarity,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isGenerated: true,
    sourceCharacters: [contentSource.id, styleSource.id],
  };
  
  // 生成迁移描述
  const contentName = contentSource.name.zh || contentSource.name.en || 'Unknown';
  const styleName = styleSource.name.zh || styleSource.name.en || 'Unknown';
  const description = `将 ${styleName} 的风格应用到 ${contentName}，迁移强度 ${Math.round(config.intensity * 100)}%`;
  
  const result: StyleTransferResult = {
    character: transferredCharacter,
    styleSource,
    contentSource,
    prompt,
    description,
  };
  
  return { success: true, result };
}

// ============================================================================
// Quick Style Transfer
// ============================================================================

/** 快速风格迁移（使用默认配置） */
export async function quickStyleTransfer(
  contentSource: CharacterTemplate,
  styleSource: CharacterTemplate
): Promise<{ success: boolean; result?: StyleTransferResult; error?: FusionError }> {
  const config: StyleTransferConfig = {
    elements: ['aesthetic', 'quote'],
    intensity: 0.7,
    outputLanguage: 'zh',
    generateImage: false,
  };
  
  return transferStyle(contentSource, styleSource, config);
}

// ============================================================================
// Style Comparison
// ============================================================================

/** 比较两个角色的风格差异 */
export function compareStyles(
  char1: CharacterTemplate,
  char2: CharacterTemplate
): {
  similarity: number;
  differences: string[];
  commonElements: string[];
} {
  const differences: string[] = [];
  const commonElements: string[] = [];
  
  // 比较分类
  if (char1.category === char2.category) {
    commonElements.push(`相同风格分类: ${char1.category}`);
  } else {
    differences.push(`风格分类不同: ${char1.category} vs ${char2.category}`);
  }
  
  // 比较元素
  if (char1.element && char2.element) {
    if (char1.element === char2.element) {
      commonElements.push(`相同元素: ${char1.element}`);
    } else {
      differences.push(`元素不同: ${char1.element} vs ${char2.element}`);
    }
  }
  
  // 比较介质
  if (char1.medium && char2.medium) {
    if (char1.medium === char2.medium) {
      commonElements.push(`相同介质: ${char1.medium}`);
    } else {
      differences.push(`介质不同: ${char1.medium} vs ${char2.medium}`);
    }
  }
  
  // 计算相似度
  const totalPoints = differences.length + commonElements.length;
  const similarity = totalPoints > 0 ? commonElements.length / totalPoints : 0.5;
  
  return { similarity, differences, commonElements };
}
