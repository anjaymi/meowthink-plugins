/**
 * AI 角色工坊 - AI 生成 Hook
 */

import { useCallback, useState } from 'react';
import { storage } from '../../../../utils/storage';
import type { 
  CharacterInput,
  CharacterData,
  CharacterStyle,
  CharacterPersonality,
  CharacterAgent,
  DialogueOptions,
  VariantOptions,
  WorldbuildingOptions,
  NamingOptions,
  BackstoryOptions,
  DialogueResult,
  VariantResult,
  WorldbuildingResult,
  NamingResult,
  BackstoryResult,
  GeneratedName,
} from '../types';
import {
  buildDialoguePrompt,
  buildVariantPrompt,
  buildWorldbuildingPrompt,
  buildNamingPrompt,
  buildBackstoryPrompt,
} from '../prompts';

// API 配置类型
interface ApiConfig {
  key: string;
  url: string;
  model: string;
  provider: string;
  name?: string;
}

// 获取所有可用的 API 配置
export async function getAvailableApiConfigs(): Promise<{ configs: ApiConfig[]; activeIndex: number }> {
  try {
    const config = await storage.get<any>('ef_config');
    if (config?.apiPool && Array.isArray(config.apiPool)) {
      return {
        configs: config.apiPool.map((c: any, i: number) => ({
          key: c.key || '',
          url: c.url || '',
          model: c.model || 'gpt-4o',
          provider: c.provider || 'openai',
          name: c.name || `配置 ${i + 1}`,
        })),
        activeIndex: config.activeApiIndex || 0,
      };
    }
    // 兼容旧配置格式
    if (config?.key) {
      return {
        configs: [{
          key: config.key,
          url: config.url || '',
          model: config.model || 'gpt-4o',
          provider: config.provider || 'openai',
          name: '默认配置',
        }],
        activeIndex: 0,
      };
    }
  } catch (e) {
    console.error('Failed to get API configs:', e);
  }
  return { configs: [], activeIndex: 0 };
}

// AI 服务调用（复用应用的 AI 配置，从 IndexedDB 读取）
// 支持传入自定义模型覆盖
async function callAI(prompt: string, overrideModel?: string): Promise<string> {
  // 从 IndexedDB 获取用户配置的 AI 设置
  let apiKey = '';
  let baseUrl = '';
  let model = 'gpt-4o';
  let provider = 'openai';
  
  try {
    const config = await storage.get<any>('ef_config');
    if (config) {
      // 从 apiPool 获取当前激活的配置
      const activeIndex = config.activeApiIndex || 0;
      const activeConfig = config.apiPool?.[activeIndex];
      if (activeConfig) {
        apiKey = activeConfig.key || '';
        baseUrl = activeConfig.url || '';
        model = overrideModel || activeConfig.model || config.model || 'gpt-4o';
        provider = activeConfig.provider || config.provider || 'openai';
      } else {
        apiKey = config.key || '';
        baseUrl = config.url || '';
        model = overrideModel || config.model || 'gpt-4o';
        provider = config.provider || 'openai';
      }
    }
  } catch (e) {
    console.error('Failed to get config from IndexedDB:', e);
  }
  
  if (!apiKey) {
    throw new Error('未配置 AI API 密钥，请先在设置中配置');
  }

  const response = await fetch('http://localhost:23333/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: prompt }
      ],
      model,
      provider,
      api_key: apiKey,
      base_url: baseUrl || undefined,
      max_tokens: 2000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.detail || errorData.message || errorData.error;
    
    // 检查是否是配置相关错误
    if (response.status === 401 || response.status === 403) {
      throw new Error('API 密钥无效或已过期，请检查 AI 设置');
    }
    if (errorMsg?.includes('key') || errorMsg?.includes('API')) {
      throw new Error('API 配置错误：' + errorMsg);
    }
    
    throw new Error(errorMsg || 'AI 服务调用失败');
  }

  const data = await response.json();
  return data.content || '';
}

// 解析 JSON 响应
function parseJSONResponse<T>(text: string): T {
  // 尝试提取 JSON 块
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                    text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('无法解析 AI 响应');
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr);
}

// 生成唯一 ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// 存储当前选择的模型（模块级变量）
let currentOverrideModel: string | undefined;

// 设置覆盖模型
export function setOverrideModel(model: string | undefined) {
  currentOverrideModel = model;
}

