# AI Image Generation / AI 生图

使用 AI 模型生成图片的外置扩展。

## 功能特性

- 🎨 支持多种 AI 图像生成服务
  - Google Gemini (直连)
  - 硅基流动 (SiliconFlow)
  - OpenRouter
  - 火山引擎 (豆包)
  - 自定义 OpenAI 兼容 API
- 📝 从节点文本生成图片
- 🖼️ 生成结果自动添加为节点
- 💾 生成历史记录

## 使用方法

### 1. 配置 API Key

在扩展设置中配置你的 API Key：

1. 打开设置 → 扩展
2. 找到 "AI 生图" 扩展
3. 点击设置图标
4. 填写服务商、模型和 API Key

### 2. 生成图片

**方式一：从画布生成**
- 右键点击画布空白处
- 选择 "AI 生成图片"
- 输入提示词

**方式二：从节点生成**
- 选中一个包含文本的节点
- 右键选择 "生成图片"
- 节点文本将作为提示词

### 3. 命令面板

按 `Ctrl/Cmd + K` 打开命令面板，搜索：
- "生成图片" - 创建新图片
- "配置图像模型" - 打开配置

## 服务商配置

### Google Gemini
- 模型: `gemini-2.0-flash-exp`
- 端点: 留空（使用 SDK 直连）
- 获取 Key: https://aistudio.google.com/

### 硅基流动 (SiliconFlow)
- 模型: `black-forest-labs/FLUX.1-schnell`
- 端点: `https://api.siliconflow.cn/v1/images/generations`
- 获取 Key: https://siliconflow.cn/

### OpenRouter
- 模型: `black-forest-labs/flux-schnell`
- 端点: `https://openrouter.ai/api/v1/images/generations`
- 获取 Key: https://openrouter.ai/

### 火山引擎 (豆包)
- 模型: `doubao-seedream-3-0-t2i-250415`
- 端点: `https://ark.cn-beijing.volces.com/api/v3/images/generations`
- 获取 Key: https://www.volcengine.com/

## 开发说明

此扩展使用 MeowThink 扩展 API 开发。

### 文件结构

```
ai-image-gen/
├── index.ts        # 扩展主入口
├── manifest.json   # 扩展清单
└── README.md       # 说明文档
```

### 导出的 API

```typescript
import { getConfig, setConfig, getHistory, clearHistory } from './index';

// 获取当前配置
const config = getConfig();

// 更新配置
setConfig({ provider: 'gemini', apiKey: 'xxx' });

// 获取生成历史
const history = getHistory();

// 清空历史
clearHistory();
```

## 更新日志

### v1.0.0
- 初始版本
- 支持 Gemini、SiliconFlow、OpenRouter、火山引擎
- 右键菜单集成
- 生成历史记录
