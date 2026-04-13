---
sidebar_position: 2
---

# 配置权限

> 通过细粒度的权限规则、模式和管理策略，控制 CSC 可以访问和执行的操作。

CSC 支持细粒度权限，你可以精确指定代理允许执行和禁止执行的操作。权限设置可以纳入版本控制并分发给组织中的所有开发者，也可以由个人开发者自定义。

## 权限系统

CSC 使用分层权限系统来平衡能力与安全性：

| 工具类型         | 示例          | 是否需要批准 | "是，不再询问" 行为               |
| :---------------- | :--------------- | :---------------- | :-------------------------------------------- |
| 只读         | 文件读取、Grep | 否                | 不适用                                           |
| Bash 命令     | Shell 执行  | 是               | 按项目目录和命令永久生效 |
| 文件修改 | 编辑/写入文件 | 是               | 直到会话结束                             |

## 管理权限

你可以使用 `/permissions` 查看和管理 CSC 的工具权限。此 UI 列出所有权限规则及其来源的 settings.json 文件。

* **Allow** 规则允许 CSC 无需手动批准即可使用指定工具。
* **Ask** 规则在 CSC 尝试使用指定工具时提示确认。
* **Deny** 规则阻止 CSC 使用指定工具。

规则按以下顺序评估：**deny -> ask -> allow**。第一个匹配的规则生效，因此 deny 规则始终优先。

## 权限模式

CSC 支持多种权限模式来控制工具的批准方式。有关何时使用每种模式，请参阅权限模式。在设置文件中设置 `defaultMode`：

| 模式                | 描述                                                                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`           | 标准行为：首次使用每个工具时提示权限                                                                                                |
| `acceptEdits`       | 自动接受工作目录或 `additionalDirectories` 中路径的文件编辑和常见文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等） |
| `plan`              | 计划模式：CSC 可以分析但不能修改文件或执行命令                                                                                             |
| `auto`              | 自动批准工具调用，并通过后台安全检查验证操作是否符合你的请求。目前为研究预览版                                   |
| `dontAsk`           | 除非通过 `/permissions` 或 `permissions.allow` 规则预先批准，否则自动拒绝工具                                                                              |
| `bypassPermissions` | 跳过权限提示，但写入受保护目录时除外（见下方警告）                                                                            |

> **⚠️ 警告：** `bypassPermissions` 模式会跳过权限提示。写入 `.git`、`.claude`、`.vscode`、`.idea` 和 `.husky` 目录仍会提示确认，以防止意外损坏仓库状态、编辑器配置和 git 钩子。写入 `.claude/commands`、`.claude/agents` 和 `.claude/skills` 豁免且不提示，因为 CSC 在创建技能、子代理和命令时会常规写入这些目录。仅在 CSC 无法造成损害的隔离环境（如容器或 VM）中使用此模式。管理员可以通过在托管设置中将 `permissions.disableBypassPermissionsMode` 设置为 `"disable"` 来阻止此模式。

要阻止使用 `bypassPermissions` 或 `auto` 模式，在任何设置文件中将 `permissions.disableBypassPermissionsMode` 或 `permissions.disableAutoMode` 设置为 `"disable"`。这些在托管设置中最有用，因为它们不能被覆盖。

## 权限规则语法

权限规则遵循 `Tool` 或 `Tool(specifier)` 格式。

### 匹配工具的所有用法

要匹配工具的所有用法，只需使用工具名称，不加括号：

| 规则       | 效果                         |
| :--------- | :----------------------------- |
| `Bash`     | 匹配所有 Bash 命令      |
| `WebFetch` | 匹配所有 Web 获取请求 |
| `Read`     | 匹配所有文件读取         |

`Bash(*)` 等同于 `Bash`，匹配所有 Bash 命令。

### 使用说明符进行细粒度控制

在括号中添加说明符以匹配特定工具用法：

| 规则                           | 效果                                                   |
| :----------------------------- | :------------------------------------------------------- |
| `Bash(npm run build)`          | 匹配精确命令 `npm run build`                |
| `Read(./.env)`                 | 匹配读取当前目录中的 `.env` 文件 |
| `WebFetch(domain:example.com)` | 匹配对 example.com 的获取请求                    |

### 通配符模式

Bash 规则支持使用 `*` 的 glob 模式。通配符可以出现在命令中的任何位置。此配置允许 npm 和 git commit 命令，同时阻止 git push：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git commit *)",
      "Bash(git * main)",
      "Bash(* --version)",
      "Bash(* --help *)"
    ],
    "deny": [
      "Bash(git push *)"
    ]
  }
}
```

