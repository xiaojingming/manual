---
sidebar_position: 7
---

# Hooks 参考

> CSC hook 事件、配置模式、JSON 输入/输出格式、退出码、异步 hooks、HTTP hooks、提示 hooks 和 MCP 工具 hooks 的参考文档。

> **💡 提示：**
> 有关快速入门指南和示例，请参阅使用 hooks 自动化工作流。

Hooks 是用户定义的 shell 命令、HTTP 端点或 LLM 提示，它们在 CSC 生命周期的特定点自动执行。使用此参考文档查找事件模式、配置选项、JSON 输入/输出格式以及异步 hooks、HTTP hooks 和 MCP 工具 hooks 等高级功能。如果你是首次设置 hooks，请先从指南开始。

## Hook 生命周期

Hooks 在 CSC 会话的特定点触发。当事件触发且匹配器匹配时，CSC 将有关事件的 JSON 上下文传递给你的 hook 处理程序。对于命令 hooks，输入通过 stdin 到达。对于 HTTP hooks，它作为 POST 请求体到达。你的处理程序随后可以检查输入、采取行动，并可选地返回决策。事件分为三种频率：每个会话一次（`SessionStart`、`SessionEnd`），每个轮次一次（`UserPromptSubmit`、`Stop`、`StopFailure`），以及智能体循环中的每次工具调用（`PreToolUse`、`PostToolUse`）：

下表总结了每个事件的触发时机。Hook 事件部分记录了每个事件的完整输入模式和决策控制选项。

