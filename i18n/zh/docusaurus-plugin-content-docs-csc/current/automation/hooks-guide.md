---
sidebar_position: 1
---

# 使用Hooks自动化工作流

> 当 CSC 编辑文件、完成任务或需要输入时，自动运行 shell 命令。格式化代码、发送通知、验证命令并强制执行项目规则。

Hooks是用户定义的 shell 命令，在 CSC 生命周期的特定点执行。它们提供了对 CSC 行为的确定性控制，确保某些操作始终发生，而不是依赖 LLM 选择运行它们。使用Hooks来强制执行项目规则、自动化重复任务，并将 CSC 与你现有的工具集成。

对于需要判断力而非确定性规则的决策，你还可以使用基于提示的Hooks或基于代理的Hooks，它们使用 Claude 模型来评估条件。

有关扩展 CSC 的其他方式，请参阅Skills（为 CSC 提供额外指令和可执行命令）、Subagents（在隔离上下文中运行任务）和Plugins（打包扩展以跨项目共享）。

> **💡 提示：** 本指南涵盖了常见用例和入门方法。有关完整的事件模式、JSON 输入/输出格式以及异步Hooks和 MCP 工具Hooks等高级功能，请参阅Hooks参考。

## 设置你的第一个Hooks

要创建Hooks，请将 `hooks` 块添加到设置文件中。本演练创建一个桌面通知Hooks，这样当 CSC 等待你的输入时，你会收到提醒，而不必一直盯着终端。

### 步骤 1：将Hooks添加到设置中

打开 `~/.claude/settings.json` 并添加一个 `Notification` Hooks。以下示例使用 `osascript`（适用于 macOS）；有关 Linux 和 Windows 命令，请参阅当 Claude 需要输入时获取通知。

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"CSC needs your attention\" with title \"CSC\"'"
          }
        ]
      }
    ]
  }
}
```

如果你的设置文件已经有 `hooks` 键，请将 `Notification` 添加为现有事件键的同级，而不是替换整个对象。每个事件名称都是单个 `hooks` 对象内的一个键：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "osascript -e 'display notification \"CSC needs your attention\" with title \"CSC\"'" }]
      }
    ]
  }
}
```

你也可以通过在 CLI 中描述你想要的内容来让 Claude 为你编写Hooks。

### 步骤 2：验证配置

输入 `/hooks` 打开Hooks浏览器。你将看到所有可用Hooks事件的列表，每个已配置Hooks的事件旁边会有计数。选择 `Notification` 以确认你的新Hooks出现在列表中。选择Hooks会显示其详细信息：事件、匹配器、类型、源文件和命令。

### 步骤 3：测试Hooks

按 `Esc` 返回 CLI。让 Claude 做一些需要权限的事情，然后切换到其他窗口。你应该会收到桌面通知。

> **💡 提示：** `/hooks` 菜单是只读的。要添加、修改或删除Hooks，请直接编辑设置 JSON 或让 Claude 进行更改。

## 你可以自动化的内容

Hooks允许你在 CSC 生命周期的关键点运行代码：编辑后格式化文件、在命令执行前阻止命令、当 CSC 需要输入时发送通知、在会话开始时注入上下文等等。有关Hooks事件的完整列表，请参阅Hooks参考。

每个示例都包含一个可直接使用的配置块，你可以将其添加到设置文件中。最常见的模式：

* 当 CSC 需要输入时获取通知
* 编辑后自动格式化代码
* 阻止对受保护文件的编辑
* 压缩后重新注入上下文
* 审计配置变更
* 当目录或文件变更时重新加载环境
* 自动批准特定权限提示

### 当 CSC 需要输入时获取通知

每当 CSC 完成工作并需要你的输入时获取桌面通知，这样你就可以切换到其他任务而无需检查终端。

此Hooks使用 `Notification` 事件，当 CSC 等待输入或权限时触发。以下各节使用平台的原生通知命令。将此添加到 `~/.claude/settings.json`：

