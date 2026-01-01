/**
 * Character Fusion Plugin - Export Functions
 * 导出功能 - 将角色导出为各种格式
 */

import {
  CharacterTemplate,
  ExportFormat,
  ExportOptions,
  NodeSubtype,
  StyleCategory,
} from './types';
import { createTagMappingConfig, characterToNodes, characterToSingleNode } from './tagMapping';
import { STYLE_CATEGORIES, RARITY_NAMES } from './constants';

// ============================================================================
// Types
// ============================================================================

/** 节点数据（简化版） */
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

// ============================================================================
// JSON Export
// ============================================================================

/** 导出为 JSON */
export function exportToJSON(
  character: CharacterTemplate,
  options: { pretty?: boolean } = {}
): string {
  const { pretty = true } = options;
  return pretty ? JSON.stringify(character, null, 2) : JSON.stringify(character);
}

/** 批量导出为 JSON */
export function exportMultipleToJSON(
  characters: CharacterTemplate[],
  options: { pretty?: boolean; asArray?: boolean } = {}
): string {
  const { pretty = true, asArray = true } = options;
  
  if (asArray) {
    return pretty ? JSON.stringify(characters, null, 2) : JSON.stringify(characters);
  }
  
  // 导出为对象，以 ID 为键
  const obj: Record<string, CharacterTemplate> = {};
  for (const char of characters) {
    obj[char.id] = char;
  }
  return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
}

// ============================================================================
// Markdown Export
// ============================================================================

/** 导出为 Markdown */
export function exportToMarkdown(
  character: CharacterTemplate,
  options: { language?: 'zh' | 'en'; includeMetadata?: boolean } = {}
): string {
  const { language = 'zh', includeMetadata = false } = options;
  const isZh = language === 'zh';
  
  const name = isZh 
    ? (character.name.zh || character.name.en || 'Unknown')
    : (character.name.en || character.name.zh || 'Unknown');
  
  const categoryInfo = STYLE_CATEGORIES[character.category];
  const categoryName = isZh ? categoryInfo.zh : categoryInfo.en;
  
  const lines: string[] = [
    `# ${name}`,
    '',
    `**${isZh ? '风格分类' : 'Category'}:** ${categoryName}`,
  ];
  
  if (character.rarity) {
    const rarityName = RARITY_NAMES[character.rarity];
    lines.push(`**${isZh ? '稀有度' : 'Rarity'}:** ${'⭐'.repeat(character.rarity)} (${isZh ? rarityName.zh : rarityName.en})`);
  }
  
  if (character.element) {
    lines.push(`**${isZh ? '元素' : 'Element'}:** ${character.element}`);
  }
  
  if (character.role) {
    lines.push(`**${isZh ? '职业' : 'Role'}:** ${character.role}`);
  }
  
  lines.push('');
  
  // 核心特征
  if (character.lore) {
    lines.push(`## ${isZh ? '背景设定' : 'Lore'}`);
    lines.push('');
    lines.push(character.lore);
    lines.push('');
  }
  
  if (character.medium) {
    lines.push(`## ${isZh ? '介质/本质' : 'Medium'}`);
    lines.push('');
    lines.push(character.medium);
    lines.push('');
  }
  
  if (character.aesthetic) {
    lines.push(`## ${isZh ? '美学风格' : 'Aesthetic'}`);
    lines.push('');
    lines.push(character.aesthetic);
    lines.push('');
  }
  
  if (character.inspiration) {
    lines.push(`## ${isZh ? '灵感来源' : 'Inspiration'}`);
    lines.push('');
    lines.push(character.inspiration);
    lines.push('');
  }
  
  if (character.quote) {
    lines.push(`## ${isZh ? '角色语录' : 'Quote'}`);
    lines.push('');
    lines.push(`> ${character.quote}`);
    lines.push('');
  }
  
  if (character.positioning && character.positioning.length > 0) {
    lines.push(`## ${isZh ? '定位标签' : 'Positioning'}`);
    lines.push('');
    lines.push(character.positioning.map(p => `- ${p}`).join('\n'));
    lines.push('');
  }
  
  if (character.tags && character.tags.length > 0) {
    lines.push(`## ${isZh ? '标签' : 'Tags'}`);
    lines.push('');
    lines.push(character.tags.map(t => `\`${t}\``).join(' '));
    lines.push('');
  }
  
  // 元数据
  if (includeMetadata) {
    lines.push('---');
    lines.push('');
    lines.push(`**ID:** \`${character.id}\``);
    if (character.createdAt) {
      lines.push(`**${isZh ? '创建时间' : 'Created'}:** ${new Date(character.createdAt).toLocaleString()}`);
    }
    if (character.isGenerated) {
      lines.push(`**${isZh ? '来源' : 'Source'}:** ${isZh ? 'AI 生成' : 'AI Generated'}`);
    }
    if (character.sourceCharacters && character.sourceCharacters.length > 0) {
      lines.push(`**${isZh ? '源角色' : 'Source Characters'}:** ${character.sourceCharacters.join(', ')}`);
    }
  }
  
  return lines.join('\n');
}

