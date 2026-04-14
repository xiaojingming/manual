---
sidebar_position: 3
---

# 使用Skills扩展 CSC

> 创建、管理和共享Skills以扩展 CSC 中的能力。包括自定义命令和内置Skills。

Skills扩展了 CSC 的能力。创建一个包含指令的 `SKILL.md` 文件，CSC 会将其添加到工具集中。CSC 会在相关时使用Skills，或者你可以通过 `/skill-name` 直接调用。

当你不断将相同的操作手册、检查清单或多步骤流程粘贴到聊天中，或者当 CLAUDE.md 的某个部分已经从事实描述变成了操作流程时，就该创建一个Skills了。与 CLAUDE.md 的内容不同，Skills的主体只在被使用时才加载，因此长篇参考材料在你需要之前几乎不消耗任何资源。

> **注意：** 对于内置命令（如 `/help` 和 `/compact`）以及内置Skills（如 `/debug` 和 `/simplify`），请参阅命令参考。
>
> **自定义命令已合并到Skills中。** `.claude/commands/deploy.md` 处的文件和 `.claude/skills/deploy/SKILL.md` 处的Skills都会创建 `/deploy` 并且工作方式相同。你现有的 `.claude/commands/` 文件继续有效。Skills增加了可选功能：用于存放支持文件的目录、用于控制由你还是 CSC 调用的 frontmatter，以及 CSC 在相关时自动加载的能力。

CSC Skills遵循 Agent Skills 开放标准，该标准适用于多种 AI 工具。CSC 通过调用控制、Subagents执行和动态上下文注入等额外功能扩展了该标准。

## 内置Skills

CSC 包含一组在每次会话中都可用的内置Skills，包括 `/simplify`、`/batch`、`/debug`、`/loop` 和 `/claude-api`。与直接执行固定逻辑的内置命令不同，内置Skills是基于提示的：它们给 CSC 一份详细的操作手册，让它使用工具来编排工作。你可以像调用任何其他Skills一样调用它们，输入 `/` 后跟Skills名称。

内置Skills与内置命令一起列在命令参考中，在"用途"列中标记为 **Skill**。

## 入门指南

### 创建你的第一个Skills

此示例创建一个Skills，教 CSC 使用可视化图表和类比来解释代码。由于它使用默认的 frontmatter，CSC 可以在你询问某事物的工作原理时自动加载它，或者你可以通过 `/explain-code` 直接调用它。

### 创建Skills目录

为Skills在你的个人Skills文件夹中创建一个目录。个人Skills在所有项目中可用。

```bash
mkdir -p ~/.claude/skills/explain-code
```

### 编写 SKILL.md

每个Skills都需要一个 `SKILL.md` 文件，包含两部分：YAML frontmatter（在 `---` 标记之间），告诉 CSC 何时使用该Skills；以及 markdown 内容，包含 CSC 在Skills被调用时遵循的指令。`name` 字段成为 `/slash-command`，`description` 帮助 CSC 决定何时自动加载它。

