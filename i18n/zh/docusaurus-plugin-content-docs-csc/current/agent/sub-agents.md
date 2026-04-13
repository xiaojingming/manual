---
sidebar_position: 1
---

# 创建自定义Subagents

> 在 CSC 中创建和使用专门的 AI Subagents，用于特定任务的工作流和改进上下文管理。

Subagents是处理特定类型任务的专门 AI 助手。当某个附带任务会产生大量搜索结果、日志或你不会再引用的文件内容时，使用Subagents：Subagents在自己的上下文中完成工作，只返回摘要。当你不断用相同指令生成同一种工作程序时，定义一个自定义Subagent。

每个Subagent在自己的上下文窗口中运行，具有自定义系统提示、特定工具访问权限和独立权限。当 Claude 遇到与Subagents描述匹配的任务时，它会委托给该Subagents，Subagents独立工作并返回结果。要实际查看上下文节省效果，上下文窗口可视化功能演示了一个Subagents在其独立窗口中处理研究的会话。

> **注意：** 如果你需要多个代理并行工作并相互通信，请参阅Agent teams。Subagents在单个会话内工作；Agent teams跨独立会话协调。

Subagents帮助你：

* **保留上下文**——将探索和实现操作排除在主对话之外
* **强制约束**——限制Subagents可以使用的工具
* **跨项目复用配置**——通过用户级Subagents实现
* **专业化行为**——为特定领域提供聚焦的系统提示
* **控制成本**——将任务路由到更快、更便宜的模型，如 Haiku

CSC 使用每个Subagents的描述来决定何时委托任务。创建Subagents时，请编写清晰的描述，以便 CSC 知道何时使用它。

CSC 包含多个内置Subagents，如 **Explore**、**Plan** 和 **general-purpose**。你也可以创建自定义Subagents来处理特定任务。本页涵盖内置Subagents、如何创建自己的Subagents、完整配置选项、使用Subagents的模式以及示例Subagents。

## 内置Subagents

CSC 包含 CSC 在适当时自动使用的内置Subagents。每个Subagents继承父对话的权限，并有额外的工具限制。

### Explore

一个快速的只读代理，针对搜索和分析代码库进行了优化。

* **工具**：只读工具（禁止访问 Write 和 Edit 工具）
* **用途**：文件发现、代码搜索、代码库探索

当 CSC 需要在不进行更改的情况下搜索或理解代码库时，它会委托给 Explore。这使探索结果不会出现在你的主对话上下文中。

调用 Explore 时，Claude 会指定彻底程度：**quick** 用于定向查找，**medium** 用于平衡探索，**very thorough** 用于全面分析。

### Plan

一个在计划模式中用于在呈现计划之前收集上下文的研究代理。

* **模型**：从主对话继承
* **工具**：只读工具（禁止访问 Write 和 Edit 工具）
* **用途**：用于规划的代码库研究

当你在计划模式中且 CSC 需要理解你的代码库时，它会将研究委托给 Plan Subagents。这防止了无限嵌套（Subagents不能生成其他Subagents），同时仍然收集必要的上下文。

### General-purpose

一个功能强大的代理，用于需要探索和操作的复杂多步骤任务。

* **模型**：从主对话继承
* **工具**：所有工具
* **用途**：复杂研究、多步骤操作、代码修改

当任务需要同时探索和修改、需要复杂推理来解释结果，或需要多个依赖步骤时，CSC 会委托给 general-purpose。

## 快速入门：创建你的第一个Subagents

Subagents在带有 YAML frontmatter 的 Markdown 文件中定义。你可以手动创建它们，或使用 `/agents` 命令。

本演练指导你使用 `/agents` 命令创建一个用户级Subagents。该Subagents审查代码并为代码库建议改进。

#### 打开Subagents界面

在 CSC 中，运行：

```text
/agents
```

#### 选择位置

切换到 **Library** 标签页，选择 **Create new agent**，然后选择 **Personal**。这会将Subagents保存到 `~/.claude/agents/`，使其在所有项目中可用。

#### 使用 Claude 生成

选择 **Generate with Claude**。当提示时，描述Subagents：

```text
A code improvement agent that scans files and suggests improvements
for readability, performance, and best practices. It should explain
each issue, show the current code, and provide an improved version.
```

Claude 会为你生成标识符、描述和系统提示。

#### 选择工具

