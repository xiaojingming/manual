---
sidebar_position: 10
---
# 其它配置

## 工具权限

每条权限规则都归结为以下情况之一：

- "allow" — 无需批准即可运行

- "ask" — 请求批准

- "deny" — 阻止该操作

在 ~/.config/costrict/costrict.json 全局配置 或 项目根目录 costrict.json 中配置：

- 使用 * 匹配所有工具，并覆盖特定工具的权限

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "*": "ask",
    "bash": "allow",
    "edit": "deny"
  }
}
```

- 一次性设置所有权限

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": "allow"
}
```

- 细粒度规则

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm *": "allow",
      "rm *": "deny",
      "grep *": "allow"
    },
    "edit": {
      "*": "deny",
      "packages/web/src/content/docs/*.mdx": "allow"
    }
  }
}
```

权限模式使用简单的通配符匹配：

​                ● * 匹配零个或多个任意字符

​                ● ? 精确匹配一个字符

​                ● 所有其他字符均按字面意思匹配

- 外部目录：

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "external_directory": {
      "~/projects/personal/**": "allow"
    },
    "edit": {
      "~/projects/personal/**": "deny"
    }
  }
}
```





（5）Agent权限

您可以为每个Agent重写权限。智能体权限会与全局配置合并，且智能体规则优先。

.costrict/agents/review.md :

```
---
description: Code review without edits
mode: subagent
permission:
  edit: deny
  bash: ask
  webfetch: deny
---
 
Only analyze code and suggest changes.
```

## 环境变量

- COSTRICT_BASE_URL:  costrict服务端地址，私有化部署后端，配置使用；
- COSTRICT_EXPERIMENTAL_LSP_TOOL：启用实验性LSP工具；



