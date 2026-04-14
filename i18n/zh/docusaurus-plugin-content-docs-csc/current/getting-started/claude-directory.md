---
sidebar_position: 3
---

# 探索 .claude 目录

> CSC 从这里读取 CLAUDE.md、settings.json、hooks、skills、commands、subagents、rules 和自动记忆。探索你项目中的 .claude 目录和主目录中的 ~/.claude。

CSC 从你的项目目录和主目录中的 `~/.claude` 读取指令、设置、Skills、Subagents和记忆。将项目文件提交到 git 以便与团队共享；`~/.claude` 中的文件是适用于你所有项目的个人配置。

如果你设置了 `CLAUDE_CONFIG_DIR`，此页面上的每个 `~/.claude` 路径都将位于该目录下。

大多数用户只需编辑 `CLAUDE.md` 和 `settings.json`。目录的其余部分是可选的：根据需要添加Skills、规则或Subagents。

## 项目级文件

以下文件位于你的项目目录中。

### CLAUDE.md

**简介：** CSC 每次会话都会读取的项目指令

**何时加载：** 在每次会话开始时加载到上下文中

**描述：** 特定于项目的指令，决定 CSC 在此仓库中的工作方式。将你的约定、常用命令和架构上下文放在这里，以便 CSC 以与你的团队相同的假设运行。

**提示：**

- 目标控制在 200 行以内。更长的文件仍会完整加载，但可能会降低遵循度
- CLAUDE.md 会加载到每个会话中。如果某些内容只与特定任务相关，请将其移到 skill 或路径范围的 rule 中，这样只会在需要时加载
- 列出你最常运行的命令，如构建、测试和格式化，这样 CSC 无需你每次都拼写出来
- 运行 `/memory` 可以在会话中打开和编辑 CLAUDE.md
- 也可以放在 `.claude/CLAUDE.md`，如果你希望保持项目根目录整洁

**示例说明：** 此示例适用于 TypeScript 和 React 项目。它列出了构建和测试命令、CSC 应遵循的框架约定，以及项目特定规则（如导出风格和文件布局）。

```markdown
# 项目约定

## 命令
- 构建：`npm run build`
- 测试：`npm test`
- 代码检查：`npm run lint`

## 技术栈
- TypeScript 严格模式
- React 19，仅使用函数组件

## 规则
- 使用命名导出，不使用默认导出
- 测试文件放在源文件旁边：`foo.ts` -> `foo.test.ts`
- 所有 API 路由返回 `{ data, error }` 格式
```

---

### .mcp.json

**简介：** 项目范围的 MCP 服务器，与团队共享

**何时加载：** 会话开始时服务器连接。工具模式默认延迟加载，通过工具搜索按需加载

**描述：** 配置模型上下文协议（MCP）服务器，让 CSC 访问外部工具：数据库、API、浏览器等。此文件保存整个团队使用的项目范围服务器。你想保留给自己的个人服务器放在 `~/.claude.json` 中。

**提示：**

- 使用环境变量引用来存储密钥：`${GITHUB_TOKEN}`
- 位于项目根目录，不在 `.claude/` 内
- 对于只有你需要的服务器，运行 `csc mcp add --scope user`。这会写入 `~/.claude.json` 而不是 `.mcp.json`

**示例说明：** 此示例配置 GitHub MCP 服务器，让 CSC 可以读取 issue 和打开 pull request。`${GITHUB_TOKEN}` 引用会在 CSC 启动服务器时从你的 shell 环境中读取，因此令牌永远不会出现在文件中。

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

### .worktreeinclude

**简介：** 复制到新工作树的 gitignore 文件

**何时加载：** 当 CSC 通过 `--worktree`、`EnterWorkTree` 工具或Subagents `isolation: worktree` 创建 git worktree 时读取

**描述：** 列出要从主仓库复制到每个新工作树的 gitignore 文件。工作树是全新的检出，因此默认缺少 `.env` 等未跟踪文件。此处的模式使用 `.gitignore` 语法。只有匹配模式且同时被 gitignore 的文件才会被复制，因此已跟踪的文件不会被重复。

**提示：**
- 位于项目根目录，不在 `.claude/` 内
- 仅限 Git：如果你为不同的 VCS 配置了 WorktreeCreate hook，此文件不会被读取。请在 hook 脚本中复制文件
- 也适用于桌面应用中的并行会话

