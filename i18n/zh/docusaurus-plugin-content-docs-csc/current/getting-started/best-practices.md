---
sidebar_position: 7
---

# CSC 最佳实践

> 从配置环境到跨并行会话扩展，帮助你充分利用 CSC 的技巧和模式。

CSC 是一个代理式编码环境。与等待提问的聊天机器人不同，CSC 可以读取你的文件、运行命令、进行修改，并自主解决问题——你可以旁观、重定向，或者完全离开。

这改变了你的工作方式。你不再自己编写代码然后让 CSC 审查，而是描述你想要什么，CSC 会想出如何构建它。CSC 负责探索、规划和实现。

但这种自主性仍然需要学习曲线。CSC 在某些约束下工作，你需要理解这些约束。

***

大多数最佳实践都基于一个约束：CSC 的上下文窗口会很快填满，并且随着填满性能会下降。

CSC 的上下文窗口保存你的整个对话，包括每条消息、CSC 读取的每个文件以及每个命令输出。然而，这可能会很快填满。一次调试会话或代码库探索可能会生成和消耗数万个 token。

这很重要，因为 LLM 的性能会随着上下文填满而下降。当上下文窗口快要满时，CSC 可能开始"忘记"之前的指令或犯更多错误。上下文窗口是需要管理的最重要资源。要了解会话在实践中是如何填满的，可以观看关于启动时加载内容和每次文件读取成本的交互式演示。使用自定义状态行持续跟踪上下文使用情况，并参阅减少 token 使用量了解减少 token 使用的策略。

***

## 给 CSC 验证其工作的方法

> **💡 提示：** 包含测试、截图或预期输出，让 CSC 可以自我检查。这是你能做的最高杠杆的事情。

当 CSC 能够验证自己的工作时，例如运行测试、比较截图和验证输出，它的表现会显著提升。

没有明确的成功标准，它可能会生成看起来正确但实际上不起作用的东西。你成为唯一的反馈循环，每个错误都需要你的关注。

| 策略 | 之前 | 之后 |
| --- | --- | --- |
| **提供验证标准** | *"实现一个验证电子邮件地址的函数"* | *"编写一个 validateEmail 函数。示例测试用例：user@example.com 为 true，invalid 为 false，user@.com 为 false。实现后运行测试"* |
| **可视化验证 UI 更改** | *"让仪表板看起来更好"* *"\[粘贴截图] 实现这个设计。截取结果截图并与原始截图比较。列出差异并修复"* | |
| **解决根本原因，而非症状** | *"构建失败了"* | *"构建失败，错误信息如下：\[粘贴错误]。修复它并验证构建成功。解决根本原因，不要抑制错误"* |

UI 更改可以使用 Chrome 扩展中的 CSC 进行验证。它会在浏览器中打开新标签页，测试 UI，并迭代直到代码正常工作。

你的验证也可以是测试套件、linter 或检查输出的 Bash 命令。投入精力让你的验证坚如磐石。

***

## 先探索，再规划，最后编码

> **💡 提示：** 将研究和规划与实现分开，避免解决错误的问题。

让 CSC 直接编码可能会生成解决错误问题的代码。使用计划模式将探索与执行分开。

推荐的工作流程有四个阶段：

### 探索

进入计划模式。CSC 读取文件并回答问题，不进行修改。

```txt csc (Plan Mode)
read /src/auth and understand how we handle sessions and login.
also look at how we manage environment variables for secrets.
```

### 规划

让 CSC 创建详细的实现计划。

```txt csc (Plan Mode)
I want to add Google OAuth. What files need to change?
What's the session flow? Create a plan.
```

按 `Ctrl+G` 在文本编辑器中打开计划，在 CSC 继续之前直接编辑。

### 实现

切换回普通模式，让 CSC 按照计划编码。

```txt csc (Normal Mode)
implement the OAuth flow from your plan. write tests for the
callback handler, run the test suite and fix any failures.
```

### 提交

让 CSC 用描述性消息提交并创建 PR。

```txt csc (Normal Mode)
commit with a descriptive message and open a PR
```

> **注意：** 计划模式很有用，但也会增加开销。对于范围明确且修复较小的任务（如修复拼写错误、添加日志行或重命名变量），直接让 CSC 执行即可。当你对方法不确定、更改涉及多个文件或你不熟悉要修改的代码时，规划最有用。如果你能用一句话描述 diff，就跳过规划。

