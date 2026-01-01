/**
 * Character Fusion Generator Extension - 角色融合生成器扩展
 * 浏览内置角色库，使用 AI 融合角色，导出为思维导图节点
 */

import { IExtensionAPI, IExtensionModule } from '../../../types/extension';
import { 
  CharacterTemplate, 
  DataPack, 
  FusionConfig, 
  FusionResult,
  SettingsStorage,
  StyleCategory,
} from './types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

// ============================================================================
// Extension State
// ============================================================================

let api: IExtensionAPI | null = null;
let settings: SettingsStorage = { ...DEFAULT_SETTINGS };
let selectedCharacters: CharacterTemplate[] = [];

// ============================================================================
// Storage Helpers
// ============================================================================

function loadSettings(): SettingsStorage {
  if (!api) return DEFAULT_SETTINGS;
  const saved = api.storage.get<SettingsStorage>(STORAGE_KEYS.SETTINGS);
  return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
}

function saveSettings(newSettings: Partial<SettingsStorage>): void {
  if (!api) return;
  settings = { ...settings, ...newSettings };
  api.storage.set(STORAGE_KEYS.SETTINGS, settings);
}

function loadGeneratedCharacters(): CharacterTemplate[] {
  if (!api) return [];
  const storage = api.storage.get<{ characters: CharacterTemplate[] }>(STORAGE_KEYS.GENERATED_CHARACTERS);
  return storage?.characters || [];
}

function saveGeneratedCharacter(character: CharacterTemplate): void {
  if (!api) return;
  const characters = loadGeneratedCharacters();
  characters.unshift(character);
  // 限制最大数量
  if (characters.length > 100) {
    characters.pop();
  }
  api.storage.set(STORAGE_KEYS.GENERATED_CHARACTERS, { characters });
}

function loadUserPacks(): DataPack[] {
  if (!api) return [];
  const storage = api.storage.get<{ packs: DataPack[] }>(STORAGE_KEYS.DATA_PACKS);
  return storage?.packs || [];
}

function saveUserPacks(packs: DataPack[]): void {
  if (!api) return;
  api.storage.set(STORAGE_KEYS.DATA_PACKS, { packs, lastUpdated: Date.now() });
}

// ============================================================================
// Character Selection
// ============================================================================

export function getSelectedCharacters(): CharacterTemplate[] {
  return [...selectedCharacters];
}

export function selectCharacter(character: CharacterTemplate): boolean {
  if (selectedCharacters.length >= 4) {
    return false;
  }
  if (selectedCharacters.some(c => c.id === character.id)) {
    return false;
  }
  selectedCharacters.push(character);
  return true;
}

export function deselectCharacter(characterId: string): void {
  selectedCharacters = selectedCharacters.filter(c => c.id !== characterId);
}

export function clearSelection(): void {
  selectedCharacters = [];
}

export function isSelected(characterId: string): boolean {
  return selectedCharacters.some(c => c.id === characterId);
}

// ============================================================================
// Public API
// ============================================================================

export function getSettings(): SettingsStorage {
  return { ...settings };
}

export function updateSettings(newSettings: Partial<SettingsStorage>): void {
  saveSettings(newSettings);
}

export function getGeneratedCharacters(): CharacterTemplate[] {
  return loadGeneratedCharacters();
}

export function getUserPacks(): DataPack[] {
  return loadUserPacks();
}

export function addUserPack(pack: DataPack): void {
  const packs = loadUserPacks();
  packs.push(pack);
  saveUserPacks(packs);
}

export function removeUserPack(packId: string): void {
  const packs = loadUserPacks().filter(p => p.id !== packId);
  saveUserPacks(packs);
}

export function saveCharacter(character: CharacterTemplate): void {
  saveGeneratedCharacter(character);
}

export function deleteGeneratedCharacter(characterId: string): void {
  if (!api) return;
  const characters = loadGeneratedCharacters().filter(c => c.id !== characterId);
  api.storage.set(STORAGE_KEYS.GENERATED_CHARACTERS, { characters });
}

// ============================================================================
// Extension Activation
// ============================================================================

export const activate: IExtensionModule['activate'] = (context, extensionApi) => {
  api = extensionApi;
  const isZh = api.i18n.getLocale() === 'zh';

  // Load saved settings
  settings = loadSettings();

  // Command: Open Fusion Panel
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'openFusionPanel',
      title: { en: 'Open Character Fusion', zh: '打开角色融合' },
      handler: () => {
        if (!api) return;
        api.ui.showNotification(
          isZh ? '角色融合面板即将推出' : 'Character Fusion panel coming soon',
          'info'
        );
      },
    })
  );

  // Command: Import Data Pack
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'importDataPack',
      title: { en: 'Import Data Pack', zh: '导入数据包' },
      handler: async () => {
        if (!api) return;
        api.ui.showNotification(
          isZh ? '请在设置中导入数据包' : 'Please import data pack in settings',
          'info'
        );
      },
    })
  );

  // Command: Fuse Selected Characters
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'fuseSelected',
      title: { en: 'Fuse Selected Characters', zh: '融合选中角色' },
      handler: async () => {
        if (!api) return;
        
        if (selectedCharacters.length < 2) {
          api.ui.showNotification(
            isZh ? '请至少选择 2 个角色进行融合' : 'Please select at least 2 characters for fusion',
            'warning'
          );
          return;
        }

        api.ui.showNotification(
          isZh ? '融合功能即将推出' : 'Fusion feature coming soon',
          'info'
        );
      },
    })
  );

  // Command: Generate Variant
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'generateVariant',
      title: { en: 'Generate Character Variant', zh: '生成角色变体' },
      handler: async () => {
        if (!api) return;
        
        if (selectedCharacters.length !== 1) {
          api.ui.showNotification(
            isZh ? '请选择 1 个角色生成变体' : 'Please select 1 character to generate variant',
            'warning'
          );
          return;
        }

        api.ui.showNotification(
          isZh ? '变体生成功能即将推出' : 'Variant generation coming soon',
          'info'
        );
      },
    })
  );

  // Command: Export Character
  context.subscriptions.push(
    api.ui.registerCommand({
      id: 'exportCharacter',
      title: { en: 'Export Character', zh: '导出角色' },
      handler: async () => {
        if (!api) return;
        
        if (selectedCharacters.length === 0) {
          api.ui.showNotification(
            isZh ? '请先选择要导出的角色' : 'Please select characters to export',
            'warning'
          );
          return;
        }

        api.ui.showNotification(
          isZh ? '导出功能即将推出' : 'Export feature coming soon',
          'info'
        );
      },
    })
  );

  // Register context menu
  context.subscriptions.push(
    api.ui.registerMenuItem({
      id: 'ctx-character-fusion',
      title: { en: 'Character Fusion', zh: '角色融合' },
      location: 'context.canvas',
      command: 'meowthink.character-fusion.openFusionPanel',
      order: 70,
    })
  );

  console.log('[CharacterFusion] Extension activated');
};

// ============================================================================
// Extension Deactivation
// ============================================================================

export const deactivate: IExtensionModule['deactivate'] = () => {
  api = null;
  settings = { ...DEFAULT_SETTINGS };
  selectedCharacters = [];
  console.log('[CharacterFusion] Extension deactivated');
};

export default { activate, deactivate } as IExtensionModule;
