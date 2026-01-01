/**
 * AI 角色工坊 - 类型定义
 */

// ==================== 工作模式 ====================
// 自由模式：独立使用各模块
// 向导模式：引导式角色创建流程
export type WorkshopMode = 'free' | 'wizard';

// 模块类型
export type WorkshopModule = 'dialogue' | 'variant' | 'worldbuilding' | 'naming' | 'backstory';

// 向导步骤
export type WizardStep = 
  | 'style'      // 1. 选择风格（可调用角色融合插件）
  | 'naming'     // 2. 生成名字
  | 'tags'       // 3. 选择标签/属性
  | 'appearance' // 4. 外观设计（可调用AI生图）
  | 'personality'// 5. 性格设定
  | 'backstory'  // 6. 背景故事
  | 'agent'      // 7. 生成角色智能体
  | 'complete';  // 8. 完成

// 模块配置
export interface ModuleConfig {
  id: WorkshopModule;
  name: { zh: string; en: string };
  icon: string;
  description: { zh: string; en: string };
}

// 向导步骤配置
export interface WizardStepConfig {
  id: WizardStep;
  name: { zh: string; en: string };
  icon: string;
  description: { zh: string; en: string };
}

// ==================== 角色数据（完整版） ====================
// 角色输入数据（从画布节点提取）
export interface CharacterInput {
  id: string;
  name: string;
  description?: string;
  personality?: string;
  appearance?: string;
  background?: string;
  tags?: string[];
  imageUrl?: string;
}

// 完整角色数据（向导模式创建）
export interface CharacterData {
  id: string;
  // 基础信息
  name: string;
  nameOrigin?: string;
  nameMeaning?: string;
  // 风格
  style: CharacterStyle;
  // 外观
  appearance: CharacterAppearance;
  // 性格
  personality: CharacterPersonality;
  // 背景
  backstory: CharacterBackstory;
  // 标签
  tags: string[];
  // 图片
  images: CharacterImage[];
  // 智能体配置
  agent?: CharacterAgent;
  // 元数据
  createdAt: number;
  updatedAt: number;
  version: number;
}

// 角色风格
export interface CharacterStyle {
  genre: string;        // 类型：奇幻、科幻、现代、机能风等
  subGenre?: string;    // 子类型
  inspiration?: string; // 灵感来源
  fusionData?: unknown; // 角色融合插件数据（接口预留）
}

// 角色外观
export interface CharacterAppearance {
  gender?: 'male' | 'female' | 'other' | 'unknown';
  age?: string;
  height?: string;
  build?: string;
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  skinTone?: string;
  distinguishingFeatures?: string[];
  clothing?: string;
  accessories?: string[];
  description: string;
}

// 角色性格
export interface CharacterPersonality {
  traits: string[];           // 性格特点
  strengths: string[];        // 优点
  weaknesses: string[];       // 缺点
  likes: string[];            // 喜好
  dislikes: string[];         // 厌恶
  fears?: string[];           // 恐惧
  goals?: string[];           // 目标
  quirks?: string[];          // 怪癖
  speechStyle?: string;       // 说话风格
  description: string;
}

// 角色背景
export interface CharacterBackstory {
  origin: string;             // 出身
  childhood?: string;         // 童年
  turningPoint?: string;      // 转折点
  currentSituation?: string;  // 现状
  secrets?: string[];         // 秘密
  relationships?: CharacterRelationship[];
  timeline?: BackstoryEvent[];
  fullStory: string;
}

// 角色关系
export interface CharacterRelationship {
  characterName: string;
  relationship: string;
  description?: string;
}

// 背景事件
export interface BackstoryEvent {
  period: string;
  title: string;
  description: string;
}

// 角色图片
export interface CharacterImage {
  id: string;
  url: string;
  type: 'portrait' | 'fullbody' | 'expression' | 'variant';
  description?: string;
  generatedBy?: 'ai' | 'user';
}

// 角色智能体
export interface CharacterAgent {
  systemPrompt: string;       // 系统提示词
  sampleDialogues: string[];  // 示例对话
  voiceStyle?: string;        // 语音风格
  enabled: boolean;
}

// 生成请求基类
export interface GenerateRequest {
  character: CharacterInput;
  module: WorkshopModule;
  options?: Record<string, unknown>;
}

// 生成结果基类
export interface GenerateResult {
  id: string;
  module: WorkshopModule;
  content: string;
  timestamp: number;
  characterId: string;
}

// ==================== 对话生成模块 ====================
export interface DialogueOptions {
  style: 'casual' | 'formal' | 'emotional' | 'humorous';
  scenario?: string;
  targetCharacter?: CharacterInput;
  count: number;
}