***

## 在提示中提供具体上下文

> **💡 提示：** 指令越精确，需要的纠正就越少。

CSC 可以推断意图，但不能读懂你的心思。引用具体文件、提及约束并指向示例模式。

| 策略 | 之前 | 之后 |
| --- | --- | --- |
| **限定任务范围。** 指定哪个文件、什么场景和测试偏好。 | *"为 foo.py 添加测试"* | *"为 foo.py 编写测试，覆盖用户已登出的边缘情况。避免使用 mock。"* |
| **指向来源。** 引导 CSC 到可以回答问题的来源。 | *"为什么 ExecutionFactory 的 API 这么奇怪？"* | *"查看 ExecutionFactory 的 git 历史并总结其 API 是如何形成的"* |
| **引用现有模式。** 指向代码库中的模式。 | *"添加日历小部件"* | *"查看主页上现有小部件的实现方式以了解模式。HotDogWidget.php 是个好例子。按照该模式实现一个新的日历小部件，让用户选择月份并前后翻页选择年份。从头开始构建，不使用代码库中已用库之外的其他库。"* |
| **描述症状。** 提供症状、可能的位置以及"修复后"的样子。 | *"修复登录 bug"* | *"用户报告会话超时后登录失败。检查 src/auth/ 中的认证流程，特别是 token 刷新。编写一个重现问题的失败测试，然后修复它"* |

模糊的提示在你探索且可以承受纠错成本时是有用的。像 `"你会改进这个文件的什么？"` 这样的提示可以发现你没想到要问的事情。

### 提供丰富内容

> **💡 提示：** 使用 `@` 引用文件、粘贴截图/图片或直接管道数据。

你可以通过多种方式向 CSC 提供丰富的数据：

* **使用 `@` 引用文件**，而不是描述代码在哪里。CSC 在响应前会读取文件。
* **直接粘贴图片**。复制/粘贴或将图片拖放到提示中。
* **提供 URL** 用于文档和 API 参考。使用 `/permissions` 将常用域名加入白名单。
* **通过管道传入数据**，运行 `cat error.log | csc` 直接发送文件内容。
* **让 CSC 自行获取所需内容**。告诉 CSC 使用 Bash 命令、MCP 工具或读取文件来获取上下文。

***

## 配置你的环境

一些设置步骤可以让 CSC 在你所有会话中更高效。关于扩展功能及何时使用每个功能的完整概述，请参阅扩展 CSC。

### 编写有效的 CLAUDE.md

> **💡 提示：** 运行 `/init` 根据当前项目结构生成一个 CLAUDE.md 起始文件，然后随时间逐步完善。

CLAUDE.md 是 CSC 在每次对话开始时读取的特殊文件。包含 Bash 命令、代码风格和工作流规则。这为 CSC 提供了仅从代码中无法推断的持久上下文。

`/init` 命令分析你的代码库以检测构建系统、测试框架和代码模式，为你提供完善的基础。

CLAUDE.md 文件没有必需的格式，但保持简短且人类可读。例如：

```markdown CLAUDE.md
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

CLAUDE.md 在每次会话中都会加载，所以只包含广泛适用的内容。对于仅有时相关的领域知识或工作流，请改用Skills。CSC 按需加载它们，不会使每次对话膨胀。

保持简洁。对于每一行，问自己：*"删除这行会导致 CSC 犯错吗？"* 如果不会，就删掉它。臃肿的 CLAUDE.md 文件会导致 CSC 忽略你的实际指令！

| ✅ 包含 | ❌ 排除 |
| --- | --- |
| CSC 无法猜到的 Bash 命令 | CSC 通过阅读代码就能搞清楚的内容 |
| 与默认不同的代码风格规则 | CSC 已经知道的标准语言惯例 |
| 测试指令和首选测试运行器 | 详细的 API 文档（改为链接到文档） |
| 仓库规范（分支命名、PR 惯例） | 频繁变更的信息 |
| 项目特定的架构决策 | 冗长的解释或教程 |
| 开发环境特性（必需的环境变量） | 逐文件的代码库描述 |
| 常见的陷阱或不明显的行为 | 不言而喻的做法，如"编写干净的代码" |

如果 CSC 尽管有规则仍然不断做你不想做的事，文件可能太长了，规则被淹没了。如果 CSC 问你的问题在 CLAUDE.md 中有答案，措辞可能有歧义。像对待代码一样对待 CLAUDE.md：出问题时审查它，定期修剪，通过观察 CSC 的行为是否真的改变来测试修改。

你可以通过添加强调（例如 "IMPORTANT" 或 "YOU MUST"）来调整指令以提高遵守度。将 CLAUDE.md 提交到 git，这样你的团队可以贡献。这个文件的价值会随时间复利增长。

CLAUDE.md 文件可以使用 `@path/to/import` 语法导入其他文件：

```markdown CLAUDE.md
See @README.md for project overview and @package.json for available npm commands.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

