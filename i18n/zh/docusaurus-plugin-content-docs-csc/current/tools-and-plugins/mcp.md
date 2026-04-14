---
sidebar_position: 1
---

# 通过 MCP 将 CSC 连接到工具

> 了解如何使用模型上下文协议将 CSC 连接到您的工具。

CSC 可以通过模型上下文协议（MCP）连接到数百个外部工具和数据源，这是一个用于 AI-工具集成的开源标准。MCP 服务器使 CSC 能够访问您的工具、数据库和 API。

当您发现自己从其他工具（如问题跟踪器或监控仪表板）复制数据到聊天中时，请连接服务器。连接后，CSC 可以直接读取和操作该系统，而不是基于您粘贴的内容工作。

## 使用 MCP 可以做什么

连接 MCP 服务器后，您可以要求 CSC 执行以下操作：

* **根据问题跟踪器实现功能**："添加 JIRA 问题 ENG-4521 中描述的功能并在 GitHub 上创建 PR。"
* **分析监控数据**："检查 Sentry 和 Statsig 以查看 ENG-4521 中描述功能的使用情况。"
* **查询数据库**："根据我们的 PostgreSQL 数据库，查找使用了功能 ENG-4521 的 10 个随机用户的电子邮件。"
* **集成设计**："根据 Slack 中发布的新 Figma 设计更新我们的标准电子邮件模板"
* **自动化工作流**："创建 Gmail 草稿，邀请这 10 个用户参加关于新功能的反馈会议。"
* **响应外部事件**：MCP 服务器还可以充当频道，将消息推送到您的会话中，这样当您不在时，CSC 可以响应 Telegram 消息、Discord 聊天或 webhook 事件。

## 常用 MCP 服务器

以下是一些可以连接到 CSC 的常用 MCP 服务器：

> **⚠️ 警告：** 使用第三方 MCP 服务器需自行承担风险 - Anthropic 尚未验证所有这些服务器的正确性或安全性。请确保您信任所安装的 MCP 服务器。使用可能获取不受信任内容的 MCP 服务器时要特别小心，因为这些可能会使您面临提示注入风险。

> **注意：** **需要特定集成？** 在 GitHub 上查找数百个 MCP 服务器，或使用 MCP SDK 构建您自己的服务器。

## 安装 MCP 服务器

MCP 服务器可以根据您的需求以三种不同方式进行配置：

### 选项 1：添加远程 HTTP 服务器

HTTP 服务器是连接远程 MCP 服务器的推荐选项。这是云服务最广泛支持的传输方式。

```bash
# 基本语法
csc mcp add --transport http <name> <url>

# 实际示例：连接到 Notion
csc mcp add --transport http notion https://mcp.notion.com/mcp

# 使用 Bearer token 的示例
csc mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

### 选项 2：添加远程 SSE 服务器

> **⚠️ 警告：** SSE（服务器发送事件）传输已被弃用。请尽可能使用 HTTP 服务器代替。

```bash
# 基本语法
csc mcp add --transport sse <name> <url>

# 实际示例：连接到 Asana
csc mcp add --transport sse asana https://mcp.asana.com/sse

# 使用认证头的示例
csc mcp add --transport sse private-api https://api.company.com/sse \
  --header "X-API-Key: your-key-here"
```

### 选项 3：添加本地 stdio 服务器

Stdio 服务器作为本地进程在您的机器上运行。它们适用于需要直接系统访问或自定义脚本的工具。

```bash
# 基本语法
csc mcp add [options] <name> -- <command> [args...]

# 实际示例：添加 Airtable 服务器
csc mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server
```

> **注意：** **重要：选项顺序**
>
> 所有选项（`--transport`、`--env`、`--scope`、`--header`）必须放在服务器名称**之前**。`--`（双短横线）然后将服务器名称与传递给 MCP 服务器的命令和参数分隔开。
>
> 例如：
>
> * `csc mcp add --transport stdio myserver -- npx server` → 运行 `npx server`
> * `csc mcp add --transport stdio --env KEY=value myserver -- python server.py --port 8080` → 在环境变量中设置 `KEY=value` 的情况下运行 `python server.py --port 8080`
>
> 这样可以防止 CSC 的标志与服务器标志之间的冲突。

### 管理您的服务器

配置完成后，您可以使用以下命令管理 MCP 服务器：

```bash
# 列出所有已配置的服务器
csc mcp list

# 获取特定服务器的详细信息
csc mcp get github

# 移除服务器
csc mcp remove github

