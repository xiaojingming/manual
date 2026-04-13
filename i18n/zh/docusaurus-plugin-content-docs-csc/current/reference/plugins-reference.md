---
sidebar_position: 8
---

# 插件参考

> CSC 插件系统的完整技术参考，包括模式定义、CLI 命令和组件规范。

> **💡 提示：** 想要安装插件？请参阅发现和安装插件。要创建插件，请参阅插件。要分发插件，请参阅插件市场。

本参考提供了 CSC 插件系统的完整技术规范，包括组件模式定义、CLI 命令和开发工具。

**插件**是一个自包含的组件目录，通过自定义功能扩展 CSC。插件组件包括技能、代理、钩子、MCP 服务器和 LSP 服务器。

## 插件组件参考

### 技能

插件为 CSC 添加技能，创建 `/name` 快捷方式，供你或 CSC 调用。

**位置**：插件根目录的 `skills/` 或 `commands/` 目录

**文件格式**：技能是包含 `SKILL.md` 的目录；命令是简单的 Markdown 文件

**技能结构**：

```text
skills/
├── pdf-processor/
│   ├── SKILL.md
│   ├── reference.md (可选)
│   └── scripts/ (可选)
└── code-reviewer/
    └── SKILL.md
```

**集成行为**：

* 技能和命令在插件安装时自动发现
* CSC 可以根据任务上下文自动调用它们
* 技能可以在 SKILL.md 旁边包含支持文件

完整详情请参阅技能。

### 代理

插件可以提供专门的子代理，用于特定任务，CSC 可以在适当时自动调用。

**位置**：插件根目录的 `agents/` 目录

**文件格式**：描述代理功能的 Markdown 文件

**代理结构**：

```markdown
---
name: agent-name
description: 此代理擅长什么以及 CSC 何时应调用它
model: sonnet
effort: medium
maxTurns: 20
disallowedTools: Write, Edit
---

描述代理角色、专业知识和行为的详细系统提示。
```

插件代理支持 `name`、`description`、`model`、`effort`、`maxTurns`、`tools`、`disallowedTools`、`skills`、`memory`、`background` 和 `isolation` frontmatter 字段。唯一有效的 `isolation` 值是 `"worktree"`。出于安全原因，插件代理不支持 `hooks`、`mcpServers` 和 `permissionMode`。

**集成点**：

* 代理出现在 `/agents` 界面中
* CSC 可以根据任务上下文自动调用代理
* 用户可以手动调用代理
* 插件代理与内置 CSC 代理协同工作

完整详情请参阅子代理。

### 钩子

插件可以提供事件处理器，自动响应 CSC 事件。

**位置**：插件根目录的 `hooks/hooks.json`，或在 plugin.json 中内联

**格式**：带有事件匹配器和操作的 JSON 配置