`*` 前的空格很重要：`Bash(ls *)` 匹配 `ls -la` 但不匹配 `lsof`，而 `Bash(ls*)` 两者都匹配。`:*` 后缀是编写尾部通配符的等效方式。`Bash(ls:*)` 匹配与 `Bash(ls *)` 相同的命令。

## 工具特定权限规则

### Bash

Bash 权限规则支持使用 `*` 的通配符匹配。通配符可以出现在命令中的任何位置，包括开头、中间或结尾：

* `Bash(npm run build)` 匹配精确的 Bash 命令 `npm run build`
* `Bash(npm run test *)` 匹配以 `npm run test` 开头的 Bash 命令
* `Bash(npm *)` 匹配任何以 `npm ` 开头的命令
* `Bash(* install)` 匹配任何以 ` install` 结尾的命令
* `Bash(git * main)` 匹配如 `git checkout main`、`git merge main` 等命令

当 `*` 出现在末尾且前面有空格时（如 `Bash(ls *)`），它会强制执行词边界，要求前缀后跟空格或字符串结尾。例如，`Bash(ls *)` 匹配 `ls -la` 但不匹配 `lsof`。相比之下，没有空格的 `Bash(ls*)` 匹配 `ls -la` 和 `lsof`，因为没有词边界约束。

> **💡 提示：** CSC 了解 shell 运算符（如 `&&`），因此像 `Bash(safe-cmd *)` 这样的前缀匹配规则不会授予运行 `safe-cmd && other-cmd` 命令的权限。

当你使用"是，不再询问"批准复合命令时，CSC 会为每个需要批准的子命令保存单独的规则，而不是为整个复合字符串保存单个规则。例如，批准 `git status && npm test` 会为 `npm test` 保存规则，因此未来的 `npm test` 调用无论 `&&` 前面是什么都会被识别。进入子目录的 `cd` 等子命令会为该路径生成自己的 Read 规则。单个复合命令最多可保存 5 条规则。

> **⚠️ 警告：** 试图约束命令参数的 Bash 权限模式是脆弱的。例如，`Bash(curl http://github.com/ *)` 旨在将 curl 限制为 GitHub URL，但不会匹配以下变体：

  * URL 前的选项：`curl -X GET http://github.com/...`
  * 不同协议：`curl https://github.com/...`
  * 重定向：`curl -L http://bit.ly/xyz`（重定向到 github）
  * 变量：`URL=http://github.com && curl $URL`
  * 额外空格：`curl  http://github.com`

  更可靠的 URL 过滤方式：

  * **限制 Bash 网络工具**：使用 deny 规则阻止 `curl`、`wget` 等命令，然后使用 WebFetch 工具配合 `WebFetch(domain:github.com)` 权限访问允许的域名
  * **使用 PreToolUse 钩子**：实现一个验证 Bash 命令中 URL 并阻止不允许域名的钩子
  * 通过 CLAUDE.md 告知 CSC 你允许的 curl 模式

  注意，仅使用 WebFetch 并不能阻止网络访问。如果 Bash 被允许，CSC 仍然可以使用 `curl`、`wget` 或其他工具访问任何 URL。

### Read 和 Edit