创建 `~/.claude/skills/explain-code/SKILL.md`：

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
```

### 测试Skills

你可以通过两种方式测试：

**让 CSC 自动调用**，通过提问与描述匹配的问题：

```text
How does this code work?
```

**或者直接调用**，使用Skills名称：

```text
/explain-code src/auth/login.ts
```

无论哪种方式，CSC 都应该在解释中包含类比和 ASCII 图表。

### Skills存放位置

Skills的存储位置决定了谁可以使用它：

| 位置   | 路径                                    | 适用范围           |
| :----- | :-------------------------------------- | :----------------- |
| 企业级 | 参见托管设置                             | 组织中的所有用户   |
| 个人   | `~/.claude/skills/<skill-name>/SKILL.md` | 你的所有项目       |
| 项目   | `.claude/skills/<skill-name>/SKILL.md`   | 仅此项目           |
| Plugins   | `<plugin>/skills/<skill-name>/SKILL.md`  | 启用Plugins的范围内   |

当不同级别的Skills同名时，高优先级位置优先：企业级 > 个人 > 项目。PluginsSkills使用 `plugin-name:skill-name` 命名空间，因此不会与其他级别冲突。如果你在 `.claude/commands/` 中有文件，它们的工作方式相同，但如果Skills和命令同名，Skills优先。

#### 从嵌套目录自动发现

当你在子目录中处理文件时，CSC 会自动从嵌套的 `.claude/skills/` 目录中发现Skills。例如，如果你在 `packages/frontend/` 中编辑文件，CSC 也会在 `packages/frontend/.claude/skills/` 中查找Skills。这支持了各包拥有自己Skills的 monorepo 设置。

每个Skills是一个目录，以 `SKILL.md` 作为入口：

```text
my-skill/
├── SKILL.md           # 主要指令（必需）
├── template.md        # 供 CSC 填写的模板
├── examples/
│   └── sample.md      # 显示预期格式的示例输出
└── scripts/
    └── validate.sh    # CSC 可执行的脚本
```

`SKILL.md` 包含主要指令，是必需的。其他文件是可选的，让你构建更强大的Skills：供 CSC 填写的模板、显示预期格式的示例输出、CSC 可执行的脚本或详细的参考文档。从 `SKILL.md` 中引用这些文件，以便 CSC 知道它们包含什么以及何时加载它们。有关更多详细信息，请参阅添加支持文件。

> **注意：** `.claude/commands/` 中的文件仍然有效，并支持相同的 frontmatter。推荐使用Skills，因为它们支持支持文件等额外功能。

#### 来自额外目录的Skills

`--add-dir` 标志授予文件访问权限而非配置发现，但Skills是一个例外：额外目录中的 `.claude/skills/` 会被自动加载并被实时变更检测捕获，因此你可以在会话期间编辑这些Skills而无需重启。

其他 `.claude/` 配置（如Subagents、命令和输出样式）不会从额外目录加载。有关加载和不加载内容的完整列表以及跨项目共享配置的推荐方式，请参阅异常表。

> **注意：** 来自 `--add-dir` 目录的 CLAUDE.md 文件默认不加载。要加载它们，请设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`。请参阅从额外目录加载。

## 配置Skills

Skills通过 `SKILL.md` 顶部的 YAML frontmatter 和随后的 markdown 内容进行配置。

### Skills内容类型

Skills文件可以包含任何指令，但考虑你希望如何调用它们有助于指导应包含什么内容：

**参考内容**添加 CSC 应用于当前工作的知识。约定、模式、风格指南、领域知识。此内容以内联方式运行，以便 CSC 可以将其与你的对话上下文一起使用。

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

**任务内容**为 CSC 提供特定操作的分步指令，如部署、提交或代码生成。这些通常是你想通过 `/skill-name` 直接调用的操作，而不是让 CSC 决定何时运行。添加 `disable-model-invocation: true` 可防止 CSC 自动触发。

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

你的 `SKILL.md` 可以包含任何内容，但思考你希望Skills如何被调用（由你、由 CSC 或两者）以及你希望它在哪里运行（内联还是Subagents中）有助于指导应包含什么内容。对于复杂Skills，你还可以添加支持文件以保持主要Skills的焦点。

### Frontmatter 参考

除了 markdown 内容，你还可以使用 `SKILL.md` 文件顶部 `---` 标记之间的 YAML frontmatter 字段来配置Skills行为：

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read Grep
---

