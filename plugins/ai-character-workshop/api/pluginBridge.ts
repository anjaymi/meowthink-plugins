/**
 * AI 角色工坊 - 插件互通接口
 * 用于与其他插件（角色融合、AI生图等）进行通信
 */

import type { 
  CharacterFusionAPI, 
  AIImageGenAPI, 
  FusionStyle, 
  FusionParams, 
  FusionResult,
  GeneratedImage,
  ImageGenOptions,
  ImageGenModel,
} from '../types';

// 插件注册表
const pluginRegistry: {
  characterFusion?: CharacterFusionAPI;
  aiImageGen?: AIImageGenAPI;
} = {};

/**
 * 注册角色融合插件 API
 */
export function registerCharacterFusionAPI(api: CharacterFusionAPI): void {
  pluginRegistry.characterFusion = api;
  console.log('[AI Character Workshop] 角色融合插件已连接');
}

/**
 * 注册 AI 生图插件 API
 */
export function registerAIImageGenAPI(api: AIImageGenAPI): void {
  pluginRegistry.aiImageGen = api;
  console.log('[AI Character Workshop] AI 生图插件已连接');
}

/**
 * 检查角色融合插件是否可用
 */
export function isCharacterFusionAvailable(): boolean {
  return !!pluginRegistry.characterFusion;
}

/**
 * 检查 AI 生图插件是否可用
 */
export function isAIImageGenAvailable(): boolean {
  return !!pluginRegistry.aiImageGen;
}

/**
 * 获取角色融合风格列表
 */
export async function getFusionStyles(): Promise<FusionStyle[]> {
  if (!pluginRegistry.characterFusion) {
    console.warn('[AI Character Workshop] 角色融合插件未连接');
    return [];
  }
  return pluginRegistry.characterFusion.getStyles();
}

/**
 * 根据风格获取标签
 */
export async function getFusionTagsByStyle(styleId: string): Promise<string[]> {
  if (!pluginRegistry.characterFusion) {
    return [];
  }
  return pluginRegistry.characterFusion.getTagsByStyle(styleId);
}

/**
 * 生成角色融合
 */
export async function generateFusion(params: FusionParams): Promise<FusionResult | null> {
  if (!pluginRegistry.characterFusion) {
    return null;
  }
  return pluginRegistry.characterFusion.generateFusion(params);
}

/**
 * 生成角色图片
 */
export async function generateCharacterImage(
  prompt: string, 
  options?: ImageGenOptions
): Promise<GeneratedImage | null> {
  if (!pluginRegistry.aiImageGen) {
    console.warn('[AI Character Workshop] AI 生图插件未连接');
    return null;
  }
  return pluginRegistry.aiImageGen.generateImage(prompt, options);
}

/**
 * 获取可用的图片生成模型
 */
export async function getImageGenModels(): Promise<ImageGenModel[]> {
  if (!pluginRegistry.aiImageGen) {
    return [];
  }
  return pluginRegistry.aiImageGen.getModels();
}

/**
 * 导出插件桥接对象（供其他插件调用）
 */
export const PluginBridge = {
  // 注册
  registerCharacterFusionAPI,
  registerAIImageGenAPI,
  // 检查
  isCharacterFusionAvailable,
  isAIImageGenAvailable,
  // 角色融合
  getFusionStyles,
  getFusionTagsByStyle,
  generateFusion,
  // AI 生图
  generateCharacterImage,
  getImageGenModels,
};

// 暴露到全局（供其他插件注册）
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__AI_CHARACTER_WORKSHOP_BRIDGE__ = PluginBridge;
}
