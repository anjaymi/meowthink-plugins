/**
 * Character Fusion Plugin - Storage Layer
 * 数据存储层 - 数据包和角色的存储、读取、验证逻辑
 */

import { 
  CharacterTemplate, 
  DataPack, 
  DataPacksStorage,
  GeneratedStorage,
  SettingsStorage,
  StyleCategory,
  FusionErrorCode,
  FusionError,
} from './types';
import { 
  STORAGE_KEYS, 
  DEFAULT_SETTINGS,
  MAX_GENERATED_CHARACTERS,
  MAX_USER_PACKS,
  MAX_PACK_SIZE,
  MAX_TOTAL_STORAGE,
  MAX_NAME_LENGTH,
  MAX_LORE_LENGTH,
  MAX_QUOTE_LENGTH,
  MAX_POSITIONING_COUNT,
  MAX_TAGS_COUNT,
} from './constants';
import { builtInPacks, getAllBuiltInCharacters } from './data';

// ============================================================================
// Storage API Reference (will be injected)
// ============================================================================

interface StorageAPI {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
  getAll(): Record<string, unknown>;
}

let storageApi: StorageAPI | null = null;

/** 初始化存储 API */
export function initStorage(api: StorageAPI): void {
  storageApi = api;
}

/** 获取存储 API */
function getStorage(): StorageAPI {
  if (!storageApi) {
    // Fallback to localStorage
    return {
      get<T>(key: string): T | undefined {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : undefined;
        } catch {
          return undefined;
        }
      },
      set<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
      },
      delete(key: string): void {
        localStorage.removeItem(key);
      },
      getAll(): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('meowthink_ext_character-fusion')) {
            try {
              result[key] = JSON.parse(localStorage.getItem(key) || '');
            } catch {
              result[key] = localStorage.getItem(key);
            }
          }
        }
        return result;
      },
    };
  }
  return storageApi;
}

// ============================================================================
// 内置数据包
// ============================================================================

/** 加载内置数据包 */
export function loadBuiltInPacks(): DataPack[] {
  return builtInPacks;
}

/** 获取所有内置角色 */
export function getBuiltInCharacters(): CharacterTemplate[] {
  return getAllBuiltInCharacters();
}

// ============================================================================
// 用户数据包
// ============================================================================

/** 加载用户数据包 */
export function loadUserPacks(): DataPack[] {
  const storage = getStorage();
  const data = storage.get<DataPacksStorage>(STORAGE_KEYS.DATA_PACKS);
  return data?.packs || [];
}

/** 保存用户数据包 */
export function saveUserPacks(packs: DataPack[]): void {
  const storage = getStorage();
  const data: DataPacksStorage = {
    packs,
    lastUpdated: Date.now(),
  };
  storage.set(STORAGE_KEYS.DATA_PACKS, data);
}

/** 添加用户数据包 */
export function addUserPack(pack: DataPack): { success: boolean; error?: FusionError } {
  const packs = loadUserPacks();
  
  // 检查数量限制
  if (packs.length >= MAX_USER_PACKS) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.STORAGE_ERROR,
        message: `最多只能导入 ${MAX_USER_PACKS} 个数据包`,
        suggestion: '请删除一些不需要的数据包后再试',
      },
    };
  }
  
  // 检查是否已存在
  if (packs.some(p => p.id === pack.id)) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.VALIDATION_ERROR,
        message: `数据包 "${pack.id}" 已存在`,
        suggestion: '请使用不同的 ID 或删除现有数据包',
      },
    };
  }
  
  // 检查存储大小
  const sizeCheck = checkStorageSize(pack);
  if (!sizeCheck.success) {
    return sizeCheck;
  }
  
  packs.push(pack);
  saveUserPacks(packs);
  
  return { success: true };
}

/** 删除用户数据包 */
export function removeUserPack(packId: string): boolean {
  const packs = loadUserPacks();
  const index = packs.findIndex(p => p.id === packId);
  
  if (index === -1) {
    return false;
  }
  
  packs.splice(index, 1);
  saveUserPacks(packs);
  
  return true;
}