对于只读审查器，取消选择除 **Read-only tools** 之外的所有内容。如果你保留所有工具被选中，Subagents将继承主对话中可用的所有工具。

#### 选择模型

选择Subagents使用的模型。对于此示例代理，选择 **Sonnet**，它在分析代码模式方面平衡了能力和速度。

#### 选择颜色

为Subagents选择一个背景颜色。这有助于你在 UI 中识别哪个Subagents正在运行。

#### 配置记忆

选择 **User scope** 为Subagents提供位于 `~/.claude/agent-memory/` 的持久记忆目录。Subagents使用它在对话之间积累见解，例如代码库模式和反复出现的问题。如果你不希望Subagents持久化学习内容，选择 **None**。

#### 保存并试用

查看配置摘要。按 `s` 或 `Enter` 保存，或按 `e` 保存并在编辑器中编辑文件。Subagents立即可用。试试：

```text
Use the code-improver agent to suggest improvements in this project
```

Claude 会委托给你的新Subagents，它会扫描代码库并返回改进建议。

你现在拥有了一个可以在你机器上的任何项目中使用的Subagents，用于分析代码库并建议改进。

你也可以手动将Subagents创建为 Markdown 文件，通过 CLI 标志定义它们，或通过Plugins分发它们。以下章节涵盖所有配置选项。

## 配置Subagents

### 使用 /agents 命令

`/agents` 命令打开一个标签式界面来管理Subagents。**Running** 标签页显示正在运行的Subagents，并允许你打开或停止它们。**Library** 标签页允许你：

* 查看所有可用的Subagents（内置、用户、项目和Plugins）
* 通过引导设置或 Claude 生成创建新Subagents
* 编辑现有Subagents配置和工具访问权限
* 删除自定义Subagents
* 当存在重复时查看哪些Subagents处于活动状态

这是创建和管理Subagents的推荐方式。对于手动创建或自动化，你也可以直接添加Subagents文件。

要在不启动交互式会话的情况下从命令行列出所有已配置的Subagents，运行 `csc agents`。这会显示按来源分组的代理，并指示哪些被更高优先级的定义覆盖。

### 选择Subagents作用域

Subagents是带有 YAML frontmatter 的 Markdown 文件。根据作用域将它们存储在不同的位置。当多个Subagents共享相同名称时，更高优先级的位置获胜。

| 位置                          | 作用域           | 优先级       | 如何创建                       |
| :---------------------------- | :--------------- | :---------- | :----------------------------- |
| 托管设置                      | 组织范围         | 1（最高）   | 通过托管设置部署               |
| `--agents` CLI 标志           | 当前会话         | 2           | 启动 CSC 时传递 JSON           |
| `.claude/agents/`             | 当前项目         | 3           | 交互式或手动                   |
| `~/.claude/agents/`           | 你的所有项目     | 4           | 交互式或手动                   |
| Plugins的 `agents/` 目录         | 启用Plugins的位置   | 5（最低）   | 随Plugins安装                     |

**项目Subagents**（`.claude/agents/`）非常适合特定于代码库的Subagents。将它们提交到版本控制，以便你的团队可以协作使用和改进它们。

项目Subagents通过从当前工作目录向上遍历来发现。使用 `--add-dir` 添加的目录仅授予文件访问权限，不会扫描Subagents。要跨项目共享Subagents，使用 `~/.claude/agents/` 或Plugins。

**用户Subagents**（`~/.claude/agents/`）是在你所有项目中可用的个人Subagents。

**CLI 定义的Subagents**在启动 CSC 时作为 JSON 传递。它们仅在该会话中存在，不会保存到磁盘，适合快速测试或自动化脚本。你可以在单个 `--agents` 调用中定义多个Subagents：