# （在 CSC 内）检查服务器状态
/mcp
```

### 动态工具更新

CSC 支持 MCP `list_changed` 通知，允许 MCP 服务器动态更新其可用工具、提示和资源，而无需断开和重新连接。当 MCP 服务器发送 `list_changed` 通知时，CSC 会自动刷新该服务器的可用功能。

### 通过频道推送消息

MCP 服务器还可以直接将消息推送到您的会话中，以便 CSC 可以响应外部事件，如 CI 结果、监控警报或聊天消息。要启用此功能，您的服务器需要声明 `claude/channel` 能力，并在启动时使用 `--channels` 标志选择启用。请参阅频道以使用官方支持的频道，或参阅频道参考以构建您自己的频道。

> **💡 提示：** 提示：
>
> * 使用 `--scope` 标志指定配置存储位置：
>   * `local`（默认）：仅在当前项目中可供您使用（在旧版本中称为 `project`）
>   * `project`：通过 `.mcp.json` 文件与项目中的所有人共享
>   * `user`：在所有项目中可供您使用（在旧版本中称为 `global`）
> * 使用 `--env` 标志设置环境变量（例如 `--env KEY=value`）
> * 使用 MCP\_TIMEOUT 环境变量配置 MCP 服务器启动超时时间（例如 `MCP_TIMEOUT=10000 csc` 设置 10 秒超时）
> * 当 MCP 工具输出超过 10,000 个 token 时，CSC 将显示警告。要增加此限制，请设置 `MAX_MCP_OUTPUT_TOKENS` 环境变量（例如 `MAX_MCP_OUTPUT_TOKENS=50000`）
> * 使用 `/mcp` 与需要 OAuth 2.0 认证的远程服务器进行身份验证

> **⚠️ 警告：** **Windows 用户**：在原生 Windows（非 WSL）上，使用 `npx` 的本地 MCP 服务器需要 `cmd /c` 包装器以确保正确执行。
>
> ```bash
> # 这会创建 command="cmd"，Windows 可以执行
> csc mcp add --transport stdio my-server -- cmd /c npx -y @some/package
> ```
>
> 如果没有 `cmd /c` 包装器，您将遇到"Connection closed"错误，因为 Windows 无法直接执行 `npx`。（请参阅上面对 `--` 参数的解释。）

### Plugins提供的 MCP 服务器

Plugins可以捆绑 MCP 服务器，在启用Plugins时自动提供工具和集成。Plugins MCP 服务器与用户配置的服务器工作方式相同。

**Plugins MCP 服务器的工作方式**：

* Plugins在Plugins根目录的 `.mcp.json` 中或 `plugin.json` 中内联定义 MCP 服务器
* 启用Plugins时，其 MCP 服务器自动启动
* Plugins MCP 工具与手动配置的 MCP 工具一起显示
* Plugins服务器通过Plugins安装管理（而非 `/mcp` 命令）

**Plugins MCP 配置示例**：

在Plugins根目录的 `.mcp.json` 中：

```json
{
  "mcpServers": {
    "database-tools": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_URL": "${DB_URL}"
      }
    }
  }
}
```

或在 `plugin.json` 中内联：

```json
{
  "name": "my-plugin",
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

**Plugins MCP 功能**：

* **自动生命周期**：在会话启动时，已启用Plugins的服务器自动连接。如果您在会话期间启用或禁用Plugins，请运行 `/reload-plugins` 以连接或断开其 MCP 服务器
* **环境变量**：使用 `${CLAUDE_PLUGIN_ROOT}` 引用捆绑的Plugins文件，使用 `${CLAUDE_PLUGIN_DATA}` 引用在Plugins更新后仍保留的持久状态
* **用户环境访问**：可以访问与手动配置服务器相同的环境变量
* **多种传输类型**：支持 stdio、SSE 和 HTTP 传输（传输支持可能因服务器而异）

**查看Plugins MCP 服务器**：

```bash
# 在 CSC 内，查看所有 MCP 服务器（包括Plugins服务器）
/mcp
```

Plugins服务器在列表中带有指示其来自Plugins的标记。

**Plugins MCP 服务器的好处**：

* **捆绑分发**：工具和服务器打包在一起
* **自动设置**：无需手动 MCP 配置
* **团队一致性**：安装Plugins后每个人都获得相同的工具

有关使用Plugins捆绑 MCP 服务器的详细信息，请参阅Plugins组件参考。

## MCP 安装作用域

MCP 服务器可以在三个作用域中配置。您选择的作用域控制服务器在哪些项目中加载，以及配置是否与团队共享。

| 作用域                     | 加载范围             | 是否与团队共享         | 存储位置                   |
| ------------------------- | -------------------- | ------------------------ | --------------------------- |
| Local     | 仅当前项目 | 否                       | `~/.claude.json`            |
| Project | 仅当前项目 | 是，通过版本控制 | 项目根目录中的 `.mcp.json` |
| User       | 所有您的项目    | 否                       | `~/.claude.json`            |

### Local 作用域

Local 作用域是默认值。Local 作用域的服务器仅在您添加它的项目中加载，并且对您是私有的。CSC 将其存储在 `~/.claude.json` 中该项目路径下，因此同一服务器不会出现在您的其他项目中。将 Local 作用域用于个人开发服务器、实验性配置或包含您不想放入版本控制的凭据的服务器。

> **注意：** MCP 服务器的"local 作用域"术语与一般本地设置不同。MCP Local 作用域的服务器存储在 `~/.claude.json`（您的主目录）中，而一般本地设置使用 `.claude/settings.local.json`（在项目目录中）。有关设置文件位置的详细信息，请参阅设置。

```bash
# 添加 Local 作用域的服务器（默认）
csc mcp add --transport http stripe https://mcp.stripe.com

# 明确指定 local 作用域
csc mcp add --transport http stripe --scope local https://mcp.stripe.com
```

该命令将服务器写入 `~/.claude.json` 中当前项目的条目。以下示例显示了从 `/path/to/your/project` 运行时的结果：

```json
{
  "projects": {
    "/path/to/your/project": {
      "mcpServers": {
        "stripe": {
          "type": "http",
          "url": "https://mcp.stripe.com"
        }
      }
    }
  }
}
```

### Project 作用域

Project 作用域的服务器通过将配置存储在项目根目录的 `.mcp.json` 文件中来实现团队协作。此文件设计为提交到版本控制，确保所有团队成员都能访问相同的 MCP 工具和服务。当您添加 Project 作用域的服务器时，CSC 会自动创建或更新此文件，使用适当的配置结构。

```bash
# 添加 Project 作用域的服务器
csc mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp
```

生成的 `.mcp.json` 文件遵循标准化格式：

```json
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```

出于安全原因，CSC 在使用 `.mcp.json` 文件中的 Project 作用域服务器之前会提示您批准。如果您需要重置这些批准选择，请使用 `csc mcp reset-project-choices` 命令。

### User 作用域

User 作用域的服务器存储在 `~/.claude.json` 中，提供跨项目访问能力，使其在您机器上的所有项目中可用，同时对您的用户账户保持私有。此作用域适用于个人实用服务器、开发工具或您在不同项目中频繁使用的服务。

```bash
# 添加 User 作用域的服务器
csc mcp add --transport http hubspot --scope user https://mcp.hubspot.com/anthropic
```

### 作用域层级和优先级

当同一服务器在多个地方定义时，CSC 只连接一次，使用最高优先级来源的定义：

1. Local 作用域
2. Project 作用域
3. User 作用域
4. Plugins提供的服务器
5. claude.ai 连接器

三个作用域按名称匹配重复项。Plugins和连接器按端点匹配，因此指向与上述服务器相同 URL 或命令的Plugins或连接器被视为重复项。

### `.mcp.json` 中的环境变量展开

CSC 支持 `.mcp.json` 文件中的环境变量展开，允许团队共享配置，同时保持机器特定路径和 API 密钥等敏感值的灵活性。

**支持的语法：**

* `${VAR}` - 展开为环境变量 `VAR` 的值
* `${VAR:-default}` - 如果 `VAR` 已设置则展开为其值，否则使用 `default`

**展开位置：**
环境变量可以在以下位置展开：

* `command` - 服务器可执行文件路径
* `args` - 命令行参数
* `env` - 传递给服务器的环境变量
* `url` - 用于 HTTP 服务器类型
* `headers` - 用于 HTTP 服务器认证

**使用变量展开的示例：**

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

如果所需的环境变量未设置且没有默认值，CSC 将无法解析配置。

## 实用示例

### 示例：使用 Sentry 监控错误

```bash
csc mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

使用您的 Sentry 账户进行身份验证：

```text
/mcp
```

然后调试生产问题：

```text
过去 24 小时内最常见的错误是什么？
```

```text
显示错误 ID abc123 的堆栈跟踪
```

```text
哪个部署引入了这些新错误？
```

### 示例：连接 GitHub 进行代码审查

```bash
csc mcp add --transport http github https://api.githubcopilot.com/mcp/
```

如果需要，选择 GitHub 的"Authenticate"进行身份验证：

```text
/mcp
```

然后使用 GitHub：

```text
审查 PR #456 并提出改进建议
```

```text
为我们刚发现的 bug 创建一个新 issue
```

```text
显示分配给我的所有未完成 PR
```

### 示例：查询 PostgreSQL 数据库

```bash
csc mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

然后自然地查询您的数据库：

```text
本月我们的总收入是多少？
```

```text
显示 orders 表的架构
```

```text
查找 90 天内未购买的客户
```

## 与远程 MCP 服务器进行身份验证

许多基于云的 MCP 服务器需要身份验证。CSC 支持 OAuth 2.0 以实现安全连接。

### 步骤 1：添加需要身份验证的服务器

例如：

```bash
csc mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

### 步骤 2：在 CSC 中使用 /mcp 命令

在 CSC 中，使用命令：

```text
/mcp
```

然后按照浏览器中的步骤登录。

> **💡 提示：** 提示：
>
> * 身份验证令牌安全存储并自动刷新
> * 使用 `/mcp` 菜单中的"Clear authentication"撤销访问权限
> * 如果您的浏览器没有自动打开，请复制提供的 URL 并手动打开
> * 如果浏览器在身份验证后因连接错误导致重定向失败，请将浏览器地址栏中的完整回调 URL 粘贴到 CSC 中出现的 URL 提示中
> * OAuth 身份验证适用于 HTTP 服务器

### 使用固定的 OAuth 回调端口

某些 MCP 服务器需要预先注册的特定重定向 URI。默认情况下，CSC 为 OAuth 回调选择一个随机可用端口。使用 `--callback-port` 固定端口，使其与预先注册的 `http://localhost:PORT/callback` 格式的重定向 URI 匹配。

您可以单独使用 `--callback-port`（使用动态客户端注册），也可以与 `--client-id` 一起使用（使用预配置的凭据）。

```bash
# 使用动态客户端注册的固定回调端口
csc mcp add --transport http \
  --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### 使用预配置的 OAuth 凭据

某些 MCP 服务器不支持通过动态客户端注册进行自动 OAuth 设置。如果您看到类似"Incompatible auth server: does not support dynamic client registration"的错误，则服务器需要预配置的凭据。CSC 还支持使用客户端 ID 元数据文档（CIMD）而非动态客户端注册的服务器，并会自动发现这些服务器。如果自动发现失败，请先通过服务器的开发者门户注册 OAuth 应用，然后在添加服务器时提供凭据。

#### 步骤 1：在服务器上注册 OAuth 应用

通过服务器的开发者门户创建应用，并记下您的客户端 ID 和客户端密钥。

许多服务器还需要重定向 URI。如果是，请选择一个端口并以 `http://localhost:PORT/callback` 格式注册重定向 URI。在下一步中使用相同的端口配合 `--callback-port`。

#### 步骤 2：使用您的凭据添加服务器

选择以下方法之一。`--callback-port` 使用的端口可以是任何可用端口。它只需要与您在上一步中注册的重定向 URI 匹配。

#### csc mcp add

使用 `--client-id` 传递应用的客户端 ID。`--client-secret` 标志会提示输入密钥并遮盖输入：

```bash
csc mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

#### csc mcp add-json

在 JSON 配置中包含 `oauth` 对象，并作为单独的标志传递 `--client-secret`：

```bash
csc mcp add-json my-server \
  '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' \
  --client-secret
```

#### csc mcp add-json（仅回调端口）

使用 `--callback-port` 而不使用客户端 ID，在使用动态客户端注册时固定端口：

```bash
csc mcp add-json my-server \
  '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"callbackPort":8080}}'
```

#### CI / 环境变量

通过环境变量设置密钥以跳过交互式提示：

```bash
MCP_CLIENT_SECRET=your-secret csc mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

#### 步骤 3：在 CSC 中进行身份验证

在 CSC 中运行 `/mcp` 并按照浏览器登录流程操作。

> **💡 提示：** 提示：
>
> * 客户端密钥安全存储在您的系统钥匙链（macOS）或凭据文件中，而非配置中
> * 如果服务器使用没有密钥的公共 OAuth 客户端，请仅使用 `--client-id` 而不使用 `--client-secret`
> * `--callback-port` 可以与 `--client-id` 一起使用或不一起使用
> * 这些标志仅适用于 HTTP 和 SSE 传输。它们对 stdio 服务器没有影响
> * 使用 `csc mcp get <name>` 验证服务器是否配置了 OAuth 凭据

### 覆盖 OAuth 元数据发现

如果您的 MCP 服务器的标准 OAuth 元数据端点返回错误，但服务器公开了可用的 OIDC 端点，您可以指向特定的元数据 URL 以绕过默认的发现链。默认情况下，CSC 首先检查 `/.well-known/oauth-protected-resource` 处的 RFC 9728 受保护资源元数据，然后回退到 `/.well-known/oauth-authorization-server` 处的 RFC 8414 授权服务器元数据。

在 `.mcp.json` 中服务器配置的 `oauth` 对象中设置 `authServerMetadataUrl`：

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "oauth": {
        "authServerMetadataUrl": "https://auth.example.com/.well-known/openid-configuration"
      }
    }
  }
}
```

URL 必须使用 `https://`。此选项需要 CSC v2.1.64 或更高版本。

