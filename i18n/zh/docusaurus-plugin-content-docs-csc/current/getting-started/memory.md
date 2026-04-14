---
sidebar_position: 4
---

# CSC 如何记忆你的项目

> 通过 CLAUDE.md 文件为 CSC 提供持久化指令，并让 CSC 通过自动记忆自动积累学习成果。

每个 CSC 会话都以全新的上下文窗口开始。有两种机制可以跨会话传递知识：

* **CLAUDE.md 文件**：你编写的指令，为 CSC 提供持久化的上下文
* **自动记忆**：CSC 根据你的纠正和偏好自行记录的笔记

本页涵盖以下内容：

* 编写和组织 CLAUDE.md 文件
* 使用 `.claude/rules/` 将规则限定到特定文件类型
* 配置自动记忆，让 CSC 自动记录笔记
* 当指令未被遵循时进行故障排查

## CLAUDE.md 与自动记忆

CSC 有两个互补的记忆系统。两者在每次对话开始时都会加载。CSC 将它们视为上下文，而非强制配置。你的指令越具体、越简洁，CSC 就越能一致地遵循它们。

|                      | CLAUDE.md 文件                                   | 自动记忆                                                      |
| :------------------- | :------------------------------------------------ | :--------------------------------------------------------------- |
| **谁编写**    | 你                                               | CSC                                                           |
| **包含内容** | 指令和规则                            | 学习成果和模式                                           |
| **作用范围**            | 项目、用户或组织                             | 每个工作树                                                 |
| **加载到**      | 每个会话                                     | 每个会话（前 200 行或 25KB）                          |
| **用途**          | 编码标准、工作流、项目架构 | 构建命令、调试洞察、CSC 发现的偏好 |

当你想要引导 CSC 的行为时，使用 CLAUDE.md 文件。自动记忆让 CSC 无需手动操作就能从你的纠正中学习。

子代理也可以维护自己的自动记忆。有关详细信息，请参阅子代理配置。

## CLAUDE.md 文件

CLAUDE.md 文件是 Markdown 文件，为 CSC 提供关于项目、你的个人工作流或整个组织的持久化指令。你以纯文本编写这些文件；CSC 在每个会话开始时读取它们。

### 何时添加到 CLAUDE.md

将 CLAUDE.md 视为你记录那些否则需要反复解释的内容的地方。在以下情况下添加：

* CSC 第二次犯同样的错误
* 代码审查发现了 CSC 本应了解的关于此代码库的内容
* 你输入了与上次会话相同的纠正或澄清
* 新团队成员需要相同的上下文才能高效工作

将其限制在 CSC 在每个会话中应掌握的事实：构建命令、约定、项目布局、"始终执行 X" 规则。如果某个条目是多步骤过程或仅与代码库的某一部分相关，请将其移至技能或路径限定规则。扩展概述涵盖了何时使用每种机制。

### 选择 CLAUDE.md 文件的位置

CLAUDE.md 文件可以存在于多个位置，每个位置的作用范围不同。更具体的位置优先于更广泛的位置。