```bash
csc --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

`--agents` 标志接受与基于文件的Subagents具有相同 frontmatter 字段的 JSON：`description`、`prompt`、`tools`、`disallowedTools`、`model`、`permissionMode`、`mcpServers`、`hooks`、`maxTurns`、`skills`、`initialPrompt`、`memory`、`effort`、`background`、`isolation` 和 `color`。使用 `prompt` 作为系统提示，等效于基于文件的Subagents中的 markdown 正文。

**托管Subagents**由组织管理员部署。将 markdown 文件放在托管设置目录内的 `.claude/agents/` 中，使用与项目和用户Subagents相同的 frontmatter 格式。托管定义优先于同名项目和用户Subagents。

**PluginsSubagents**来自你安装的Plugins。它们与你的自定义Subagents一起出现在 `/agents` 中。有关创建PluginsSubagents的详细信息，请参阅Plugins组件参考。

> **注意：** 出于安全原因，PluginsSubagents不支持 `hooks`、`mcpServers` 或 `permissionMode` frontmatter 字段。从Plugins加载代理时，这些字段会被忽略。如果你需要它们，将代理文件复制到 `.claude/agents/` 或 `~/.claude/agents/`。你也可以在 `settings.json` 或 `settings.local.json` 中的 `permissions.allow` 中添加规则，但这些规则适用于整个会话，而不仅仅是PluginsSubagents。

来自任何这些作用域的Subagents定义也可用于Agent teams：在生成队友时，你可以引用Subagents类型，队友使用其 `tools` 和 `model`，并将定义的正文附加到队友的系统提示作为额外指令。有关在该路径上适用的 frontmatter 字段，请参阅Agent teams。

### 编写Subagents文件

Subagents文件使用 YAML frontmatter 进行配置，后跟 Markdown 格式的系统提示：

> **注意：** Subagents在会话启动时加载。如果你通过手动添加文件创建Subagents，请重启会话或使用 `/agents` 立即加载它。

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

frontmatter 定义Subagents的元数据和配置。正文成为指导Subagents行为的系统提示。Subagents只接收此系统提示（加上基本环境详细信息，如工作目录），而不是完整的 CSC 系统提示。

Subagents在主对话的当前工作目录中启动。在Subagents内部，`cd` 命令不会在 Bash 或 PowerShell 工具调用之间持久化，也不会影响主对话的工作目录。要给Subagents一个仓库的隔离副本，请设置 `isolation: worktree`。

#### 支持的 frontmatter 字段

以下字段可在 YAML frontmatter 中使用。只有 `name` 和 `description` 是必需的。

| 字段               | 必需 | 描述                                                                                                                                                                                                                                       |
| :----------------- | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | 是   | 使用小写字母和连字符的唯一标识符                                                                                                                                                                                                            |
| `description`      | 是   | Claude 何时应委托给此Subagents                                                                                                                                                                                                                 |
| `tools`            | 否   | Subagents可以使用的工具。如果省略则继承所有工具                                                                                                                                                                                                |
| `disallowedTools`  | 否   | 要拒绝的工具，从继承或指定的列表中移除                                                                                                                                                                                                      |
| `model`            | 否   | 要使用的模型：`sonnet`、`opus`、`haiku`、完整模型 ID（例如 `claude-opus-4-6`）或 `inherit`。默认为 `inherit`                                                                                                                                |
| `permissionMode`   | 否   | 权限模式：`default`、`acceptEdits`、`auto`、`dontAsk`、`bypassPermissions` 或 `plan`                                                                                                                                                      |
| `maxTurns`         | 否   | Subagents停止前的最大代理轮次                                                                                                                                                                                                                  |
| `skills`           | 否   | 在启动时加载到Subagents上下文中的Skills。注入的是完整Skills内容，而不仅仅是使其可调用。Subagents不从父对话继承Skills                                                                                                                                   |
| `mcpServers`       | 否   | 此Subagents可用的 MCP 服务器。每个条目要么是引用已配置服务器的服务器名称（例如 `"slack"`），要么是以服务器名称为键、完整 MCP 服务器配置为值的内联定义                                                                                           |
| `hooks`            | 否   | 作用于此Subagents的生命周期Hooks                                                                                                                                                                                                                |
| `memory`           | 否   | 持久记忆作用域：`user`、`project` 或 `local`。启用跨会话学习                                                                                                                                                                               |
| `background`       | 否   | 设为 `true` 以始终将此Subagents作为后台任务运行。默认：`false`                                                                                                                                                                                 |
| `effort`           | 否   | 此Subagents活跃时的努力级别。覆盖会话努力级别。默认：从会话继承。选项：`low`、`medium`、`high`、`max`（仅 Opus 4.6）                                                                                                                          |
| `isolation`        | 否   | 设为 `worktree` 以在临时 git worktree 中运行Subagents，为其提供仓库的隔离副本。如果Subagents未进行更改，worktree 会自动清理                                                                                                                       |
| `color`            | 否   | Subagents在任务列表和记录中的显示颜色。接受 `red`、`blue`、`green`、`yellow`、`purple`、`orange`、`pink` 或 `cyan`                                                                                                                           |
| `initialPrompt`    | 否   | 当此代理作为主会话代理运行时（通过 `--agent` 或 `agent` 设置），自动提交为第一个用户轮次。命令和Skills会被处理。前置到任何用户提供的提示之前                                                                                                   |

### 选择模型

`model` 字段控制Subagents使用的 AI 模型：

* **模型别名**：使用可用别名之一：`sonnet`、`opus` 或 `haiku`
* **完整模型 ID**：使用完整模型 ID，如 `claude-opus-4-6` 或 `claude-sonnet-4-6`。接受与 `--model` 标志相同的值
* **inherit**：使用与主对话相同的模型
* **省略**：如果未指定，默认为 `inherit`（使用与主对话相同的模型）

当 CSC 调用Subagents时，它也可以为该特定调用传递 `model` 参数。CSC 按以下顺序解析Subagents的模型：

1. `CLAUDE_CODE_SUBAGENT_MODEL` 环境变量（如果已设置）
2. 每次调用的 `model` 参数
3. Subagents定义的 `model` frontmatter
4. 主对话的模型

### 控制Subagents能力

你可以通过工具访问、权限模式和条件规则来控制Subagents可以做什么。

#### 可用工具

Subagents可以使用 CSC 的任何内部工具。默认情况下，Subagents从主对话继承所有工具，包括 MCP 工具。

要限制工具，使用 `tools` 字段（允许列表）或 `disallowedTools` 字段（拒绝列表）。此示例使用 `tools` 仅允许 Read、Grep、Glob 和 Bash。Subagents无法编辑文件、写入文件或使用任何 MCP 工具：

```yaml
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