| 事件                | 触发时机                                                                                                                                          |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`       | 当会话开始或恢复时                                                                                                                       |
| `UserPromptSubmit`   | 当你提交提示时，在 Claude 处理它之前                                                                                                   |
| `PreToolUse`         | 在工具调用执行之前。可以阻止它                                                                                                              |
| `PermissionRequest`  | 当权限对话框出现时                                                                                                                       |
| `PermissionDenied`   | 当工具调用被自动模式分类器拒绝时。返回 `{retry: true}` 告知模型可以重试被拒绝的工具调用                     |
| `PostToolUse`        | 在工具调用成功之后                                                                                                                             |
| `PostToolUseFailure` | 在工具调用失败之后                                                                                                                                |
| `Notification`       | 当 CSC 发送通知时                                                                                                                  |
| `SubagentStart`      | 当子代理被创建时                                                                                                                             |
| `SubagentStop`       | 当子代理完成时                                                                                                                             |
| `TaskCreated`        | 当通过 `TaskCreate` 创建任务时                                                                                                          |
| `TaskCompleted`      | 当任务被标记为完成时                                                                                                               |
| `Stop`               | 当 Claude 完成响应时                                                                                                                        |
| `StopFailure`        | 当轮次因 API 错误而结束时。输出和退出码被忽略                                                                               |
| `TeammateIdle`       | 当代理团队的队友即将进入空闲状态时                                                                                     |
| `InstructionsLoaded` | 当 CLAUDE.md 或 `.claude/rules/*.md` 文件被加载到上下文中时。在会话开始时以及文件在会话期间被延迟加载时触发         |
| `ConfigChange`       | 当配置文件在会话期间更改时                                                                                                     |
| `CwdChanged`         | 当工作目录更改时，例如当 Claude 执行 `cd` 命令时。适用于与 direnv 等工具的响应式环境管理 |
| `FileChanged`        | 当监视的文件在磁盘上更改时。`matcher` 字段指定要监视的文件名                                                            |
| `WorktreeCreate`     | 当通过 `--worktree` 或 `isolation: "worktree"` 创建工作树时。替换默认的 git 行为                                            |
| `WorktreeRemove`     | 当工作树被移除时，要么在会话退出时，要么在子代理完成时                                                                   |
| `PreCompact`         | 在上下文压缩之前                                                                                                                              |
| `PostCompact`        | 在上下文压缩完成之后                                                                                                                     |
| `Elicitation`        | 当 MCP 服务器在工具调用期间请求用户输入时                                                                                              |
| `ElicitationResult`  | 在用户响应 MCP 请求后，响应发送回服务器之前                                                            |
| `SessionEnd`         | 当会话终止时                                                                                                                              |

### Hook 如何解析

要了解这些部分如何组合在一起，请考虑这个阻止破坏性 shell 命令的 `PreToolUse` hook。`matcher` 缩小到 Bash 工具调用，`if` 条件进一步缩小到以 `rm` 开头的命令，因此 `block-rm.sh` 仅在两个过滤器都匹配时才会启动：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

脚本从 stdin 读取 JSON 输入，提取命令，如果包含 `rm -rf` 则返回 `"deny"` 的 `permissionDecision`：

```bash
#!/bin/bash
# .claude/hooks/block-rm.sh
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # allow the command
fi
```

现在假设 CSC 决定运行 `Bash "rm -rf /tmp/build"`。以下是发生的事情：

**1. 事件触发**

`PreToolUse` 事件触发。CSC 通过 stdin 将工具输入作为 JSON 发送给 hook：

```json
{ "tool_name": "Bash", "tool_input": { "command": "rm -rf /tmp/build" }, ... }
```

**2. 匹配器检查**

匹配器 `"Bash"` 匹配工具名称，因此此 hook 组被激活。如果省略匹配器或使用 `"*"`，则该组在事件的每次发生时都会被激活。

**3. If 条件检查**

`if` 条件 `"Bash(rm *)"` 匹配，因为命令以 `rm` 开头，因此此处理程序启动。如果命令是 `npm test`，`if` 检查将失败，`block-rm.sh` 将永远不会运行，从而避免了进程启动开销。`if` 字段是可选的；没有它，匹配组中的每个处理程序都会运行。

**4. Hook 处理程序运行**

脚本检查完整命令并找到 `rm -rf`，因此它将决策输出到 stdout：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked by hook"
  }
}
```

如果命令是更安全的 `rm` 变体，如 `rm file.txt`，脚本将执行 `exit 0`，这告诉 CSC 允许工具调用，无需进一步操作。

**5. CSC 根据结果采取行动**

CSC 读取 JSON 决策，阻止工具调用，并向 Claude 显示原因。

下面的配置部分记录了完整的模式，每个 hook 事件部分记录了你的命令接收什么输入以及可以返回什么输出。

## 配置

Hooks 定义在 JSON 设置文件中。配置有三个层级的嵌套：

1. 选择一个要响应的 hook 事件，如 `PreToolUse` 或 `Stop`
2. 添加一个匹配器组来过滤何时触发，如"仅用于 Bash 工具"
3. 定义一个或多个在匹配时运行的 hook 处理程序

请参阅上面的 Hook 如何解析以获取带有注释示例的完整演练。

> **注意：**
> 本页面对每个层级使用特定术语：**hook 事件**指生命周期点，**匹配器组**指过滤器，**hook 处理程序**指运行的 shell 命令、HTTP 端点、提示或代理。"Hook" 本身指的是通用功能。

### Hook 位置

你在哪里定义 hook 决定了它的作用范围：

| 位置                                                   | 作用范围                         | 可共享                          |
| :--------------------------------------------------------- | :---------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 你的所有项目             | 否，仅限本机          |
| `.claude/settings.json`                                    | 单个项目                | 是，可以提交到仓库  |
| `.claude/settings.local.json`                              | 单个项目                | 否，被 gitignore                     |
| 托管策略设置                                    | 组织范围             | 是，由管理员控制              |
| 插件 `hooks/hooks.json`                   | 当插件启用时        | 是，随插件打包       |
| 技能或代理 frontmatter | 当组件处于活动状态时 | 是，定义在组件文件中 |

有关设置文件解析的详细信息，请参阅设置。企业管理员可以使用 `allowManagedHooksOnly` 来阻止用户、项目和插件 hooks。在托管设置 `enabledPlugins` 中强制启用的插件 hooks 豁免，因此管理员可以通过组织市场分发经过审查的 hooks。请参阅 Hook 配置。

### 匹配器模式

`matcher` 字段过滤 hooks 何时触发。匹配器的评估方式取决于它包含的字符：

| 匹配器值                       | 评估为                                          | 示例                                                                                                            |
| :---------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `"*"`、`""` 或省略             | 匹配所有                                             | 在事件的每次发生时触发                                                                             |
| 仅包含字母、数字、`_` 和 `\|` | 精确字符串，或 `\|` 分隔的精确字符串列表 | `Bash` 仅匹配 Bash 工具；`Edit\|Write` 精确匹配任一工具                                       |
| 包含任何其他字符        | JavaScript 正则表达式                         | `^Notebook` 匹配任何以 Notebook 开头的工具；`mcp__memory__.*` 匹配 `memory` 服务器的每个工具 |

`FileChanged` 事件在构建其监视列表时不遵循这些规则。请参阅 FileChanged。

每个事件类型匹配不同的字段：

| 事件                                                                                                          | 匹配器过滤的内容                                     | 匹配器值示例                                                                                                    |
| :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`                     | 工具名称                                                    | `Bash`、`Edit\|Write`、`mcp__.*`                                                                                          |
| `SessionStart`                                                                                                 | 会话如何启动                                      | `startup`、`resume`、`clear`、`compact`                                                                                   |
| `SessionEnd`                                                                                                   | 会话为何结束                                        | `clear`、`resume`、`logout`、`prompt_input_exit`、`bypass_permissions_disabled`、`other`                                  |
| `Notification`                                                                                                 | 通知类型                                            | `permission_prompt`、`idle_prompt`、`auth_success`、`elicitation_dialog`                                                  |
| `SubagentStart`                                                                                                | 代理类型                                                   | `Bash`、`Explore`、`Plan` 或自定义代理名称                                                                          |
| `PreCompact`、`PostCompact`                                                                                    | 什么触发了压缩                                    | `manual`、`auto`                                                                                                          |
| `SubagentStop`                                                                                                 | 代理类型                                                   | 与 `SubagentStart` 相同的值                                                                                            |
| `ConfigChange`                                                                                                 | 配置来源                                         | `user_settings`、`project_settings`、`local_settings`、`policy_settings`、`skills`                                        |
| `CwdChanged`                                                                                                   | 不支持匹配器                                           | 每次目录更改时都触发                                                                                    |
| `FileChanged`                                                                                                  | 要监视的字面文件名（请参阅 FileChanged） | `.envrc\|.env`                                                                                                            |
| `StopFailure`                                                                                                  | 错误类型                                                   | `rate_limit`、`authentication_failed`、`billing_error`、`invalid_request`、`server_error`、`max_output_tokens`、`unknown` |
| `InstructionsLoaded`                                                                                           | 加载原因                                                  | `session_start`、`nested_traversal`、`path_glob_match`、`include`、`compact`                                              |
| `Elicitation`                                                                                                  | MCP 服务器名称                                              | 你配置的 MCP 服务器名称                                                                                          |
| `ElicitationResult`                                                                                            | MCP 服务器名称                                              | 与 `Elicitation` 相同的值                                                                                              |
| `UserPromptSubmit`、`Stop`、`TeammateIdle`、`TaskCreated`、`TaskCompleted`、`WorktreeCreate`、`WorktreeRemove` | 不支持匹配器                                           | 每次发生时都触发                                                                                          |

匹配器针对 CSC 通过 stdin 发送给你的 hook 的 JSON 输入中的字段运行。对于工具事件，该字段是 `tool_name`。每个 hook 事件部分列出了该事件的完整匹配器值集和输入模式。

此示例仅在 Claude 写入或编辑文件时运行 lint 脚本：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/lint-check.sh"
          }
        ]
      }
    ]
  }
}
```

`UserPromptSubmit`、`Stop`、`TeammateIdle`、`TaskCreated`、`TaskCompleted`、`WorktreeCreate`、`WorktreeRemove` 和 `CwdChanged` 不支持匹配器，每次发生时都会触发。如果你为这些事件添加 `matcher` 字段，它会被静默忽略。

对于工具事件，你可以通过在单个 hook 处理程序上设置 `if` 字段来更精确地过滤。`if` 使用权限规则语法来匹配工具名称和参数，因此 `"Bash(git *)"` 仅对 `git` 命令运行，`"Edit(*.ts)"` 仅对 TypeScript 文件运行。

#### 匹配 MCP 工具

MCP 服务器工具在工具事件（`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`）中显示为常规工具，因此你可以像匹配任何其他工具名称一样匹配它们。

MCP 工具遵循命名模式 `mcp__<server>__<tool>`，例如：

* `mcp__memory__create_entities`：Memory 服务器的创建实体工具
* `mcp__filesystem__read_file`：Filesystem 服务器的读取文件工具
* `mcp__github__search_repositories`：GitHub 服务器的搜索工具

要匹配服务器中的每个工具，请在服务器前缀后追加 `.*`。`.*` 是必需的：像 `mcp__memory` 这样的匹配器仅包含字母和下划线，因此它作为精确字符串进行比较，不匹配任何工具。

* `mcp__memory__.*` 匹配 `memory` 服务器的所有工具
* `mcp__.*__write.*` 匹配任何服务器中名称以 `write` 开头的任何工具

此示例记录所有 memory 服务器操作并验证来自任何 MCP 服务器的写入操作：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Memory operation initiated' >> ~/mcp-operations.log"
          }
        ]
      },
      {
        "matcher": "mcp__.*__write.*",
        "hooks": [
          {
            "type": "command",
            "command": "/home/user/scripts/validate-mcp-write.py"
          }
        ]
      }
    ]
  }
}
```

### Hook 处理程序字段

内部 `hooks` 数组中的每个对象都是一个 hook 处理程序：当匹配器匹配时运行的 shell 命令、HTTP 端点、LLM 提示或代理。有四种类型：

* **命令 hooks**（`type: "command"`）：运行 shell 命令。你的脚本通过 stdin 接收事件的 JSON 输入，并通过退出码和 stdout 传回结果。
* **HTTP hooks**（`type: "http"`）：将事件的 JSON 输入作为 HTTP POST 请求发送到 URL。端点使用与命令 hooks 相同的 JSON 输出格式通过响应体传回结果。
* **提示 hooks**（`type: "prompt"`）：向 Claude 模型发送提示进行单轮评估。模型以 JSON 返回是/否决策。请参阅基于提示的 hooks。
* **代理 hooks**（`type: "agent"`）：生成可以使用 Read、Grep 和 Glob 等工具的子代理，在返回决策之前验证条件。请参阅基于代理的 hooks。

#### 通用字段

这些字段适用于所有 hook 类型：

| 字段           | 必需 | 描述                                                                                                                                                                                                                                                                                                                                                                                              |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | 是      | `"command"`、`"http"`、`"prompt"` 或 `"agent"`                                                                                                                                                                                                                                                                                                                                                          |
| `if`            | 否       | 权限规则语法，用于过滤此 hook 何时运行，如 `"Bash(git *)"` 或 `"Edit(*.ts)"`。hook 仅在工具调用匹配模式时才启动。仅在工具事件上评估：`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest` 和 `PermissionDenied`。在其他事件上，设置了 `if` 的 hook 永远不会运行。使用与权限规则相同的语法 |
| `timeout`       | 否       | 取消前的秒数。默认值：命令 600，提示 30，代理 60                                                                                                                                                                                                                                                                                                                         |
| `statusMessage` | 否       | hook 运行时显示的自定义加载消息                                                                                                                                                                                                                                                                                                                                                     |
| `once`          | 否       | 如果为 `true`，每个会话仅运行一次然后被移除。仅限技能，不适用于代理。请参阅技能和代理中的 hooks                                                                                                                                                                                                                                                            |

#### 命令 hook 字段

除通用字段外，命令 hooks 还接受这些字段：

| 字段     | 必需 | 描述                                                                                                                                                                                                                           |
| :-------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `command` | 是      | 要执行的 shell 命令                                                                                                                                                                                                              |
| `async`   | 否       | 如果为 `true`，在后台运行而不阻塞。请参阅在后台运行 hooks                                                                                                                   |
| `shell`   | 否       | 用于此 hook 的 shell。接受 `"bash"`（默认）或 `"powershell"`。设置 `"powershell"` 在 Windows 上通过 PowerShell 运行命令。不需要 `CLAUDE_CODE_USE_POWERSHELL_TOOL`，因为 hooks 直接启动 PowerShell |

#### HTTP hook 字段

除通用字段外，HTTP hooks 还接受这些字段：

| 字段            | 必需 | 描述                                                                                                                                                                                      |
| :--------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | 是      | 发送 POST 请求的 URL                                                                                                                                                                  |
| `headers`        | 否       | 作为键值对的额外 HTTP 头。值支持使用 `$VAR_NAME` 或 `${VAR_NAME}` 语法的环境变量插值。仅解析 `allowedEnvVars` 中列出的变量  |
| `allowedEnvVars` | 否       | 可以插入到头值中的环境变量名称列表。对未列出变量的引用被替换为空字符串。任何环境变量插值都需要此项才能工作 |

CSC 将 hook 的 JSON 输入作为带有 `Content-Type: application/json` 的 POST 请求体发送。响应体使用与命令 hooks 相同的 JSON 输出格式。

错误处理与命令 hooks 不同：非 2xx 响应、连接失败和超时都会产生非阻塞错误，允许执行继续。要阻止工具调用或拒绝权限，请返回 2xx 响应，其 JSON 体包含 `decision: "block"` 或带有 `permissionDecision: "deny"` 的 `hookSpecificOutput`。

此示例将 `PreToolUse` 事件发送到本地验证服务，使用 `MY_TOKEN` 环境变量中的令牌进行身份验证：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "http",
            "url": "http://localhost:8080/hooks/pre-tool-use",
            "timeout": 30,
            "headers": {
              "Authorization": "Bearer $MY_TOKEN"
            },
            "allowedEnvVars": ["MY_TOKEN"]
          }
        ]
      }
    ]
  }
}
```

#### 提示和代理 hook 字段

除通用字段外，提示和代理 hooks 还接受这些字段：

| 字段    | 必需 | 描述                                                                                 |
| :------- | :------- | :------------------------------------------------------------------------------------------ |
| `prompt` | 是      | 发送给模型的提示文本。使用 `$ARGUMENTS` 作为 hook 输入 JSON 的占位符 |
| `model`  | 否       | 用于评估的模型。默认为快速模型                                       |

所有匹配的 hooks 并行运行，相同的处理程序会自动去重。命令 hooks 按命令字符串去重，HTTP hooks 按 URL 去重。处理程序在当前目录中使用 CSC 的环境运行。`$CLAUDE_CODE_REMOTE` 环境变量在远程 Web 环境中设置为 `"true"`，在本地 CLI 中未设置。

### 通过路径引用脚本

使用环境变量相对于项目或插件根目录引用 hook 脚本，无论 hook 运行时的工作目录如何：

* `$CLAUDE_PROJECT_DIR`：项目根目录。用引号包裹以处理包含空格的路径。
* `${CLAUDE_PLUGIN_ROOT}`：插件的安装目录，用于随插件打包的脚本。每次插件更新时更改。
* `${CLAUDE_PLUGIN_DATA}`：插件的持久数据目录，用于应在插件更新后保留的依赖和状态。

### 项目脚本

此示例使用 `$CLAUDE_PROJECT_DIR` 在任何 `Write` 或 `Edit` 工具调用后从项目的 `.claude/hooks/` 目录运行样式检查器：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-style.sh"
          }
        ]
      }
    ]
  }
}
```

### 插件脚本

在 `hooks/hooks.json` 中定义插件 hooks，带有可选的顶级 `description` 字段。当插件启用时，其 hooks 会与你的用户和项目 hooks 合并。

此示例运行随插件打包的格式化脚本：

```json
{
  "description": "Automatic code formatting",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

有关创建插件 hooks 的详细信息，请参阅插件组件参考。

### 技能和代理中的 Hooks

除了设置文件和插件外，hooks 还可以直接在使用 frontmatter 的技能和子代理中定义。这些 hooks 的作用范围限定在组件的生命周期内，仅在该组件处于活动状态时运行。

支持所有 hook 事件。对于子代理，`Stop` hooks 会自动转换为 `SubagentStop`，因为那是子代理完成时触发的事件。

Hooks 使用与基于设置的 hooks 相同的配置格式，但作用范围限定在组件的生命周期内，并在组件完成时清理。

此技能定义了一个 `PreToolUse` hook，在每个 `Bash` 命令之前运行安全验证脚本：

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

代理在其 YAML frontmatter 中使用相同的格式。

### `/hooks` 菜单

在 CSC 中输入 `/hooks` 以打开配置 hooks 的只读浏览器。菜单显示每个 hook 事件及其已配置 hooks 的计数，让你可以深入查看匹配器，并显示每个 hook 处理程序的完整详细信息。使用它来验证配置、检查 hook 来自哪个设置文件，或检查 hook 的命令、提示或 URL。

菜单显示所有四种 hook 类型：`command`、`prompt`、`agent` 和 `http`。每个 hook 都标有 `[type]` 前缀和指示其定义位置的来源：

* `User`：来自 `~/.claude/settings.json`
* `Project`：来自 `.claude/settings.json`
* `Local`：来自 `.claude/settings.local.json`
* `Plugin`：来自插件的 `hooks/hooks.json`
* `Session`：在当前会话的内存中注册
* `Built-in`：由 CSC 内部注册

选择一个 hook 会打开一个详细视图，显示其事件、匹配器、类型、源文件以及完整的命令、提示或 URL。菜单是只读的：要添加、修改或移除 hooks，请直接编辑设置 JSON 或要求 Claude 进行更改。

### 禁用或移除 hooks

要移除 hook，请从设置 JSON 文件中删除其条目。

要在不移除的情况下临时禁用所有 hooks，请在设置文件中设置 `"disableAllHooks": true`。无法在保留配置中的单个 hook 的同时禁用它。

`disableAllHooks` 设置遵循托管设置的层级结构。如果管理员已通过托管策略设置配置了 hooks，则在用户、项目或本地设置中设置的 `disableAllHooks` 无法禁用那些托管 hooks。只有在托管设置级别设置的 `disableAllHooks` 才能禁用托管 hooks。

对设置文件中 hooks 的直接编辑通常会由文件监视器自动检测。

## Hook 输入和输出

命令 hooks 通过 stdin 接收 JSON 数据，并通过退出码、stdout 和 stderr 传回结果。HTTP hooks 接收相同的 JSON 作为 POST 请求体，并通过 HTTP 响应体传回结果。本节涵盖所有事件共有的字段和行为。Hook 事件下每个事件的部分包括其特定的输入模式和决策控制选项。

### 通用输入字段

Hook 事件除了每个 hook 事件部分中记录的事件特定字段外，还接收这些字段作为 JSON。对于命令 hooks，此 JSON 通过 stdin 到达。对于 HTTP hooks，它作为 POST 请求体到达。

| 字段             | 描述                                                                                                                                                                                                                           |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `session_id`      | 当前会话标识符                                                                                                                                                                                                            |
| `transcript_path` | 对话 JSON 的路径                                                                                                                                                                                                             |
| `cwd`             | hook 被调用时的当前工作目录                                                                                                                                                                                    |
| `permission_mode` | 当前权限模式：`"default"`、`"plan"`、`"acceptEdits"`、`"auto"`、`"dontAsk"` 或 `"bypassPermissions"`。并非所有事件都接收此字段：请查看下面每个事件的 JSON 示例来检查 |
| `hook_event_name` | 触发的事件名称                                                                                                                                                                                                          |

当使用 `--agent` 运行或在子代理内部时，会包含两个额外的字段：

| 字段        | 描述                                                                                                                                                                                                                          |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent_id`   | 子代理的唯一标识符。仅在 hook 在子代理调用内部触发时存在。使用它来区分子代理 hook 调用和主线程调用。                                                                     |
| `agent_type` | 代理名称（例如，`"Explore"` 或 `"security-reviewer"`）。当会话使用 `--agent` 或 hook 在子代理内部触发时存在。对于子代理，子代理的类型优先于会话的 `--agent` 值。 |

例如，Bash 命令的 `PreToolUse` hook 通过 stdin 接收以下内容：

```json
{
  "session_id": "abc123",
  "transcript_path": "/home/user/.claude/projects/.../transcript.jsonl",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

`tool_name` 和 `tool_input` 字段是事件特定的。每个 hook 事件部分记录了该事件的额外字段。

### 退出码输出

hook 命令的退出码告诉 CSC 操作是否应继续、被阻止或被忽略。

**退出码 0** 表示成功。CSC 解析 stdout 以获取 JSON 输出字段。JSON 输出仅在退出码 0 时处理。对于大多数事件，stdout 写入调试日志但不显示在记录中。例外是 `UserPromptSubmit` 和 `SessionStart`，其中 stdout 作为 Claude 可以看到并据此行动的上下文添加。

**退出码 2** 表示阻塞错误。CSC 忽略 stdout 及其中的任何 JSON。相反，stderr 文本作为错误消息反馈给 Claude。效果取决于事件：`PreToolUse` 阻止工具调用，`UserPromptSubmit` 拒绝提示，等等。请参阅每个事件的退出码 2 行为以获取完整列表。

**任何其他退出码** 对于大多数 hook 事件是非阻塞错误。记录中显示 `<hook name> hook error` 通知，后跟 stderr 的第一行，因此你可以在不使用 `--debug` 的情况下识别原因。执行继续，完整的 stderr 写入调试日志。

例如，一个阻止危险 Bash 命令的 hook 命令脚本：

```bash
#!/bin/bash
# Reads JSON input from stdin, checks the command
command=$(jq -r '.tool_input.command' < /dev/stdin)

if [[ "$command" == rm* ]]; then
  echo "Blocked: rm commands are not allowed" >&2
  exit 2  # Blocking error: tool call is prevented
fi

exit 0  # Success: tool call proceeds
```

> **⚠️ 警告：**
> 对于大多数 hook 事件，只有退出码 2 会阻止操作。CSC 将退出码 1 视为非阻塞错误并继续执行操作，即使 1 是传统的 Unix 失败码。如果你的 hook 旨在强制执行策略，请使用 `exit 2`。例外是 `WorktreeCreate`，其中任何非零退出码都会中止工作树创建。

#### 每个事件的退出码 2 行为

退出码 2 是 hook 发出"停止，不要这样做"信号的方式。效果取决于事件，因为有些事件代表可以被阻止的操作（如尚未发生的工具调用），而其他事件代表已经发生或无法阻止的事情。

| Hook 事件           | 可以阻止？ | 退出码 2 时发生什么                                                                                                               |
| :------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `PreToolUse`         | 是        | 阻止工具调用                                                                                                                 |
| `PermissionRequest`  | 是        | 拒绝权限                                                                                                                |
| `UserPromptSubmit`   | 是        | 阻止提示处理并清除提示                                                                                       |
| `Stop`               | 是        | 阻止 Claude 停止，继续对话                                                                            |
| `SubagentStop`       | 是        | 阻止子代理停止                                                                                                  |
| `TeammateIdle`       | 是        | 阻止队友进入空闲状态（队友继续工作）                                                                   |
| `TaskCreated`        | 是        | 回滚任务创建                                                                                                         |
| `TaskCompleted`      | 是        | 阻止任务被标记为完成                                                                                     |
| `ConfigChange`       | 是        | 阻止配置更改生效（`policy_settings` 除外）                                                        |
| `StopFailure`        | 否         | 输出和退出码被忽略                                                                                                     |
| `PostToolUse`        | 否         | 向 Claude 显示 stderr（工具已运行）                                                                                            |
| `PostToolUseFailure` | 否         | 向 Claude 显示 stderr（工具已失败）                                                                                         |
| `PermissionDenied`   | 否         | 退出码和 stderr 被忽略（拒绝已发生）。使用 JSON `hookSpecificOutput.retry: true` 告知模型可以重试 |
| `Notification`       | 否         | 仅向用户显示 stderr                                                                                                            |
| `SubagentStart`      | 否         | 仅向用户显示 stderr                                                                                                            |
| `SessionStart`       | 否         | 仅向用户显示 stderr                                                                                                            |
| `SessionEnd`         | 否         | 仅向用户显示 stderr                                                                                                            |
| `CwdChanged`         | 否         | 仅向用户显示 stderr                                                                                                            |
| `FileChanged`        | 否         | 仅向用户显示 stderr                                                                                                            |
| `PreCompact`         | 否         | 仅向用户显示 stderr                                                                                                            |
| `PostCompact`        | 否         | 仅向用户显示 stderr                                                                                                            |
| `Elicitation`        | 是        | 拒绝请求                                                                                                               |
| `ElicitationResult`  | 是        | 阻止响应（操作变为拒绝）                                                                                         |
| `WorktreeCreate`     | 是        | 任何非零退出码都会导致工作树创建失败                                                                              |
| `WorktreeRemove`     | 否         | 失败仅在调试模式下记录                                                                                               |
| `InstructionsLoaded` | 否         | 退出码被忽略                                                                                                                 |

### HTTP 响应处理

HTTP hooks 使用 HTTP 状态码和响应体代替退出码和 stdout：

* **2xx 且响应体为空**：成功，等同于退出码 0 且无输出
* **2xx 且响应体为纯文本**：成功，文本作为上下文添加
* **2xx 且响应体为 JSON**：成功，使用与命令 hooks 相同的 JSON 输出模式解析
* **非 2xx 状态**：非阻塞错误，执行继续
* **连接失败或超时**：非阻塞错误，执行继续

与命令 hooks 不同，HTTP hooks 无法仅通过状态码发出阻塞错误信号。要阻止工具调用或拒绝权限，请返回 2xx 响应，其 JSON 体包含适当的决策字段。

### JSON 输出

退出码让你允许或阻止，但 JSON 输出给你更细粒度的控制。与其以退出码 2 退出来阻止，不如退出码 0 并将 JSON 对象打印到 stdout。CSC 从该 JSON 中读取特定字段来控制行为，包括用于阻止、允许或升级给用户的决策控制。

> **注意：**
> 你必须为每个 hook 选择一种方法，而不是两者兼用：要么仅使用退出码进行信号传递，要么退出码 0 并打印 JSON 进行结构化控制。CSC 仅在退出码 0 时处理 JSON。如果你退出码 2，任何 JSON 都会被忽略。

你的 hook 的 stdout 必须仅包含 JSON 对象。如果你的 shell 配置文件在启动时打印文本，它可能会干扰 JSON 解析。请参阅故障排除指南中的 JSON 验证失败。

注入到上下文中的 hook 输出（`additionalContext`、`systemMessage` 或纯 stdout）上限为 10,000 个字符。超过此限制的输出会保存到文件并替换为预览和文件路径，与大型工具结果的处理方式相同。

JSON 对象支持三种字段：

* **通用字段** 如 `continue` 适用于所有事件。这些列在下表中。
* **顶级 `decision` 和 `reason`** 被某些事件用于阻止或提供反馈。
* **`hookSpecificOutput`** 是需要更丰富控制的事件的嵌套对象。它需要一个设置为事件名称的 `hookEventName` 字段。

| 字段            | 默认值 | 描述                                                                                                                |
| :--------------- | :------ | :------------------------------------------------------------------------------------------------------------------------- |
| `continue`       | `true`  | 如果为 `false`，Claude 在 hook 运行后完全停止处理。优先于任何事件特定的决策字段 |
| `stopReason`     | 无    | 当 `continue` 为 `false` 时向用户显示的消息。不向 Claude 显示                                                  |
| `suppressOutput` | `false` | 如果为 `true`，从调试日志中省略 stdout                                                                                 |
| `systemMessage`  | 无    | 向用户显示的警告消息                                                                                          |

要完全停止 Claude，无论事件类型如何：

```json
{ "continue": false, "stopReason": "Build failed, fix errors before continuing" }
```

#### 决策控制

并非每个事件都支持通过 JSON 阻止或控制行为。支持的事件各自使用不同的字段集来表达该决策。在编写 hook 之前，使用此表作为快速参考：

| 事件                                                                                                                      | 决策模式               | 关键字段                                                                                                                                                          |
| :-------------------------------------------------------------------------------------------------------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UserPromptSubmit, PostToolUse, PostToolUseFailure, Stop, SubagentStop, ConfigChange                                         | 顶级 `decision`           | `decision: "block"`、`reason`                                                                                                                                       |
| TeammateIdle, TaskCreated, TaskCompleted                                                                                    | 退出码或 `continue: false` | 退出码 2 通过 stderr 反馈阻止操作。JSON `{"continue": false, "stopReason": "..."}` 也会完全停止队友，匹配 `Stop` hook 行为 |
| PreToolUse                                                                                                                  | `hookSpecificOutput`           | `permissionDecision`（allow/deny/ask/defer）、`permissionDecisionReason`                                                                                             |
| PermissionRequest                                                                                                           | `hookSpecificOutput`           | `decision.behavior`（allow/deny）                                                                                                                                    |
| PermissionDenied                                                                                                            | `hookSpecificOutput`           | `retry: true` 告知模型可以重试被拒绝的工具调用                                                                                                     |
| WorktreeCreate                                                                                                              | 路径返回                    | 命令 hook 在 stdout 上打印路径；HTTP hook 返回 `hookSpecificOutput.worktreePath`。Hook 失败或缺少路径会导致创建失败                                |
| Elicitation                                                                                                                 | `hookSpecificOutput`           | `action`（accept/decline/cancel）、`content`（accept 的表单字段值）                                                                                          |
| ElicitationResult                                                                                                           | `hookSpecificOutput`           | `action`（accept/decline/cancel）、`content`（表单字段值覆盖）                                                                                            |
| WorktreeRemove, Notification, SessionEnd, PreCompact, PostCompact, InstructionsLoaded, StopFailure, CwdChanged, FileChanged | 无                           | 无决策控制。用于日志记录或清理等副作用                                                                                                  |

以下是每种模式的实际示例：

### 顶级 decision

用于 `UserPromptSubmit`、`PostToolUse`、`PostToolUseFailure`、`Stop`、`SubagentStop` 和 `ConfigChange`。唯一的值是 `"block"`。要允许操作继续，请从 JSON 中省略 `decision`，或者退出码 0 且不带任何 JSON：

```json
{
  "decision": "block",
  "reason": "Test suite must pass before proceeding"
}
```

### PreToolUse

使用 `hookSpecificOutput` 进行更丰富的控制：允许、拒绝或升级给用户。你还可以在工具运行之前修改工具输入或为 Claude 注入额外的上下文。请参阅 PreToolUse 决策控制以获取完整的选项集。

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Database writes are not allowed"
  }
}
```

### PermissionRequest

使用 `hookSpecificOutput` 代表用户允许或拒绝权限请求。允许时，你还可以修改工具的输入或应用权限规则，这样用户就不会再次被提示。请参阅 PermissionRequest 决策控制以获取完整的选项集。

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      }
    }
  }
}
```

有关扩展示例，包括 Bash 命令验证、提示过滤和自动批准脚本，请参阅指南中的你可以自动化什么以及 Bash 命令验证器参考实现。

## Hook 事件

每个事件对应 CSC 生命周期中可以运行 hooks 的一个点。以下部分按生命周期顺序排列：从会话设置到智能体循环再到会话结束。每个部分描述事件何时触发、支持哪些匹配器、接收什么 JSON 输入，以及如何通过输出控制行为。

### SessionStart

当 CSC 开始新会话或恢复现有会话时运行。适用于加载开发上下文，如现有问题或代码库的最近更改，或设置环境变量。对于不需要脚本的静态上下文，请改用 CLAUDE.md。

SessionStart 在每个会话上运行，因此请保持这些 hooks 快速。仅支持 `type: "command"` hooks。

匹配器值对应于会话的启动方式：

| 匹配器   | 触发时机                          |
| :-------- | :------------------------------------- |
| `startup` | 新会话                            |
| `resume`  | `--resume`、`--continue` 或 `/resume` |
| `clear`   | `/clear`                               |
| `compact` | 自动或手动压缩              |

#### SessionStart 输入

除通用输入字段外，SessionStart hooks 接收 `source`、`model` 和可选的 `agent_type`。`source` 字段指示会话如何启动：`"startup"` 表示新会话，`"resume"` 表示恢复的会话，`"clear"` 表示 `/clear` 之后，`"compact"` 表示压缩之后。`model` 字段包含模型标识符。如果你使用 `csc --agent <name>` 启动 CSC，`agent_type` 字段包含代理名称。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SessionStart",
  "source": "startup",
  "model": "claude-sonnet-4-6"
}
```

#### SessionStart 决策控制

你的 hook 脚本打印到 stdout 的任何文本都会作为 Claude 的上下文添加。除了所有 hooks 可用的 JSON 输出字段外，你还可以返回这些事件特定的字段：

| 字段               | 描述                                                               |
| :------------------ | :------------------------------------------------------------------------ |
| `additionalContext` | 添加到 Claude 上下文的字符串。多个 hooks 的值会连接起来 |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "My additional context here"
  }
}
```

#### 持久化环境变量

SessionStart hooks 可以访问 `CLAUDE_ENV_FILE` 环境变量，它提供了一个文件路径，你可以在其中为后续 Bash 命令持久化环境变量。

要设置单个环境变量，请将 `export` 语句写入 `CLAUDE_ENV_FILE`。使用追加（`>>`）来保留其他 hooks 设置的变量：

```bash
#!/bin/bash

if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

要从设置命令中捕获所有环境更改，请比较之前和之后的导出变量：

```bash
#!/bin/bash

ENV_BEFORE=$(export -p | sort)

# Run your setup commands that modify the environment
source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

写入此文件的任何变量将在 CSC 在会话期间执行的所有后续 Bash 命令中可用。

> **注意：**
> `CLAUDE_ENV_FILE` 可用于 SessionStart、CwdChanged 和 FileChanged hooks。其他 hook 类型无法访问此变量。

### InstructionsLoaded

当 `CLAUDE.md` 或 `.claude/rules/*.md` 文件被加载到上下文中时触发。此事件在会话开始时为急切加载的文件触发，稍后当文件被延迟加载时再次触发，例如当 Claude 访问包含嵌套 `CLAUDE.md` 的子目录或具有 `paths:` frontmatter 的条件规则匹配时。该 hook 不支持阻止或决策控制。它出于可观察性目的异步运行。

匹配器针对 `load_reason` 运行。例如，使用 `"matcher": "session_start"` 仅在会话开始时为文件触发，或使用 `"matcher": "path_glob_match|nested_traversal"` 仅在延迟加载时触发。

#### InstructionsLoaded 输入

除通用输入字段外，InstructionsLoaded hooks 接收这些字段：

| 字段               | 描述                                                                                                                                                                                                   |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `file_path`         | 被加载的指令文件的绝对路径                                                                                                                                                         |
| `memory_type`       | 文件的范围：`"User"`、`"Project"`、`"Local"` 或 `"Managed"`                                                                                                                                           |
| `load_reason`       | 文件被加载的原因：`"session_start"`、`"nested_traversal"`、`"path_glob_match"`、`"include"` 或 `"compact"`。`"compact"` 值在压缩事件后重新加载指令文件时触发 |
| `globs`             | 文件 `paths:` frontmatter 中的路径 glob 模式（如果有）。仅在 `path_glob_match` 加载时存在                                                                                                     |
| `trigger_file_path` | 触发此加载的文件访问路径，用于延迟加载                                                                                                                                             |
| `parent_file_path`  | 包含此文件的父指令文件路径，用于 `include` 加载                                                                                                                               |

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project",
  "hook_event_name": "InstructionsLoaded",
  "file_path": "/Users/my-project/CLAUDE.md",
  "memory_type": "Project",
  "load_reason": "session_start"
}
```

#### InstructionsLoaded 决策控制

InstructionsLoaded hooks 没有决策控制。它们无法阻止或修改指令加载。使用此事件进行审计日志记录、合规跟踪或可观察性。

### UserPromptSubmit

当用户提交提示时运行，在 Claude 处理它之前。这允许你根据提示/对话添加额外的上下文、验证提示或阻止某些类型的提示。

#### UserPromptSubmit 输入

除通用输入字段外，UserPromptSubmit hooks 接收包含用户提交文本的 `prompt` 字段。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "Write a function to calculate the factorial of a number"
}
```

#### UserPromptSubmit 决策控制

`UserPromptSubmit` hooks 可以控制用户提示是否被处理并添加上下文。所有 JSON 输出字段都可用。

在退出码 0 时有两种方法可以向对话添加上下文：

* **纯文本 stdout**：写入 stdout 的任何非 JSON 文本都作为上下文添加
* **带有 `additionalContext` 的 JSON**：使用下面的 JSON 格式进行更多控制。`additionalContext` 字段作为上下文添加

纯 stdout 在记录中显示为 hook 输出。`additionalContext` 字段更隐蔽地添加。

要阻止提示，请返回 `decision` 设置为 `"block"` 的 JSON 对象：

| 字段               | 描述                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| `decision`          | `"block"` 阻止提示被处理并将其从上下文中删除。省略以允许提示继续 |
| `reason`            | 当 `decision` 为 `"block"` 时向用户显示。不添加到上下文                                               |
| `additionalContext` | 添加到 Claude 上下文的字符串                                                                                   |
| `sessionTitle`      | 设置会话标题，与 `/rename` 效果相同。用于根据提示内容自动命名会话   |

```json
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "My additional context here",
    "sessionTitle": "My session title"
  }
}
```

> **注意：**
> JSON 格式对于简单用例不是必需的。要添加上下文，你可以在退出码 0 时将纯文本打印到 stdout。当你需要阻止提示或想要更结构化的控制时使用 JSON。

### PreToolUse

在 Claude 创建工具参数之后、处理工具调用之前运行。按工具名称匹配：`Bash`、`Edit`、`Write`、`Read`、`Glob`、`Grep`、`Agent`、`WebFetch`、`WebSearch`、`AskUserQuestion`、`ExitPlanMode` 以及任何 MCP 工具名称。

使用 PreToolUse 决策控制来允许、拒绝、询问或延迟工具调用。

#### PreToolUse 输入

除通用输入字段外，PreToolUse hooks 接收 `tool_name`、`tool_input` 和 `tool_use_id`。`tool_input` 字段取决于工具：

##### Bash

执行 shell 命令。

| 字段               | 类型    | 示例            | 描述                                   |
| :------------------ | :------ | :----------------- | :-------------------------------------------- |
| `command`           | string  | `"npm test"`       | 要执行的 shell 命令                  |
| `description`       | string  | `"Run test suite"` | 命令功能的可选描述 |
| `timeout`           | number  | `120000`           | 可选的超时时间（毫秒）              |
| `run_in_background` | boolean | `false`            | 是否在后台运行命令      |

##### Write

创建或覆盖文件。

| 字段       | 类型   | 示例               | 描述                        |
| :---------- | :----- | :-------------------- | :--------------------------------- |
| `file_path` | string | `"/path/to/file.txt"` | 要写入的文件的绝对路径 |
| `content`   | string | `"file content"`      | 要写入文件的内容       |

##### Edit

替换现有文件中的字符串。

| 字段         | 类型    | 示例               | 描述                        |
| :------------ | :------ | :-------------------- | :--------------------------------- |
| `file_path`   | string  | `"/path/to/file.txt"` | 要编辑的文件的绝对路径  |
| `old_string`  | string  | `"original text"`     | 要查找和替换的文本           |
| `new_string`  | string  | `"replacement text"`  | 替换文本                   |
| `replace_all` | boolean | `false`               | 是否替换所有出现 |

##### Read

读取文件内容。

| 字段       | 类型   | 示例               | 描述                                |
| :---------- | :----- | :-------------------- | :----------------------------------------- |
| `file_path` | string | `"/path/to/file.txt"` | 要读取的文件的绝对路径          |
| `offset`    | number | `10`                  | 可选的起始读取行号 |
| `limit`     | number | `50`                  | 可选的读取行数           |

##### Glob

查找匹配 glob 模式的文件。

| 字段     | 类型   | 示例          | 描述                                                            |
| :-------- | :----- | :--------------- | :--------------------------------------------------------------------- |
| `pattern` | string | `"**/*.ts"`      | 用于匹配文件的 glob 模式                                    |
| `path`    | string | `"/path/to/dir"` | 可选的搜索目录。默认为当前工作目录 |

