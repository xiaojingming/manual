---
sidebar_position: 16
---

# Custom Model Configuration

This guide explains how to configure OpenAI-compatible custom models in CoStrict CLI. When documentation is incomplete, proper configuration often requires some exploration.

---

## Obtain Base URL and API Key

### Base URL

Contact your administrator to obtain the base URL and API key. Note that the base URL may differ from the website address:

| Given URL | Actual Base URL |
| --------- | --------------- |
| `https://api.example.com` | `https://api.example.com/v1` |
| `https://company.com/oneapi` | `https://company.com/oneapi/v1` |

:::tip
Confirm the exact base URL with your administrator rather than assuming the website address is the API endpoint.
:::

### API Key

The API key is typically a string in the following format:

```
sk-1f2JOTQ1tzFYIU6VXoKCiT68EmhhYr3f67CtPIF3xHTQgNX6
```

---

## Verify Base URL and Retrieve Model List

This step serves two purposes: confirming the base URL is correct and obtaining the available model names.

### Execute Verification Script

Run the following PowerShell script to retrieve the model list:

```powershell
# 1. Set the API key (enclose in quotes)
$key = "sk-xxx"

# 2. Set the base URL (enclose in quotes)
$baseurl = "https://api.example.com/v1"

# 3. Build request headers
$headers = @{
    "x-api-key" = $key
    "Content-Type" = "application/json"
}

# 4. Send GET request and handle response
try {
    $response = Invoke-RestMethod -Uri "$baseurl/models" -Method GET -Headers $headers -ErrorAction Stop
    $response | ConvertTo-Json -Depth 100
}
catch {
    Write-Host "Request failed:" -ForegroundColor Red
    Write-Host "Status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Yellow
}
```

### Sample Response

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
- `supported_endpoint_types` indicates the compatible protocol type. Typically, configure using the OpenAI-compatible protocol.
- The `id` field (e.g., `claude-sonnet-4-6`) is critical and will be used in subsequent configuration.
:::

### Test Chat Completion

Verify chat functionality with a test request:

```powershell
Invoke-RestMethod -Uri "$baseurl/messages" -Method POST -Headers @{"Authorization"="Bearer $key";"Content-Type"="application/json"} -Body "{`"model`":`"gemini-3.1-pro-preview`",`"messages`":[{`"role`":`"user`",`"content`":`"Who are you?`"}]}"
```

---

## Locate Configuration File

The CoStrict CLI configuration file location varies by operating system:

| Platform | Path |
| -------- | ---- |
| Windows | `C:\Users\<username>\.config\costrict\costrict.json` |
| macOS/Linux | `~/.config/costrict/costrict.json` |

Create the file if it does not exist.

---

## Edit Configuration File

Add the custom provider configuration to `costrict.json`:

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

**Configuration Notes:**

- **Provider name** (`w-cmp-claude`): A custom identifier for the provider, used for selection during connection.
- **Model names**: Use the `id` values obtained from the model list endpoint.
- **baseURL**: The base URL confirmed in the verification step.

If the configuration file already contains other settings, merge the new provider configuration into the existing `provider` object.

---

## Connect in CoStrict CLI

1. Launch CoStrict CLI by running `cs`
2. Type `/connect` and select the provider name configured earlier (e.g., `w-cmp-claude`)
3. Enter your API key when prompted and press Enter
4. Select the desired model from the model selection interface (e.g., `claude-sonnet-4-6`) and press Enter

The custom model is now configured and ready for use.

---

## Related Documentation

- [Models & Providers](./models) — Overview of built-in providers and model configuration
- [Custom Provider](./provider) — Detailed custom provider configuration reference