此示例使用 `disallowedTools` 继承主对话中除 Write 和 Edit 之外的每个工具。Subagents保留 Bash、MCP 工具和其他所有工具：

```yaml
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

如果两者都设置了，先应用 `disallowedTools`，然后根据剩余池解析 `tools`。在两者中都列出的工具会被移除。

#### 限制可以生成的Subagents

当代理使用 `csc --agent` 作为主线程运行时，它可以使用 Agent 工具生成Subagents。要限制它可以生成哪些Subagents类型，在 `tools` 字段中使用 `Agent(agent_type)` 语法。

> **注意：** 在版本 2.1.63 中，Task 工具已重命名为 Agent。设置和代理定义中现有的 `Task(...)` 引用仍作为别名工作。

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

这是一个允许列表：只有 `worker` 和 `researcher` Subagents可以被生成。如果代理尝试生成任何其他类型，请求会失败，代理在其提示中只看到允许的类型。要阻止特定代理同时允许所有其他代理，使用 `permissions.deny`。

要在没有任何限制的情况下允许生成任何Subagents，使用不带括号的 `Agent`：

```yaml
tools: Agent, Read, Bash
```

如果 `Agent` 完全从 `tools` 列表中省略，代理无法生成任何Subagents。此限制仅适用于使用 `csc --agent` 作为主线程运行的代理。Subagents不能生成其他Subagents，因此 `Agent(agent_type)` 在Subagents定义中无效。

#### 将 MCP 服务器限定到Subagents

使用 `mcpServers` 字段为Subagents提供主对话中不可用的 MCP 服务器。此处定义的内联服务器在Subagents启动时连接，在Subagents完成时断开。字符串引用共享父会话的连接。

列表中的每个条目要么是内联服务器定义，要么是引用已在会话中配置的 MCP 服务器的字符串：

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # Inline definition: scoped to this subagent only
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # Reference by name: reuses an already-configured server
  - github
---

Use the Playwright tools to navigate, screenshot, and interact with pages.
```

内联定义使用与 `.mcp.json` 服务器条目相同的模式（`stdio`、`http`、`sse`、`ws`），以服务器名称为键。

要将 MCP 服务器完全排除在主对话之外，避免其工具描述在那里消耗上下文，请在此处内联定义它，而不是在 `.mcp.json` 中。Subagents获得工具；父对话不会。

#### 权限模式

`permissionMode` 字段控制Subagents如何处理权限提示。Subagents从主对话继承权限上下文，并可以覆盖模式，除非父模式优先，如下所述。