export function useAIGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);

  // 生成对话
  const generateDialogue = useCallback(async (
    character: CharacterInput,
    options: DialogueOptions
  ): Promise<DialogueResult> => {
    setIsGenerating(true);
    try {
      const prompt = buildDialoguePrompt(character, options);
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<{ dialogues: Array<{ text: string; emotion?: string }> }>(response);

      return {
        id: generateId(),
        module: 'dialogue',
        content: response,
        timestamp: Date.now(),
        characterId: character.id,
        dialogues: parsed.dialogues.map(d => ({
          speaker: character.name,
          text: d.text,
          emotion: d.emotion,
        })),
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成变体
  const generateVariant = useCallback(async (
    character: CharacterInput,
    options: VariantOptions
  ): Promise<VariantResult> => {
    setIsGenerating(true);
    try {
      const prompt = buildVariantPrompt(character, options);
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<{ variants: Array<{ name: string; type: string; description: string; changes: string[] }> }>(response);

      return {
        id: generateId(),
        module: 'variant',
        content: response,
        timestamp: Date.now(),
        characterId: character.id,
        variants: parsed.variants.map(v => ({
          id: generateId(),
          ...v,
        })),
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成世界观
  const generateWorldbuilding = useCallback(async (
    character: CharacterInput,
    options: WorldbuildingOptions
  ): Promise<WorldbuildingResult> => {
    setIsGenerating(true);
    try {
      const prompt = buildWorldbuildingPrompt(character, options);
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<{ elements: Array<{ type: string; name: string; description: string; relatedTo?: string[] }> }>(response);

      return {
        id: generateId(),
        module: 'worldbuilding',
        content: response,
        timestamp: Date.now(),
        characterId: character.id,
        elements: parsed.elements.map(e => ({
          id: generateId(),
          ...e,
        })),
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成名字（原始版本）
  const generateNaming = useCallback(async (
    character: CharacterInput,
    options: NamingOptions
  ): Promise<NamingResult> => {
    setIsGenerating(true);
    try {
      const prompt = buildNamingPrompt(character, options);
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<{ names: Array<{ name: string; meaning?: string; origin?: string }> }>(response);

      return {
        id: generateId(),
        module: 'naming',
        content: response,
        timestamp: Date.now(),
        characterId: character.id,
        names: parsed.names,
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成名字（简化版本，供 IntegratedPanel 使用）
  const generateNames = useCallback(async (
    options: NamingOptions,
    style?: Partial<CharacterStyle>,
    isZh?: boolean
  ): Promise<{ names: GeneratedName[] }> => {
    setIsGenerating(true);
    try {
      // 根据语言和文化背景构建提示词
      const cultureMap: Record<string, { zh: string; en: string; examples: { zh: string; en: string } }> = {
        chinese: { 
          zh: '中国/华人', 
          en: 'Chinese',
          examples: { zh: '如：李明、王雪、陈思远、林晓月', en: 'e.g., Li Ming, Wang Xue, Chen Siyuan' }
        },
        japanese: { 
          zh: '日本', 
          en: 'Japanese',
          examples: { zh: '如：佐藤樱、田中悠斗、山本美咲、�的木健太', en: 'e.g., Sakura Sato, Yuto Tanaka, Misaki Yamamoto' }
        },
        korean: { 
          zh: '韩国', 
          en: 'Korean',
          examples: { zh: '如：金秀贤、朴智妍、李俊浩、崔恩熙', en: 'e.g., Kim Soo-hyun, Park Ji-yeon, Lee Jun-ho' }
        },
        western: { 
          zh: '西方/欧美', 
          en: 'Western',
          examples: { zh: '如：Alexander、Emma、William、Sophia', en: 'e.g., Alexander, Emma, William, Sophia' }
        },
        russian: { 
          zh: '俄罗斯', 
          en: 'Russian',
          examples: { zh: '如：伊万·彼得罗夫、娜塔莎、德米特里、安娜斯塔西娅', en: 'e.g., Ivan Petrov, Natasha, Dmitri, Anastasia' }
        },
        arabic: { 
          zh: '阿拉伯', 
          en: 'Arabic',
          examples: { zh: '如：穆罕默德、法蒂玛、阿里、莱拉', en: 'e.g., Mohammed, Fatima, Ali, Layla' }
        },
        indian: { 
          zh: '印度', 
          en: 'Indian',
          examples: { zh: '如：阿尔琼、普里雅、拉杰什、阿妮塔', en: 'e.g., Arjun, Priya, Rajesh, Anita' }
        },
        latin: { 
          zh: '拉丁美洲', 
          en: 'Latin American',
          examples: { zh: '如：卡洛斯、玛丽亚、迭戈、伊莎贝拉', en: 'e.g., Carlos, Maria, Diego, Isabella' }
        },
        african: { 
          zh: '非洲', 
          en: 'African',
          examples: { zh: '如：阿马杜、阿伊莎、科菲、恩迪迪', en: 'e.g., Amadou, Aisha, Kofi, Ndidi' }
        },
        southeast_asian: { 
          zh: '东南亚', 
          en: 'Southeast Asian',
          examples: { zh: '如：阮文明、素帕妮、林伟杰、玛丽亚', en: 'e.g., Nguyen Van Minh, Supanee, Lim Wei Jie' }
        },
        nordic: { 
          zh: '北欧', 
          en: 'Nordic',
          examples: { zh: '如：埃里克、英格丽、奥拉夫、弗蕾雅', en: 'e.g., Erik, Ingrid, Olaf, Freya' }
        },
        greek: { 
          zh: '希腊', 
          en: 'Greek',
          examples: { zh: '如：尼科斯、海伦娜、亚历山德罗斯、索菲亚', en: 'e.g., Nikos, Helena, Alexandros, Sofia' }
        },
        fantasy: { 
          zh: '奇幻/架空', 
          en: 'Fantasy',
          examples: { zh: '如：艾琳娜、塞拉斯、莉莉安、阿尔文', en: 'e.g., Elara, Silas, Lyrian, Aldric' }
        },
        scifi: { 
          zh: '科幻/未来', 
          en: 'Sci-Fi',
          examples: { zh: '如：诺娃、凯恩、艾瑞斯、泽恩', en: 'e.g., Nova, Kane, Iris, Zane' }
        },
        custom: { 
          zh: '自定义', 
          en: 'Custom',
          examples: { zh: '', en: '' }
        },
      };
      const genderMap: Record<string, { zh: string; en: string }> = {
        male: { zh: '男性', en: 'male' },
        female: { zh: '女性', en: 'female' },
        neutral: { zh: '中性/不限', en: 'neutral' },
      };
      
      const cultureInfo = cultureMap[options.culture || 'fantasy'];
      const cultureName = cultureInfo?.[isZh ? 'zh' : 'en'] || options.culture;
      const cultureExamples = cultureInfo?.examples?.[isZh ? 'zh' : 'en'] || '';
      const genderName = genderMap[options.gender || 'neutral']?.[isZh ? 'zh' : 'en'] || options.gender;
      const shouldTranslate = options.translateToChinese !== false; // 默认翻译
      
      // 翻译提示
      const translateHint = shouldTranslate && options.culture !== 'chinese'
        ? (isZh 
            ? '\n- 【重要】所有名字必须翻译成中文显示（如：伊万·彼得罗夫，不是 Ivan Petrov）' 
            : '\n- 【Important】All names must be displayed in Chinese translation')
        : '';
      
      const prompt = isZh 
        ? `请为一个${style?.genre || '奇幻'}风格的角色生成${options.count || 6}个【真实人名】。

重要要求：
- 必须是真实的人名（姓名），不是称号、代号、绰号或描述性词语
- 文化背景：${cultureName}${cultureExamples ? `（${cultureExamples}）` : ''}
- 性别倾向：${genderName}${translateHint}
${style?.subGenre ? `- 子风格：${style.subGenre}` : ''}
- 名字要有真实感，像真人会取的名字
- 中文名字应该是2-3个字的姓名格式
- 日文名字应该包含姓和名
- 西方名字应该是常见的英文名
- 奇幻名字可以有创意但仍要像人名，不是物品或概念

错误示例（不要生成这类）：烬生、荒行者、尘羽、辉光、韧痕、墟望
正确示例：李明、佐藤樱、Alexander、艾琳娜

请以 JSON 格式返回：
{
  "names": [
    { "name": "完整姓名", "meaning": "名字的含义", "origin": "名字来源说明" }
  ]
}`
        : `Generate ${options.count || 6} REAL CHARACTER NAMES for a ${style?.genre || 'fantasy'} style character.

Important requirements:
- Must be actual names (first name + surname if applicable), NOT titles, codenames, nicknames, or descriptive words
- Cultural background: ${cultureName}${cultureExamples ? ` (${cultureExamples})` : ''}
- Gender preference: ${genderName}
${style?.subGenre ? `- Sub-style: ${style.subGenre}` : ''}
- Names should feel like real names a person would have
- Chinese names should be 2-3 characters in surname + given name format
- Japanese names should include family name and given name
- Western names should be common English/European names
- Fantasy names can be creative but should still sound like personal names, not objects or concepts

Wrong examples (do NOT generate these): Ember, Wanderer, Dustfeather, Radiance
Correct examples: Li Ming, Sakura Sato, Alexander, Elara Nightwind

Return in JSON format:
{
  "names": [
    { "name": "Full Name", "meaning": "Meaning of the name", "origin": "Origin explanation" }
  ]
}`;
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<{ names: GeneratedName[] }>(response);
      return { names: parsed.names };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成性格
  const generatePersonality = useCallback(async (
    character: Partial<CharacterData>
  ): Promise<Partial<CharacterPersonality>> => {
    setIsGenerating(true);
    try {
      const prompt = `请为以下角色生成性格设定：
角色名：${character.name || '未命名'}
风格：${character.style?.genre || '奇幻'}${character.style?.subGenre ? ` / ${character.style.subGenre}` : ''}
标签：${(character.tags || []).join(', ') || '无'}
外观：${character.appearance?.description || '未设定'}

请以 JSON 格式返回，格式如下：
{
  "traits": ["特质1", "特质2", "特质3"],
  "description": "性格描述",
  "speechStyle": "说话风格",
  "quirks": ["小癖好1", "小癖好2"]
}`;
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<Partial<CharacterPersonality>>(response);
      return parsed;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成智能体配置
  const generateAgent = useCallback(async (
    character: Partial<CharacterData>
  ): Promise<CharacterAgent> => {
    setIsGenerating(true);
    try {
      const prompt = `请为以下角色生成 AI 智能体配置：
角色名：${character.name || '未命名'}
风格：${character.style?.genre || '奇幻'}
性格：${character.personality?.description || '未设定'}
说话风格：${character.personality?.speechStyle || '未设定'}
背景：${character.backstory?.fullStory || '未设定'}

请以 JSON 格式返回，格式如下：
{
  "systemPrompt": "系统提示词，描述角色如何扮演",
  "sampleDialogues": ["示例对话1", "示例对话2"],
  "voiceStyle": "语音风格描述"
}`;
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<{ systemPrompt: string; sampleDialogues: string[]; voiceStyle?: string }>(response);
      return {
        enabled: true,
        systemPrompt: parsed.systemPrompt,
        sampleDialogues: parsed.sampleDialogues || [],
        voiceStyle: parsed.voiceStyle,
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成背景故事
  const generateBackstory = useCallback(async (
    character: CharacterInput | Partial<CharacterData>,
    options: BackstoryOptions
  ): Promise<BackstoryResult> => {
    setIsGenerating(true);
    try {
      const prompt = buildBackstoryPrompt(character as CharacterInput, options);
      const response = await callAI(prompt, currentOverrideModel);
      const parsed = parseJSONResponse<{ sections: Array<{ title: string; content: string; period?: string }> }>(response);

      return {
        id: generateId(),
        module: 'backstory',
        content: response,
        timestamp: Date.now(),
        characterId: (character as CharacterInput).id || '',
        sections: parsed.sections,
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成外观描述（AI 扩写）
  const generateAppearance = useCallback(async (
    character: Partial<CharacterData>,
    isZh?: boolean
  ): Promise<string> => {
    setIsGenerating(true);
    try {
      const { name, style, tags, appearance } = character;
      const genderMap: Record<string, { zh: string; en: string }> = {
        male: { zh: '男性', en: 'male' },
        female: { zh: '女性', en: 'female' },
        other: { zh: '其他', en: 'other' },
        unknown: { zh: '未设定', en: 'unknown' },
      };
      const genderText = genderMap[appearance?.gender || 'unknown']?.[isZh ? 'zh' : 'en'] || '';
      
      const prompt = isZh
        ? `请为以下角色生成详细的外观描述（约100-150字）：
角色名：${name || '未命名'}
风格：${style?.genre || '奇幻'}${style?.subGenre ? ` / ${style.subGenre}` : ''}
性别：${genderText}
标签：${(tags || []).join('、') || '无'}
已有信息：
- 发色：${appearance?.hairColor || '未设定'}
- 瞳色：${appearance?.eyeColor || '未设定'}
- 年龄：${appearance?.age || '未设定'}
- 服装：${appearance?.clothing || '未设定'}

请根据以上信息，生成一段生动、具体的外观描述，包括整体气质、面部特征、身材体型、服装细节等。直接输出描述文本，不要加任何前缀或解释。`
        : `Generate a detailed appearance description (about 100-150 words) for the following character:
Name: ${name || 'Unnamed'}
Style: ${style?.genre || 'Fantasy'}${style?.subGenre ? ` / ${style.subGenre}` : ''}
Gender: ${genderText}
Tags: ${(tags || []).join(', ') || 'None'}
Existing info:
- Hair: ${appearance?.hairColor || 'Not set'}
- Eyes: ${appearance?.eyeColor || 'Not set'}
- Age: ${appearance?.age || 'Not set'}
- Clothing: ${appearance?.clothing || 'Not set'}

Based on the above, generate a vivid and specific appearance description including overall aura, facial features, body type, and clothing details. Output the description text directly without any prefix or explanation.`;

      const response = await callAI(prompt, currentOverrideModel);
      // 直接返回文本，去除可能的引号包裹
      return response.trim().replace(/^["']|["']$/g, '');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 生成/优化单个外观字段
  const generateAppearanceField = useCallback(async (
    field: string,
    currentValue: string,
    character: Partial<CharacterData>,
    isZh?: boolean
  ): Promise<string> => {
    setIsGenerating(true);
    try {
      const { name, style, tags, appearance } = character;
      const fieldLabels: Record<string, { zh: string; en: string }> = {
        age: { zh: '年龄', en: 'age' },
        hairColor: { zh: '发色/发型', en: 'hair color and style' },
        eyeColor: { zh: '瞳色', en: 'eye color' },
        clothing: { zh: '服装', en: 'clothing' },
        gender: { zh: '性别', en: 'gender' },
      };
      const fieldLabel = fieldLabels[field]?.[isZh ? 'zh' : 'en'] || field;
      const isRefine = !!currentValue;
      
      const prompt = isZh
        ? `请为以下角色${isRefine ? '优化' : '生成'}${fieldLabel}设定：
角色名：${name || '未命名'}
风格：${style?.genre || '奇幻'}${style?.subGenre ? ` / ${style.subGenre}` : ''}
标签：${(tags || []).slice(0, 5).join('、') || '无'}
${appearance?.gender ? `性别：${appearance.gender}` : ''}
${isRefine ? `当前${fieldLabel}：${currentValue}` : ''}

${isRefine 
  ? `请优化上述${fieldLabel}，使其更加生动具体，符合角色风格。` 
  : `请为该角色生成一个合适的${fieldLabel}设定。`}
直接输出结果，不要加任何前缀或解释。${field === 'age' ? '格式如：25岁' : ''}${field === 'clothing' ? '简洁描述，20字以内。' : ''}`
        : `${isRefine ? 'Refine' : 'Generate'} ${fieldLabel} for this character:
Name: ${name || 'Unnamed'}
Style: ${style?.genre || 'Fantasy'}${style?.subGenre ? ` / ${style.subGenre}` : ''}
Tags: ${(tags || []).slice(0, 5).join(', ') || 'None'}
${appearance?.gender ? `Gender: ${appearance.gender}` : ''}
${isRefine ? `Current ${fieldLabel}: ${currentValue}` : ''}

${isRefine 
  ? `Refine the ${fieldLabel} to be more vivid and fitting for the character style.` 
  : `Generate a suitable ${fieldLabel} for this character.`}
Output the result directly without any prefix.${field === 'clothing' ? ' Keep it concise, under 30 words.' : ''}`;

      const response = await callAI(prompt, currentOverrideModel);
      return response.trim().replace(/^["']|["']$/g, '');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generateDialogue,
    generateVariant,
    generateWorldbuilding,
    generateNaming,
    generateNames,
    generatePersonality,
    generateAgent,
    generateBackstory,
    generateAppearance,
    generateAppearanceField,
  };
}