`Edit` 规则适用于所有编辑文件的内置工具。CSC 会尽力将 `Read` 规则应用于所有读取文件的内置工具，如 Grep 和 Glob。

> **⚠️ 警告：** Read 和 Edit deny 规则适用于 CSC 的内置文件工具，而不适用于 Bash 子进程。`Read(./.env)` deny 规则阻止 Read 工具，但不能阻止 Bash 中的 `cat .env`。要实现阻止所有进程访问路径的操作系统级强制执行，请启用沙箱。

Read 和 Edit 规则都遵循 gitignore 规范，有四种不同的模式类型：

| 模式            | 含义                                | 示例                          | 匹配项                        |
| ------------------ | -------------------------------------- | -------------------------------- | ------------------------------ |
| `//path`           | 从文件系统根目录的**绝对**路径 | `Read(//Users/alice/secrets/**)` | `/Users/alice/secrets/**`      |
| `~/path`           | 从**主**目录的路径           | `Read(~/Documents/*.pdf)`        | `/Users/alice/Documents/*.pdf` |
| `/path`            | 相对于**项目根目录**的路径      | `Edit(/src/**/*.ts)`             | `<project root>/src/**/*.ts`   |
| `path` 或 `./path` | 相对于**当前目录**的路径 | `Read(*.env)`                    | `<cwd>/*.env`                  |

> **⚠️ 警告：** 像 `/Users/alice/file` 这样的模式不是绝对路径。它是相对于项目根目录的。绝对路径请使用 `//Users/alice/file`。

在 Windows 上，路径在匹配前会标准化为 POSIX 形式。`C:\Users\alice` 变为 `/c/Users/alice`，因此使用 `//c/**/.env` 匹配该驱动器上任何位置的 `.env` 文件。要跨所有驱动器匹配，使用 `//**/.env`。

示例：

* `Edit(/docs/**)`：编辑 `<project>/docs/` 中的文件（不是 `/docs/`，也不是 `<project>/.claude/docs/`）
* `Read(~/.zshrc)`：读取主目录的 `.zshrc`
* `Edit(//tmp/scratch.txt)`：编辑绝对路径 `/tmp/scratch.txt`
* `Read(src/**)`：从 `<当前目录>/src/` 读取

> **注意：** 在 gitignore 模式中，`*` 匹配单个目录中的文件，而 `**` 递归匹配跨目录的文件。要允许所有文件访问，只需使用不带括号的工具名称：`Read`、`Edit` 或 `Write`。

### WebFetch

* `WebFetch(domain:example.com)` 匹配对 example.com 的获取请求

### MCP

* `mcp__puppeteer` 匹配 `puppeteer` 服务器提供的任何工具（在 CSC 中配置的名称）
* `mcp__puppeteer__*` 通配符语法，也匹配 `puppeteer` 服务器的所有工具
* `mcp__puppeteer__puppeteer_navigate` 匹配 `puppeteer` 服务器提供的 `puppeteer_navigate` 工具

### Agent（子代理）

使用 `Agent(AgentName)` 规则控制 CSC 可以使用哪些子代理：

* `Agent(Explore)` 匹配 Explore 子代理
* `Agent(Plan)` 匹配 Plan 子代理
* `Agent(my-custom-agent)` 匹配名为 `my-custom-agent` 的自定义子代理

将这些规则添加到设置中的 `deny` 数组，或使用 `--disallowedTools` CLI 标志来禁用特定代理。要禁用 Explore 代理：

```json
{
  "permissions": {
    "deny": ["Agent(Explore)"]
  }
}
```

## 使用钩子扩展权限

CSC 钩子提供了一种注册自定义 shell 命令以在运行时执行权限评估的方式。当 CSC 进行工具调用时，PreToolUse 钩子在权限提示之前运行。钩子输出可以拒绝工具调用、强制提示或跳过提示让调用继续。