**钩子配置**：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
          }
        ]
      }
    ]
  }
}
```

插件钩子响应与用户定义钩子相同的生命周期事件：

| 事件                 | 触发时机                                                                                                                                     |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `SessionStart`       | 会话开始或恢复时                                                                                                                             |
| `UserPromptSubmit`   | 你提交提示时，在 CSC 处理之前                                                                                                                |
| `PreToolUse`         | 工具调用执行之前。可以阻止                                                                                                                   |
| `PermissionRequest`  | 权限对话框出现时                                                                                                                             |
| `PermissionDenied`   | 工具调用被自动模式分类器拒绝时。返回 `{retry: true}` 告知模型可以重试被拒绝的工具调用                                                         |
| `PostToolUse`        | 工具调用成功后                                                                                                                               |
| `PostToolUseFailure` | 工具调用失败后                                                                                                                               |
| `Notification`       | CSC 发送通知时                                                                                                                               |
| `SubagentStart`      | 子代理被创建时                                                                                                                               |
| `SubagentStop`       | 子代理完成时                                                                                                                                 |
| `TaskCreated`        | 通过 `TaskCreate` 创建任务时                                                                                                                 |
| `TaskCompleted`      | 任务被标记为完成时                                                                                                                           |
| `Stop`               | CSC 完成响应时                                                                                                                               |
| `StopFailure`        | 由于 API 错误导致轮次结束时。输出和退出码被忽略                                                                                              |
| `TeammateIdle`       | 代理团队队友即将空闲时                                                                                                                       |
| `InstructionsLoaded` | CLAUDE.md 或 `.claude/rules/*.md` 文件被加载到上下文时。在会话开始和会话期间懒加载文件时触发                                                   |
| `ConfigChange`       | 会话期间配置文件更改时                                                                                                                       |
| `CwdChanged`         | 工作目录更改时，例如 CSC 执行 `cd` 命令时。适用于使用 direnv 等工具的响应式环境管理                                                           |
| `FileChanged`        | 监视的文件在磁盘上更改时。`matcher` 字段指定要监视的文件名                                                                                     |
| `WorktreeCreate`     | 通过 `--worktree` 或 `isolation: "worktree"` 创建工作树时。替换默认 git 行为                                                                  |
| `WorktreeRemove`     | 工作树被移除时，无论是会话退出还是子代理完成时                                                                                                 |
| `PreCompact`         | 上下文压缩之前                                                                                                                               |
| `PostCompact`        | 上下文压缩完成后                                                                                                                             |
| `Elicitation`        | MCP 服务器在工具调用期间请求用户输入时                                                                                                       |
| `ElicitationResult`  | 用户响应 MCP 请求后，在响应发送回服务器之前                                                                                                   |
| `SessionEnd`         | 会话终止时                                                                                                                                   |

**钩子类型**：

* `command`：执行 shell 命令或脚本
* `http`：将事件 JSON 作为 POST 请求发送到 URL
* `prompt`：使用 LLM 评估提示（使用 `$ARGUMENTS` 占位符表示上下文）
* `agent`：运行带有工具的代理验证器，用于复杂验证任务

### MCP 服务器

插件可以捆绑模型上下文协议 (MCP) 服务器，将 CSC 与外部工具和服务连接。

**位置**：插件根目录的 `.mcp.json`，或在 plugin.json 中内联

**格式**：标准 MCP 服务器配置

**MCP 服务器配置**：

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    },
    "plugin-api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

**集成行为**：

* 插件 MCP 服务器在插件启用时自动启动
* 服务器作为标准 MCP 工具出现在 CSC 的工具箱中
* 服务器功能与 CSC 现有工具无缝集成
* 插件服务器可以独立于用户 MCP 服务器进行配置

### LSP 服务器

> **💡 提示：** 想要使用 LSP 插件？从官方市场安装：在 `/plugin` 发现标签页中搜索 "lsp"。本节记录如何为官方市场未涵盖的语言创建 LSP 插件。

插件可以提供语言服务器协议 (LSP) 服务器，让 CSC 在处理你的代码库时获得实时代码智能。

LSP 集成提供：

* **即时诊断**：CSC 在每次编辑后立即看到错误和警告
* **代码导航**：跳转到定义、查找引用和悬停信息
* **语言感知**：代码符号的类型信息和文档

**位置**：插件根目录的 `.lsp.json`，或在 `plugin.json` 中内联

**格式**：将语言服务器名称映射到其配置的 JSON 配置

**`.lsp.json` 文件格式**：

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

**在 `plugin.json` 中内联**：

```json
{
  "name": "my-plugin",
  "lspServers": {
    "go": {
      "command": "gopls",
      "args": ["serve"],
      "extensionToLanguage": {
        ".go": "go"
      }
    }
  }
}
```

**必填字段：**

| 字段                   | 描述                               |
| :--------------------- | :--------------------------------- |
| `command`              | 要执行的 LSP 二进制文件（必须在 PATH 中） |
| `extensionToLanguage`  | 将文件扩展名映射到语言标识符           |

**可选字段：**

| 字段                   | 描述                                               |
| :--------------------- | :------------------------------------------------- |
| `args`                 | LSP 服务器的命令行参数                              |
| `transport`            | 通信传输方式：`stdio`（默认）或 `socket`             |
| `env`                  | 启动服务器时设置的环境变量                           |
| `initializationOptions`| 初始化期间传递给服务器的选项                         |
| `settings`             | 通过 `workspace/didChangeConfiguration` 传递的设置  |
| `workspaceFolder`      | 服务器的工作区文件夹路径                             |
| `startupTimeout`       | 等待服务器启动的最大时间（毫秒）                     |
| `shutdownTimeout`      | 等待优雅关闭的最大时间（毫秒）                       |
| `restartOnCrash`       | 服务器崩溃时是否自动重启                             |
| `maxRestarts`          | 放弃前最大重启尝试次数                               |

> **⚠️ 警告：** **你必须单独安装语言服务器二进制文件。** LSP 插件配置 CSC 如何连接到语言服务器，但不包含服务器本身。如果你在 `/plugin` 错误标签页中看到 `Executable not found in $PATH`，请安装你语言所需的二进制文件。

**可用的 LSP 插件：**

| 插件               | 语言服务器                  | 安装命令                                                |
| :----------------- | :------------------------- | :----------------------------------------------------- |
| `pyright-lsp`      | Pyright (Python)           | `pip install pyright` 或 `npm install -g pyright`       |
| `typescript-lsp`   | TypeScript Language Server | `npm install -g typescript-language-server typescript`  |
| `rust-lsp`         | rust-analyzer              | 参见 rust-analyzer 安装                                 |

先安装语言服务器，然后从市场安装插件。

***

## 插件安装范围

安装插件时，你选择一个**范围**，决定插件在哪里可用以及谁可以使用：

| 范围       | 设置文件                                   | 用途                                                 |
| :-------- | :---------------------------------------- | :--------------------------------------------------- |
| `user`    | `~/.claude/settings.json`                  | 跨所有项目可用的个人插件（默认）                       |
| `project` | `.claude/settings.json`                   | 通过版本控制共享的团队插件                             |
| `local`   | `.claude/settings.local.json`             | 项目特定插件，被 gitignore                             |
| `managed` | 托管设置                                   | 托管插件（只读，仅可更新）                              |

插件使用与 CSC 其他配置相同的范围系统。有关安装说明和范围标志，请参阅安装插件。有关范围的完整说明，请参阅配置范围。

***

## 插件清单模式

`.claude-plugin/plugin.json` 文件定义了插件的元数据和配置。本节记录所有支持的字段和选项。

清单是可选的。如果省略，CSC 会自动发现默认位置中的组件，并从目录名派生插件名称。当你需要提供元数据或自定义组件路径时，请使用清单。

### 完整模式

```json
{
  "name": "plugin-name",
  "version": "1.2.0",
  "description": "简要插件描述",
  "author": {
    "name": "作者姓名",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "skills": "./custom/skills/",
  "commands": ["./custom/commands/special.md"],
  "agents": "./custom/agents/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json"
}
```

### 必填字段

如果你包含清单，`name` 是唯一必填的字段。

| 字段    | 类型   | 描述                               | 示例                  |
| :----- | :----- | :-------------------------------- | :------------------- |
| `name` | string | 唯一标识符（kebab-case，不含空格） | `"deployment-tools"` |

此名称用于组件命名空间。例如，在 UI 中，名称为 `plugin-dev` 的插件的代理 `agent-creator` 将显示为 `plugin-dev:agent-creator`。

### 元数据字段

| 字段           | 类型   | 描述                                                                                                       | 示例                                              |
| :------------ | :----- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| `version`     | string | 语义化版本。如果也在市场条目中设置，`plugin.json` 优先。你只需在一个地方设置。                                 | `"2.1.0"`                                          |
| `description` | string | 插件用途的简要说明                                                                                           | `"部署自动化工具"`                                 |
| `author`      | object | 作者信息                                                                                                    | `{"name": "Dev Team", "email": "dev@company.com"}` |
| `homepage`    | string | 文档 URL                                                                                                   | `"https://docs.example.com"`                       |
| `repository`  | string | 源代码 URL                                                                                                  | `"https://github.com/user/plugin"`                |
| `license`     | string | 许可证标识符                                                                                                | `"MIT"`、`"Apache-2.0"`                            |
| `keywords`    | array  | 发现标签                                                                                                    | `["deployment", "ci-cd"]`                          |

### 组件路径字段

| 字段            | 类型                  | 描述                                                                                                                               | 示例                                  |
| :------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- |
| `skills`       | string\|array         | 包含 `<name>/SKILL.md` 的自定义技能目录（替换默认的 `skills/`）                                                                      | `"./custom/skills/"`                 |
| `commands`     | string\|array         | 自定义扁平 `.md` 技能文件或目录（替换默认的 `commands/`）                                                                           | `"./custom/cmd.md"` 或 `["./cmd1.md"]` |
| `agents`       | string\|array         | 自定义代理文件（替换默认的 `agents/`）                                                                                               | `"./custom/agents/reviewer.md"`      |
| `hooks`        | string\|array\|object | 钩子配置路径或内联配置                                                                                                               | `"./my-extra-hooks.json"`            |
| `mcpServers`   | string\|array\|object | MCP 配置路径或内联配置                                                                                                               | `"./my-extra-mcp-config.json"`       |
| `outputStyles` | string\|array         | 自定义输出样式文件/目录（替换默认的 `output-styles/`）                                                                               | `"./styles/"`                        |
| `lspServers`   | string\|array\|object | 用于代码智能（跳转到定义、查找引用等）的语言服务器协议配置                                                                             | `"./.lsp.json"`                      |
| `userConfig`   | object                | 启用时提示用户输入的可配置值。请参阅用户配置                                                                                           | 见下文                                |
| `channels`     | array                 | 用于消息注入的通道声明（Telegram、Slack、Discord 风格）。请参阅通道                                                                   | 见下文                                |

### 用户配置

`userConfig` 字段声明了 CSC 在插件启用时提示用户输入的值。使用此字段代替要求用户手动编辑 `settings.json`。

```json
{
  "userConfig": {
    "api_endpoint": {
      "description": "你团队的 API 端点",
      "sensitive": false
    },
    "api_token": {
      "description": "API 认证令牌",
      "sensitive": true
    }
  }
}
```

键必须是有效的标识符。每个值都可以在 MCP 和 LSP 服务器配置、钩子命令以及（仅限非敏感值）技能和代理内容中作为 `${user_config.KEY}` 进行替换。值还会作为 `CLAUDE_PLUGIN_OPTION_<KEY>` 环境变量导出到插件子进程。

非敏感值存储在 `settings.json` 的 `pluginConfigs[<plugin-id>].options` 下。敏感值存储到系统钥匙串（或在钥匙串不可用时存储到 `~/.claude/.credentials.json`）。钥匙串存储与 OAuth 令牌共享，大约有 2 KB 的总限制，因此请保持敏感值较小。

### 通道

`channels` 字段允许插件声明一个或多个将内容注入对话的消息通道。每个通道绑定到插件提供的一个 MCP 服务器。

```json
{
  "channels": [
    {
      "server": "telegram",
      "userConfig": {
        "bot_token": { "description": "Telegram 机器人令牌", "sensitive": true },
        "owner_id": { "description": "你的 Telegram 用户 ID", "sensitive": false }
      }
    }
  ]
}
```

`server` 字段是必填的，必须与插件的 `mcpServers` 中的键匹配。可选的每通道 `userConfig` 使用与顶级字段相同的模式，允许插件在启用时提示输入机器人令牌或所有者 ID。

### 路径行为规则

对于 `skills`、`commands`、`agents` 和 `outputStyles`，自定义路径替换默认目录。如果清单指定了 `skills`，则不会扫描默认的 `skills/` 目录。钩子、MCP 服务器和 LSP 服务器在处理多个来源时有不同的语义。

* 所有路径必须相对于插件根目录并以 `./` 开头
* 自定义路径中的组件使用相同的命名和命名空间规则
* 可以将多个路径指定为数组
* 要保留默认目录并为技能、命令、代理或输出样式添加更多路径，请在数组中包含默认路径：`"skills": ["./skills/", "./extras/"]`
* 当技能路径指向直接包含 `SKILL.md` 的目录时，例如 `"skills": ["./"]` 指向插件根目录，`SKILL.md` 中的 frontmatter `name` 字段决定技能的调用名称。这提供了一个稳定的名称，无论安装目录如何。如果 frontmatter 中未设置 `name`，则使用目录基名作为回退。

**路径示例**：

```json
{
  "commands": [
    "./specialized/deploy.md",
    "./utilities/batch-process.md"
  ],
  "agents": [
    "./custom-agents/reviewer.md",
    "./custom-agents/tester.md"
  ]
}
```

### 环境变量

CSC 提供两个变量用于引用插件路径。两者在技能内容、代理内容、钩子命令以及 MCP 或 LSP 服务器配置中出现时内联替换。两者也作为环境变量导出到钩子进程和 MCP 或 LSP 服务器子进程。

**`${CLAUDE_PLUGIN_ROOT}`**：插件安装目录的绝对路径。使用此变量引用与插件捆绑的脚本、二进制文件和配置文件。此路径在插件更新时会更改，因此你在此处写入的文件不会在更新后保留。

**`${CLAUDE_PLUGIN_DATA}`**：用于在更新后保留的插件状态的持久目录。使用此目录存放已安装的依赖项（如 `node_modules` 或 Python 虚拟环境）、生成的代码、缓存以及应在插件版本间持久化的任何其他文件。首次引用此变量时目录会自动创建。

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/process.sh"
          }
        ]
      }
    ]
  }
}
```

#### 持久数据目录

`${CLAUDE_PLUGIN_DATA}` 目录解析为 `~/.claude/plugins/data/{id}/`，其中 `{id}` 是插件标识符，`a-z`、`A-Z`、`0-9`、`_` 和 `-` 以外的字符替换为 `-`。对于安装为 `formatter@my-marketplace` 的插件，目录为 `~/.claude/plugins/data/formatter-my-marketplace/`。

一个常见用途是一次安装语言依赖项并在会话和插件更新间重用。由于数据目录比任何单个插件版本存活时间更长，仅通过目录存在性检查无法检测更新何时更改了插件的依赖清单。推荐的模式是将捆绑的清单与数据目录中的副本进行比较，并在不同时重新安装。

此 `SessionStart` 钩子在首次运行时安装 `node_modules`，并在插件更新包含更改的 `package.json` 时再次安装：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "diff -q \"${CLAUDE_PLUGIN_ROOT}/package.json\" \"${CLAUDE_PLUGIN_DATA}/package.json\" >/dev/null 2>&1 || (cd \"${CLAUDE_PLUGIN_DATA}\" && cp \"${CLAUDE_PLUGIN_ROOT}/package.json\" . && npm install) || rm -f \"${CLAUDE_PLUGIN_DATA}/package.json\""
          }
        ]
      }
    ]
  }
}
```

当存储的副本缺失或与捆绑的副本不同时，`diff` 以非零退出，涵盖了首次运行和依赖项更改的更新。如果 `npm install` 失败，尾随的 `rm` 会删除复制的清单，以便下次会话重试。

捆绑在 `${CLAUDE_PLUGIN_ROOT}` 中的脚本可以针对持久化的 `node_modules` 运行：

```json
{
  "mcpServers": {
    "routines": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"],
      "env": {
        "NODE_PATH": "${CLAUDE_PLUGIN_DATA}/node_modules"
      }
    }
  }
}
```

当你从安装插件的最后一个范围卸载插件时，数据目录会自动删除。`/plugin` 界面显示目录大小并在删除前提示。CLI 默认删除；传递 `--keep-data` 以保留它。

***

## 插件缓存和文件解析

插件通过以下两种方式之一指定：

* 通过 `csc --plugin-dir`，在会话期间有效。
* 通过市场，为将来的会话安装。

出于安全和验证目的，CSC 将市场插件复制到用户的本地**插件缓存**（`~/.claude/plugins/cache`），而不是就地使用。了解此行为对于开发引用外部文件的插件很重要。

每个安装的版本在缓存中是一个单独的目录。当你更新或卸载插件时，以前的版本目录被标记为孤立，并在 7 天后自动删除。宽限期让已经加载旧版本的并发 CSC 会话继续运行而不会出错。

### 路径遍历限制

已安装的插件不能引用其目录之外的文件。遍历到插件根目录之外的路径（如 `../shared-utils`）在安装后将不起作用，因为这些外部文件不会被复制到缓存。

### 使用外部依赖

如果你的插件需要访问其目录之外的文件，你可以在插件目录内创建指向外部文件的符号链接。符号链接在缓存中保留而不是被解引用，它们在运行时解析到目标。以下命令从插件目录内部创建到共享工具位置的链接：

```bash
ln -s /path/to/shared-utils ./shared-utils
```

这在保持缓存系统安全优势的同时提供了灵活性。

***

## 插件目录结构

### 标准插件布局

完整的插件遵循此结构：

```text
enterprise-plugin/
├── .claude-plugin/           # 元数据目录（可选）
│   └── plugin.json             # 插件清单
├── skills/                   # 技能
│   ├── code-reviewer/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── commands/                 # 扁平 .md 文件形式的技能
│   ├── status.md
│   └── logs.md
├── agents/                   # 子代理定义
│   ├── security-reviewer.md
│   ├── performance-tester.md
│   └── compliance-checker.md
├── output-styles/            # 输出样式定义
│   └── terse.md
├── hooks/                    # 钩子配置
│   ├── hooks.json           # 主钩子配置
│   └── security-hooks.json  # 附加钩子
├── bin/                      # 添加到 PATH 的插件可执行文件
│   └── my-tool               # 在 Bash 工具中可作为裸命令调用
├── settings.json            # 插件的默认设置
├── .mcp.json                # MCP 服务器定义
├── .lsp.json                # LSP 服务器配置
├── scripts/                 # 钩子和实用脚本
│   ├── security-scan.sh
│   ├── format-code.py
│   └── deploy.js
├── LICENSE                  # 许可证文件
└── CHANGELOG.md             # 版本历史
```

> **⚠️ 警告：** `.claude-plugin/` 目录包含 `plugin.json` 文件。所有其他目录（commands/、agents/、skills/、output-styles/、hooks/）必须在插件根目录，而不是在 `.claude-plugin/` 内部。

### 文件位置参考

| 组件             | 默认位置                     | 用途                                                                                                                                   |
| :-------------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **清单**         | `.claude-plugin/plugin.json` | 插件元数据和配置（可选）                                                                                                                |
| **技能**         | `skills/`                    | 具有 `<name>/SKILL.md` 结构的技能                                                                                                      |
| **命令**         | `commands/`                  | 扁平 Markdown 文件形式的技能。新插件请使用 `skills/`                                                                                     |
| **代理**         | `agents/`                    | 子代理 Markdown 文件                                                                                                                    |
| **输出样式**     | `output-styles/`             | 输出样式定义                                                                                                                            |
| **钩子**         | `hooks/hooks.json`           | 钩子配置                                                                                                                                |
| **MCP 服务器**   | `.mcp.json`                  | MCP 服务器定义                                                                                                                          |
| **LSP 服务器**   | `.lsp.json`                  | 语言服务器配置                                                                                                                          |
| **可执行文件**   | `bin/`                       | 添加到 Bash 工具 `PATH` 的可执行文件。此处的文件在插件启用时可在任何 Bash 工具调用中作为裸命令调用                                          |
| **设置**         | `settings.json`              | 插件启用时应用的默认配置。目前仅支持 `agent` 设置                                                                                       |

***

## CLI 命令参考

CSC 提供 CLI 命令用于非交互式插件管理，适用于脚本编写和自动化。

### plugin install

从可用市场安装插件。

```bash
csc plugin install <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`（指定市场）

**选项：**

| 选项                   | 描述                                              | 默认值  |
| :-------------------- | :------------------------------------------------ | :------ |
| `-s, --scope <scope>` | 安装范围：`user`、`project` 或 `local`             | `user`  |
| `-h, --help`          | 显示命令帮助                                       |         |

范围决定安装的插件添加到哪个设置文件。例如，`--scope project` 写入 `.claude/settings.json` 中的 `enabledPlugins`，使插件对每个克隆项目仓库的人可用。

**示例：**

```bash
# 安装到用户范围（默认）
csc plugin install formatter@my-marketplace

# 安装到项目范围（与团队共享）
csc plugin install formatter@my-marketplace --scope project

# 安装到本地范围（被 gitignore）
csc plugin install formatter@my-marketplace --scope local
```

### plugin uninstall

移除已安装的插件。

```bash
csc plugin uninstall <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                   | 描述                                                                        | 默认值  |
| :-------------------- | :-------------------------------------------------------------------------- | :------ |
| `-s, --scope <scope>` | 卸载范围：`user`、`project` 或 `local`                                      | `user`  |
| `--keep-data`         | 保留插件的持久数据目录                                                        |         |
| `-h, --help`          | 显示命令帮助                                                                  |         |

**别名：** `remove`、`rm`

默认情况下，从最后一个剩余范围卸载也会删除插件的 `${CLAUDE_PLUGIN_DATA}` 目录。使用 `--keep-data` 保留它，例如在测试新版本后重新安装时。

### plugin enable

启用已禁用的插件。

```bash
csc plugin enable <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                   | 描述                                          | 默认值  |
| :-------------------- | :-------------------------------------------- | :------ |
| `-s, --scope <scope>` | 启用范围：`user`、`project` 或 `local`        | `user`  |
| `-h, --help`          | 显示命令帮助                                    |         |

### plugin disable

禁用插件而不卸载它。

```bash
csc plugin disable <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                   | 描述                                           | 默认值  |
| :-------------------- | :-------------------------------------------- | :------ |
| `-s, --scope <scope>` | 禁用范围：`user`、`project` 或 `local`         | `user`  |
| `-h, --help`          | 显示命令帮助                                     |         |

### plugin update

将插件更新到最新版本。

```bash
csc plugin update <plugin> [options]
```

**参数：**

* `<plugin>`：插件名称或 `plugin-name@marketplace-name`

**选项：**

| 选项                   | 描述                                                    | 默认值  |
| :-------------------- | :------------------------------------------------------ | :------ |
| `-s, --scope <scope>` | 更新范围：`user`、`project`、`local` 或 `managed`       | `user`  |
| `-h, --help`          | 显示命令帮助                                              |         |

***

## 调试和开发工具

### 调试命令

使用 `csc --debug` 查看插件加载详情：

这会显示：

* 正在加载哪些插件
* 插件清单中的任何错误
* 技能、代理和钩子注册
* MCP 服务器初始化

### 常见问题

| 问题                                  | 原因                            | 解决方案                                                                                                                                         |
| :----------------------------------- | :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| 插件未加载                             | 无效的 `plugin.json`            | 运行 `csc plugin validate` 或 `/plugin validate` 检查 `plugin.json`、技能/代理/命令 frontmatter 和 `hooks/hooks.json` 的语法和模式错误               |
| 技能未出现                             | 目录结构错误                     | 确保 `skills/` 或 `commands/` 在插件根目录，而不是在 `.claude-plugin/` 内部                                                                       |
| 钩子未触发                             | 脚本不可执行                     | 运行 `chmod +x script.sh`                                                                                                                       |
| MCP 服务器失败                         | 缺少 `${CLAUDE_PLUGIN_ROOT}`    | 对所有插件路径使用变量                                                                                                                             |
| 路径错误                              | 使用了绝对路径                   | 所有路径必须相对并以 `./` 开头                                                                                                                    |
| LSP `Executable not found in $PATH`   | 语言服务器未安装                  | 安装二进制文件（例如 `npm install -g typescript-language-server typescript`）                                                                     |

### 示例错误消息

**清单验证错误**：

* `Invalid JSON syntax: Unexpected token } in JSON at position 142`：检查是否缺少逗号、多余逗号或未加引号的字符串
* `Plugin has an invalid manifest file at .claude-plugin/plugin.json. Validation errors: name: Required`：缺少必填字段
* `Plugin has a corrupt manifest file at .claude-plugin/plugin.json. JSON parse error: ...`：JSON 语法错误

**插件加载错误**：

* `Warning: No commands found in plugin my-plugin custom directory: ./cmds. Expected .md files or SKILL.md in subdirectories.`：命令路径存在但不包含有效的命令文件
* `Plugin directory not found at path: ./plugins/my-plugin. Check that the marketplace entry has the correct path.`：marketplace.json 中的 `source` 路径指向不存在的目录
* `Plugin my-plugin has conflicting manifests: both plugin.json and marketplace entry specify components.`：删除重复的组件定义或删除市场条目中的 `strict: false`

### 钩子故障排除

**钩子脚本未执行**：

1. 检查脚本是否可执行：`chmod +x ./scripts/your-script.sh`
2. 验证 shebang 行：第一行应为 `#!/bin/bash` 或 `#!/usr/bin/env bash`
3. 检查路径是否使用 `${CLAUDE_PLUGIN_ROOT}`：`"command": "${CLAUDE_PLUGIN_ROOT}/scripts/your-script.sh"`
4. 手动测试脚本：`./scripts/your-script.sh`

**钩子未在预期事件上触发**：

1. 验证事件名称是否正确（区分大小写）：`PostToolUse`，而不是 `postToolUse`
2. 检查匹配器模式是否匹配你的工具：`"matcher": "Write|Edit"` 用于文件操作
3. 确认钩子类型是否有效：`command`、`http`、`prompt` 或 `agent`

### MCP 服务器故障排除

**服务器未启动**：

1. 检查命令是否存在且可执行
2. 验证所有路径是否使用 `${CLAUDE_PLUGIN_ROOT}` 变量
3. 检查 MCP 服务器日志：`csc --debug` 显示初始化错误
4. 在 CSC 之外手动测试服务器

**服务器工具未出现**：

1. 确保服务器在 `.mcp.json` 或 `plugin.json` 中正确配置
2. 验证服务器是否正确实现 MCP 协议
3. 检查调试输出中的连接超时

### 目录结构错误

**症状**：插件加载但组件（技能、代理、钩子）缺失。

**正确结构**：组件必须在插件根目录，而不是在 `.claude-plugin/` 内部。只有 `plugin.json` 属于 `.claude-plugin/`。

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json      ← 仅清单在此
├── commands/            ← 在根级别
├── agents/              ← 在根级别
└── hooks/               ← 在根级别
```

如果你的组件在 `.claude-plugin/` 内部，请将它们移到插件根目录。

**调试清单**：

1. 运行 `csc --debug` 并查找 "loading plugin" 消息
2. 检查每个组件目录是否列在调试输出中
3. 验证文件权限是否允许读取插件文件

***

## 分发和版本控制参考

### 版本管理

为插件发布遵循语义化版本控制：

```json
{
  "name": "my-plugin",
  "version": "2.1.0"
}
```

**版本格式**：`MAJOR.MINOR.PATCH`

* **MAJOR**：重大变更（不兼容的 API 变更）
* **MINOR**：新功能（向后兼容的添加）
* **PATCH**：错误修复（向后兼容的修复）

**最佳实践**：

* 首个稳定版本从 `1.0.0` 开始
* 在分发更改之前更新 `plugin.json` 中的版本
* 在 `CHANGELOG.md` 文件中记录更改
* 使用预发布版本如 `2.0.0-beta.1` 进行测试

> **⚠️ 警告：** CSC 使用版本来确定是否更新你的插件。如果你更改了插件的代码但没有在 `plugin.json` 中提升版本，由于缓存，插件的现有用户将看不到你的更改。
>
> 如果你的插件在市场目录中，你可以通过 `marketplace.json` 管理版本，并从 `plugin.json` 中省略 `version` 字段。