Your skill instructions here...
```

所有字段都是可选的。只推荐 `description`，以便 CSC 知道何时使用该Skills。

| 字段                        | 是否必需     | 描述                                                                                                                                                                                                                                                  |
| :-------------------------- | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                      | 否           | Skills的显示名称。如果省略，使用目录名。仅限小写字母、数字和连字符（最多 64 个字符）。                                                                                                                                                                  |
| `description`               | 推荐         | Skills的功能和使用时机。CSC 使用此字段决定何时应用该Skills。如果省略，使用 markdown 内容的第一段。将关键用例放在前面：超过 250 个字符的描述会在Skills列表中被截断以减少上下文使用量。                                                                        |
| `argument-hint`             | 否           | 自动完成期间显示的提示，指示预期的参数。例如：`[issue-number]` 或 `[filename] [format]`。                                                                                                                                                              |
| `disable-model-invocation`  | 否           | 设为 `true` 可防止 CSC 自动加载此Skills。用于你想要通过 `/name` 手动触发的工作流。默认值：`false`。                                                                                                                                                    |
| `user-invocable`            | 否           | 设为 `false` 可从 `/` 菜单中隐藏。用于用户不应直接调用的背景知识。默认值：`true`。                                                                                                                                                                    |
| `allowed-tools`             | 否           | 此Skills激活时 CSC 可以使用而无需请求许可的工具。接受空格分隔的字符串或 YAML 列表。                                                                                                                                                                     |
| `model`                     | 否           | 此Skills激活时使用的模型。                                                                                                                                                                                                                              |
| `effort`                    | 否           | 此Skills激活时的努力级别。覆盖会话努力级别。默认值：继承自会话。选项：`low`、`medium`、`high`、`max`（仅 Opus 4.6）。                                                                                                                                    |
| `context`                   | 否           | 设为 `fork` 可在分叉的Subagents上下文中运行。                                                                                                                                                                                                            |
| `agent`                     | 否           | 设置 `context: fork` 时使用的Subagents类型。                                                                                                                                                                                                              |
| `hooks`                     | 否           | 限定在此Skills生命周期的Hooks。请参阅Skills和代理中的Hooks了解配置格式。                                                                                                                                                                                     |
| `paths`                     | 否           | 限制此Skills何时激活的 glob 模式。接受逗号分隔的字符串或 YAML 列表。设置后，CSC 仅在处理匹配模式的文件时自动加载该Skills。使用与路径特定规则相同的格式。                                                                                                  |
| `shell`                     | 否           | 此Skills中 `` !`command` `` 和 ` ```! ` 块使用的 shell。接受 `bash`（默认）或 `powershell`。设置 `powershell` 可在 Windows 上通过 PowerShell 运行内联 shell 命令。需要 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`。                                              |

#### 可用的字符串替换

Skills支持在Skills内容中进行动态值的字符串替换：

| 变量                      | 描述                                                                                                                                                                                                                                          |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$ARGUMENTS`              | 调用Skills时传递的所有参数。如果内容中不存在 `$ARGUMENTS`，参数将作为 `ARGUMENTS: <value>` 附加。                                                                                                                                                |
| `$ARGUMENTS[N]`           | 通过从 0 开始的索引访问特定参数，例如 `$ARGUMENTS[0]` 表示第一个参数。                                                                                                                                                                         |
| `$N`                      | `$ARGUMENTS[N]` 的简写，例如 `$0` 表示第一个参数，`$1` 表示第二个。                                                                                                                                                                            |
| `${CLAUDE_SESSION_ID}`    | 当前会话 ID。用于日志记录、创建会话特定文件或将Skills输出与会话关联。                                                                                                                                                                            |
| `${CLAUDE_SKILL_DIR}`     | 包含Skills `SKILL.md` 文件的目录。对于PluginsSkills，这是Plugins内Skills的子目录，而非Plugins根目录。在 bash 注入命令中使用此变量来引用与Skills捆绑的脚本或文件，无论当前工作目录是什么。                                                                        |

索引参数使用 shell 风格的引用，因此用引号包裹多词值可将它们作为单个参数传递。例如，`/my-skill "hello world" second` 使 `$0` 展开为 `hello world`，`$1` 展开为 `second`。`$ARGUMENTS` 占位符始终展开为键入的完整参数字符串。

**使用替换的示例：**

```yaml
---
name: session-logger
description: Log activity for this session
---

Log the following to logs/${CLAUDE_SESSION_ID}.log:

$ARGUMENTS
```