##### Grep

使用正则表达式搜索文件内容。

| 字段         | 类型    | 示例          | 描述                                                                           |
| :------------ | :------ | :--------------- | :------------------------------------------------------------------------------------ |
| `pattern`     | string  | `"TODO.*fix"`    | 要搜索的正则表达式模式                                              |
| `path`        | string  | `"/path/to/dir"` | 可选的搜索文件或目录                                               |
| `glob`        | string  | `"*.ts"`         | 可选的用于过滤文件的 glob 模式                                                 |
| `output_mode` | string  | `"content"`      | `"content"`、`"files_with_matches"` 或 `"count"`。默认为 `"files_with_matches"` |
| `-i`          | boolean | `true`           | 不区分大小写搜索                                                               |
| `multiline`   | boolean | `false`          | 启用多行匹配                                                             |

##### WebFetch

获取并处理 Web 内容。

| 字段    | 类型   | 示例                       | 描述                          |
| :------- | :----- | :---------------------------- | :----------------------------------- |
| `url`    | string | `"https://example.com/api"`   | 获取内容的 URL            |
| `prompt` | string | `"Extract the API endpoints"` | 对获取的内容运行的提示 |

##### WebSearch

搜索 Web。

| 字段             | 类型   | 示例                        | 描述                                       |
| :---------------- | :----- | :----------------------------- | :------------------------------------------------ |
| `query`           | string | `"react hooks best practices"` | 搜索查询                                      |
| `allowed_domains` | array  | `["docs.example.com"]`         | 可选：仅包含来自这些域的结果 |
| `blocked_domains` | array  | `["spam.example.com"]`         | 可选：排除来自这些域的结果      |

