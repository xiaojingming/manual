# AI Coding 指南

> **重要**: 本指南是你执行该项目所有开发任务的核心依据，具备强制约束力，需全程严格遵守。
---
1. 各章节使用说明
   - **项目概览**：你在开始任何开发任务前，必须先阅读本部分，帮你快速掌握项目基础信息、技术栈和架构边界；
   - **项目结构**：本部分核心是帮你建立项目全局认知和导航索引；
     承接需求时，你要通过目录树快速定位功能对应的文件位置、关联代码；
     新增代码文件时，需按规范放入对应目录；
   - **开发规范**：这是你编码全流程的核心遵循依据，命名、接口、日志/异常处理等所有编码行为，必须严格遵循条款要求；
   - **常用命令**：当你需要执行构建、测试、部署等操作时，必须优先使用本部分标注的高频命令；
   - **通用最佳实践**：这是你设计、编码、代码交付前自检的核心准则，交付前需逐条核验，确保代码符合相关原则。
2. 条款效力：
   - 核心约束类条款（标注「必须/禁止」）需无条件严格执行，无用户显式豁免时，不得修改、规避或违反；
   - 指导性建议类条款（标注「应/建议」）需优先参考执行，可结合实际开发场景灵活调整。
---

## 项目概览
### 基本信息
- 项目名称：costrict
- 项目简介：costrict 文档网站，包含 Plugin 和 CLI 两部分文档，支持中英文双语
- 项目规模：小型（约 184 个文件）
- 开发语言：TypeScript
- 整体架构：文档网站（Docusaurus）
- 分支：feature/refactor-v1
- commit: `79ec679`
- 生成时间：2026-03-02 16:56:35

### 技术栈
- 前端框架：React 19.0.0
- 文档框架：Docusaurus 3.8.1
- 搜索插件：@easyops-cn/docusaurus-search-local 0.51.1
- 代码高亮：prism-react-renderer 2.3.0
- 语言：TypeScript 5.6.2
- Node.js：>=18.0

## 项目结构
```
project_root/
├─ docs/                        # Plugin 英文文档：产品功能/部署/计费文档
│  ├─ best-practices/           # 最佳实践：用户使用指南文档
│  ├─ billing/                  # 计费文档：购买/服务/使用说明
│  ├─ deployment/               # 部署文档：Docker/Higress 部署指南
│  ├─ FAQ-img/                  # FAQ 图片：常见问题截图资源
│  ├─ guide/                    # 使用指南：安装/快速入门文档
│  │  ├─ basic_feature/         # 基础功能：核心功能说明文档
│  │  ├─ install/               # 安装指南：详细安装步骤文档
│  │  └─ login/                 # 登录指南：账号登录流程文档
│  ├─ policy/                   # 政策文档：隐私政策/服务条款
│  ├─ product-features/         # 产品功能：AI Agent/代码审查/MCP 等
│  │  └─ Skills/                # Skills 功能：自定义技能配置文档
│  ├─ tutorial-videos/          # 教程视频：产品使用视频资源
│  └─ version-notes/            # 版本说明：各版本更新日志
├─ docs-cli/                    # CLI 英文文档：命令行工具相关文档
│  ├─ best-practices/           # CLI 最佳实践：使用技巧文档
│  ├─ billing/                  # CLI 计费：CLI 版本计费说明
│  ├─ config/                   # CLI 配置：快捷键/主题/模型配置
│  ├─ deployment/               # CLI 部署：部署相关文档
│  ├─ guide/                    # CLI 指南：安装/功能/IDE 集成
│  ├─ img/                      # CLI 图片：文档截图资源
│  ├─ policy/                   # CLI 政策：服务条款文档
│  └─ product-features/         # CLI 功能：Notify/ACP/TDD 等
├─ i18n/                        # 国际化：中英文翻译文件目录
│  └─ zh/                       # 中文翻译：所有文档的中文版本
│     ├─ docusaurus-plugin-content-docs/        # Plugin 中文文档
│     ├─ docusaurus-plugin-content-docs-cli/    # CLI 中文文档
│     ├─ docusaurus-theme-classic/              # 主题文本翻译
│     └─ code.json                              # 代码文本翻译
├─ src/                         # 源码目录：React 组件和自定义样式
│  ├─ components/               # React 组件：自定义 UI 组件
│  │  └─ DownloadButton/        # 下载按钮：版本下载按钮组件
│  └─ css/                      # 样式文件：全局 CSS 样式
├─ scripts/                     # 脚本目录：Git Hooks/部署脚本
│  ├─ install-git-hooks.sh      # 安装钩子：Git Hooks 安装脚本
│  ├─ pre-push                  # 推送钩子：Git pre-push 钩子脚本
│  └─ setup-project.sh          # 项目脚本：项目初始化脚本
├─ static/                      # 静态资源：图片/视频等公共资源
│  ├─ img/                      # 公共图片：全局图片资源
│  ├─ videos/                   # 公共视频：全局视频资源
│  └─ .nojekyll                 # Jekyll 禁用：GitHub Pages 配置
├─ .github/                     # GitHub 配置：CI/CD/Issue 模板
├─ .roo/                        # Roo 配置：Roo Code 工具配置
├─ build/                       # 构建输出：Docusaurus 构建产物
├─ .docusaurus/                 # Docusaurus 缓存：框架运行时缓存
├─ node_modules/                # 依赖包：npm 安装的 node 模块
├─ origin/                      # 原始文件：备份或原始文档
├─ Dockerfile                   # Docker 配置：容器化构建配置
├─ nginx.conf                   # Nginx 配置：反向代理配置
├─ package.json                 # 依赖配置：项目依赖和脚本命令
├─ package-lock.json            # 依赖锁定：npm 依赖版本锁定
├─ docusaurus.config.ts         # Docusaurus 配置：站点/主题/插件配置
├─ sidebars.ts                  # 侧边栏配置：Plugin 文档导航结构
├─ sidebars-cli.ts              # CLI 侧边栏：CLI 文档导航结构
├─ tsconfig.json                # TypeScript 配置：编译器选项配置
├─ type.d.ts                    # 类型声明：全局 TypeScript 类型
├─ README.md                    # 项目说明：项目介绍和快速指南
├─ AGENTS.md                    # AI 助手说明：项目结构和开发指南
├─ test-chinese-check.js        # 中文检查：翻译完整性检查脚本
└─ .gitignore                   # Git 忽略：版本控制忽略规则
```