/** 更新用户数据包 */
export function updateUserPack(packId: string, updates: Partial<DataPack>): boolean {
  const packs = loadUserPacks();
  const index = packs.findIndex(p => p.id === packId);
  
  if (index === -1) {
    return false;
  }
  
  packs[index] = {
    ...packs[index],
    ...updates,
    updatedAt: Date.now(),
  };
  saveUserPacks(packs);
  
  return true;
}

// ============================================================================
// 导入导出
// ============================================================================

/** 导入数据包（从 JSON） */
export function importDataPack(jsonString: string): { success: boolean; pack?: DataPack; error?: FusionError } {
  try {
    const data = JSON.parse(jsonString);
    
    // 验证数据包结构
    const validation = validateDataPack(data);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: FusionErrorCode.VALIDATION_ERROR,
          message: validation.errors.join('; '),
          suggestion: '请检查数据包格式是否正确',
        },
      };
    }
    
    // 检查大小
    if (jsonString.length > MAX_PACK_SIZE) {
      return {
        success: false,
        error: {
          code: FusionErrorCode.STORAGE_ERROR,
          message: `数据包大小超过限制 (${Math.round(MAX_PACK_SIZE / 1024 / 1024)}MB)`,
          suggestion: '请减少角色数量或压缩数据',
        },
      };
    }
    
    const pack: DataPack = {
      ...data,
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now(),
      isBuiltIn: false,
    };
    
    // 验证每个角色
    for (const char of pack.characters) {
      const charValidation = validateCharacter(char);
      if (!charValidation.valid) {
        return {
          success: false,
          error: {
            code: FusionErrorCode.VALIDATION_ERROR,
            message: `角色 "${char.name?.zh || char.id}" 验证失败: ${charValidation.errors.join('; ')}`,
            suggestion: '请检查角色数据格式',
          },
        };
      }
    }
    
    return { success: true, pack };
  } catch (e) {
    return {
      success: false,
      error: {
        code: FusionErrorCode.PARSE_ERROR,
        message: '无法解析 JSON 数据',
        details: e,
        suggestion: '请确保文件是有效的 JSON 格式',
      },
    };
  }
}

/** 导出数据包（为 JSON） */
export function exportDataPack(pack: DataPack): string {
  return JSON.stringify(pack, null, 2);
}

/** 导出角色（为 JSON） */
export function exportCharacter(character: CharacterTemplate): string {
  return JSON.stringify(character, null, 2);
}

// ============================================================================
// 生成的角色
// ============================================================================

/** 加载生成的角色 */
export function loadGeneratedCharacters(): CharacterTemplate[] {
  const storage = getStorage();
  const data = storage.get<GeneratedStorage>(STORAGE_KEYS.GENERATED_CHARACTERS);
  return data?.characters || [];
}

/** 保存生成的角色 */
export function saveGeneratedCharacter(character: CharacterTemplate): { success: boolean; error?: FusionError } {
  const storage = getStorage();
  const data = storage.get<GeneratedStorage>(STORAGE_KEYS.GENERATED_CHARACTERS) || {
    characters: [],
    maxCount: MAX_GENERATED_CHARACTERS,
  };
  
  // 添加元数据
  const charToSave: CharacterTemplate = {
    ...character,
    id: character.id || `generated_${Date.now()}`,
    createdAt: character.createdAt || Date.now(),
    updatedAt: Date.now(),
    isGenerated: true,
  };
  
  // 添加到列表开头
  data.characters.unshift(charToSave);
  
  // 限制数量
  if (data.characters.length > MAX_GENERATED_CHARACTERS) {
    data.characters = data.characters.slice(0, MAX_GENERATED_CHARACTERS);
  }
  
  storage.set(STORAGE_KEYS.GENERATED_CHARACTERS, data);
  
  return { success: true };
}

