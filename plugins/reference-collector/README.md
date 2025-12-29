# Reference Collector / 参考素材采集器

从 ArtStation/Pinterest 搜索采集参考图，提取配色方案，添加到项目节点。

## 功能特性

- 🔍 **多源搜索** - 支持 ArtStation 和 Pinterest 图片搜索
- 🌐 **中文翻译** - 自动将中文关键词翻译为英文搜索
- 🎨 **配色提取** - 从图片中提取主要颜色生成调色板
- 📁 **分组管理** - 将收藏的素材按分组整理
- 🖼️ **一键添加** - 快速将参考图添加为项目节点

## 使用方法

1. 点击工具栏的「参考素材」按钮打开面板
2. 输入搜索关键词（支持中文）
3. 从下拉菜单选择目标项目
4. 点击图片上的 `+` 按钮添加为节点
5. 点击调色板图标提取配色方案

## 设置选项

| 设置 | 说明 | 默认值 |
|------|------|--------|
| 默认搜索来源 | ArtStation / Pinterest / 全部 | ArtStation |
| Pinterest Cookie | Pinterest 搜索需要配置 | - |
| 提取颜色数量 | 配色提取的颜色数量 | 5 |

## 快捷命令

- `打开参考素材` - 打开/关闭参考素材面板
- `搜索参考图` - 打开面板并聚焦搜索框
- `提取配色方案` - 从选中的图片节点提取颜色

## 权限要求

- `nodes` - 创建和管理节点
- `storage` - 保存收藏和分组
- `network` - 访问图片搜索 API

## 版本要求

MeowThink >= 0.56.0

---

# Reference Collector

Search and collect reference images from ArtStation/Pinterest, extract color palettes, and add to projects.

## Features

- 🔍 **Multi-source Search** - Search images from ArtStation and Pinterest
- 🌐 **Auto Translation** - Automatically translate Chinese keywords to English
- 🎨 **Color Extraction** - Extract main colors from images to create palettes
- 📁 **Group Management** - Organize collected references into groups
- 🖼️ **Quick Add** - Quickly add reference images as project nodes

## Usage

1. Click the "References" button in the toolbar to open the panel
2. Enter search keywords (Chinese supported)
3. Select target project from dropdown
4. Click the `+` button on images to add as nodes
5. Click the palette icon to extract color scheme

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Default Search Source | ArtStation / Pinterest / All | ArtStation |
| Pinterest Cookie | Required for Pinterest search | - |
| Colors to Extract | Number of colors to extract | 5 |

## Commands

- `Open Reference Collector` - Toggle reference panel
- `Search References` - Open panel and focus search
- `Extract Color Palette` - Extract colors from selected image node

## Permissions

- `nodes` - Create and manage nodes
- `storage` - Save favorites and groups
- `network` - Access image search APIs

## Requirements

MeowThink >= 0.56.0