##### Agent

生成子代理。

| 字段           | 类型   | 示例                    | 描述                                  |
| :-------------- | :----- | :------------------------- | :------------------------------------------- |
| `prompt`        | string | `"Find all API endpoints"` | 代理要执行的任务            |
| `description`   | string | `"Find API endpoints"`     | 任务的简短描述                |
| `subagent_type` | string | `"Explore"`                | 要使用的专业代理类型             |
| `model`         | string | `"sonnet"`                 | 可选的模型别名以覆盖默认值 |

##### AskUserQuestion

向用户提出一到四个多选题。

| 字段       | 类型   | 示例                                                                                                            | 描述                                                                                                                                                                                      |
| :---------- | :----- | :----------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `questions` | array  | `[{"question": "Which framework?", "header": "Framework", "options": [{"label": "React"}], "multiSelect": false}]` | 要呈现的问题，每个问题包含 `question` 字符串、简短的 `header`、`options` 数组和可选的 `multiSelect` 标志                                                                            |
| `answers`   | object | `{"Which framework?": "React"}`                                                                                    | 可选。将问题文本映射到选定的选项标签。多选答案用逗号连接标签。Claude 不会设置此字段；通过 `updatedInput` 提供它以编程方式回答 |

#### PreToolUse 决策控制

`PreToolUse` hooks 可以控制工具调用是否继续。与使用顶级 `decision` 字段的其他 hooks 不同，PreToolUse 在 `hookSpecificOutput` 对象内返回其决策。这给了它更丰富的控制：四种结果（允许、拒绝、询问或延迟）加上在执行之前修改工具输入的能力。

| 字段                      | 描述                                                                                                                                                                                                                                                                  |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permissionDecision`       | `"allow"` 跳过权限提示。`"deny"` 阻止工具调用。`"ask"` 提示用户确认。`"defer"` 优雅退出以便稍后恢复工具。当 hook 返回 `"allow"` 时，拒绝和询问规则仍然适用 |
| `permissionDecisionReason` | 对于 `"allow"` 和 `"ask"`，向用户显示但不向 Claude 显示。对于 `"deny"`，向 Claude 显示。对于 `"defer"`，忽略                                                                                                                                                           |
| `updatedInput`             | 在执行之前修改工具的输入参数。替换整个输入对象，因此请包含未更改的字段以及修改后的字段。与 `"allow"` 结合以自动批准，或与 `"ask"` 结合以向用户显示修改后的输入。对于 `"defer"`，忽略              |
| `additionalContext`        | 在工具执行之前添加到 Claude 上下文的字符串。对于 `"defer"`，忽略                                                                                                                                                                                            |

当多个 PreToolUse hooks 返回不同的决策时，优先级为 `deny` > `defer` > `ask` > `allow`。

当 hook 返回 `"ask"` 时，向用户显示的权限提示包含标识 hook 来源的标签：例如，`[User]`、`[Project]`、`[Plugin]` 或 `[Local]`。这有助于用户了解哪个配置源正在请求确认。

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "My reason here",
    "updatedInput": {
      "field_to_modify": "new value"
    },
    "additionalContext": "Current environment: production. Proceed with caution."
  }
}
```