/** 更新生成的角色 */
export function updateGeneratedCharacter(characterId: string, updates: Partial<CharacterTemplate>): boolean {
  const storage = getStorage();
  const data = storage.get<GeneratedStorage>(STORAGE_KEYS.GENERATED_CHARACTERS);
  
  if (!data) return false;
  
  const index = data.characters.findIndex(c => c.id === characterId);
  if (index === -1) return false;
  
  data.characters[index] = {
    ...data.characters[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  storage.set(STORAGE_KEYS.GENERATED_CHARACTERS, data);
  return true;
}

/** 删除生成的角色 */
export function deleteGeneratedCharacter(characterId: string): boolean {
  const storage = getStorage();
  const data = storage.get<GeneratedStorage>(STORAGE_KEYS.GENERATED_CHARACTERS);
  
  if (!data) return false;
  
  const index = data.characters.findIndex(c => c.id === characterId);
  if (index === -1) return false;
  
  data.characters.splice(index, 1);
  storage.set(STORAGE_KEYS.GENERATED_CHARACTERS, data);
  
  return true;
}

/** 清空生成的角色 */
export function clearGeneratedCharacters(): void {
  const storage = getStorage();
  storage.delete(STORAGE_KEYS.GENERATED_CHARACTERS);
}

// ============================================================================
// 复制角色
// ============================================================================

/** 复制内置角色到用户集合 */
export function forkCharacter(character: CharacterTemplate): { success: boolean; character?: CharacterTemplate; error?: FusionError } {
  // 创建副本
  const forkedCharacter: CharacterTemplate = {
    ...character,
    id: `forked_${character.id}_${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isGenerated: false,
    sourceCharacters: [character.id],
  };
  
  // 保存到生成的角色列表
  const result = saveGeneratedCharacter(forkedCharacter);
  
  if (result.success) {
    return { success: true, character: forkedCharacter };
  }
  
  return { success: false, error: result.error };
}

// ============================================================================
// 设置
// ============================================================================

/** 加载设置 */
export function loadSettings(): SettingsStorage {
  const storage = getStorage();
  const saved = storage.get<SettingsStorage>(STORAGE_KEYS.SETTINGS);
  return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
}

/** 保存设置 */
export function saveSettings(settings: Partial<SettingsStorage>): void {
  const storage = getStorage();
  const current = loadSettings();
  storage.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
}

// ============================================================================
// 验证
// ============================================================================

/** 验证角色数据 */
export function validateCharacter(character: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!character || typeof character !== 'object') {
    return { valid: false, errors: ['角色数据必须是对象'] };
  }
  
  const char = character as Record<string, unknown>;
  
  // 必需字段
  if (!char.id || typeof char.id !== 'string') {
    errors.push('缺少有效的 id 字段');
  }
  
  if (!char.name || typeof char.name !== 'object') {
    errors.push('缺少有效的 name 字段');
  } else {
    const name = char.name as Record<string, unknown>;
    if (!name.zh && !name.en) {
      errors.push('name 必须包含 zh 或 en');
    }
    if (name.zh && typeof name.zh === 'string' && name.zh.length > MAX_NAME_LENGTH) {
      errors.push(`中文名称不能超过 ${MAX_NAME_LENGTH} 个字符`);
    }
    if (name.en && typeof name.en === 'string' && name.en.length > MAX_NAME_LENGTH) {
      errors.push(`英文名称不能超过 ${MAX_NAME_LENGTH} 个字符`);
    }
  }
  
  if (!char.category || !['fantasy', 'cyberpunk', 'urban', 'horror'].includes(char.category as string)) {
    errors.push('category 必须是 fantasy, cyberpunk, urban 或 horror');
  }
  
  // 可选字段长度检查
  if (char.lore && typeof char.lore === 'string' && char.lore.length > MAX_LORE_LENGTH) {
    errors.push(`背景设定不能超过 ${MAX_LORE_LENGTH} 个字符`);
  }
  
  if (char.quote && typeof char.quote === 'string' && char.quote.length > MAX_QUOTE_LENGTH) {
    errors.push(`语录不能超过 ${MAX_QUOTE_LENGTH} 个字符`);
  }
  
  if (char.positioning && Array.isArray(char.positioning) && char.positioning.length > MAX_POSITIONING_COUNT) {
    errors.push(`定位标签不能超过 ${MAX_POSITIONING_COUNT} 个`);
  }
  
  if (char.tags && Array.isArray(char.tags) && char.tags.length > MAX_TAGS_COUNT) {
    errors.push(`搜索标签不能超过 ${MAX_TAGS_COUNT} 个`);
  }
  
  if (char.rarity !== undefined) {
    const rarity = char.rarity as number;
    if (typeof rarity !== 'number' || rarity < 1 || rarity > 6) {
      errors.push('稀有度必须是 1-6 之间的数字');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/** 验证数据包 */
export function validateDataPack(pack: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!pack || typeof pack !== 'object') {
    return { valid: false, errors: ['数据包必须是对象'] };
  }
  
  const p = pack as Record<string, unknown>;
  
  // 必需字段
  if (!p.id || typeof p.id !== 'string') {
    errors.push('缺少有效的 id 字段');
  }
  
  if (!p.name || typeof p.name !== 'object') {
    errors.push('缺少有效的 name 字段');
  }
  
  if (!p.version || typeof p.version !== 'string') {
    errors.push('缺少有效的 version 字段');
  }
  
  if (!p.characters || !Array.isArray(p.characters)) {
    errors.push('缺少有效的 characters 数组');
  } else if (p.characters.length === 0) {
    errors.push('数据包必须包含至少一个角色');
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 存储大小检查
// ============================================================================

/** 检查存储大小 */
export function checkStorageSize(newData?: unknown): { success: boolean; error?: FusionError } {
  try {
    const storage = getStorage();
    const allData = storage.getAll();
    
    let totalSize = 0;
    for (const value of Object.values(allData)) {
      totalSize += JSON.stringify(value).length;
    }
    
    if (newData) {
      totalSize += JSON.stringify(newData).length;
    }
    
    if (totalSize > MAX_TOTAL_STORAGE) {
      return {
        success: false,
        error: {
          code: FusionErrorCode.STORAGE_ERROR,
          message: `存储空间不足 (已使用 ${Math.round(totalSize / 1024 / 1024)}MB / ${Math.round(MAX_TOTAL_STORAGE / 1024 / 1024)}MB)`,
          suggestion: '请删除一些不需要的数据包或生成的角色',
        },
      };
    }
    
    return { success: true };
  } catch {
    return { success: true }; // 无法检查时默认允许
  }
}

/** 获取存储使用情况 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  try {
    const storage = getStorage();
    const allData = storage.getAll();
    
    let totalSize = 0;
    for (const value of Object.values(allData)) {
      totalSize += JSON.stringify(value).length;
    }
    
    return {
      used: totalSize,
      total: MAX_TOTAL_STORAGE,
      percentage: Math.round((totalSize / MAX_TOTAL_STORAGE) * 100),
    };
  } catch {
    return { used: 0, total: MAX_TOTAL_STORAGE, percentage: 0 };
  }
}

// ============================================================================
// 获取所有角色
// ============================================================================

/** 获取所有角色（内置 + 用户 + 生成） */
export function getAllCharacters(): CharacterTemplate[] {
  const builtIn = getBuiltInCharacters();
  const userPacks = loadUserPacks();
  const generated = loadGeneratedCharacters();
  
  const userCharacters = userPacks.flatMap(p => p.characters);
  
  return [...builtIn, ...userCharacters, ...generated];
}

/** 按 ID 获取角色 */
export function getCharacterById(id: string): CharacterTemplate | undefined {
  return getAllCharacters().find(c => c.id === id);
}

/** 搜索所有角色 */
export function searchAllCharacters(
  query: string,
  options: {
    categories?: StyleCategory[];
    sources?: ('builtin' | 'user' | 'generated')[];
    minRarity?: number;
    maxRarity?: number;
  } = {}
): CharacterTemplate[] {
  const { categories, sources, minRarity = 1, maxRarity = 6 } = options;
  const normalizedQuery = query.toLowerCase().trim();
  
  let characters: CharacterTemplate[] = [];
  
  // 按来源筛选
  if (!sources || sources.includes('builtin')) {
    characters.push(...getBuiltInCharacters());
  }
  if (!sources || sources.includes('user')) {
    characters.push(...loadUserPacks().flatMap(p => p.characters));
  }
  if (!sources || sources.includes('generated')) {
    characters.push(...loadGeneratedCharacters());
  }
  
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