**示例说明：** 此示例将你的本地环境文件和密钥配置复制到 CSC 创建的每个工作树中。注释以 # 开头，空行被忽略，与 .gitignore 相同。

```
# 本地环境
.env
.env.local

# API 凭证
config/secrets.json
```

---

## 项目 .claude/ 目录

项目级配置、规则和扩展。CSC 读取的所有特定于此项目的内容。如果你使用 git，请提交此处的大多数文件以便团队共享；少数文件（如 settings.local.json）会自动被 gitignore。

### settings.json

**简介：** 权限、hooks 和配置

**何时加载：** 覆盖全局 `~/.claude/settings.json`。本地设置、CLI 标志和托管设置覆盖此项

**描述：** CSC 直接应用的设置。权限控制 CSC 可以使用哪些命令和工具；hooks 在会话的特定点运行你的脚本。与 CSC 作为指导读取的 CLAUDE.md 不同，这些设置无论 CSC 是否遵循都会被强制执行。

**常见键：**
- permissions：允许、拒绝或在 CSC 使用特定工具或命令前提示
- hooks：在工具调用前或文件编辑后等事件上运行你自己的脚本
- statusLine：自定义 CSC 工作时底部显示的行
- model：为此项目选择默认模型
- env：在每个会话中设置的环境变量
- outputStyle：从 output-styles/ 中选择自定义系统提示风格

**提示：**
- Bash 权限模式支持通配符：`Bash(npm test *)` 匹配任何以 `npm test` 开头的命令
- 数组设置如 `permissions.allow` 在所有范围中合并；标量设置如 `model` 使用最具体的值

**示例说明：** 此示例允许 `npm test` 和 `npm run` 命令无需提示，阻止 `rm -rf`，并在 CSC 编辑或写入文件后运行 Prettier。

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test *)",
      "Bash(npm run *)"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
      }]
    }]
  }
}
```

---

### settings.local.json

**简介：** 你在此项目的个人设置覆盖

**何时加载：** 用户可编辑设置文件中优先级最高的；CLI 标志和托管设置仍优先

**描述：** 优先于项目默认值的个人设置。与 settings.json 相同的 JSON 格式，但不提交。当你需要与团队配置不同的权限或默认值时使用此文件。

**提示：**
- 与 settings.json 相同的架构。数组设置如 `permissions.allow` 在范围间合并；标量设置如 `model` 使用本地值
- CSC 首次写入此文件时会将其添加到 `~/.config/git/ignore`。如果你使用自定义的 `core.excludesFile`，也请在那里添加模式。要与团队共享忽略规则，也请将其添加到项目 `.gitignore`

**示例说明：** 此示例在团队 settings.json 允许的基础上添加 Docker 权限。

```json
{
  "permissions": {
    "allow": [
      "Bash(docker *)"
    ]
  }
}
```

---

### rules/

**简介：** 按主题范围的指令，可选地按文件路径限制

**何时加载：** 没有 `paths:` 的规则在会话开始时加载。有 `paths:` 的规则在匹配文件进入上下文时加载

**描述：** 将项目指令拆分为主题文件，可以根据文件路径有条件地加载。没有 `paths:` frontmatter 的规则在会话开始时加载，就像 CLAUDE.md；有 `paths:` 的规则只在 CSC 读取匹配文件时加载。

与 CLAUDE.md 一样，规则是 CSC 读取的指导，而不是 CSC 强制执行的配置。要保证行为，请使用 hooks 或 permissions。

**提示：**
- 使用带 glob 的 `paths:` frontmatter 将规则限定到目录或文件类型
- 子目录有效：`.claude/rules/frontend/react.md` 会被自动发现
- 当 CLAUDE.md 接近 200 行时，开始拆分为规则

---

#### testing.md

**简介：** 限定于测试文件的测试约定

**何时加载：** 当 CSC 读取匹配以下 `paths:` glob 的文件时加载

**描述：** 一个只在 CSC 处理测试文件时加载的规则示例。frontmatter 中的 `paths:` glob 定义了哪些文件触发它；这里是以 .test.ts 或 .test.tsx 结尾的任何文件。对于其他文件，此规则不会加载到上下文中。

```yaml
---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# 测试规则