| 模式                | 行为                                                                                                       |
| :------------------ | :--------------------------------------------------------------------------------------------------------- |
| `default`           | 带提示的标准权限检查                                                                                       |
| `acceptEdits`       | 自动接受工作目录或 `additionalDirectories` 中路径的文件编辑和常见文件系统命令                               |
| `auto`              | 自动模式：后台分类器审查命令和受保护目录写入                                                               |
| `dontAsk`           | 自动拒绝权限提示（明确允许的工具仍然有效）                                                                 |
| `bypassPermissions` | 跳过权限提示                                                                                               |
| `plan`              | 计划模式（只读探索）                                                                                       |

> **⚠️ 警告：** 谨慎使用 `bypassPermissions`。它会跳过权限提示，允许Subagents在未经批准的情况下执行操作。对 `.git`、`.claude`、`.vscode`、`.idea` 和 `.husky` 目录的写入仍会提示确认，但 `.claude/commands`、`.claude/agents` 和 `.claude/skills` 除外。有关详细信息，请参阅权限模式。

如果父级使用 `bypassPermissions`，这优先且无法被覆盖。如果父级使用自动模式，Subagents继承自动模式，其 frontmatter 中的任何 `permissionMode` 都会被忽略：分类器使用与父会话相同的阻止和允许规则评估Subagents的工具调用。

#### 将Skills预加载到Subagents

使用 `skills` 字段在启动时将Skills内容注入Subagents的上下文。这为Subagents提供领域知识，而无需在执行期间发现和加载Skills。

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

每个Skills的完整内容被注入Subagents的上下文，而不仅仅是使其可调用。Subagents不从父对话继承Skills；你必须明确列出它们。

> **注意：** 这与在Subagents中运行Skills是相反的。在Subagents中使用 `skills` 时，Subagents控制系统提示并加载Skills内容。在Skills中使用 `context: fork` 时，Skills内容被注入到你指定的代理中。两者使用相同的底层系统。

#### 启用持久记忆

`memory` 字段为Subagents提供一个跨对话持久化的目录。Subagents使用此目录随时间积累知识，例如代码库模式、调试见解和架构决策。

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

根据记忆应适用的范围选择作用域：

| 作用域    | 位置                                           | 使用场景                                                 |
| :-------- | :--------------------------------------------- | :------------------------------------------------------- |
| `user`    | `~/.claude/agent-memory/<name-of-agent>/`      | Subagents应在所有项目中记住学习内容                          |
| `project` | `.claude/agent-memory/<name-of-agent>/`        | Subagents的知识是项目特定的，可通过版本控制共享              |
| `local`   | `.claude/agent-memory-local/<name-of-agent>/`  | Subagents的知识是项目特定的，但不应提交到版本控制            |

启用记忆后：

* Subagents的系统提示包含读写记忆目录的指令。
* Subagents的系统提示还包含记忆目录中 `MEMORY.md` 的前 200 行或 25KB（以先到者为准），以及如果超出限制则整理 `MEMORY.md` 的指令。
* Read、Write 和 Edit 工具会自动启用，以便Subagents可以管理其记忆文件。

##### 持久记忆提示

* `project` 是推荐的默认作用域。它使Subagents知识可通过版本控制共享。当Subagents的知识广泛适用于跨项目时使用 `user`，当知识不应提交到版本控制时使用 `local`。
* 让Subagents在开始工作之前查阅其记忆："审查此 PR，并检查你以前见过的模式。"
* 让Subagents在完成任务后更新其记忆："既然你完成了，把学到的内容保存到记忆中。" 随着时间的推移，这会建立一个知识库，使Subagents更有效。
* 在Subagents的 markdown 文件中直接包含记忆指令，以便它主动维护自己的知识库：

  ```markdown
  Update your agent memory as you discover codepaths, patterns, library
  locations, and key architectural decisions. This builds up institutional
  knowledge across conversations. Write concise notes about what you found
  and where.
  ```

#### 使用Hooks的条件规则

要对工具使用进行更动态的控制，使用 `PreToolUse` Hooks在操作执行之前验证它们。当你需要允许某个工具的某些操作同时阻止其他操作时，这很有用。

此示例创建一个只允许只读数据库查询的Subagents。`PreToolUse` Hooks在每次 Bash 命令执行之前运行 `command` 中指定的脚本：

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

CSC 通过 stdin 将Hooks输入作为 JSON 传递给Hooks命令。验证脚本读取此 JSON，提取 Bash 命令，并以退出码 2 阻止写入操作：