`AskUserQuestion` 和 `ExitPlanMode` 需要用户交互，通常在使用 `-p` 标志的非交互模式下会阻塞。返回 `permissionDecision: "allow"` 加上 `updatedInput` 可以满足该要求：hook 从 stdin 读取工具的输入，通过你自己的 UI 收集答案，并在 `updatedInput` 中返回它，这样工具无需提示即可运行。仅返回 `"allow"` 对这些工具是不够的。对于 `AskUserQuestion`，回显原始的 `questions` 数组并添加一个 `answers` 对象，将每个问题的文本映射到所选答案。

> **注意：**
> PreToolUse 以前使用顶级的 `decision` 和 `reason` 字段，但这些在此事件中已弃用。请改用 `hookSpecificOutput.permissionDecision` 和 `hookSpecificOutput.permissionDecisionReason`。已弃用的值 `"approve"` 和 `"block"` 分别映射到 `"allow"` 和 `"deny"`。其他事件如 PostToolUse 和 Stop 继续使用顶级 `decision` 和 `reason` 作为其当前格式。

#### 延迟工具调用以便稍后处理

`"defer"` 适用于将 `csc -p` 作为子进程运行并读取其 JSON 输出的集成，例如 Agent SDK 应用程序或基于 CSC 构建的自定义 UI。它让调用进程可以在工具调用处暂停 Claude，通过自己的界面收集输入，并从停下的地方恢复。CSC 仅在使用 `-p` 标志的非交互模式下接受此值。在交互会话中，它会记录警告并忽略 hook 结果。

> **注意：**
> `defer` 值需要 CSC v2.1.89 或更高版本。早期版本无法识别它，工具会通过正常的权限流程继续。

`AskUserQuestion` 工具是典型情况：Claude 想问用户一些事情，但没有终端可以回答。往返过程如下：

1. Claude 调用 `AskUserQuestion`。`PreToolUse` hook 触发。
2. hook 返回 `permissionDecision: "defer"`。工具不执行。进程以 `stop_reason: "tool_deferred"` 退出，待处理的工具调用保留在记录中。
3. 调用进程从 SDK 结果中读取 `deferred_tool_use`，在其自己的 UI 中显示问题，并等待答案。
4. 调用进程运行 `csc -p --resume <session-id>`。相同的工具调用再次触发 `PreToolUse`。
5. hook 返回 `permissionDecision: "allow"` 并在 `updatedInput` 中附带答案。工具执行，Claude 继续。

`deferred_tool_use` 字段携带工具的 `id`、`name` 和 `input`。`input` 是 Claude 为工具调用生成的参数，在执行之前捕获：

```json
{
  "type": "result",
  "subtype": "success",
  "stop_reason": "tool_deferred",
  "session_id": "abc123",
  "deferred_tool_use": {
    "id": "toolu_01abc",
    "name": "AskUserQuestion",
    "input": { "questions": [{ "question": "Which framework?", "header": "Framework", "options": [{"label": "React"}, {"label": "Vue"}], "multiSelect": false }] }
  }
}
```

没有超时或重试限制。会话保留在磁盘上，直到你恢复它。如果恢复时答案还没准备好，hook 可以再次返回 `"defer"`，进程以相同方式退出。调用进程通过最终从 hook 返回 `"allow"` 或 `"deny"` 来控制何时打破循环。

`"defer"` 仅在 Claude 在轮次中发出单个工具调用时有效。如果 Claude 同时发出多个工具调用，`"defer"` 会被忽略并显示警告，工具通过正常的权限流程继续。存在此约束是因为恢复只能重新运行一个工具：没有办法从一批调用中延迟一个而不让其他调用未解决。

如果延迟的工具在你恢复时不再可用，进程会在 hook 触发之前以 `stop_reason: "tool_deferred_unavailable"` 和 `is_error: true` 退出。当提供该工具的 MCP 服务器未为恢复的会话连接时会发生这种情况。`deferred_tool_use` 负载仍会包含，以便你识别哪个工具缺失了。

> **⚠️ 警告：**
> `--resume` 不会从之前的会话恢复权限模式。在恢复时传递与工具被延迟时活动的相同的 `--permission-mode` 标志。如果模式不同，CSC 会记录警告。

### PermissionRequest

当用户看到权限对话框时运行。使用 PermissionRequest 决策控制代表用户允许或拒绝。

按工具名称匹配，与 PreToolUse 相同的值。

#### PermissionRequest 输入

PermissionRequest hooks 接收与 PreToolUse hooks 相同的 `tool_name` 和 `tool_input` 字段，但没有 `tool_use_id`。可选的 `permission_suggestions` 数组包含用户通常在权限对话框中看到的"始终允许"选项。区别在于 hook 何时触发：PermissionRequest hooks 在权限对话框即将显示给用户时运行，而 PreToolUse hooks 在工具执行之前运行，无论权限状态如何。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf node_modules",
    "description": "Remove node_modules directory"
  },
  "permission_suggestions": [
    {
      "type": "addRules",
      "rules": [{ "toolName": "Bash", "ruleContent": "rm -rf node_modules" }],
      "behavior": "allow",
      "destination": "localSettings"
    }
  ]
}
```

#### PermissionRequest 决策控制

`PermissionRequest` hooks 可以允许或拒绝权限请求。除了所有 hooks 可用的 JSON 输出字段外，你的 hook 脚本可以返回带有这些事件特定字段的 `decision` 对象：

| 字段                | 描述                                                                                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `behavior`           | `"allow"` 授予权限，`"deny"` 拒绝权限                                                                                                                 |
| `updatedInput`       | 仅用于 `"allow"`：在执行之前修改工具的输入参数。替换整个输入对象，因此请包含未更改的字段以及修改后的字段    |
| `updatedPermissions` | 仅用于 `"allow"`：要应用的权限更新条目数组，例如添加允许规则或更改会话权限模式 |
| `message`            | 仅用于 `"deny"`：告诉 Claude 为什么权限被拒绝                                                                                                       |
| `interrupt`          | 仅用于 `"deny"`：如果为 `true`，停止 Claude                                                                                                                          |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      }
    }
  }
}
```

#### 权限更新条目

`updatedPermissions` 输出字段和 `permission_suggestions` 输入字段都使用相同的条目对象数组。每个条目有一个 `type` 来决定其其他字段，以及一个 `destination` 来控制更改写入的位置。

| `type`              | 字段                             | 效果                                                                                                                                                                      |
| :------------------ | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addRules`          | `rules`、`behavior`、`destination` | 添加权限规则。`rules` 是 `{toolName, ruleContent?}` 对象的数组。省略 `ruleContent` 以匹配整个工具。`behavior` 是 `"allow"`、`"deny"` 或 `"ask"` |
| `replaceRules`      | `rules`、`behavior`、`destination` | 用提供的 `rules` 替换 `destination` 处给定 `behavior` 的所有规则                                                                                   |
| `removeRules`       | `rules`、`behavior`、`destination` | 移除给定 `behavior` 的匹配规则                                                                                                                              |
| `setMode`           | `mode`、`destination`              | 更改权限模式。有效模式为 `default`、`acceptEdits`、`dontAsk`、`bypassPermissions` 和 `plan`                                                           |
| `addDirectories`    | `directories`、`destination`       | 添加工作目录。`directories` 是路径字符串数组                                                                                                         |
| `removeDirectories` | `directories`、`destination`       | 移除工作目录                                                                                                                                                 |

每个条目上的 `destination` 字段决定更改是保留在内存中还是持久化到设置文件。

| `destination`     | 写入位置                                       |
| :---------------- | :---------------------------------------------- |
| `session`         | 仅在内存中，会话结束时丢弃 |
| `localSettings`   | `.claude/settings.local.json`                   |
| `projectSettings` | `.claude/settings.json`                         |
| `userSettings`    | `~/.claude/settings.json`                       |

hook 可以将其接收的 `permission_suggestions` 之一作为自己的 `updatedPermissions` 输出回显，这等同于用户在对话框中选择该"始终允许"选项。

### PostToolUse

在工具成功完成后立即运行。

按工具名称匹配，与 PreToolUse 相同的值。

#### PostToolUse 输入

`PostToolUse` hooks 在工具已经成功执行后触发。输入包括 `tool_input`（发送给工具的参数）和 `tool_response`（它返回的结果）。两者的确切模式取决于工具。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_response": {
    "filePath": "/path/to/file.txt",
    "success": true
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

#### PostToolUse 决策控制

`PostToolUse` hooks 可以在工具执行后向 Claude 提供反馈。除了所有 hooks 可用的 JSON 输出字段外，你的 hook 脚本可以返回这些事件特定的字段：

| 字段                  | 描述                                                                                |
| :--------------------- | :----------------------------------------------------------------------------------------- |
| `decision`             | `"block"` 以 `reason` 提示 Claude。省略以允许操作继续            |
| `reason`               | 当 `decision` 为 `"block"` 时向 Claude 显示的解释                                   |
| `additionalContext`    | 供 Claude 考虑的额外上下文                                                  |
| `updatedMCPToolOutput` | 仅用于 MCP 工具：用提供的值替换工具的输出 |

```json
{
  "decision": "block",
  "reason": "Explanation for decision",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Additional information for Claude"
  }
}
```

### PostToolUseFailure

当工具执行失败时运行。此事件在抛出错误或返回失败结果的工具调用时触发。使用它来记录失败、发送警报或向 Claude 提供纠正反馈。

按工具名称匹配，与 PreToolUse 相同的值。

#### PostToolUseFailure 输入

PostToolUseFailure hooks 接收与 PostToolUse 相同的 `tool_name` 和 `tool_input` 字段，以及作为顶级字段的错误信息：

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUseFailure",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run test suite"
  },
  "tool_use_id": "toolu_01ABC123...",
  "error": "Command exited with non-zero status code 1",
  "is_interrupt": false
}
```

| 字段          | 描述                                                                     |
| :------------- | :------------------------------------------------------------------------------ |
| `error`        | 描述出了什么问题的字符串                                               |
| `is_interrupt` | 可选布尔值，指示失败是否由用户中断引起 |

#### PostToolUseFailure 决策控制

`PostToolUseFailure` hooks 可以在工具失败后向 Claude 提供上下文。除了所有 hooks 可用的 JSON 输出字段外，你的 hook 脚本可以返回这些事件特定的字段：

| 字段               | 描述                                                   |
| :------------------ | :------------------------------------------------------------ |
| `additionalContext` | 供 Claude 与错误一起考虑的额外上下文 |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUseFailure",
    "additionalContext": "Additional information about the failure for Claude"
  }
}
```

### PermissionDenied

当自动模式分类器拒绝工具调用时运行。此 hook 仅在自动模式下触发：当你手动拒绝权限对话框、当 `PreToolUse` hook 阻止调用或当 `deny` 规则匹配时，它不会运行。使用它来记录分类器拒绝、调整配置或告知模型可以重试工具调用。

按工具名称匹配，与 PreToolUse 相同的值。

#### PermissionDenied 输入

除通用输入字段外，PermissionDenied hooks 接收 `tool_name`、`tool_input`、`tool_use_id` 和 `reason`。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "auto",
  "hook_event_name": "PermissionDenied",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/build",
    "description": "Clean build directory"
  },
  "tool_use_id": "toolu_01ABC123...",
  "reason": "Auto mode denied: command targets a path outside the project"
}
```

| 字段    | 描述                                                   |
| :------- | :------------------------------------------------------------ |
| `reason` | 分类器对工具调用为何被拒绝的解释 |

#### PermissionDenied 决策控制

