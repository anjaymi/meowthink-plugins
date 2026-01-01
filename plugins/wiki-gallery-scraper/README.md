# 📚 Wiki Gallery Database / Wiki立绘数据库

Extract and manage character artwork from game wikis.

从游戏Wiki提取角色立绘，支持数据库管理。

## Supported Games / 支持的游戏

- Reverse: 1999 / 重返未来1999
- Arknights / 明日方舟
- Genshin Impact / 原神
- Honkai: Star Rail / 崩坏：星穹铁道
- Zenless Zone Zero / 绝区零

## Features / 功能

- **Multi-Source** - BWiki, HuijiWiki / 多数据源 - BWiki、灰机Wiki
- **Progress Tracking** - Track extraction progress / 进度追踪 - 追踪提取进度
- **Advanced Filtering** - Filter by game, rarity, element, etc. / 高级筛选
- **Batch Operations** - Batch download or add to canvas / 批量操作
- **Import/Export** - Database backup and restore / 导入/导出

## Detailed Usage / 详细使用方法

### Opening the Panel / 打开面板

1. Click "Wiki Gallery Database" in sidebar tools / 点击侧边栏工具中的 "Wiki立绘数据库"
2. Or use command: "Open Wiki Gallery Database" / 或使用命令

### Adding Data Sources / 添加数据源

1. Click "Add Source" button / 点击 "添加数据源" 按钮
2. Select wiki type: BWiki or HuijiWiki / 选择 Wiki 类型
3. Choose game from list / 从列表选择游戏
4. Click "Add" to confirm / 点击 "添加" 确认


### Extracting Artworks / 提取立绘

1. **Select Source / 选择数据源**: Click on added source / 点击已添加的数据源
2. **Start Extraction / 开始提取**: Click "Extract" button / 点击 "提取" 按钮
3. **Monitor Progress / 监控进度**: Progress bar shows status / 进度条显示状态
4. **View Results / 查看结果**: Characters appear in grid / 角色显示在网格中

### Filtering Characters / 筛选角色

Use filter toolbar to narrow results / 使用筛选工具栏缩小结果：
- **Game / 游戏**: Filter by game title / 按游戏筛选
- **Rarity / 稀有度**: ★3, ★4, ★5, ★6 etc. / 3星、4星、5星、6星等
- **Element / 元素**: Fire, Water, Wind, etc. / 火、水、风等
- **Search / 搜索**: Search by character name / 按角色名搜索

### Batch Operations / 批量操作

1. **Select Multiple / 多选**: Ctrl+Click or drag select / Ctrl+点击或框选
2. **Batch Download / 批量下载**: Click "Download Selected" / 点击 "下载选中"
3. **Add to Canvas / 添加到画布**: Click "Add to Canvas" / 点击 "添加到画布"

### Import/Export Database / 导入/导出数据库

**Export / 导出**: Settings → Export Database → Save JSON file / 设置 → 导出数据库 → 保存 JSON 文件

**Import / 导入**: Settings → Import Database → Select JSON file / 设置 → 导入数据库 → 选择 JSON 文件

## Settings / 设置

| Setting / 设置 | Description / 描述 | Default / 默认 |
|---------------|-------------------|---------------|
| Default Game / 默认游戏 | Game shown on open / 打开时显示的游戏 | Reverse: 1999 |
| Image Quality / 图片质量 | Thumbnail/Medium/High / 缩略图/中等/高清 | High / 高清 |
| Auto Add to Canvas / 自动添加到画布 | Auto-add on click / 点击时自动添加 | Off / 关闭 |

## Requirements / 要求

- MeowThink >= 0.56.0
- Network access to wiki sites / 网络访问 Wiki 站点