### 使用动态头部进行自定义身份验证

如果您的 MCP 服务器使用 OAuth 以外的身份验证方案（如 Kerberos、短期令牌或内部 SSO），请使用 `headersHelper` 在连接时生成请求头部。CSC 运行该命令并将其输出合并到连接头部中。

```json
{
  "mcpServers": {
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "/opt/bin/get-mcp-auth-headers.sh"
    }
  }
}
```

命令也可以内联：

```json
{
  "mcpServers": {
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "echo '{\"Authorization\": \"Bearer '\"$(get-token)\"'\"}'"
    }
  }
}
```

**要求：**

* 命令必须将 JSON 对象（字符串键值对）写入 stdout
* 命令在 shell 中运行，超时时间为 10 秒
* 动态头部覆盖任何同名的静态 `headers`

辅助程序在每次连接时（会话启动和重新连接时）重新运行。没有缓存，因此您的脚本负责任何令牌重用。

CSC 在执行辅助程序时设置以下环境变量：

| 变量                      | 值                      |
| :---------------------------- | :------------------------- |
| `CLAUDE_CODE_MCP_SERVER_NAME` | MCP 服务器的名称 |
| `CLAUDE_CODE_MCP_SERVER_URL`  | MCP 服务器的 URL  |

使用这些变量编写一个服务于多个 MCP 服务器的辅助脚本。

