---
sidebar_position: 4
---

# 工具参考

> CSC 可用工具的完整参考，包括权限要求。

CSC 可以访问一组内置工具，帮助它理解和修改你的代码库。工具名称是你在权限规则、子代理工具列表和钩子匹配器中使用的确切字符串。要完全禁用某个工具，请将其名称添加到权限设置中的 `deny` 数组。

要添加自定义工具，请连接 MCP 服务器。要通过可重用的基于提示的工作流扩展 CSC，请编写技能，它通过现有的 `Skill` 工具运行，而不是添加新的工具条目。

| 工具                   | 描述                                                                                                                                                                                                                                                  | 需要权限 |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| `Agent`                | 生成一个具有自己上下文窗口的子代理来处理任务                                                                                                                                                                                                                                             | 否                  |
| `AskUserQuestion`      | 提出多选题以收集需求或澄清歧义                                                                                                                                                                                                                                                   | 否                  |
| `Bash`                 | 在你的环境中执行 shell 命令。参见 Bash 工具行为                                                                                                                                                                                                                                   | 是                 |
| `CronCreate`           | 在当前会话中安排定期或一次性提示（CSC 退出时消失）。参见计划任务                                                                                                                                                                                                                                                     | 否                  |
| `CronDelete`           | 按 ID 取消计划任务                                                                                                                                                                                                                               | 否                  |
| `CronList`             | 列出会话中所有计划任务                                                                                                                                                                                                                     | 否                  |
| `Edit`                 | 对特定文件进行定向编辑                                                                                                                                                                                                                       | 是                 |
| `EnterPlanMode`        | 切换到计划模式，在编码之前设计方案                                                                                                                                                                                                    | 否                  |
| `EnterWorktree`        | 创建一个隔离的 git worktree 并切换到其中                                                                                                                                                                                           | 否                  |
| `ExitPlanMode`         | 提交计划以供批准并退出计划模式                                                                                                                                                                                                             | 是                 |
| `ExitWorktree`         | 退出 worktree 会话并返回原始目录                                                                                                                                                                                               | 否                  |
| `Glob`                 | 基于模式匹配查找文件                                                                                                                                                                                                                        | 否                  |
| `Grep`                 | 在文件内容中搜索模式                                                                                                                                                                                                                       | 否                  |
| `ListMcpResourcesTool` | 列出已连接 MCP 服务器暴露的资源                                                                                                                                                                                                  | 否                  |
| `LSP`                  | 通过语言服务器实现代码智能：跳转到定义、查找引用、报告类型错误和警告。参见 LSP 工具行为                                                                                                   | 否                  |
| `Monitor`              | 在后台运行命令并将每行输出反馈给 CSC，使其可以在对话中响应日志条目、文件更改或轮询状态。参见 Monitor 工具                                                               | 是                 |
| `NotebookEdit`         | 修改 Jupyter notebook 单元格                                                                                                                                                                                                                              | 是                 |
| `PowerShell`           | 在 Windows 上执行 PowerShell 命令。可选预览功能。参见 PowerShell 工具                                                                                                                                                             | 是                 |
| `Read`                 | 读取文件内容                                                                                                                                                                                                                                  | 否                  |
| `ReadMcpResourceTool`  | 按 URI 读取特定的 MCP 资源                                                                                                                                                                                                                         | 否                  |
| `SendMessage`          | 向代理团队的队友发送消息，或通过代理 ID 恢复子代理。已停止的子代理在后台自动恢复。仅在设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 时可用 | 否                  |
| `Skill`                | 在主对话中执行技能                                                                                                                                                                      | 是                 |
| `TaskCreate`           | 在任务列表中创建新任务                                                                                                                                                                                                                          | 否                  |
| `TaskGet`              | 获取特定任务的完整详情                                                                                                                                                                                                                   | 否                  |
| `TaskList`             | 列出所有任务及其当前状态                                                                                                                                                                                                                     | 否                  |
| `TaskOutput`           | （已弃用）从后台任务获取输出。建议使用 `Read` 读取任务的输出文件路径                                                                                                                                                           | 否                  |
| `TaskStop`             | 按 ID 终止正在运行的后台任务                                                                                                                                                                                                                        | 否                  |
| `TaskUpdate`           | 更新任务状态、依赖关系、详情或删除任务                                                                                                                                                                                                 | 否                  |
| `TeamCreate`           | 创建一个包含多个队友的代理团队。仅在设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 时可用                                                                                                                        | 否                  |
| `TeamDelete`           | 解散代理团队并清理队友进程。仅在设置 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 时可用                                                                                                                                 | 否                  |
| `TodoWrite`            | 管理会话任务清单。在非交互模式和 Agent SDK 中可用；交互式会话使用 TaskCreate、TaskGet、TaskList 和 TaskUpdate                                                                                                      | 否                  |
| `ToolSearch`           | 在启用工具搜索时搜索并加载延迟工具                                                                                                                                                      | 否                  |
| `WebFetch`             | 从指定 URL 获取内容                                                                                                                                                                                                                         | 是                 |
| `WebSearch`            | 执行网络搜索                                                                                                                                                                                                                                        | 是                 |
| `Write`                | 创建或覆盖文件                                                                                                                                                                                                                                  | 是                 |