| 作用范围                    | 位置                                                                                                                                                                | 目的                                                    | 用例示例                                                    | 共享对象                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------- |
| **托管策略**       | • macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`<br />• Linux 和 WSL: `/etc/claude-code/CLAUDE.md`<br />• Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | IT/DevOps 管理的组织级指令        | 公司编码标准、安全策略、合规要求 | 组织中的所有用户       |
| **项目指令** | `./CLAUDE.md` 或 `./.claude/CLAUDE.md`                                                                                                                                  | 项目的团队共享指令                   | 项目架构、编码标准、常见工作流             | 通过版本控制共享的团队成员 |
| **用户指令**    | `~/.claude/CLAUDE.md`                                                                                                                                                   | 所有项目的个人偏好                      | 代码风格偏好、个人工具快捷方式                 | 仅你（所有项目）         |
| **本地指令**   | `./CLAUDE.local.md`                                                                                                                                                     | 个人的项目特定偏好；添加到 `.gitignore` | 你的沙箱 URL、首选测试数据                               | 仅你（当前项目）      |

工作目录上级目录层次结构中的 CLAUDE.md 和 CLAUDE.local.md 文件在启动时全部加载。子目录中的文件在 CSC 读取这些目录中的文件时按需加载。有关完整的解析顺序，请参阅 CLAUDE.md 文件的加载方式。

对于大型项目，你可以使用项目规则将指令拆分为特定主题的文件。规则允许你将指令限定到特定文件类型或子目录。

### 设置项目 CLAUDE.md

项目 CLAUDE.md 可以存储在 `./CLAUDE.md` 或 `./.claude/CLAUDE.md` 中。创建此文件并添加适用于任何从事该项目工作的人员的指令：构建和测试命令、编码标准、架构决策、命名约定和常见工作流。这些指令通过版本控制与你的团队共享，因此请专注于项目级标准而非个人偏好。

> **💡 提示：** 运行 `/init` 可自动生成初始 CLAUDE.md。CSC 会分析你的代码库并创建一个包含构建命令、测试指令和它发现的项目约定的文件。如果 CLAUDE.md 已存在，`/init` 会建议改进而不是覆盖它。从那里逐步完善，添加 CSC 无法自行发现的指令。
>
> 设置 `CLAUDE_CODE_NEW_INIT=1` 以启用交互式多阶段流程。`/init` 会询问要设置哪些工件：CLAUDE.md 文件、技能和钩子。然后它通过子代理探索你的代码库，通过后续问题填补空白，并在写入任何文件之前呈现可审查的提案。

### 编写有效的指令

CLAUDE.md 文件在每个会话开始时加载到上下文窗口中，与你的对话一起消耗 token。上下文窗口可视化显示了 CLAUDE.md 相对于其他启动上下文的加载位置。因为它们是上下文而非强制配置，你编写指令的方式会影响 CSC 遵循它们的可靠性。具体、简洁、结构良好的指令效果最佳。

**大小**：每个 CLAUDE.md 文件目标控制在 200 行以内。较长的文件消耗更多上下文并降低遵循度。如果你的指令变得很大，请使用导入或 `.claude/rules/` 文件进行拆分。

**结构**：使用 Markdown 标题和项目符号来分组相关指令。CSC 扫描结构的方式与读者相同：有组织的部分比密集的段落更容易遵循。

**具体性**：编写足够具体以可验证的指令。例如：

* "使用 2 空格缩进" 而不是 "正确格式化代码"
* "提交前运行 `npm test`" 而不是 "测试你的更改"
* "API 处理程序位于 `src/api/handlers/`" 而不是 "保持文件有序"

**一致性**：如果两条规则相互矛盾，CSC 可能会随意选择其中一条。定期审查你的 CLAUDE.md 文件、子目录中的嵌套 CLAUDE.md 文件和 `.claude/rules/`，以删除过时或冲突的指令。在 monorepo 中，使用 `claudeMdExcludes` 跳过与你工作无关的其他团队的 CLAUDE.md 文件。

### 导入其他文件

CLAUDE.md 文件可以使用 `@path/to/import` 语法导入其他文件。导入的文件在启动时与引用它们的 CLAUDE.md 一起展开并加载到上下文中。

允许使用相对路径和绝对路径。相对路径相对于包含导入的文件解析，而非工作目录。导入的文件可以递归导入其他文件，最大深度为五跳。

要引入 README、package.json 和工作流指南，请在 CLAUDE.md 中的任何位置使用 `@` 语法引用它们：

```text
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

对于不应检入版本控制的私人项目偏好，请在项目根目录创建 `CLAUDE.local.md`。它与 `CLAUDE.md` 一起加载，处理方式相同。将 `CLAUDE.local.md` 添加到 `.gitignore` 以避免提交；运行 `/init` 并选择个人选项会自动完成此操作。

如果你在同一个仓库的多个 git 工作树中工作，被 gitignore 的 `CLAUDE.local.md` 仅存在于你创建它的工作树中。要在工作树之间共享个人指令，请改为从主目录导入文件：

```text
# Individual Preferences
- @~/.claude/my-project-instructions.md
```

> **⚠️ 警告：** 当 CSC 首次遇到项目中的外部导入时，它会显示一个列出这些文件的审批对话框。如果你拒绝，导入将保持禁用状态，且对话框不会再次出现。

有关组织指令的更结构化方法，请参阅 `.claude/rules/`。

### AGENTS.md

CSC 读取 `CLAUDE.md`，而不是 `AGENTS.md`。如果你的仓库已经为其他编码代理使用 `AGENTS.md`，请创建一个导入它的 `CLAUDE.md`，这样两个工具就可以读取相同的指令而无需重复。你还可以在导入下方添加 CSC 特定的指令。CSC 在会话开始时加载导入的文件，然后追加其余内容：

```markdown CLAUDE.md
@AGENTS.md

## CSC

Use plan mode for changes under `src/billing/`.
```

