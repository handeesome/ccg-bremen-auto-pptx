# CCG Bremen Auto PPTX

不来梅教会每周主日都需要准备 PPTX。这个项目把常见的内容整理和 PPTX 生成流程做成了一个 Flask Web App，帮助同工更快完成主日崇拜投影片和诗歌投影片。

## 功能概览

当前首页会先进入导航页，提供 3 个主要入口：

- `创建崇拜 PPTX`
  - 主流程，生成完整主日崇拜 PPTX
  - 包含事奉名单、经文、诗歌、活动报告、每月金句、祷告内容等
- `创建诗歌 PPTX`
  - 输入单首诗歌歌词
  - 手动整理分页预览后导出单首诗歌投影片
- `批量更换诗歌 PPTX 模板`
  - 上传旧版诗歌 PPTX
  - 批量提取歌词并重新生成新版模板文件

## 技术栈

- `Flask`
- `python-pptx`
- `requests`
- `BeautifulSoup`
- 前端原生 `HTML / CSS / JavaScript`

## 圣经文本来源

本项目的中文圣经经文使用《和合本修订版》2010 版，文本来源为香港圣经公会网站：[https://rcuv.hkbs.org.hk/](https://rcuv.hkbs.org.hk/)。

《和合本修订版》是在 1919 年《圣经－和合本》的基础上修订而成，原则是继承和合本在华人教会中熟悉、典雅、易于诵读的传统，同时按现代中文用法、圣经学术研究和古抄本资料的进展作必要修订。由于中文词汇和句法在一百多年间已有明显变化，原和合本部分用词在今日可能显得生僻或产生歧义；同时，死海古卷等文献发现和古抄本研究也为经文理解提供了更多参考。因此，本项目采用 2010 年出版的新旧约全书《和合本修订版》，使生成的主日崇拜投影片使用较新、较易明，同时仍延续华人教会熟悉传统的中文圣经文本。

## 项目结构

主要文件：

- [application.py](C:\Users\ducenhan\Desktop\ppt转pptx\ccg-bremen-auto-pptx\application.py)
  - Flask 入口
  - 路由定义
  - 文件导出与批处理 API
- [templates/index.html](C:\Users\ducenhan\Desktop\ppt转pptx\ccg-bremen-auto-pptx\templates\index.html)
  - 首页导航页
- [templates/worship.html](C:\Users\ducenhan\Desktop\ppt转pptx\ccg-bremen-auto-pptx\templates\worship.html)
  - 主日崇拜表单页
- [templates/song_diy.html](C:\Users\ducenhan\Desktop\ppt转pptx\ccg-bremen-auto-pptx\templates\song_diy.html)
  - 单首诗歌制作页
- [templates/song_import.html](C:\Users\ducenhan\Desktop\ppt转pptx\ccg-bremen-auto-pptx\templates\song_import.html)
  - 批量转换旧诗歌模板页
- [functions](C:\Users\ducenhan\Desktop\ppt转pptx\ccg-bremen-auto-pptx\functions)
  - PPTX 生成逻辑
  - 旧诗歌导入与内容提取逻辑
- [static](C:\Users\ducenhan\Desktop\ppt转pptx\ccg-bremen-auto-pptx\static)
  - CSS、JS、logo、临时数据和前端资源

## 本地运行

### 1. 克隆仓库

```bash
git clone https://github.com/handeesome/ccg-bremen-auto-pptx.git
cd ccg-bremen-auto-pptx
```

### 2. 创建虚拟环境

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

macOS / Linux:

```bash
python -m venv venv
source venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 启动项目

```bash
python application.py
```

启动后访问：

- [http://localhost:5000/](http://localhost:5000/)

## 当前页面路由

- `/`
  - 导航页
- `/worship-pptx`
  - 主日崇拜 PPTX 页面
- `/song-diy`
  - 单首诗歌制作页面
- `/song-import`
  - 批量转换旧诗歌页面

## 使用说明

### 创建崇拜 PPTX

1. 进入 `/worship-pptx`
2. 填写崇拜类型、事奉名单、经文、诗歌、活动报告、祷告等内容
3. 点击“生成崇拜 PPTX”
4. 系统会生成并下载新的 PPTX

### 创建诗歌 PPTX

1. 进入 `/song-diy`
2. 输入诗歌名和歌词
3. 生成分页草稿
4. 调整预览顺序后下载

### 批量更换诗歌 PPTX 模板

1. 进入 `/song-import`
2. 上传多个旧版 `.pptx`
3. 系统会自动分批处理
4. 处理完成后下载单个文件或 zip 包

## 重要注意事项

- 生成后的音频默认不一定已经设置为跨页播放，仍可能需要在 PowerPoint 里手动调整
- 项目会在 `static/temp` 下创建临时文件
- 如果部署到公网，建议注意上传大小、磁盘空间和临时文件清理

## 部署建议

如果想让所有有网络的人都能访问，这个项目需要部署到一个公开可访问的服务上。

推荐：

- `Render`
- `Railway`
- `AWS`
- `Google Cloud Run`
- `Azure App Service`

不太推荐仅使用 `Vercel`：

- 这个项目不是纯静态页面
- 它包含 Python 后端、文件上传、临时文件写入和 PPTX 生成
- 这类工作更适合常规服务或容器平台，而不是轻量 serverless 前端托管

## 生产部署前建议

- 增加 `gunicorn` 启动配置
- 配置环境变量和日志
- 为上传和导出接口设置大小限制
- 定期清理 `static/temp`
- 如有需要，可加入用户认证或简单访问保护

## 贡献

如果你想继续改进这个项目：

1. 新建分支
2. 修改代码
3. 本地测试
4. 提交 Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