> **注意：** `headersHelper` 执行任意 shell 命令。在项目或本地作用域中定义时，它只有在您接受工作区信任对话框后才运行。

## 从 JSON 配置添加 MCP 服务器

如果您有 MCP 服务器的 JSON 配置，可以直接添加：

### 步骤 1：从 JSON 添加 MCP 服务器

```bash
# 基本语法
csc mcp add-json <name> '<json>'

# 示例：使用 JSON 配置添加 HTTP 服务器
csc mcp add-json weather-api '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

# 示例：使用 JSON 配置添加 stdio 服务器
csc mcp add-json local-weather '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'

# 示例：使用预配置的 OAuth 凭据添加 HTTP 服务器
csc mcp add-json my-server '{"type":"http","url":"https://mcp.example.com/mcp","oauth":{"clientId":"your-client-id","callbackPort":8080}}' --client-secret
```

### 步骤 2：验证服务器已添加

```bash
csc mcp get weather-api
```

> **💡 提示：** 提示：
>
> * 确保 JSON 在您的 shell 中正确转义
> * JSON 必须符合 MCP 服务器配置架构
> * 您可以使用 `--scope user` 将服务器添加到您的用户配置而非项目特定配置



## 将 CSC 用作 MCP 服务器

您可以将 CSC 本身用作其他应用程序可以连接的 MCP 服务器：