### CLAUDE.md 文件的加载方式

CSC 通过从当前工作目录向上遍历目录树来读取 CLAUDE.md 文件，沿途检查每个目录中的 `CLAUDE.md` 和 `CLAUDE.local.md` 文件。这意味着如果你在 `foo/bar/` 中运行 CSC，它会加载 `foo/bar/CLAUDE.md`、`foo/CLAUDE.md` 以及它们旁边的任何 `CLAUDE.local.md` 文件的指令。

所有发现的文件被连接到上下文中，而不是相互覆盖。在每个目录中，`CLAUDE.local.md` 附加在 `CLAUDE.md` 之后，因此当指令冲突时，你的个人笔记是 CSC 在该级别最后读取的内容。

CSC 还会发现当前工作目录下子目录中的 `CLAUDE.md` 和 `CLAUDE.local.md` 文件。它们不会在启动时加载，而是在 CSC 读取这些子目录中的文件时被包含。

如果你在大型 monorepo 中工作，其他团队的 CLAUDE.md 文件会被拾取，请使用 `claudeMdExcludes` 跳过它们。

CLAUDE.md 文件中的块级 HTML 注释（`<!-- maintainer notes -->`）在内容注入 CSC 的上下文之前被剥离。使用它们为人类维护者留下笔记，而不会在它们上面花费上下文 token。代码块内的注释会被保留。当你直接使用 Read 工具打开 CLAUDE.md 文件时，注释仍然可见。

#### 从其他目录加载

`--add-dir` 标志让 CSC 可以访问主工作目录之外的其他目录。默认情况下，这些目录中的 CLAUDE.md 文件不会被加载。

要从其他目录也加载 CLAUDE.md 文件（包括 `CLAUDE.md`、`.claude/CLAUDE.md` 和 `.claude/rules/*.md`），请设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` 环境变量：

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 csc --add-dir ../shared-config
```

其他目录中的 `CLAUDE.local.md` 文件不会被加载。

### 使用 `.claude/rules/` 组织规则

对于大型项目，你可以使用 `.claude/rules/` 目录将指令组织到多个文件中。这使指令保持模块化，更易于团队维护。规则还可以限定到特定文件路径，因此它们仅在 CSC 处理匹配文件时加载到上下文中，减少噪音并节省上下文空间。

> **注意：** 规则在每个会话或打开匹配文件时加载到上下文中。对于不需要始终在上下文中的任务特定指令，请改用技能，技能仅在你调用它们或 CSC 确定它们与你的提示相关时加载。

#### 设置规则

将 Markdown 文件放在项目的 `.claude/rules/` 目录中。每个文件应涵盖一个主题，使用描述性文件名如 `testing.md` 或 `api-design.md`。所有 `.md` 文件会被递归发现，因此你可以将规则组织到 `frontend/` 或 `backend/` 等子目录中：

```text
your-project/
├── .claude/
│   ├── CLAUDE.md           # 主要项目指令
│   └── rules/
│       ├── code-style.md   # 代码风格指南
│       ├── testing.md      # 测试约定
│       └── security.md     # 安全要求
```

没有 `paths` frontmatter 的规则在启动时加载，优先级与 `.claude/CLAUDE.md` 相同。

#### 路径特定规则

规则可以使用带有 `paths` 字段的 YAML frontmatter 限定到特定文件。这些条件规则仅在 CSC 处理与指定模式匹配的文件时适用。

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 开发规则

