/**
 * AI 角色工坊 - 状态管理 Hook
 */

import { useReducer, useCallback, useEffect } from 'react';
import type { 
  WorkshopState, 
  WorkshopAction, 
  WorkshopModule,
  WorkshopMode,
  WizardStep,
  CharacterInput,
  CharacterData,
  CharacterVersion,
  GenerateResult 
} from '../types';
import { DEFAULT_MODULE, DEFAULT_WIZARD_STEP } from '../constants';

// localStorage 存储键
const STORAGE_KEY = 'ai-character-workshop-saves';
const AUTO_SAVE_KEY = 'ai-character-workshop-autosave';

// 保存的角色数据结构
export interface SavedCharacter {
  id: string;
  name: string;
  savedAt: number;
  data: Partial<CharacterData>;
  versions: CharacterVersion[];
  thumbnail?: string; // 缩略图 URL
}

// 获取所有保存的角色
export function getSavedCharacters(): SavedCharacter[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// 保存角色到 localStorage
export function saveCharacter(character: Partial<CharacterData>, versions: CharacterVersion[]): SavedCharacter {
  const saves = getSavedCharacters();
  const existingIndex = saves.findIndex(s => s.id === character.id);
  
  const savedChar: SavedCharacter = {
    id: character.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: character.name || '未命名角色',
    savedAt: Date.now(),
    data: character,
    versions,
    thumbnail: character.images?.[0]?.url,
  };
  
  if (existingIndex >= 0) {
    saves[existingIndex] = savedChar;
  } else {
    saves.unshift(savedChar);
  }
  
  // 最多保存 20 个角色
  const trimmed = saves.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return savedChar;
}

// 删除保存的角色
export function deleteSavedCharacter(id: string): void {
  const saves = getSavedCharacters();
  const filtered = saves.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// 自动保存当前进度
export function autoSave(character: Partial<CharacterData>, versions: CharacterVersion[]): void {
  try {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({
      data: character,
      versions,
      savedAt: Date.now(),
    }));
  } catch {
    // 忽略存储错误
  }
}

// 获取自动保存的数据
export function getAutoSave(): { data: Partial<CharacterData>; versions: CharacterVersion[]; savedAt: number } | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// 清除自动保存
export function clearAutoSave(): void {
  localStorage.removeItem(AUTO_SAVE_KEY);
}

// 生成唯一 ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// 初始状态
const initialState: WorkshopState = {
  // 工作模式
  mode: 'wizard', // 默认向导模式
  // 自由模式状态
  activeModule: DEFAULT_MODULE,
  selectedCharacter: null,
  // 向导模式状态
  wizardStep: DEFAULT_WIZARD_STEP,
  wizardCharacter: {
    id: generateId(),
    tags: [],
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  // 通用状态
  isGenerating: false,
  error: null,
  history: [],
  // 版本管理
  versions: [],
  currentVersionIndex: -1,
};

// Reducer
function workshopReducer(state: WorkshopState, action: WorkshopAction): WorkshopState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload, error: null };

    case 'SET_MODULE':
      return { ...state, activeModule: action.payload, error: null };
    
    case 'SET_CHARACTER':
      return { ...state, selectedCharacter: action.payload, error: null };

    case 'SET_WIZARD_STEP':
      return { ...state, wizardStep: action.payload, error: null };

    case 'UPDATE_WIZARD_CHARACTER':
      return {
        ...state,
        wizardCharacter: {
          ...state.wizardCharacter,
          ...action.payload,
          updatedAt: Date.now(),
        },
      };
    
    case 'START_GENERATE':
      return { ...state, isGenerating: true, error: null };
    
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        history: [action.payload, ...state.history].slice(0, 50),
      };
    
    case 'GENERATE_ERROR':
      return { ...state, isGenerating: false, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    // 版本管理（后悔药）
    case 'SAVE_VERSION': {
      const newVersion: CharacterVersion = {
        id: generateId(),
        timestamp: Date.now(),
        step: state.wizardStep,
        data: { ...state.wizardCharacter },
        description: action.payload.description,
      };
      return {
        ...state,
        versions: [...state.versions, newVersion].slice(-20), // 保留最近20个版本
        currentVersionIndex: state.versions.length,
      };
    }

    case 'RESTORE_VERSION': {
      const version = state.versions[action.payload];
      if (!version) return state;
      return {
        ...state,
        wizardCharacter: { ...version.data },
        wizardStep: version.step,
        currentVersionIndex: action.payload,
      };
    }

    case 'CLEAR_VERSIONS':
      return { ...state, versions: [], currentVersionIndex: -1 };

    // 加载保存的角色
    case 'LOAD_CHARACTER': {
      const { data, versions } = action.payload;
      return {
        ...state,
        wizardCharacter: { ...data },
        versions: versions || [],
        currentVersionIndex: versions?.length ? versions.length - 1 : -1,
        error: null,
      };
    }

    // 重置为新角色
    case 'RESET_CHARACTER':
      return {
        ...state,
        wizardCharacter: {
          id: generateId(),
          tags: [],
          images: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1,
        },
        versions: [],
        currentVersionIndex: -1,
        wizardStep: DEFAULT_WIZARD_STEP,
        error: null,
      };
    
    default:
      return state;
  }
}