```bash
# 将 CSC 作为 stdio MCP 服务器启动
csc mcp serve
```

您可以通过将此配置添加到 claude\_desktop\_config.json 中来在 Claude Desktop 中使用：

```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "csc",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

> **⚠️ 警告：** **配置可执行文件路径**：`command` 字段必须引用 CSC 可执行文件。如果 `csc` 命令不在您系统的 PATH 中，您需要指定可执行文件的完整路径。
>
> 要查找完整路径：
>
> ```bash
> which csc
> ```
>
> 然后在配置中使用完整路径：
>
> ```json
> {
>   "mcpServers": {
>     "claude-code": {
>       "type": "stdio",
>       "command": "/full/path/to/csc",
>       "args": ["mcp", "serve"],
>       "env": {}
>     }
>   }
> }
> ```
>
> 如果没有正确的可执行文件路径，您将遇到 `spawn csc ENOENT` 等错误。

> **💡 提示：** 提示：
>
> * 服务器提供对 CSC 工具的访问，如 View、Edit、LS 等
> * 在 Claude Desktop 中，尝试让 CSC 读取目录中的文件、进行编辑等
> * 请注意，此 MCP 服务器仅将 CSC 的工具暴露给您的 MCP 客户端，因此您自己的客户端负责实现对各个工具调用的用户确认

## MCP 输出限制和警告

当 MCP 工具产生大量输出时，CSC 帮助管理 token 使用量，以防止对话上下文过载：

* **输出警告阈值**：当任何 MCP 工具输出超过 10,000 个 token 时，CSC 显示警告
* **可配置限制**：您可以使用 `MAX_MCP_OUTPUT_TOKENS` 环境变量调整允许的最大 MCP 输出 token 数
* **默认限制**：默认最大值为 25,000 个 token
* **作用域**：环境变量适用于未声明自身限制的工具。设置了 `anthropic/maxResultSizeChars` 的工具无论 `MAX_MCP_OUTPUT_TOKENS` 设置为什么，都使用该值作为文本内容。返回图像数据的工具仍受 `MAX_MCP_OUTPUT_TOKENS` 限制

要增加产生大量输出的工具的限制：

```bash
export MAX_MCP_OUTPUT_TOKENS=50000
csc
```

这在处理以下 MCP 服务器时特别有用：

* 查询大型数据集或数据库
* 生成详细报告或文档
* 处理大量日志文件或调试信息

### 提高特定工具的限制

如果您正在构建 MCP 服务器，可以通过在工具的 `tools/list` 响应条目中设置 `_meta["anthropic/maxResultSizeChars"]` 来允许单个工具返回超过默认持久化到磁盘阈值的结果。CSC 将该工具的阈值提高到注释值，上限为 500,000 个字符。

这对于返回本质上较大但必要的输出的工具很有用，例如数据库架构或完整文件树。没有注释时，超过默认阈值的结果会持久化到磁盘，并在对话中替换为文件引用。

```json
{
  "name": "get_schema",
  "description": "返回完整的数据库架构",
  "_meta": {
    "anthropic/maxResultSizeChars": 200000
  }
}
```

该注释对文本内容独立于 `MAX_MCP_OUTPUT_TOKENS` 应用，因此用户不需要为声明了该注释的工具提高环境变量。返回图像数据的工具仍受 token 限制。

> **⚠️ 警告：** 如果您经常遇到无法控制的特定 MCP 服务器的输出警告，请考虑增加 `MAX_MCP_OUTPUT_TOKENS` 限制。您也可以要求服务器作者添加 `anthropic/maxResultSizeChars` 注释或对其响应进行分页。该注释对返回图像内容的工具没有影响；对于这些工具，提高 `MAX_MCP_OUTPUT_TOKENS` 是唯一的选择。

## 响应 MCP 请求请求

MCP 服务器可以使用请求在任务中途向您请求结构化输入。当服务器需要无法自行获取的信息时，CSC 会显示交互式对话框并将您的响应传回服务器。您无需进行任何配置：请求对话框会在服务器请求时自动出现。

服务器可以通过两种方式请求输入：

* **表单模式**：CSC 显示一个包含服务器定义的表单字段的对话框（例如用户名和密码提示）。填写字段并提交。
* **URL 模式**：CSC 打开一个浏览器 URL 进行身份验证或批准。在浏览器中完成流程，然后在 CLI 中确认。

要自动响应请求请求而不显示对话框，请使用 Elicitation Hooks。

如果您正在构建使用请求的 MCP 服务器，请参阅 MCP 请求规范以获取协议详细信息和架构示例。

## 使用 MCP 资源

MCP 服务器可以暴露资源，您可以使用 @ 提及来引用它们，类似于引用文件的方式。

### 引用 MCP 资源

#### 步骤 1：列出可用资源

在提示中输入 `@` 以查看所有已连接 MCP 服务器的可用资源。资源与文件一起出现在自动完成菜单中。

#### 步骤 2：引用特定资源

使用格式 `@server:protocol://resource/path` 引用资源：

