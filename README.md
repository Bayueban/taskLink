# TaskLink - 关联空间

<div align="center">

一个功能强大的**可视化任务管理**和**思维导图**系统，让待办事项不再孤立，通过节点连接建立任务之间的关联关系。

[在线体验](https://banyueban-task-link.vercel.app/) | [功能演示](#功能特性) | [快速开始](#快速开始)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-4.4-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## ✨ 功能特性

### 🎯 核心功能

- **📝 任务清单管理** - 快速创建、编辑、完成和删除待办任务
- **🎨 可视化画布** - 在无限画布上自由组织任务节点，建立空间化的任务视图
- **🔗 关联连线** - 通过可视化连线建立任务之间的依赖、关联或逻辑关系
- **🗂️ 多工作区** - 支持创建多个独立工作区，分别管理不同项目或主题
- **💾 本地持久化** - 基于 IndexedDB 的本地存储，数据安全可靠且支持离线使用
- **📸 图片支持** - 直接粘贴图片创建图片节点，丰富内容表达

### 🎨 交互体验

- **🖱️ 流畅操作**
  - 拖拽节点自由移动和布局
  - 双击画布快速创建新节点
  - 拖拽调整节点大小
  - 一键重置节点尺寸
  
- **🔍 画布控制**
  - 无限画布平移（拖拽或滚轮）
  - 缩放功能（Alt + 滚轮 或 快捷键）
  - 小地图导航快速定位
  - 缩放工具栏精确控制

- **🎨 个性定制**
  - 8 种颜色主题标记任务类型
  - 可调节连线样式（粗细、虚实）
  - 响应式界面适配不同屏幕

### 📦 数据管理

- **自动保存** - 编辑内容实时保存，无需手动操作
- **工作区隔离** - 每个工作区独立管理任务、节点和视图状态
- **数据导入导出** - 支持工作区数据的备份和迁移（计划中）

---

## 🚀 快速开始

### 环境要求

- Node.js 16+ 
- npm 或 pnpm

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（推荐）
pnpm install
```

### 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

访问 `http://localhost:5173` 即可开始使用。

### 构建生产版本

```bash
# 使用 npm
npm run build

# 或使用 pnpm
pnpm build
```

构建产物将生成在 `dist` 目录。

---

## 📖 使用指南

### 工作区管理

<table>
<tr><th>操作</th><th>说明</th></tr>
<tr><td><b>创建工作区</b></td><td>点击左侧面板底部的「新建工作区」按钮，输入名称后按 Enter</td></tr>
<tr><td><b>切换工作区</b></td><td>点击工作区列表中的工作区名称</td></tr>
<tr><td><b>重命名工作区</b></td><td>悬停在工作区上，点击编辑图标（铅笔），修改后按 Enter</td></tr>
<tr><td><b>删除工作区</b></td><td>悬停在工作区上，点击删除图标（垃圾桶）<br><i>注：至少保留一个工作区</i></td></tr>
</table>

> 💡 **提示**：每个工作区拥有完全独立的任务、节点、连线和视图状态，适合按项目或主题分类管理。

### 任务管理

#### 添加任务

1. 在左侧面板输入任务标题（必填）
2. 输入任务描述内容（可选）
3. 点击「添加任务」按钮或在描述框中按 `Ctrl+Enter`

> 添加任务后，画布上会自动创建对应的任务节点

#### 管理任务

- **完成任务**：点击任务前的复选框
- **删除任务**：悬停在任务上，点击右侧的删除按钮
- **定位节点**：点击任务项，自动在画布中定位并选中对应节点

### 画布操作

#### 节点操作

| 操作 | 方法 |
|------|------|
| **创建节点** | 双击画布空白处 或 添加任务时自动创建 |
| **选中节点** | 点击节点 |
| **移动节点** | 拖拽节点到目标位置 |
| **调整大小** | 选中后拖拽右下角的调整手柄 |
| **重置大小** | 选中后点击工具栏的重置按钮 |
| **编辑标题** | 选中后直接在标题区域编辑 |
| **编辑内容** | 选中后直接在内容区域编辑 |
| **更改颜色** | 选中后在工具栏选择颜色 |
| **删除节点** | 选中后按 `Delete` 或 `Backspace` |

#### 连线操作

1. **创建连线**
   - 选中源节点
   - 点击节点工具栏的连线按钮（链接图标）
   - 点击目标节点完成连线

2. **编辑连线**
   - 点击连线显示工具栏
   - 可调整线条粗细（细、中、粗）
   - 可切换线条样式（实线、虚线）

3. **删除连线**
   - 悬停在连线上
   - 点击出现的删除按钮

4. **取消连线模式**
   - 按 `Esc` 键
   - 点击画布空白处

#### 画布控制

| 功能 | 操作方法 |
|------|---------|
| **平移画布** | 拖拽画布空白处 或 滚轮（横向/纵向） |
| **缩放画布** | `Alt + 滚轮` 或 `Alt + +/-` 或 顶部缩放工具栏 |
| **重置缩放** | `Alt + 0` 或 点击缩放工具栏的 100% 按钮 |
| **快速定位** | 使用右上角小地图点击目标区域 |

#### 图片节点

1. 在其他应用中复制图片（如截图、浏览器中的图片等）
2. 在画布上按 `Ctrl+V` 粘贴
3. 自动创建图片节点，可像普通节点一样移动和调整大小

---

## ⌨️ 快捷键

<table>
<tr><th>快捷键</th><th>功能</th></tr>
<tr><td><code>Ctrl + Enter</code></td><td>快速添加任务（在描述框中）</td></tr>
<tr><td><code>Delete</code> / <code>Backspace</code></td><td>删除选中的节点</td></tr>
<tr><td><code>Esc</code></td><td>取消选择 / 取消连线模式</td></tr>
<tr><td><code>Alt + 滚轮</code></td><td>缩放画布</td></tr>
<tr><td><code>Alt + +</code></td><td>放大画布</td></tr>
<tr><td><code>Alt + -</code></td><td>缩小画布</td></tr>
<tr><td><code>Alt + 0</code></td><td>重置缩放（100%）</td></tr>
<tr><td><code>Ctrl + V</code></td><td>粘贴图片到画布</td></tr>
</table>

---

## 🛠️ 技术栈

- **框架**：React 18
- **语言**：TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **数据库**：Dexie.js (IndexedDB 封装)
- **部署**：Vercel

---

## 📦 部署

### 部署到 Vercel（推荐）

1. Fork 本仓库到你的 GitHub 账号
2. 在 [Vercel](https://vercel.com) 中导入项目
3. Vercel 会自动检测 Vite 配置并部署
4. 每次推送代码到 `main` 分支会自动重新部署

### 部署到 GitHub Pages

1. 修改 `vite.config.ts` 中的 `base` 配置：

```typescript
export default defineConfig({
  base: '/your-repo-name/', // 替换为你的仓库名
  // ...
})
```

2. 推送代码到 GitHub

3. 在仓库设置中启用 GitHub Pages，选择 GitHub Actions 作为部署源

4. 项目已配置 GitHub Actions 工作流（`.github/workflows/deploy.yml`），推送后会自动构建部署

### 其他平台部署

本项目是纯静态应用，可部署到任何支持静态网站的平台：

- Netlify
- Cloudflare Pages  
- AWS S3 + CloudFront
- 阿里云 OSS
- 腾讯云 COS

只需将 `dist` 目录的内容部署即可。

---

## 🗄️ 数据存储

### 存储方式

- 使用 **IndexedDB** 在浏览器本地存储所有数据
- 支持离线使用，无需网络连接
- 数据仅存储在本地浏览器，保护隐私

### 数据结构

- **Workspaces**：工作区信息（名称、ID）
- **Todos**：任务数据（标题、内容、完成状态）
- **Nodes**：画布节点（位置、尺寸、颜色）
- **Edges**：连线数据（起点、终点、样式）
- **ViewStates**：视图状态（缩放、平移位置）

### 数据安全

> ⚠️ **注意**：清除浏览器数据会导致所有任务丢失，建议定期备份重要数据。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 React Hooks 最佳实践
- 保持代码简洁清晰
- 添加必要的注释

---

## 📝 更新日志

查看 [CHANGELOG_v2.0.md](./CHANGELOG_v2.0.md) 了解版本更新详情。

---

## 📄 许可证

本项目采用 [MIT](https://opensource.org/licenses/MIT) 许可证。

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

如果觉得这个项目对你有帮助，欢迎 ⭐ Star 支持一下！

---

<div align="center">

Made with ❤️ by [Bayueban](https://github.com/Bayueban)

[GitHub](https://github.com/Bayueban/taskLink) · [在线演示](https://banyueban-task-link.vercel.app/)

</div>