#### macOS

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"CSC needs your attention\" with title \"CSC\"'"
          }
        ]
      }
    ]
  }
}
```

##### 如果没有通知出现

`osascript` 通过内置的脚本编辑器应用路由通知。如果脚本编辑器没有通知权限，命令会静默失败，macOS 不会提示你授予权限。在终端中运行一次以下命令，使脚本编辑器出现在你的通知设置中：

```bash
osascript -e 'display notification "test"'
```

暂时不会出现任何内容。打开**系统设置 > 通知**，在列表中找到**脚本编辑器**，然后打开**允许通知**。再次运行命令以确认测试通知出现。

#### Linux

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'CSC' 'CSC needs your attention'"
          }
        ]
      }
    ]
  }
}
```

#### Windows (PowerShell)

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('CSC needs your attention', 'CSC')\""
          }
        ]
      }
    ]
  }
}
```

### 编辑后自动格式化代码

在 CSC 编辑的每个文件上自动运行 Prettier，这样无需手动干预即可保持格式一致。

此Hooks使用 `PostToolUse` 事件和 `Edit|Write` 匹配器，因此它只在文件编辑工具之后运行。命令使用 `jq` 提取编辑的文件路径并将其传递给 Prettier。将此添加到项目根目录的 `.claude/settings.json` 中：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

> **注意：** 本页的 Bash 示例使用 `jq` 进行 JSON 解析。使用 `brew install jq`（macOS）、`apt-get install jq`（Debian/Ubuntu）安装，或查看 `jq` 下载页面。

### 阻止对受保护文件的编辑

防止 CSC 修改 `.env`、`package-lock.json` 或 `.git/` 中的任何内容等敏感文件。CSC 会收到解释编辑为何被阻止的反馈，因此它可以调整其方法。

此示例使用一个单独的脚本文件，Hooks调用该脚本。脚本根据受保护模式列表检查目标文件路径，并以代码 2 退出以阻止编辑。

#### 步骤 1：创建Hooks脚本

将此保存到 `.claude/hooks/protect-files.sh`：

```bash
#!/bin/bash
# protect-files.sh

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

#### 步骤 2：使脚本可执行（macOS/Linux）

Hooks脚本必须是可执行的，CSC 才能运行它们：

```bash
chmod +x .claude/hooks/protect-files.sh
```

#### 步骤 3：注册Hooks

在 `.claude/settings.json` 中添加一个 `PreToolUse` Hooks，在任何 `Edit` 或 `Write` 工具调用之前运行脚本：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

### 压缩后重新注入上下文

当 CSC 的上下文窗口填满时，压缩会总结对话以释放空间。这可能会丢失重要细节。使用带有 `compact` 匹配器的 `SessionStart` Hooks，在每次压缩后重新注入关键上下文。

你的命令写入 stdout 的任何文本都会添加到 CSC 的上下文中。此示例提醒 CSC 项目约定和最近的工作。将此添加到项目根目录的 `.claude/settings.json` 中：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

你可以将 `echo` 替换为任何产生动态输出的命令，例如 `git log --oneline -5` 来显示最近的提交。对于在每次会话开始时注入上下文，考虑使用 CLAUDE.md。对于环境变量，请参阅参考中的 `CLAUDE_ENV_FILE`。

### 审计配置变更

跟踪会话期间设置或Skills文件何时更改。当外部进程或编辑器修改配置文件时，`ConfigChange` 事件会触发，因此你可以记录变更以进行合规性检查或阻止未经授权的修改。

