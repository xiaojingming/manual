---
sidebar_position: 1
---

# CSC 设置

> 使用全局和项目级设置以及环境变量来配置 CSC。

CSC 提供了各种设置来配置其行为以满足您的需求。您可以通过在使用交互式 REPL 时运行 `/config` 命令来配置 CSC，这将打开一个带标签的设置界面，您可以在其中查看状态信息并修改配置选项。

## 配置范围

CSC 使用**范围系统**来确定配置的应用位置和共享对象。了解范围有助于您决定如何为个人使用、团队协作或企业部署配置 CSC。

### 可用范围

| 范围       | 位置                                                                           | 影响对象                       | 与团队共享？      |
| :---------- | :--------------------------------------------------------------------------------- | :----------------------------------- | :--------------------- |
| **托管** | 服务器管理的设置、plist / 注册表或系统级 `managed-settings.json` | 机器上的所有用户             | 是（由 IT 部署）   |
| **用户**    | `~/.claude/` 目录                                                             | 您，跨所有项目             | 否                     |
| **项目** | 仓库中的 `.claude/`                                                           | 此仓库的所有协作者 | 是（提交到 git） |
| **本地**   | `.claude/settings.local.json`                                                      | 您，仅在此仓库中         | 否（gitignored）        |

### 何时使用各范围

**托管范围**适用于：

* 必须在全组织范围内强制执行的安全策略
* 不可覆盖的合规要求
* 由 IT/DevOps 部署的标准化配置

**用户范围**最适合：

* 您希望在所有地方使用的个人偏好（主题、编辑器设置）
* 您在所有项目中使用的工具和插件
* API 密钥和身份验证（安全存储）

**项目范围**最适合：

* 团队共享设置（权限、钩子、MCP 服务器）
* 整个团队应具备的插件
* 跨协作者标准化工具

**本地范围**最适合：

* 特定项目的个人覆盖
* 在与团队共享之前测试配置
* 对其他人不适用的机器特定设置

### 范围如何交互

当同一设置在多个范围中配置时，更具体的范围优先：

1. **托管**（最高） - 不能被任何东西覆盖
2. **命令行参数** - 临时会话覆盖
3. **本地** - 覆盖项目和用户设置
4. **项目** - 覆盖用户设置
5. **用户**（最低） - 当没有其他设置指定时应用

例如，如果某个权限在用户设置中被允许但在项目设置中被拒绝，则项目设置优先，该权限被阻止。

### 哪些功能使用范围

范围适用于许多 CSC 功能：

| 功能         | 用户位置             | 项目位置                   | 本地位置                 |
| :-------------- | :------------------------ | :--------------------------------- | :----------------------------- |
| **设置**    | `~/.claude/settings.json` | `.claude/settings.json`            | `.claude/settings.local.json`  |
| **子代理**   | `~/.claude/agents/`       | `.claude/agents/`                  | 无                           |
| **MCP 服务器** | `~/.claude.json`          | `.mcp.json`                        | `~/.claude.json`（按项目） |
| **插件**     | `~/.claude/settings.json` | `.claude/settings.json`            | `.claude/settings.local.json`  |
| **CLAUDE.md**   | `~/.claude/CLAUDE.md`     | `CLAUDE.md` 或 `.claude/CLAUDE.md` | `CLAUDE.local.md`              |

***

## 设置文件

`settings.json` 文件是通过分层设置配置 CSC 的官方机制：

* **用户设置**定义在 `~/.claude/settings.json` 中，适用于所有项目。
* **项目设置**保存在您的项目目录中：
  * `.claude/settings.json` 用于签入源代码控制并与团队共享的设置
  * `.claude/settings.local.json` 用于未签入的设置，适用于个人偏好和实验。CSC 在创建时会配置 git 忽略 `.claude/settings.local.json`。
* **托管设置**：对于需要集中控制的组织，CSC 支持多种托管设置的交付机制。所有机制使用相同的 JSON 格式，且不能被用户或项目设置覆盖：

  * **服务器管理的设置**：通过 Claude.ai 管理控制台从 Anthropic 的服务器交付。参见服务器管理的设置。
  * **MDM/OS 级别策略**：通过 macOS 和 Windows 上的本机设备管理交付：
    * macOS：`com.anthropic.claudecode` 托管偏好域（通过 Jamf、Iru (Kandji) 或其他 MDM 工具中的配置文件部署）
    * Windows：`HKLM\SOFTWARE\Policies\ClaudeCode` 注册表键，包含 JSON 的 `Settings` 值（REG\_SZ 或 REG\_EXPAND\_SZ）（通过组策略或 Intune 部署）
    * Windows（用户级别）：`HKCU\SOFTWARE\Policies\ClaudeCode`（最低策略优先级，仅在不存在管理员级别来源时使用）
  * **基于文件**：部署到系统目录的 `managed-settings.json` 和 `managed-mcp.json`：

    * macOS：`/Library/Application Support/ClaudeCode/`
    * Linux 和 WSL：`/etc/claude-code/`
    * Windows：`C:\Program Files\ClaudeCode\`

    > **⚠️ 警告：** 自 v2.1.75 起，旧版 Windows 路径 `C:\ProgramData\ClaudeCode\managed-settings.json` 不再受支持。部署设置到该位置的管理员必须将文件迁移到 `C:\Program Files\ClaudeCode\managed-settings.json`。

    基于文件的托管设置还在同一系统目录中支持 `managed-settings.d/` 放置目录，与 `managed-settings.json` 并列。这让不同团队可以部署独立的策略片段，而无需协调对单个文件的编辑。

    遵循 systemd 约定，`managed-settings.json` 首先作为基础合并，然后放置目录中的所有 `*.json` 文件按字母顺序排序并在其上层合并。对于标量值，后面的文件覆盖前面的文件；数组被连接并去重；对象被深度合并。以 `.` 开头的隐藏文件被忽略。

    使用数字前缀控制合并顺序，例如 `10-telemetry.json` 和 `20-security.json`。

  有关详细信息，请参见托管设置和托管 MCP 配置。

  此仓库包含 Jamf、Iru (Kandji)、Intune 和组策略的入门部署模板。将这些作为起点并根据需要进行调整。

  > **注意：** 托管部署还可以使用 `strictKnownMarketplaces` 限制**插件市场添加**。有关更多信息，请参见托管市场限制。

* **其他配置**存储在 `~/.claude.json` 中。此文件包含您的偏好（主题、通知设置、编辑器模式）、OAuth 会话、用户和本地范围的 MCP 服务器配置、按项目状态（允许的工具、信任设置）以及各种缓存。项目范围的 MCP 服务器单独存储在 `.mcp.json` 中。

> **注意：** CSC 会自动创建配置文件的时间戳备份，并保留最近的五个备份以防止数据丢失。

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  },
  "companyAnnouncements": [
    "Welcome to Acme Corp! Review our code guidelines at docs.acme.com",
    "Reminder: Code reviews required for all PRs",
    "New security policy in effect"
  ]
}
```