```text
你能分析 @github:issue://123 并建议修复方案吗？
```

```text
请查看 @docs:file://api/authentication 处的 API 文档
```

#### 步骤 3：多个资源引用

您可以在单个提示中引用多个资源：

```text
比较 @postgres:schema://users 和 @docs:file://database/user-model
```

> **💡 提示：** 提示：
>
> * 引用资源时会自动获取并作为附件包含
> * 资源路径在 @ 提及自动完成中支持模糊搜索
> * 当服务器支持时，CSC 自动提供列出和读取 MCP 资源的工具
> * 资源可以包含 MCP 服务器提供的任何类型的内容（文本、JSON、结构化数据等）

## 使用 MCP 工具搜索进行扩展

工具搜索通过延迟工具定义直到 CSC 需要它们来保持 MCP 上下文使用量较低。会话启动时仅加载工具名称，因此添加更多 MCP 服务器对您的上下文窗口影响极小。

### 工作原理

工具搜索默认启用。MCP 工具被延迟而非预先加载到上下文中，CSC 在任务需要时使用搜索工具发现相关工具。只有 CSC 实际使用的工具才会进入上下文。从您的角度来看，MCP 工具的工作方式与之前完全相同。

如果您更喜欢基于阈值的加载，请设置 `ENABLE_TOOL_SEARCH=auto`，当工具适合上下文窗口的 10% 以内时预先加载架构，仅延迟溢出部分。有关所有选项，请参阅配置工具搜索。

### 针对 MCP 服务器作者

如果您正在构建 MCP 服务器，启用工具搜索后，服务器指令字段变得更加有用。服务器指令帮助 CSC 理解何时搜索您的工具，类似于Skills的工作方式。

添加清晰、描述性的服务器指令，解释：

* 您的工具处理什么类别的任务
* CSC 何时应该搜索您的工具
* 您的服务器提供的关键功能

CSC 将工具描述和服务器指令截断为各 2KB。保持简洁以避免截断，并将关键细节放在开头。

### 配置工具搜索

工具搜索默认启用：MCP 工具被延迟并按需发现。当 `ANTHROPIC_BASE_URL` 指向非第一方主机时，工具搜索默认禁用，因为大多数代理不转发 `tool_reference` 块。如果您的代理支持，请显式设置 `ENABLE_TOOL_SEARCH`。此功能需要支持 `tool_reference` 块的模型：Sonnet 4 及更高版本，或 Opus 4 及更高版本。Haiku 模型不支持工具搜索。

使用 `ENABLE_TOOL_SEARCH` 环境变量控制工具搜索行为：

| 值      | 行为                                                                                                                       |
| :--------- | :----------------------------------------------------------------------------------------------------------------------------- |
| （未设置）    | 所有 MCP 工具延迟并按需加载。当 `ANTHROPIC_BASE_URL` 为非第一方主机时回退到预先加载 |
| `true`     | 所有 MCP 工具延迟，包括非第一方 `ANTHROPIC_BASE_URL`                                                     |
| `auto`     | 阈值模式：如果工具适合上下文窗口的 10% 以内则预先加载，否则延迟                            |
| `auto:<N>` | 具有自定义百分比的阈值模式，其中 `<N>` 为 0-100（例如 `auto:5` 表示 5%）                                          |
| `false`    | 所有 MCP 工具预先加载，不延迟                                                                                      |

```bash
# 使用自定义 5% 阈值
ENABLE_TOOL_SEARCH=auto:5 csc

# 完全禁用工具搜索
ENABLE_TOOL_SEARCH=false csc
```