你可以在多个位置放置 CLAUDE.md 文件：

* **主文件夹 (`~/.claude/CLAUDE.md`)**：适用于所有 CSC 会话
* **项目根目录 (`./CLAUDE.md`)**：提交到 git 与团队共享
* **项目根目录 (`./CLAUDE.local.md`)**：个人项目特定备注；将此文件添加到 `.gitignore` 以便不与团队共享
* **父目录**：适用于 monorepo，`root/CLAUDE.md` 和 `root/foo/CLAUDE.md` 都会自动加载
* **子目录**：CSC 在处理这些目录中的文件时按需加载子目录的 CLAUDE.md 文件

### 配置权限

> **💡 提示：** 使用自动模式让分类器处理审批，使用 `/permissions` 将特定命令加入白名单，或使用 `/sandbox` 进行操作系统级隔离。每种方式都减少了中断，同时让你保持控制。

默认情况下，CSC 对可能修改系统的操作请求许可：文件写入、Bash 命令、MCP 工具等。这很安全但繁琐。第十次审批后你不再真正审查，只是在点通过。有三种方式可以减少这些中断：

* **自动模式**：一个独立的分类器模型审查命令，仅阻止看起来有风险的操作：范围升级、未知基础设施或恶意内容驱动的操作。当你信任任务的大方向但不想每步都点击时最合适
* **权限白名单**：允许你已知安全的特定工具，如 `npm run lint` 或 `git commit`
* **沙箱**：启用操作系统级隔离，限制文件系统和网络访问，允许 CSC 在定义的边界内更自由地工作

了解更多关于权限模式、权限规则和沙箱的信息。

### 使用 CLI 工具

> **💡 提示：** 让 CSC 在与外部服务交互时使用 CLI 工具，如 `gh`、`aws`、`gcloud` 和 `sentry-cli`。

CLI 工具是与外部服务交互的最高上下文效率方式。如果你使用 GitHub，安装 `gh` CLI。CSC 知道如何使用它来创建 issue、打开 pull request 和阅读评论。没有 `gh`，CSC 仍然可以使用 GitHub API，但未经身份验证的请求经常会达到速率限制。

CSC 也擅长学习它还不了解的 CLI 工具。尝试这样的提示：`Use 'foo-cli-tool --help' to learn about foo tool, then use it to solve A, B, C.`

### 连接 MCP 服务器

> **💡 提示：** 运行 `csc mcp add` 连接外部工具，如 Notion、Figma 或你的数据库。

通过 MCP 服务器，你可以让 CSC 从问题跟踪器实现功能、查询数据库、分析监控数据、从 Figma 集成设计以及自动化工作流。

### 设置Hooks

> **💡 提示：** 使用Hooks处理每次必须执行且无例外的操作。

Hooks在 CSC 工作流的特定点自动运行脚本。与 CLAUDE.md 指令（是建议性的）不同，Hooks是确定性的，保证操作会执行。

CSC 可以为你编写Hooks。尝试这样的提示：*"编写一个在每次文件编辑后运行 eslint 的Hooks"* 或 *"编写一个阻止写入 migrations 文件夹的Hooks。"* 直接编辑 `.claude/settings.json` 来手动配置Hooks，运行 `/hooks` 浏览已配置的内容。

### 创建Skills

> **💡 提示：** 在 `.claude/skills/` 中创建 `SKILL.md` 文件，为 CSC 提供领域知识和可重用的工作流。

Skills扩展了 CSC 的知识，添加了特定于你的项目、团队或领域的信息。CSC 在相关时自动应用它们，或者你可以用 `/skill-name` 直接调用。

通过在 `.claude/skills/` 中添加包含 `SKILL.md` 的目录来创建Skills：

