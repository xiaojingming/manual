# CSC Release Notes Page Design

## Context

CSC 文档集目前缺少一个版本更新记录页面。用户希望新增一个 **Release Notes** 页面，嵌入 GitHub 仓库中的静态 markdown 文件，使得每次更新 GitHub 仓库后，文档站上的 release notes 自动同步，无需重新部署站点。

## Goals

1. 在 `/csc` 文档侧边栏新增 "Release Notes" 页面
2. 页面内容通过浏览器端 `fetch` 从 `raw.githubusercontent.com` 实时拉取
3. 中英文站点共用同一套 release notes 内容
4. 处理好加载状态、错误提示和样式一致性

## Non-Goals

- 不支持私有仓库（当前需求为公开仓库）
- 不实现服务端代理或构建时拉取（用户明确要求客户端实时获取）
- 不提供离线缓存或 PWA 功能

## Architecture

```
┌─────────────────────────────────┐
│  docs-csc/release-notes.mdx     │  English source page
│  (imports RemoteMarkdown)       │
├─────────────────────────────────┤
│  i18n/zh/.../release-notes.mdx  │  Chinese mirror page
│  (identical import)             │
├─────────────────────────────────┤
│  src/components/RemoteMarkdown  │  Reusable React component
│  - fetch(url)                   │
│  - react-markdown rendering     │
│  - loading / error states       │
├─────────────────────────────────┤
│  sidebars-csc.ts                │  Sidebar registration
└─────────────────────────────────┘
```

## Component Design: `RemoteMarkdown`

### Props

| Prop | Type   | Required | Description                          |
|------|--------|----------|--------------------------------------|
| `url`  | string | Yes      | Raw GitHub URL of the markdown file  |

### State Machine

```
[mount] → loading → success → rendered markdown
              ↓
            error → error message UI
```

### Rendering Pipeline

1. `useEffect` 中调用 `fetch(url)` 获取纯文本 markdown
2. 使用 `react-markdown` + `remark-gfm` 将 markdown 字符串转换为 React 元素
3. 自定义 `components`：
   - `<a>`：外部链接用原生 `<a target="_blank">`；内部链接用 Docusaurus `Link`
   - 标题、段落、列表等标准元素继承 Docusaurus `.markdown` 样式
4. 外层包裹 `<div className="markdown">` 以复用文档主题 CSS

### Error Handling

| Scenario                | UI Behavior                                      |
|-------------------------|--------------------------------------------------|
| Network failure / CORS  | 显示红色错误提示，附带手动访问链接               |
| HTTP 404                | 提示文件未找到，建议检查 URL                     |
| HTTP 429 / 500          | 提示 GitHub 服务受限，建议稍后重试               |
| Slow loading (>3s)      | 显示 "Loading..." 文本，无需骨架屏               |

### CORS Considerations

`raw.githubusercontent.com` 对公开仓库返回 `Access-Control-Allow-Origin: *`，因此浏览器端 `fetch` **不会触发 CORS 拦截**。但中国大陆用户访问 GitHub 可能存在网络不稳定情况，错误提示中应明确告知用户这是网络问题而非站点故障。

## Files to Create / Modify

### New Files

- `src/components/RemoteMarkdown/index.tsx` — 远程 markdown 渲染组件
- `docs-csc/release-notes.mdx` — 英文 release notes 页面
- `i18n/zh/docusaurus-plugin-content-docs-csc/current/release-notes.mdx` — 中文镜像页面

### Modified Files

- `sidebars-csc.ts` — 在 `overview` 之后注册 `release-notes`
- `package.json` — 新增 `react-markdown` 和 `remark-gfm` 依赖

## Styling

`react-markdown` 输出的是标准 HTML 标签（`h1`, `p`, `ul`, `pre`, 等）。将这些标签放在 `.markdown` 容器内即可自动继承 Docusaurus 文档主题的排版样式，无需额外 CSS。

## i18n

中英文页面共用同一 GitHub URL，因此中文镜像文件只需复制英文源文件的 frontmatter 和组件引用，无需单独翻译 release notes 内容。

## Verification

1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run start`
3. 访问 `/csc/release-notes`
4. 确认：
   - 页面出现在 CSC 侧边栏中
   - markdown 内容正确渲染（标题、列表、代码块、表格）
   - 外部链接可点击且在新标签页打开
   - 断网时能显示友好的错误提示
5. 运行构建：`npm run build` 必须成功
6. 运行类型检查：`npm run typecheck` 必须通过