### 添加支持文件

Skills可以在其目录中包含多个文件。这使 `SKILL.md` 专注于要点，同时让 CSC 仅在需要时访问详细的参考材料。大型参考文档、API 规范或示例集合不需要在每次Skills运行时都加载到上下文中。

```text
my-skill/
├── SKILL.md (required - overview and navigation)
├── reference.md (detailed API docs - loaded when needed)
├── examples.md (usage examples - loaded when needed)
└── scripts/
    └── helper.py (utility script - executed, not loaded)
```

从 `SKILL.md` 中引用支持文件，以便 CSC 知道每个文件包含什么以及何时加载它：

```markdown
## Additional resources

- For complete API details, see reference.md
- For usage examples, see examples.md
```

> **💡 提示：** 将 `SKILL.md` 保持在 500 行以内。将详细的参考材料移到单独的文件中。

### 控制谁调用Skills

默认情况下，你和 CSC 都可以调用任何Skills。你可以输入 `/skill-name` 直接调用它，CSC 也可以在与你的对话相关时自动加载它。两个 frontmatter 字段让你可以限制这一点：

* **`disable-model-invocation: true`**：只有你可以调用该Skills。用于有副作用或你想要控制时机的工作流，如 `/commit`、`/deploy` 或 `/send-slack-message`。你不希望 CSC 因为代码看起来准备好了就决定部署。

* **`user-invocable: false`**：只有 CSC 可以调用该Skills。用于不可作为命令操作的背景知识。一个 `legacy-system-context` Skills解释旧系统的工作方式。CSC 应该在相关时知道这一点，但 `/legacy-system-context` 对用户来说不是一个有意义的操作。

此示例创建一个只有你可以触发的部署Skills。`disable-model-invocation: true` 字段防止 CSC 自动运行它：

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:

1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

以下是两个字段如何影响调用和上下文加载：

| Frontmatter                      | 你可以调用 | CSC 可以调用 | 何时加载到上下文                                         |
| :------------------------------- | :--------- | :----------- | :------------------------------------------------------- |
| （默认）                          | 是         | 是           | 描述始终在上下文中，完整Skills在调用时加载                 |
| `disable-model-invocation: true` | 是         | 否           | 描述不在上下文中，完整Skills在你调用时加载                 |
| `user-invocable: false`          | 否         | 是           | 描述始终在上下文中，完整Skills在调用时加载                 |

> **注意：** 在常规会话中，Skills描述被加载到上下文中以便 CSC 知道有什么可用，但完整的Skills内容只在调用时加载。预加载Skills的Subagents工作方式不同：完整的Skills内容在启动时注入。

### Skills内容生命周期

当你或 CSC 调用Skills时，渲染后的 `SKILL.md` 内容作为单条消息进入对话，并在会话的剩余时间内保留。CSC 不会在后续轮次中重新读取Skills文件，因此应将应在整个任务期间适用的指导写成持久性指令，而非一次性步骤。

自动压缩在 token 预算内将已调用的Skills向前传递。当对话被摘要以释放上下文时，CSC 在摘要后重新附加每个Skills最近一次的调用，保留每个Skills的前 5,000 个 token。重新附加的Skills共享 25,000 个 token 的组合预算。CSC 从最近调用的Skills开始填充此预算，因此如果你在一个会话中调用了很多Skills，较旧的Skills可能在压缩后被完全丢弃。

如果一个Skills似乎在第一次响应后就不再影响行为，内容通常仍然存在，只是模型选择了其他工具或方法。加强Skills的 `description` 和指令，使模型继续偏好它，或者使用Hooks来强制执行行为。如果Skills很大或你在之后调用了其他几个Skills，请在压缩后重新调用它以恢复完整内容。

### 为Skills预批准工具

`allowed-tools` 字段在Skills激活时授予列出的工具的权限，因此 CSC 可以使用它们而无需提示你批准。它不限制哪些工具可用：每个工具仍然可以被调用，你的权限设置仍然管理未列出的工具。