此示例将每次变更追加到审计日志中。将此添加到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "ConfigChange": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "jq -c '{timestamp: now | todate, source: .source, file: .file_path}' >> ~/claude-config-audit.log"
          }
        ]
      }
    ]
  }
}
```

匹配器按配置类型筛选：`user_settings`、`project_settings`、`local_settings`、`policy_settings` 或 `skills`。要阻止变更生效，以代码 2 退出或返回 `{"decision": "block"}`。有关完整的输入模式，请参阅 ConfigChange 参考。

### 当目录或文件变更时重新加载环境

某些项目根据你所在的目录设置不同的环境变量。像 direnv 这样的工具会在你的 shell 中自动执行此操作，但 CSC 的 Bash 工具不会自行获取这些更改。

`CwdChanged` Hooks解决了这个问题：它每次 CSC 更改目录时运行，因此你可以为新位置重新加载正确的变量。Hooks将更新的值写入 `CLAUDE_ENV_FILE`，CSC 在每个 Bash 命令之前应用它。将此添加到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "CwdChanged": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash >> \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

要对特定文件而非每次目录变更做出反应，请使用 `FileChanged` 并带有一个 `matcher`，列出要用 `|` 分隔的要监视的文件名。要构建监视列表，此值被拆分为字面文件名，而不是作为正则表达式求值。有关当文件更改时同一值如何筛选运行哪些Hooks组，请参阅 FileChanged。此示例监视工作目录中的 `.envrc` 和 `.env`：

```json
{
  "hooks": {
    "FileChanged": [
      {
        "matcher": ".envrc|.env",
        "hooks": [
          {
            "type": "command",
            "command": "direnv export bash >> \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

有关输入模式、`watchPaths` 输出和 `CLAUDE_ENV_FILE` 详细信息，请参阅 CwdChanged 和 FileChanged 参考条目。

### 自动批准特定权限提示

跳过你始终允许的工具调用的批准对话框。此示例自动批准 `ExitPlanMode`，即 Claude 在完成计划展示并请求继续时调用的工具，这样你不必在每次计划准备好时都被提示。

与上面的退出代码示例不同，自动批准要求你的Hooks将 JSON 决策写入 stdout。当 CSC 即将显示权限对话框时，`PermissionRequest` Hooks触发，返回 `"behavior": "allow"` 代表你回答提示。

匹配器将Hooks范围限定为仅 `ExitPlanMode`，因此不会影响其他提示。将此添加到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PermissionRequest\", \"decision\": {\"behavior\": \"allow\"}}}'"
          }
        ]
      }
    ]
  }
}
```

当Hooks批准时，CSC 退出计划模式并恢复进入计划模式之前活动的任何权限模式。转录记录显示"Allowed by PermissionRequest hook"，替代了原来对话框出现的位置。Hooks路径始终保留当前对话：它无法像对话框那样清除上下文并开始全新的实现会话。

要改为设置特定的权限模式，你的Hooks输出可以包含一个带有 `setMode` 条目的 `updatedPermissions` 数组。`mode` 值是任何权限模式，如 `default`、`acceptEdits` 或 `bypassPermissions`，`destination: "session"` 仅将其应用于当前会话。

要将会话切换到 `acceptEdits`，你的Hooks将以下 JSON 写入 stdout：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedPermissions": [
        { "type": "setMode", "mode": "acceptEdits", "destination": "session" }
      ]
    }
  }
}
```

保持匹配器尽可能窄。匹配 `.*` 或将匹配器留空会自动批准每个权限提示，包括文件写入和 shell 命令。有关完整的决策字段集，请参阅 PermissionRequest 参考。

## Hooks如何工作

Hooks事件在 CSC 生命周期的特定点触发。当事件触发时，所有匹配的Hooks并行运行，相同的Hooks命令会自动去重。下表显示了每个事件及其触发时机：

