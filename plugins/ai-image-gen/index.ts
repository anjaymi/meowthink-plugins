/**
 * AI Image Generation Extension - AI 生图扩展
 * 支持多种 AI 图像生成服务：Gemini、SiliconFlow、OpenRouter、火山引擎等
 */

import { IExtensionContext, IExtensionAPI, IExtensionModule, Disposable } from '../../../types/extension';

// ============================================================================
// Types
// ============================================================================

interface ImageModelConfig {
  name: string;
  provider: 'gemini' | 'siliconflow' | 'openrouter' | 'volcano' | 'custom';
  model: string;
  apiKey: string;
  endpoint: string;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

interface ImageGenState {
  config: ImageModelConfig;
  history: GeneratedImage[];
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'ai_image_gen_config';
const HISTORY_KEY = 'ai_image_gen_history';
const MAX_HISTORY = 20;

const DEFAULT_CONFIG: ImageModelConfig = {
  name: '',
  provider: 'siliconflow',
  model: 'black-forest-labs/FLUX.1-schnell',
  apiKey: '',
  endpoint: 'https://api.siliconflow.cn/v1/images/generations',
};

const PROVIDER_PRESETS: Record<string, Partial<ImageModelConfig>> = {
  gemini: {
    model: 'gemini-2.0-flash-preview-image-generation',
    endpoint: '',
  },
  siliconflow: {
    model: 'black-forest-labs/FLUX.1-schnell',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
  },
  openrouter: {
    model: 'black-forest-labs/flux-schnell',
    endpoint: 'https://openrouter.ai/api/v1/images/generations',
  },
  volcano: {
    model: 'doubao-seedream-3-0-t2i-250415',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  },
};

// ============================================================================
// Tauri Environment Detection
// ============================================================================

const isTauriEnv = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isTauriProtocol = window.location.protocol === 'tauri:' || 
    (window.location.protocol === 'https:' && window.location.hostname === 'tauri.localhost');
  const w = window as unknown as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown };
  return isTauriProtocol || !!(w.__TAURI__ || w.__TAURI_INTERNALS__);
};

let tauriFetch: typeof fetch | null = null;
let tauriFetchInitialized = false;

const initTauriFetch = async () => {
  if (tauriFetchInitialized) return tauriFetch;
  tauriFetchInitialized = true;
  if (isTauriEnv()) {
    try {
      // Use window.__TAURI__ global object instead of dynamic import
      // This works better in Tauri WebView environment
      const tauriGlobal = (window as unknown as { __TAURI__?: Record<string, unknown> }).__TAURI__;
      if (tauriGlobal?.http) {
        const httpModule = tauriGlobal.http as { fetch: typeof fetch };
        tauriFetch = httpModule.fetch;
        console.log('[AIImageGen] Using Tauri HTTP fetch');
      }
    } catch (e) {
      console.warn('[AIImageGen] Tauri HTTP plugin not available:', e);
    }
  }
  return tauriFetch;
};

const getHttpClient = async (): Promise<typeof fetch> => {
  const tauri = await initTauriFetch();
  return tauri || fetch;
};

// ============================================================================
// Extension State
// ============================================================================

let api: IExtensionAPI | null = null;
let state: ImageGenState = {
  config: { ...DEFAULT_CONFIG },
  history: [],
};

// ============================================================================
// Storage Helpers
// ============================================================================

function loadConfig(): ImageModelConfig {
  if (!api) return DEFAULT_CONFIG;
  const saved = api.storage.get<ImageModelConfig>(STORAGE_KEY);
  return saved || DEFAULT_CONFIG;
}

function saveConfig(config: ImageModelConfig): void {
  if (!api) return;
  api.storage.set(STORAGE_KEY, config);
  state.config = config;
}

function loadHistory(): GeneratedImage[] {
  if (!api) return [];
  return api.storage.get<GeneratedImage[]>(HISTORY_KEY) || [];
}

function saveHistory(history: GeneratedImage[]): void {
  if (!api) return;
  api.storage.set(HISTORY_KEY, history.slice(0, MAX_HISTORY));
  state.history = history;
}

function addToHistory(image: GeneratedImage): void {
  const history = [image, ...state.history].slice(0, MAX_HISTORY);
  saveHistory(history);
}

// ============================================================================
// Image Generation
// ============================================================================