跳过提示不会绕过权限规则。deny 和 ask 规则仍在钩子返回 `"allow"` 后评估，因此匹配的 deny 规则仍会阻止调用。这保留了管理权限中描述的 deny 优先原则，包括托管设置中的 deny 规则。

阻塞钩子也优先于 allow 规则。以退出码 2 退出的钩子在权限规则评估之前停止工具调用，因此即使 allow 规则允许调用继续，阻塞仍然适用。要在没有提示的情况下运行所有 Bash 命令（除了少数你想阻止的命令），将 `"Bash"` 添加到你的 allow 列表，并注册一个拒绝这些特定命令的 PreToolUse 钩子。

## 工作目录

默认情况下，CSC 可以访问其启动目录中的文件。你可以扩展此访问：

* **启动时**：使用 `--add-dir <path>` CLI 参数
* **会话期间**：使用 `/add-dir` 命令
* **持久配置**：在设置文件中添加到 `additionalDirectories`

附加目录中的文件遵循与原始工作目录相同的权限规则：它们无需提示即可读取，文件编辑权限遵循当前权限模式。

### 附加目录授予文件访问权限，而非配置

添加目录扩展了 CSC 可以读取和编辑文件的位置。它不会使该目录成为完整的配置根目录：大多数 `.claude/` 配置不会从附加目录发现，但有少数类型作为例外加载。

以下配置类型从 `--add-dir` 目录加载：

| 配置                                      | 从 `--add-dir` 加载                                           |
| :------------------------------------------------- | :---------------------------------------------------------------- |
| `.claude/skills/` 中的技能          | 是，支持实时重载                                             |
| `.claude/settings.json` 中的插件设置         | 仅 `enabledPlugins` 和 `extraKnownMarketplaces`                |
| CLAUDE.md 文件和 `.claude/rules/` | 仅在设置 `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` 时 |

其他所有内容，包括子代理、命令、输出样式、钩子和其他设置，仅从当前工作目录及其父目录、`~/.claude/` 的用户目录和托管设置中发现。要跨项目共享该配置，使用以下方法之一：

* **用户级配置**：将文件放在 `~/.claude/agents/`、`~/.claude/output-styles/` 或 `~/.claude/settings.json` 中，使其在每个项目中可用
* **插件**：将配置打包为插件，供团队安装
* **从配置目录启动**：从包含你想要的 `.claude/` 配置的目录运行 CSC

## 权限与沙箱的交互

权限和沙箱是互补的安全层：

* **权限**控制 CSC 可以使用哪些工具以及可以访问哪些文件或域名。它们适用于所有工具（Bash、Read、Edit、WebFetch、MCP 等）。
* **沙箱**提供操作系统级强制执行，限制 Bash 工具的文件系统和网络访问。它仅适用于 Bash 命令及其子进程。

两者结合实现深度防御：

* 权限 deny 规则阻止 CSC 甚至尝试访问受限资源
* 沙箱限制阻止 Bash 命令访问定义边界之外的资源，即使提示注入绕过了 CSC 的决策
* 沙箱中的文件系统限制使用 Read 和 Edit deny 规则，而不是单独的沙箱配置
* 网络限制结合 WebFetch 权限规则和沙箱的 `allowedDomains` 列表

当启用沙箱且 `autoAllowBashIfSandboxed: true`（这是默认值）时，沙箱化的 Bash 命令无需提示即可运行，即使你的权限包含 `ask: Bash(*)`。沙箱边界替代了按命令提示。

## 托管设置

对于需要集中控制 CSC 配置的组织，管理员可以部署无法被用户或项目设置覆盖的托管设置。这些策略设置遵循与常规设置文件相同的格式，可以通过 MDM/操作系统级策略、托管设置文件或服务器托管设置交付。

### 仅托管设置

以下设置仅从托管设置中读取。将它们放在用户或项目设置文件中没有效果。

