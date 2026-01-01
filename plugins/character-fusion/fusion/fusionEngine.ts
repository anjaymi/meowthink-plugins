/**
 * Character Fusion Plugin - Fusion Engine
 * AI 融合引擎 - 使用 AI 将多个角色特征混合生成新角色
 */

import {
  CharacterTemplate,
  FusionConfig,
  FusionResult,
  FusionMode,
  FusionError,
  FusionErrorCode,
  StyleCategory,
} from '../types';
import {
  FUSION_PROMPT_TEMPLATE,
  FUSION_MODE_DESCRIPTIONS,
  MIN_FUSION_CHARACTERS,
  MAX_FUSION_CHARACTERS,
} from '../constants';

// ============================================================================
// Types
// ============================================================================

interface AIProvider {
  name: string;
  generateText: (prompt: string) => Promise<string>;
}

// ============================================================================
// AI Provider Management
// ============================================================================

let currentProvider: AIProvider | null = null;

/** 设置 AI 提供者 */
export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}

/** 获取当前 AI 提供者 */
export function getAIProvider(): AIProvider | null {
  return currentProvider;
}

// ============================================================================
// Prompt Building
// ============================================================================

/** 构建角色描述 */
function buildCharacterDescription(character: CharacterTemplate, index: number): string {
  const name = character.name.zh || character.name.en || 'Unknown';
  const lines: string[] = [
    `### 角色 ${index + 1}: ${name}`,
  ];
  
  if (character.lore) {
    lines.push(`- 背景设定: ${character.lore}`);
  }
  if (character.medium) {
    lines.push(`- 介质/本质: ${character.medium}`);
  }
  if (character.aesthetic) {
    lines.push(`- 美学风格: ${character.aesthetic}`);
  }
  if (character.inspiration) {
    lines.push(`- 灵感来源: ${character.inspiration}`);
  }
  if (character.quote) {
    lines.push(`- 角色语录: ${character.quote}`);
  }
  if (character.positioning && character.positioning.length > 0) {
    lines.push(`- 定位: ${character.positioning.join(' / ')}`);
  }
  if (character.element) {
    lines.push(`- 元素: ${character.element}`);
  }
  if (character.role) {
    lines.push(`- 职业: ${character.role}`);
  }
  
  return lines.join('\n');
}

/** 构建融合模式描述 */
function buildFusionModeDescription(config: FusionConfig, characters: CharacterTemplate[]): string {
  let description = FUSION_MODE_DESCRIPTIONS[config.mode];
  
  if (config.mode === 'dominant' && config.dominantCharacterId) {
    const dominant = characters.find(c => c.id === config.dominantCharacterId);
    if (dominant) {
      const name = dominant.name.zh || dominant.name.en || 'Unknown';
      description = description.replace('{{dominantName}}', name);
    }
  }
  
  return description;
}

/** 构建融合提示词 */
export function buildFusionPrompt(characters: CharacterTemplate[], config: FusionConfig): string {
  // 构建角色描述
  const characterDescriptions = characters
    .map((char, index) => buildCharacterDescription(char, index))
    .join('\n\n');
  
  // 构建融合模式描述
  const fusionModeDescription = buildFusionModeDescription(config, characters);
  
  // 替换模板变量
  let prompt = FUSION_PROMPT_TEMPLATE
    .replace('{{characters}}', characterDescriptions)
    .replace('{{fusionMode}}', fusionModeDescription);
  
  // 添加语言要求
  if (config.outputLanguage === 'en') {
    prompt += '\n\n请用英文输出所有内容。';
  }
  
  // 添加保留元素要求
  if (config.preserveElements && config.preserveElements.length > 0) {
    const elementNames: Record<string, string> = {
      lore: '背景设定',
      medium: '介质/本质',
      aesthetic: '美学风格',
      inspiration: '灵感来源',
      quote: '语录风格',
    };
    const preserved = config.preserveElements.map(e => elementNames[e] || e).join('、');
    prompt += `\n\n特别注意：请重点保留和融合以下元素：${preserved}`;
  }
  
  return prompt;
}

// ============================================================================
// Response Parsing
// ============================================================================

/** 解析 AI 返回的 JSON */
function parseAIResponse(response: string): { success: boolean; data?: Partial<CharacterTemplate>; error?: string } {
  try {
    // 尝试提取 JSON
    let jsonStr = response;
    
    // 如果响应包含 markdown 代码块，提取其中的 JSON
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    // 尝试找到 JSON 对象
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
    }
    
    const data = JSON.parse(jsonStr);
    
    // 验证必需字段
    if (!data.name || (!data.name.zh && !data.name.en)) {
      return { success: false, error: '缺少角色名称' };
    }
    
    return { success: true, data };
  } catch (e) {
    return { success: false, error: `JSON 解析失败: ${e}` };
  }
}

/** 确定融合后的风格分类 */
function determineFusedCategory(characters: CharacterTemplate[]): StyleCategory {
  // 统计各分类的数量
  const categoryCounts: Record<StyleCategory, number> = {
    fantasy: 0,
    cyberpunk: 0,
    urban: 0,
    horror: 0,
  };
  
  for (const char of characters) {
    categoryCounts[char.category]++;
  }
  
  // 返回数量最多的分类
  let maxCategory: StyleCategory = 'fantasy';
  let maxCount = 0;
  
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category as StyleCategory;
    }
  }
  
  return maxCategory;
}