- 使用描述性测试名称："should [预期] when [条件]"
- 模拟外部依赖，而非内部模块
- 在 afterEach 中清理副作用
```

---

#### api-design.md

**简介：** 限定于后端代码的 API 约定

**何时加载：** 当 CSC 读取匹配以下 `paths:` glob 的文件时加载

**描述：** 第二个示例，展示限定于后端代码的规则。`paths:` glob 匹配 src/api/ 下的文件，因此这些约定只在 CSC 编辑 API 路由时加载。

```yaml
---
paths:
  - "src/api/**/*.ts"
---

# API 设计规则

- 所有端点必须使用 Zod schema 验证输入
- 返回格式：{ data: T } | { error: string }
- 对所有公共端点进行速率限制
```

---

### skills/

**简介：** 你或 CSC 按名称调用的可重用提示

**何时加载：** 通过 `/skill-name` 调用或当 CSC 将任务匹配到Skills时

**描述：** 每个Skills是一个包含 SKILL.md 文件及其所需支持文件的文件夹。默认情况下，你 和 CSC 都可以调用Skills。使用 frontmatter 控制这一点：`disable-model-invocation: true` 用于仅用户的工作流（如 `/deploy`），或 `user-invocable: false` 在 CSC 仍可调用时从 `/` 菜单中隐藏。

**提示：**
- Skills接受参数：`/deploy staging` 将 "staging" 作为 `$ARGUMENTS` 传递。使用 `$0`、`$1` 等进行位置访问
- `description` frontmatter 决定 CSC 何时自动调用Skills
- 将参考文档与 SKILL.md 一起打包。CSC 知道Skills目录路径，当你提到支持文件时可以读取它们

---

#### security-review/ Skills

**简介：** 将 SKILL.md 与支持文件打包的Skills

##### SKILL.md

**标记：** 已提交

**简介：** 入口点：触发方式、可调用性、指令

**何时加载：** 用户输入 `/security-review <target>`；CSC 不能自动调用此Skills

**描述：** 此Skills使用 `disable-model-invocation: true`，因此只有你可以触发它；CSC 永远不会自行调用它。

`!`...`` 行运行 shell 命令并将其输出注入提示。`$ARGUMENTS` 替换你在Skills名称后输入的内容。CSC 可以看到Skills目录路径，因此提到打包的文件（如 checklist.md）可以让 CSC 读取它。

```markdown
---
description: 审查代码变更的安全漏洞、认证缺陷和注入风险
disable-model-invocation: true
argument-hint: <branch-or-path>
---

## 要审查的差异

!`git diff $ARGUMENTS`

审计以上变更：

1. 注入漏洞（SQL、XSS、命令注入）
2. 认证和授权缺陷
3. 硬编码的密钥或凭证

使用此Skills目录中的 checklist.md 获取完整的审查清单。

报告发现时附上严重程度评级和修复步骤。
```

---

##### checklist.md

**简介：** 与Skills打包的支持文件

**何时加载：** CSC 在运行Skills时按需读取

**描述：** Skills可以打包任何支持文件：参考文档、模板、脚本。Skills目录路径会添加到 SKILL.md 前面，因此 CSC 可以按名称读取打包的文件。对于 bash 注入命令中的脚本，使用 `${CLAUDE_SKILL_DIR}` 占位符。

```markdown
# 安全审查清单

## 输入验证
- [ ] 所有用户输入在数据库查询前已清理
- [ ] 文件上传 MIME 类型已验证
- [ ] 文件操作已防止路径遍历

