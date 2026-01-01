/**
 * AI 角色工坊 - AI 生成 Hook
 */

import { useCallback } from 'react';
import type { 
  CharacterInput,
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
} from '../types';
import {
  buildDialoguePrompt,
  buildVariantPrompt,
  buildWorldbuildingPrompt,
  buildNamingPrompt,
  buildBackstoryPrompt,
} from '../prompts';

// AI 服务调用（复用应用的 AI 配置）
async function callAI(prompt: string): Promise<string> {
  const response = await fetch('http://localhost:23333/api/chat/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      max_tokens: 2000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error('AI 服务调用失败');
  }

  const data = await response.json();
  return data.content || data.text || '';
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

export function useAIGenerate() {
  // 生成对话
  const generateDialogue = useCallback(async (
    character: CharacterInput,
    options: DialogueOptions
  ): Promise<DialogueResult> => {
    const prompt = buildDialoguePrompt(character, options);
    const response = await callAI(prompt);
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
  }, []);

  // 生成变体
  const generateVariant = useCallback(async (
    character: CharacterInput,
    options: VariantOptions
  ): Promise<VariantResult> => {
    const prompt = buildVariantPrompt(character, options);
    const response = await callAI(prompt);
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
  }, []);

  // 生成世界观
  const generateWorldbuilding = useCallback(async (
    character: CharacterInput,
    options: WorldbuildingOptions
  ): Promise<WorldbuildingResult> => {
    const prompt = buildWorldbuildingPrompt(character, options);
    const response = await callAI(prompt);
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
  }, []);

  // 生成名字
  const generateNaming = useCallback(async (
    character: CharacterInput,
    options: NamingOptions
  ): Promise<NamingResult> => {
    const prompt = buildNamingPrompt(character, options);
    const response = await callAI(prompt);
    const parsed = parseJSONResponse<{ names: Array<{ name: string; meaning?: string; origin?: string }> }>(response);

    return {
      id: generateId(),
      module: 'naming',
      content: response,
      timestamp: Date.now(),
      characterId: character.id,
      names: parsed.names,
    };
  }, []);

  // 生成背景故事
  const generateBackstory = useCallback(async (
    character: CharacterInput,
    options: BackstoryOptions
  ): Promise<BackstoryResult> => {
    const prompt = buildBackstoryPrompt(character, options);
    const response = await callAI(prompt);
    const parsed = parseJSONResponse<{ sections: Array<{ title: string; content: string; period?: string }> }>(response);

    return {
      id: generateId(),
      module: 'backstory',
      content: response,
      timestamp: Date.now(),
      characterId: character.id,
      sections: parsed.sections,
    };
  }, []);

  return {
    generateDialogue,
    generateVariant,
    generateWorldbuilding,
    generateNaming,
    generateBackstory,
  };
}