此Skills让你在调用时 CSC 可以运行 git 命令而无需逐次批准：

```yaml
---
name: commit
description: Stage and commit the current changes
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

要阻止Skills使用某些工具，请在你的权限设置中添加拒绝规则。

### 向Skills传递参数

你和 CSC 都可以在调用Skills时传递参数。参数通过 `$ARGUMENTS` 占位符可用。

此Skills按编号修复 GitHub issue。`$ARGUMENTS` 占位符被Skills名称后面的内容替换：

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Understand the requirements
3. Implement the fix
4. Write tests
5. Create a commit
```

当你运行 `/fix-issue 123` 时，CSC 收到"Fix GitHub issue 123 following our coding standards..."

如果你带参数调用Skills但Skills不包含 `$ARGUMENTS`，CSC 会在Skills内容末尾附加 `ARGUMENTS: <your input>`，以便 CSC 仍然能看到你输入的内容。

要按位置访问各个参数，使用 `$ARGUMENTS[N]` 或更短的 `$N`：

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $ARGUMENTS[0] component from $ARGUMENTS[1] to $ARGUMENTS[2].
Preserve all existing behavior and tests.
```

运行 `/migrate-component SearchBar React Vue` 将 `$ARGUMENTS[0]` 替换为 `SearchBar`，`$ARGUMENTS[1]` 替换为 `React`，`$ARGUMENTS[2]` 替换为 `Vue`。使用 `$N` 简写的相同Skills：

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

## 高级模式

### 注入动态上下文

`` !`<command>` `` 语法在Skills内容发送给 CSC 之前运行 shell 命令。命令输出替换占位符，因此 CSC 接收的是实际数据，而非命令本身。

此Skills通过 GitHub CLI 获取实时 PR 数据来总结拉取请求。`` !`gh pr diff` `` 和其他命令首先运行，其输出被插入到提示中：

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

当此Skills运行时：

1. 每个 `` !`<command>` `` 立即执行（在 CSC 看到任何内容之前）
2. 输出替换Skills内容中的占位符
3. CSC 接收包含实际 PR 数据的完全渲染的提示

这是预处理，不是 CSC 执行的内容。CSC 只看到最终结果。

对于多行命令，使用以 ` ```! ` 开头的围栏代码块代替内联形式：

````markdown
## Environment
```!
node --version
npm --version
git status --short
```
````

要为来自用户、项目、Plugins或额外目录来源的Skills和自定义命令禁用此行为，请在设置中设置 `"disableSkillShellExecution": true`。每个命令将被替换为 `[shell command execution disabled by policy]` 而非运行。内置和托管Skills不受影响。此设置在托管设置中最有用，用户无法覆盖它。

> **💡 提示：** 要在Skills中启用扩展思维，请在Skills内容中的任意位置包含单词"ultrathink"。

### 在Subagents中运行Skills

当你希望Skills在隔离环境中运行时，在 frontmatter 中添加 `context: fork`。Skills内容成为驱动Subagents的提示。它无法访问你的对话历史。

> **⚠️ 警告：** `context: fork` 仅对具有明确指令的Skills有意义。如果你的Skills包含"使用这些 API 约定"之类的指导而没有任务，Subagents会收到指导但没有可操作的提示，将返回而没有有意义的输出。

Skills和Subagents以两种方式协同工作：

| 方式                           | 系统提示                               | 任务                   | 还会加载                       |
| :----------------------------- | :------------------------------------- | :--------------------- | :----------------------------- |
| 带 `context: fork` 的Skills      | 来自代理类型（`Explore`、`Plan` 等）   | SKILL.md 内容          | CLAUDE.md                      |
| 带 `skills` 字段的Subagents       | Subagents的 markdown 主体                 | CSC 的委派消息         | 预加载的Skills + CLAUDE.md       |