async function generateImage(
  prompt: string,
  options: { width?: number; height?: number; referenceImage?: string } = {}
): Promise<string> {
  const config = state.config;
  const isZh = api?.i18n.getLocale() === 'zh';

  if (!config.apiKey) {
    throw new Error(isZh ? '请先配置 API Key' : 'Please configure API Key first');
  }

  if (!prompt.trim()) {
    throw new Error(isZh ? '请输入提示词' : 'Please enter a prompt');
  }

  const httpClient = await getHttpClient();
  const { width = 1024, height = 1024, referenceImage } = options;

  // Handle Gemini provider (uses Google GenAI SDK)
  if (config.provider === 'gemini') {
    const { GoogleGenAI, Modality } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const modelName = config.model || 'imagen-3.0-generate-001';
    
    console.log('[AIImageGen] Using Gemini model:', modelName);

    // Check if using Imagen model (dedicated image generation)
    if (modelName.includes('imagen')) {
      console.log('[AIImageGen] Using Imagen API');
      try {
        const response = await ai.models.generateImages({
          model: modelName,
          prompt: prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: width === height ? '1:1' : (width > height ? '16:9' : '9:16'),
          },
        });

        const images = (response as unknown as { generatedImages?: Array<{ image?: { imageBytes?: string } }> })?.generatedImages;
        if (images && images.length > 0 && images[0].image?.imageBytes) {
          return `data:image/png;base64,${images[0].image.imageBytes}`;
        }
        throw new Error(isZh ? '未能获取生成的图片' : 'Failed to get generated image');
      } catch (e) {
        const err = e as Error;
        console.error('[AIImageGen] Imagen API error:', err);
        if (err.message?.includes('404') || err.message?.includes('not found')) {
          throw new Error(isZh ? 'Imagen 模型需要启用 Vertex AI。请使用 SiliconFlow 或其他服务商。' : 'Imagen requires Vertex AI. Please use SiliconFlow or other providers.');
        }
        throw err;
      }
    }

    // Use Gemini multimodal model (gemini-2.0-flash-preview-image-generation)
    console.log('[AIImageGen] Using Gemini multimodal API');
    
    if (!modelName.includes('image-generation') && !modelName.includes('exp')) {
      throw new Error(isZh 
        ? `模型 ${modelName} 不支持图像生成。请使用 imagen-3.0-generate-001 或 gemini-2.0-flash-preview-image-generation` 
        : `Model ${modelName} does not support image generation.`);
    }

    const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: prompt }
    ];

    if (referenceImage) {
      const base64Data = referenceImage.split(',')[1];
      const mimeType = referenceImage.split(';')[0].split(':')[1];
      contents.unshift({ inlineData: { mimeType, data: base64Data } });
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: contents }],
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });

      const candidate = (response as unknown as { 
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType: string; data: string } }> } }> 
      })?.candidates?.[0];
      
      for (const part of candidate?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error(isZh ? '未能获取生成的图片' : 'Failed to get generated image');
    } catch (e) {
      const err = e as Error;
      console.error('[AIImageGen] Gemini API error:', err);
      if (err.message?.includes('only supports text')) {
        throw new Error(isZh 
          ? `模型 ${modelName} 只支持文本输出，不支持图像生成。请更换模型。` 
          : `Model ${modelName} only supports text output.`);
      }
      throw err;
    }
  }

  // OpenAI compatible API
  const requestBody: Record<string, unknown> = {
    model: config.model,
    prompt: prompt,
    n: 1,
    size: `${width}x${height}`,
  };

  if (referenceImage) {
    requestBody.image = referenceImage;
  }

  const response = await httpClient(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  if (data.data?.[0]) {
    return data.data[0].url || (data.data[0].b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : '');
  } else if (data.images?.[0]) {
    return data.images[0].url || data.images[0];
  }

  throw new Error(isZh ? '未能获取生成的图片' : 'Failed to get generated image');
}

// ============================================================================
// Extension Activation
// ============================================================================