```bash
#!/bin/bash
# ./scripts/validate-readonly-query.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block SQL write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' > /dev/null; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2
fi

exit 0
```

有关完整的输入模式，请参阅Hooks输入，有关退出码如何影响行为，请参阅退出码。

#### 禁用特定Subagents

你可以通过将特定Subagents添加到设置中的 `deny` 数组来阻止 Claude 使用它们。使用格式 `Agent(subagent-name)`，其中 `subagent-name` 匹配Subagents的 name 字段。

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

这适用于内置和自定义Subagents。你也可以使用 `--disallowedTools` CLI 标志：

```bash
csc --disallowedTools "Agent(Explore)"
```

有关权限规则的更多详细信息，请参阅权限文档。

### 为Subagents定义Hooks

Subagents可以定义在Subagents生命周期期间运行的Hooks。有两种配置Hooks的方式：

1. **在Subagents的 frontmatter 中**：定义仅在该Subagents活跃时运行的Hooks
2. **在 `settings.json` 中**：定义在Subagents启动或停止时在主会话中运行的Hooks

#### Subagents frontmatter 中的Hooks

直接在Subagents的 markdown 文件中定义Hooks。这些Hooks仅在该特定Subagents活跃时运行，并在Subagents完成时清理。

支持所有Hooks事件。Subagents最常用的事件是：

| 事件           | 匹配器输入 | 触发时机                                       |
| :------------- | :--------- | :--------------------------------------------- |
| `PreToolUse`   | 工具名称   | Subagents使用工具之前                             |
| `PostToolUse`  | 工具名称   | Subagents使用工具之后                             |
| `Stop`         | （无）     | Subagents完成时（运行时转换为 `SubagentStop`）    |

此示例使用 `PreToolUse` Hooks验证 Bash 命令，并使用 `PostToolUse` 在文件编辑后运行 linter：

```yaml
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh $TOOL_INPUT"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

frontmatter 中的 `Stop` Hooks会自动转换为 `SubagentStop` 事件。

#### Subagents事件的项目级Hooks

在 `settings.json` 中配置响应主会话中Subagents生命周期事件的Hooks。

| 事件             | 匹配器输入     | 触发时机               |
| :--------------- | :------------- | :--------------------- |
| `SubagentStart`  | 代理类型名称   | Subagents开始执行时       |
| `SubagentStop`   | 代理类型名称   | Subagents完成时           |

两个事件都支持匹配器以按名称定位特定代理类型。此示例仅在 `db-agent` Subagents启动时运行设置脚本，并在任何Subagents停止时运行清理脚本：

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

有关完整的Hooks配置格式，请参阅Hooks。

## 使用Subagents

### 理解自动委托

CSC  根据你请求中的任务描述、Subagents配置中的 `description` 字段和当前上下文自动委托任务。要鼓励主动委托，在Subagents的 description 字段中包含 "use proactively" 等短语。

### 显式调用Subagents

当自动委托不够时，你可以自己请求Subagents。三种模式从一次性建议递进到会话范围的默认值：

* **自然语言**：在提示中命名Subagents；CSC 决定是否委托
* **@-提及**：保证Subagents为一个任务运行
* **会话范围**：通过 `--agent` 标志或 `agent` 设置，整个会话使用该Subagents的系统提示、工具限制和模型

对于自然语言，没有特殊语法。命名Subagents，Claude 通常会委托：

```text
Use the test-runner subagent to fix failing tests
Have the code-reviewer subagent look at my recent changes
```

**@-提及Subagents。** 输入 `@` 并从自动完成中选择Subagents，就像你 @-提及文件一样。这确保特定Subagents运行，而不是将选择留给 Claude：

```text
@"code-reviewer (agent)" look at the auth changes
```

你的完整消息仍然发送给 Claude，Claude 根据你的请求编写Subagents的任务提示。@-提及控制 Claude 调用哪个Subagents，而不是它接收什么提示。

由已启用Plugins提供的Subagents在自动完成中显示为 `<plugin-name>:<agent-name>`。会话中当前正在运行的命名后台Subagents也会出现在自动完成中，名称旁边显示其状态。你也可以在不使用选择器的情况下手动输入提及：本地Subagents使用 `@agent-<name>`，PluginsSubagents使用 `@agent-<plugin-name>:<agent-name>`。

**将整个会话作为Subagents运行。** 传递 `--agent <name>` 启动一个会话，其中主线程本身采用该Subagents的系统提示、工具限制和模型：

```bash
csc --agent code-reviewer
```

Subagents的系统提示完全替换默认的 CSC 系统提示，与 `--system-prompt` 的方式相同。`CLAUDE.md` 文件和项目记忆仍然通过正常的消息流加载。代理名称在启动头中显示为 `@<name>`，以便你确认它处于活动状态。

这适用于内置和自定义Subagents，当你恢复会话时选择会持久化。

对于Plugins提供的Subagents，传递限定名称：`csc --agent <plugin-name>:<agent-name>`。

要使其成为项目中每个会话的默认值，在 `.claude/settings.json` 中设置 `agent`：

```json
{
  "agent": "code-reviewer"
}
```

如果两者都存在，CLI 标志覆盖设置。

### 在前台或后台运行Subagents

Subagents可以在前台（阻塞）或后台（并发）运行：

* **前台Subagents**阻塞主对话直到完成。权限提示和澄清问题（如 `AskUserQuestion`）会传递给你。
* **后台Subagents**在你继续工作的同时并发运行。启动前，CSC 会提示Subagents需要的任何工具权限，确保它预先拥有必要的批准。运行后，Subagents继承这些权限并自动拒绝任何未预先批准的内容。如果后台Subagents需要提出澄清问题，该工具调用会失败，但Subagents继续运行。

如果后台Subagents因缺少权限而失败，你可以启动一个新的前台Subagents以相同任务重试交互式提示。

CSC 根据任务决定是在前台还是后台运行Subagents。你也可以：

* 让 CSC "在后台运行此任务"
* 按 **Ctrl+B** 将正在运行的任务置于后台

要禁用所有后台任务功能，将 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` 环境变量设置为 `1`。请参阅环境变量。