使用 `context: fork`，你在Skills中编写任务并选择一个代理类型来执行它。对于相反的方向（定义使用Skills作为参考材料的自定义Subagents），请参阅Subagents。

#### 示例：使用 Explore 代理的研究Skills

此Skills在分叉的 Explore 代理中运行研究。Skills内容成为任务，代理提供为代码库探索优化的只读工具：

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

当此Skills运行时：

1. 创建一个新的隔离上下文
2. Subagents接收Skills内容作为其提示（"Research $ARGUMENTS thoroughly..."）
3. `agent` 字段确定执行环境（模型、工具和权限）
4. 结果被摘要并返回到你的主对话

`agent` 字段指定使用哪个Subagents配置。选项包括内置代理（`Explore`、`Plan`、`general-purpose`）或 `.claude/agents/` 中的任何自定义Subagents。如果省略，使用 `general-purpose`。

### 限制 CSC 的Skills访问

默认情况下，CSC 可以调用任何未设置 `disable-model-invocation: true` 的Skills。定义了 `allowed-tools` 的Skills在激活时授予 CSC 使用这些工具的权限而无需逐次批准。你的权限设置仍然管理所有其他工具的基线批准行为。像 `/compact` 和 `/init` 这样的内置命令不能通过 Skill 工具使用。

控制 CSC 可以调用哪些Skills的三种方式：

**通过在 `/permissions` 中拒绝 Skill 工具来禁用所有Skills**：

```text
# Add to deny rules:
Skill
```

**使用权限规则允许或拒绝特定Skills**：

```text
# Allow only specific skills
Skill(commit)
Skill(review-pr *)

# Deny specific skills
Skill(deploy *)
```

权限语法：`Skill(name)` 用于精确匹配，`Skill(name *)` 用于带任意参数的前缀匹配。

**通过在 frontmatter 中添加 `disable-model-invocation: true` 来隐藏个别Skills**。这会从 CSC 的上下文中完全移除该Skills。

> **注意：** `user-invocable` 字段仅控制菜单可见性，不控制 Skill 工具访问。使用 `disable-model-invocation: true` 来阻止程序化调用。

## 共享Skills

Skills可以根据你的受众在不同范围内分发：

* **项目Skills**：将 `.claude/skills/` 提交到版本控制
* **Plugins**：在你的Plugins中创建 `skills/` 目录
* **托管**：通过托管设置在组织范围内部署

### 生成可视化输出

Skills可以捆绑和运行任何语言的脚本，赋予 CSC 超出单个提示可能实现的能力。一个强大的模式是生成可视化输出：在浏览器中打开的交互式 HTML 文件，用于探索数据、调试或创建报告。

此示例创建一个代码库浏览器：一个交互式树视图，你可以展开和折叠目录，一目了然地查看文件大小，并通过颜色识别文件类型。

创建Skills目录：

```bash
mkdir -p ~/.claude/skills/codebase-visualizer/scripts
```

创建 `~/.claude/skills/codebase-visualizer/SKILL.md`。描述告诉 CSC 何时激活此Skills，指令告诉 CSC 运行捆绑的脚本：

````yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo, understanding project structure, or identifying large files.
allowed-tools: Bash(python *)
---

# Codebase Visualizer

Generate an interactive HTML tree view that shows your project's file structure with collapsible directories.

## Usage

Run the visualization script from your project root:

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```

This creates `codebase-map.html` in the current directory and opens it in your default browser.

## What the visualization shows

- **Collapsible directories**: Click folders to expand/collapse
- **File sizes**: Displayed next to each file
- **Colors**: Different colors for different file types
- **Directory totals**: Shows aggregate size of each folder
````

创建 `~/.claude/skills/codebase-visualizer/scripts/visualize.py`。此脚本扫描目录树并生成一个自包含的 HTML 文件，包含：

* 一个**摘要侧边栏**，显示文件数、目录数、总大小和文件类型数
* 一个**条形图**，按文件类型分解代码库（按大小前 8 名）
* 一个**可折叠树**，你可以展开和折叠目录，带有颜色编码的文件类型指示器

该脚本需要 Python，但仅使用内置库，因此无需安装任何包：

```python
#!/usr/bin/env python3
"""Generate an interactive collapsible tree visualization of a codebase."""