export const activate: IExtensionModule['activate'] = (context, extensionApi) => {
  api = extensionApi;
  const isZh = api.i18n.getLocale() === 'zh';

  // Load saved state
  state.config = loadConfig();
  state.history = loadHistory();

  // Command: Configure Image Model
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'configureModel',
      title: { en: 'Configure Image Model', zh: '配置图像模型' },
      handler: async () => {
        if (!api) return;
        
        // Show notification to guide user to settings
        api.ui.showNotification(
          isZh 
            ? '请在 设置 → AI 生图 中配置 API' 
            : 'Please configure API in Settings → AI Image',
          'info'
        );
      },
    })
  );

  // Command: Generate Image (uses selected node text or shows hint)
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'generateImage',
      title: { en: 'Generate Image', zh: '生成图片' },
      handler: async () => {
        if (!api) return;

        // Check if API key is configured
        if (!state.config.apiKey) {
          api.ui.showNotification(
            isZh ? '请先在 设置 → AI 生图 中配置 API Key' : 'Please configure API Key in Settings → AI Image first',
            'warning'
          );
          return;
        }

        // Try to use selected node text as prompt
        const selected = api.nodes.getSelected();
        let prompt = '';
        
        if (selected.length > 0 && selected[0].text?.trim()) {
          prompt = selected[0].text.trim();
        } else {
          // No selection or empty text, show hint
          api.ui.showNotification(
            isZh ? '请先选择一个有文本的节点，或右键节点选择"生成图片"' : 'Please select a node with text, or right-click a node and select "Generate Image"',
            'info'
          );
          return;
        }
        
        api.ui.showNotification(isZh ? '正在生成图片...' : 'Generating image...', 'info');

        try {
          const imageUrl = await generateImage(prompt);
          
          // Add to history
          addToHistory({ url: imageUrl, prompt, timestamp: Date.now() });

          // Create node with generated image
          const nodes = api.nodes.getAll();
          const maxX = nodes.length > 0 ? Math.max(...nodes.map(n => n.x)) : 0;
          
          api.nodes.create({
            type: 'normal',
            x: maxX + 300,
            y: 200,
            text: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
            img: imageUrl,
            subtype: 'DATA',
          });

          api.ui.showNotification(isZh ? '图片生成成功！已添加为节点' : 'Image generated! Added as node', 'success');
        } catch (e) {
          const error = e as Error;
          api.ui.showNotification(
            isZh ? `生成失败: ${error.message}` : `Failed: ${error.message}`,
            'error'
          );
        }
      },
    })
  );

  // Command: Generate from Selected Node
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'generateFromNode',
      title: { en: 'Generate Image from Node', zh: '从节点生成图片' },
      handler: async () => {
        if (!api) return;

        // Check if API key is configured
        if (!state.config.apiKey) {
          api.ui.showNotification(
            isZh ? '请先在 设置 → AI 生图 中配置 API Key' : 'Please configure API Key in Settings → AI Image first',
            'warning'
          );
          return;
        }

        const selected = api.nodes.getSelected();
        if (selected.length === 0) {
          api.ui.showNotification(
            isZh ? '请先选择一个节点' : 'Please select a node first',
            'warning'
          );
          return;
        }

        const node = selected[0];
        const prompt = node.text || '';

        if (!prompt.trim()) {
          api.ui.showNotification(
            isZh ? '节点文本为空' : 'Node text is empty',
            'warning'
          );
          return;
        }

        api.ui.showNotification(isZh ? '正在生成图片...' : 'Generating image...', 'info');

        try {
          const imageUrl = await generateImage(prompt);
          
          addToHistory({ url: imageUrl, prompt, timestamp: Date.now() });

          // Update node with image
          api.nodes.update(node.id, { img: imageUrl });

          api.ui.showNotification(isZh ? '图片生成成功！' : 'Image generated!', 'success');
        } catch (e) {
          const error = e as Error;
          api.ui.showNotification(
            isZh ? `生成失败: ${error.message}` : `Failed: ${error.message}`,
            'error'
          );
        }
      },
    })
  );

  // Command: Set API Key
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'setApiKey',
      title: { en: 'Set API Key', zh: '设置 API Key' },
      handler: async () => {
        if (!api) return;
        
        // Guide user to settings
        api.ui.showNotification(
          isZh 
            ? '请在 设置 → AI 生图 中配置 API Key' 
            : 'Please configure API Key in Settings → AI Image',
          'info'
        );
      },
    })
  );

  // Command: Set Provider
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'setProvider',
      title: { en: 'Set Provider', zh: '设置服务商' },
      handler: async () => {
        if (!api) return;

        // Guide user to settings
        api.ui.showNotification(
          isZh 
            ? '请在 设置 → AI 生图 中选择服务商' 
            : 'Please select provider in Settings → AI Image',
          'info'
        );
      },
    })
  );

  // Register context menu for nodes
  context.subscriptions.push(
    api.ui.registerMenuItem({
      id: 'ctx-gen-image',
      title: { en: 'Generate Image', zh: '生成图片' },
      location: 'context.node',
      command: 'meowthink.ai-image-gen.generateFromNode',
      order: 80,
    })
  );

  // Register canvas context menu
  context.subscriptions.push(
    api.ui.registerMenuItem({
      id: 'ctx-new-image',
      title: { en: 'AI Generate Image', zh: 'AI 生成图片' },
      location: 'context.canvas',
      command: 'meowthink.ai-image-gen.generateImage',
      order: 60,
    })
  );

  console.log('[AIImageGen] Extension activated');
};

// ============================================================================
// Extension Deactivation
// ============================================================================

export const deactivate: IExtensionModule['deactivate'] = () => {
  api = null;
  state = { config: { ...DEFAULT_CONFIG }, history: [] };
  console.log('[AIImageGen] Extension deactivated');
};

// ============================================================================
// Public API for Settings UI
// ============================================================================

export function getConfig(): ImageModelConfig {
  return { ...state.config };
}

export function setConfig(config: Partial<ImageModelConfig>): void {
  const newConfig = { ...state.config, ...config };
  
  // Apply provider preset if provider changed
  if (config.provider && config.provider !== state.config.provider) {
    const preset = PROVIDER_PRESETS[config.provider];
    if (preset) {
      Object.assign(newConfig, preset);
    }
  }
  
  saveConfig(newConfig);
}

export function getHistory(): GeneratedImage[] {
  return [...state.history];
}

export function clearHistory(): void {
  saveHistory([]);
}

export default { activate, deactivate } as IExtensionModule;
