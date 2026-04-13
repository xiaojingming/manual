---
sidebar_position: 2
---

# 创建Plugins

> 创建自定义Plugins，通过Skills、代理、Hooks和 MCP 服务器扩展 CSC。

Plugins让你可以用自定义功能扩展 CSC，这些功能可以在项目和团队之间共享。本指南涵盖使用Skills、代理、Hooks和 MCP 服务器创建你自己的Plugins。

想要安装现有Plugins？请参阅发现和安装Plugins。如需完整技术规范，请参阅Plugins参考。

## 何时使用Plugins与独立配置

CSC 支持两种添加自定义Skills、代理和Hooks的方式：

| 方式                                                    | Skills名称          | 最适合                                                                                        |
| :---------------------------------------------------------- | :------------------- | :---------------------------------------------------------------------------------------------- |
| **独立配置**（`.claude/` 目录）                       | `/hello`             | 个人工作流、项目特定自定义、快速实验                          |
| **Plugins**（包含 `.claude-plugin/plugin.json` 的目录） | `/plugin-name:hello` | 与队友共享、向社区分发、版本发布、跨项目复用 |

**适合使用独立配置的情况**：

* 你正在为单个项目自定义 CSC
* 配置是个人使用的，不需要共享
* 你正在打包之前实验Skills或Hooks
* 你想要简短的Skills名称，如 `/hello` 或 `/deploy`

**适合使用Plugins的情况**：

* 你想与团队或社区共享功能
* 你需要在多个项目中使用相同的Skills/代理
* 你想对扩展进行版本控制和轻松更新
* 你正在通过市场分发
* 你可以接受带命名空间的Skills，如 `/my-plugin:hello`（命名空间防止Plugins之间的冲突）

> **💡 提示：** 先在 `.claude/` 中使用独立配置进行快速迭代，当你准备好共享时再转换为Plugins。

## 快速入门

本快速入门将引导你创建一个带有自定义Skills的Plugins。你将创建一个清单（定义Plugins的配置文件），添加一个Skills，并使用 `--plugin-dir` 标志在本地测试它。

### 前提条件

* CSC 已安装并认证

> **注意：** 如果你没有看到 `/plugin` 命令，请将 CSC 更新到最新版本。有关升级说明，请参阅故障排除。

### 创建你的第一个Plugins

#### 创建Plugins目录

每个Plugins都位于自己的目录中，包含清单和你的Skills、代理或Hooks。现在创建一个：

```bash
mkdir my-first-plugin
```

#### 创建Plugins清单

`.claude-plugin/plugin.json` 处的清单文件定义了Plugins的身份：其名称、描述和版本。CSC 使用此元数据在Plugins管理器中显示你的Plugins。

在你的Plugins文件夹中创建 `.claude-plugin` 目录：

```bash
mkdir my-first-plugin/.claude-plugin
```

然后创建 `my-first-plugin/.claude-plugin/plugin.json`，内容如下：

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

| 字段         | 用途                                                                                                |
| :------------ | :----------------------------------------------------------------------------------------------------- |
| `name`        | 唯一标识符和Skills命名空间。Skills以此作为前缀（例如 `/my-first-plugin:hello`）。 |
| `description` | 在Plugins管理器中浏览或安装Plugins时显示。                                       |
| `version`     | 使用语义版本控制跟踪发布。                  |
| `author`      | 可选。有助于归属标注。                                                                     |

有关 `homepage`、`repository` 和 `license` 等附加字段，请参阅完整的清单架构。

#### 添加Skills

Skills位于 `skills/` 目录中。每个Skills是一个包含 `SKILL.md` 文件的文件夹。文件夹名称成为Skills名称，并带有Plugins命名空间前缀（在名为 `my-first-plugin` 的Plugins中，`hello/` 创建 `/my-first-plugin:hello`）。

在你的Plugins文件夹中创建Skills目录：

```bash
mkdir -p my-first-plugin/skills/hello
```

然后创建 `my-first-plugin/skills/hello/SKILL.md`，内容如下：

```markdown
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

#### 测试你的Plugins

使用 `--plugin-dir` 标志运行 CSC 来加载你的Plugins：

```bash
csc --plugin-dir ./my-first-plugin
```

CSC 启动后，试试你的新Skills：

```shell
/my-first-plugin:hello
```

你会看到 Claude 用问候语回应。运行 `/help` 可以看到你的Skills列在Plugins命名空间下。

> **注意：** **为什么要命名空间？** PluginsSkills总是带命名空间的（如 `/my-first-plugin:hello`），以防止多个Plugins具有相同名称的Skills时发生冲突。要更改命名空间前缀，请更新 `plugin.json` 中的 `name` 字段。

#### 添加Skills参数

通过接受用户输入使你的Skills动态化。`$ARGUMENTS` 占位符捕获用户在Skills名称后提供的任何文本。

更新你的 `SKILL.md` 文件：

```markdown
---
description: Greet the user with a personalized message
---