| 事件                | 触发时机                                                                                                                                          |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`       | 当会话开始或恢复时                                                                                                                       |
| `UserPromptSubmit`   | 当你提交提示时，在 Claude 处理它之前                                                                                                   |
| `PreToolUse`         | 在工具调用执行之前。可以阻止它                                                                                                              |
| `PermissionRequest`  | 当权限对话框出现时                                                                                                                       |
| `PermissionDenied`   | 当工具调用被自动模式分类器拒绝时。返回 `{retry: true}` 告诉模型它可以重试被拒绝的工具调用                     |
| `PostToolUse`        | 在工具调用成功之后                                                                                                                             |
| `PostToolUseFailure` | 在工具调用失败之后                                                                                                                                |
| `Notification`       | 当 CSC 发送通知时                                                                                                                  |
| `SubagentStart`      | 当Subagents生成时                                                                                                                             |
| `SubagentStop`       | 当Subagents完成时                                                                                                                               |
| `TaskCreated`        | 当通过 `TaskCreate` 创建任务时                                                                                                          |
| `TaskCompleted`      | 当任务被标记为完成时                                                                                                               |
| `Stop`               | 当 Claude 完成响应时                                                                                                                        |
| `StopFailure`        | 当轮次因 API 错误结束时。输出和退出代码被忽略                                                                               |
| `TeammateIdle`       | 当Agent teams的队友即将进入空闲状态时                                                                                     |
| `InstructionsLoaded` | 当 CLAUDE.md 或 `.claude/rules/*.md` 文件被加载到上下文中时。在会话开始时和会话期间延迟加载文件时触发         |
| `ConfigChange`       | 当会话期间配置文件更改时                                                                                                     |
| `CwdChanged`         | 当工作目录更改时，例如当 Claude 执行 `cd` 命令时。适用于使用 direnv 等工具进行响应式环境管理 |
| `FileChanged`        | 当监视的文件在磁盘上更改时。`matcher` 字段指定要监视的文件名                                                            |
| `WorktreeCreate`     | 当通过 `--worktree` 或 `isolation: "worktree"` 创建工作树时。替换默认的 git 行为                                            |
| `WorktreeRemove`     | 当工作树被移除时，无论是在会话退出还是Subagents完成时                                                                   |
| `PreCompact`         | 在上下文压缩之前                                                                                                                              |
| `PostCompact`        | 在上下文压缩完成之后                                                                                                                     |
| `Elicitation`        | 当 MCP 服务器在工具调用期间请求用户输入时                                                                                              |
| `ElicitationResult`  | 在用户响应 MCP 引导后，在响应发送回服务器之前                                                            |
| `SessionEnd`         | 当会话终止时                                                                                                                              |

当多个Hooks匹配时，每个Hooks返回自己的结果。对于决策，CSC 选择最严格的答案。返回 `deny` 的 `PreToolUse` Hooks无论其他Hooks返回什么都取消工具调用。一个返回 `ask` 的Hooks强制显示权限提示，即使其余的返回 `allow`。来自 `additionalContext` 的文本从每个Hooks中保留并一起传递给 Claude。

每个Hooks都有一个 `type` 来决定它如何运行。大多数Hooks使用 `"type": "command"`，它运行 shell 命令。还有三种其他类型可用：

* `"type": "http"`：将事件数据 POST 到 URL。请参阅 HTTP Hooks。
* `"type": "prompt"`：单轮 LLM 评估。请参阅基于提示的Hooks。
* `"type": "agent"`：带工具访问的多轮验证。请参阅基于代理的Hooks。

### 读取输入和返回输出

Hooks通过 stdin、stdout、stderr 和退出代码与 CSC 通信。当事件触发时，CSC 将事件特定的数据作为 JSON 传递给你脚本的 stdin。你的脚本读取该数据，完成其工作，并通过退出代码告诉 CSC 接下来做什么。

#### Hooks输入

每个事件都包含 `session_id` 和 `cwd` 等公共字段，但每个事件类型添加不同的数据。例如，当 CSC 运行 Bash 命令时，`PreToolUse` Hooks在 stdin 上接收到类似以下内容：

```json
{
  "session_id": "abc123",
  "cwd": "/Users/sarah/myproject",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

你的脚本可以解析该 JSON 并对其中的任何字段进行操作。`UserPromptSubmit` Hooks获取 `prompt` 文本，`SessionStart` Hooks获取 `source`（startup、resume、clear、compact）等等。有关共享字段，请参阅参考中的公共输入字段，以及每个事件的部分了解事件特定的模式。

#### Hooks输出

你的脚本通过写入 stdout 或 stderr 并以特定代码退出来告诉 CSC 接下来做什么。例如，一个想要阻止命令的 `PreToolUse` Hooks：

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "drop table"; then
  echo "Blocked: dropping tables is not allowed" >&2
  exit 2
fi

exit 0
```

退出代码决定接下来发生什么：

* **退出 0**：操作继续。对于 `UserPromptSubmit` 和 `SessionStart` Hooks，你写入 stdout 的任何内容都会添加到 Claude 的上下文中。
* **退出 2**：操作被阻止。将原因写入 stderr，Claude 将其作为反馈接收以便调整。
* **任何其他退出代码**：操作继续。转录记录显示 `<hook name> hook error` 通知，后跟 stderr 的第一行；完整的 stderr 进入调试日志。

#### 结构化 JSON 输出

退出代码给你两个选项：允许或阻止。要进行更多控制，退出 0 并改为向 stdout 打印 JSON 对象。

> **注意：** 使用退出 2 通过 stderr 消息阻止，或使用退出 0 配合 JSON 进行结构化控制。不要混合使用：当你退出 2 时，CSC 会忽略 JSON。

例如，`PreToolUse` Hooks可以拒绝工具调用并告诉 CSC 原因，或将其升级给用户批准：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

使用 `"deny"`，CSC 取消工具调用并将 `permissionDecisionReason` 反馈给 CSC 。这些 `permissionDecision` 值特定于 `PreToolUse`：

* `"allow"`：跳过交互式权限提示。拒绝和询问规则，包括企业管理的拒绝列表，仍然适用
* `"deny"`：取消工具调用并将原因发送给 CSC 
* `"ask"`：像正常一样向用户显示权限提示

第四个值 `"defer"` 在使用 `-p` 标志的非交互模式下可用。它以保留的工具调用退出进程，以便 Agent SDK 包装器可以收集输入并恢复。请参阅参考中的延迟工具调用以供后续处理。

返回 `"allow"` 跳过交互式提示，但不会覆盖权限规则。如果拒绝规则匹配工具调用，即使你的Hooks返回 `"allow"`，调用也会被阻止。如果询问规则匹配，用户仍会被提示。这意味着来自任何设置范围（包括托管设置）的拒绝规则始终优先于Hooks批准。

其他事件使用不同的决策模式。例如，`PostToolUse` 和 `Stop` Hooks使用顶级 `decision: "block"` 字段，而 `PermissionRequest` 使用 `hookSpecificOutput.decision.behavior`。请参阅参考中的摘要表，了解按事件的完整分解。

对于 `UserPromptSubmit` Hooks，改用 `additionalContext` 将文本注入 CSC 的上下文。基于提示的Hooks（`type: "prompt"`）以不同方式处理输出：请参阅基于提示的Hooks。

### 使用匹配器筛选Hooks

没有匹配器，Hooks在其事件的每次出现时触发。匹配器让你缩小范围。例如，如果你只想在文件编辑后运行格式化器（而不是在每次工具调用后），请为你的 `PostToolUse` Hooks添加匹配器：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "prettier --write ..." }
        ]
      }
    ]
  }
}
```

`"Edit|Write"` 匹配器仅在 Claude 使用 `Edit` 或 `Write` 工具时触发，而不是在使用 `Bash`、`Read` 或任何其他工具时。有关纯名称和正则表达式的求值方式，请参阅匹配器模式。

每个事件类型匹配特定字段：

| 事件                                                                                                                        | 匹配器筛选的内容                                              | 匹配器值示例                                                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`                                   | 工具名称                                                             | `Bash`、`Edit\|Write`、`mcp__.*`                                                                                          |
| `SessionStart`                                                                                                               | 会话如何启动                                               | `startup`、`resume`、`clear`、`compact`                                                                                   |
| `SessionEnd`                                                                                                                 | 会话为何结束                                                 | `clear`、`resume`、`logout`、`prompt_input_exit`、`bypass_permissions_disabled`、`other`                                  |
| `Notification`                                                                                                               | 通知类型                                                     | `permission_prompt`、`idle_prompt`、`auth_success`、`elicitation_dialog`                                                  |
| `SubagentStart`                                                                                                              | 代理类型                                                            | `Bash`、`Explore`、`Plan` 或自定义代理名称                                                                          |
| `PreCompact`、`PostCompact`                                                                                                  | 什么触发了压缩                                             | `manual`、`auto`                                                                                                          |
| `SubagentStop`                                                                                                               | 代理类型                                                            | 与 `SubagentStart` 相同的值                                                                                            |
| `ConfigChange`                                                                                                               | 配置来源                                                  | `user_settings`、`project_settings`、`local_settings`、`policy_settings`、`skills`                                        |
| `StopFailure`                                                                                                                | 错误类型                                                            | `rate_limit`、`authentication_failed`、`billing_error`、`invalid_request`、`server_error`、`max_output_tokens`、`unknown` |
| `InstructionsLoaded`                                                                                                         | 加载原因                                                           | `session_start`、`nested_traversal`、`path_glob_match`、`include`、`compact`                                              |
| `Elicitation`                                                                                                                | MCP 服务器名称                                                       | 你配置的 MCP 服务器名称                                                                                          |
| `ElicitationResult`                                                                                                          | MCP 服务器名称                                                       | 与 `Elicitation` 相同的值                                                                                              |
| `FileChanged`                                                                                                                | 要监视的字面文件名 | `.envrc\|.env`                                                                                                            |
| `UserPromptSubmit`、`Stop`、`TeammateIdle`、`TaskCreated`、`TaskCompleted`、`WorktreeCreate`、`WorktreeRemove`、`CwdChanged` | 不支持匹配器                                                    | 在每次出现时始终触发                                                                                          |

更多示例展示不同事件类型上的匹配器：

#### 记录每个 Bash 命令

仅匹配 `Bash` 工具调用并将每个命令记录到文件中。`PostToolUse` 事件在命令完成后触发，因此 `tool_input.command` 包含运行的内容。Hooks通过 stdin 接收事件数据作为 JSON，`jq -r '.tool_input.command'` 仅提取命令字符串，`>>` 将其追加到日志文件：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

#### 匹配 MCP 工具

MCP 工具使用与内置工具不同的命名约定：`mcp__<server>__<tool>`，其中 `<server>` 是 MCP 服务器名称，`<tool>` 是它提供的工具。例如，`mcp__github__search_repositories` 或 `mcp__filesystem__read_file`。使用正则表达式匹配器来定位特定服务器的所有工具，或使用像 `mcp__.*__write.*` 这样的模式跨服务器匹配。请参阅参考中的匹配 MCP 工具以获取完整示例列表。

以下命令使用 `jq` 从Hooks的 JSON 输入中提取工具名称并将其写入 stderr。写入 stderr 保持 stdout 干净以便 JSON 输出，并将消息发送到调试日志：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"GitHub tool called: $(jq -r '.tool_name')\" >&2"
          }
        ]
      }
    ]
  }
}
```

#### 会话结束时清理

`SessionEnd` 事件支持根据会话结束原因进行匹配。此Hooks仅在 `clear`（当你运行 `/clear` 时）触发，不在正常退出时触发：

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "matcher": "clear",
        "hooks": [
          {
            "type": "command",
            "command": "rm -f /tmp/claude-scratch-*.txt"
          }
        ]
      }
    ]
  }
}
```

有关完整的匹配器语法，请参阅Hooks参考。

#### 使用 `if` 字段按工具名称和参数筛选

> **注意：** `if` 字段需要 CSC v2.1.85 或更高版本。早期版本会忽略它并在每个匹配的调用上运行Hooks。

`if` 字段使用权限规则语法按工具名称和参数一起筛选Hooks，因此Hooks进程仅在工具调用匹配时才生成。这超越了 `matcher`，后者仅在组级别按工具名称筛选。

例如，仅在 CSC 使用 `git` 命令而非所有 Bash 命令时运行Hooks：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-git-policy.sh"
          }
        ]
      }
    ]
  }
}
```

Hooks进程仅在 Bash 命令以 `git` 开头时生成。其他 Bash 命令完全跳过此处理程序。`if` 字段接受与权限规则相同的模式：`"Bash(git *)"`、`"Edit(*.ts)"` 等等。要匹配多个工具名称，请使用各自带有 `if` 值的单独处理程序，或在支持管道交替的 `matcher` 级别匹配。

`if` 仅适用于工具事件：`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest` 和 `PermissionDenied`。将其添加到任何其他事件会阻止Hooks运行。

### 配置Hooks位置

你在哪里添加Hooks决定了它的范围：

| 位置                                                   | 范围                              | 可共享                          |
| :--------------------------------------------------------- | :--------------------------------- | :--------------------------------- |
| `~/.claude/settings.json`                                  | 你的所有项目                  | 否，仅限本机          |
| `.claude/settings.json`                                    | 单个项目                     | 是，可以提交到仓库  |
| `.claude/settings.local.json`                              | 单个项目                     | 否，被 gitignore                     |
| 托管策略设置                                    | 组织范围                  | 是，由管理员控制              |
| Plugins `hooks/hooks.json`                   | 当Plugins启用时             | 是，与Plugins捆绑       |
| Skills或代理 frontmatter | 当Skills或代理激活时 | 是，定义在组件文件中 |

在 CSC 中运行 `/hooks` 以按事件浏览所有配置的Hooks。要一次禁用所有Hooks，请在设置文件中设置 `"disableAllHooks": true`。

如果你在 CSC 运行时直接编辑设置文件，文件监视器通常会自动获取Hooks更改。

## 基于提示的Hooks

对于需要判断力而非确定性规则的决策，请使用 `type: "prompt"` Hooks。CSC 不是运行 shell 命令，而是将你的提示和Hooks的输入数据发送给 Claude 模型（默认为 Haiku）来做出决策。如果你需要更强的能力，可以通过 `model` 字段指定不同的模型。

模型唯一的工作是返回一个是/否决策作为 JSON：

* `"ok": true`：操作继续
* `"ok": false`：操作被阻止。模型的 `"reason"` 被反馈给 Claude 以便调整。

此示例使用 `Stop` Hooks询问模型是否所有请求的任务都已完成。如果模型返回 `"ok": false`，Claude 继续工作并将 `reason` 作为其下一个指令：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains to be done\"}."
          }
        ]
      }
    ]
  }
}
```

有关完整的配置选项，请参阅参考中的基于提示的Hooks。

## 基于代理的Hooks

当验证需要检查文件或运行命令时，请使用 `type: "agent"` Hooks。与进行单次 LLM 调用的提示Hooks不同，代理Hooks生成一个Subagents，可以读取文件、搜索代码和使用其他工具来验证条件，然后返回决策。

代理Hooks使用与提示Hooks相同的 `"ok"` / `"reason"` 响应格式，但默认超时时间更长，为 60 秒，最多 50 次工具使用轮次。

此示例验证测试通过后才允许 Claude 停止：

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

当Hooks输入数据足以做出决策时使用提示Hooks。当你需要根据代码库的实际状态验证某些内容时使用代理Hooks。

有关完整的配置选项，请参阅参考中的基于代理的Hooks。

## HTTP Hooks

使用 `type: "http"` Hooks将事件数据 POST 到 HTTP 端点，而不是运行 shell 命令。端点接收与命令Hooks在 stdin 上接收的相同 JSON，并通过 HTTP 响应体使用相同的 JSON 格式返回结果。

当你希望 Web 服务器、云函数或外部服务处理Hooks逻辑时，HTTP Hooks非常有用：例如，一个共享审计服务，记录团队中的工具使用事件。

此示例将每个工具使用发布到本地日志服务：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "http://localhost:8080/hooks/tool-use",
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

端点应使用与命令Hooks相同的输出格式返回 JSON 响应体。要阻止工具调用，返回带有适当 `hookSpecificOutput` 字段的 2xx 响应。仅 HTTP 状态码无法阻止操作。

头部值支持使用 `$VAR_NAME` 或 `${VAR_NAME}` 语法进行环境变量插值。只有 `allowedEnvVars` 数组中列出的变量会被解析；所有其他 `$VAR` 引用保持为空。

有关完整的配置选项和响应处理，请参阅参考中的 HTTP Hooks。

## 限制和故障排除

### 限制

* 命令Hooks仅通过 stdout、stderr 和退出代码进行通信。它们无法触发 `/` 命令或工具调用。通过 `additionalContext` 返回的文本作为系统提醒注入，CSC 将其作为纯文本读取。HTTP Hooks改为通过响应体通信。
* Hooks超时默认为 10 分钟，可通过 `timeout` 字段（以秒为单位）按Hooks配置。
* `PostToolUse` Hooks无法撤销操作，因为工具已经执行。
* `PermissionRequest` Hooks不在非交互模式（`-p`）中触发。请使用 `PreToolUse` Hooks进行自动权限决策。
* `Stop` Hooks在 Claude 完成响应时触发，而不仅仅在任务完成时。它们不会在用户中断时触发。API 错误触发 StopFailure。
* 当多个 PreToolUse Hooks返回 `updatedInput` 来重写工具的参数时，最后完成的一个生效。由于Hooks并行运行，顺序是非确定性的。避免有多个Hooks修改同一工具的输入。

### Hooks和权限模式

PreToolUse Hooks在任何权限模式检查之前触发。返回 `permissionDecision: "deny"` 的Hooks即使在 `bypassPermissions` 模式或使用 `--dangerously-skip-permissions` 时也会阻止工具。这让你可以强制执行用户无法通过更改其权限模式来绕过的策略。

反过来则不然：返回 `"allow"` 的Hooks不会绕过设置中的拒绝规则。Hooks可以加强限制，但不能放宽到超出权限规则允许的范围。

### Hooks未触发

Hooks已配置但从未执行。

* 运行 `/hooks` 并确认Hooks出现在正确的事件下
* 检查匹配器模式是否与工具名称完全匹配（匹配器区分大小写）
* 验证你触发的是正确的事件类型（例如，`PreToolUse` 在工具执行前触发，`PostToolUse` 在之后触发）
* 如果在非交互模式（`-p`）中使用 `PermissionRequest` Hooks，请改用 `PreToolUse`

### 输出中出现Hooks错误

你在转录记录中看到类似 "PreToolUse hook error: ..." 的消息。

* 你的脚本意外以非零代码退出。通过管道传入示例 JSON 手动测试：
  ```bash
  echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
  echo $?  # Check the exit code
  ```
* 如果你看到 "command not found"，请使用绝对路径或 `$CLAUDE_PROJECT_DIR` 来引用脚本
* 如果你看到 "jq: command not found"，请安装 `jq` 或使用 Python/Node.js 进行 JSON 解析
* 如果脚本根本没有运行，请使其可执行：`chmod +x ./my-hook.sh`

### `/hooks` 显示未配置Hooks

你编辑了设置文件但Hooks没有出现在菜单中。

* 文件编辑通常会自动获取。如果几秒钟后仍未出现，文件监视器可能遗漏了更改：重启你的会话以强制重新加载。
* 验证你的 JSON 是否有效（不允许尾随逗号和注释）
* 确认设置文件位于正确的位置：`.claude/settings.json` 用于项目Hooks，`~/.claude/settings.json` 用于全局Hooks

### Stop Hooks永远运行

Claude 在无限循环中持续工作而不是停止。

你的 Stop Hooks脚本需要检查它是否已经触发了继续。从 JSON 输入中解析 `stop_hook_active` 字段，如果为 `true` 则提前退出：

```bash
#!/bin/bash
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Allow Claude to stop
fi
# ... rest of your hook logic
```

### JSON 验证失败

CSC 显示 JSON 解析错误，即使你的Hooks脚本输出了有效的 JSON。

当 CSC 运行Hooks时，它会生成一个 shell 来加载你的配置文件（`~/.zshrc` 或 `~/.bashrc`）。如果你的配置文件包含无条件的 `echo` 语句，该输出会被前置到你的Hooks JSON 之前：

```text
Shell ready on arm64
{"decision": "block", "reason": "Not allowed"}
```

CSC 尝试将其解析为 JSON 并失败。要解决此问题，请将 shell 配置文件中的 echo 语句包装起来，使其仅在交互式 shell 中运行：

```bash
# In ~/.zshrc or ~/.bashrc
if [[ $- == *i* ]]; then
  echo "Shell ready"
fi
```

`$-` 变量包含 shell 标志，`i` 表示交互式。Hooks在非交互式 shell 中运行，因此 echo 被跳过。

### 调试技巧

使用 `Ctrl+O` 切换的转录视图显示每个触发的Hooks的单行摘要：成功是静默的，阻止错误显示 stderr，非阻止错误显示 `<hook name> hook error` 通知后跟 stderr 的第一行。

有关完整的执行详情，包括哪些Hooks匹配、它们的退出代码、stdout 和 stderr，请阅读调试日志。使用 `csc --debug-file /tmp/claude.log` 启动 CSC 以写入已知路径，然后在另一个终端中 `tail -f /tmp/claude.log`。如果你启动时没有该标志，请在会话中运行 `/debug` 以启用日志记录并找到日志路径。
