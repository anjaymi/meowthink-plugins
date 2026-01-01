# 🖼️ Reference Collector / 参考素材采集器

Search and collect reference images from ArtStation/Pinterest, extract color palettes.

从 ArtStation/Pinterest 搜索采集参考图，提取配色方案。

## Features / 功能

- **Multi-Source Search** - ArtStation, Pinterest / 多来源搜索
- **Auto Translation** - Chinese keywords auto-translated / 中文关键词自动翻译
- **Color Extraction** - Extract color palettes from images / 从图片提取配色方案
- **Project Integration** - Add images directly to projects / 直接添加图片到项目
- **Group Management** - Organize collected references / 分组管理收藏的素材

## Detailed Usage / 详细使用方法

### Opening the Panel / 打开面板

1. Click the 🖼️ icon in sidebar / 点击侧边栏的 🖼️ 图标
2. Reference Collector panel opens / 参考素材面板打开

### Searching References / 搜索参考图

1. **Enter Keywords / 输入关键词**: Type in search box (Chinese auto-translated) / 在搜索框输入（中文自动翻译）
2. **Select Source / 选择来源**: ArtStation / Pinterest / All / 全部
3. **Browse Results / 浏览结果**: Scroll through image grid / 滚动浏览图片网格

### Adding to Project / 添加到项目

1. **Select Project / 选择项目**: Choose from dropdown / 从下拉菜单选择
2. **Add Image / 添加图片**: Click "+" on image → Creates image node / 点击图片上的 "+" → 创建图片节点
3. **Extract Colors / 提取配色**: Click palette icon → Creates color palette node / 点击调色板图标 → 创建配色节点


### Managing Groups / 管理分组

1. **Create Group / 创建分组**: Click "New Group" → Enter name / 点击 "新建分组" → 输入名称
2. **Add to Group / 添加到分组**: Drag image to group, or right-click → "Add to Group" / 拖拽图片到分组，或右键 → "添加到分组"
3. **View Group / 查看分组**: Click group tab to filter / 点击分组标签筛选

### Pinterest Setup / Pinterest 设置

Pinterest requires cookie authentication / Pinterest 需要 Cookie 认证：
1. Login to Pinterest in browser / 在浏览器登录 Pinterest
2. Copy cookie from browser DevTools / 从浏览器开发者工具复制 Cookie
3. Paste in plugin settings → Pinterest Cookie / 粘贴到插件设置 → Pinterest Cookie

## Settings / 设置

| Setting / 设置 | Description / 描述 | Default / 默认 |
|---------------|-------------------|---------------|
| Default Source / 默认来源 | Search source on open / 打开时的搜索来源 | ArtStation |
| Pinterest Cookie | Required for Pinterest / Pinterest 必需 | - |
| Colors to Extract / 提取颜色数 | Number of colors / 颜色数量 | 5 |

## Requirements / 要求

- MeowThink >= 0.56.0
- Pinterest Cookie (for Pinterest search) / Pinterest Cookie（用于 Pinterest 搜索）