## 认证
- [ ] JWT 令牌在 24 小时后过期
- [ ] API 密钥存储在环境变量中
- [ ] 密码使用 bcrypt 或 argon2 哈希
```

---

### commands/

> **💡 提示：** Commands 和 skills 现在是同一机制。对于新的工作流，请使用 skills/ 代替：相同的 `/name` 调用方式，此外你还可以打包支持文件。

**简介：** 通过 `/name` 调用的单文件提示

**何时加载：** 用户输入 `/command-name`

**描述：** `commands/deploy.md` 处的文件创建 `/deploy`，与 `skills/deploy/SKILL.md` 处的Skills方式相同，两者都可以被 CSC 自动调用。Skills使用包含 SKILL.md 的目录，让你可以在提示旁边打包参考文档、模板或脚本。

**提示：**
- 在文件中使用 `$ARGUMENTS` 接受参数：`/fix-issue 123`
- 如果Skills和命令同名，Skills优先
- 新命令通常应该是Skills；命令仍受支持

---

#### fix-issue.md

> **💡 提示：** Commands 和 skills 现在是同一机制。对于新的工作流，请使用 skills/ 代替：相同的 `/name` 调用方式，此外你还可以打包支持文件。

**简介：** 以 `/fix-issue <number>` 调用

**描述：** 修复 GitHub issue 的示例命令。输入 `/fix-issue 123`，`!`...`` 行在你的 shell 中运行 `gh issue view 123`，在 CSC 看到之前将输出注入提示。

`$ARGUMENTS` 替换你在命令名称后输入的内容。对于位置访问，使用 `$0` `$1` 等。

```markdown
---
argument-hint: <issue-number>
---

!`gh issue view $ARGUMENTS`

调查并修复以上 issue。

1. 追踪 bug 到其根本原因
2. 实现修复
3. 编写或更新测试
4. 总结你做了什么以及为什么
```

---

### output-styles/

**简介：** 项目范围的输出风格，如果你的团队有共享的

**何时加载：** 通过 outputStyle 设置选择时在会话开始时应用

**描述：** 输出风格通常是个人化的，所以大多数放在 `~/.claude/output-styles/`。如果你的团队共享一种风格（如每个人都使用的审查模式），请放在这里。完整说明和示例请参见全局选项卡。

---

### agents/

**简介：** 拥有自己上下文窗口的专用Subagents

**何时加载：** 在你或 CSC 调用时在自己的上下文窗口中运行

**描述：** 每个 markdown 文件定义一个Subagents，拥有自己的系统提示、工具访问权限和可选的自己的模型。Subagents在全新的上下文窗口中运行，保持主对话干净。适用于并行工作或隔离任务。

**提示：**
- 每个代理获得一个全新的上下文窗口，与你的主会话分离
- 使用 `tools:` frontmatter 字段限制每个代理的工具访问
- 输入 @ 并从自动完成中选择代理以直接委派

---

#### code-reviewer.md

**简介：** 用于隔离代码审查的Subagents

**何时加载：** CSC 在审查任务时生成它，或你从自动完成中 @ 提及它

**描述：** 一个限制为只读工具的Subagents示例。`description` frontmatter 告诉 CSC 何时自动委派给它；`tools:` 将其限制为 Read、Grep 和 Glob，因此它可以检查代码但永远不会编辑。正文成为Subagents的系统提示。

```markdown
---
name: code-reviewer
description: 审查代码的正确性、安全性和可维护性
tools: Read, Grep, Glob
---

你是一位资深代码审查员。审查以下方面：

1. 正确性：逻辑错误、边界情况、空值处理
2. 安全性：注入、认证绕过、数据泄露
3. 可维护性：命名、复杂度、重复

每个发现必须包含具体的修复方案。
```

---

### agent-memory/

**标记：** 已提交 / CSC 自动写入

**简介：** Subagents持久记忆，与你的主会话自动记忆分离

**何时加载：** Subagents运行时，MEMORY.md 的前 200 行（上限 25KB）加载到Subagents系统提示中

**描述：** 在 frontmatter 中设置了 `memory: project` 的Subagents会在此获得一个专用记忆目录。这与你在 `~/.claude/projects/` 的主会话自动记忆不同：每个Subagents读写自己的 MEMORY.md，而不是你的。

**提示：**
- 仅为设置了 `memory:` frontmatter 字段的Subagents创建
- 此目录保存项目范围的Subagents记忆，旨在与团队共享。要将记忆排除在版本控制之外，使用 `memory: local`，它会写入 `.claude/agent-memory-local/`。对于跨项目记忆，使用 `memory: user`，它会写入 `~/.claude/agent-memory/`
- 主会话自动记忆是不同的功能；参见全局选项卡中的 `~/.claude/projects/`

---

#### \<agent-name\>/MEMORY.md

**标记：** 已提交 / CSC 自动写入

**简介：** Subagents自动写入和维护此文件

**何时加载：** Subagents启动时加载到Subagents系统提示中

**描述：** 与你的主自动记忆工作方式相同：Subagents自己创建和更新此文件。你不需要编写它。Subagents在每个任务开始时读取它，并写回它学到的东西。

```markdown
# code-reviewer 记忆