# Hello Skill

Greet the user named "$ARGUMENTS" warmly and ask how you can help them today. Make the greeting personal and encouraging.
```

运行 `/reload-plugins` 以获取更改，然后尝试使用你的名字调用Skills：

```shell
/my-first-plugin:hello Alex
```

Claude 将按名字问候你。有关向Skills传递参数的更多信息，请参阅Skills。

你已经成功创建并测试了一个包含以下关键组件的Plugins：

* **Plugins清单**（`.claude-plugin/plugin.json`）：描述你的Plugins元数据
* **Skills目录**（`skills/`）：包含你的自定义Skills
* **Skills参数**（`$ARGUMENTS`）：捕获用户输入以实现动态行为

> **💡 提示：** `--plugin-dir` 标志对开发和测试很有用。当你准备好与他人共享你的Plugins时，请参阅创建和分发Plugins市场。

## Plugins结构概述

你已经创建了一个带有Skills的Plugins，但Plugins可以包含更多内容：自定义代理、Hooks、MCP 服务器和 LSP 服务器。

> **⚠️ 警告：** **常见错误**：不要将 `commands/`、`agents/`、`skills/` 或 `hooks/` 放在 `.claude-plugin/` 目录内。只有 `plugin.json` 放在 `.claude-plugin/` 中。所有其他目录必须位于Plugins根目录级别。

| 目录         | 位置    | 用途                                                                        |
| :---------------- | :---------- | :----------------------------------------------------------------------------- |
| `.claude-plugin/` | Plugins根目录 | 包含 `plugin.json` 清单（如果组件使用默认位置则可选） |
| `skills/`         | Plugins根目录 | 以 `<name>/SKILL.md` 目录形式的Skills                                        |
| `commands/`       | Plugins根目录 | 以扁平 Markdown 文件形式的Skills。新Plugins请使用 `skills/`                   |
| `agents/`         | Plugins根目录 | 自定义代理定义                                                       |
| `hooks/`          | Plugins根目录 | `hooks.json` 中的事件处理器                                                 |
| `.mcp.json`       | Plugins根目录 | MCP 服务器配置                                                      |
| `.lsp.json`       | Plugins根目录 | 用于代码智能的 LSP 服务器配置                                |
| `bin/`            | Plugins根目录 | Plugins启用时添加到 Bash 工具 `PATH` 的可执行文件        |
| `settings.json`   | Plugins根目录 | Plugins启用时应用的默认设置            |

> **注意：** **下一步**：准备好添加更多功能？跳转到开发更复杂的Plugins以添加代理、Hooks、MCP 服务器和 LSP 服务器。有关所有Plugins组件的完整技术规范，请参阅Plugins参考。

## 开发更复杂的Plugins

当你熟悉了基本Plugins后，就可以创建更复杂的扩展。

### 为Plugins添加Skills

Plugins可以包含代理Skills来扩展 Claude 的能力。Skills是模型调用的：Claude 根据任务上下文自动使用它们。

在Plugins根目录添加 `skills/` 目录，其中包含带有 `SKILL.md` 文件的Skills文件夹：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

每个 `SKILL.md` 需要包含 `name` 和 `description` 字段的前言，后跟指令：

```yaml
---
name: code-review
description: Reviews code for best practices and potential issues. Use when reviewing code, checking PRs, or analyzing code quality.
---