| 设置                                        | 描述                                                                                                                                                                                                                                 |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `allowedChannelPlugins`                        | 允许推送消息的通道插件白名单。设置后替换默认的 Anthropic 白名单。需要 `channelsEnabled: true`。请参阅限制哪些通道插件可以运行 |
| `allowManagedHooksOnly`                        | 当为 `true` 时，仅加载托管钩子、SDK 钩子和在托管设置 `enabledPlugins` 中强制启用的插件钩子。用户、项目和所有其他插件钩子被阻止                                                     |
| `allowManagedMcpServersOnly`                   | 当为 `true` 时，仅尊重托管设置中的 `allowedMcpServers`。`deniedMcpServers` 仍从所有来源合并。请参阅托管 MCP 配置                                             |
| `allowManagedPermissionRulesOnly`              | 当为 `true` 时，阻止用户和项目设置定义 `allow`、`ask` 或 `deny` 权限规则。仅托管设置中的规则适用                                                                                              |
| `blockedMarketplaces`                          | 市场来源黑名单。被阻止的来源在下载前检查，因此它们永远不会触及文件系统。请参阅托管市场限制                      |
| `channelsEnabled`                              | 允许团队和企业用户使用通道。未设置或为 `false` 时，无论用户向 `--channels` 传递什么，都会阻止通道消息交付                                                                                |
| `forceRemoteSettingsRefresh`                   | 当为 `true` 时，阻止 CLI 启动，直到远程托管设置被新鲜获取，如果获取失败则退出。请参阅故障关闭强制执行                                      |
| `pluginTrustMessage`                           | 安装前显示的插件信任警告后附加的自定义消息                                                                                                                                                               |
| `sandbox.filesystem.allowManagedReadPathsOnly` | 当为 `true` 时，仅尊重托管设置中的 `filesystem.allowRead` 路径。`denyRead` 仍从所有来源合并                                                                                                                |
| `sandbox.network.allowManagedDomainsOnly`      | 当为 `true` 时，仅尊重托管设置中的 `allowedDomains` 和 `WebFetch(domain:...)` allow 规则。未允许的域名自动阻止，不提示用户。被拒绝的域名仍从所有来源合并        |
| `strictKnownMarketplaces`                      | 控制用户可以添加哪些插件市场。请参阅托管市场限制                                                                                          |

`disableBypassPermissionsMode` 通常放在托管设置中以强制执行组织策略，但它可以从任何范围生效。用户可以在自己的设置中设置它来锁定自己无法使用绕过模式。

> **注意：** 对远程控制和 Web 会话的访问不受托管设置键控制。在团队和企业计划中，管理员在 CSC 管理设置中启用或禁用这些功能。

## 查看自动模式拒绝

当自动模式拒绝工具调用时，会出现通知，被拒绝的操作会记录在 `/permissions` 的"最近拒绝"标签下。在被拒绝的操作上按 `r` 将其标记为重试：当你退出对话框时，CSC 会发送一条消息告诉模型可以重试该工具调用，并恢复对话。

要以编程方式响应拒绝，请使用 `PermissionDenied` 钩子。

## 配置自动模式分类器

自动模式使用分类器模型来决定每个操作是否可以安全运行而无需提示。开箱即用时，它仅信任工作目录和（如果存在）当前仓库的远程仓库。像推送到公司源代码控制组织或写入团队云存储桶这样的操作将被阻止，视为潜在的数据泄露。`autoMode` 设置块让你告诉分类器你的组织信任哪些基础设施。

分类器从用户设置、`.claude/settings.local.json` 和托管设置中读取 `autoMode`。它不从 `.claude/settings.json` 中的共享项目设置读取，因为签入的仓库可能会注入自己的 allow 规则。