- 所有 API 端点必须包含输入验证
- 使用标准错误响应格式
- 包含 OpenAPI 文档注释
```

没有 `paths` 字段的规则无条件加载，适用于所有文件。路径限定规则在 CSC 读取匹配模式的文件时触发，而非每次工具使用时。

在 `paths` 字段中使用 glob 模式按扩展名、目录或任意组合匹配文件：

| 模式                | 匹配                                  |
| ---------------------- | ---------------------------------------- |
| `**/*.ts`              | 任何目录中的所有 TypeScript 文件    |
| `src/**/*`             | `src/` 目录下的所有文件         |
| `*.md`                 | 项目根目录中的 Markdown 文件       |
| `src/components/*.tsx` | 特定目录中的 React 组件 |

你可以指定多个模式，并使用大括号扩展在一个模式中匹配多个扩展名：

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

#### 通过符号链接跨项目共享规则

`.claude/rules/` 目录支持符号链接，因此你可以维护一组共享规则并将它们链接到多个项目中。符号链接会被正常解析和加载，循环符号链接会被检测并优雅处理。

此示例链接了一个共享目录和一个单独文件：

```bash
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/company-standards/security.md .claude/rules/security.md
```

#### 用户级规则

`~/.claude/rules/` 中的个人规则适用于你机器上的每个项目。将它们用于非项目特定的偏好：

```text
~/.claude/rules/
├── preferences.md    # 你的个人编码偏好
└── workflows.md      # 你偏好的工作流
```

用户级规则在项目规则之前加载，使项目规则具有更高的优先级。

### 为大型团队管理 CLAUDE.md

对于在团队中部署 CSC 的组织，你可以集中管理指令并控制加载哪些 CLAUDE.md 文件。

#### 部署组织级 CLAUDE.md

组织可以部署一个集中管理的 CLAUDE.md，适用于机器上的所有用户。此文件不能被个人设置排除。

### 创建托管策略位置的文件

* macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`
* Linux 和 WSL: `/etc/claude-code/CLAUDE.md`
* Windows: `C:\Program Files\ClaudeCode\CLAUDE.md`

### 使用配置管理系统部署

使用 MDM、组策略、Ansible 或类似工具在开发者机器上分发文件。有关其他组织级配置选项，请参阅托管设置。

托管 CLAUDE.md 和托管设置有不同的用途。使用设置进行技术强制，使用 CLAUDE.md 进行行为指导：

| 关注点                                        | 配置位置                                              |
| :--------------------------------------------- | :-------------------------------------------------------- |
| 阻止特定工具、命令或文件路径  | 托管设置：`permissions.deny`                      |
| 强制沙箱隔离                      | 托管设置：`sandbox.enabled`                       |
| 环境变量和 API 提供商路由 | 托管设置：`env`                                   |
| 认证方式和组织锁定    | 托管设置：`forceLoginMethod`、`forceLoginOrgUUID` |
| 代码风格和质量指南              | 托管 CLAUDE.md                                         |
| 数据处理和合规提醒         | 托管 CLAUDE.md                                         |
| CSC 的行为指令             | 托管 CLAUDE.md                                         |

设置规则由客户端强制执行，无论 CSC 决定做什么。CLAUDE.md 指令塑造 CSC 的行为，但不是硬性强制层。

#### 排除特定 CLAUDE.md 文件

在大型 monorepo 中，祖先 CLAUDE.md 文件可能包含与你工作无关的指令。`claudeMdExcludes` 设置允许你按路径或 glob 模式跳过特定文件。

此示例排除了顶级 CLAUDE.md 和父文件夹中的规则目录。将其添加到 `.claude/settings.local.json`，使排除仅限于你的机器：

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

模式使用 glob 语法匹配绝对文件路径。你可以在任何设置层配置 `claudeMdExcludes`：用户、项目、本地或托管策略。数组跨层合并。

托管策略 CLAUDE.md 文件不能被排除。这确保组织级指令始终适用，无论个人设置如何。

## 自动记忆

自动记忆让 CSC 无需你编写任何内容即可跨会话积累知识。CSC 在工作时为自己保存笔记：构建命令、调试洞察、架构笔记、代码风格偏好和工作流习惯。CSC 不会在每个会话中都保存内容。它会根据信息在未来的对话中是否有用来决定什么值得记住。

> **注意：** 自动记忆需要 CSC v2.1.59 或更高版本。使用 `csc --version` 检查你的版本。

### 启用或禁用自动记忆

自动记忆默认开启。要切换它，在会话中打开 `/memory` 并使用自动记忆开关，或在项目设置中设置 `autoMemoryEnabled`：

```json
{
  "autoMemoryEnabled": false
}
```

要通过环境变量禁用自动记忆，设置 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`。

### 存储位置

每个项目都有自己的记忆目录，位于 `~/.claude/projects/<project>/memory/`。`<project>` 路径源自 git 仓库，因此同一仓库中的所有工作树和子目录共享一个自动记忆目录。在 git 仓库之外，使用项目根目录。

要将自动记忆存储到其他位置，请在用户或本地设置中设置 `autoMemoryDirectory`：

```json
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

此设置从策略、本地和用户设置中接受。不从项目设置（`.claude/settings.json`）接受，以防止共享项目将自动记忆写入重定向到敏感位置。

该目录包含 `MEMORY.md` 入口文件和可选的主题文件：

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 简洁索引，加载到每个会话
├── debugging.md       # 调试模式的详细笔记
├── api-conventions.md # API 设计决策
└── ...                # CSC 创建的任何其他主题文件
```

`MEMORY.md` 充当记忆目录的索引。CSC 在整个会话中读写此目录中的文件，使用 `MEMORY.md` 跟踪存储了什么以及存储在哪里。

自动记忆是机器本地的。同一 git 仓库中的所有工作树和子目录共享一个自动记忆目录。文件不会跨机器或云环境共享。

### 工作原理

`MEMORY.md` 的前 200 行或前 25KB（以先到者为准）在每次对话开始时加载。超过该阈值的内容不会在会话开始时加载。CSC 通过将详细笔记移至单独的主题文件来保持 `MEMORY.md` 简洁。

此限制仅适用于 `MEMORY.md`。CLAUDE.md 文件无论长度如何都会全部加载，尽管较短的文件会产生更好的遵循度。

`debugging.md` 或 `patterns.md` 等主题文件不会在启动时加载。CSC 在需要信息时使用其标准文件工具按需读取它们。

CSC 在你的会话期间读写记忆文件。当你在 CSC 界面中看到"Writing memory"或"Recalled memory"时，CSC 正在主动更新或读取 `~/.claude/projects/<project>/memory/`。

### 审核和编辑你的记忆

自动记忆文件是纯 Markdown，你可以随时编辑或删除。运行 `/memory` 在会话中浏览和打开记忆文件。

## 使用 `/memory` 查看和编辑

`/memory` 命令列出当前会话中加载的所有 CLAUDE.md、CLAUDE.local.md 和规则文件，允许你开启或关闭自动记忆，并提供打开自动记忆文件夹的链接。选择任何文件在你的编辑器中打开它。

当你要求 CSC 记住某些内容时，如"始终使用 pnpm，不要用 npm"或"记住 API 测试需要本地 Redis 实例"，CSC 会将其保存到自动记忆。要将指令添加到 CLAUDE.md，请直接要求 CSC，如"将此添加到 CLAUDE.md"，或通过 `/memory` 自行编辑文件。

## 记忆问题故障排查

以下是 CLAUDE.md 和自动记忆的最常见问题，以及调试步骤。

### CSC 没有遵循我的 CLAUDE.md

CLAUDE.md 内容作为系统提示之后的用户消息传递，而非系统提示本身的一部分。CSC 会读取并尝试遵循它，但不能保证严格遵守，特别是对于模糊或冲突的指令。

调试方法：

* 运行 `/memory` 验证你的 CLAUDE.md 和 CLAUDE.local.md 文件是否正在加载。如果文件未列出，CSC 就看不到它。
* 检查相关的 CLAUDE.md 是否在为你的会话加载的位置（参见选择 CLAUDE.md 文件的位置）。
* 使指令更具体。"使用 2 空格缩进"比"格式化代码"效果更好。
* 检查 CLAUDE.md 文件之间是否有冲突指令。如果两个文件对同一行为给出不同指导，CSC 可能会随意选择其中一个。

对于你想要在系统提示级别的指令，使用 `--append-system-prompt`。这必须在每次调用时传递，因此更适合脚本和自动化而非交互式使用。

> **💡 提示：** 使用 `InstructionsLoaded` 钩子记录确切加载了哪些指令文件、何时加载以及为什么加载。这对于调试路径特定规则或子目录中的延迟加载文件很有用。

### 我不知道自动记忆保存了什么

运行 `/memory` 并选择自动记忆文件夹以浏览 CSC 保存的内容。所有内容都是纯 Markdown，你可以阅读、编辑或删除。

### 我的 CLAUDE.md 太大

超过 200 行的文件消耗更多上下文，可能会降低遵循度。将详细内容移至通过 `@path` 导入引用的单独文件（参见导入其他文件），或跨 `.claude/rules/` 文件拆分你的指令。

### 指令在 `/compact` 后似乎丢失了

项目根 CLAUDE.md 在压缩后仍然存在：在 `/compact` 之后，CSC 从磁盘重新读取它并重新注入到会话中。子目录中的嵌套 CLAUDE.md 文件不会自动重新注入；它们在 CSC 下次读取该子目录中的文件时重新加载。

如果某个指令在压缩后消失了，它要么仅在对话中给出，要么存在于尚未重新加载的嵌套 CLAUDE.md 中。将仅对话的指令添加到 CLAUDE.md 以使其持久化。有关完整分解，请参阅压缩后保留的内容。

有关大小、结构和具体性的指导，请参阅编写有效的指令。