When reviewing code, check for:
1. Code organization and structure
2. Error handling
3. Security concerns
4. Test coverage
```

安装Plugins后，运行 `/reload-plugins` 来加载Skills。有关完整的Skills编写指南（包括渐进式披露和工具限制），请参阅代理Skills。

### 为Plugins添加 LSP 服务器

> **💡 提示：** 对于 TypeScript、Python 和 Rust 等常见语言，请从官方市场安装预构建的 LSP Plugins。仅在需要支持尚未覆盖的语言时才创建自定义 LSP Plugins。

LSP（语言服务器协议）Plugins为 Claude 提供实时代码智能。如果你需要支持没有官方 LSP Plugins的语言，可以通过在Plugins中添加 `.lsp.json` 文件来创建自己的 LSP Plugins：

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

安装你的Plugins的用户必须在其机器上安装语言服务器二进制文件。

有关完整的 LSP 配置选项，请参阅 LSP 服务器。

### 为Plugins附带默认设置

Plugins可以在Plugins根目录包含 `settings.json` 文件，以在Plugins启用时应用默认配置。目前仅支持 `agent` 键。

设置 `agent` 会将Plugins的一个自定义代理激活为主线程，应用其系统提示、工具限制和模型。这让Plugins可以在启用时默认改变 CSC 的行为方式。

```json
{
  "agent": "security-reviewer"
}
```

此示例激活了在Plugins `agents/` 目录中定义的 `security-reviewer` 代理。`settings.json` 中的设置优先于 `plugin.json` 中声明的 `settings`。未知键会被静默忽略。

### 组织复杂Plugins

对于包含许多组件的Plugins，按功能组织目录结构。有关完整的目录布局和组织模式，请参阅Plugins目录结构。

### 在本地测试Plugins

使用 `--plugin-dir` 标志在开发期间测试Plugins。这会直接加载你的Plugins，无需安装。

```bash
csc --plugin-dir ./my-plugin
```

当 `--plugin-dir` Plugins与已安装的市场Plugins同名时，本地副本在该会话中优先。这让你可以测试已安装Plugins的更改，而无需先卸载它。由托管设置强制启用的市场Plugins是唯一的例外，无法被覆盖。

当你对Plugins进行更改时，运行 `/reload-plugins` 以获取更新而无需重启。这会重新加载Plugins、Skills、代理、Hooks、Plugins MCP 服务器和Plugins LSP 服务器。测试你的Plugins组件：

* 使用 `/plugin-name:skill-name` 尝试你的Skills
* 检查代理是否出现在 `/agents` 中
* 验证Hooks是否按预期工作

> **💡 提示：** 你可以通过多次指定标志来一次加载多个Plugins：

```bash
csc --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

### 调试Plugins问题

如果你的Plugins没有按预期工作：

1. **检查结构**：确保你的目录位于Plugins根目录，而不是 `.claude-plugin/` 内
2. **单独测试组件**：分别检查每个Skills、代理和Hooks
3. **使用验证和调试工具**：有关 CLI 命令和故障排除技术，请参阅调试和开发工具

### 分享你的Plugins

当你的Plugins准备好分享时：

1. **添加文档**：包含带有安装和使用说明的 `README.md`
2. **为Plugins设置版本**：在 `plugin.json` 中使用语义版本控制
3. **创建或使用市场**：通过Plugins市场分发以供安装
4. **与他人测试**：在更广泛分发之前让团队成员测试Plugins

一旦你的Plugins进入市场，其他人可以使用发现和安装Plugins中的说明来安装它。

### 向官方市场提交Plugins

要向官方 Anthropic 市场提交Plugins，请使用以下应用内提交表单之一：

* **Claude.ai**：claude.ai/settings/plugins/submit
* **Console**：platform.claude.com/plugins/submit

> **注意：** 有关完整的技术规范、调试技术和分发策略，请参阅Plugins参考。

## 将现有配置转换为Plugins

如果你已经在 `.claude/` 目录中有Skills或Hooks，可以将它们转换为Plugins以便于共享和分发。

### 迁移步骤

#### 创建Plugins结构

创建一个新的Plugins目录：

```bash
mkdir -p my-plugin/.claude-plugin
```

在 `my-plugin/.claude-plugin/plugin.json` 创建清单文件：

```json
{
  "name": "my-plugin",
  "description": "Migrated from standalone configuration",
  "version": "1.0.0"
}
```

#### 复制现有文件

将你现有的配置复制到Plugins目录：

```bash
# Copy commands
cp -r .claude/commands my-plugin/

# Copy agents (if any)
cp -r .claude/agents my-plugin/

# Copy skills (if any)
cp -r .claude/skills my-plugin/
```

#### 迁移Hooks

如果你的设置中有Hooks，请创建Hooks目录：

```bash
mkdir my-plugin/hooks
```

创建 `my-plugin/hooks/hooks.json` 并配置你的Hooks。从 `.claude/settings.json` 或 `settings.local.json` 复制 `hooks` 对象，因为格式是相同的。命令通过 stdin 接收 JSON 格式的Hooks输入，因此使用 `jq` 提取文件路径：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix" }]
      }
    ]
  }
}
```

#### 测试迁移后的Plugins

加载你的Plugins以验证一切正常：

```bash
csc --plugin-dir ./my-plugin
```

测试每个组件：运行你的命令，检查代理是否出现在 `/agents` 中，并验证Hooks是否正确触发。

### 迁移时的变化

| 独立配置（`.claude/`）       | Plugins                           |
| :---------------------------- | :------------------------------- |
| 仅在一个项目中可用 | 可以通过市场共享   |
| 文件在 `.claude/commands/`  | 文件在 `plugin-name/commands/` |
| Hooks在 `settings.json`      | Hooks在 `hooks/hooks.json`      |
| 必须手动复制以共享   | 使用 `/plugin install` 安装   |

> **注意：** 迁移后，你可以从 `.claude/` 中删除原始文件以避免重复。Plugins版本在加载时将优先。