| 范围                      | 文件                          | 用途                                             |
| :------------------------- | :---------------------------- | :-------------------------------------------------- |
| 单个开发者              | `~/.claude/settings.json`     | 个人信任的基础设施                     |
| 单个项目、单个开发者 | `.claude/settings.local.json` | 每个项目的信任存储桶或服务，已 gitignore |
| 组织范围          | 托管设置              | 为所有开发者强制执行的信任基础设施  |

每个范围的条目会合并。开发者可以用个人条目扩展 `environment`、`allow` 和 `soft_deny`，但不能删除托管设置提供的条目。因为 allow 规则在分类器内部作为阻止规则的例外，开发者添加的 `allow` 条目可以覆盖组织的 `soft_deny` 条目：组合是累加的，不是硬策略边界。如果你需要开发者无法绕过的规则，请改用托管设置中的 `permissions.deny`，它在分类器被咨询之前阻止操作。

### 定义信任的基础设施

对于大多数组织，`autoMode.environment` 是你唯一需要设置的字段。它告诉分类器哪些仓库、存储桶和域名是受信任的，而不触及内置的阻止和允许规则。分类器使用 `environment` 来决定"外部"的含义：任何未列出的目的地都是潜在的泄露目标。

```json
{
  "autoMode": {
    "environment": [
      "源代码控制：github.example.com/acme-corp 及其下的所有仓库",
      "信任的云存储桶：s3://acme-build-artifacts, gs://acme-ml-datasets",
      "信任的内部域名：*.corp.example.com, api.internal.example.com",
      "关键内部服务：Jenkins 位于 ci.example.com，Artifactory 位于 artifacts.example.com"
    ]
  }
}
```

条目是散文，不是正则表达式或工具模式。分类器将它们作为自然语言规则读取。像向新工程师描述你的基础设施那样编写它们。一个详尽的环境部分涵盖：

* **组织**：你的公司名称和 CSC 主要用途，如软件开发、基础设施自动化或数据工程
* **源代码控制**：你的开发者推送到的每个 GitHub、GitLab 或 Bitbucket 组织
* **云提供商和信任的存储桶**：CSC 应该能够读取和写入的存储桶名称或前缀
* **信任的内部域名**：你网络内的 API、仪表板和服务的主机名，如 `*.internal.example.com`
* **关键内部服务**：CI、构件注册表、内部包索引、事件工具
* **额外上下文**：影响分类器应视为风险因素的受监管行业约束、多租户基础设施或合规要求

一个有用的起始模板：填写括号中的字段并删除不适用的行：

```json
{
  "autoMode": {
    "environment": [
      "组织：{公司名称}。主要用途：{主要用例，例如软件开发、基础设施自动化}",
      "源代码控制：{源代码控制，例如 GitHub 组织 github.example.com/acme-corp}",
      "云提供商：{云提供商，例如 AWS、GCP、Azure}",
      "信任的云存储桶：{信任的存储桶，例如 s3://acme-builds, gs://acme-datasets}",
      "信任的内部域名：{信任的域名，例如 *.internal.example.com, api.example.com}",
      "关键内部服务：{服务，例如 Jenkins 位于 ci.example.com，Artifactory 位于 artifacts.example.com}",
      "额外上下文：{额外信息，例如受监管行业、多租户基础设施、合规要求}"
    ]
  }
}
```

你提供的上下文越具体，分类器就越能区分常规内部操作和泄露尝试。

你不需要一次填写所有内容。合理的推出方式：从默认值开始，添加你的源代码控制组织和关键内部服务，这解决了最常见的误报，如推送到你自己的仓库。接下来添加信任的域名和云存储桶。在遇到阻止时填写其余部分。

### 覆盖阻止和允许规则

两个额外字段让你替换分类器的内置规则列表：`autoMode.soft_deny` 控制被阻止的内容，`autoMode.allow` 控制适用的例外。每个都是散文描述数组，作为自然语言规则读取。

