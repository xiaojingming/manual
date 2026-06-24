---
sidebar_position: 1
---

# CSC 4.2 版本更新指南

> 本文面向正在使用或准备升级 CSC 的开发者，基于 4.2.0 到 4.2.6 的更新内容，提炼出对日常使用最有价值的变化、升级收益和推荐用法。

## 一句话总结

CSC 4.2 系列的重点不是单点功能堆叠，而是围绕 **会话恢复更可靠、上下文管理更稳、OpenAI 兼容层更可用、中文与国际化体验更完整、安全漏洞及时修复** 进行系统性打磨。

如果你正在使用 4.2.0、4.2.1、4.2.2 或 4.2.3，建议直接升级到 4.2.6。升级后，你会获得更稳定的长会话体验、更好的 Windows 与旧配置兼容性，以及更可靠的第三方模型接入能力。

## 推荐升级人群

- **经常恢复历史会话的用户**：4.2 系列持续增强 `--resume`、`--continue`、session 文件查找和旧配置目录回退，能降低历史会话找不到、恢复失败或状态丢失的概率。
- **使用长上下文任务的用户**：4.2.6 默认启用 reactive compact，并恢复 prompt-too-long 自动压缩重试，让长任务更容易自动续航。
- **接入 OpenAI 兼容模型的团队**：4.2.4 到 4.2.6 持续补强 OpenAI provider 的重试、错误转换和 structured output 支持，适合接入 Ollama、DeepSeek、vLLM 或其他兼容端点。
- **中文用户和双语团队**：4.2.5 重点修复 i18n、CJK 宽度、菜单快捷键和用户可见文案，终端界面在中文环境下更自然。
- **关注安全合规的团队**：4.2 系列多次通过 dependency overrides 和依赖升级修复 high 级漏洞，建议尽快跟进。

## 版本主线

| 版本 | 关键词 | 对用户的价值 |
| --- | --- | --- |
| 4.2.6 | 重试、Reactive Compact、安全修复 | API 更抗抖动，长上下文自动压缩更可靠，修复多项 high 级漏洞 |
| 4.2.5 | i18n、构建控制、消息元数据 | 中文体验更自然，流式消息 ID 更一致，构建可按需启用 API |
| 4.2.4-beta | 工具结果合并、OpenAI 重试、Session 查找 | 减少消息开销，提升第三方模型稳定性，恢复历史会话更容易 |
| 4.2.3 | `/goal` 目标管理 | 可以给当前会话设定目标，并在恢复会话后继续追踪 |
| 4.2.2 | Session Warm Pool、Knowledge Hub | 降低首条消息延迟，增强知识库更新能力 |
| 4.2.1 | Agent 面板与 UI 修复 | 代理状态、上下文和模型信息展示更清晰 |
| 4.2.0 | Legacy 兼容、workspace 重命名 | 从旧目录和旧包命名迁移到 CoStrict 体系更顺滑 |

## 重点变化与使用建议

### 1. 会话恢复和旧配置兼容更可靠

4.2.0 开始，CSC 全面补齐旧配置目录回退，覆盖 session 扫描、文件历史、粘贴缓存、统计缓存、备份、memory、插件市场和用户规则发现等路径。后续版本继续修复 session resume、文件加载、大小写不敏感匹配和 assistant prompt fallback。

这意味着从旧版工具或早期 CSC 迁移时，不需要立即手动搬迁全部历史配置。CSC 会优先使用新的 CoStrict 路径，并在必要时自动回退到 legacy 目录。

常用方式：

```bash
csc --continue
csc --resume <session-id>
```

适合场景：

- 换机器或升级版本后继续历史任务；
- Windows 环境中恢复旧 session；
- 项目路径大小写变化后继续查找会话；
- 保留旧配置，同时逐步迁移到 `~/.costrict/` 体系。

### 2. 长上下文任务更稳

4.2.2 引入 Session Warm Pool 和 context prewarm，用于降低首条消息延迟。4.2.4 增强 message routing 和 token 使用统计，4.2.6 默认启用 reactive compact，并恢复 prompt-too-long 自动压缩重试。

对用户来说，长任务的体验会更接近“自动续航”：当上下文逐渐接近模型上限时，CSC 会更积极地压缩上下文；当请求因为 prompt 太长失败时，也能尝试自动压缩后重试，而不是直接中断。