上面示例中的 `$schema` 行指向 CSC 设置的官方 JSON schema。将其添加到 `settings.json` 中可在 VS Code、Cursor 和任何支持 JSON schema 验证的编辑器中启用自动补全和内联验证。

### 可用设置

`settings.json` 支持多种选项：

| 键                               | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 示例                                                                                                                        |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `agent`                           | 将主线程作为命名子代理运行。应用该子代理的系统提示、工具限制和模型。参见显式调用子代理                                                                                                                                                                                                                                                                                                                                                              | `"code-reviewer"`                                                                                                              |
| `allowedChannelPlugins`           | （仅托管设置）允许推送消息的通道插件白名单。设置后替换默认的 Anthropic 白名单。未定义 = 回退到默认值，空数组 = 阻止所有通道插件。需要 `channelsEnabled: true`。参见限制可运行的通道插件                                                                                                                                                                                                       | `[{ "marketplace": "claude-plugins-official", "plugin": "telegram" }]`                                                         |
| `allowedHttpHookUrls`             | HTTP 钩子可目标的 URL 模式白名单。支持 `*` 作为通配符。设置后，URL 不匹配的钩子被阻止。未定义 = 无限制，空数组 = 阻止所有 HTTP 钩子。数组跨设置源合并。参见钩子配置                                                                                                                                                                                                                                                                | `["https://hooks.example.com/*"]`                                                                                              |
| `allowedMcpServers`               | 在 managed-settings.json 中设置时，用户可配置的 MCP 服务器白名单。未定义 = 无限制，空数组 = 锁定。适用于所有范围。拒绝名单优先。参见托管 MCP 配置                                                                                                                                                                                                                                                                                               | `[{ "serverName": "github" }]`                                                                                                 |
| `allowManagedHooksOnly`           | （仅托管设置）仅加载托管钩子、SDK 钩子以及在托管设置 `enabledPlugins` 中强制启用的插件钩子。用户、项目和所有其他插件钩子被阻止。参见钩子配置                                                                                                                                                                                                                                                                                                        | `true`                                                                                                                         |
| `allowManagedMcpServersOnly`      | （仅托管设置）仅尊重托管设置中的 `allowedMcpServers`。`deniedMcpServers` 仍从所有来源合并。用户仍可添加 MCP 服务器，但仅应用管理员定义的白名单。参见托管 MCP 配置                                                                                                                                                                                                                                                                | `true`                                                                                                                         |
| `allowManagedPermissionRulesOnly` | （仅托管设置）阻止用户和项目设置定义 `allow`、`ask` 或 `deny` 权限规则。仅托管设置中的规则适用。参见仅托管设置                                                                                                                                                                                                                                                                                                                             | `true`                                                                                                                         |
| `alwaysThinkingEnabled`           | 默认为所有会话启用扩展思考。通常通过 `/config` 命令配置，而不是直接编辑                                                                                                                                                                                                                                                                                                                                                            | `true`                                                                                                                         |
| `apiKeyHelper`                    | 自定义脚本，在 `/bin/sh` 中执行，用于生成认证值。此值将作为模型请求的 `X-Api-Key` 和 `Authorization: Bearer` 头发送                                                                                                                                                                                                                                                                                                                                                                                     | `/bin/generate_temp_api_key.sh`                                                                                                |
| `attribution`                     | 自定义 git 提交和拉取请求的归属。参见归属设置                                                                                                                                                                                                                                                                                                                                                                                                                                               | `{"commit": "🤖 Generated with Claude Code", "pr": ""}`                                                                        |
| `autoMemoryDirectory`             | 自动记忆存储的自定义目录。接受 `~/` 展开的路径。在项目设置（`.claude/settings.json`）中不接受，以防止共享仓库将记忆写入重定向到敏感位置。从策略、本地和用户设置中接受                                                                                                                                                                                                                                                                                                                                                                                           | `"~/my-memory-dir"`                                                                                                            |
| `autoMode`                        | 自定义自动模式分类器阻止和允许的内容。包含 `environment`、`allow` 和 `soft_deny` 散文规则数组。参见配置自动模式分类器。不从共享项目设置中读取                                                                                                                                                                                                                                                                                                                                                          | `{"environment": ["Trusted repo: github.example.com/acme"]}`                                                                   |
| `autoUpdatesChannel`              | 更新遵循的发布通道。使用 `"stable"` 获取通常约一周前且跳过重大回归的版本，或 `"latest"`（默认）获取最新发布                                                                                                                                                                                                                                                                                                                                                  | `"stable"`                                                                                                                     |
| `availableModels`                 | 限制用户可通过 `/model`、`--model`、配置工具或 `ANTHROPIC_MODEL` 选择的模型。不影响默认选项。参见限制模型选择                                                                                                                                                                                                                                                                                                                                         | `["sonnet", "haiku"]`                                                                                                          |
| `awsAuthRefresh`                  | 修改 `.aws` 目录的自定义脚本（参见高级凭证配置）                                                                                                                                                                                                                                                                                                                                                                                                         | `aws sso login --profile myprofile`                                                                                            |
| `awsCredentialExport`             | 输出包含 AWS 凭证的 JSON 的自定义脚本（参见高级凭证配置）                                                                                                                                                                                                                                                                                                                                                                                                     | `/bin/generate_aws_grant.sh`                                                                                                   |
| `blockedMarketplaces`             | （仅托管设置）市场来源黑名单。被阻止的来源在下载前检查，因此它们不会触及文件系统。参见托管市场限制                                                                                                                                                                                                                                                                                                           | `[{ "source": "github", "repo": "untrusted/plugins" }]`                                                                        |
| `channelsEnabled`                 | （仅托管设置）允许团队和企业用户使用通道。未设置或 `false` 阻止通道消息传递，无论用户传递什么给 `--channels`                                                                                                                                                                                                                                                                                                                                                                     | `true`                                                                                                                         |
| `cleanupPeriodDays`               | 早于此期限的会话文件在启动时被删除（默认：30 天，最小值 1）。设置为 `0` 将因验证错误被拒绝。还控制启动时自动移除孤立子代理工作树的年龄截止。要在非交互模式（`-p`）中完全禁用转录写入，请使用 `--no-session-persistence` 标志或 `persistSession: false` SDK 选项；没有交互模式的等效项。                                                                  | `20`                                                                                                                           |
| `companyAnnouncements`            | 启动时向用户显示的公告。如果提供多个公告，它们将随机循环显示。                                                                                                                                                                                                                                                                                                                                                                                                                              | `["Welcome to Acme Corp! Review our code guidelines at docs.acme.com"]`                                                        |
| `defaultShell`                    | 输入框 `!` 命令的默认 shell。接受 `"bash"`（默认）或 `"powershell"`。设置 `"powershell"` 在 Windows 上通过 PowerShell 路由交互式 `!` 命令。需要 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`。参见 PowerShell 工具                                                                                                                                                                                                                                                                   | `"powershell"`                                                                                                                 |
| `deniedMcpServers`                | 在 managed-settings.json 中设置时，明确阻止的 MCP 服务器黑名单。适用于所有范围，包括托管服务器。黑名单优先于白名单。参见托管 MCP 配置                                                                                                                                                                                                                                                                                                    | `[{ "serverName": "filesystem" }]`                                                                                             |
| `disableAllHooks`                 | 禁用所有钩子和任何自定义状态行                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `true`                                                                                                                         |
| `disableAutoMode`                 | 设置为 `"disable"` 以阻止自动模式被激活。从 `Shift+Tab` 循环中移除 `auto` 并在启动时拒绝 `--permission-mode auto`。在用户无法覆盖的托管设置中最有用                                                                                                                                                                                                                                     | `"disable"`                                                                                                                    |
| `disableDeepLinkRegistration`     | 设置为 `"disable"` 以阻止 CSC 在启动时向操作系统注册 `claude-cli://` 协议处理程序。深度链接让外部工具通过 `claude-cli://open?q=...` 打开带有预填充提示的 CSC 会话。`q` 参数支持使用 URL 编码换行符（`%0A`）的多行提示。在协议处理程序注册受限或单独管理的环境中很有用                                                                                                                  | `"disable"`                                                                                                                    |
| `disabledMcpjsonServers`          | 要拒绝的 `.mcp.json` 文件中特定 MCP 服务器列表                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `["filesystem"]`                                                                                                               |
| `disableSkillShellExecution`      | 禁用技能和自定义命令中来自用户、项目、插件或附加目录源的 `` !`...` `` 和 ` ```! ` 块的内联 shell 执行。命令被替换为 `[shell command execution disabled by policy]` 而不是运行。捆绑和托管技能不受影响。在用户无法覆盖的托管设置中最有用                                                                                                                             | `true`                                                                                                                         |
| `effortLevel`                     | 跨会话持久化努力级别。接受 `"low"`、`"medium"` 或 `"high"`。运行 `/effort low`、`/effort medium` 或 `/effort high` 时自动写入。在 Opus 4.6 和 Sonnet 4.6 上支持                                                                                                                                                                                                                                                                                                  | `"medium"`                                                                                                                     |
| `enableAllProjectMcpServers`      | 自动批准项目 `.mcp.json` 文件中定义的所有 MCP 服务器                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `true`                                                                                                                         |
| `enabledMcpjsonServers`           | 要批准的 `.mcp.json` 文件中特定 MCP 服务器列表                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `["memory", "github"]`                                                                                                         |
| `env`                             | 将应用于每个会话的环境变量                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `{"FOO": "bar"}`                                                                                                               |
| `fastModePerSessionOptIn`         | 当为 `true` 时，快速模式不会跨会话持久化。每个会话以快速模式关闭开始，要求用户使用 `/fast` 启用。用户的快速模式偏好仍被保存。参见要求每次会话选择加入                                                                                                                                                                                                                                                                                   | `true`                                                                                                                         |
| `feedbackSurveyRate`              | 会话质量调查在符合条件时出现的概率（0–1）。设置为 `0` 以完全抑制。在使用 Bedrock、Vertex 或 Foundry 且默认采样率不适用时很有用                                                                                                                                                                                                                                                                                                           | `0.05`                                                                                                                         |
| `fileSuggestion`                  | 为 `@` 文件自动补全配置自定义脚本。参见文件建议设置                                                                                                                                                                                                                                                                                                                                                                                                                                           | `{"type": "command", "command": "~/.claude/file-suggestion.sh"}`                                                               |
| `forceLoginOrgUUID`               | 要求登录属于特定组织。接受单个 UUID 字符串，在登录时也预选该组织，或 UUID 数组，其中任何列出的组织都被接受而无需预选。在托管设置中设置时，如果认证账户不属于列出的组织，则登录失败；空数组将失败关闭并阻止登录，显示配置错误消息                                                                                                                             | `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"` 或 `["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"]` |
| `forceRemoteSettingsRefresh`      | （仅托管设置）阻止 CLI 启动，直到从服务器获取最新的远程托管设置。如果获取失败，CLI 将退出而不是继续使用缓存或无设置。未设置时，启动继续而不等待远程设置。参见故障关闭强制执行                                                                                                                                                                                            | `true`                                                                                                                         |
| `hooks`                           | 配置在生命周期事件运行的自定义命令。参见钩子文档了解格式                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 参见钩子                                                                                                         |
| `httpHookAllowedEnvVars`          | HTTP 钩子可插入到头中的环境变量名白名单。设置后，每个钩子的有效 `allowedEnvVars` 是与此列表的交集。未定义 = 无限制。数组跨设置源合并。参见钩子配置                                                                                                                                                                                                                                                                    | `["MY_TOKEN", "HOOK_SECRET"]`                                                                                                  |
| `includeCoAuthoredBy`             | **已弃用**：改用 `attribution`。是否在 git 提交和拉取请求中包含 `co-authored-by Claude` 署名（默认：`true`）                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                                                                                                        |
| `includeGitInstructions`          | 在 CSC 的系统提示中包含内置的提交和 PR 工作流指令以及 git 状态快照（默认：`true`）。设置为 `false` 以移除两者，例如在使用您自己的 git 工作流技能时。设置时 `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` 环境变量优先于此设置                                                                                                                                                                                                                        | `false`                                                                                                                        |
| `language`                        | 配置 CSC  的首选响应语言（例如 `"japanese"`、`"spanish"`、`"french"`）。Claude 将默认以此语言响应。还设置语音听写语言                                                                                                                                                                                                                                                                                                           | `"japanese"`                                                                                                                   |
| `model`                           | 覆盖 CSC 使用的默认模型                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `"claude-sonnet-4-6"`                                                                                                          |
| `modelOverrides`                  | 将 Anthropic 模型 ID 映射到提供商特定的模型 ID，如 Bedrock 推理配置文件 ARN。每个模型选择器条目在调用提供商 API 时使用其映射值。参见按版本覆盖模型 ID                                                                                                                                                                                                                                                                                        | `{"claude-opus-4-6": "arn:aws:bedrock:..."}`                                                                                   |
| `otelHeadersHelper`               | 生成动态 OpenTelemetry 头的脚本。在启动时和定期运行（参见动态头）                                                                                                                                                                                                                                                                                                                                                                                                         | `/bin/generate_otel_headers.sh`                                                                                                |
| `outputStyle`                     | 配置输出样式以调整系统提示。参见输出样式文档                                                                                                                                                                                                                                                                                                                                                                                                                                              | `"Explanatory"`                                                                                                                |
| `permissions`                     | 参见下表了解权限结构。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                                                                                                                                |
| `plansDirectory`                  | 自定义计划文件的存储位置。路径相对于项目根目录。默认：`~/.claude/plans`                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `"./plans"`                                                                                                                    |
| `pluginTrustMessage`              | （仅托管设置）附加到安装前显示的插件信任警告的自定义消息。使用此添加组织特定的上下文，例如确认来自内部市场的插件已经过审查。                                                                                                                                                                                                                                                                                                                     | `"All plugins from our marketplace are approved by IT"`                                                                        |
| `prefersReducedMotion`            | 减少或禁用 UI 动画（旋转器、微光、闪烁效果）以提高可访问性                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `true`                                                                                                                         |
| `respectGitignore`                | 控制 `@` 文件选择器是否遵循 `.gitignore` 模式。当为 `true`（默认）时，匹配 `.gitignore` 模式的文件从建议中排除                                                                                                                                                                                                                                                                                                                                                                                            | `false`                                                                                                                        |
| `showClearContextOnPlanAccept`    | 在计划接受屏幕上显示"清除上下文"选项。默认为 `false`。设置为 `true` 以恢复该选项                                                                                                                                                                                                                                                                                                                                                                                                                                      | `true`                                                                                                                         |
| `showThinkingSummaries`           | 在交互式会话中显示扩展思考摘要。未设置或 `false`（交互模式默认）时，思考块被 API 编辑并显示为折叠的存根。编辑仅更改您看到的内容，而不更改模型生成的内容：要减少思考开销，请降低预算或禁用思考。非交互模式（`-p`）和 SDK 调用者始终接收摘要，无论此设置如何 | `true`                                                                                                                         |
| `spinnerTipsEnabled`              | 在 CSC 工作时在旋转器中显示提示。设置为 `false` 以禁用提示（默认：`true`）                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                                                                                                        |
| `spinnerTipsOverride`             | 用自定义字符串覆盖旋转器提示。`tips`：提示字符串数组。`excludeDefault`：如果为 `true`，仅显示自定义提示；如果为 `false` 或不存在，自定义提示与内置提示合并                                                                                                                                                                                                                                                                                                                                                             | `{ "excludeDefault": true, "tips": ["Use our internal tool X"] }`                                                              |
| `spinnerVerbs`                    | 自定义旋转器和轮次持续时间消息中显示的动作动词。将 `mode` 设置为 `"replace"` 以仅使用您的动词，或 `"append"` 以将它们添加到默认值                                                                                                                                                                                                                                                                                                                                                                                  | `{"mode": "append", "verbs": ["Pondering", "Crafting"]}`                                                                       |
| `statusLine`                      | 配置自定义状态行以显示上下文。参见 `statusLine` 文档                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `{"type": "command", "command": "~/.claude/statusline.sh"}`                                                                    |
| `strictKnownMarketplaces`         | （仅托管设置）用户可添加的插件市场白名单。未定义 = 无限制，空数组 = 锁定。仅适用于市场添加。参见托管市场限制                                                                                                                                                                                                                                                                                     | `[{ "source": "github", "repo": "acme-corp/plugins" }]`                                                                        |
| `useAutoModeDuringPlan`           | 计划模式在自动模式可用时是否使用自动模式语义。默认：`true`。不从共享项目设置中读取。在 `/config` 中显示为"在计划期间使用自动模式"                                                                                                                                                                                                                                                                                                                                                                      | `false`                                                                                                                        |