### 常见模式

#### 隔离大量输出操作

Subagents最有效的用途之一是隔离产生大量输出的操作。运行测试、获取文档或处理日志文件可能会消耗大量上下文。通过将这些委托给Subagents，冗长的输出留在Subagents的上下文中，而只有相关的摘要返回到你的主对话。

```text
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### 并行研究

对于独立的调查，生成多个Subagents同时工作：

```text
Research the authentication, database, and API modules in parallel using separate subagents
```

每个Subagents独立探索其领域，然后 CSC 综合发现。当研究路径互不依赖时效果最佳。

> **⚠️ 警告：** 当Subagents完成时，它们的结果返回到你的主对话。运行许多Subagents且每个都返回详细结果可能会消耗大量上下文。

对于需要持续并行性或超出上下文窗口的任务，Agent teams为每个工作程序提供自己独立的上下文。

#### 链式Subagents

对于多步骤工作流，让 Claude 按顺序使用Subagents。每个Subagents完成其任务并将结果返回给 CSC ，然后 CSC 将相关上下文传递给下一个Subagents。

```text
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### 在Subagents和主对话之间选择

在以下情况使用**主对话**：

* 任务需要频繁的来回交互或迭代优化
* 多个阶段共享大量上下文（规划 → 实现 → 测试）
* 你在进行快速、有针对性的更改
* 延迟很重要。Subagents从零开始，可能需要时间收集上下文

在以下情况使用**Subagents**：

* 任务产生你不需要在主上下文中的冗长输出
* 你想强制特定的工具限制或权限
* 工作是独立的，可以返回摘要

当你想要在主对话上下文而不是隔离的Subagents上下文中运行的可重用提示或工作流时，考虑使用Skills。

对于关于对话中已有内容的快速问题，使用 `/btw` 而不是Subagents。它可以看到你的完整上下文，但没有工具访问权限，答案会被丢弃而不是添加到历史记录中。

> **注意：** Subagents不能生成其他Subagents。如果你的工作流需要嵌套委托，使用Skills或从主对话链式调用Subagents。

### 管理Subagents上下文

#### 恢复Subagents

每次Subagents调用都会创建一个具有新上下文的新实例。要继续现有Subagents的工作而不是从头开始，让 CSC 恢复它。

恢复的Subagents保留其完整的对话历史，包括所有之前的工具调用、结果和推理。Subagents从它停止的地方继续，而不是重新开始。

当Subagents完成时，CSC 接收其代理 ID。CSC 使用 `SendMessage` 工具，以代理的 ID 作为 `to` 字段来恢复它。`SendMessage` 工具仅在通过 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 启用Agent teams时可用。

