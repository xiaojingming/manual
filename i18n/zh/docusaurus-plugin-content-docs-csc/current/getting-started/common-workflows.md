---
sidebar_position: 6
---

# 常见工作流

> 使用 CSC 探索代码库、修复 Bug、重构、测试和其他日常任务的分步指南。

本页面涵盖了日常开发的实用工作流：探索不熟悉的代码、调试、重构、编写测试、创建 PR 以及管理会话。每个部分都包含示例提示，你可以根据自己的项目进行调整。有关更高层次的模式和技巧，请参阅最佳实践。

## 理解新代码库

### 快速了解代码库概览

假设你刚加入一个新项目，需要快速了解其结构。

1. **导航到项目根目录**

    ```bash
    cd /path/to/project 
    ```

2. **启动 CSC**

    ```bash
    csc 
    ```

3. **请求高层次概览**

    ```text
    给我介绍一下这个代码库的概览
    ```

4. **深入特定组件**

    ```text
    解释这里使用的主要架构模式
    ```

    ```text
    关键的数据模型有哪些？
    ```

    ```text
    认证是如何处理的？
    ```

> **💡 提示：**
>
> * 从广泛的问题开始，然后缩小到特定领域
> * 询问项目中使用的编码约定和模式
> * 请求项目特定术语的词汇表

### 查找相关代码

假设你需要定位与特定功能或特性相关的代码。

1. **让 CSC 查找相关文件**

    ```text
    查找处理用户认证的文件
    ```

2. **了解组件如何交互**

    ```text
    这些认证文件是如何协同工作的？
    ```

3. **理解执行流程**

    ```text
    从前端到数据库追踪登录过程
    ```

> **💡 提示：**
>
> * 明确说明你要查找的内容
> * 使用项目中的领域语言
> * 为你的语言安装代码智能插件，以便为 CSC 提供精确的"转到定义"和"查找引用"导航

***

## 高效修复 Bug

假设你遇到了一条错误消息，需要找到并修复其来源。

1. **与 CSC 分享错误**

    ```text
    我在运行 npm test 时看到了一个错误
    ```

2. **请求修复建议**

    ```text
    建议几种修复 user.ts 中 @ts-ignore 的方法
    ```

3. **应用修复**

    ```text
    更新 user.ts 以添加你建议的空值检查
    ```

> **💡 提示：**
>
> * 告诉 CSC 重现问题的命令并获取堆栈跟踪
> * 提及重现错误的任何步骤
> * 让 CSC 知道错误是间歇性的还是持续性的

***

## 重构代码

假设你需要更新旧代码以使用现代模式和实践。

1. **识别需要重构的遗留代码**

    ```text
    在我们的代码库中查找已弃用的 API 用法
    ```

2. **获取重构建议**

    ```text
    建议如何重构 utils.js 以使用现代 JavaScript 特性
    ```

3. **安全地应用更改**

    ```text
    重构 utils.js 以使用 ES2024 特性，同时保持相同的行为
    ```

4. **验证重构**

    ```text
    为重构的代码运行测试
    ```

> **💡 提示：**
>
> * 让 CSC 解释现代方法的好处
> * 在需要时请求更改保持向后兼容性
> * 以小的、可测试的增量进行重构

***

## 使用专用子代理

假设你想使用专用 AI 子代理来更有效地处理特定任务。

1. **查看可用的子代理**

    ```text
    /agents
    ```

    这将显示所有可用的子代理，并允许你创建新的子代理。

2. **自动使用子代理**

    CSC 会自动将适当的任务委派给专用子代理：

    ```text
    审查我最近的代码更改是否存在安全问题
    ```

    ```text
    运行所有测试并修复任何失败
    ```

3. **显式请求特定子代理**

    ```text
    使用 code-reviewer 子代理检查 auth 模块
    ```

    ```text
    让 debugger 子代理调查为什么用户无法登录
    ```

4. **为你的工作流创建自定义子代理**

    ```text
    /agents
    ```

    然后选择"Create New subagent"并按照提示定义：

    * 描述子代理用途的唯一标识符（例如 `code-reviewer`、`api-designer`）
    * CSC 何时应使用此代理
    * 它可以访问哪些工具
    * 描述代理角色和行为的系统提示

> **💡 提示：**
>
> * 在 `.claude/agents/` 中创建项目特定的子代理以便团队共享
> * 使用描述性的 `description` 字段来启用自动委派
> * 将工具访问限制为每个子代理实际需要的
> * 查看子代理文档以获取详细示例