PermissionDenied hooks 可以告知模型可以重试被拒绝的工具调用。返回一个 `hookSpecificOutput.retry` 设置为 `true` 的 JSON 对象：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionDenied",
    "retry": true
  }
}
```

当 `retry` 为 `true` 时，CSC 向对话添加一条消息，告知模型可以重试工具调用。拒绝本身不会被撤回。如果你的 hook 不返回 JSON，或返回 `retry: false`，拒绝仍然有效，模型收到原始拒绝消息。

### Notification

当 CSC 发送通知时运行。按通知类型匹配：`permission_prompt`、`idle_prompt`、auth_success`、`elicitation_dialog`。省略匹配器以为所有通知类型运行 hooks。

使用单独的匹配器根据通知类型运行不同的处理程序。此配置在 Claude 需要权限批准时触发特定于权限的警报脚本，在 Claude 空闲时触发不同的通知：

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/permission-alert.sh"
          }
        ]
      },
      {
        "matcher": "idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/idle-notification.sh"
          }
        ]
      }
    ]
  }
}
```

#### Notification 输入

除通用输入字段外，Notification hooks 接收带有通知文本的 `message`、可选的 `title` 以及指示触发了哪种类型的 `notification_type`。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission to use Bash",
  "title": "Permission needed",
  "notification_type": "permission_prompt"
}
```

Notification hooks 无法阻止或修改通知。除了所有 hooks 可用的 JSON 输出字段外，你可以返回 `additionalContext` 以向对话添加上下文：

| 字段               | 描述                      |
| :------------------ | :------------------------------- |
| `additionalContext` | 添加到 Claude 上下文的字符串 |

### SubagentStart

当通过 Agent 工具生成 CSC 子代理时运行。支持匹配器按代理类型名称过滤（内置代理如 `Bash`、`Explore`、`Plan`，或来自 `.claude/agents/` 的自定义代理名称）。

#### SubagentStart 输入

除通用输入字段外，SubagentStart hooks 接收带有子代理唯一标识符的 `agent_id` 和带有代理名称的 `agent_type`（内置代理如 `"Bash"`、`"Explore"`、`"Plan"`，或自定义代理名称）。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SubagentStart",
  "agent_id": "agent-abc123",
  "agent_type": "Explore"
}
```

SubagentStart hooks 无法阻止子代理创建，但它们可以向子代理注入上下文。除了所有 hooks 可用的 JSON 输出字段外，你可以返回：

| 字段               | 描述                            |
| :------------------ | :------------------------------------- |
| `additionalContext` | 添加到子代理上下文的字符串 |

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SubagentStart",
    "additionalContext": "Follow security guidelines for this task"
  }
}
```

### SubagentStop

当 CSC 子代理完成响应时运行。按代理类型匹配，与 SubagentStart 相同的值。

#### SubagentStop 输入

除通用输入字段外，SubagentStop hooks 接收 `stop_hook_active`、`agent_id`、`agent_type`、`agent_transcript_path` 和 `last_assistant_message`。`agent_type` 字段是用于匹配器过滤的值。`transcript_path` 是主会话的记录，而 `agent_transcript_path` 是存储在嵌套 `subagents/` 文件夹中的子代理自己的记录。`last_assistant_message` 字段包含子代理最终响应的文本内容，因此 hooks 可以访问它而无需解析记录文件。

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStop",
  "stop_hook_active": false,
  "agent_id": "def456",
  "agent_type": "Explore",
  "agent_transcript_path": "~/.claude/projects/.../abc123/subagents/agent-def456.jsonl",
  "last_assistant_message": "Analysis complete. Found 3 potential issues..."
}
```

SubagentStop hooks 使用与 Stop hooks 相同的决策控制格式。

### TaskCreated

当通过 `TaskCreate` 工具创建任务时运行。使用此来强制执行命名约定、要求任务描述或阻止创建某些任务。

当 `TaskCreated` hook 以退出码 2 退出时，任务不会被创建，stderr 消息作为反馈反馈给模型。要完全停止队友而不是重新运行它，请返回带有 `{"continue": false, "stopReason": "..."}` 的 JSON。TaskCreated hooks 不支持匹配器，每次发生时都会触发。

#### TaskCreated 输入

除通用输入字段外，TaskCreated hooks 接收 `task_id`、`task_subject` 和可选的 `task_description`、`teammate_name` 和 `team_name`。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TaskCreated",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

| 字段              | 描述                                           |
| :----------------- | :---------------------------------------------------- |
| `task_id`          | 正在创建的任务的标识符                  |
| `task_subject`     | 任务的标题                                     |
| `task_description` | 任务的详细描述。可能不存在       |
| `teammate_name`    | 创建任务的队友名称。可能不存在 |
| `team_name`        | 团队名称。可能不存在                       |

#### TaskCreated 决策控制

TaskCreated hooks 支持两种控制任务创建的方式：

* **退出码 2**：任务不会被创建，stderr 消息作为反馈反馈给模型。
* **JSON `{"continue": false, "stopReason": "..."}`**：完全停止队友，匹配 `Stop` hook 行为。`stopReason` 向用户显示。

此示例阻止主题不符合所需格式的任务：

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if [[ ! "$TASK_SUBJECT" =~ ^\[TICKET-[0-9]+\] ]]; then
  echo "Task subject must start with a ticket number, e.g. '[TICKET-123] Add feature'" >&2
  exit 2
fi

exit 0
```

### TaskCompleted

当任务被标记为完成时运行。这在两种情况下触发：当任何代理通过 TaskUpdate 工具明确将任务标记为完成时，或当代理团队队友在仍有进行中任务时完成其轮次时。使用此来在任务关闭之前强制执行完成标准，如通过测试或 lint 检查。

当 `TaskCompleted` hook 以退出码 2 退出时，任务不会被标记为完成，stderr 消息作为反馈反馈给模型。要完全停止队友而不是重新运行它，请返回带有 `{"continue": false, "stopReason": "..."}` 的 JSON。TaskCompleted hooks 不支持匹配器，每次发生时都会触发。

#### TaskCompleted 输入

除通用输入字段外，TaskCompleted hooks 接收 `task_id`、`task_subject` 和可选的 `task_description`、`teammate_name` 和 `team_name`。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TaskCompleted",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

| 字段              | 描述                                             |
| :----------------- | :------------------------------------------------------ |
| `task_id`          | 正在完成的任务的标识符                  |
| `task_subject`     | 任务的标题                                       |
| `task_description` | 任务的详细描述。可能不存在         |
| `teammate_name`    | 完成任务的队友名称。可能不存在 |
| `team_name`        | 团队名称。可能不存在                         |

#### TaskCompleted 决策控制

TaskCompleted hooks 支持两种控制任务完成的方式：

* **退出码 2**：任务不会被标记为完成，stderr 消息作为反馈反馈给模型。
* **JSON `{"continue": false, "stopReason": "..."}`**：完全停止队友，匹配 `Stop` hook 行为。`stopReason` 向用户显示。

此示例运行测试并在测试失败时阻止任务完成：

```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

# Run the test suite
if ! npm test 2>&1; then
  echo "Tests not passing. Fix failing tests before completing: $TASK_SUBJECT" >&2
  exit 2
fi

exit 0
```

### Stop

当主 CSC 代理完成响应时运行。如果停止是由于用户中断引起的，则不运行。API 错误会触发 StopFailure。

#### Stop 输入

除通用输入字段外，Stop hooks 接收 `stop_hook_active` 和 `last_assistant_message`。当 CSC 已经作为 stop hook 的结果继续时，`stop_hook_active` 字段为 `true`。检查此值或处理记录以防止 CSC 无限期运行。`last_assistant_message` 字段包含 Claude 最终响应的文本内容，因此 hooks 可以访问它而无需解析记录文件。

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true,
  "last_assistant_message": "I've completed the refactoring. Here's a summary..."
}
```

#### Stop 决策控制

`Stop` 和 `SubagentStop` hooks 可以控制 Claude 是否继续。除了所有 hooks 可用的 JSON 输出字段外，你的 hook 脚本可以返回这些事件特定的字段：

| 字段      | 描述                                                                |
| :--------- | :------------------------------------------------------------------------- |
| `decision` | `"block"` 阻止 Claude 停止。省略以允许 Claude 停止      |
| `reason`   | 当 `decision` 为 `"block"` 时必需。告诉 Claude 为什么应该继续 |

```json
{
  "decision": "block",
  "reason": "Must be provided when Claude is blocked from stopping"
}
```

### StopFailure

当轮次因 API 错误结束时代替 Stop 运行。输出和退出码被忽略。使用此来在 Claude 由于速率限制、身份验证问题或其他 API 错误无法完成响应时记录失败、发送警报或采取恢复操作。

#### StopFailure 输入

除通用输入字段外，StopFailure hooks 接收 `error`、可选的 `error_details` 和可选的 `last_assistant_message`。`error` 字段标识错误类型，用于匹配器过滤。

| 字段                    | 描述                                                                                                                                                                                                                                      |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error`                  | 错误类型：`rate_limit`、`authentication_failed`、`billing_error`、`invalid_request`、`server_error`、`max_output_tokens` 或 `unknown`                                                                                                         |
| `error_details`          | 关于错误的额外详细信息（如果可用）                                                                                                                                                                                               |
| `last_assistant_message` | 对话中显示的渲染错误文本。与 `Stop` 和 `SubagentStop` 中此字段保存 Claude 的对话输出不同，对于 `StopFailure`，它包含 API 错误字符串本身，如 `"API Error: Rate limit reached"` |

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "StopFailure",
  "error": "rate_limit",
  "error_details": "429 Too Many Requests",
  "last_assistant_message": "API Error: Rate limit reached"
}
```

StopFailure hooks 没有决策控制。它们仅用于通知和日志记录目的。

### TeammateIdle

当代理团队的队友完成其轮次后即将进入空闲状态时运行。使用此在队友停止工作之前强制执行质量门，如要求通过 lint 检查或验证输出文件是否存在。

当 `TeammateIdle` hook 以退出码 2 退出时，队友接收 stderr 消息作为反馈并继续工作而不是进入空闲状态。要完全停止队友而不是重新运行它，请返回带有 `{"continue": false, "stopReason": "..."}` 的 JSON。TeammateIdle hooks 不支持匹配器，每次发生时都会触发。

#### TeammateIdle 输入

除通用输入字段外，TeammateIdle hooks 接收 `teammate_name` 和 `team_name`。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "TeammateIdle",
  "teammate_name": "researcher",
  "team_name": "my-project"
}
```

| 字段           | 描述                                   |
| :-------------- | :-------------------------------------------- |
| `teammate_name` | 即将进入空闲状态的队友名称 |
| `team_name`     | 团队名称                              |

#### TeammateIdle 决策控制

TeammateIdle hooks 支持两种控制队友行为的方式：

* **退出码 2**：队友接收 stderr 消息作为反馈并继续工作而不是进入空闲状态。
* **JSON `{"continue": false, "stopReason": "..."}`**：完全停止队友，匹配 `Stop` hook 行为。`stopReason` 向用户显示。

此示例在允许队友进入空闲状态之前检查构建产物是否存在：

```bash
#!/bin/bash

if [ ! -f "./dist/output.js" ]; then
  echo "Build artifact missing. Run the build before stopping." >&2
  exit 2
fi

exit 0
```

### ConfigChange

当配置文件在会话期间更改时运行。使用此来审计设置更改、强制执行安全策略或阻止对配置文件的未授权修改。

ConfigChange hooks 在设置文件、托管策略设置和技能文件更改时触发。输入中的 `source` 字段告诉你哪种类型的配置发生了更改，可选的 `file_path` 字段提供更改文件的路径。

匹配器按配置来源过滤：

| 匹配器            | 触发时机                             |
| :----------------- | :---------------------------------------- |
| `user_settings`    | `~/.claude/settings.json` 更改         |
| `project_settings` | `.claude/settings.json` 更改           |
| `local_settings`   | `.claude/settings.local.json` 更改     |
| `policy_settings`  | 托管策略设置更改            |
| `skills`           | `.claude/skills/` 中的技能文件更改 |

此示例记录所有配置更改以进行安全审计：

```json
{
  "hooks": {
    "ConfigChange": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/audit-config-change.sh"
          }
        ]
      }
    ]
  }
}
```