### Git 提交历史分析（近 6 个月）
**高频修改目录（按修改次数排序）：**
1. `i18n/zh/docusaurus-plugin-content-docs/` - 157 次（中文文档同步）
2. `docs/deployment/` - 11 次（部署文档更新）
3. `docs/product-features/strict-mode.md` - 10 次（严格模式文档）
4. `docs/deployment/deploy-checklist.md` - 9 次（部署检查清单）
5. `i18n/zh/docusaurus-plugin-content-docs-cli/` - 11 次（CLI 中文文档）
6. `docs/FAQ.md` - 8 次（常见问题更新）
7. `docs/billing/` - 7 次（计费文档更新）
8. `docs-cli/guide/installation.md` - 6 次（安装指南）
9. `docs-cli/product-features/notify.md` - 4 次（通知功能文档）
10. `docusaurus.config.ts` - 4 次（站点配置调整）

**核心模块：**
- 文档内容：`docs/`, `docs-cli/` - 产品文档和 CLI 工具文档
- 国际化：`i18n/zh/` - 中文翻译文件
- 配置文件：`docusaurus.config.ts`, `sidebars.ts`, `sidebars-cli.ts`

**公共模块：**
- React 组件：`src/components/` - 可复用 UI 组件
- 样式文件：`src/css/` - 全局样式
- 脚本工具：`scripts/` - 构建和 Git 钩子脚本

## 开发规范

### 代码存放位置规范
- 英文文档必须放在 `docs/` 目录，按功能模块分类存放 [docs/product-features/]
- 中文文档必须放在 `i18n/zh/docusaurus-plugin-content-docs/current/`，结构与 docs 一致
- CLI 文档必须放在 `docs-cli/` 目录，中文翻译在 `i18n/zh/docusaurus-plugin-content-docs-cli/`
- React 组件必须放在 `src/components/` 目录，如 DownloadButton 组件
- 全局样式必须放在 `src/css/custom.css`，统一管理主题变量
- 静态资源（图片/视频）必须放在 `static/img/` 或 `static/videos/`，转换后的WebP文件与原文件放在同一目录
- 文档配套图片应放在对应文档目录的 `img/` 子目录 [docs/guide/img/]
- 配置文件必须放在项目根目录，如 docusaurus.config.ts

### 命名规范
- 文件命名：小写连字符式，如 `installation.md`、`strict-mode.md`
- 组件文件：大驼峰式，如 `DownloadButton/index.tsx`
- 配置文件：`.category_.json` 用于分组文档目录配置
- 分支命名：`feature/xxx` 用于新功能，`docs/xxx` 用于文档更新
- 提交信息：使用语义化前缀，如 `docs:`、`feat:`、`fix:`、`chore:`

### 文档编写规范
- 文档必须包含 frontmatter，指定 `sidebar_position` 控制排序 [docs/guide/installation.md:1-3]
- 英文文档禁止包含中文字符，由 Git 钩子自动检查 [scripts/pre-push:8-9]
- 一级标题 `#` 作为文档在侧边栏的显示标题
- 图片引用使用相对路径，如 `![img](./img/install.png)`
- 使用 `:::tip` 等 admonition 组件突出提示信息
- 分组文档目录必须包含 `_category_.json` 配置标签和位置

