/**
 * AI 角色工坊 - Prompt 模板
 */

import type { 
  CharacterInput, 
  DialogueOptions, 
  VariantOptions, 
  WorldbuildingOptions,
  NamingOptions,
  BackstoryOptions 
} from './types';

// 角色信息格式化
const formatCharacter = (char: CharacterInput): string => {
  const parts = [`角色名: ${char.name}`];
  if (char.description) parts.push(`描述: ${char.description}`);
  if (char.personality) parts.push(`性格: ${char.personality}`);
  if (char.appearance) parts.push(`外貌: ${char.appearance}`);
  if (char.background) parts.push(`背景: ${char.background}`);
  if (char.tags?.length) parts.push(`标签: ${char.tags.join(', ')}`);
  return parts.join('\n');
};

// 对话生成 Prompt
export const buildDialoguePrompt = (char: CharacterInput, options: DialogueOptions): string => {
  const styleMap = {
    casual: '日常轻松',
    formal: '正式严肃',
    emotional: '情感丰富',
    humorous: '幽默风趣',
  };

  let prompt = `请为以下角色生成 ${options.count} 条符合其性格的台词。

${formatCharacter(char)}

要求:
- 风格: ${styleMap[options.style]}
- 台词要体现角色的性格特点
- 每条台词都要有情感标注`;

  if (options.scenario) {
    prompt += `\n- 场景: ${options.scenario}`;
  }

  if (options.targetCharacter) {
    prompt += `\n- 对话对象: ${options.targetCharacter.name}`;
  }

  prompt += `

请以 JSON 格式返回:
{
  "dialogues": [
    { "text": "台词内容", "emotion": "情感" }
  ]
}`;

  return prompt;
};

// 变体生成 Prompt
export const buildVariantPrompt = (char: CharacterInput, options: VariantOptions): string => {
  const typeMap = {
    costume: '服装/造型变体',
    age: '不同年龄阶段',
    timeline: 'IF线/平行世界',
    style: '不同艺术风格',
    custom: '自定义变体',
  };

  let prompt = `请为以下角色生成 ${options.count} 个变体版本。

${formatCharacter(char)}

变体类型: ${typeMap[options.type]}`;

  if (options.type === 'custom' && options.customPrompt) {
    prompt += `\n自定义要求: ${options.customPrompt}`;
  }

  prompt += `

要求:
- 保持角色核心特征
- 详细描述变化点
- 每个变体要有独特性

请以 JSON 格式返回:
{
  "variants": [
    {
      "name": "变体名称",
      "type": "变体类型",
      "description": "详细描述",
      "changes": ["变化点1", "变化点2"]
    }
  ]
}`;

  return prompt;
};

// 世界观扩展 Prompt
export const buildWorldbuildingPrompt = (char: CharacterInput, options: WorldbuildingOptions): string => {
  const aspectMap = {
    faction: '势力/组织',
    location: '地点/场所',
    history: '历史事件',
    culture: '文化习俗',
    relationship: '人物关系',
  };

  const depthMap = {
    brief: '简要概述',
    detailed: '详细描述',
    comprehensive: '全面深入',
  };

  const prompt = `基于以下角色，扩展相关的世界观设定。

${formatCharacter(char)}

扩展方向: ${aspectMap[options.aspect]}
详细程度: ${depthMap[options.depth]}

要求:
- 与角色背景相关联
- 逻辑自洽
- 有创意但合理

请以 JSON 格式返回:
{
  "elements": [
    {
      "type": "类型",
      "name": "名称",
      "description": "描述",
      "relatedTo": ["相关元素"]
    }
  ]
}`;

  return prompt;
};

// 名字生成 Prompt
export const buildNamingPrompt = (char: CharacterInput, options: NamingOptions): string => {
  const cultureMap = {
    chinese: '中文名字',
    japanese: '日文名字',
    western: '西方名字',
    fantasy: '奇幻风格名字',
    scifi: '科幻风格名字',
    custom: '自定义风格',
  };

  const genderMap = {
    male: '男性',
    female: '女性',
    neutral: '中性',
  };

  let prompt = `请生成 ${options.count} 个适合以下角色的名字。

${formatCharacter(char)}

名字风格: ${cultureMap[options.culture]}`;

  if (options.gender) {
    prompt += `\n性别倾向: ${genderMap[options.gender]}`;
  }

  if (options.style) {
    prompt += `\n额外风格要求: ${options.style}`;
  }

  prompt += `

要求:
- 名字要与角色气质相符
- 提供名字含义解释
- 注明名字来源/文化背景

请以 JSON 格式返回:
{
  "names": [
    {
      "name": "名字",
      "meaning": "含义",
      "origin": "来源"
    }
  ]
}`;

  return prompt;
};

// 背景故事生成 Prompt
export const buildBackstoryPrompt = (char: CharacterInput, options: BackstoryOptions): string => {
  const focusMap = {
    origin: '出身与成长',
    motivation: '动机与目标',
    secret: '秘密与隐情',
    trauma: '创伤与阴影',
    achievement: '成就与荣耀',
    full: '完整人生故事',
  };

  const toneMap = {
    tragic: '悲剧色彩',
    heroic: '英雄史诗',
    mysterious: '神秘悬疑',
    comedic: '轻松幽默',
    neutral: '客观中性',
  };

  const lengthMap = {
    short: '简短（100-200字）',
    medium: '中等（300-500字）',
    long: '详细（800-1000字）',
  };

  const prompt = `请为以下角色生成背景故事。

${formatCharacter(char)}

故事焦点: ${focusMap[options.focus]}
叙事语调: ${toneMap[options.tone]}
故事长度: ${lengthMap[options.length]}

要求:
- 与角色现有设定一致
- 故事要有起承转合
- 细节丰富，有画面感

请以 JSON 格式返回:
{
  "sections": [
    {
      "title": "章节标题",
      "content": "章节内容",
      "period": "时间段（可选）"
    }
  ]
}`;

  return prompt;
};