## 观察到的模式
- 项目使用自定义 Result<T, E> 类型，而非异常
- 认证中间件期望 Authorization 头中的 Bearer 令牌
- 测试使用 test/factories/ 中的工厂函数

## 反复出现的问题
- API 响应中缺少空值检查 (src/api/*)
- 后台作业中未处理的 Promise 拒绝
```

---

## 全局级文件

以下文件位于 `~/`（你的主目录）中。

### ~/.claude.json

**标记：** 仅本地

**简介：** 应用状态和 UI 偏好

**何时加载：** 会话开始时读取你的偏好和 MCP 服务器。当你在 `/config` 中更改设置或批准信任提示时，CSC 会写回此文件

**描述：** 保存不属于 settings.json 的状态：主题、OAuth 会话、每个项目的信任决策、你的个人 MCP 服务器和 UI 开关。主要通过 `/config` 管理，而不是直接编辑。

**提示：**
- UI 开关如 `showTurnDuration` 和 `terminalProgressBarEnabled` 在这里，不在 settings.json 中
- `projects` 键跟踪每个项目的状态，如信任对话框接受和上次会话指标。你在会话中批准的权限规则会写入 `.claude/settings.local.json`
- 这里的 MCP 服务器仅属于你：用户范围适用于所有项目，本地范围按项目但不提交。团队共享的服务器放在项目根目录的 `.mcp.json` 中

```json
{
  "editorMode": "vim",
  "showTurnDuration": false,
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"]
    }
  }
}
```

---

## 全局 ~/.claude/ 目录

你的个人配置，适用于所有项目。这是项目 .claude/ 目录的全局对应物。此处的文件适用于你工作的每个项目，永远不会提交到任何仓库。

### CLAUDE.md

**简介：** 每个项目的个人偏好

**何时加载：** 在每个项目的每次会话开始时加载

**描述：** 你的全局指令文件。在会话开始时与项目 CLAUDE.md 一起加载，因此两者同时在上下文中。当指令冲突时，项目级指令优先。将此文件限于适用于所有地方的偏好：响应风格、提交格式、个人约定。

**提示：**
- 保持简短，因为它会与项目自己的 CLAUDE.md 一起加载到每个项目的上下文中
- 适用于响应风格、提交格式和个人约定

```markdown
# 全局偏好

- 保持解释简洁
- 使用约定式提交格式
- 显示终端命令以验证更改
- 优先使用组合而非继承
```

---

### settings.json

**简介：** 所有项目的默认设置

**何时加载：** 你的默认值。项目和本地 settings.json 覆盖你在此处设置的任何键

**描述：** 与项目 `settings.json` 相同的键：权限、hooks、模型、环境变量等。将你想在每个项目中拥有的设置放在这里，如你总是允许的权限、首选模型或无论你在哪个项目都运行的通知 hook。

设置遵循优先级顺序：项目 `settings.json` 覆盖你在此处设置的任何匹配键。这与 CLAUDE.md 不同，全局和项目文件都加载到上下文中，而不是按键合并。

```json
{
  "permissions": {
    "allow": [
      "Bash(git log *)",
      "Bash(git diff *)"
    ]
  }
}
```

---

### keybindings.json

**简介：** 自定义键盘快捷键

**何时加载：** 会话开始时读取，编辑文件时热重载

**描述：** 在交互式 CLI 中重新绑定键盘快捷键。运行 `/keybindings` 创建或打开此文件，附带 schema 参考。Ctrl+C、Ctrl+D 和 Ctrl+M 是保留的，不能重新绑定。

**示例说明：** 此示例将 `Ctrl+E` 绑定到打开外部编辑器，并通过将 `Ctrl+U` 设置为 `null` 来解绑。`context` 字段将绑定限定到 CLI 的特定部分，这里是主聊天输入。

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

---

### projects/

**简介：** 自动记忆：CSC 给自己的笔记，按项目

**何时加载：** MEMORY.md 在会话开始时加载；主题文件按需读取

**描述：** 自动记忆让 CSC 在无需你编写任何内容的情况下跨会话积累知识。CSC 在工作时保存笔记：构建命令、调试见解、架构笔记。每个项目根据仓库路径获得自己的记忆目录。

**提示：**
- 默认开启。通过 `/memory` 或设置中的 `autoMemoryEnabled` 切换
- MEMORY.md 是每次会话加载的索引。读取前 200 行或 25KB（以先到者为准）
- 主题文件如 debugging.md 按需读取，不在启动时
- 这些是纯 markdown 文件。随时可以编辑或删除

---

#### \<project\>/memory/MEMORY.md

**简介：** CSC 自动写入和维护此文件

**何时加载：** 会话开始时加载前 200 行（上限 25KB）

**描述：** CSC 在工作时创建和更新此文件；你不需要自己编写。它作为 CSC 在每次会话开始时读取的索引，指向主题文件以获取详细信息。你可以编辑或删除它，但 CSC 会持续更新它。

```markdown
# 记忆索引

## 项目
- build-and-test.md：npm run build（约 45 秒），Vitest，开发服务器在 3001
- architecture.md：API 客户端单例，刷新令牌认证

## 参考
- debugging.md：认证令牌轮换和数据库连接故障排除
```

---

#### \<project\>/memory/debugging.md

**简介：** MEMORY.md 过长时 CSC 写入的主题笔记

**何时加载：** 当相关任务出现时 CSC 读取此文件

**描述：** 当 MEMORY.md 增长过长时 CSC 创建的主题文件示例。CSC 根据拆分出的内容选择文件名：debugging.md、architecture.md、build-commands.md 等。你永远不需要自己创建这些。CSC 只在当前任务相关时才读回主题文件。

```yaml
---
name: 调试模式
description: 此项目的认证令牌轮换和数据库连接故障排除
type: reference
---

## 认证令牌问题
- 刷新令牌轮换：旧令牌立即失效
- 如果刷新后出现 401：检查客户端和服务器之间的时钟偏差

## 数据库连接断开
- 连接池：开发环境最多 10，生产环境最多 50
- 始终先检查 `docker compose ps`
```

---

### rules/

**简介：** 适用于每个项目的用户级规则

**何时加载：** 没有 `paths:` 的规则在会话开始时加载。有 `paths:` 的规则在匹配文件进入上下文时加载

**描述：** 与项目 .claude/rules/ 相同，但适用于所有地方。将你想在所有工作中使用的约定放在这里，如个人代码风格或提交消息格式。

---

### skills/

**简介：** 在每个项目中可用的个人Skills

**何时加载：** 在任何项目中通过 `/skill-name` 调用

**描述：** 你为自己构建的随处可用的Skills。与项目Skills结构相同：每个是一个包含 SKILL.md 的文件夹，限定到你的用户账户而非单个项目。

---

### commands/

> **💡 提示：** Commands 和 skills 现在是同一机制。对于新的工作流，请使用 skills/ 代替：相同的 `/name` 调用方式，此外你还可以打包支持文件。

**简介：** 在每个项目中可用的个人单文件命令

**何时加载：** 用户在任何项目中输入 `/command-name`

**描述：** 与项目 commands/ 相同，但限定到你的用户账户。每个 markdown 文件成为一个随处可用的命令。

---

### output-styles/

**简介：** 调整 CSC 工作方式的自定义系统提示部分

**何时加载：** 通过 outputStyle 设置选择时在会话开始时应用

**描述：** 每个 markdown 文件定义一个输出风格：附加到系统提示的部分，默认情况下也会删除内置的软件工程任务指令。使用此功能将 CSC 适配到编码之外的用途，或添加教学或审查模式。

通过 `/config` 或设置中的 `outputStyle` 键选择内置或自定义风格。此处的风格在每个项目中可用；同名的项目级风格优先。

**提示：**
- 内置风格 Explanatory 和 Learning 随 CSC 提供；自定义风格放在这里
- 在 frontmatter 中设置 `keep-coding-instructions: true` 以在添加内容旁边保留默认任务指令
- 更改在下次会话生效，因为系统提示在启动时固定以用于缓存

---

#### teaching.md

**简介：** 添加解释并将小改动留给你完成的示例风格

**何时加载：** 当设置中的 `outputStyle` 设置为 `teaching` 时激活

**描述：** 此风格将指令附加到系统提示：CSC 在每个任务后添加"为什么选择此方法"注释，并为 10 行以下的更改留下 TODO(human) 标记，而不是自己编写。通过将 `outputStyle` 设置为不带 .md 的文件名，或设置 frontmatter 中的 `name` 字段来选择它。

```markdown
---
description: 解释推理过程并让你实现小片段
keep-coding-instructions: true
---

完成每个任务后，添加简短的"为什么选择此方法"注释，
解释关键设计决策。

当更改少于 10 行时，让用户自己实现，
留下 TODO(human) 标记而不是编写它。
```

---

### agents/

**简介：** 在每个项目中可用的个人Subagents

**何时加载：** CSC 委派或你在任何项目中 @ 提及

**描述：** 此处定义的Subagents在所有项目中可用。与项目代理格式相同。

---

### agent-memory/

**简介：** 带有 `memory: user` 的Subagents的持久记忆

**何时加载：** Subagents启动时加载到Subagents系统提示中

**描述：** 在 frontmatter 中设置了 `memory: user` 的Subagents在此存储跨所有项目持久化的知识。对于项目范围的Subagents记忆，请参见 `.claude/agent-memory/`。

---

## 未显示的内容

此页面涵盖你编写和编辑的文件。一些相关文件位于其他位置：

| 文件 | 位置 | 用途 |
| --- | --- | --- |
| `managed-settings.json` | 系统级，因操作系统而异 | 企业强制设置，你无法覆盖。参见服务器托管设置 |
| `CLAUDE.local.md` | 项目根目录 | 你在此项目的私人偏好，与 CLAUDE.md 一起加载。手动创建并添加到 `.gitignore` |
| 已安装的Plugins | `~/.claude/plugins/` | 克隆的市场、已安装的Plugins版本和每个Plugins的数据，由 `csc plugin` 命令管理。孤立版本在Plugins更新或卸载后 7 天删除。参见Plugins缓存 |

`~/.claude` 还保存 CSC 在工作时写入的数据：转录、提示历史、文件快照、缓存和日志。参见下面的应用数据。

## 文件参考

此表列出了页面涵盖的每个文件。项目范围文件位于你仓库的 `.claude/` 下（或对于 `CLAUDE.md`、`.mcp.json` 和 `.worktreeinclude` 在根目录）。全局范围文件位于 `~/.claude/` 并适用于所有项目。

> **注意：** 有几件事可以覆盖你放在这些文件中的内容：
> - 你的组织部署的托管设置优先于一切
> - CLI 标志如 `--permission-mode` 或 `--settings` 覆盖该会话的 `settings.json`
> - 某些环境变量优先于其等效设置，但这因情况而异：请查看每个变量的环境变量参考
>
> 有关完整顺序，请参见设置优先级。

| 文件 | 范围 | 提交 | 作用 |
| --- | --- | --- | --- |
| `CLAUDE.md` | 项目和全局 | ✓ | 每次会话加载的指令 |
| `rules/*.md` | 项目和全局 | ✓ | 按主题范围的指令，可选地按路径限制 |
| `settings.json` | 项目和全局 | ✓ | 权限、hooks、环境变量、模型默认值 |
| `settings.local.json` | 仅项目 | | 你的个人覆盖，自动 gitignore |
| `.mcp.json` | 仅项目 | ✓ | 团队共享的 MCP 服务器 |
| `.worktreeinclude` | 仅项目 | ✓ | 复制到新工作树的 gitignore 文件 |
| `skills/<name>/SKILL.md` | 项目和全局 | ✓ | 通过 `/name` 调用或自动调用的可重用提示 |
| `commands/*.md` | 项目和全局 | ✓ | 单文件提示；与 skills 同一机制 |
| `output-styles/*.md` | 项目和全局 | ✓ | 自定义系统提示部分 |
| `agents/*.md` | 项目和全局 | ✓ | 拥有自己提示和工具的Subagents定义 |
| `agent-memory/<name>/` | 项目和全局 | ✓ | Subagents的持久记忆 |
| `~/.claude.json` | 仅全局 | | 应用状态、OAuth、UI 开关、个人 MCP 服务器 |
| `projects/<project>/memory/` | 仅全局 | | 自动记忆：CSC 跨会话给自己的笔记 |
| `keybindings.json` | 仅全局 | | 自定义键盘快捷键 |

## 检查已加载的内容

此页面显示哪些文件可以存在。要查看当前会话中实际加载了什么，请使用以下命令：

| 命令 | 显示内容 |
| --- | --- |
| `/context` | 按类别的令牌使用：系统提示、记忆文件、Skills、MCP 工具和消息 |
| `/memory` | 哪些 CLAUDE.md 和 rules 文件已加载，以及自动记忆条目 |
| `/agents` | 已配置的Subagents及其设置 |
| `/hooks` | 活跃的 hook 配置 |
| `/mcp` | 已连接的 MCP 服务器及其状态 |
| `/skills` | 来自项目、用户和Plugins源的可用Skills |
| `/permissions` | 当前的允许和拒绝规则 |
| `/doctor` | 安装和配置诊断 |

先运行 `/context` 获取概览，然后使用特定命令调查你关注的领域。

## 应用数据

除了你编写的配置外，`~/.claude` 还保存 CSC 在会话期间写入的数据。这些文件是纯文本。任何通过工具的内容都会写入磁盘上的转录：文件内容、命令输出、粘贴的文本。

### 自动清理

以下路径中的文件在启动时一旦超过 `cleanupPeriodDays` 指定的天数就会被删除。默认为 30 天。

| `~/.claude/` 下的路径 | 内容 |
| --- | --- |
| `projects/<project>/<session>.jsonl` | 完整对话转录：每条消息、工具调用和工具结果 |
| `projects/<project>/<session>/tool-results/` | 溢出到单独文件的大型工具输出 |
| `file-history/<session>/` | CSC 更改文件的编辑前快照，用于检查点恢复 |
| `plans/` | 计划模式下写入的计划文件 |
| `debug/` | 每次会话的调试日志，仅在使用 `--debug` 启动或运行 `/debug` 时写入 |
| `paste-cache/`、`image-cache/` | 大型粘贴和附加图片的内容 |
| `session-env/` | 每次会话的环境元数据 |

### 保留直到你删除

以下路径不受自动清理覆盖，将无限期保留。

| `~/.claude/` 下的路径 | 内容 |
| --- | --- |
| `history.jsonl` | 你输入的每个提示，附带时间戳和项目路径。用于上箭头回忆。 |
| `stats-cache.json` | `/cost` 显示的汇总令牌和费用计数 |
| `backups/` | 配置迁移前拍摄的 `~/.claude.json` 带时间戳的副本 |
| `todos/` | 旧版每次会话的任务列表。当前版本不再写入；可安全删除。 |

`shell-snapshots/` 保存运行时文件，在会话正常退出时删除。其他小型缓存和锁定文件会根据你使用的功能出现，可以安全删除。

### 纯文本存储

转录和历史记录在静态存储时不加密。操作系统文件权限是唯一的保护。如果工具读取 `.env` 文件或命令打印凭证，该值会写入 `projects/<project>/<session>.jsonl`。要减少暴露：

- 降低 `cleanupPeriodDays` 以缩短转录保留时间
- 在非交互模式下，将 `--no-session-persistence` 与 `-p` 一起使用以完全跳过写入转录。在 Agent SDK 中，设置 `persistSession: false`。没有交互模式的等效选项。
- 使用权限规则拒绝读取凭证文件

### 清除本地数据

你可以随时删除上述任何应用数据路径。新会话不受影响。下表显示你会丢失的过去会话数据。

| 删除 | 你会丢失 |
| --- | --- |
| `~/.claude/projects/` | 过去会话的恢复、继续和回退 |
| `~/.claude/history.jsonl` | 上箭头提示回忆 |
| `~/.claude/file-history/` | 过去会话的检查点恢复 |
| `~/.claude/stats-cache.json` | `/cost` 显示的历史总计 |
| `~/.claude/backups/` | 过去配置迁移中 `~/.claude.json` 的回滚副本 |
| `~/.claude/debug/`、`~/.claude/plans/`、`~/.claude/paste-cache/`、`~/.claude/image-cache/`、`~/.claude/session-env/` | 无用户可见内容 |
| `~/.claude/todos/` | 无。旧版目录，当前版本不再写入。 |

不要删除 `~/.claude.json`、`~/.claude/settings.json` 或 `~/.claude/plugins/`：它们保存你的认证、偏好和已安装的Plugins。
