---
sidebar_position: 16
---

# 自定义模型配置

本指南介绍如何在 CoStrict CLI 中配置 OpenAI 兼容的自定义模型。当文档信息不完整时，正确的配置往往需要一定的探索。

---

## 获取 Base URL 和 API Key

### Base URL

联系管理员获取 base URL 和 API key。请注意，base URL 可能与网站地址不同：

| 给定的网址 | 实际 Base URL |
| --------- | --------------- |
| `https://api.example.com` | `https://api.example.com/v1` |
| `https://company.com/oneapi` | `https://company.com/oneapi/v1` |

:::tip
请向管理员确认确切的 base URL，而非假设网站地址即为 API 端点。
:::

### API Key

API key 通常为以下格式的字符串：

```
sk-1f2JOT21tzFYIU6VXoKCiT118EmhhYr3f67CtPqysxHTQgNX6
```

---

## 验证 Base URL 并获取模型列表

此步骤有两个目的：确认 base URL 正确性，以及获取可用的模型名称。

### 执行验证脚本

运行以下 PowerShell 脚本获取模型列表：

```powershell
# 1. 设置 API key（用引号包裹）
$key = "sk-xxx"

# 2. 设置 base URL（用引号包裹）
$baseurl = "https://api.example.com/v1"

# 3. 构建请求头
$headers = @{
    "x-api-key" = $key
    "Content-Type" = "application/json"
}

# 4. 发送 GET 请求并处理响应
try {
    $response = Invoke-RestMethod -Uri "$baseurl/models" -Method GET -Headers $headers -ErrorAction Stop
    $response | ConvertTo-Json -Depth 100
}
catch {
    Write-Host "请求失败：" -ForegroundColor Red
    Write-Host "状态码：$($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    Write-Host "错误详情：$($_.Exception.Message)" -ForegroundColor Yellow
}
```

### 示例响应

```json
{
  "id": "claude-sonnet-4-6",
  "object": "model",
  "created": 1626777600,
  "owned_by": "custom",
  "supported_endpoint_types": [
    "anthropic",
    "openai"
  ]
}
```

:::note
- `supported_endpoint_types` 表示兼容的协议类型，通常配置为 OpenAI 兼容协议。
- `id` 字段（如 `claude-sonnet-4-6`）非常重要，后续配置中会用到。
:::

### 测试对话功能

使用测试请求验证对话功能：

```powershell
Invoke-RestMethod -Uri "$baseurl/messages" -Method POST -Headers @{"Authorization"="Bearer $key";"Content-Type"="application/json"} -Body "{`"model`":`"gemini-3.1-pro-preview`",`"messages`":[{`"role`":`"user`",`"content`":`"你是谁？`"}]}"
```

---

## 定位配置文件

CoStrict CLI 配置文件位置因操作系统而异：

| 平台 | 路径 |
| ---- | ---- |
| Windows | `C:\Users\<用户名>\.config\costrict\costrict.json` |
| macOS/Linux | `~/.config/costrict/costrict.json` |

如文件不存在，请创建。

---

## 编辑配置文件

将自定义提供商配置添加到 `costrict.json`：

```json title="costrict.json"
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "w-cmp-claude": {
      "models": {
        "claude-sonnet-4-6": {},
        "claude-opus-4-6": {},
        "gpt-5.4-xhigh-openai-compact": {},
        "gpt-5.4-xhigh": {},
        "gemini-3.1-pro-preview": {}
      },
      "options": {
        "baseURL": "https://api.example.com/v1"
      }
    }
  }
}
```

**配置说明：**

- **提供商名称**（`w-cmp-claude`）：自定义的提供商标识符，用于连接时选择。
- **模型名称**：使用从模型列表端点获取的 `id` 值。
- **baseURL**：验证步骤中确认的 base URL。

如果配置文件已包含其他设置，将新的提供商配置合并到现有的 `provider` 对象中。

---

## 在 CoStrict CLI 中连接

1. 运行 `cs` 启动 CoStrict CLI
2. 输入 `/connect` 并选择之前配置的提供商名称（如 `w-cmp-claude`）
3. 在提示时输入 API key 并按回车
4. 从模型选择界面选择所需模型（如 `claude-sonnet-4-6`）并按回车

自定义模型现已配置完成，可以正常使用。

---

## 相关文档

- [模型与提供商](./models) — 内置提供商和模型配置概述
- [自定义提供商](./provider) — 详细的自定义提供商配置参考