### 国际化规范
- 中英文文档结构必须保持一致，便于同步更新
- 翻译文件更新后需执行 `npm run write-translations` 生成导航翻译
- `code.json` 存放 UI 文本翻译，如按钮、提示等 [i18n/zh/code.json]
- 中文文档更新优先修改 `i18n/zh/` 下对应文件

### 配置文件管理规范
- `docusaurus.config.ts` 配置站点标题、主题、插件等核心参数
- `sidebars.ts` 配置 Plugin 文档侧边栏，使用 autogenerated 模式
- `sidebars-cli.ts` 配置 CLI 文档侧边栏，独立于 Plugin
- `tsconfig.json` 继承 `@docusaurus/tsconfig`，排除构建目录
- 敏感配置（如 API 密钥）禁止提交到代码仓库

### Git 和提交规范
- 禁止在 `main/master` 分支直接开发，必须创建 `feature/` 分支
- 提交前执行 `npm run build` 和 `npm run serve` 验证生产模式
- 推送前自动检查 docs 文件夹是否包含中文 [scripts/pre-push]
- PR 提交需遵守语义化规范，参考 `.github/semantic.yml`
- 使用 `git pull --rebase` 同步主线，避免合并提交

### 构建和部署规范
- Docker 构建使用多阶段构建，先 builder 后 runner [Dockerfile:1-18]
- Nginx 配置需包含旧路径重定向到 `/plugin/` 前缀 [nginx.conf:9-11]
- CI/CD 通过 GitHub Actions 自动部署，标签触发构建 [build.yml:3-6]
- 部署前验证 GPU 资源、模型接口、后端服务器配置 [docs/deployment/deploy-checklist.md]

### 代码质量规范
- TypeScript 类型检查必须通过 `npm run typecheck`
- 代码高亮使用 prism-react-renderer，支持 github 和 palenight 主题
- 搜索功能使用 `@easyops-cn/docusaurus-search-local`，配置中英文索引
- 组件开发使用 React 19，函数式组件优先
- 动态资源加载使用 `raw-loader`，如 DownloadButton 组件

### 错误处理规范
- 开发模式错误通过控制台输出，生产模式构建时检查
- 链接检查：`onBrokenLinks: 'warn'` 配置警告模式
- 中文检查：通过 `test-chinese-check.js` 或 CI 自动检查
- Docker 部署失败查看容器日志，使用 `docker compose logs`

### 图片优化规范
- 新增PNG/JPG图片后，应运行 `npm run convert-images` 生成WebP版本
- 保留原PNG/JPG文件作为备份，不要删除
- 图片命名使用小写连字符式，如 `quick-start.png`，WebP文件自动命名为 `quick-start.webp`
- 建议图片体积控制在500KB以内，超过500KB的图片会被优先转换
- WebP质量默认为80%，可在命令中通过 `--quality` 参数调整（范围1-100）
- 使用 `npm run build:optimized` 替代 `npm run build` 可在构建前自动转换新增图片

## 常用命令

```bash
# 开发调试
npm run start          # 启动中文开发服务器（localhost:3000）
npm run start:en       # 启动英文开发服务器
npm run serve          # 启动生产服务器（构建后使用）

# 构建和部署
npm run build          # 构建生产版本到 build/ 目录
npm run deploy         # 部署到 GitHub Pages
npm run clear          # 清除缓存和构建产物

# 国际化
npm run write-translations  # 生成/更新翻译文件
npm run write-heading-ids   # 生成文档标题 ID

# 工具和检查
npm run typecheck      # TypeScript 类型检查
npm run docusaurus     # Docusaurus CLI 工具
node test-chinese-check.js  # 检查 docs 文件夹是否包含中文
npm run install-hooks  # 安装 Git pre-push 钩子

# 图片转换
npm run convert-images          # 转换所有PNG/JPG图片为WebP格式（增量转换）
npm run convert-images:check    # 仅扫描图片并输出报告，不转换
npm run build:optimized         # 优化构建：先转换图片再构建站点

# Docker 相关
docker build -t costrict-manual .  # 构建 Docker 镜像
docker compose up -d               # 启动 Docker 容器
docker compose logs                # 查看容器日志
```

## 通用最佳实践
- 编码与设计严格遵循以下核心原则：
  - KISS 原则：代码逻辑简洁，无冗余实现；
  - DRY 原则：同类逻辑复用，不重复编写；
  - 单一职责原则：类/函数仅承担一项核心功能；
  - 单一数据源原则：同一业务数据仅从可信源获取，保证一致性；
  - 最小改动原则：仅修改满足需求的必要代码，不做无关联重构；
- 优先复用/借鉴项目现有工具类、业务逻辑及同类实现机制，不重复造轮子；
- 图片资源优先使用WebP格式，减小体积提升加载速度；
- 禁止过度设计：仅实现需求明确的功能，不添加无业务依据的扩展代码；
- 代码交付前完成全量自检：确保无语法、路径、依赖错误，且符合本清单所有约束。
