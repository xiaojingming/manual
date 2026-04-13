---
sidebar_position: 3
---

# 以编程方式运行 CSC

> 使用 Agent SDK 从 CLI、Python 或 TypeScript 以编程方式运行 CSC。

Agent SDK 提供了与 CSC 相同的工具、代理循环和上下文管理能力。它可作为 CLI 用于脚本和 CI/CD，也可作为 Python 和 TypeScript 包用于完整的编程控制。

> **注意：** CLI 以前被称为"无头模式"。`-p` 标志和所有 CLI 选项的工作方式相同。

要从 CLI 以编程方式运行 CSC，请使用 `-p` 传入你的提示和任何 CLI 选项：

```bash
csc -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"
```

本页介绍如何通过 CLI（`csc -p`）使用 Agent SDK。有关具有结构化输出、工具审批回调和原生消息对象的 Python 和 TypeScript SDK 包，请参阅完整的 Agent SDK 文档。

## 基本用法

在任何 `csc` 命令中添加 `-p`（或 `--print`）标志即可非交互式运行。所有 CLI 选项都适用于 `-p`，包括：

* `--continue` 用于继续对话
* `--allowedTools` 用于自动批准工具
* `--output-format` 用于结构化输出

此示例向 CSC 提问关于代码库的问题并打印响应：

```bash
csc -p "What does the auth module do?"
```

### 使用裸模式加快启动速度

添加 `--bare` 可跳过Hooks、Skills、Plugins、MCP 服务器、自动记忆和 CLAUDE.md 的自动发现，从而减少启动时间。如果不加此选项，`csc -p` 会加载与交互式会话相同的上下文，包括工作目录或 `~/.claude` 中配置的任何内容。

裸模式适用于 CI 和脚本场景，在这些场景中你需要在每台机器上获得相同的结果。队友 `~/.claude` 中的Hooks或项目 `.mcp.json` 中的 MCP 服务器不会运行，因为裸模式从不读取它们。只有你显式传递的标志才会生效。

此示例以裸模式运行一次性摘要任务，并预先批准 Read 工具，使调用无需权限提示即可完成：

```bash
csc --bare -p "Summarize this file" --allowedTools "Read"
```

在裸模式下，CSC 可以访问 Bash、文件读取和文件编辑工具。使用标志传入所需的任何上下文：

| 要加载的内容             | 使用                                                     |
| ----------------------- | ------------------------------------------------------- |
| 系统提示补充            | `--append-system-prompt`、`--append-system-prompt-file` |
| 设置                    | `--settings <file-or-json>`                             |
| MCP 服务器              | `--mcp-config <file-or-json>`                           |
| 自定义代理              | `--agents <json>`                                       |
| Plugins目录                | `--plugin-dir <path>`                                   |

> **注意：** `--bare` 是脚本和 SDK 调用的推荐模式，并将在未来版本中成为 `-p` 的默认模式。

## 示例

这些示例展示了常见的 CLI 模式。对于 CI 和其他脚本调用，请添加 `--bare`，这样它们就不会拾取本地配置的任何内容。

### 获取结构化输出

使用 `--output-format` 控制响应的返回方式：

* `text`（默认）：纯文本输出
* `json`：包含结果、会话 ID 和元数据的结构化 JSON
* `stream-json`：用于实时流式传输的换行分隔 JSON

此示例以 JSON 格式返回项目摘要及会话元数据，文本结果在 `result` 字段中：

```bash
csc -p "Summarize this project" --output-format json
```

要获取符合特定模式的输出，请使用 `--output-format json` 配合 `--json-schema` 和 JSON Schema 定义。响应包含有关请求的元数据（会话 ID、使用情况等），结构化输出在 `structured_output` 字段中。

此示例提取函数名并以字符串数组形式返回：

