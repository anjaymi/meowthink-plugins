/**
 * Character Fusion Plugin - Variant Generator
 * 变体生成器 - 基于单个角色生成不同风格/版本的变体
 */

import {
  CharacterTemplate,
  VariantConfig,
  VariantResult,
  VariantType,
  FusionError,
  FusionErrorCode,
} from '../types';
import { VARIANT_PROMPTS, VARIANT_PROMPT_TEMPLATE } from '../constants';

// ============================================================================
// Types
// ============================================================================

interface AIProvider {
  name: string;
  generateText: (prompt: string) => Promise<string>;
}

// ============================================================================
// AI Provider (shared with fusion engine)
// ============================================================================

let currentProvider: AIProvider | null = null;

/** 设置 AI 提供者 */
export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}

// ============================================================================
// Variant Type Info
// ============================================================================

/** 变体类型信息 */
export const VARIANT_TYPE_INFO: Record<VariantType, { zh: string; en: string; description: string }> = {
  age_child: {
    zh: '儿童版本',
    en: 'Child Version',
    description: '将角色改为 8-12 岁的儿童形象',
  },
  age_elder: {
    zh: '年长版本',
    en: 'Elder Version',
    description: '将角色改为 60+ 岁的年长形象',
  },
  gender_swap: {
    zh: '性别转换',
    en: 'Gender Swap',
    description: '转换角色的性别',
  },
  role_change: {
    zh: '职业变更',
    en: 'Role Change',
    description: '改变角色的职业/定位',
  },
  element_change: {
    zh: '元素变更',
    en: 'Element Change',
    description: '改变角色的元素属性',
  },
  outfit_change: {
    zh: '服装变更',
    en: 'Outfit Change',
    description: '为角色设计新的服装/造型',
  },
  emotion_variant: {
    zh: '情绪变体',
    en: 'Emotion Variant',
    description: '展现角色在特定情绪状态下的形象',
  },
  villain_version: {
    zh: '反派版本',
    en: 'Villain Version',
    description: '创造角色的反派/堕落版本',
  },
  custom: {
    zh: '自定义变体',
    en: 'Custom Variant',
    description: '根据自定义描述生成变体',
  },
};

// ============================================================================
// Prompt Building
// ============================================================================

/** 构建变体描述 */
function buildVariantDescription(config: VariantConfig): string {
  let description = VARIANT_PROMPTS[config.type] || VARIANT_PROMPTS.custom;
  
  // 替换参数
  if (config.params) {
    if (config.params.newRole) {
      description = description.replace('{{newRole}}', config.params.newRole);
    }
    if (config.params.newElement) {
      description = description.replace('{{newElement}}', config.params.newElement);
    }
    if (config.params.outfitTheme) {
      description = description.replace('{{outfitTheme}}', config.params.outfitTheme);
    }
    if (config.params.emotion) {
      description = description.replace('{{emotion}}', config.params.emotion);
    }
    if (config.params.customPrompt) {
      description = description.replace('{{customPrompt}}', config.params.customPrompt);
    }
  }
  
  return description;
}