#### ConfigChange 输入

除通用输入字段外，ConfigChange hooks 接收 `source` 和可选的 `file_path`。`source` 字段指示哪种配置类型发生了更改，`file_path` 提供被修改的特定文件的路径。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "ConfigChange",
  "source": "project_settings",
  "file_path": "/Users/.../my-project/.claude/settings.json"
}
```

#### ConfigChange 决策控制

ConfigChange hooks 可以阻止配置更改生效。使用退出码 2 或 JSON `decision` 来阻止更改。被阻止时，新设置不会应用到正在运行的会话。

| 字段      | 描述                                                                              |
| :--------- | :--------------------------------------------------------------------------------------- |
| `decision` | `"block"` 阻止配置更改被应用。省略以允许更改 |
| `reason`   | 当 `decision` 为 `"block"` 时向用户显示的解释                               |

```json
{
  "decision": "block",
  "reason": "Configuration changes to project settings require admin approval"
}
```

`policy_settings` 更改无法被阻止。Hooks 仍然会为 `policy_settings` 来源触发，因此你可以使用它们进行审计日志记录，但任何阻止决策都会被忽略。这确保了企业管理的设置始终生效。

### CwdChanged

当工作目录在会话期间更改时运行，例如当 Claude 执行 `cd` 命令时。使用此来响应目录更改：重新加载环境变量、激活项目特定的工具链或自动运行设置脚本。与 FileChanged 配合使用，用于管理每个目录环境的 direnv 等工具。

CwdChanged hooks 可以访问 `CLAUDE_ENV_FILE`。写入该文件的变量持久化到会话的后续 Bash 命令中，就像 SessionStart hooks 中一样。仅支持 `type: "command"` hooks。

CwdChanged 不支持匹配器，每次目录更改时都会触发。

#### CwdChanged 输入

除通用输入字段外，CwdChanged hooks 接收 `old_cwd` 和 `new_cwd`。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project/src",
  "hook_event_name": "CwdChanged",
  "old_cwd": "/Users/my-project",
  "new_cwd": "/Users/my-project/src"
}
```

#### CwdChanged 输出

除了所有 hooks 可用的 JSON 输出字段外，CwdChanged hooks 可以返回 `watchPaths` 来动态设置 FileChanged 监视哪些文件路径：

| 字段        | 描述                                                                                                                                                                                                                     |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `watchPaths` | 绝对路径数组。替换当前的动态监视列表（来自你的 `matcher` 配置的路径总是被监视）。返回空数组会清除动态列表，这在进入新目录时是典型的 |

CwdChanged hooks 没有决策控制。它们无法阻止目录更改。

### FileChanged

当监视的文件在磁盘上更改时运行。适用于在项目配置文件被修改时重新加载环境变量。

此事件的 `matcher` 有两个作用：

* **构建监视列表**：值按 `|` 分割，每个段在工作目录中注册为字面文件名，因此 `".envrc|.env"` 精确监视这两个文件。正则表达式模式在这里没有用：像 `^\.env` 这样的值会监视一个名为 `^\.env` 的文件。
* **过滤哪些 hooks 运行**：当监视的文件更改时，相同的值使用标准匹配器规则针对更改文件的基本名称过滤哪些 hook 组运行。

FileChanged hooks 可以访问 `CLAUDE_ENV_FILE`。写入该文件的变量持久化到会话的后续 Bash 命令中，就像 SessionStart hooks 中一样。仅支持 `type: "command"` hooks。

#### FileChanged 输入

除通用输入字段外，FileChanged hooks 接收 `file_path` 和 `event`。

| 字段       | 描述                                                                                     |
| :---------- | :---------------------------------------------------------------------------------------------- |
| `file_path` | 更改的文件的绝对路径                                                          |
| `event`     | 发生了什么：`"change"`（文件被修改）、`"add"`（文件被创建）或 `"unlink"`（文件被删除） |

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/Users/my-project",
  "hook_event_name": "FileChanged",
  "file_path": "/Users/my-project/.envrc",
  "event": "change"
}
```

#### FileChanged 输出

除了所有 hooks 可用的 JSON 输出字段外，FileChanged hooks 可以返回 `watchPaths` 来动态更新监视哪些文件路径：

| 字段        | 描述                                                                                                                                                                                                                 |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `watchPaths` | 绝对路径数组。替换当前的动态监视列表（来自你的 `matcher` 配置的路径总是被监视）。当你的 hook 脚本基于更改的文件发现要监视的额外文件时使用此功能 |

FileChanged hooks 没有决策控制。它们无法阻止文件更改的发生。

### WorktreeCreate

当你运行 `csc --worktree` 或子代理使用 `isolation: "worktree"` 时，CSC 使用 `git worktree` 创建一个隔离的工作副本。如果你配置了 WorktreeCreate hook，它会替换默认的 git 行为，让你可以使用不同的版本控制系统，如 SVN、Perforce 或 Mercurial。

由于 hook 完全替换了默认行为，`.worktreeinclude` 不会被处理。如果你需要将 `.env` 等本地配置文件复制到新的工作树中，请在 hook 脚本内部完成。

hook 必须返回创建的工作树目录的绝对路径。CSC 使用此路径作为隔离会话的工作目录。命令 hooks 在 stdout 上打印它；HTTP hooks 通过 `hookSpecificOutput.worktreePath` 返回它。

此示例创建一个 SVN 工作副本并打印路径供 CSC 使用。将仓库 URL 替换为你自己的：

```json
{
  "hooks": {
    "WorktreeCreate": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'NAME=$(jq -r .name); DIR=\"$HOME/.claude/worktrees/$NAME\"; svn checkout https://svn.example.com/repo/trunk \"$DIR\" >&2 && echo \"$DIR\"'"
          }
        ]
      }
    ]
  }
}
```

hook 从 stdin 上的 JSON 输入中读取工作树 `name`，将新副本检出到新目录中，并打印目录路径。最后一行的 `echo` 是 CSC 读取为工作树路径的内容。将任何其他输出重定向到 stderr，以免干扰路径。

#### WorktreeCreate 输入

除通用输入字段外，WorktreeCreate hooks 接收 `name` 字段。这是新工作树的 slug 标识符，由用户指定或自动生成（例如，`bold-oak-a3f2`）。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "WorktreeCreate",
  "name": "feature-auth"
}
```

#### WorktreeCreate 输出

WorktreeCreate hooks 不使用标准的允许/阻止决策模型。相反，hook 的成功或失败决定了结果。hook 必须返回创建的工作树目录的绝对路径：

* **命令 hooks**（`type: "command"`）：在 stdout 上打印路径。
* **HTTP hooks**（`type: "http"`）：在响应体中返回 `{ "hookSpecificOutput": { "hookEventName": "WorktreeCreate", "worktreePath": "/absolute/path" } }`。

如果 hook 失败或未产生路径，工作树创建将失败并显示错误。

### WorktreeRemove

WorktreeCreate 的清理对应项。此 hook 在工作树被移除时触发，要么在你退出 `--worktree` 会话并选择移除它时，要么在具有 `isolation: "worktree"` 的子代理完成时。对于基于 git 的工作树，Claude 使用 `git worktree remove` 自动处理清理。如果你为非 git 版本控制系统配置了 WorktreeCreate hook，请配对一个 WorktreeRemove hook 来处理清理。没有的话，工作树目录将留在磁盘上。

CSC 将 WorktreeCreate 返回的路径作为 hook 输入中的 `worktree_path` 传递。此示例读取该路径并移除目录：

```json
{
  "hooks": {
    "WorktreeRemove": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'jq -r .worktree_path | xargs rm -rf'"
          }
        ]
      }
    ]
  }
}
```

#### WorktreeRemove 输入

除通用输入字段外，WorktreeRemove hooks 接收 `worktree_path` 字段，即被移除的工作树的绝对路径。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "WorktreeRemove",
  "worktree_path": "/Users/.../my-project/.claude/worktrees/feature-auth"
}
```

WorktreeRemove hooks 没有决策控制。它们无法阻止工作树移除，但可以执行清理任务，如移除版本控制状态或归档更改。Hook 失败仅在调试模式下记录。

### PreCompact

在 CSC 即将运行压缩操作之前运行。

匹配器值指示压缩是手动触发还是自动触发的：

| 匹配器  | 触发时机                                |
| :------- | :------------------------------------------- |
| `manual` | `/compact`                                   |
| `auto`   | 当上下文窗口已满时自动压缩 |

#### PreCompact 输入

除通用输入字段外，PreCompact hooks 接收 `trigger` 和 `custom_instructions`。对于 `manual`，`custom_instructions` 包含用户传入 `/compact` 的内容。对于 `auto`，`custom_instructions` 为空。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "PreCompact",
  "trigger": "manual",
  "custom_instructions": ""
}
```

### PostCompact

在 CSC 完成压缩操作后运行。使用此事件来响应新的压缩状态，例如记录生成的摘要或更新外部状态。

与 `PreCompact` 相同的匹配器值适用：

| 匹配器  | 触发时机                                      |
| :------- | :------------------------------------------------- |
| `manual` | `/compact` 之后                                   |
| `auto`   | 当上下文窗口已满时自动压缩之后 |

#### PostCompact 输入

除通用输入字段外，PostCompact hooks 接收 `trigger` 和 `compact_summary`。`compact_summary` 字段包含由压缩操作生成的对话摘要。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "PostCompact",
  "trigger": "manual",
  "compact_summary": "Summary of the compacted conversation..."
}
```

PostCompact hooks 没有决策控制。它们无法影响压缩结果，但可以执行后续任务。

### SessionEnd

当 CSC 会话结束时运行。适用于清理任务、记录会话统计信息或保存会话状态。支持匹配器按退出原因过滤。

hook 输入中的 `reason` 字段指示会话为何结束：

| 原因                        | 描述                                |
| :---------------------------- | :----------------------------------------- |
| `clear`                       | 使用 `/clear` 命令清除会话      |
| `resume`                      | 通过交互式 `/resume` 切换会话 |
| `logout`                      | 用户登出                            |
| `prompt_input_exit`           | 提示输入可见时用户退出 |
| `bypass_permissions_disabled` | 绕过权限模式被禁用       |
| `other`                       | 其他退出原因                         |

#### SessionEnd 输入

除通用输入字段外，SessionEnd hooks 接收指示会话为何结束的 `reason` 字段。请参阅上面的原因表以获取所有值。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```

SessionEnd hooks 没有决策控制。它们无法阻止会话终止，但可以执行清理任务。

SessionEnd hooks 的默认超时为 1.5 秒。这适用于会话退出、`/clear` 和通过交互式 `/resume` 切换会话。如果你的 hooks 需要更多时间，请将 `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` 环境变量设置为更高的毫秒值。任何每个 hook 的 `timeout` 设置也受此值限制。

```bash
CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=5000 csc
```

### Elicitation

当 MCP 服务器在任务中途请求用户输入时运行。默认情况下，CSC 显示一个交互式对话框供用户响应。Hooks 可以拦截此请求并以编程方式响应，完全跳过对话框。

匹配器字段针对 MCP 服务器名称匹配。

#### Elicitation 输入

除通用输入字段外，Elicitation hooks 接收 `mcp_server_name`、`message` 和可选的 `mode`、`url`、`elicitation_id` 和 `requested_schema` 字段。

对于表单模式的请求（最常见的情况）：

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Elicitation",
  "mcp_server_name": "my-mcp-server",
  "message": "Please provide your credentials",
  "mode": "form",
  "requested_schema": {
    "type": "object",
    "properties": {
      "username": { "type": "string", "title": "Username" }
    }
  }
}
```

对于 URL 模式的请求（基于浏览器的身份验证）：

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Elicitation",
  "mcp_server_name": "my-mcp-server",
  "message": "Please authenticate",
  "mode": "url",
  "url": "https://auth.example.com/login"
}
```

#### Elicitation 输出