// ============================================================================
// Main Fusion Function
// ============================================================================

/** 融合角色 */
export async function fuseCharacters(
  characters: CharacterTemplate[],
  config: FusionConfig
): Promise<{ success: boolean; result?: FusionResult; error?: FusionError }> {
  // 验证输入
  if (characters.length < MIN_FUSION_CHARACTERS) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: `至少需要 ${MIN_FUSION_CHARACTERS} 个角色进行融合`,
        suggestion: '请选择更多角色',
      },
    };
  }
  
  if (characters.length > MAX_FUSION_CHARACTERS) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.INVALID_INPUT,
        message: `最多只能选择 ${MAX_FUSION_CHARACTERS} 个角色进行融合`,
        suggestion: '请减少选择的角色数量',
      },
    };
  }
  
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
  
  // 构建提示词
  const prompt = buildFusionPrompt(characters, config);
  
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
        suggestion: '请重试或调整融合参数',
      },
    };
  }
  
  // 构建融合结果
  const fusedCharacter: CharacterTemplate = {
    id: `fused_${Date.now()}`,
    name: parseResult.data.name || { zh: '未命名角色' },
    category: determineFusedCategory(characters),
    lore: parseResult.data.lore,
    medium: parseResult.data.medium,
    aesthetic: parseResult.data.aesthetic,
    inspiration: parseResult.data.inspiration,
    quote: parseResult.data.quote,
    positioning: parseResult.data.positioning,
    element: parseResult.data.element,
    role: parseResult.data.role,
    tags: parseResult.data.tags || [],
    rarity: Math.max(...characters.map(c => c.rarity || 1)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isGenerated: true,
    sourceCharacters: characters.map(c => c.id),
  };
  
  const result: FusionResult = {
    character: fusedCharacter,
    prompt,
    confidence: 0.8, // 默认置信度
    suggestions: generateSuggestions(fusedCharacter, characters),
    sourceCharacters: characters,
  };
  
  return { success: true, result };
}

/** 生成建议 */
function generateSuggestions(fused: CharacterTemplate, sources: CharacterTemplate[]): string[] {
  const suggestions: string[] = [];
  
  // 检查是否缺少某些字段
  if (!fused.lore) {
    suggestions.push('可以添加更详细的背景设定');
  }
  if (!fused.quote) {
    suggestions.push('可以添加一句代表性语录');
  }
  if (!fused.positioning || fused.positioning.length === 0) {
    suggestions.push('可以添加定位标签以便分类');
  }
  
  // 检查风格一致性
  const categories = new Set(sources.map(s => s.category));
  if (categories.size > 2) {
    suggestions.push('源角色风格差异较大，可能需要手动调整融合结果');
  }
  
  return suggestions;
}

// ============================================================================
// Retry Logic
// ============================================================================

/** 带重试的融合 */
export async function fuseCharactersWithRetry(
  characters: CharacterTemplate[],
  config: FusionConfig,
  maxRetries: number = 3
): Promise<{ success: boolean; result?: FusionResult; error?: FusionError }> {
  let lastError: FusionError | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    const result = await fuseCharacters(characters, config);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    // 如果是输入错误或配置错误，不重试
    if (result.error?.code === FusionErrorCode.INVALID_INPUT) {
      return result;
    }
    
    // 等待后重试
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  return {
    success: false,
    error: lastError || {
      code: FusionErrorCode.AI_API_ERROR,
      message: '多次重试后仍然失败',
      suggestion: '请稍后再试',
    },
  };
}

// ============================================================================
// Quick Fusion (Simplified)
// ============================================================================

/** 快速融合（使用默认配置） */
export async function quickFuse(
  characters: CharacterTemplate[],
  mode: FusionMode = 'balanced'
): Promise<{ success: boolean; result?: FusionResult; error?: FusionError }> {
  const config: FusionConfig = {
    mode,
    outputLanguage: 'zh',
    generateImage: false,
  };
  
  return fuseCharacters(characters, config);
}

// ============================================================================
// Fusion Preview
// ============================================================================

/** 生成融合预览（不调用 AI） */
export function generateFusionPreview(
  characters: CharacterTemplate[],
  config: FusionConfig
): {
  prompt: string;
  estimatedTime: number;
  warnings: string[];
} {
  const prompt = buildFusionPrompt(characters, config);
  
  // 估算时间（基于提示词长度）
  const estimatedTime = Math.max(5, Math.min(30, Math.ceil(prompt.length / 500)));
  
  const warnings: string[] = [];
  
  // 检查潜在问题
  const categories = new Set(characters.map(c => c.category));
  if (categories.size > 2) {
    warnings.push('选择的角色风格差异较大，融合结果可能不够协调');
  }
  
  const hasLore = characters.every(c => c.lore);
  if (!hasLore) {
    warnings.push('部分角色缺少背景设定，可能影响融合质量');
  }
  
  const hasMedium = characters.every(c => c.medium);
  if (!hasMedium) {
    warnings.push('部分角色缺少介质/本质，可能影响概念融合');
  }
  
  return { prompt, estimatedTime, warnings };
}
