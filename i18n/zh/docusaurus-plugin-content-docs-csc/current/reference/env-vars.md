---
sidebar_position: 3
---

# 环境变量

> 控制 CSC 行为的环境变量的完整参考。

CSC 支持以下环境变量来控制其行为。在启动 `csc` 之前在 shell 中设置它们，或在 `settings.json` 的 `env` 键下配置它们，以应用于每个会话或在团队中推广。

| 变量 | 用途 |
| :--- | :--- |
| `API_TIMEOUT_MS` | API 请求超时时间（毫秒）（默认：600000，即 10 分钟；最大值：2147483647）。在慢速网络或通过代理路由导致请求超时时增加此值。超过最大值的数值会溢出底层计时器并导致请求立即失败 |
| `BASH_DEFAULT_TIMEOUT_MS` | 长时间运行的 bash 命令的默认超时时间（默认：120000，即 2 分钟） |
| `BASH_MAX_OUTPUT_LENGTH` | bash 输出在被中间截断之前的最大字符数 |
| `BASH_MAX_TIMEOUT_MS` | 模型可为长时间运行的 bash 命令设置的最大超时时间（默认：600000，即 10 分钟） |
| `CCR_FORCE_BUNDLE` | 设置为 `1` 以强制 `csc --remote` 打包并上传你的本地仓库，即使 GitHub 访问可用 |
| `CLAUDECODE` | 在 CSC 生成的 shell 环境（Bash 工具、tmux 会话）中设置为 `1`。在钩子或状态行命令中未设置。用于检测脚本是否在 CSC 生成的 shell 中运行 |
| `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS` | 设置为 `1` 以禁用所有内置子代理类型（如 Explore 和 Plan）。仅在非交互模式（`-p` 标志）下适用。适用于想要空白状态的 SDK 用户 |
| `CLAUDE_AGENT_SDK_MCP_NO_PREFIX` | 设置为 `1` 以跳过 SDK 创建的 MCP 服务器工具名称上的 `mcp__<server>__` 前缀。工具使用其原始名称。仅限 SDK 使用 |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 设置自动压缩触发的上下文容量百分比（1-100）。默认情况下，自动压缩在约 95% 容量时触发。使用较低的值如 `50` 可更早压缩。超过默认阈值的值无效。适用于主对话和子代理。此百分比与状态行中可用的 `context_window.used_percentage` 字段一致 |
| `CLAUDE_AUTO_BACKGROUND_TASKS` | 设置为 `1` 以强制启用长时间运行代理任务的自动后台化。启用后，子代理在运行约两分钟后移至后台 |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | 在主会话中每次执行 Bash 或 PowerShell 命令后返回原始工作目录 |
| `CLAUDE_CODE_ACCESSIBILITY` | 设置为 `1` 以保持原生终端光标可见并禁用反转文本光标指示器。允许 macOS Zoom 等屏幕放大器跟踪光标位置 |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | 设置为 `1` 以从 `--add-dir` 指定的目录加载 CLAUDE.md 文件。默认情况下，额外目录不加载记忆文件 |
| `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` | 凭据刷新间隔（毫秒）（使用 `apiKeyHelper` 时） |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | 设置用于自动压缩计算的上下文容量（以 token 为单位）。默认为模型的上下文窗口：标准模型为 200K，扩展上下文模型为 1M。在 1M 模型上使用较低的值如 `500000` 可将窗口视为 500K 进行压缩。该值上限为模型的实际上下文窗口。`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 作为此值的百分比应用。设置此变量会将压缩阈值与状态行的 `used_percentage` 解耦，后者始终使用模型的完整上下文窗口 |
| `CLAUDE_CODE_AUTO_CONNECT_IDE` | 覆盖自动 IDE 连接。默认情况下，CSC 在支持的 IDE 集成终端中启动时自动连接。设置为 `false` 以阻止此行为。设置为 `true` 以在自动检测失败时强制尝试连接，例如当 tmux 遮蔽了父终端时 |
| `CLAUDE_CODE_CERT_STORE` | TLS 连接的 CA 证书来源的逗号分隔列表。`bundled` 是 CSC 附带的 Mozilla CA 集。`system` 是操作系统信任存储。默认为 `bundled,system`。系统存储集成需要原生二进制发行版。在 Node.js 运行时上，无论此值如何，仅使用 bundled 集 |
| `CLAUDE_CODE_CLIENT_CERT` | 用于 mTLS 认证的客户端证书文件路径 |
| `CLAUDE_CODE_CLIENT_KEY` | 用于 mTLS 认证的客户端私钥文件路径 |
| `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE` | 加密的 CLAUDE\_CODE\_CLIENT\_KEY 的密码短语（可选） |
| `CLAUDE_CODE_DEBUG_LOGS_DIR` | 覆盖调试日志文件路径。尽管名称如此，这是一个文件路径，而非目录。需要通过 `--debug` 或 `/debug` 单独启用调试模式：仅设置此变量不会启用日志。`--debug-file` 标志可同时完成两者。默认为 `~/.claude/debug/<session-id>.txt` |
| `CLAUDE_CODE_DEBUG_LOG_LEVEL` | 写入调试日志文件的最低日志级别。值：`verbose`、`debug`（默认）、`info`、`warn`、`error`。设置为 `verbose` 以包含大量诊断信息（如完整状态行命令输出），或提升至 `error` 以减少噪音 |
| `CLAUDE_CODE_DISABLE_1M_CONTEXT` | 设置为 `1` 以禁用 1M 上下文窗口支持。设置后，1M 模型变体在模型选择器中不可用。适用于有合规要求的企业环境 |
| `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` | 设置为 `1` 以禁用 Opus 4.6 和 Sonnet 4.6 的自适应推理。禁用后，这些模型回退到由 `MAX_THINKING_TOKENS` 控制的固定思考预算 |
| `CLAUDE_CODE_DISABLE_ATTACHMENTS` | 设置为 `1` 以禁用附件处理。使用 `@` 语法的文件提及以纯文本发送，而不是扩展为文件内容 |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | 设置为 `1` 以禁用自动记忆。设置为 `0` 以在逐步推出期间强制启用自动记忆。禁用后，Claude 不会创建或加载自动记忆文件 |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | 设置为 `1` 以禁用所有后台任务功能，包括 Bash 和子代理工具上的 `run_in_background` 参数、自动后台化和 Ctrl+B 快捷键 |
| `CLAUDE_CODE_DISABLE_CLAUDE_MDS` | 设置为 `1` 以阻止将任何 CLAUDE.md 记忆文件加载到上下文中，包括用户、项目和自动记忆文件 |
| `CLAUDE_CODE_DISABLE_CRON` | 设置为 `1` 以禁用计划任务。`/loop` 技能和 cron 工具将不可用，任何已计划的任务将停止触发，包括会话中已在运行的任务 |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | 设置为 `1` 以从 API 请求中剥离 Anthropic 特定的 `anthropic-beta` 请求头和 beta 工具模式字段（如 `defer_loading` 和 `eager_input_streaming`）。当代理网关拒绝请求并出现类似"Unexpected value(s) for the `anthropic-beta` header"或"Extra inputs are not permitted"的错误时使用此选项。标准字段（`name`、`description`、`input_schema`、`cache_control`）将被保留 |
| `CLAUDE_CODE_DISABLE_FAST_MODE` | 设置为 `1` 以禁用快速模式 |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | 设置为 `1` 以禁用"Claude 表现如何？"会话质量调查。当设置了 `DISABLE_TELEMETRY` 或 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 时，调查也会被禁用。参见会话质量调查 |
| `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` | 设置为 `1` 以禁用文件检查点。`/rewind` 命令将无法恢复代码更改 |
| `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` | 设置为 `1` 以从 Claude 的系统提示中移除内置的提交和 PR 工作流指令以及 git 状态快照。使用自己的 git 工作流技能时有用。设置时优先于 `includeGitInstructions` 设置 |
| `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP` | 设置为 `1` 以防止在 Anthropic API 上将 Opus 4.0 和 4.1 自动重映射到当前 Opus 版本。当你有意要固定使用旧模型时使用。重映射不会在 Bedrock、Vertex 或 Foundry 上运行 |
| `CLAUDE_CODE_DISABLE_MOUSE` | 设置为 `1` 以在全屏渲染中禁用鼠标跟踪。使用 `PgUp` 和 `PgDn` 的键盘滚动仍然有效。使用此选项以保持终端的原生选中即复制行为 |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 等同于设置 `DISABLE_AUTOUPDATER`、`DISABLE_FEEDBACK_COMMAND`、`DISABLE_ERROR_REPORTING` 和 `DISABLE_TELEMETRY` |
| `CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK` | 设置为 `1` 以在流式请求中途失败时禁用非流式回退。流式错误会传播到重试层。当代理或网关导致回退产生重复的工具执行时有用 |
| `CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL` | 设置为 `1` 以在首次运行时跳过自动添加官方插件市场 |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` | 设置为 `1` 以禁用基于对话上下文的自动终端标题更新 |
| `CLAUDE_CODE_DISABLE_THINKING` | 设置为 `1` 以强制禁用扩展思维，无论模型支持或其他设置如何。比 `MAX_THINKING_TOKENS=0` 更直接 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 设置支持模型的努力级别。值：`low`、`medium`、`high`、`max`（仅 Opus 4.6）或 `auto` 使用模型默认值。优先于 `/effort` 和 `effortLevel` 设置。参见调整努力级别 |
| `CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING` | 设置为 `1` 以强制启用细粒度工具输入流式传输。没有此设置时，API 在发送增量事件之前完全缓冲工具输入参数，这可能会延迟大型工具输入的显示。仅限 Anthropic API：对 Bedrock、Vertex 或 Foundry 无效 |
| `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | 设置为 `false` 以禁用提示建议（`/config` 中的"提示建议"切换开关）。这些是 Claude 回复后出现在提示输入框中的灰色预测。参见提示建议 |
| `CLAUDE_CODE_ENABLE_TASKS` | 设置为 `1` 以在非交互模式（`-p` 标志）下启用任务跟踪系统。交互模式下任务默认开启。参见任务列表 |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | 设置为 `1` 以启用 OpenTelemetry 数据收集用于指标和日志记录。在配置 OTel 导出器之前需要。参见监控 |
| `CLAUDE_CODE_EXIT_AFTER_STOP_DELAY` | 查询循环空闲后自动退出前等待的时间（毫秒）。适用于使用 SDK 模式的自动化工作流和脚本 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 设置为 `1` 以启用代理团队。代理团队是实验性功能，默认禁用 |
| `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` | 覆盖文件读取的默认 token 限制。当需要完整读取较大文件时有用 |
| `CLAUDE_CODE_GIT_BASH_PATH` | 仅限 Windows：Git Bash 可执行文件（`bash.exe`）的路径。当 Git Bash 已安装但不在 PATH 中时使用。参见 Windows 设置 |
| `CLAUDE_CODE_GLOB_HIDDEN` | 设置为 `false` 以在 Claude 调用 Glob 工具时从结果中排除点文件。默认包含。不影响 `@` 文件自动补全、`ls`、Grep 或 Read |
| `CLAUDE_CODE_GLOB_NO_IGNORE` | 设置为 `false` 以使 Glob 工具遵循 `.gitignore` 模式。默认情况下，Glob 返回所有匹配文件，包括 gitignored 文件。不影响 `@` 文件自动补全，它有自己的 `respectGitignore` 设置 |
| `CLAUDE_CODE_GLOB_TIMEOUT_SECONDS` | Glob 工具文件发现的超时时间（秒）。大多数平台默认 20 秒，WSL 上默认 60 秒 |
| `CLAUDE_CODE_IDE_HOST_OVERRIDE` | 覆盖用于连接 IDE 扩展的主机地址。默认情况下，CSC 自动检测正确的地址，包括 WSL 到 Windows 的路由 |
| `CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL` | 跳过 IDE 扩展的自动安装。等同于将 `autoInstallIdeExtension` 设置为 `false` |
| `CLAUDE_CODE_IDE_SKIP_VALID_CHECK` | 设置为 `1` 以在连接期间跳过 IDE 锁文件条目的验证。当自动连接找不到正在运行的 IDE 时使用 |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 设置大多数请求的最大输出 token 数。默认值和上限因模型而异；参见最大输出 token。增加此值会减少自动压缩触发前可用的有效上下文窗口 |
| `CLAUDE_CODE_MAX_RETRIES` | 覆盖失败 API 请求的重试次数（默认：10） |
| `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` | 可并行执行的最大只读工具和子代理数量（默认：10）。较高的值增加并行度但消耗更多资源 |
| `CLAUDE_CODE_NEW_INIT` | 设置为 `1` 以使 `/init` 运行交互式设置流程。该流程在探索代码库并写入文件之前，会询问要生成哪些文件，包括 CLAUDE.md、技能和钩子。没有此变量时，`/init` 会自动生成 CLAUDE.md 而不提示 |
| `CLAUDE_CODE_NO_FLICKER` | 设置为 `1` 以启用全屏渲染，这是一个减少闪烁并在长对话中保持内存平稳的研究预览功能 |
| `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` | 用于 Claude.ai 认证的 OAuth 刷新令牌。设置后，`csc auth login` 直接交换此令牌而不是打开浏览器。需要 `CLAUDE_CODE_OAUTH_SCOPES`。适用于在自动化环境中提供认证 |
| `CLAUDE_CODE_OAUTH_SCOPES` | 刷新令牌颁发时的空格分隔 OAuth 范围，例如 `"user:profile user:inference user:sessions:claude_code"`。设置 `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` 时必需 |
| `CLAUDE_CODE_OAUTH_TOKEN` | 用于 Claude.ai 认证的 OAuth 访问令牌。SDK 和自动化环境中 `/login` 的替代方案。优先于钥匙串存储的凭据。使用 `csc setup-token` 生成 |
| `CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS` | 刷新待处理 OpenTelemetry span 的超时时间（毫秒）（默认：5000）。参见监控 |
| `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS` | 刷新动态 OpenTelemetry 头的间隔（毫秒）（默认：1740000 / 29 分钟）。参见动态头 |
| `CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS` | OpenTelemetry 导出器在关闭时完成的超时时间（毫秒）（默认：2000）。如果在退出时指标丢失则增加此值。参见监控 |
| `CLAUDE_CODE_PERFORCE_MODE` | 设置为 `1` 以启用 Perforce 感知的写保护。设置后，如果目标文件缺少所有者写入位（Perforce 在同步文件上清除该位，直到 `p4 edit` 打开它们），Edit、Write 和 NotebookEdit 将失败并提示 `p4 edit <file>`。这防止 CSC 绕过 Perforce 更改跟踪 |
| `CLAUDE_CODE_PLUGIN_CACHE_DIR` | 覆盖插件根目录。尽管名称如此，这设置的是父目录，而非缓存本身：市场和插件缓存位于此路径的子目录中。默认为 `~/.claude/plugins` |
| `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS` | 安装或更新插件时 git 操作的超时时间（毫秒）（默认：120000）。对于大型仓库或慢速网络连接，增加此值。参见 Git 操作超时 |
| `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE` | 设置为 `1` 以在 `git pull` 失败时保留现有市场缓存，而不是擦除并重新克隆。在离线或隔离环境中重新克隆会以相同方式失败时有用。参见离线环境中市场更新失败 |
| `CLAUDE_CODE_PLUGIN_SEED_DIR` | 一个或多个只读插件种子目录的路径，在 Unix 上用 `:` 分隔，在 Windows 上用 `;` 分隔。使用此选项将预填充的插件目录捆绑到容器镜像中。CSC 在启动时从这些目录注册市场，并使用预缓存的插件而无需重新克隆。参见为容器预填充插件 |
| `CLAUDE_CODE_PROXY_RESOLVES_HOSTS` | 设置为 `1` 以允许代理执行 DNS 解析而非调用方。适用于代理应处理主机名解析的环境 |
| `CLAUDE_CODE_RESUME_INTERRUPTED_TURN` | 设置为 `1` 以在上一个会话在中途结束时自动恢复。在 SDK 模式中使用，以便模型继续而无需 SDK 重新发送提示 |
| `CLAUDE_CODE_SCRIPT_CAPS` | 当设置 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` 时，限制特定脚本每个会话可调用次数的 JSON 对象。键是与命令文本匹配的子字符串；值是整数调用限制。例如，`{"deploy.sh": 2}` 允许 `deploy.sh` 最多被调用两次。匹配基于子字符串，因此像 `./scripts/deploy.sh $(evil)` 这样的 shell 展开技巧仍然计入限制。通过 `xargs` 或 `find -exec` 的运行时扇出无法检测；这是一个纵深防御控制 |
| `CLAUDE_CODE_SCROLL_SPEED` | 在全屏渲染中设置鼠标滚轮滚动倍数。接受 1 到 20 的值。如果你的终端每个滚轮刻度发送一个事件而不放大，设置为 `3` 以匹配 `vim` |
| `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` | SessionEnd 钩子完成的最大时间（毫秒）（默认：`1500`）。适用于会话退出、`/clear` 以及通过交互式 `/resume` 切换会话。每个钩子的 `timeout` 值也受此预算上限约束 |
| `CLAUDE_CODE_SHELL` | 覆盖自动 shell 检测。当你的登录 shell 与首选工作 shell 不同时有用（例如，`bash` 与 `zsh`） |
| `CLAUDE_CODE_SHELL_PREFIX` | 包装所有 bash 命令的命令前缀（例如，用于日志记录或审计）。示例：`/path/to/logger.sh` 将执行 `/path/to/logger.sh <command>` |
| `CLAUDE_CODE_SIMPLE` | 设置为 `1` 以使用最小系统提示和仅 Bash、文件读取和文件编辑工具运行。`--mcp-config` 的 MCP 工具仍然可用。禁用钩子、技能、插件、MCP 服务器、自动记忆和 CLAUDE.md 的自动发现。`--bare` CLI 标志设置此选项 |
| `CLAUDE_CODE_SKIP_BEDROCK_AUTH` | 跳过 Bedrock 的 AWS 认证（例如，使用 LLM 网关时） |
| `CLAUDE_CODE_SKIP_FOUNDRY_AUTH` | 跳过 Microsoft Foundry 的 Azure 认证（例如，使用 LLM 网关时） |
| `CLAUDE_CODE_SKIP_MANTLE_AUTH` | 跳过 Bedrock Mantle 的 AWS 认证（例如，使用 LLM 网关时） |
| `CLAUDE_CODE_SKIP_VERTEX_AUTH` | 跳过 Vertex 的 Google 认证（例如，使用 LLM 网关时） |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 参见模型配置 |
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` | 设置为 `1` 以从子进程环境（Bash 工具、钩子、MCP stdio 服务器）中剥离 Anthropic 和云提供商凭据。父 Claude 进程保留这些凭据用于 API 调用，但子进程无法读取它们，从而减少通过 shell 展开尝试窃取秘密的提示注入攻击的暴露。在 Linux 上，这还在隔离的 PID 命名空间中运行 Bash 子进程，使其无法通过 `/proc` 读取主机进程环境；副作用是 `ps`、`pgrep` 和 `kill` 无法看到或向主机进程发送信号。当配置了 `allowed_non_write_users` 时，`claude-code-action` 会自动设置此选项 |
| `CLAUDE_CODE_SYNC_PLUGIN_INSTALL` | 在非交互模式（`-p` 标志）下设置为 `1` 以在第一次查询之前等待插件安装完成。没有此设置时，插件在后台安装，可能在第一轮不可用。与 `CLAUDE_CODE_SYNC_PLUGIN_INSTALL_TIMEOUT_MS` 结合使用以限制等待时间 |
| `CLAUDE_CODE_SYNC_PLUGIN_INSTALL_TIMEOUT_MS` | 同步插件安装的超时时间（毫秒）。超过时，CSC 继续运行而不使用插件并记录错误。无默认值：没有此变量时，同步安装会等待直到完成 |
| `CLAUDE_CODE_SYNTAX_HIGHLIGHT` | 设置为 `false` 以禁用差异输出中的语法高亮。当颜色干扰你的终端设置时有用 |
| `CLAUDE_CODE_TASK_LIST_ID` | 跨会话共享任务列表。在多个 CSC 实例中设置相同的 ID 以协调共享任务列表。参见任务列表 |
| `CLAUDE_CODE_TEAM_NAME` | 此队友所属的代理团队名称。在代理团队成员上自动设置 |
| `CLAUDE_CODE_TMPDIR` | 覆盖用于内部临时文件的临时目录。CSC 在此路径后追加 `/claude-{uid}/`（Unix）或 `/claude/`（Windows）。默认：macOS 上为 `/tmp`，Linux/Windows 上为 `os.tmpdir()` |
| `CLAUDE_CODE_USE_BEDROCK` | 使用 Bedrock |
| `CLAUDE_CODE_USE_FOUNDRY` | 使用 Microsoft Foundry |
| `CLAUDE_CODE_USE_MANTLE` | 使用 Bedrock Mantle 端点 |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL` | 设置为 `1` 以在 Windows 上启用 PowerShell 工具（选择加入预览）。启用后，Claude 可以原生运行 PowerShell 命令，而不是通过 Git Bash 路由。仅在原生 Windows 上支持，不支持 WSL。参见 PowerShell 工具 |
| `CLAUDE_CODE_USE_VERTEX` | 使用 Vertex |
| `CLAUDE_CONFIG_DIR` | 覆盖配置目录（默认：`~/.claude`）。所有设置、凭据、会话历史和插件都存储在此路径下。适用于并行运行多个账户：例如，`alias csc-work='CLAUDE_CONFIG_DIR=~/.claude-work csc'` |
| `CLAUDE_ENABLE_STREAM_WATCHDOG` | 设置为 `1` 以中止停滞 90 秒无数据的 API 响应流。在自动化环境中（挂起的会话不会被注意到）或在静默断开连接的代理后面有用。没有此设置时，停滞的流可能会无限期挂起会话，因为请求超时仅覆盖初始连接。使用 `CLAUDE_STREAM_IDLE_TIMEOUT_MS` 配置超时 |
| `CLAUDE_ENV_FILE` | CSC 在每次 Bash 命令之前 source 的 shell 脚本路径。用于在命令之间持久化 virtualenv 或 conda 激活。也由 SessionStart、CwdChanged 和 FileChanged 钩子动态填充 |
| `CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX` | 未提供显式名称时自动生成的远程控制会话名称的前缀。默认为机器的主机名，产生类似 `myhost-graceful-unicorn` 的名称。`--remote-control-session-name-prefix` CLI 标志为单次调用设置相同的值 |
| `CLAUDE_STREAM_IDLE_TIMEOUT_MS` | 流式空闲看门狗关闭停滞连接之前的超时时间（毫秒）。默认：`90000`（90 秒）。需要 `CLAUDE_ENABLE_STREAM_WATCHDOG=1`。如果长时间运行的工具或慢速网络导致过早超时错误，请增加此值 |
| `DISABLE_AUTOUPDATER` | 设置为 `1` 以禁用自动更新 |
| `DISABLE_AUTO_COMPACT` | 设置为 `1` 以在接近上下文限制时禁用自动压缩。手动 `/compact` 命令仍然可用。当你想要显式控制压缩发生时机时使用 |
| `DISABLE_COMPACT` | 设置为 `1` 以禁用所有压缩：包括自动压缩和手动 `/compact` 命令 |
| `DISABLE_COST_WARNINGS` | 设置为 `1` 以禁用成本警告消息 |
| `DISABLE_DOCTOR_COMMAND` | 设置为 `1` 以隐藏 `/doctor` 命令。适用于用户不应运行安装诊断的托管部署 |
| `DISABLE_ERROR_REPORTING` | 设置为 `1` 以退出 Sentry 错误报告 |
| `DISABLE_EXTRA_USAGE_COMMAND` | 设置为 `1` 以隐藏允许用户购买超出速率限制的额外使用量的 `/extra-usage` 命令 |
| `DISABLE_FEEDBACK_COMMAND` | 设置为 `1` 以禁用 `/feedback` 命令。旧名称 `DISABLE_BUG_COMMAND` 也被接受 |
| `DISABLE_INSTALLATION_CHECKS` | 设置为 `1` 以禁用安装警告。仅在手动管理安装位置时使用，因为这可能掩盖标准安装的问题 |
| `DISABLE_INSTALL_GITHUB_APP_COMMAND` | 设置为 `1` 以隐藏 `/install-github-app` 命令。使用第三方提供商（Bedrock、Vertex 或 Foundry）时已隐藏 |
| `DISABLE_INTERLEAVED_THINKING` | 设置为 `1` 以阻止发送 interleaved-thinking beta 头。当你的 LLM 网关或提供商不支持交错思维时有用 |
| `DISABLE_LOGIN_COMMAND` | 设置为 `1` 以隐藏 `/login` 命令。当认证通过 API 密钥或 `apiKeyHelper` 外部处理时有用 |
| `DISABLE_LOGOUT_COMMAND` | 设置为 `1` 以隐藏 `/logout` 命令 |
| `DISABLE_PROMPT_CACHING` | 设置为 `1` 以禁用所有模型的提示缓存（优先于每个模型的设置） |
| `DISABLE_PROMPT_CACHING_HAIKU` | 设置为 `1` 以禁用 Haiku 模型的提示缓存 |
| `DISABLE_PROMPT_CACHING_OPUS` | 设置为 `1` 以禁用 Opus 模型的提示缓存 |
| `DISABLE_PROMPT_CACHING_SONNET` | 设置为 `1` 以禁用 Sonnet 模型的提示缓存 |
| `DISABLE_TELEMETRY` | 设置为 `1` 以退出 Statsig 遥测（注意 Statsig 事件不包含用户数据，如代码、文件路径或 bash 命令） |
| `DISABLE_UPGRADE_COMMAND` | 设置为 `1` 以隐藏 `/upgrade` 命令 |
| `ENABLE_CLAUDEAI_MCP_SERVERS` | 设置为 `false` 以在 CSC 中禁用 claude.ai MCP 服务器。登录用户默认启用 |
| `ENABLE_PROMPT_CACHING_1H_BEDROCK` | 使用 Bedrock 时设置为 `1` 以请求 1 小时的提示缓存 TTL 而非默认的 5 分钟。仅限 Bedrock |
| `ENABLE_TOOL_SEARCH` | 控制 MCP 工具搜索。未设置：所有 MCP 工具默认延迟加载，但当 `ANTHROPIC_BASE_URL` 指向非第一方主机时提前加载。值：`true`（始终延迟，包括代理）、`auto`（阈值模式：如果工具在上下文的 10% 内则提前加载）、`auto:N`（自定义阈值，例如 `auto:5` 为 5%）、`false`（全部提前加载） |
| `FALLBACK_FOR_ALL_PRIMARY_MODELS` | 设置为任何非空值以在任何主模型上出现重复过载错误后触发回退到 `--fallback-model`。默认情况下，仅 Opus 模型触发回退 |
| `FORCE_AUTOUPDATE_PLUGINS` | 设置为 `1` 以强制插件自动更新，即使通过 `DISABLE_AUTOUPDATER` 禁用了主自动更新器 |
| `HTTP_PROXY` | 指定网络连接的 HTTP 代理服务器 |
| `HTTPS_PROXY` | 指定网络连接的 HTTPS 代理服务器 |
| `IS_DEMO` | 设置为 `1` 以启用演示模式：在标题和 `/status` 输出中隐藏你的电子邮件和组织名称，并跳过引导。在流式传输或录制会话时有用 |
| `MAX_MCP_OUTPUT_TOKENS` | MCP 工具响应中允许的最大 token 数。当输出超过 10,000 token 时，CSC 显示警告。声明 `anthropic/maxResultSizeChars` 的工具使用该字符限制作为文本内容，但这些工具的图像内容仍受此变量约束（默认：25000） |
| `MAX_STRUCTURED_OUTPUT_RETRIES` | 在非交互模式（`-p` 标志）下，当模型响应未能通过 `--json-schema` 验证时的重试次数。默认为 5 |
| `MAX_THINKING_TOKENS` | 覆盖扩展思维 token 预算。上限为模型的最大输出 token 数减一。设置为 `0` 以完全禁用思考。在具有自适应推理的模型（Opus 4.6、Sonnet 4.6）上，除非通过 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` 禁用自适应推理，否则预算被忽略 |
| `MCP_CLIENT_SECRET` | 需要预配置凭据的 MCP 服务器的 OAuth 客户端密钥。避免使用 `--client-secret` 添加服务器时的交互式提示 |
| `MCP_CONNECTION_NONBLOCKING` | 在非交互模式（`-p`）下设置为 `true` 以完全跳过 MCP 连接等待。适用于不需要 MCP 工具的脚本化管道。没有此变量时，第一次查询会等待最多 5 秒以连接 `--mcp-config` 服务器 |
| `MCP_OAUTH_CALLBACK_PORT` | OAuth 重定向回调的固定端口，作为使用预配置凭据添加 MCP 服务器时 `--callback-port` 的替代方案 |
| `MCP_REMOTE_SERVER_CONNECTION_BATCH_SIZE` | 启动期间并行连接的最大远程 MCP 服务器（HTTP/SSE）数量（默认：20） |
| `MCP_SERVER_CONNECTION_BATCH_SIZE` | 启动期间并行连接的最大本地 MCP 服务器（stdio）数量（默认：3） |
| `MCP_TIMEOUT` | MCP 服务器启动超时时间（毫秒）（默认：30000，即 30 秒） |
| `MCP_TOOL_TIMEOUT` | MCP 工具执行超时时间（毫秒）（默认：100000000，约 28 小时） |
| `NO_PROXY` | 直接发出请求（绕过代理）的域名和 IP 列表 |
| `OTEL_LOG_TOOL_CONTENT` | 设置为 `1` 以在 OpenTelemetry span 事件中包含工具输入和输出内容。默认禁用以保护敏感数据。参见监控 |
| `OTEL_LOG_TOOL_DETAILS` | 设置为 `1` 以在遥测中包含 MCP 服务器名称和工具详情。默认禁用以保护 PII。参见监控 |
| `OTEL_LOG_USER_PROMPTS` | 设置为 `1` 以在 OpenTelemetry 跟踪和日志中包含用户提示文本。默认禁用（提示被脱敏）。参见监控 |
| `OTEL_METRICS_INCLUDE_ACCOUNT_UUID` | 设置为 `false` 以从指标属性中排除账户 UUID（默认：包含）。参见监控 |
| `OTEL_METRICS_INCLUDE_SESSION_ID` | 设置为 `false` 以从指标属性中排除会话 ID（默认：包含）。参见监控 |
| `OTEL_METRICS_INCLUDE_VERSION` | 设置为 `true` 以在指标属性中包含 CSC 版本（默认：排除）。参见监控 |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | 覆盖显示给技能工具的技能元数据字符预算。预算按上下文窗口的 1% 动态缩放，回退为 8,000 个字符。保留旧名称以实现向后兼容 |
| `TASK_MAX_OUTPUT_LENGTH` | 子代理输出截断前的最大字符数（默认：32000，最大：160000）。截断时，完整输出保存到磁盘，路径包含在截断的响应中 |
| `USE_BUILTIN_RIPGREP` | 设置为 `0` 以使用系统安装的 `rg` 而非 CSC 附带的 `rg` |

也支持标准 OpenTelemetry 导出器变量（`OTEL_METRICS_EXPORTER`、`OTEL_LOGS_EXPORTER`、`OTEL_EXPORTER_OTLP_ENDPOINT`、`OTEL_EXPORTER_OTLP_PROTOCOL`、`OTEL_EXPORTER_OTLP_HEADERS`、`OTEL_METRIC_EXPORT_INTERVAL`、`OTEL_RESOURCE_ATTRIBUTES` 及信号特定变体）。参见监控了解配置详情。