权限规则可以使用 `/permissions` 或在权限设置中配置。另请参阅工具特定权限规则。

## Bash 工具行为

Bash 工具在单独的进程中运行每个命令，具有以下持久性行为：

* 当 CSC 在主会话中运行 `cd` 时，新的工作目录会延续到后续的 Bash 命令，只要它保持在项目目录或你通过 `--add-dir`、`/add-dir` 或设置中的 `additionalDirectories` 添加的额外工作目录内。子代理会话不会延续工作目录更改。
  * 如果 `cd` 超出这些目录，CSC 会重置到项目目录并在工具结果中附加 `Shell cwd was reset to <dir>`。
  * 要禁用此延续行为，使每个 Bash 命令都在项目目录中启动，请设置 `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1`。
* 环境变量不会持久化。一个命令中的 `export` 在下一个命令中不可用。

在启动 CSC 之前激活你的 virtualenv 或 conda 环境。要使环境变量在 Bash 命令之间持久化，请在启动 CSC 之前将 `CLAUDE_ENV_FILE` 设置为 shell 脚本，或使用 SessionStart 钩子动态填充它。

## LSP 工具行为

LSP 工具为 CSC 提供来自运行中语言服务器的代码智能。每次文件编辑后，它会自动报告类型错误和警告，使 CSC 无需单独的构建步骤即可修复问题。CSC 还可以直接调用它来导航代码：

* 跳转到符号的定义
* 查找符号的所有引用
* 获取某个位置的类型信息
* 列出文件或工作区中的符号
* 查找接口的实现
* 跟踪调用层次结构

该工具在你为你的语言安装代码智能插件之前处于非活动状态。该插件捆绑了语言服务器配置，你需要单独安装服务器二进制文件。

## PowerShell 工具

在 Windows 上，CSC 可以原生运行 PowerShell 命令，而不是通过 Git Bash 路由。这是一个可选预览功能。

### 启用 PowerShell 工具

在环境或 `settings.json` 中设置 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`：

```json
{
  "env": {
    "CLAUDE_CODE_USE_POWERSHELL_TOOL": "1"
  }
}
```

CSC 自动检测 `pwsh.exe`（PowerShell 7+），回退到 `powershell.exe`（PowerShell 5.1）。Bash 工具仍与 PowerShell 工具一起注册，因此你可能需要要求 CSC 使用 PowerShell。

### 设置、钩子和技能中的 Shell 选择

三个额外的设置控制 PowerShell 的使用位置：

* `"defaultShell": "powershell"` 在 settings.json 中：通过 PowerShell 路由交互式 `!` 命令。需要启用 PowerShell 工具。
* `"shell": "powershell"` 在单个命令钩子上：在 PowerShell 中运行该钩子。钩子直接生成 PowerShell，因此无论 `CLAUDE_CODE_USE_POWERSHELL_TOOL` 如何设置都可以工作。
* `shell: powershell` 在技能前置元数据中：在 PowerShell 中运行 `` !`command` `` 块。需要启用 PowerShell 工具。

Bash 工具部分中描述的主会话工作目录重置行为同样适用于 PowerShell 命令，包括 `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` 环境变量。

### 预览限制

PowerShell 工具在预览期间有以下已知限制：

* 自动模式尚不能与 PowerShell 工具一起使用
* 不加载 PowerShell 配置文件
* 不支持沙箱
* 仅支持原生 Windows，不支持 WSL
* 仍然需要 Git Bash 来启动 CSC

## 检查可用的工具

你的确切工具集取决于你的提供商、平台和设置。要检查运行会话中加载了哪些工具，直接询问 CSC：

```text
你有哪些工具可以访问？
```

CSC 会给出对话式摘要。要获取确切的 MCP 工具名称，请运行 `/mcp`。