// Hook
export function useWorkshopState() {
  const [state, dispatch] = useReducer(workshopReducer, initialState);

  // 模式切换
  const setMode = useCallback((mode: WorkshopMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  // 自由模式
  const setModule = useCallback((module: WorkshopModule) => {
    dispatch({ type: 'SET_MODULE', payload: module });
  }, []);

  const setCharacter = useCallback((character: CharacterInput | null) => {
    dispatch({ type: 'SET_CHARACTER', payload: character });
  }, []);

  // 向导模式
  const setWizardStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_WIZARD_STEP', payload: step });
  }, []);

  const updateWizardCharacter = useCallback((data: Partial<CharacterData>) => {
    dispatch({ type: 'UPDATE_WIZARD_CHARACTER', payload: data });
  }, []);

  // 生成相关
  const startGenerate = useCallback(() => {
    dispatch({ type: 'START_GENERATE' });
  }, []);

  const generateSuccess = useCallback((result: GenerateResult) => {
    dispatch({ type: 'GENERATE_SUCCESS', payload: result });
  }, []);

  const generateError = useCallback((error: string) => {
    dispatch({ type: 'GENERATE_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  // 版本管理（后悔药）
  const saveVersion = useCallback((description: string) => {
    dispatch({ type: 'SAVE_VERSION', payload: { description } });
  }, []);

  const restoreVersion = useCallback((index: number) => {
    dispatch({ type: 'RESTORE_VERSION', payload: index });
  }, []);

  const clearVersions = useCallback(() => {
    dispatch({ type: 'CLEAR_VERSIONS' });
  }, []);

  // 保存/加载角色
  const saveCurrentCharacter = useCallback(() => {
    return saveCharacter(state.wizardCharacter, state.versions);
  }, [state.wizardCharacter, state.versions]);

  const loadCharacter = useCallback((saved: SavedCharacter) => {
    dispatch({ type: 'LOAD_CHARACTER', payload: { data: saved.data, versions: saved.versions } });
  }, []);

  const resetCharacter = useCallback(() => {
    dispatch({ type: 'RESET_CHARACTER' });
  }, []);

  // 自动保存（每次角色数据变化时）
  useEffect(() => {
    if (state.wizardCharacter.name || state.wizardCharacter.style?.genre) {
      autoSave(state.wizardCharacter, state.versions);
    }
  }, [state.wizardCharacter, state.versions]);

  // 向导导航
  const nextStep = useCallback(() => {
    const steps: WizardStep[] = ['style', 'naming', 'tags', 'appearance', 'personality', 'backstory', 'agent', 'complete'];
    const currentIndex = steps.indexOf(state.wizardStep);
    if (currentIndex < steps.length - 1) {
      // 自动保存版本
      dispatch({ type: 'SAVE_VERSION', payload: { description: `完成步骤: ${state.wizardStep}` } });
      dispatch({ type: 'SET_WIZARD_STEP', payload: steps[currentIndex + 1] });
    }
  }, [state.wizardStep]);

  const prevStep = useCallback(() => {
    const steps: WizardStep[] = ['style', 'naming', 'tags', 'appearance', 'personality', 'backstory', 'agent', 'complete'];
    const currentIndex = steps.indexOf(state.wizardStep);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_WIZARD_STEP', payload: steps[currentIndex - 1] });
    }
  }, [state.wizardStep]);

  return {
    state,
    actions: {
      setMode,
      setModule,
      setCharacter,
      setWizardStep,
      updateWizardCharacter,
      startGenerate,
      generateSuccess,
      generateError,
      clearError,
      clearHistory,
      saveVersion,
      restoreVersion,
      clearVersions,
      nextStep,
      prevStep,
      // 保存/加载
      saveCurrentCharacter,
      loadCharacter,
      resetCharacter,
    },
  };
}

export type WorkshopActions = ReturnType<typeof useWorkshopState>['actions'];
