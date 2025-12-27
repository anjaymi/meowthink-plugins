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
    model: 'gemini-2.0-flash-exp',
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
      const { fetch: tauri_fetch } = await import('@tauri-apps/plugin-http');
      tauriFetch = tauri_fetch;
    } catch (e) {
      console.warn('[AIImageGen] Tauri HTTP plugin not available');
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
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: prompt }
    ];

    if (referenceImage) {
      const base64Data = referenceImage.split(',')[1];
      const mimeType = referenceImage.split(';')[0].split(':')[1];
      contents.unshift({ inlineData: { mimeType, data: base64Data } });
    }

    const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.0-flash-exp',
      contents: [{ role: 'user', parts: contents }],
      config: { responseModalities: ['image', 'text'] } as unknown as Record<string, unknown>,
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
        
        // Show configuration dialog
        const result = await api.ui.showDialog({
          title: isZh ? '配置图像生成模型' : 'Configure Image Model',
          message: isZh 
            ? `当前配置:\n服务商: ${state.config.provider}\n模型: ${state.config.model}\nAPI Key: ${state.config.apiKey ? '已设置' : '未设置'}\n\n请在扩展设置中修改配置。`
            : `Current config:\nProvider: ${state.config.provider}\nModel: ${state.config.model}\nAPI Key: ${state.config.apiKey ? 'Set' : 'Not set'}\n\nPlease modify in extension settings.`,
          type: 'info',
        });
      },
    })
  );

  // Command: Generate Image
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'generateImage',
      title: { en: 'Generate Image', zh: '生成图片' },
      handler: async () => {
        if (!api) return;

        // Simple prompt input via dialog
        const promptResult = await api.ui.showDialog({
          title: isZh ? 'AI 生图' : 'AI Image Generation',
          message: isZh ? '请输入图片描述提示词：' : 'Enter image description prompt:',
          type: 'info',
          buttons: [isZh ? '取消' : 'Cancel', isZh ? '生成' : 'Generate'],
        });

        if (promptResult.cancelled || promptResult.button === 0) return;

        // For now, use a simple prompt - in future could add input field
        const prompt = isZh ? '一只可爱的猫咪' : 'A cute cat';
        
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
        
        // Note: In a real implementation, this would open a proper settings UI
        // For now, show info about current config
        api.ui.showNotification(
          isZh 
            ? '请在扩展存储中设置 API Key (meowthink.ai-image-gen.ai_image_gen_config)' 
            : 'Please set API Key in extension storage',
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

        const result = await api.ui.showDialog({
          title: isZh ? '选择服务商' : 'Select Provider',
          message: isZh 
            ? '可用服务商:\n1. Gemini (Google)\n2. SiliconFlow (硅基流动)\n3. OpenRouter\n4. Volcano (火山引擎)\n5. Custom (自定义)'
            : 'Available providers:\n1. Gemini (Google)\n2. SiliconFlow\n3. OpenRouter\n4. Volcano\n5. Custom',
          type: 'info',
        });
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
