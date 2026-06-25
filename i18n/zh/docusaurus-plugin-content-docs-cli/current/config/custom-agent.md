---
sidebar_position: 11
---

# 自定义agent

## 概述

CoStrict 中有两种类型的智能体：主智能体和子智能体。主智能体是您直接交互的主要助手。您可以使用`<Tab>`键进行切换。

子智能体是主智能体可以为特定任务调用的专门助手。你也可以在消息中通过**@提及**来手动调用它们。

## Agent文件放置位置

● 全局：`~/.config/costrict/agents/`

● 项目：`.costrict/agents/`

## 示例

你可以使用命令创建agent

```
cs agent create
```

或者手动创建文件。

项目根目录下，创建  .costrict/agents/review.md：

```
---
description: Reviews code for quality and best practices
mode: primary
---
 
You are in code review mode. Focus on:
 
- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations
 
Provide constructive feedback without making direct changes.
```

- 参数说明： mode选项可以设置为primary、subagent或all。如果未指定模式，则默认值为all。

**注意**：配置完agent后，建议重启cli，以加载agent。

## 测试

![img](img/custom-agent/png.webp)

## 其它配置

### 指定agent使用的模型、温度、禁用工具

```
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
---
 
You are in code review mode. Focus on:
 
- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations
 
Provide constructive feedback without making direct changes.
```

### 控制agent工具权限、subagent权限、skills权限

```
---
description: Code review without edits
mode: subagent
permission:
  edit: deny
  bash:
    "*": ask
    "git diff": allow
    "git log*": allow
    "grep *": allow
  webfetch: deny
  task: 
    "*": "deny"
    "orchestrator-*": "allow"
    "code-reviewer": "ask"
  skill:
    "documents-*": "allow"
---
 
Only analyze code and suggest changes.
```