```bash
csc -p "Extract the main function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

> **💡 提示：** 使用 jq 等工具解析响应并提取特定字段：

  ```bash
  # 提取文本结果
  csc -p "Summarize this project" --output-format json | jq -r '.result'

  # 提取结构化输出
  csc -p "Extract function names from auth.py" \
    --output-format json \
    --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
    | jq '.structured_output'
  ```

### 流式响应

使用 `--output-format stream-json` 配合 `--verbose` 和 `--include-partial-messages` 可在生成时接收 token。每行是一个表示事件的 JSON 对象：

```bash
csc -p "Explain recursion" --output-format stream-json --verbose --include-partial-messages
```

以下示例使用 jq 过滤文本增量并仅显示流式文本。`-r` 标志输出原始字符串（无引号），`-j` 不带换行符连接，使 token 连续流式传输：

```bash
csc -p "Write a poem" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

当 API 请求因可重试错误而失败时，CSC 会在重试之前发出 `system/api_retry` 事件。你可以使用此事件来显示重试进度或实现自定义退避逻辑。

| 字段               | 类型            | 描述                                                                                                                                         |
| ------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`             | `"system"`      | 消息类型                                                                                                                                     |
| `subtype`          | `"api_retry"`   | 标识此为重试事件                                                                                                                             |
| `attempt`          | integer         | 当前尝试次数，从 1 开始                                                                                                                     |
| `max_retries`      | integer         | 允许的总重试次数                                                                                                                             |
| `retry_delay_ms`   | integer         | 距下次尝试的毫秒数                                                                                                                           |
| `error_status`     | integer or null | HTTP 状态码，对于没有 HTTP 响应的连接错误为 `null`                                                                                           |
| `error`            | string          | 错误类别：`authentication_failed`、`billing_error`、`rate_limit`、`invalid_request`、`server_error`、`max_output_tokens` 或 `unknown` |
| `uuid`             | string          | 唯一事件标识符                                                                                                                               |
| `session_id`       | string          | 事件所属的会话                                                                                                                               |

有关带回调和消息对象的编程式流式传输，请参阅 Agent SDK 文档中的实时流式响应。

### 自动批准工具

使用 `--allowedTools` 让 CSC 使用某些工具而无需提示。此示例运行测试套件并修复失败项，允许 CSC 执行 Bash 命令和读取/编辑文件而无需请求权限：

```bash
csc -p "Run the test suite and fix any failures" \
  --allowedTools "Bash,Read,Edit"
```

要为整个会话设置基准而不是列出单个工具，请传递权限模式。`dontAsk` 拒绝不在 `permissions.allow` 规则中的任何内容，适用于锁定的 CI 运行。`acceptEdits` 允许 CSC 无需提示即可写入文件，并自动批准常见的文件系统命令，如 `mkdir`、`touch`、`mv` 和 `cp`。其他 shell 命令和网络请求仍需要 `--allowedTools` 条目或 `permissions.allow` 规则，否则运行在尝试时会中止：

```bash
csc -p "Apply the lint fixes" --permission-mode acceptEdits
```

### 创建提交

此示例审查暂存的更改并使用适当的消息创建提交：

```bash
csc -p "Look at my staged changes and create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

`--allowedTools` 标志使用权限规则语法。末尾的 ` *` 启用前缀匹配，因此 `Bash(git diff *)` 允许任何以 `git diff` 开头的命令。`*` 前的空格很重要：没有它，`Bash(git diff*)` 也会匹配 `git diff-index`。

> **注意：** 用户调用的Skills（如 `/commit`）和内置命令仅在交互模式下可用。在 `-p` 模式下，请描述你想要完成的任务。

### 自定义系统提示

使用 `--append-system-prompt` 添加指令，同时保留 CSC 的默认行为。此示例将 PR diff 管道传递给 CSC 并指示其审查安全漏洞：

```bash
gh pr diff "$1" | csc -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

有关更多选项（包括使用 `--system-prompt` 完全替换默认提示），请参阅系统提示标志。

### 继续对话

使用 `--continue` 继续最近的对话，或使用 `--resume` 加会话 ID 继续特定对话。此示例运行审查，然后发送后续提示：

```bash
# 第一次请求
csc -p "Review this codebase for performance issues"

# 继续最近的对话
csc -p "Now focus on the database queries" --continue
csc -p "Generate a summary of all issues found" --continue
```

如果你正在运行多个对话，捕获会话 ID 以恢复特定对话：

```bash
session_id=$(csc -p "Start a review" --output-format json | jq -r '.session_id')
csc -p "Continue that review" --resume "$session_id"
```