```markdown .claude/skills/api-conventions/SKILL.md
---
name: api-conventions
description: REST API design conventions for our services
---
# API Conventions
- Use kebab-case for URL paths
- Use camelCase for JSON properties
- Always include pagination for list endpoints
- Version APIs in the URL path (/v1/, /v2/)
```

Skills也可以定义你直接调用的可重复工作流：

```markdown .claude/skills/fix-issue/SKILL.md
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---
Analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR
```

运行 `/fix-issue 1234` 来调用它。对于有副作用且你希望手动触发的工作流，使用 `disable-model-invocation: true`。

### 创建自定义Subagents

> **💡 提示：** 在 `.claude/agents/` 中定义专门的助手，CSC 可以将隔离任务委托给它们。

Subagents在自己的上下文中运行，拥有自己的一组允许工具。它们适用于读取许多文件或需要专门关注而不使主对话混乱的任务。

```markdown .claude/agents/security-reviewer.md
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer. Review code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Secrets or credentials in code
- Insecure data handling

Provide specific line references and suggested fixes.
```

明确告诉 CSC 使用Subagents：*"使用Subagents审查此代码的安全问题。"*

### 安装Plugins

> **💡 提示：** 运行 `/plugin` 浏览市场。Plugins无需配置即可添加Skills、工具和集成。

Plugins将Skills、Hooks、Subagents和 MCP 服务器打包为来自社区和 Anthropic 的单一可安装单元。如果你使用类型化语言，安装代码智能Plugins，为 CSC 提供精确的符号导航和编辑后的自动错误检测。

关于在Skills、Subagents、Hooks和 MCP 之间选择的指导，请参阅扩展 CSC。

***

## 有效沟通

你与 CSC 沟通的方式显著影响结果质量。

### 询问代码库问题

> **💡 提示：** 向 CSC 提问你会问高级工程师的问题。

在加入新代码库时，使用 CSC 进行学习和探索。你可以向 CSC 提问与其他工程师相同的问题：

* 日志是如何工作的？
* 如何创建新的 API 端点？
* `foo.rs` 第 134 行的 `async move { ... }` 做什么？
* `CustomerOnboardingFlowImpl` 处理哪些边缘情况？
* 为什么这段代码在第 333 行调用 `foo()` 而不是 `bar()`？

以这种方式使用 CSC 是一个有效的入职工作流，可以缩短上手时间并减少其他工程师的负担。无需特殊提示：直接提问即可。

### 让 CSC 采访你

> **💡 提示：** 对于较大的功能，先让 CSC 采访你。从一个最小的提示开始，让 CSC 使用 `AskUserQuestion` 工具采访你。

CSC 会问你可能还没考虑到的事情，包括技术实现、UI/UX、边缘情况和权衡。

```text
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs. Don't ask obvious questions, dig into the hard parts I might not have considered.

Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```

规格完成后，开始一个新会话来执行它。新会话有专注于实现的干净上下文，你还有书面规格可以参考。

***

## 管理你的会话

对话是持久且可逆的。善加利用！

### 尽早且经常纠正方向

> **💡 提示：** 一旦发现 CSC 偏离轨道就立即纠正。

最好的结果来自紧密的反馈循环。虽然 CSC 偶尔能在第一次尝试中完美解决问题，但快速纠正通常能更快地产生更好的解决方案。

* **`Esc`**：用 `Esc` 键中途停止 CSC。上下文会保留，所以你可以重定向。
* **`Esc + Esc` 或 `/rewind`**：按两次 `Esc` 或运行 `/rewind` 打开回退菜单，恢复之前的对话和代码状态，或从选定消息开始摘要。
* **`"撤销那个"`**：让 CSC 撤销其更改。
* **`/clear`**：在不相关的任务之间重置上下文。包含不相关上下文的长会话可能降低性能。

如果你在一个会话中对同一问题纠正了 CSC 两次以上，上下文已被失败的方法污染。运行 `/clear` 并用包含你所学内容的更具体提示重新开始。带有更好提示的干净会话几乎总是优于带有累积纠正的长会话。

### 积极管理上下文

> **💡 提示：** 在不相关的任务之间运行 `/clear` 重置上下文。

当你接近上下文限制时，CSC 会自动压缩对话历史，保留重要的代码和决策同时释放空间。

在长会话中，CSC 的上下文窗口可能充满了不相关的对话、文件内容和命令。这可能降低性能，有时会分散 CSC 的注意力。