### 全局配置设置

这些设置存储在 `~/.claude.json` 而非 `settings.json` 中。将它们添加到 `settings.json` 将触发 schema 验证错误。

| 键                          | 描述                                                                                                                                                                                                                                                                                                          | 示例        |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- |
| `autoConnectIde`             | 当 CSC 从外部终端启动时自动连接到运行中的 IDE。默认：`false`。在 `/config` 中显示为**自动连接到 IDE（外部终端）**（当在 VS Code 或 JetBrains 终端外运行时）                                                                                 | `true`         |
| `autoInstallIdeExtension`    | 从 VS Code 终端运行时自动安装 CSC IDE 扩展。默认：`true`。在 `/config` 中显示为**自动安装 IDE 扩展**（当在 VS Code 或 JetBrains 终端内运行时）。您还可以设置 `CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL` 环境变量 | `false`        |
| `editorMode`                 | 输入提示的键绑定模式：`"normal"` 或 `"vim"`。默认：`"normal"`。在 `/config` 中显示为**编辑器模式**                                                                                                                                                                                           | `"vim"`        |
| `showTurnDuration`           | 在响应后显示轮次持续时间消息，例如"Cooked for 1m 6s"。默认：`true`。在 `/config` 中显示为**显示轮次持续时间**                                                                                                                                                                                | `false`        |
| `terminalProgressBarEnabled` | 在支持的终端中显示终端进度条：ConEmu、Ghostty 1.2.0+ 和 iTerm2 3.6.6+。默认：`true`。在 `/config` 中显示为**终端进度条**                                                                                                                                                 | `false`        |
| `teammateMode`               | 代理团队队友的显示方式：`auto`（在 tmux 或 iTerm2 中选择分屏，否则进程内）、`in-process` 或 `tmux`。参见选择显示模式                                                                                                 | `"in-process"` |