import json
import sys
import webbrowser
from pathlib import Path
from collections import Counter

IGNORE = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build'}

def scan(path: Path, stats: dict) -> dict:
    result = {"name": path.name, "children": [], "size": 0}
    try:
        for item in sorted(path.iterdir()):
            if item.name in IGNORE or item.name.startswith('.'):
                continue
            if item.is_file():
                size = item.stat().st_size
                ext = item.suffix.lower() or '(no ext)'
                result["children"].append({"name": item.name, "size": size, "ext": ext})
                result["size"] += size
                stats["files"] += 1
                stats["extensions"][ext] += 1
                stats["ext_sizes"][ext] += size
            elif item.is_dir():
                stats["dirs"] += 1
                child = scan(item, stats)
                if child["children"]:
                    result["children"].append(child)
                    result["size"] += child["size"]
    except PermissionError:
        pass
    return result

def generate_html(data: dict, stats: dict, output: Path) -> None:
    ext_sizes = stats["ext_sizes"]
    total_size = sum(ext_sizes.values()) or 1
    sorted_exts = sorted(ext_sizes.items(), key=lambda x: -x[1])[:8]
    colors = {
        '.js': '#f7df1e', '.ts': '#3178c6', '.py': '#3776ab', '.go': '#00add8',
        '.rs': '#dea584', '.rb': '#cc342d', '.css': '#264de4', '.html': '#e34c26',
        '.json': '#6b7280', '.md': '#083fa1', '.yaml': '#cb171e', '.yml': '#cb171e',
        '.mdx': '#083fa1', '.tsx': '#3178c6', '.jsx': '#61dafb', '.sh': '#4eaa25',
    }
    lang_bars = "".join(
        f'<div class="bar-row"><span class="bar-label">{ext}</span>'
        f'<div class="bar" style="width:{(size/total_size)*100}%;background:{colors.get(ext,"#6b7280")}"></div>'
        f'<span class="bar-pct">{(size/total_size)*100:.1f}%</span></div>'
        for ext, size in sorted_exts
    )
    def fmt(b):
        if b < 1024: return f"{b} B"
        if b < 1048576: return f"{b/1024:.1f} KB"
        return f"{b/1048576:.1f} MB"

    html = f'''<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"><title>Codebase Explorer</title>
  <style>
    body {{ font: 14px/1.5 system-ui, sans-serif; margin: 0; background: #1a1a2e; color: #eee; }}
    .container {{ display: flex; height: 100vh; }}
    .sidebar {{ width: 280px; background: #252542; padding: 20px; border-right: 1px solid #3d3d5c; overflow-y: auto; flex-shrink: 0; }}
    .main {{ flex: 1; padding: 20px; overflow-y: auto; }}
    h1 {{ margin: 0 0 10px 0; font-size: 18px; }}
    h2 {{ margin: 20px 0 10px 0; font-size: 14px; color: #888; text-transform: uppercase; }}
    .stat {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3d3d5c; }}
    .stat-value {{ font-weight: bold; }}
    .bar-row {{ display: flex; align-items: center; margin: 6px 0; }}
    .bar-label {{ width: 55px; font-size: 12px; color: #aaa; }}
    .bar {{ height: 18px; border-radius: 3px; }}
    .bar-pct {{ margin-left: 8px; font-size: 12px; color: #666; }}
    .tree {{ list-style: none; padding-left: 20px; }}
    details {{ cursor: pointer; }}
    summary {{ padding: 4px 8px; border-radius: 4px; }}
    summary:hover {{ background: #2d2d44; }}
    .folder {{ color: #ffd700; }}
    .file {{ display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; }}
    .file:hover {{ background: #2d2d44; }}
    .size {{ color: #888; margin-left: auto; font-size: 12px; }}
    .dot {{ width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }}
  </style>
</head><body>
  <div class="container">
    <div class="sidebar">
      <h1>📊 Summary</h1>
      <div class="stat"><span>Files</span><span class="stat-value">{stats["files"]:,}</span></div>
      <div class="stat"><span>Directories</span><span class="stat-value">{stats["dirs"]:,}</span></div>
      <div class="stat"><span>Total size</span><span class="stat-value">{fmt(data["size"])}</span></div>
      <div class="stat"><span>File types</span><span class="stat-value">{len(stats["extensions"])}</span></div>
      <h2>By file type</h2>
      {lang_bars}
    </div>
    <div class="main">
      <h1>📁 {data["name"]}</h1>
      <ul class="tree" id="root"></ul>
    </div>
  </div>
  <script>
    const data = {json.dumps(data)};
    const colors = {json.dumps(colors)};
    function fmt(b) {{ if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB'; return (b/1048576).toFixed(1) + ' MB'; }}
    function render(node, parent) {{
      if (node.children) {{
        const det = document.createElement('details');
        det.open = parent === document.getElementById('root');
        det.innerHTML = `<summary><span class="folder">📁 ${{node.name}}</span><span class="size">${{fmt(node.size)}}</span></summary>`;
        const ul = document.createElement('ul'); ul.className = 'tree';
        node.children.sort((a,b) => (b.children?1:0)-(a.children?1:0) || a.name.localeCompare(b.name));
        node.children.forEach(c => render(c, ul));
        det.appendChild(ul);
        const li = document.createElement('li'); li.appendChild(det); parent.appendChild(li);
      }} else {{
        const li = document.createElement('li'); li.className = 'file';
        li.innerHTML = `<span class="dot" style="background:${{colors[node.ext]||'#6b7280'}}"></span>${{node.name}}<span class="size">${{fmt(node.size)}}</span>`;
        parent.appendChild(li);
      }}
    }}
    data.children.forEach(c => render(c, document.getElementById('root')));
  </script>
</body></html>'''
    output.write_text(html)