* 在任务之间频繁使用 `/clear` 完全重置上下文窗口
* 当自动压缩触发时，CSC 会总结最重要的内容，包括代码模式、文件状态和关键决策
* 要更多控制，运行 `/compact <指令>`，如 `/compact Focus on the API changes`
* 要仅压缩对话的一部分，使用 `Esc + Esc` 或 `/rewind`，选择一个消息检查点，然后选择**从此处摘要**。这会压缩从该点向前的消息，同时保持之前的上下文完整
* 在 CLAUDE.md 中自定义压缩行为，使用如 `"When compacting, always preserve the full list of modified files and any test commands"` 的指令，确保关键上下文在摘要后保留
* 对于不需要留在上下文中的快速问题，使用 `/btw`。答案出现在可关闭的覆盖层中，从不进入对话历史，因此你可以在不增加上下文的情况下查看细节。

### 使用Subagents进行调查

> **💡 提示：** 用 `"use subagents to investigate X"` 委托研究。它们在独立的上下文中探索，保持你的主对话干净用于实现。

由于上下文是你的基本约束，Subagents是最强大的可用工具之一。当 CSC 研究代码库时，它会读取大量文件，所有这些都会消耗你的上下文。Subagents在独立的上下文窗口中运行并返回摘要：

```text
Use subagents to investigate how our authentication system handles token
refresh, and whether we have any existing OAuth utilities I should reuse.
```

Subagents探索代码库，读取相关文件，并返回发现结果，所有这些都不会使你的主对话混乱。

你还可以在 CSC 实现某些内容后使用Subagents进行验证：

```text
use a subagent to review this code for edge cases
```

### 使用检查点回退

> **💡 提示：** CSC 的每个操作都会创建一个检查点。你可以将对话、代码或两者恢复到任何之前的检查点。

CSC 在更改前自动创建检查点。双击 `Escape` 或运行 `/rewind` 打开回退菜单。你可以仅恢复对话、仅恢复代码、恢复两者，或从选定消息开始摘要。详情请参阅检查点。

你可以告诉 CSC 尝试一些有风险的事情，而不是仔细规划每一步。如果不起作用，回退并尝试不同的方法。检查点跨会话持久存在，所以你可以关闭终端并稍后仍然回退。

> **⚠️ 警告：** 检查点仅跟踪*CSC 所做的更改*，而非外部进程。这不能替代 git。

### 恢复对话

> **💡 提示：** 运行 `csc --continue` 从上次离开的地方继续，或 `--resume` 从最近的会话中选择。

CSC 在本地保存对话。当任务跨越多个会话时，你不必重新解释上下文：

```bash
csc --continue    # Resume the most recent conversation
csc --resume      # Select from recent conversations
```

使用 `/rename` 为会话指定描述性名称，如 `"oauth-migration"` 或 `"debugging-memory-leak"`，以便日后查找。像对待分支一样对待会话：不同的工作流可以有独立的、持久的上下文。

***

## 自动化和扩展

一旦你在一个 CSC 中变得高效，就可以通过并行会话、非交互模式和扇出模式来倍增你的产出。

到目前为止的一切都假设一个人、一个 CSC 和一个对话。但 CSC 可以水平扩展。本节的技术展示了你如何完成更多工作。

### 运行非交互模式

> **💡 提示：** 在 CI、预提交Hooks或脚本中使用 `csc -p "prompt"`。添加 `--output-format stream-json` 获取流式 JSON 输出。

使用 `csc -p "your prompt"`，你可以在没有会话的情况下非交互式运行 CSC。非交互模式是你将 CSC 集成到 CI 管道、预提交Hooks或任何自动化工作流的方式。输出格式让你可以编程方式解析结果：纯文本、JSON 或流式 JSON。

```bash
# One-off queries
csc -p "Explain what this project does"

# Structured output for scripts
csc -p "List all API endpoints" --output-format json

# Streaming for real-time processing
csc -p "Analyze this log file" --output-format stream-json
```

### 运行多个 CSC 会话

> **💡 提示：** 并行运行多个 CSC 会话以加速开发、运行隔离实验或启动复杂工作流。

运行并行会话有三种主要方式：