***

## 使用计划模式进行安全的代码分析

计划模式指示 CSC 通过只读操作分析代码库来创建计划，非常适合探索代码库、规划复杂更改或安全地审查代码。在计划模式下，CSC 使用 `AskUserQuestion` 来收集需求并在提出计划之前明确你的目标。

### 何时使用计划模式

* **多步骤实现**：当你的功能需要编辑多个文件时
* **代码探索**：当你想在更改任何内容之前彻底研究代码库时
* **交互式开发**：当你想与 CSC 迭代方向时

### 如何使用计划模式

**在会话中开启计划模式**

你可以在会话中使用 **Shift+Tab** 循环切换权限模式来切换到计划模式。

如果你处于普通模式，**Shift+Tab** 首先切换到自动接受模式，由终端底部的 `⏵⏵ accept edits on` 指示。再次按 **Shift+Tab** 将切换到计划模式，由 `⏸ plan mode on` 指示。

**在计划模式下启动新会话**

要在计划模式下启动新会话，使用 `--permission-mode plan` 标志：

```bash
csc --permission-mode plan
```

**在计划模式下运行"无头"查询**

你还可以使用 `-p` 直接在计划模式下运行查询（即在"无头模式"下）：

```bash
csc --permission-mode plan -p "分析认证系统并建议改进"
```

### 示例：规划复杂重构

```bash
csc --permission-mode plan
```

```text
我需要重构我们的认证系统以使用 OAuth2。创建一个详细的迁移计划。
```

CSC 分析当前实现并创建一个全面的计划。通过后续追问来完善：

```text
向后兼容性怎么处理？
```

```text
数据库迁移应该如何处理？
```

> **💡 提示：** 按 `Ctrl+G` 在默认文本编辑器中打开计划，你可以在 CSC 继续之前直接编辑它。

当你接受一个计划时，CSC 会根据计划内容自动命名会话。名称显示在提示栏和会话选择器中。如果你已经使用 `--name` 或 `/rename` 设置了名称，接受计划不会覆盖它。

### 将计划模式配置为默认