### 工作树设置

配置 `--worktree` 如何创建和管理 git 工作树。使用这些设置可以减少大型 monorepo 中的磁盘使用和启动时间。

| 键                           | 描述                                                                                                                                                  | 示例                               |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| `worktree.symlinkDirectories` | 从主仓库符号链接到每个工作树的目录，以避免在磁盘上复制大型目录。默认不符号链接任何目录   | `["node_modules", ".cache"]`          |
| `worktree.sparsePaths`        | 通过 git sparse-checkout（cone 模式）在每个工作树中检出的目录。仅列出的路径写入磁盘，在大型 monorepo 中更快 | `["packages/my-app", "shared/utils"]` |

要将 gitignored 文件（如 `.env`）复制到新工作树中，请在项目根目录中使用 `.worktreeinclude` 文件而不是设置。

### 权限设置

| 键                                | 描述                                                                                                                                                                                                                                                                            | 示例                                                                |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| `allow`                             | 允许工具使用的权限规则数组。参见下方权限规则语法了解模式匹配详情                                                                                                                                                  | `[ "Bash(git diff *)" ]`                                               |
| `ask`                               | 在工具使用时要求确认的权限规则数组。参见下方权限规则语法                                                                                                                                                           | `[ "Bash(git push *)" ]`                                               |
| `deny`                              | 拒绝工具使用的权限规则数组。使用此选项将敏感文件排除在 CSC 访问之外。参见权限规则语法和 Bash 权限限制                                       | `[ "WebFetch", "Bash(curl *)", "Read(./.env)", "Read(./secrets/**)" ]` |
| `additionalDirectories`             | 文件访问的附加工作目录。大多数 `.claude/` 配置不会从这些目录中发现                                            | `[ "../docs/" ]`                                                       |
| `defaultMode`                       | 打开 CSC 时的默认权限模式。有效值：`default`、`acceptEdits`、`plan`、`auto`、`dontAsk`、`bypassPermissions`。`--permission-mode` CLI 标志为单个会话覆盖此设置                                         | `"acceptEdits"`                                                        |
| `disableBypassPermissionsMode`      | 设置为 `"disable"` 以阻止 `bypassPermissions` 模式被激活。这会禁用 `--dangerously-skip-permissions` 命令行标志。通常放置在托管设置中以强制执行组织策略，但可从任何范围工作 | `"disable"`                                                            |
| `skipDangerousModePermissionPrompt` | 跳过通过 `--dangerously-skip-permissions` 或 `defaultMode: "bypassPermissions"` 进入绕过权限模式前显示的确认提示。在项目设置（`.claude/settings.json`）中设置时被忽略，以防止不受信任的仓库自动绕过提示 | `true`                                                                 |

