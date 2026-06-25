---
sidebar_position: 6
---

# MCP 服务器

## 配置位置

● 全局配置：~/.config/costrict/costrict.json

● 项目配置：项目根目录下 .costrict/costrict.json

## 配置示例

下面配置了两个mcp，一个远程，一个本地。

```
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}"
      }
    },
	"mcp_everything": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
    }
  }
}
 
```

配置说明：

● 本地

| **选项**        | **类型** | **必填** | **描述**                                                     |
| --------------- | -------- | -------- | ------------------------------------------------------------ |
| **type**        | 字符串   | Y        | MCP服务器连接类型，必须为**"local"**。                       |
| **command**     | 数组     | Y        | 运行MCP服务器的命令和参数。                                  |
| **environment** | 对象     |          | 运行服务器时要设置的环境变量。                               |
| **enabled**     | 布尔值   |          | 启动时启用或禁用MCP服务器。                                  |
| **timeout**     | 数值     |          | 从MCP服务器获取工具的超时时间（毫秒）。默认值为5000（5秒）。 |

● 远程

| **选项**    | **类型** | **必填** | **描述**                                                     |
| ----------- | -------- | -------- | ------------------------------------------------------------ |
| **type**    | 字符串   | Y        | MCP服务器连接类型，必须为**"remote"**。                      |
| **url**     | 字符串   | Y        | 远程MCP服务器的URL。                                         |
| **enabled** | 布尔值   |          | 启动时启用或禁用MCP服务器。                                  |
| **headers** | 对象     |          | 随请求发送的标头。                                           |
| **oauth**   | 对象     |          | OAuth 身份验证配置。                                         |
| **timeout** | 数值     |          | 从MCP服务器获取工具的超时时间（毫秒）。默认值为5000（5秒）。 |

oauth配置：

| **选项**         | **类型**   | **描述**                                             |
| ---------------- | ---------- | ---------------------------------------------------- |
| **oauth**        | 对象 \| 否 | OAuth 配置对象，或 **false** 以禁用 OAuth 自动检测。 |
| **clientId**     | 字符串     | OAuth客户端ID。如果未提供，将尝试动态客户端注册。    |
| **clientSecret** | 字符串     | 如果授权服务器要求，则需提供OAuth客户端密钥。        |
| **scope**        | 字符串     | 授权期间请求的OAuth权限范围。                        |

## 测试

执行： `cs  mcp list `

![img](img/mcp/png.webp)

![img](img/mcp/png-17700898121932.webp)