* CSC 桌面应用：可视化地管理多个本地会话。每个会话都有自己的隔离工作树。
* Web 上的 CSC：在 Anthropic 的安全云基础设施上的隔离 VM 中运行。
* Agent teams：多个会话的自动协调，具有共享任务、消息和团队负责人。

除了并行化工作，多个会话还支持注重质量的工作流。新鲜的上下文改善了代码审查，因为 CSC 不会对它刚写的代码产生偏见。

例如，使用编写者/审查者模式：

| 会话 A（编写者） | 会话 B（审查者） |
| --- | --- |
| `Implement a rate limiter for our API endpoints` | |
| | `Review the rate limiter implementation in @src/middleware/rateLimiter.ts. Look for edge cases, race conditions, and consistency with our existing middleware patterns.` |
| `Here's the review feedback: [Session B output]. Address these issues.` | |

你可以用测试做类似的事情：让一个 CSC 编写测试，然后另一个编写代码来通过测试。

### 跨文件扇出

> **💡 提示：** 循环任务为每个调用 `csc -p`。使用 `--allowedTools` 为批量操作限定权限。

对于大型迁移或分析，你可以将工作分配到许多并行的 CSC 调用：

### 生成任务列表

让 CSC 列出所有需要迁移的文件（例如，`list all 2,000 Python files that need migrating`）

### 编写循环遍历列表的脚本

```bash
for file in $(cat files.txt); do
  csc -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```

### 在几个文件上测试，然后大规模运行

根据前 2-3 个文件出现的问题优化你的提示，然后在完整集合上运行。`--allowedTools` 标志限制了 CSC 可以做的事情，这在无人值守运行时很重要。

你还可以将 CSC 集成到现有的数据/处理管道中：

```bash
csc -p "<your prompt>" --output-format json | your_command
```

在开发期间使用 `--verbose` 进行调试，在生产中关闭它。

### 使用自动模式自主运行

对于带有后台安全检查的不间断执行，使用自动模式。分类器模型在命令运行前审查它们，阻止范围升级、未知基础设施和恶意内容驱动的操作，同时让常规工作无需提示即可继续。

```bash
csc --permission-mode auto -p "fix all lint errors"
```

对于使用 `-p` 标志的非交互运行，如果分类器反复阻止操作，自动模式会中止，因为没有用户可以回退。请参阅自动模式何时回退了解阈值。

***

## 避免常见失败模式

这些是常见的错误。及早识别它们可以节省时间：

* **大杂烩会话。** 你从一个任务开始，然后问 CSC 一些不相关的事情，然后回到第一个任务。上下文充满了不相关的信息。
  > **修复**：在不相关的任务之间使用 `/clear`。
* **反复纠正。** CSC 做错了，你纠正它，还是错的，你再纠正。上下文被失败的方法污染了。
  > **修复**：两次纠正失败后，`/clear` 并写一个包含所学内容的更好的初始提示。
* **过度指定的 CLAUDE.md。** 如果你的 CLAUDE.md 太长，CSC 会忽略其中一半，因为重要规则被噪音淹没。
  > **修复**：无情地修剪。如果 CSC 已经在没有指令的情况下正确做了某事，删除它或转换为Hooks。
* **信任然后验证的差距。** CSC 生成了一个看起来合理但不能处理边缘情况的实现。
  > **修复**：始终提供验证（测试、脚本、截图）。如果你无法验证它，就不要发布它。
* **无限探索。** 你让 CSC "调查"某事而没有限定范围。CSC 读取数百个文件，填满了上下文。
  > **修复**：窄范围调查或使用Subagents，这样探索不会消耗你的主上下文。

***

## 培养你的直觉

本指南中的模式不是一成不变的。它们是通常效果很好的起点，但可能不适用于每种情况。

有时你*应该*让上下文积累，因为你深入一个复杂问题，历史是有价值的。有时你应该跳过规划让 CSC 自己解决，因为任务是探索性的。有时模糊的提示恰好是对的，因为你想看看 CSC 如何在约束之前解释问题。

注意什么有效。当 CSC 产生出色的输出时，注意你做了什么：提示结构、你提供的上下文、你处于的模式。当 CSC 遇到困难时，问为什么。上下文太嘈杂？提示太模糊？任务太大无法一次完成？

随着时间的推移，你会培养出任何指南都无法捕捉的直觉。你会知道什么时候该具体，什么时候该开放，什么时候该规划，什么时候该探索，什么时候该清除上下文，什么时候该让它积累。