或者在您的 settings.json `env` 字段中设置该值。

您还可以专门禁用 `ToolSearch` 工具：

```json
{
  "permissions": {
    "deny": ["ToolSearch"]
  }
}
```

## 将 MCP 提示用作命令

MCP 服务器可以暴露提示，这些提示在 CSC 中可用作命令。

### 执行 MCP 提示

#### 步骤 1：发现可用提示

输入 `/` 查看所有可用命令，包括来自 MCP 服务器的命令。MCP 提示以 `/mcp__servername__promptname` 格式显示。

#### 步骤 2：执行不带参数的提示

```text
/mcp__github__list_prs
```

#### 步骤 3：执行带参数的提示

许多提示接受参数。在命令后以空格分隔传递：

```text
/mcp__github__pr_review 456
```

```text
/mcp__jira__create_issue "登录流程中的 Bug" high
```

> **💡 提示：** 提示：
>
> * MCP 提示从已连接的服务器动态发现
> * 参数根据提示定义的参数进行解析
> * 提示结果直接注入到对话中
> * 服务器和提示名称被规范化（空格变为下划线）

## 托管 MCP 配置

对于需要集中控制 MCP 服务器的组织，CSC 支持两种配置选项：

1. **使用 `managed-mcp.json` 的独占控制**：部署一组固定的 MCP 服务器，用户无法修改或扩展
2. **使用允许列表/拒绝列表的基于策略的控制**：允许用户添加自己的服务器，但限制允许的服务器

这些选项允许 IT 管理员：

* **控制员工可以访问哪些 MCP 服务器**：在整个组织中部署标准化的已批准 MCP 服务器
* **防止未经授权的 MCP 服务器**：限制用户添加未批准的 MCP 服务器
* **完全禁用 MCP**：如果需要，完全移除 MCP 功能

### 选项 1：使用 managed-mcp.json 的独占控制

当您部署 `managed-mcp.json` 文件时，它对**所有 MCP 服务器拥有独占控制权**。用户无法添加、修改或使用此文件中定义的以外的任何 MCP 服务器。这是希望完全控制的组织最简单的方法。

系统管理员将配置文件部署到系统范围的目录：

* macOS：`/Library/Application Support/ClaudeCode/managed-mcp.json`
* Linux 和 WSL：`/etc/claude-code/managed-mcp.json`
* Windows：`C:\Program Files\ClaudeCode\managed-mcp.json`

> **注意：** 这些是系统范围的路径（而非用户主目录如 `~/Library/...`），需要管理员权限。它们设计为由 IT 管理员部署。

`managed-mcp.json` 文件使用与标准 `.mcp.json` 文件相同的格式：

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "company-internal": {
      "type": "stdio",
      "command": "/usr/local/bin/company-mcp-server",
      "args": ["--config", "/etc/company/mcp-config.json"],
      "env": {
        "COMPANY_API_URL": "https://internal.company.com"
      }
    }
  }
}
```

### 选项 2：使用允许列表和拒绝列表的基于策略的控制

管理员可以不采取独占控制，而是允许用户配置自己的 MCP 服务器，同时强制执行对允许哪些服务器的限制。此方法在托管设置文件中使用 `allowedMcpServers` 和 `deniedMcpServers`。

> **注意：** **在选项之间选择**：当您想部署一组固定的服务器且不允许用户自定义时，使用选项 1（`managed-mcp.json`）。当您想在策略约束下允许用户添加自己的服务器时，使用选项 2（允许列表/拒绝列表）。

#### 限制选项

允许列表或拒绝列表中的每个条目可以通过三种方式限制服务器：

1. **按服务器名称**（`serverName`）：匹配服务器的配置名称
2. **按命令**（`serverCommand`）：匹配用于启动 stdio 服务器的确切命令和参数
3. **按 URL 模式**（`serverUrl`）：匹配带有通配符支持的远程服务器 URL

**重要**：每个条目必须恰好包含 `serverName`、`serverCommand` 或 `serverUrl` 中的一个。

#### 示例配置

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverName": "sentry" },
    { "serverCommand": ["npx", "-y", "@modelcontextprotocol/server-filesystem"] },
    { "serverCommand": ["python", "/usr/local/bin/approved-server.py"] },
    { "serverUrl": "https://mcp.company.com/*" },
    { "serverUrl": "https://*.internal.corp/*" }
  ],
  "deniedMcpServers": [
    { "serverName": "dangerous-server" },
    { "serverCommand": ["npx", "-y", "unapproved-package"] },
    { "serverUrl": "https://*.untrusted.com/*" }
  ]
}
```

#### 基于命令的限制如何工作

**精确匹配**：

* 命令数组必须**完全匹配** - 包括命令和所有参数的正确顺序
* 示例：`["npx", "-y", "server"]` 不会匹配 `["npx", "server"]` 或 `["npx", "-y", "server", "--flag"]`

**Stdio 服务器行为**：

