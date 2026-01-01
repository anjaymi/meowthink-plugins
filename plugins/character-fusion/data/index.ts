/**
 * Character Fusion Plugin - Built-in Data Index
 * 内置角色数据索引
 */

import { DataPack, CharacterTemplate, StyleCategory } from '../types';
import { fantasyCharacters } from './fantasy';
import { cyberpunkCharacters } from './cyberpunk';
import { urbanCharacters } from './urban';
import { horrorCharacters } from './horror';
import { re1999Characters } from './re1999';

// ============================================================================
// 内置数据包
// ============================================================================

/** 西幻类数据包 */
export const fantasyPack: DataPack = {
  id: 'builtin_fantasy',
  name: { zh: '西幻类角色', en: 'Fantasy Characters' },
  version: '1.0.0',
  author: 'MeowThink',
  description: {
    zh: '魔法、中世纪、奇幻风格的角色集合',
    en: 'Collection of magic, medieval, and fantasy style characters',
  },
  characters: fantasyCharacters,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isBuiltIn: true,
};

/** 机能类数据包 */
export const cyberpunkPack: DataPack = {
  id: 'builtin_cyberpunk',
  name: { zh: '机能类角色', en: 'Cyberpunk Characters' },
  version: '1.0.0',
  author: 'MeowThink',
  description: {
    zh: '科幻、机械、赛博朋克风格的角色集合',
    en: 'Collection of sci-fi, mechanical, and cyberpunk style characters',
  },
  characters: cyberpunkCharacters,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isBuiltIn: true,
};

/** 潮酷类数据包 */
export const urbanPack: DataPack = {
  id: 'builtin_urban',
  name: { zh: '潮酷类角色', en: 'Urban Characters' },
  version: '1.0.0',
  author: 'MeowThink',
  description: {
    zh: '现代、街头、时尚风格的角色集合',
    en: 'Collection of modern, street, and trendy style characters',
  },
  characters: urbanCharacters,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isBuiltIn: true,
};

/** 怪谈类数据包 */
export const horrorPack: DataPack = {
  id: 'builtin_horror',
  name: { zh: '怪谈类角色', en: 'Horror Characters' },
  version: '1.0.0',
  author: 'MeowThink',
  description: {
    zh: '恐怖、灵异、克苏鲁风格的角色集合',
    en: 'Collection of horror, occult, and Lovecraftian style characters',
  },
  characters: horrorCharacters,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isBuiltIn: true,
};

/** 重返未来1999数据包 */
export const re1999Pack: DataPack = {
  id: 'builtin_re1999',
  name: { zh: '重返未来1999', en: 'Reverse: 1999' },
  version: '1.0.0',
  author: '灰机wiki',
  source: 're1999',
  description: {
    zh: '重返未来1999角色数据，来自灰机wiki',
    en: 'Reverse: 1999 character data from Huiji Wiki',
  },
  characters: re1999Characters,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isBuiltIn: true,
};

// ============================================================================
// 导出
// ============================================================================

/** 所有内置数据包 */
export const builtInPacks: DataPack[] = [
  fantasyPack,
  cyberpunkPack,
  urbanPack,
  horrorPack,
  re1999Pack,
];

/** 按风格分类获取数据包 */
export function getPackByCategory(category: StyleCategory): DataPack | undefined {
  const packMap: Record<StyleCategory, DataPack> = {
    fantasy: fantasyPack,
    cyberpunk: cyberpunkPack,
    urban: urbanPack,
    horror: horrorPack,
  };
  return packMap[category];
}

/** 获取所有内置角色 */
export function getAllBuiltInCharacters(): CharacterTemplate[] {
  return [
    ...fantasyCharacters,
    ...cyberpunkCharacters,
    ...urbanCharacters,
    ...horrorCharacters,
    ...re1999Characters,
  ];
}

/** 按风格分类获取角色 */
export function getCharactersByCategory(category: StyleCategory): CharacterTemplate[] {
  const characterMap: Record<StyleCategory, CharacterTemplate[]> = {
    fantasy: fantasyCharacters,
    cyberpunk: cyberpunkCharacters,
    urban: urbanCharacters,
    horror: horrorCharacters,
  };
  return characterMap[category] || [];
}

/** 按 ID 获取角色 */
export function getCharacterById(id: string): CharacterTemplate | undefined {
  return getAllBuiltInCharacters().find(c => c.id === id);
}

/** 搜索角色 */
export function searchCharacters(
  query: string,
  options: {
    categories?: StyleCategory[];
    minRarity?: number;
    maxRarity?: number;
  } = {}
): CharacterTemplate[] {
  const { categories, minRarity = 1, maxRarity = 6 } = options;
  const normalizedQuery = query.toLowerCase().trim();
  
  let characters = getAllBuiltInCharacters();
  
  // 按分类筛选
  if (categories && categories.length > 0) {
    characters = characters.filter(c => categories.includes(c.category));
  }
  
  // 按稀有度筛选
  characters = characters.filter(c => {
    const rarity = c.rarity || 1;
    return rarity >= minRarity && rarity <= maxRarity;
  });
  
  // 搜索匹配
  if (normalizedQuery) {
    characters = characters.filter(c => {
      const nameMatch = 
        c.name.zh?.toLowerCase().includes(normalizedQuery) ||
        c.name.en?.toLowerCase().includes(normalizedQuery);
      const tagMatch = c.tags?.some(t => t.toLowerCase().includes(normalizedQuery));
      const loreMatch = c.lore?.toLowerCase().includes(normalizedQuery);
      const mediumMatch = c.medium?.toLowerCase().includes(normalizedQuery);
      
      return nameMatch || tagMatch || loreMatch || mediumMatch;
    });
  }
  
  return characters;
}

/** 获取统计信息 */
export function getBuiltInStats(): {
  totalCharacters: number;
  byCategory: Record<StyleCategory, number>;
  byRarity: Record<number, number>;
} {
  const characters = getAllBuiltInCharacters();
  
  const byCategory: Record<StyleCategory, number> = {
    fantasy: fantasyCharacters.length,
    cyberpunk: cyberpunkCharacters.length,
    urban: urbanCharacters.length,
    horror: horrorCharacters.length,
  };
  
  const byRarity: Record<number, number> = {};
  for (const char of characters) {
    const rarity = char.rarity || 1;
    byRarity[rarity] = (byRarity[rarity] || 0) + 1;
  }
  
  return {
    totalCharacters: characters.length,
    byCategory,
    byRarity,
  };
}

// 导出单独的角色数组
export { fantasyCharacters, cyberpunkCharacters, urbanCharacters, horrorCharacters, re1999Characters };