要以编程方式响应而不显示对话框，请返回带有 `hookSpecificOutput` 的 JSON 对象：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "Elicitation",
    "action": "accept",
    "content": {
      "username": "alice"
    }
  }
}
```

| 字段     | 值                        | 描述                                                      |
| :-------- | :---------------------------- | :--------------------------------------------------------------- |
| `action`  | `accept`、`decline`、`cancel` | 是接受、拒绝还是取消请求                |
| `content` | object                        | 要提交的表单字段值。仅在 `action` 为 `accept` 时使用 |

退出码 2 拒绝请求并向用户显示 stderr。

### ElicitationResult

在用户响应 MCP 请求后运行。Hooks 可以在响应发送回 MCP 服务器之前观察、修改或阻止响应。

匹配器字段针对 MCP 服务器名称匹配。

#### ElicitationResult 输入

除通用输入字段外，ElicitationResult hooks 接收 `mcp_server_name`、`action` 和可选的 `mode`、`elicitation_id` 和 `content` 字段。

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "ElicitationResult",
  "mcp_server_name": "my-mcp-server",
  "action": "accept",
  "content": { "username": "alice" },
  "mode": "form",
  "elicitation_id": "elicit-123"
}
```

#### ElicitationResult 输出

要覆盖用户的响应，请返回带有 `hookSpecificOutput` 的 JSON 对象：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "ElicitationResult",
    "action": "decline",
    "content": {}
  }
}
```

| 字段     | 值                        | 描述                                                            |
| :-------- | :---------------------------- | :--------------------------------------------------------------------- |
| `action`  | `accept`、`decline`、`cancel` | 覆盖用户的操作                                            |
| `content` | object                        | 覆盖表单字段值。仅在 `action` 为 `accept` 时有意义 |

退出码 2 阻止响应，将有效操作更改为 `decline`。

## 基于提示的 Hooks

除了命令和 HTTP hooks 外，CSC 还支持基于提示的 hooks（`type: "prompt"`），使用 LLM 评估是否允许或阻止操作，以及代理 hooks（`type: "agent"`），生成带有工具访问权限的代理验证器。并非所有事件都支持每种 hook 类型。

支持所有四种 hook 类型（`command`、`http`、`prompt` 和 `agent`）的事件：

* `PermissionRequest`
* `PostToolUse`
* `PostToolUseFailure`
* `PreToolUse`
* `Stop`
* `SubagentStop`
* `TaskCompleted`
* `TaskCreated`
* `UserPromptSubmit`

支持 `command` 和 `http` hooks 但不支持 `prompt` 或 `agent` 的事件：

* `ConfigChange`
* `CwdChanged`
* `Elicitation`
* `ElicitationResult`
* `FileChanged`
* `InstructionsLoaded`
* `Notification`
* `PermissionDenied`
* `PostCompact`
* `PreCompact`
* `SessionEnd`
* `StopFailure`
* `SubagentStart`
* `TeammateIdle`
* `WorktreeCreate`
* `WorktreeRemove`

`SessionStart` 仅支持 `command` hooks。

### 基于提示的 Hooks 如何工作

与执行 Bash 命令不同，基于提示的 hooks：

1. 将 hook 输入和你的提示发送给 Claude 模型，默认为 Haiku
2. LLM 以包含决策的结构化 JSON 响应
3. CSC 自动处理决策

### 提示 Hook 配置

将 `type` 设置为 `"prompt"` 并提供 `prompt` 字符串而不是 `command`。使用 `$ARGUMENTS` 占位符将 hook 的 JSON 输入数据注入到你的提示文本中。CSC 将组合的提示和输入发送给快速的 Claude 模型，后者返回 JSON 决策。

此 `Stop` hook 要求 LLM 在允许 Claude 完成之前评估所有任务是否完成：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Evaluate if Claude should stop: $ARGUMENTS. Check if all tasks are complete."
          }
        ]
      }
    ]
  }
}
```

| 字段     | 必需 | 描述                                                                                                                                                         |
| :-------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`    | 是      | 必须为 `"prompt"`                                                                                                                                                  |
| `prompt`  | 是      | 发送给 LLM 的提示文本。使用 `$ARGUMENTS` 作为 hook 输入 JSON 的占位符。如果 `$ARGUMENTS` 不存在，输入 JSON 会追加到提示 |
| `model`   | 否       | 用于评估的模型。默认为快速模型                                                                                                               |
| `timeout` | 否       | 超时时间（秒）。默认：30                                                                                                                                     |

### 响应模式

LLM 必须以包含以下内容的 JSON 响应：

```json
{
  "ok": true | false,
  "reason": "Explanation for the decision"
}
```

| 字段    | 描述                                                |
| :------- | :--------------------------------------------------------- |
| `ok`     | `true` 允许操作，`false` 阻止操作              |
| `reason` | 当 `ok` 为 `false` 时必需。向 Claude 显示的解释 |

### 示例：多条件 Stop hook

此 `Stop` hook 使用详细的提示在允许 Claude 停止之前检查三个条件。如果 `"ok"` 为 `false`，Claude 继续工作，以提供的原因为下一步指令。`SubagentStop` hooks 使用相同的格式来评估子代理是否应该停止：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "You are evaluating whether Claude should stop working. Context: $ARGUMENTS\n\nAnalyze the conversation and determine if:\n1. All user-requested tasks are complete\n2. Any errors need to be addressed\n3. Follow-up work is needed\n\nRespond with JSON: {\"ok\": true} to allow stopping, or {\"ok\": false, \"reason\": \"your explanation\"} to continue working.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## 基于代理的 Hooks

基于代理的 hooks（`type: "agent"`）类似于基于提示的 hooks，但具有多轮工具访问权限。与单次 LLM 调用不同，代理 hook 生成一个子代理，可以读取文件、搜索代码和检查代码库来验证条件。代理 hooks 支持与基于提示的 hooks 相同的事件。

### 代理 Hooks 如何工作

当代理 hook 触发时：

1. CSC 生成一个带有你的提示和 hook 的 JSON 输入的子代理
2. 子代理可以使用 Read、Grep 和 Glob 等工具进行调查
3. 最多 50 轮后，子代理返回结构化的 `{ "ok": true/false }` 决策
4. CSC 以与提示 hook 相同的方式处理决策

当验证需要检查实际文件或测试输出，而不仅仅是评估 hook 输入数据时，代理 hooks 很有用。

### 代理 Hook 配置

将 `type` 设置为 `"agent"` 并提供 `prompt` 字符串。配置字段与提示 hooks 相同，但默认超时更长：

| 字段     | 必需 | 描述                                                                                 |
| :-------- | :------- | :------------------------------------------------------------------------------------------ |
| `type`    | 是      | 必须为 `"agent"`                                                                           |
| `prompt`  | 是      | 描述要验证什么的提示。使用 `$ARGUMENTS` 作为 hook 输入 JSON 的占位符 |
| `model`   | 否       | 用于评估的模型。默认为快速模型                                                      |
| `timeout` | 否       | 超时时间（秒）。默认：60                                                             |

响应模式与提示 hooks 相同：`{ "ok": true }` 允许或 `{ "ok": false, "reason": "..." }` 阻止。

此 `Stop` hook 在允许 Claude 完成之前验证所有单元测试是否通过：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

## 在后台运行 Hooks

默认情况下，hooks 会阻塞 Claude 的执行直到完成。对于长时间运行的任务，如部署、测试套件或外部 API 调用，设置 `"async": true` 以在 Claude 继续工作的同时在后台运行 hook。异步 hooks 无法阻止或控制 Claude 的行为：响应字段如 `decision`、`permissionDecision` 和 `continue` 没有效果，因为它们本应控制的操作已经完成。

### 配置异步 Hook

在命令 hook 的配置中添加 `"async": true` 以在后台运行而不阻塞 Claude。此字段仅在 `type: "command"` hooks 上可用。

此 hook 在每次 `Write` 工具调用后运行测试脚本。Claude 立即继续工作，而 `run-tests.sh` 执行最多 120 秒。当脚本完成时，其输出在下一个对话轮次中传递：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/run-tests.sh",
            "async": true,
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

`timeout` 字段设置后台进程的最大时间（秒）。如果未指定，异步 hooks 使用与同步 hooks 相同的 10 分钟默认值。

### 异步 Hooks 如何执行

当异步 hook 触发时，CSC 启动 hook 进程并立即继续，不等待其完成。hook 通过 stdin 接收与同步 hook 相同的 JSON 输入。

后台进程退出后，如果 hook 生成了带有 `systemMessage` 或 `additionalContext` 字段的 JSON 响应，该内容将在下一个对话轮次中作为上下文传递给 Claude。

异步 hook 完成通知默认被抑制。要查看它们，请使用 `Ctrl+O` 启用详细模式或使用 `--verbose` 启动 CSC。

### 示例：文件更改后运行测试

此 hook 在 Claude 写入文件时在后台启动测试套件，然后在测试完成时将结果报告给 Claude。将此脚本保存到项目中的 `.claude/hooks/run-tests-async.sh` 并使用 `chmod +x` 使其可执行：

```bash
#!/bin/bash
# run-tests-async.sh

# Read hook input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run tests for source files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.js ]]; then
  exit 0
fi

# Run tests and report results via systemMessage
RESULT=$(npm test 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "{\"systemMessage\": \"Tests passed after editing $FILE_PATH\"}"
else
  echo "{\"systemMessage\": \"Tests failed after editing $FILE_PATH: $RESULT\"}"
fi
```

然后将此配置添加到项目根目录的 `.claude/settings.json` 中。`async: true` 标志让 Claude 在测试运行时继续工作：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/run-tests-async.sh",
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

### 限制

异步 hooks 与同步 hooks 相比有几个约束：

* 只有 `type: "command"` hooks 支持 `async`。基于提示的 hooks 无法异步运行。
* 异步 hooks 无法阻止工具调用或返回决策。当 hook 完成时，触发操作已经继续。
* Hook 输出在下一个对话轮次中传递。如果会话空闲，响应会等到下一次用户交互。
* 每次执行都会创建一个单独的后台进程。同一个异步 hook 的多次触发之间没有去重。

## 安全注意事项

### 免责声明

命令 hooks 以你的系统用户的完整权限运行。

> **⚠️ 警告：**
> 命令 hooks 以你的完整用户权限执行 shell 命令。它们可以修改、删除或访问你的用户帐户可以访问的任何文件。在将 hook 命令添加到配置之前，请审查并测试所有 hook 命令。

### 安全最佳实践

在编写 hooks 时请记住这些做法：

* **验证和清理输入**：永远不要盲目信任输入数据
* **始终引用 shell 变量**：使用 `"$VAR"` 而不是 `$VAR`
* **阻止路径遍历**：检查文件路径中的 `..`
* **使用绝对路径**：为脚本指定完整路径，使用 `"$CLAUDE_PROJECT_DIR"` 作为项目根目录
* **跳过敏感文件**：避免 `.env`、`.git/`、密钥等

## Windows PowerShell 工具

在 Windows 上，你可以通过在命令 hook 上设置 `"shell": "powershell"` 来在 PowerShell 中运行单个 hooks。Hooks 直接启动 PowerShell，因此无论是否设置了 `CLAUDE_CODE_USE_POWERSHELL_TOOL`，这都可以工作。CSC 自动检测 `pwsh.exe`（PowerShell 7+），回退到 `powershell.exe`（5.1）。

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "shell": "powershell",
            "command": "Write-Host 'File written'"
          }
        ]
      }
    ]
  }
}
```

## 调试 Hooks

Hook 执行详细信息，包括哪些 hooks 匹配、它们的退出码以及完整的 stdout 和 stderr，都写入调试日志文件。使用 `csc --debug-file <path>` 启动 CSC 以将日志写入已知位置，或运行 `csc --debug` 并在 `~/.claude/debug/<session-id>.txt` 处读取日志。`--debug` 标志不会打印到终端。

```text
[DEBUG] Executing hooks for PostToolUse:Write
[DEBUG] Found 1 hook commands to execute
[DEBUG] Executing hook command: <Your command> with timeout 600000ms
[DEBUG] Hook command completed with status 0: <Your stdout>
```

要获取更细粒度的 hook 匹配详细信息，请设置 `CLAUDE_CODE_DEBUG_LOG_LEVEL=verbose` 以查看额外的日志行，如 hook 匹配器计数和查询匹配。

有关常见问题的故障排除，如 hooks 未触发、无限 Stop hook 循环或配置错误，请参阅指南中的限制和故障排除。