### 权限规则语法

权限规则遵循 `Tool` 或 `Tool(specifier)` 格式。规则按顺序评估：先拒绝规则，然后询问，然后允许。第一个匹配的规则胜出。

快速示例：

| 规则                           | 效果                                   |
| :----------------------------- | :--------------------------------------- |
| `Bash`                         | 匹配所有 Bash 命令                |
| `Bash(npm run *)`              | 匹配以 `npm run` 开头的命令 |
| `Read(./.env)`                 | 匹配读取 `.env` 文件          |
| `WebFetch(domain:example.com)` | 匹配对 example.com 的获取请求    |

有关完整的规则语法参考，包括通配符行为、Read、Edit、WebFetch、MCP 和 Agent 规则的工具特定模式，以及 Bash 模式的安全限制，请参见权限规则语法。

### 沙箱设置

配置高级沙箱行为。沙箱将 bash 命令与您的文件系统和网络隔离。有关详细信息，请参见沙箱。

| 键                                   | 描述                                                                                                                                                                                                                                                                                                                                     | 示例                         |
| :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `enabled`                              | 启用 bash 沙箱（macOS、Linux 和 WSL2）。默认：false                                                                                                                                                                                                                                                                                 | `true`                          |
| `failIfUnavailable`                    | 如果 `sandbox.enabled` 为 true 但沙箱无法启动（缺少依赖、不支持的平台或平台限制），则在启动时退出并报错。当为 false（默认）时，显示警告并且命令在非沙箱环境中运行。用于需要沙箱作为硬门槛的托管设置部署                         | `true`                          |
| `autoAllowBashIfSandboxed`             | 沙箱化时自动批准 bash 命令。默认：true                                                                                                                                                                                                                                                                                        | `true`                          |
| `excludedCommands`                     | 应在沙箱外运行的命令                                                                                                                                                                                                                                                                                                 | `["docker *"]`                  |
| `allowUnsandboxedCommands`             | 允许命令通过 `dangerouslyDisableSandbox` 参数在沙箱外运行。设置为 `false` 时，`dangerouslyDisableSandbox` 逃生通道完全禁用，所有命令必须在沙箱中运行（或在 `excludedCommands` 中）。适用于需要严格沙箱的企业策略。默认：true               | `false`                         |
| `filesystem.allowWrite`                | 沙箱化命令可以写入的附加路径。数组在所有设置范围中合并：用户、项目和托管路径被组合而非替换。还与 `Edit(...)` 允许权限规则中的路径合并。参见下方沙箱路径前缀。                                                              | `["/tmp/build", "~/.kube"]`     |
| `filesystem.denyWrite`                 | 沙箱化命令不能写入的路径。数组在所有设置范围中合并。还与 `Edit(...)` 拒绝权限规则中的路径合并。                                                                                                                                                                                       | `["/etc", "/usr/local/bin"]`    |
| `filesystem.denyRead`                  | 沙箱化命令不能读取的路径。数组在所有设置范围中合并。还与 `Read(...)` 拒绝权限规则中的路径合并。                                                                                                                                                                                        | `["~/.aws/credentials"]`        |
| `filesystem.allowRead`                 | 在 `denyRead` 区域内重新允许读取的路径。优先于 `denyRead`。数组在所有设置范围中合并。使用此选项创建仅工作区的读取访问模式。                                                                                                                                                    | `["."]`                         |
| `filesystem.allowManagedReadPathsOnly` | （仅托管设置）仅尊重托管设置中的 `filesystem.allowRead` 路径。`denyRead` 仍从所有来源合并。默认：false                                                                                                                                                                                         | `true`                          |
| `network.allowUnixSockets`             | 沙箱中可访问的 Unix 套接字路径（用于 SSH 代理等）                                                                                                                                                                                                                                                                                  | `["~/.ssh/agent-socket"]`       |
| `network.allowAllUnixSockets`          | 允许沙箱中所有 Unix 套接字连接。默认：false                                                                                                                                                                                                                                                                                    | `true`                          |
| `network.allowLocalBinding`            | 允许绑定到 localhost 端口（仅 macOS）。默认：false                                                                                                                                                                                                                                                                                   | `true`                          |
| `network.allowMachLookup`              | 沙箱可以查找的附加 XPC/Mach 服务名称（仅 macOS）。支持单个尾随 `*` 用于前缀匹配。需要通过 XPC 通信的工具，如 iOS 模拟器或 Playwright。                                                                                                                                  | `["com.apple.coresimulator.*"]` |
| `network.allowedDomains`               | 允许出站网络流量的域数组。支持通配符（例如 `*.example.com`）。                                                                                                                                                                                                                                             | `["github.com", "*.npmjs.org"]` |
| `network.allowManagedDomainsOnly`      | （仅托管设置）仅尊重托管设置中的 `allowedDomains` 和 `WebFetch(domain:...)` 允许规则。来自用户、项目和本地设置的域被忽略。非允许的域自动阻止而不提示用户。拒绝的域仍从所有来源中尊重。默认：false             | `true`                          |
| `network.httpProxyPort`                | 如果您希望自带代理使用的 HTTP 代理端口。如果未指定，Claude 将运行自己的代理。                                                                                                                                                                                                                                      | `8080`                          |
| `network.socksProxyPort`               | 如果您希望自带代理使用的 SOCKS5 代理端口。如果未指定，Claude 将运行自己的代理。                                                                                                                                                                                                                                    | `8081`                          |
| `enableWeakerNestedSandbox`            | 为非特权 Docker 环境启用较弱的沙箱（仅 Linux 和 WSL2）。**降低安全性。** 默认：false                                                                                                                                                                                                                          | `true`                          |
| `enableWeakerNetworkIsolation`         | （仅 macOS）允许在沙箱中访问系统 TLS 信任服务（`com.apple.trustd.agent`）。Go 工具（如 `gh`、`gcloud` 和 `terraform`）在使用 `httpProxyPort` 与 MITM 代理和自定义 CA 验证 TLS 证书时需要此设置。**降低安全性**，打开潜在的数据泄露路径。默认：false | `true`                          |