建议用法：

- 大型重构、长时间排查、跨多文件任务中优先使用最新版；
- 使用 `/goal` 明确任务目标，让恢复后的会话更容易延续上下文；
- 遇到上下文过长时，优先让 CSC 自动压缩，不必立即手动拆分会话。

### 3. OpenAI 兼容层更适合生产使用

4.2.4 为 OpenAI 兼容层接入共享 `withRetry` 包装器，并将 OpenAI 错误转换为 CSC 内部兼容的错误格式。4.2.6 进一步加入 429/529 统一重试机制，并把重试错误处理抽到共享模块。

这对使用第三方模型端点的团队很重要：临时限流、服务繁忙或兼容层错误不再只是一次性失败，而是进入统一重试路径，错误呈现也更接近 CSC 原生 provider 的体验。

示例配置：

```bash
export COSTRICT_USE_OPENAI=1
export OPENAI_API_KEY=<your-api-key>
export OPENAI_BASE_URL=<your-openai-compatible-endpoint>
export OPENAI_MODEL=<your-model>

csc
```

4.2.4 还修复了 OpenAI structured output 被静默丢弃的问题，会正确映射到 `response_format` 的 `json_schema`。如果你的工作流依赖结构化输出、工具调用或自动化解析，建议至少升级到 4.2.4-beta，生产环境建议升级到 4.2.6。

### 4. `/goal` 让长会话目标更清晰

4.2.3 新增 `/goal` 命令，用来设置、清除和显示当前会话目标。目标状态会参与 query loop，并在 `--resume` / `--continue` 恢复会话时还原。

示例：

```text
/goal 修复登录失败问题，补充回归测试，并确保 bun run typecheck 通过
```

推荐在这些场景中使用：

- 修复复杂 bug 前，先写清楚验收标准；
- 多轮重构中，让 CSC 持续记住最终目标；
- 中断后恢复会话，避免偏离原任务；
- 与团队协作时，用目标描述统一上下文。

### 5. 中文与国际化体验更完整

4.2.5 是 i18n 体验的重要版本。该版本完成了基于 6 维度审计报告的全面修复，统一 Agent、Vault、Plan 等术语翻译，外部化安全消息、pipe/IPC 文案，并修复 CJK 宽度计算与 `t()` 空字符串回退。

同时，locales 目录从 `src/locales/` 迁移到项目根目录 `locales/`，解决 packages 在 bundled 模式下的路径别名兼容问题。权限菜单、MCP 菜单、ConfigTool 设置、工具校验消息和快捷键提示也完成了更多外部化处理。

用户能感知到的变化包括：

- 中文菜单和提示更完整；
- 中英文混排时终端宽度更准确；
- 权限和 MCP 相关提示不再夹杂未翻译文本；
- i18n 自动扫描覆盖源码、locale、组件契约和 CLI 子进程冒烟测试。

### 6. 安全漏洞持续修复

4.2 系列持续处理依赖安全问题：

- 4.2.1 升级 `shell-quote`、`exporter-prometheus`、`tmp` 等漏洞依赖；
- 4.2.2 强制 `@grpc/grpc-js >= 1.14.4`；
- 4.2.3 强制 `esbuild >= 0.28.1`；
- 4.2.4-beta 通过 overrides 覆盖 `form-data`、`protobufjs`、`ws` 等高危依赖；
- 4.2.6 修复 `hono` 与 `undici` 的 4 个 high 级安全漏洞。

如果你在企业环境、CI/CD 或远程开发环境中使用 CSC，建议优先跟进这些安全修复版本。

## 从 4.2.0 升级到 4.2.6 后的用户感知

升级到 4.2.6 后，最明显的变化不是界面大改，而是日常使用中的失败率降低：

- 恢复历史会话更容易成功；
- 长上下文任务更少因为 prompt 过长中断；
- OpenAI 兼容端点遇到 429/529 时更有机会自动恢复；
- 中文终端界面更一致；
- 权限、MCP、配置类提示更清晰；
- 依赖漏洞风险更低。

对于高频使用 CSC 的开发者，这些改动会直接影响连续工作体验：少一些手动恢复、少一些重复提问、少一些因为 provider 抖动导致的任务中断。

## 升级建议

### 推荐版本