要恢复Subagents，让 Claude 继续之前的工作：

```text
Use the code-reviewer subagent to review the authentication module
[Agent completes]

Continue that code review and now analyze the authorization logic
[Claude resumes the subagent with full context from previous conversation]
```

如果已停止的Subagents收到 `SendMessage`，它会在后台自动恢复，无需新的 `Agent` 调用。

如果你想要显式引用它，你也可以向 CSC 请求代理 ID，或在 `~/.claude/projects/{project}/{sessionId}/subagents/` 的记录文件中找到 ID。每条记录存储为 `agent-{agentId}.jsonl`。

Subagents记录独立于主对话持久化：

* **主对话压缩**：当主对话压缩时，Subagents记录不受影响。它们存储在单独的文件中。
* **会话持久性**：Subagents记录在其会话内持久化。你可以通过恢复同一会话来在重启 CSC 后恢复Subagents。
* **自动清理**：记录根据 `cleanupPeriodDays` 设置（默认：30 天）进行清理。

#### 自动压缩

Subagents支持使用与主对话相同逻辑的自动压缩。默认情况下，自动压缩在大约 95% 容量时触发。要更早触发压缩，将 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 设置为较低的百分比（例如 `50`）。有关详细信息，请参阅环境变量。

压缩事件记录在Subagents记录文件中：

```json
{
  "type": "system",
  "subtype": "compact_boundary",
  "compactMetadata": {
    "trigger": "auto",
    "preTokens": 167189
  }
}
```

`preTokens` 值显示压缩发生前使用了多少 token。

## 示例Subagents

这些示例演示了构建Subagents的有效模式。将它们作为起点，或使用 CSC 生成自定义版本。

> **💡 提示：** **最佳实践：**
>
> * **设计聚焦的Subagents：** 每个Subagents应该擅长一个特定任务
> * **编写详细描述：** Claude 使用描述来决定何时委托
> * **限制工具访问：** 仅为安全和聚焦授予必要的权限
> * **提交到版本控制：** 与团队共享项目Subagents

### 代码审查器

一个只读Subagents，审查代码而不修改它。此示例展示了如何设计一个具有有限工具访问权限（无 Edit 或 Write）和详细提示的聚焦Subagents，该提示指定了要查找的内容和输出格式。

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### 调试器

一个可以分析和修复问题的Subagents。与代码审查器不同，此代理包含 Edit，因为修复 bug 需要修改代码。提示提供了从诊断到验证的清晰工作流。

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### 数据科学家

一个用于数据分析工作的领域特定Subagents。此示例展示了如何为典型编码任务之外的专门工作流创建Subagents。它显式设置 `model: sonnet` 以获得更强的分析能力。

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

### 数据库查询验证器

一个允许 Bash 访问但验证命令仅允许只读 SQL 查询的Subagents。此示例展示了当你需要比 `tools` 字段更精细的控制时，如何使用 `PreToolUse` Hooks进行条件验证。

```markdown
---
name: db-reader
description: Execute read-only database queries. Use when analyzing data or generating reports.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access. Execute SELECT queries to answer questions about the data.

When asked to analyze data:
1. Identify which tables contain the relevant data
2. Write efficient SELECT queries with appropriate filters
3. Present results clearly with context

You cannot modify data. If asked to INSERT, UPDATE, DELETE, or modify schema, explain that you only have read access.
```

CSC 通过 stdin 将Hooks输入作为 JSON 传递给Hooks命令。验证脚本读取此 JSON，提取正在执行的命令，并根据 SQL 写入操作列表进行检查。如果检测到写入操作，脚本以退出码 2 阻止执行，并通过 stderr 向 CSC 返回错误消息。

在项目中的任何位置创建验证脚本。路径必须与Hooks配置中的 `command` 字段匹配：

```bash
#!/bin/bash
# Blocks SQL write operations, allows SELECT queries

# Read JSON input from stdin
INPUT=$(cat)

# Extract the command field from tool_input using jq
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed. Use SELECT queries only." >&2
  exit 2
fi

exit 0
```

使脚本可执行：

```bash
chmod +x ./scripts/validate-readonly-query.sh
```

Hooks通过 stdin 接收 JSON，其中 Bash 命令在 `tool_input.command` 中。退出码 2 阻止操作并将错误消息反馈给 Claude。有关退出码的详细信息，请参阅Hooks，有关完整的输入模式，请参阅Hooks输入。