在分类器内部，优先级是：`soft_deny` 规则先阻止，然后 `allow` 规则作为例外覆盖，最后显式用户意图覆盖两者。如果用户的消息直接且具体地描述了 CSC 即将采取的确切操作，分类器会允许它，即使 `soft_deny` 规则匹配。一般请求不算：要求 CSC"清理仓库"不授权强制推送，但要求 CSC"强制推送此分支"则授权。

要放宽：当默认值阻止了你的管道已通过 PR 审查、CI 或暂存环境保护的内容时，从 `soft_deny` 中删除规则，或者当分类器反复标记默认例外未覆盖的常规模式时，添加到 `allow`。要收紧：为默认值遗漏的特定于你环境的风险添加到 `soft_deny`，或者从 `allow` 中删除以将默认例外保留到阻止规则。在所有情况下，运行 `csc auto-mode defaults` 获取完整的默认列表，然后复制并编辑：永远不要从空列表开始。

```json
{
  "autoMode": {
    "environment": [
      "源代码控制：github.example.com/acme-corp 及其下的所有仓库"
    ],
    "allow": [
      "部署到暂存命名空间是允许的：暂存与生产隔离且每晚重置",
      "写入 s3://acme-scratch/ 是允许的：具有 7 天生命周期策略的临时存储桶"
    ],
    "soft_deny": [
      "永远不要在迁移 CLI 之外运行数据库迁移，即使是针对开发数据库",
      "永远不要修改 infra/terraform/prod/ 下的文件：生产基础设施变更通过审查工作流进行",
      "...先在此处复制完整的默认 soft_deny 列表，然后添加你的规则..."
    ]
  }
}
```

> **⚠️ 警告：** 设置 `allow` 或 `soft_deny` 会替换该部分的整个默认列表。如果你用单个条目设置 `soft_deny`，每个内置阻止规则都会被丢弃：强制推送、数据泄露、`curl | bash`、生产部署和所有其他默认阻止规则都将变为允许。要安全地自定义，运行 `csc auto-mode defaults` 打印内置规则，将它们复制到你的设置文件中，然后根据你自己的管道和风险容忍度审查每条规则。仅删除你的基础设施已缓解的风险规则。

三个部分独立评估，因此仅设置 `environment` 会保留默认的 `allow` 和 `soft_deny` 列表。

### 检查默认值和有效配置

因为设置 `allow` 或 `soft_deny` 会替换默认值，所以通过复制完整的默认列表开始任何自定义。三个 CLI 子命令帮助你检查和验证：

```bash
csc auto-mode defaults  # 内置的 environment、allow 和 soft_deny 规则
csc auto-mode config    # 分类器实际使用的：你的设置（如果已设置），否则为默认值
csc auto-mode critique  # 获取关于你的自定义 allow 和 soft_deny 规则的 AI 反馈
```

将 `csc auto-mode defaults` 的输出保存到文件，编辑列表以匹配你的策略，然后将结果粘贴到你的设置文件中。保存后，运行 `csc auto-mode config` 确认有效规则符合你的预期。如果你编写了自定义规则，`csc auto-mode critique` 会审查它们并标记模糊、冗余或可能导致误报的条目。

## 设置优先级

权限规则遵循与所有其他 CSC 设置相同的设置优先级：

1. **托管设置**：不能被任何其他级别覆盖，包括命令行参数
2. **命令行参数**：临时会话覆盖
3. **本地项目设置**（`.claude/settings.local.json`）
4. **共享项目设置**（`.claude/settings.json`）
5. **用户设置**（`~/.claude/settings.json`）

如果工具在任何级别被拒绝，没有其他级别可以允许它。例如，托管设置的 deny 不能被 `--allowedTools` 覆盖，`--disallowedTools` 可以在托管设置定义之外添加限制。

如果权限在用户设置中被允许但在项目设置中被拒绝，项目设置优先，权限被阻止。

## 示例配置

此仓库包含常见部署场景的起始设置配置。将这些作为起点并根据你的需要进行调整。