```json
// .claude/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

有关更多配置选项，请参阅设置文档。

***

## 处理测试

假设你需要为未覆盖的代码添加测试。

1. **识别未测试的代码**

    ```text
    查找 NotificationsService.swift 中未被测试覆盖的函数
    ```

2. **生成测试脚手架**

    ```text
    为通知服务添加测试
    ```

3. **添加有意义的测试用例**

    ```text
    为通知服务中的边界条件添加测试用例
    ```

4. **运行并验证测试**

    ```text
    运行新测试并修复任何失败
    ```

CSC 可以生成遵循项目现有模式和约定的测试。在请求测试时，要具体说明你想验证什么行为。CSC 会检查你现有的测试文件，以匹配已使用的风格、框架和断言模式。

为了获得全面的覆盖率，请让 CSC 识别你可能遗漏的边界情况。CSC 可以分析你的代码路径，并建议针对错误条件、边界值和意外输入的测试，这些很容易被忽略。

***

## 创建 Pull Request

你可以直接让 CSC 创建 Pull Request（"为我的更改创建一个 pr"），或者逐步引导 CSC 完成：

1. **总结你的更改**

    ```text
    总结我对认证模块所做的更改
    ```

2. **生成 Pull Request**

    ```text
    创建一个 pr
    ```

3. **审查和完善**

    ```text
    用更多关于安全改进的上下文来增强 PR 描述
    ```

当你使用 `gh pr create` 创建 PR 时，会话会自动链接到该 PR。你稍后可以使用 `csc --from-pr <number>` 恢复它。

> **💡 提示：** 在提交之前审查 CSC 生成的 PR，并让 CSC 突出显示潜在的风险或注意事项。

## 处理文档

假设你需要为代码添加或更新文档。

1. **识别未文档化的代码**

    ```text
    查找 auth 模块中没有适当 JSDoc 注释的函数
    ```

2. **生成文档**

    ```text
    为 auth.js 中未文档化的函数添加 JSDoc 注释
    ```

3. **审查和增强**

    ```text
    用更多上下文和示例改进生成的文档
    ```

4. **验证文档**

    ```text
    检查文档是否遵循我们的项目标准
    ```

> **💡 提示：**
>
> * 指定你想要的文档风格（JSDoc、docstrings 等）
> * 在文档中要求示例
> * 为公共 API、接口和复杂逻辑请求文档

***

## 处理图像

假设你需要在代码库中处理图像，并希望 CSC 帮助分析图像内容。

1. **将图像添加到对话中**

    你可以使用以下任一方法：

    1. 将图像拖放到 CSC 窗口中
    2. 复制图像并使用 ctrl+v 粘贴到 CLI 中（不要使用 cmd+v）
    3. 向 CSC 提供图像路径。例如，"分析这张图像：/path/to/your/image.png"

2. **让 CSC 分析图像**

    ```text
    这张图像显示了什么？
    ```

    ```text
    描述此截图中的 UI 元素
    ```

    ```text
    此图表中是否有任何有问题的元素？
    ```

3. **使用图像作为上下文**

    ```text
    这是错误的截图。是什么导致了它？
    ```

    ```text
    这是我们当前的数据库架构。我们应该如何为新功能修改它？
    ```

4. **从视觉内容获取代码建议**

    ```text
    生成与此设计模型匹配的 CSS
    ```

    ```text
    什么 HTML 结构可以重建此组件？
    ```

> **💡 提示：**
>
> * 当文本描述不清楚或繁琐时使用图像
> * 包含错误、UI 设计或图表的截图以获得更好的上下文
> * 你可以在对话中处理多个图像
> * 图像分析适用于图表、截图、模型等
> * 当 CSC 引用图像时（例如 `[Image #1]`），`Cmd+Click`（Mac）或 `Ctrl+Click`（Windows/Linux）链接以在默认查看器中打开图像

***

## 引用文件和目录

使用 @ 快速包含文件或目录，无需等待 CSC 读取它们。

1. **引用单个文件**

    ```text
    解释 @src/utils/auth.js 中的逻辑
    ```

    这会将文件的完整内容包含在对话中。

2. **引用目录**

    ```text
    @src/components 的结构是什么？
    ```

    这会提供包含文件信息的目录列表。

3. **引用 MCP 资源**

    ```text
    显示 @github:repos/owner/repo/issues 的数据
    ```

    这会使用 @server:resource 格式从连接的 MCP 服务器获取数据。有关详细信息，请参阅 MCP 资源。

> **💡 提示：**
>
> * 文件路径可以是相对路径或绝对路径
> * @ 文件引用会将文件目录和父目录中的 `CLAUDE.md` 添加到上下文中
> * 目录引用显示文件列表，而不是内容
> * 你可以在单条消息中引用多个文件（例如，"@file1.js 和 @file2.js"）

## 恢复之前的对话

启动 CSC 时，你可以恢复之前的会话：

* `csc --continue` 继续当前目录中最近的对话
* `csc --resume` 打开对话选择器或按名称恢复
* `csc --from-pr 123` 恢复链接到特定 Pull Request 的会话

在活动会话中，使用 `/resume` 切换到不同的对话。

会话按项目目录存储。`/resume` 选择器显示来自同一 git 仓库（包括 worktree）的交互式会话。当你从同一仓库的另一个 worktree 中选择一个会话时，CSC 会直接恢复它，而无需你先切换目录。由 `csc -p` 或 SDK 调用创建的会话不会出现在选择器中，但你仍然可以通过将其会话 ID 直接传递给 `csc --resume <session-id>` 来恢复它。

### 命名你的会话

给会话起描述性名称以便以后查找。这是在处理多个任务或功能时的最佳实践。

1. **命名会话**

    启动时使用 `-n` 命名会话：

    ```bash
    csc -n auth-refactor
    ```

    或在会话中使用 `/rename`，这也会在提示栏上显示名称：

    ```text
    /rename auth-refactor
    ```

    你还可以从选择器中重命名任何会话：运行 `/resume`，导航到会话，然后按 `R`。

2. **稍后按名称恢复**

    从命令行：

    ```bash
    csc --resume auth-refactor
    ```

    或从活动会话中：

    ```text
    /resume auth-refactor
    ```

### 使用会话选择器

`/resume` 命令（或没有参数的 `csc --resume`）打开一个交互式会话选择器，具有以下功能：

**选择器中的键盘快捷键：**

| 快捷键  | 动作                                            |
| :-------- | :------------------------------------------------ |
| `↑` / `↓` | 在会话之间导航                         |
| `→` / `←` | 展开或折叠分组的会话               |
| `Enter`   | 选择并恢复突出显示的会话         |
| `P`       | 预览会话内容                       |
| `R`       | 重命名突出显示的会话                    |
| `/`       | 搜索以过滤会话                        |
| `A`       | 在当前目录和所有项目之间切换 |
| `B`       | 过滤到当前 git 分支的会话   |
| `Esc`     | 退出选择器或搜索模式                    |

**会话组织：**

选择器显示带有有用元数据的会话：

* 会话名称或初始提示
* 距上次活动的时间
* 消息计数
* Git 分支（如适用）

分叉的会话（使用 `/branch`、`/rewind` 或 `--fork-session` 创建）在其根会话下分组在一起，使查找相关对话更容易。

> **💡 提示：**
>
> * **尽早命名会话**：在开始处理不同任务时使用 `/rename`：以后查找"payment-integration"比"explain this function"容易得多
> * 使用 `--continue` 快速访问当前目录中最近的对话
> * 当你知道需要哪个会话时使用 `--resume session-name`
> * 当你需要浏览和选择时使用 `--resume`（不带名称）
> * 对于脚本，使用 `csc --continue --print "prompt"` 以非交互模式恢复
> * 在选择器中按 `P` 在恢复之前预览会话
> * 恢复的对话以与原始会话相同的模型和配置开始
>
>   工作原理：
>
>   1. **对话存储**：所有对话都会自动在本地保存其完整的消息历史
>   2. **消息反序列化**：恢复时，整个消息历史被还原以维护上下文
>   3. **工具状态**：之前对话中的工具使用和结果被保留
>   4. **上下文恢复**：对话恢复时所有之前的上下文保持不变

***

## 使用 Git Worktree 运行并行 CSC 会话

同时处理多个任务时，你需要每个 CSC 会话都有自己的代码库副本，这样更改就不会冲突。Git worktree 通过创建单独的工作目录来解决这个问题，每个目录都有自己的文件和分支，同时共享相同的仓库历史和远程连接。这意味着你可以让 CSC 在一个 worktree 中开发功能，同时在另一个 worktree 中修复 Bug，两个会话互不干扰。

使用 `--worktree`（`-w`）标志创建一个隔离的 worktree 并在其中启动 CSC。你传递的值成为 worktree 目录名称和分支名称：

```bash
# 在名为"feature-auth"的 worktree 中启动 CSC
# 创建 .claude/worktrees/feature-auth/ 和一个新分支
csc --worktree feature-auth

# 在另一个独立的 worktree 中启动另一个会话
csc --worktree bugfix-123
```

如果省略名称，CSC 会自动生成一个随机名称：

```bash
# 自动生成类似"bright-running-fox"的名称
csc --worktree
```

Worktree 创建在 `<repo>/.claude/worktrees/<name>`，并从默认远程分支（即 `origin/HEAD` 指向的位置）分出。Worktree 分支命名为 `worktree-<name>`。

基础分支无法通过 CSC 标志或设置进行配置。`origin/HEAD` 是存储在本地 `.git` 目录中的引用，Git 在你克隆时设置一次。如果仓库的默认分支后来在 GitHub 或 GitLab 上更改了，你本地的 `origin/HEAD` 仍然指向旧的，worktree 将从那里分出。要将本地引用与远程当前认为的默认值重新同步：

```bash
git remote set-head origin -a
```

这是一个标准的 Git 命令，只更新你本地的 `.git` 目录。远程服务器上的任何内容都不会更改。如果你希望 worktree 基于特定分支而不是远程默认分支，请使用 `git remote set-head origin your-branch-name` 显式设置。

要完全控制 worktree 的创建方式，包括为每次调用选择不同的基础，请配置 WorktreeCreate hook。该 hook 完全替换了 CSC 的默认 `git worktree` 逻辑，因此你可以从任何你需要的 ref 获取和分出。

你还可以在会话中要求 CSC"在 worktree 中工作"或"启动一个 worktree"，它会自动创建一个。

### 子代理 Worktree

子代理也可以使用 worktree 隔离来并行工作而不产生冲突。要求 CSC"为你的代理使用 worktree"，或通过在自定义子代理的 frontmatter 中添加 `isolation: worktree` 来配置它。每个子代理都有自己的 worktree，在子代理完成且没有更改时自动清理。

### Worktree 清理

当你退出 worktree 会话时，CSC 根据你是否进行了更改来处理清理：

* **没有更改**：worktree 及其分支会自动删除
* **存在更改或提交**：CSC 提示你保留或删除 worktree。保留会保留目录和分支，以便你稍后返回。删除会删除 worktree 目录及其分支，丢弃所有未提交的更改和提交

因崩溃或中断的并行运行而成为孤立的子代理 worktree，一旦超过你的 `cleanupPeriodDays` 设置的时间，会在启动时自动删除，前提是它们没有未提交的更改、未跟踪的文件和未推送的提交。你使用 `--worktree` 创建的 worktree 永远不会被此清理删除。

要在 CSC 会话之外清理 worktree，请使用手动 worktree 管理。

> **💡 提示：** 将 `.claude/worktrees/` 添加到你的 `.gitignore` 中，以防止 worktree 内容作为未跟踪文件出现在你的主仓库中。

### 将 gitignored 文件复制到 Worktree

Git worktree 是全新的检出，因此它们不包含主仓库中的 `.env` 或 `.env.local` 等未跟踪文件。要在 CSC 创建 worktree 时自动复制这些文件，请在项目根目录中添加一个 `.worktreeinclude` 文件。

该文件使用 `.gitignore` 语法列出要复制的文件。只有匹配模式且同时被 gitignore 的文件才会被复制，因此被跟踪的文件永远不会被复制。

```text .worktreeinclude
.env
.env.local
config/secrets.json
```

这适用于使用 `--worktree` 创建的 worktree、子代理 worktree 以及桌面应用中的并行会话。

### 手动管理 Worktree

要更好地控制 worktree 位置和分支配置，请直接使用 Git 创建 worktree。当你需要检出特定的现有分支或将 worktree 放在仓库之外时，这很有用。

```bash
# 创建带有新分支的 worktree
git worktree add ../project-feature-a -b feature-a

# 创建带有现有分支的 worktree
git worktree add ../project-bugfix bugfix-123

# 在 worktree 中启动 CSC
cd ../project-feature-a && csc

# 完成后清理
git worktree list
git worktree remove ../project-feature-a
```

在官方 Git worktree 文档中了解更多信息。

> **💡 提示：** 记住根据你的项目设置在每个新 worktree 中初始化你的开发环境。根据你的技术栈，这可能包括运行依赖安装（`npm install`、`yarn`）、设置虚拟环境或遵循项目的标准设置流程。

### 非 Git 版本控制

Worktree 隔离默认与 git 一起使用。对于其他版本控制系统（如 SVN、Perforce 或 Mercurial），请配置 WorktreeCreate 和 WorktreeRemove hook 以提供自定义的 worktree 创建和清理逻辑。配置后，当你使用 `--worktree` 时，这些 hook 会替换默认的 git 行为，因此 `.worktreeinclude` 不会被处理。请在你的 hook 脚本中复制任何本地配置文件。

有关并行会话的自动协调（包括共享任务和消息传递），请参阅代理团队。

***

## 当 CSC 需要你注意时获取通知

当你启动一个长时间运行的任务并切换到另一个窗口时，你可以设置桌面通知，这样你就知道 CSC 何时完成或需要你的输入。这使用 `Notification` hook 事件，每当 CSC 等待权限、空闲并等待新提示或完成认证时触发。

1. **将 hook 添加到你的设置中**

    打开 `~/.claude/settings.json` 并添加一个调用你平台原生通知命令的 `Notification` hook：

    ### macOS

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

    ### Linux

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

    ### Windows

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

    如果你的设置文件已经有 `hooks` 键，请将 `Notification` 条目合并到其中，而不是覆盖。你还可以通过在 CLI 中描述你想要的内容来让 CSC 为你编写 hook。

2. **可选：缩小匹配器范围**

    默认情况下，hook 在所有通知类型上触发。要仅针对特定事件触发，请将 `matcher` 字段设置为以下值之一：

    | 匹配器              | 触发时机                                      |
    | :------------------- | :---------------------------------------------- |
    | `permission_prompt`  | CSC 需要你批准工具使用          |
    | `idle_prompt`        | CSC 已完成并等待你的下一个提示 |
    | `auth_success`       | 认证完成                        |
    | `elicitation_dialog` | CSC 正在向你提问                 |

3. **验证 hook**

    输入 `/hooks` 并选择 `Notification` 以确认 hook 出现。选择它会显示将要运行的命令。要进行端到端测试，请让 CSC 运行一个需要权限的命令并切换离开终端，或让 CSC 直接触发通知。

有关完整的事件架构和通知类型，请参阅 Notification 参考。

***

## 将 CSC 用作 Unix 风格的工具

### 将 CSC 添加到你的验证流程

假设你想将 CSC 用作代码检查器或代码审查工具。

**将 CSC 添加到你的构建脚本：**

```json
// package.json
{
    ...
    "scripts": {
        ...
        "lint:csc": "csc -p 'you are a linter. please look at the changes vs. main and report any issues related to typos. report the filename and line number on one line, and a description of the issue on the second line. do not return any other text.'"
    }
}
```

> **💡 提示：**
>
> * 在你的 CI/CD 流水线中使用 CSC 进行自动化代码审查
> * 自定义提示以检查与你项目相关的特定问题
> * 考虑为不同类型的验证创建多个脚本

### 管道输入，管道输出

假设你想将数据管道输入到 CSC，并以结构化格式获取返回数据。

**通过 CSC 管道传输数据：**

```bash
cat build-error.txt | csc -p 'concisely explain the root cause of this build error' > output.txt
```

> **💡 提示：**
>
> * 使用管道将 CSC 集成到现有的 shell 脚本中
> * 与其他 Unix 工具组合以实现强大的工作流
> * 考虑使用 `--output-format` 进行结构化输出

### 控制输出格式

假设你需要 CSC 以特定格式输出，特别是在将 CSC 集成到脚本或其他工具时。

1. **使用文本格式（默认）**

    ```bash
    cat data.txt | csc -p 'summarize this data' --output-format text > summary.txt
    ```

    这仅输出 CSC 的纯文本响应（默认行为）。

2. **使用 JSON 格式**

    ```bash
    cat code.py | csc -p 'analyze this code for bugs' --output-format json > analysis.json
    ```

    这输出一个包含元数据（包括成本和持续时间）的消息 JSON 数组。

3. **使用流式 JSON 格式**

    ```bash
    cat log.txt | csc -p 'parse this log file for errors' --output-format stream-json
    ```

    这在 CSC 处理请求时实时输出一系列 JSON 对象。每条消息都是一个有效的 JSON 对象，但如果串联起来，整个输出不是有效的 JSON。

> **💡 提示：**
>
> * 使用 `--output-format text` 进行简单集成，只需要 CSC 的响应
> * 使用 `--output-format json` 当你需要完整的对话日志时
> * 使用 `--output-format stream-json` 进行每个对话轮次的实时输出

***

## 按计划运行 CSC

假设你想让 CSC 自动定期处理任务，比如每天早上审查开放的 PR、每周审计依赖项或夜间检查 CI 失败。

根据你希望任务运行的位置选择调度选项：

| 选项                                                 | 运行位置                     | 最适合                                                                                                      |
| :----------------------------------------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| 云端计划任务       | Anthropic 管理的基础设施  | 即使你的计算机关闭也应该运行的任务。在 claude.ai/code 配置。  |
| 桌面计划任务 | 你的机器，通过桌面应用 | 需要直接访问本地文件、工具或未提交更改的任务。                                  |
| GitHub Actions                   | 你的 CI 流水线                  | 与仓库事件（如打开的 PR）或应该与你的工作流配置一起存在的 cron 计划绑定的任务。 |
| `/loop`                         | 当前 CLI 会话           | 会话打开时的快速轮询。退出时任务被取消。                                     |

> **💡 提示：** 在为计划任务编写提示时，要明确说明成功是什么样的以及如何处理结果。任务自主运行，因此它无法提出澄清问题。例如："审查标记为 `needs-review` 的开放 PR，对任何问题留下行内评论，并在 `#eng-reviews` Slack 频道中发布摘要。"

***

## 向 CSC 询问其能力

CSC 内置了对其文档的访问，可以回答有关其自身功能和限制的问题。

### 示例问题

```text
CSC 可以创建 Pull Request 吗？
```

```text
CSC 如何处理权限？
```

```text
有哪些技能可用？
```

```text
如何在 CSC 中使用 MCP？
```

```text
如何为 Amazon Bedrock 配置 CSC？
```

```text
CSC 有哪些限制？
```

> **注意：** CSC 基于文档回答这些问题。如需实践演示，请运行 `/powerup` 获取带有动画演示的交互式课程，或参考上面的特定工作流部分。

> **💡 提示：**
>
> * CSC 始终可以访问最新的 CSC 文档，无论你使用的是哪个版本
> * 提出具体问题以获得详细答案
> * CSC 可以解释复杂的功能，如 MCP 集成、企业配置和高级工作流