* 当允许列表包含**任何** `serverCommand` 条目时，stdio 服务器**必须**匹配其中一个命令
* 当存在命令限制时，stdio 服务器不能仅通过名称通过
* 这确保管理员可以强制执行允许运行哪些命令

**非 stdio 服务器行为**：

* 远程服务器（HTTP、SSE、WebSocket）在允许列表中存在 `serverUrl` 条目时使用基于 URL 的匹配
* 如果没有 URL 条目，远程服务器回退到基于名称的匹配
* 命令限制不适用于远程服务器

#### 基于 URL 的限制如何工作

URL 模式支持使用 `*` 通配符匹配任意字符序列。这对于允许整个域或子域很有用。

**通配符示例**：

* `https://mcp.company.com/*` - 允许特定域上的所有路径
* `https://*.example.com/*` - 允许 example.com 的任何子域
* `http://localhost:*/*` - 允许 localhost 上的任何端口

**远程服务器行为**：

* 当允许列表包含**任何** `serverUrl` 条目时，远程服务器**必须**匹配其中一个 URL 模式
* 当存在 URL 限制时，远程服务器不能仅通过名称通过
* 这确保管理员可以强制执行允许哪些远程端点

### 示例：仅 URL 允许列表

```json
{
  "allowedMcpServers": [
    { "serverUrl": "https://mcp.company.com/*" },
    { "serverUrl": "https://*.internal.corp/*" }
  ]
}
```

**结果**：

* `https://mcp.company.com/api` 处的 HTTP 服务器：✅ 允许（匹配 URL 模式）
* `https://api.internal.corp/mcp` 处的 HTTP 服务器：✅ 允许（匹配通配符子域）
* `https://external.com/mcp` 处的 HTTP 服务器：❌ 阻止（不匹配任何 URL 模式）
* 任何命令的 Stdio 服务器：❌ 阻止（没有名称或命令条目可匹配）

### 示例：仅命令允许列表

```json
{
  "allowedMcpServers": [
    { "serverCommand": ["npx", "-y", "approved-package"] }
  ]
}
```

**结果**：

* 使用 `["npx", "-y", "approved-package"]` 的 Stdio 服务器：✅ 允许（匹配命令）
* 使用 `["node", "server.js"]` 的 Stdio 服务器：❌ 阻止（不匹配命令）
* 名为 "my-api" 的 HTTP 服务器：❌ 阻止（没有名称条目可匹配）

### 示例：混合名称和命令允许列表

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverCommand": ["npx", "-y", "approved-package"] }
  ]
}
```

**结果**：

* 使用 `["npx", "-y", "approved-package"]` 且名为 "local-tool" 的 Stdio 服务器：✅ 允许（匹配命令）
* 使用 `["node", "server.js"]` 且名为 "local-tool" 的 Stdio 服务器：❌ 阻止（存在命令条目但不匹配）
* 使用 `["node", "server.js"]` 且名为 "github" 的 Stdio 服务器：❌ 阻止（当存在命令条目时，stdio 服务器必须匹配命令）
* 名为 "github" 的 HTTP 服务器：✅ 允许（匹配名称）
* 名为 "other-api" 的 HTTP 服务器：❌ 阻止（名称不匹配）

### 示例：仅名称允许列表

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverName": "internal-tool" }
  ]
}
```

**结果**：

* 使用任何命令且名为 "github" 的 Stdio 服务器：✅ 允许（没有命令限制）
* 使用任何命令且名为 "internal-tool" 的 Stdio 服务器：✅ 允许（没有命令限制）
* 名为 "github" 的 HTTP 服务器：✅ 允许（匹配名称）
* 名为 "other" 的任何服务器：❌ 阻止（名称不匹配）

#### 允许列表行为（`allowedMcpServers`）

* `undefined`（默认）：无限制 - 用户可以配置任何 MCP 服务器
* 空数组 `[]`：完全锁定 - 用户不能配置任何 MCP 服务器
* 条目列表：用户只能配置按名称、命令或 URL 模式匹配的服务器

#### 拒绝列表行为（`deniedMcpServers`）

* `undefined`（默认）：没有服务器被阻止
* 空数组 `[]`：没有服务器被阻止
* 条目列表：指定的服务器在所有作用域中被明确阻止

#### 重要说明

* **选项 1 和选项 2 可以组合使用**：如果 `managed-mcp.json` 存在，它拥有独占控制权，用户无法添加服务器。允许列表/拒绝列表仍适用于托管服务器本身。
* **拒绝列表具有绝对优先权**：如果服务器匹配拒绝列表条目（按名称、命令或 URL），即使它在允许列表中也会被阻止
* 基于名称、基于命令和基于 URL 的限制一起工作：如果服务器匹配**任一**名称条目、命令条目或 URL 模式，则通过（除非被拒绝列表阻止）

> **注意：** **使用 `managed-mcp.json` 时**：用户无法通过 `csc mcp add` 或配置文件添加 MCP 服务器。`allowedMcpServers` 和 `deniedMcpServers` 设置仍适用于筛选实际加载的托管服务器。