#### 沙箱路径前缀

`filesystem.allowWrite`、`filesystem.denyWrite`、`filesystem.denyRead` 和 `filesystem.allowRead` 中的路径支持这些前缀：

| 前缀            | 含义                                                                                | 示例                                                                   |
| :---------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `/`               | 从文件系统根目录的绝对路径                                                     | `/tmp/build` 保持为 `/tmp/build`                                           |
| `~/`              | 相对于主目录                                                             | `~/.kube` 变为 `$HOME/.kube`                                           |
| `./` 或无前缀 | 相对于项目根目录（对于项目设置）或 `~/.claude`（对于用户设置） | `.claude/settings.json` 中的 `./output` 解析为 `<project-root>/output` |

旧版 `//path` 前缀用于绝对路径仍然有效。如果您之前使用单斜杠 `/path` 期望项目相对解析，请切换到 `./path`。此语法与 Read 和 Edit 权限规则不同，后者使用 `//path` 表示绝对路径，`/path` 表示项目相对路径。沙箱文件系统路径使用标准约定：`/tmp/build` 是绝对路径。

**配置示例：**

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker *"],
    "filesystem": {
      "allowWrite": ["/tmp/build", "~/.kube"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"],
      "allowUnixSockets": [
        "/var/run/docker.sock"
      ],
      "allowLocalBinding": true
    }
  }
}
```

**文件系统和网络限制**可以通过两种合并的方式配置：

* **`sandbox.filesystem` 设置**（如上所示）：在 OS 级别沙箱边界控制路径。这些限制适用于所有子进程命令（例如 `kubectl`、`terraform`、`npm`），而不仅仅是 Claude 的文件工具。
* **权限规则**：使用 `Edit` 允许/拒绝规则控制 Claude 的文件工具访问，使用 `Read` 拒绝规则阻止读取，使用 `WebFetch` 允许/拒绝规则控制网络域。这些规则中的路径也合并到沙箱配置中。

### 归属设置

CSC 为 git 提交和拉取请求添加归属。这些分别配置：

* 提交默认使用 git trailers（如 `Co-Authored-By`），可以自定义或禁用
* 拉取请求描述是纯文本

| 键     | 描述                                                                                |
| :------- | :----------------------------------------------------------------------------------------- |
| `commit` | git 提交的归属，包括任何 trailers。空字符串隐藏提交归属 |
| `pr`     | 拉取请求描述的归属。空字符串隐藏拉取请求归属     |

**默认提交归属：**

```text
🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**默认拉取请求归属：**