if __name__ == '__main__':
    target = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    stats = {"files": 0, "dirs": 0, "extensions": Counter(), "ext_sizes": Counter()}
    data = scan(target, stats)
    out = Path('codebase-map.html')
    generate_html(data, stats, out)
    print(f'Generated {out.absolute()}')
    webbrowser.open(f'file://{out.absolute()}')
```

要测试，在任何项目中打开 CSC 并询问"Visualize this codebase."。CSC 运行脚本，生成 `codebase-map.html`，并在浏览器中打开它。

此模式适用于任何可视化输出：依赖图、测试覆盖率报告、API 文档或数据库模式可视化。捆绑的脚本完成繁重的工作，而 CSC 负责编排。

## 故障排除

### Skills未触发

如果 CSC 未按预期使用你的Skills：

1. 检查描述是否包含用户自然会说的关键词
2. 验证Skills是否出现在"有哪些Skills可用？"中
3. 尝试重新表述你的请求以更接近描述
4. 如果Skills是用户可调用的，使用 `/skill-name` 直接调用

### Skills触发过于频繁

如果 CSC 在你不希望的时候使用了你的Skills：

1. 使描述更具体
2. 如果你只想要手动调用，添加 `disable-model-invocation: true`

### Skills描述被截断

Skills描述被加载到上下文中，以便 CSC 知道有什么可用。所有Skills名称始终包含在内，但如果你有很多Skills，描述会被缩短以适应字符预算，这可能会剥离 CSC 匹配你请求所需的关键词。预算按上下文窗口的 1% 动态缩放，回退值为 8,000 个字符。

要提高限制，设置 `SLASH_COMMAND_TOOL_CHAR_BUDGET` 环境变量。或者在源头修剪描述：将关键用例放在前面，因为每个条目无论预算如何都上限为 250 个字符。