/** 构建变体提示词 */
export function buildVariantPrompt(character: CharacterTemplate, config: VariantConfig): string {
  const name = character.name.zh || character.name.en || 'Unknown';
  const variantDescription = buildVariantDescription(config);
  
  let prompt = VARIANT_PROMPT_TEMPLATE
    .replace('{{name}}', name)
    .replace('{{variantDescription}}', variantDescription);
  
  // 替换角色信息
  if (character.lore) {
    prompt = prompt.replace('{{#if lore}}背景设定: {{lore}}{{/if}}', `背景设定: ${character.lore}`);
  } else {
    prompt = prompt.replace('{{#if lore}}背景设定: {{lore}}{{/if}}', '');
  }
  
  if (character.medium) {
    prompt = prompt.replace('{{#if medium}}介质/本质: {{medium}}{{/if}}', `介质/本质: ${character.medium}`);
  } else {
    prompt = prompt.replace('{{#if medium}}介质/本质: {{medium}}{{/if}}', '');
  }
  
  if (character.aesthetic) {
    prompt = prompt.replace('{{#if aesthetic}}美学风格: {{aesthetic}}{{/if}}', `美学风格: ${character.aesthetic}`);
  } else {
    prompt = prompt.replace('{{#if aesthetic}}美学风格: {{aesthetic}}{{/if}}', '');
  }
  
  if (character.inspiration) {
    prompt = prompt.replace('{{#if inspiration}}灵感来源: {{inspiration}}{{/if}}', `灵感来源: ${character.inspiration}`);
  } else {
    prompt = prompt.replace('{{#if inspiration}}灵感来源: {{inspiration}}{{/if}}', '');
  }
  
  if (character.quote) {
    prompt = prompt.replace('{{#if quote}}角色语录: {{quote}}{{/if}}', `角色语录: ${character.quote}`);
  } else {
    prompt = prompt.replace('{{#if quote}}角色语录: {{quote}}{{/if}}', '');
  }
  
  if (character.positioning && character.positioning.length > 0) {
    prompt = prompt.replace('{{#if positioning}}定位: {{positioning}}{{/if}}', `定位: ${character.positioning.join(' / ')}`);
  } else {
    prompt = prompt.replace('{{#if positioning}}定位: {{positioning}}{{/if}}', '');
  }
  
  // 添加语言要求
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
    
    // 提取 JSON
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
// Main Variant Generation
// ============================================================================

/** 生成变体 */
export async function generateVariant(
  character: CharacterTemplate,
  config: VariantConfig
): Promise<{ success: boolean; result?: VariantResult; error?: FusionError }> {
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
  
  // 验证自定义变体
  if (config.type === 'custom' && !config.params?.customPrompt) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: '自定义变体需要提供描述',
        suggestion: '请输入变体描述',
      },
    };
  }
  
  // 验证需要参数的变体类型
  if (config.type === 'role_change' && !config.params?.newRole) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: '职业变更需要指定新职业',
        suggestion: '请输入新的职业/定位',
      },
    };
  }
  
  if (config.type === 'element_change' && !config.params?.newElement) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: '元素变更需要指定新元素',
        suggestion: '请输入新的元素属性',
      },
    };
  }
  
  if (config.type === 'outfit_change' && !config.params?.outfitTheme) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: '服装变更需要指定主题',
        suggestion: '请输入服装/造型主题',
      },
    };
  }
  
  if (config.type === 'emotion_variant' && !config.params?.emotion) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: '情绪变体需要指定情绪',
        suggestion: '请输入情绪状态',
      },
    };
  }
  
  // 构建提示词
  const prompt = buildVariantPrompt(character, config);
  
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
  
  // 构建变体角色
  const variantCharacter: CharacterTemplate = {
    id: `variant_${character.id}_${Date.now()}`,
    name: parseResult.data.name || { zh: `${character.name.zh || character.name.en} (变体)` },
    category: character.category,
    lore: parseResult.data.lore,
    medium: parseResult.data.medium || character.medium,
    aesthetic: parseResult.data.aesthetic,
    inspiration: parseResult.data.inspiration,
    quote: parseResult.data.quote,
    positioning: parseResult.data.positioning,
    element: parseResult.data.element || character.element,
    role: parseResult.data.role || character.role,
    rarity: character.rarity,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isGenerated: true,
    sourceCharacters: [character.id],
  };
  
  const result: VariantResult = {
    character: variantCharacter,
    sourceCharacter: character,
    variantType: config.type,
    prompt,
  };
  
  return { success: true, result };
}

// ============================================================================
// Batch Variant Generation
// ============================================================================

/** 批量生成变体 */
export async function generateVariants(
  character: CharacterTemplate,
  configs: VariantConfig[]
): Promise<{
  success: boolean;
  results: Array<{ config: VariantConfig; result?: VariantResult; error?: FusionError }>;
}> {
  const results: Array<{ config: VariantConfig; result?: VariantResult; error?: FusionError }> = [];
  
  for (const config of configs) {
    const result = await generateVariant(character, config);
    results.push({
      config,
      result: result.result,
      error: result.error,
    });
    
    // 添加延迟避免 API 限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successCount = results.filter(r => r.result).length;
  
  return {
    success: successCount > 0,
    results,
  };
}

// ============================================================================
// Quick Variants
// ============================================================================

/** 快速生成常用变体 */
export async function generateQuickVariants(
  character: CharacterTemplate,
  types: VariantType[]
): Promise<{
  success: boolean;
  results: Array<{ type: VariantType; result?: VariantResult; error?: FusionError }>;
}> {
  const configs: VariantConfig[] = types.map(type => ({
    type,
    outputLanguage: 'zh',
    generateImage: false,
  }));
  
  const batchResult = await generateVariants(character, configs);
  
  return {
    success: batchResult.success,
    results: batchResult.results.map((r, i) => ({
      type: types[i],
      result: r.result,
      error: r.error,
    })),
  };
}

// ============================================================================
// Preset Variants
// ============================================================================

/** 预设变体配置 */
export const PRESET_VARIANTS: Record<string, VariantConfig[]> = {
  /** 年龄变体组 */
  age: [
    { type: 'age_child', outputLanguage: 'zh', generateImage: false },
    { type: 'age_elder', outputLanguage: 'zh', generateImage: false },
  ],
  
  /** 对立变体组 */
  contrast: [
    { type: 'gender_swap', outputLanguage: 'zh', generateImage: false },
    { type: 'villain_version', outputLanguage: 'zh', generateImage: false },
  ],
  
  /** 情绪变体组 */
  emotions: [
    { type: 'emotion_variant', params: { emotion: '愤怒' }, outputLanguage: 'zh', generateImage: false },
    { type: 'emotion_variant', params: { emotion: '悲伤' }, outputLanguage: 'zh', generateImage: false },
    { type: 'emotion_variant', params: { emotion: '喜悦' }, outputLanguage: 'zh', generateImage: false },
  ],
};

/** 使用预设生成变体 */
export async function generatePresetVariants(
  character: CharacterTemplate,
  presetName: keyof typeof PRESET_VARIANTS
): Promise<{
  success: boolean;
  results: Array<{ config: VariantConfig; result?: VariantResult; error?: FusionError }>;
}> {
  const configs = PRESET_VARIANTS[presetName];
  if (!configs) {
    return {
      success: false,
      results: [],
    };
  }
  
  return generateVariants(character, configs);
}