/** 批量导出为 Markdown */
export function exportMultipleToMarkdown(
  characters: CharacterTemplate[],
  options: { language?: 'zh' | 'en'; includeMetadata?: boolean } = {}
): string {
  return characters
    .map(char => exportToMarkdown(char, options))
    .join('\n\n---\n\n');
}

// ============================================================================
// Node Export
// ============================================================================

/** 导出为单个节点 */
export function exportToNode(
  character: CharacterTemplate,
  options: {
    includeAvatar?: boolean;
    language?: 'zh' | 'en';
    x?: number;
    y?: number;
  } = {}
): NodeData {
  return characterToSingleNode(character, options);
}

/** 导出为节点组 */
export function exportToNodeGroup(
  character: CharacterTemplate,
  options: {
    includeAvatar?: boolean;
    language?: 'zh' | 'en';
    useTagMapping?: boolean;
    startX?: number;
    startY?: number;
  } = {}
): NodeData[] {
  const { useTagMapping = true, ...restOptions } = options;
  
  const mapping = useTagMapping 
    ? createTagMappingConfig(character.category)
    : undefined;
  
  return characterToNodes(character, mapping, restOptions);
}

/** 批量导出为节点 */
export function exportMultipleToNodes(
  characters: CharacterTemplate[],
  options: {
    includeAvatar?: boolean;
    language?: 'zh' | 'en';
    asGroups?: boolean;
    useTagMapping?: boolean;
    spacing?: number;
  } = {}
): NodeData[] {
  const { asGroups = false, spacing = 400, ...restOptions } = options;
  
  const allNodes: NodeData[] = [];
  let currentX = 0;
  
  for (const char of characters) {
    if (asGroups) {
      const nodes = exportToNodeGroup(char, { ...restOptions, startX: currentX, startY: 0 });
      allNodes.push(...nodes);
      currentX += spacing;
    } else {
      const node = exportToNode(char, { ...restOptions, x: currentX, y: 0 });
      allNodes.push(node);
      currentX += spacing / 2;
    }
  }
  
  return allNodes;
}

// ============================================================================
// Universal Export
// ============================================================================

/** 通用导出函数 */
export function exportCharacter(
  character: CharacterTemplate,
  options: ExportOptions
): string | NodeData | NodeData[] {
  const { format, includeAvatar, useTagMapping, language } = options;
  
  switch (format) {
    case 'json':
      return exportToJSON(character);
    
    case 'markdown':
      return exportToMarkdown(character, { language, includeMetadata: true });
    
    case 'node':
      return exportToNode(character, { includeAvatar, language });
    
    case 'nodeGroup':
      return exportToNodeGroup(character, { includeAvatar, language, useTagMapping });
    
    default:
      return exportToJSON(character);
  }
}

/** 批量通用导出 */
export function exportCharacters(
  characters: CharacterTemplate[],
  options: ExportOptions
): string | NodeData[] {
  const { format, includeAvatar, useTagMapping, language } = options;
  
  switch (format) {
    case 'json':
      return exportMultipleToJSON(characters);
    
    case 'markdown':
      return exportMultipleToMarkdown(characters, { language, includeMetadata: true });
    
    case 'node':
    case 'nodeGroup':
      return exportMultipleToNodes(characters, {
        includeAvatar,
        language,
        asGroups: format === 'nodeGroup',
        useTagMapping,
      });
    
    default:
      return exportMultipleToJSON(characters);
  }
}

// ============================================================================
// File Download Helper
// ============================================================================

/** 触发文件下载 */
export function downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/** 下载角色为 JSON */
export function downloadCharacterJSON(character: CharacterTemplate): void {
  const content = exportToJSON(character);
  const name = character.name.zh || character.name.en || character.id;
  downloadFile(content, `${name}.json`, 'application/json');
}

/** 下载角色为 Markdown */
export function downloadCharacterMarkdown(character: CharacterTemplate, language: 'zh' | 'en' = 'zh'): void {
  const content = exportToMarkdown(character, { language, includeMetadata: true });
  const name = character.name.zh || character.name.en || character.id;
  downloadFile(content, `${name}.md`, 'text/markdown');
}

/** 批量下载角色 */
export function downloadCharacters(
  characters: CharacterTemplate[],
  format: 'json' | 'markdown',
  language: 'zh' | 'en' = 'zh'
): void {
  if (format === 'json') {
    const content = exportMultipleToJSON(characters);
    downloadFile(content, 'characters.json', 'application/json');
  } else {
    const content = exportMultipleToMarkdown(characters, { language, includeMetadata: true });
    downloadFile(content, 'characters.md', 'text/markdown');
  }
}

// ============================================================================
// Clipboard Helper
// ============================================================================

/** 复制到剪贴板 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/** 复制角色 JSON 到剪贴板 */
export async function copyCharacterJSON(character: CharacterTemplate): Promise<boolean> {
  const content = exportToJSON(character);
  return copyToClipboard(content);
}

/** 复制角色 Markdown 到剪贴板 */
export async function copyCharacterMarkdown(
  character: CharacterTemplate,
  language: 'zh' | 'en' = 'zh'
): Promise<boolean> {
  const content = exportToMarkdown(character, { language });
  return copyToClipboard(content);
}