```text
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**示例：**

```json
{
  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": ""
  }
}
```

> **注意：** `attribution` 设置优先于已弃用的 `includeCoAuthoredBy` 设置。要隐藏所有归属，请将 `commit` 和 `pr` 设置为空字符串。

### 文件建议设置

为 `@` 文件路径自动补全配置自定义命令。内置文件建议使用快速文件系统遍历，但大型 monorepo 可能受益于项目特定的索引，如预构建的文件索引或自定义工具。

```json
{
  "fileSuggestion": {
    "type": "command",
    "command": "~/.claude/file-suggestion.sh"
  }
}
```

该命令使用与钩子相同的环境变量运行，包括 `CLAUDE_PROJECT_DIR`。它通过 stdin 接收包含 `query` 字段的 JSON：

```json
{"query": "src/comp"}
```

向 stdout 输出换行分隔的文件路径（目前限制为 15 个）：

```text
src/components/Button.tsx
src/components/Modal.tsx
src/components/Form.tsx
```

**示例：**

```bash
#!/bin/bash
query=$(cat | jq -r '.query')
your-repo-file-index --query "$query" | head -20
```

### 钩子配置

这些设置控制哪些钩子可以运行以及 HTTP 钩子可以访问什么。`allowManagedHooksOnly` 设置只能在托管设置中配置。URL 和环境变量白名单可以在任何设置级别设置并跨来源合并。

**当 `allowManagedHooksOnly` 为 `true` 时的行为：**

* 托管钩子和 SDK 钩子被加载
* 在托管设置 `enabledPlugins` 中强制启用的插件钩子被加载。这让管理员通过组织市场分发经过审查的钩子，同时阻止其他所有内容。信任通过完整的 `plugin@marketplace` ID 授予，因此来自不同市场的同名插件仍被阻止
* 用户钩子、项目钩子和所有其他插件钩子被阻止

**限制 HTTP 钩子 URL：**

限制 HTTP 钩子可以目标的 URL。支持 `*` 作为匹配通配符。当数组定义后，目标非匹配 URL 的 HTTP 钩子被静默阻止。

```json
{
  "allowedHttpHookUrls": ["https://hooks.example.com/*", "http://localhost:*"]
}
```

**限制 HTTP 钩子环境变量：**

限制 HTTP 钩子可以插入到头值中的环境变量名。每个钩子的有效 `allowedEnvVars` 是其自身列表与此设置的交集。

```json
{
  "httpHookAllowedEnvVars": ["MY_TOKEN", "HOOK_SECRET"]
}
```

### 设置优先级

设置按优先级顺序应用。从最高到最低：

1. **托管设置**（服务器管理的、MDM/OS 级别策略或托管设置文件）
   * IT 通过服务器交付、MDM 配置文件、注册表策略或托管设置文件部署的策略
   * 不能被任何其他级别覆盖，包括命令行参数
   * 在托管层级内，优先级为：服务器管理的 > MDM/OS 级别策略 > 基于文件的（`managed-settings.d/*.json` + `managed-settings.json`）> HKCU 注册表（仅 Windows）。仅使用一个托管来源；来源不跨层级合并。在基于文件的层级内，放置文件和基础文件合并在一起。

2. **命令行参数**
   * 特定会话的临时覆盖

3. **本地项目设置**（`.claude/settings.local.json`）
   * 个人的项目特定设置

4. **共享项目设置**（`.claude/settings.json`）
   * 源代码控制中的团队共享项目设置

5. **用户设置**（`~/.claude/settings.json`）
   * 个人全局设置

此层级确保组织策略始终被强制执行，同时仍允许团队和个人自定义其体验。无论您是从 CLI、VS Code 扩展还是 JetBrains IDE 运行 CSC，都适用相同的优先级。

例如，如果您的用户设置允许 `Bash(npm run *)` 但项目的共享设置拒绝它，则项目设置优先，该命令被阻止。

> **注意：** **数组设置跨范围合并。** 当相同的数组值设置（如 `sandbox.filesystem.allowWrite` 或 `permissions.allow`）出现在多个范围中时，数组被**连接并去重**，而不是替换。这意味着较低优先级的范围可以添加条目而不覆盖较高优先级范围设置的条目，反之亦然。例如，如果托管设置将 `allowWrite` 设置为 `["/opt/company-tools"]`，而用户添加 `["~/.kube"]`，则两个路径都包含在最终配置中。

### 验证活动设置

在 CSC 内部运行 `/status` 以查看哪些设置源处于活动状态以及它们来自哪里。输出显示每个配置层（托管、用户、项目）及其来源，例如 `Enterprise managed settings (remote)`、`Enterprise managed settings (plist)`、`Enterprise managed settings (HKLM)` 或 `Enterprise managed settings (file)`。如果设置文件包含错误，`/status` 会报告问题以便您修复。

### 配置系统的要点

* **记忆文件（`CLAUDE.md`）**：包含 Claude 在启动时加载的指令和上下文
* **设置文件（JSON）**：配置权限、环境变量和工具行为
* **技能**：可以使用 `/skill-name` 调用或由 Claude 自动加载的自定义提示
* **MCP 服务器**：使用附加工具和集成扩展 CSC
* **优先级**：更高级别的配置（托管）覆盖较低级别的（用户/项目）
* **继承**：设置被合并，更具体的设置添加到或覆盖更广泛的设置

### 系统提示

CSC 的内部系统提示未发布。要添加自定义指令，请使用 `CLAUDE.md` 文件或 `--append-system-prompt` 标志。

### 排除敏感文件

要阻止 CSC 访问包含敏感信息（如 API 密钥、机密和环境文件）的文件，请在 `.claude/settings.json` 文件中使用 `permissions.deny` 设置：

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.json)",
      "Read(./build)"
    ]
  }
}
```

这取代了已弃用的 `ignorePatterns` 配置。匹配这些模式的文件从文件发现和搜索结果中排除，对这些文件的读取操作被拒绝。

## 子代理配置

CSC 支持可以在用户和项目级别配置的自定义 AI 子代理。这些子代理存储为带有 YAML frontmatter 的 Markdown 文件：

* **用户子代理**：`~/.claude/agents/` - 跨所有项目可用
* **项目子代理**：`.claude/agents/` - 特定于您的项目，可与团队共享

子代理文件定义具有自定义提示和工具权限的专业 AI 助手。在子代理文档中了解更多关于创建和使用子代理的信息。

## 插件配置

CSC 支持插件系统，让您可以通过技能、代理、钩子和 MCP 服务器扩展功能。插件通过市场分发，可以在用户和仓库级别配置。

### 插件设置

`settings.json` 中与插件相关的设置：

```json
{
  "enabledPlugins": {
    "formatter@acme-tools": true,
    "deployer@acme-tools": true,
    "analyzer@security-plugins": false
  },
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": "github",
      "repo": "acme-corp/claude-plugins"
    }
  }
}
```

#### `enabledPlugins`

控制哪些插件被启用。格式：`"plugin-name@marketplace-name": true/false`

**范围**：

* **用户设置**（`~/.claude/settings.json`）：个人插件偏好
* **项目设置**（`.claude/settings.json`）：与团队共享的项目特定插件
* **本地设置**（`.claude/settings.local.json`）：按机器覆盖（不提交）
* **托管设置**（`managed-settings.json`）：组织范围的策略覆盖，阻止所有范围的安装并在市场中隐藏插件

**示例**：

```json
{
  "enabledPlugins": {
    "code-formatter@team-tools": true,
    "deployment-tools@team-tools": true,
    "experimental-features@personal": false
  }
}
```

#### `extraKnownMarketplaces`

定义应为仓库提供的附加市场。通常在仓库级别设置中使用，以确保团队成员可以访问所需的插件来源。

**当仓库包含 `extraKnownMarketplaces` 时**：

1. 团队成员在信任文件夹时被提示安装市场
2. 团队成员随后被提示从该市场安装插件
3. 用户可以跳过不需要的市场或插件（存储在用户设置中）
4. 安装尊重信任边界并需要明确同意

**示例**：

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/claude-plugins"
      }
    },
    "security-plugins": {
      "source": {
        "source": "git",
        "url": "https://git.example.com/security/plugins.git"
      }
    }
  }
}
```

**市场来源类型**：

* `github`：GitHub 仓库（使用 `repo`）
* `git`：任何 git URL（使用 `url`）
* `directory`：本地文件系统路径（使用 `path`，仅用于开发）
* `hostPattern`：用于匹配市场主机的正则表达式模式（使用 `hostPattern`）
* `settings`：直接在 settings.json 中声明的内联市场，无需单独的托管仓库（使用 `name` 和 `plugins`）

使用 `source: 'settings'` 声明少量内联插件，而无需设置托管市场仓库。此处列出的插件必须引用外部来源，如 GitHub 或 npm。您仍需在 `enabledPlugins` 中单独启用每个插件。

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "settings",
        "name": "team-tools",
        "plugins": [
          {
            "name": "code-formatter",
            "source": {
              "source": "github",
              "repo": "acme-corp/code-formatter"
            }
          }
        ]
      }
    }
  }
}
```

#### `strictKnownMarketplaces`

**仅托管设置**：控制允许用户添加哪些插件市场。此设置只能在托管设置中配置，为管理员提供对市场来源的严格控制。

**托管设置文件位置**：

* **macOS**：`/Library/Application Support/ClaudeCode/managed-settings.json`
* **Linux 和 WSL**：`/etc/claude-code/managed-settings.json`
* **Windows**：`C:\Program Files\ClaudeCode\managed-settings.json`

**关键特征**：

* 仅在托管设置（`managed-settings.json`）中可用
* 不能被用户或项目设置覆盖（最高优先级）
* 在网络/文件系统操作之前强制执行（被阻止的来源从不执行）
* 对来源规范使用精确匹配（包括 git 来源的 `ref`、`path`），`hostPattern` 除外，它使用正则匹配

**白名单行为**：

* `undefined`（默认）：无限制 - 用户可以添加任何市场
* 空数组 `[]`：完全锁定 - 用户不能添加任何新市场
* 来源列表：用户只能添加精确匹配的市场

**所有支持的来源类型**：

白名单支持多种市场来源类型。大多数来源使用精确匹配，而 `hostPattern` 使用正则匹配市场主机。

1. **GitHub 仓库**：

```json
{ "source": "github", "repo": "acme-corp/approved-plugins" }
{ "source": "github", "repo": "acme-corp/security-tools", "ref": "v2.0" }
{ "source": "github", "repo": "acme-corp/plugins", "ref": "main", "path": "marketplace" }
```

字段：`repo`（必需），`ref`（可选：分支/标签/SHA），`path`（可选：子目录）

2. **Git 仓库**：

```json
{ "source": "git", "url": "https://gitlab.example.com/tools/plugins.git" }
{ "source": "git", "url": "https://bitbucket.org/acme-corp/plugins.git", "ref": "production" }
{ "source": "git", "url": "ssh://git@git.example.com/plugins.git", "ref": "v3.1", "path": "approved" }
```

字段：`url`（必需），`ref`（可选：分支/标签/SHA），`path`（可选：子目录）

3. **基于 URL 的市场**：

```json
{ "source": "url", "url": "https://plugins.example.com/marketplace.json" }
{ "source": "url", "url": "https://cdn.example.com/marketplace.json", "headers": { "Authorization": "Bearer ${TOKEN}" } }
```

字段：`url`（必需），`headers`（可选：用于认证访问的 HTTP 头）

> **注意：** 基于 URL 的市场仅下载 `marketplace.json` 文件。它们不从服务器下载插件文件。基于 URL 的市场中的插件必须使用外部来源（GitHub、npm 或 git URL）而不是相对路径。对于使用相对路径的插件，请改用基于 Git 的市场。有关详细信息，请参见故障排除。

4. **NPM 包**：

```json
{ "source": "npm", "package": "@acme-corp/claude-plugins" }
{ "source": "npm", "package": "@acme-corp/approved-marketplace" }
```

字段：`package`（必需，支持作用域包）

5. **文件路径**：

```json
{ "source": "file", "path": "/usr/local/share/claude/acme-marketplace.json" }
{ "source": "file", "path": "/opt/acme-corp/plugins/marketplace.json" }
```

字段：`path`（必需：marketplace.json 文件的绝对路径）

6. **目录路径**：

```json
{ "source": "directory", "path": "/usr/local/share/claude/acme-plugins" }
{ "source": "directory", "path": "/opt/acme-corp/approved-marketplaces" }
```

字段：`path`（必需：包含 `.claude-plugin/marketplace.json` 的目录的绝对路径）

7. **主机模式匹配**：

```json
{ "source": "hostPattern", "hostPattern": "^github\\.example\\.com$" }
{ "source": "hostPattern", "hostPattern": "^gitlab\\.internal\\.example\\.com$" }
```

字段：`hostPattern`（必需：用于匹配市场主机的正则表达式模式）

当您希望允许来自特定主机的所有市场而不单独枚举每个仓库时，使用主机模式匹配。这对于拥有内部 GitHub Enterprise 或 GitLab 服务器的组织很有用，开发者在其中创建自己的市场。

按来源类型提取主机：

* `github`：始终匹配 `github.com`
* `git`：从 URL 提取主机名（支持 HTTPS 和 SSH 格式）
* `url`：从 URL 提取主机名
* `npm`、`file`、`directory`：不支持主机模式匹配

**配置示例**：

示例：仅允许特定市场：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "github",
      "repo": "acme-corp/approved-plugins"
    },
    {
      "source": "github",
      "repo": "acme-corp/security-tools",
      "ref": "v2.0"
    },
    {
      "source": "url",
      "url": "https://plugins.example.com/marketplace.json"
    },
    {
      "source": "npm",
      "package": "@acme-corp/compliance-plugins"
    }
  ]
}
```

示例 - 禁用所有市场添加：

```json
{
  "strictKnownMarketplaces": []
}
```

示例：允许来自内部 git 服务器的所有市场：

```json
{
  "strictKnownMarketplaces": [
    {
      "source": "hostPattern",
      "hostPattern": "^github\\.example\\.com$"
    }
  ]
}
```

**精确匹配要求**：

市场来源必须**精确**匹配才能允许用户添加。对于基于 git 的来源（`github` 和 `git`），这包括所有可选字段：

* `repo` 或 `url` 必须精确匹配
* `ref` 字段必须精确匹配（或两者都未定义）
* `path` 字段必须精确匹配（或两者都未定义）

**不**匹配的来源示例：

```json
// 这些是不同的来源：
{ "source": "github", "repo": "acme-corp/plugins" }
{ "source": "github", "repo": "acme-corp/plugins", "ref": "main" }

// 这些也是不同的：
{ "source": "github", "repo": "acme-corp/plugins", "path": "marketplace" }
{ "source": "github", "repo": "acme-corp/plugins" }
```

**与 `extraKnownMarketplaces` 的比较**：

| 方面                | `strictKnownMarketplaces`            | `extraKnownMarketplaces`             |
| --------------------- | ------------------------------------ | ------------------------------------ |
| **目的**           | 组织策略强制执行    | 团队便利                     |
| **设置文件**     | 仅 `managed-settings.json`         | 任何设置文件                    |
| **行为**          | 阻止非白名单添加     | 自动安装缺少的市场   |
| **强制执行时机**     | 网络/文件系统操作之前 | 用户信任提示之后              |
| **可被覆盖** | 否（最高优先级）              | 是（被更高优先级设置覆盖）  |
| **来源格式**    | 直接来源对象                 | 带嵌套来源的命名市场 |
| **用例**          | 合规、安全限制    | 入门、标准化          |

**格式差异**：

`strictKnownMarketplaces` 使用直接来源对象：

```json
{
  "strictKnownMarketplaces": [
    { "source": "github", "repo": "acme-corp/plugins" }
  ]
}
```

`extraKnownMarketplaces` 需要命名市场：

```json
{
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/plugins" }
    }
  }
}
```

**同时使用两者**：

`strictKnownMarketplaces` 是一个策略门：它控制用户可以添加什么但不注册任何市场。要同时限制并为所有用户预注册市场，请在 `managed-settings.json` 中同时设置两者：

```json
{
  "strictKnownMarketplaces": [
    { "source": "github", "repo": "acme-corp/plugins" }
  ],
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/plugins" }
    }
  }
}
```

仅设置 `strictKnownMarketplaces` 时，用户仍可通过 `/plugin marketplace add` 手动添加允许的市场，但它不会自动可用。

**重要说明**：

* 限制在任何网络请求或文件系统操作之前检查
* 被阻止时，用户会看到清晰的错误消息，指示来源被托管策略阻止
* 限制仅适用于添加新市场；先前安装的市场仍可访问
* 托管设置具有最高优先级，不能被覆盖

有关面向用户的文档，请参见托管市场限制。

### 管理插件

使用 `/plugin` 命令交互式管理插件：

* 浏览市场中的可用插件
* 安装/卸载插件
* 启用/禁用插件
* 查看插件详情（提供的技能、代理、钩子）
* 添加/移除市场

在插件文档中了解更多关于插件系统的信息。

## 环境变量

环境变量让您无需编辑设置文件即可控制 CSC 行为。任何变量也可以在 `settings.json` 的 `env` 键下配置，以应用于每个会话或向您的团队推出。

有关完整列表，请参见环境变量参考。

## CSC 可用的工具

CSC 可以访问一组用于读取、编辑、搜索、运行命令和编排子代理的工具。工具名称是您在权限规则和钩子匹配器中使用的精确字符串。

有关完整列表和 Bash 工具行为详情，请参见工具参考。