建议直接升级到 **4.2.6**。它包含 4.2.0 到 4.2.5 的全部改进，并额外修复了重试、自动压缩、安全漏洞和菜单 i18n 问题。

```bash
npm install -g @costrict/csc@latest
csc --version
```

### 升级前检查

- 如果你仍在使用旧配置目录，确认 `~/.costrict/` 配置目录正常。
- 如果你使用 OpenAI 兼容 provider，确认 `OPENAI_BASE_URL`、`OPENAI_API_KEY` 和 `OPENAI_MODEL` 已配置。
- 如果你依赖中文界面，升级后建议运行一次常用流程，确认菜单、权限提示和 MCP 配置展示符合预期。
- 如果你在 CI 或企业镜像中使用 CSC，建议重新安装依赖，确保安全 overrides 生效。

## 版本详情

### 4.2.6：稳定性与安全修复

4.2.6 聚焦运行时稳定性。该版本默认启用 reactive compact，恢复 prompt-too-long 自动压缩重试，并修复 API 重试消息格式、MCP 配置 ENOENT 错误分类、权限/MCP 菜单 i18n 与快捷键问题。

OpenAI 兼容层新增 429/529 统一重试机制，并补充对应测试。依赖层面修复 `hono` 与 `undici` 的多个 high 级安全漏洞。

### 4.2.5：i18n 与构建控制

4.2.5 是中文体验和国际化质量的重要版本。它完成了术语统一、CJK 宽度修复、用户可见文案外部化和 i18n L1-L4 扫描测试补强。

同时，该版本新增 `COSTRICT_ENABLED_API` 构建宏，支持在构建时覆盖启用的 API 集合；流式消息 metadata 也改为复用单一 `messageUUID`，让事件 ID、transcript 存储和最终 assistant message uuid 更一致。

### 4.2.4-beta：工具结果合并与 provider 稳定性

4.2.4-beta 新增 `mergeToolResults`，将 `tool_result` 合并到对应 `tool_use` 的 `output` 字段，减少消息数量并提升 API 效率。OpenAI provider 接入共享重试包装器，并支持 structured output 到 `response_format` 的正确映射。

该版本还增强 session 文件查找，支持 legacy 目录回退和大小写不敏感匹配，对 Windows 用户尤其有价值。

### 4.2.3：目标管理

4.2.3 新增 `/goal` 命令，把“当前会话要完成什么”变成显式状态。目标可以在会话恢复时还原，并集成到目标回合跟踪和达成检测中。

这适合长任务、复杂 bug 修复和多人协作场景，可以减少会话中途偏离目标的问题。

### 4.2.2：冷启动和知识库体验

4.2.2 引入 Session Warm Pool 和 context prewarm，用于降低首条消息延迟。Message Routing 支持 compaction 后 token 计算，Knowledge Hub 增加版本更新检测、批量更新和 UI 状态指示器。

该版本还修复 batch worker 孤儿进程、Ctrl+Z 无限循环，以及 session resume 和文件加载的 legacy 回退问题。

### 4.2.1：Agent 面板修复

4.2.1 主要改善 Agent Detail Panel 和相关 UI。Agent row 会显示上下文使用量和模型信息，状态栏也移除了噪音较高的标签和 cost 展示。

同时修复模型名显示、context row 布局、slash command suggestion panel 间距和 session resume 错误诊断。

### 4.2.0：CoStrict 体系迁移基础

4.2.0 是 4.2 系列的迁移基础版本。它全面添加旧配置目录兼容性回退，并将 workspace scope 从 `@ant` 迁移到 `@costrict`。

该版本也修复流式 API 错误时的 `session.error` 事件、session 去重和 `/memory` 面板路径不匹配问题，为后续版本的稳定性改进打下基础。

## 总结

CSC 4.2 系列的核心价值可以概括为三点：

1. **迁移更平滑**：旧配置、旧 session 和 legacy 目录可以继续被识别。
2. **长任务更稳定**：warm pool、reactive compact、prompt-too-long retry 和目标管理共同改善连续工作体验。
3. **兼容层更可靠**：OpenAI provider 的重试、错误转换和 structured output 支持让第三方模型接入更接近生产可用。

如果你希望在日常开发中获得更稳定的 CSC 体验，建议将 4.2.6 作为 4.2 系列的默认基线版本。