export interface DialogueResult extends GenerateResult {
  module: 'dialogue';
  dialogues: DialogueLine[];
}

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: string;
}

// ==================== 变体生成模块 ====================
export interface VariantOptions {
  type: 'costume' | 'age' | 'timeline' | 'style' | 'custom';
  customPrompt?: string;
  count: number;
}

export interface VariantResult extends GenerateResult {
  module: 'variant';
  variants: CharacterVariant[];
}

export interface CharacterVariant {
  id: string;
  name: string;
  type: string;
  description: string;
  changes: string[];
}

// ==================== 世界观扩展模块 ====================
export interface WorldbuildingOptions {
  aspect: 'faction' | 'location' | 'history' | 'culture' | 'relationship';
  depth: 'brief' | 'detailed' | 'comprehensive';
}

export interface WorldbuildingResult extends GenerateResult {
  module: 'worldbuilding';
  elements: WorldElement[];
}

export interface WorldElement {
  id: string;
  type: string;
  name: string;
  description: string;
  relatedTo?: string[];
}

// ==================== 名字生成模块 ====================
export interface NamingOptions {
  culture: 'chinese' | 'japanese' | 'western' | 'fantasy' | 'scifi' | 'custom';
  gender?: 'male' | 'female' | 'neutral';
  style?: string;
  count: number;
}

export interface NamingResult extends GenerateResult {
  module: 'naming';
  names: GeneratedName[];
}

export interface GeneratedName {
  name: string;
  meaning?: string;
  origin?: string;
}

// ==================== 背景故事模块 ====================
export interface BackstoryOptions {
  focus: 'origin' | 'motivation' | 'secret' | 'trauma' | 'achievement' | 'full';
  tone: 'tragic' | 'heroic' | 'mysterious' | 'comedic' | 'neutral';
  length: 'short' | 'medium' | 'long';
}

export interface BackstoryResult extends GenerateResult {
  module: 'backstory';
  sections: BackstorySection[];
}

export interface BackstorySection {
  title: string;
  content: string;
  period?: string;
}

// ==================== 状态管理 ====================
export interface WorkshopState {
  // 工作模式
  mode: WorkshopMode;
  // 自由模式状态
  activeModule: WorkshopModule;
  selectedCharacter: CharacterInput | null;
  // 向导模式状态
  wizardStep: WizardStep;
  wizardCharacter: Partial<CharacterData>;
  // 通用状态
  isGenerating: boolean;
  error: string | null;
  history: GenerateResult[];
  // 版本管理（后悔药）
  versions: CharacterVersion[];
  currentVersionIndex: number;
}

// 角色版本（后悔药功能）
export interface CharacterVersion {
  id: string;
  timestamp: number;
  step: WizardStep;
  data: Partial<CharacterData>;
  description: string;
}

export type WorkshopAction =
  | { type: 'SET_MODE'; payload: WorkshopMode }
  | { type: 'SET_MODULE'; payload: WorkshopModule }
  | { type: 'SET_CHARACTER'; payload: CharacterInput | null }
  | { type: 'SET_WIZARD_STEP'; payload: WizardStep }
  | { type: 'UPDATE_WIZARD_CHARACTER'; payload: Partial<CharacterData> }
  | { type: 'START_GENERATE' }
  | { type: 'GENERATE_SUCCESS'; payload: GenerateResult }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_HISTORY' }
  // 版本管理
  | { type: 'SAVE_VERSION'; payload: { description: string } }
  | { type: 'RESTORE_VERSION'; payload: number }
  | { type: 'CLEAR_VERSIONS' };

// ==================== 插件互通接口 ====================
// 角色融合插件接口
export interface CharacterFusionAPI {
  getStyles: () => Promise<FusionStyle[]>;
  getTagsByStyle: (styleId: string) => Promise<string[]>;
  generateFusion: (params: FusionParams) => Promise<FusionResult>;
}

export interface FusionStyle {
  id: string;
  name: { zh: string; en: string };
  description: string;
  tags: string[];
}

export interface FusionParams {
  styleId: string;
  tags: string[];
  options?: Record<string, unknown>;
}

export interface FusionResult {
  description: string;
  tags: string[];
  suggestedAppearance?: string;
}

// AI 生图接口
export interface AIImageGenAPI {
  generateImage: (prompt: string, options?: ImageGenOptions) => Promise<GeneratedImage>;
  getModels: () => Promise<ImageGenModel[]>;
}

export interface ImageGenOptions {
  model?: string;
  width?: number;
  height?: number;
  style?: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  model: string;
}

export interface ImageGenModel {
  id: string;
  name: string;
}
