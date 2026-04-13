---
sidebar_position: 1
---

# CSC 概述

> CSC 是一个智能编码工具，可以读取你的代码库、编辑文件、运行命令，并与你的开发工具集成。

CSC 是一个 AI 驱动的编程助手，帮助你构建功能、修复 Bug 和自动化开发任务。它能够理解你的整个代码库，可以跨多个文件和工具协同工作。

![image-20260413163936500](.\assets\csc.png)

## 快速开始

选择你的环境开始使用。

### 终端

功能完整的 CLI，可直接在终端中使用 CSC。编辑文件、运行命令，从命令行管理整个项目。

安装 CSC，请使用以下方法之一：

#### 原生安装（推荐）

**macOS、Linux、WSL：**

```bash
curl -fsSL https://costrict.ai/install.sh | bash
```

**Windows PowerShell：**

```powershell
irm https://costrict.ai/install.ps1 | iex
```

**Windows CMD：**

```batch
curl -fsSL https://costrict.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

如果你看到 `The token '&&' is not a valid statement separator`，说明你在 PowerShell 中而不是 CMD。请使用上面的 PowerShell 命令。在 PowerShell 中，提示符会显示 `PS C:\`。

**Windows 需要安装 Git for Windows。** 如果尚未安装，请先安装。

> **ℹ️ 信息：** 原生安装会在后台自动更新，保持你使用最新版本。



## 你可以做什么

以下是 CSC 的一些使用方式：

### 自动化你一直推迟的工作

CSC 处理那些消耗你时间的繁琐任务：为未测试的代码编写测试、修复项目中的 lint 错误、解决合并冲突、更新依赖项以及编写发布说明。

```bash
csc "write tests for the auth module, run them, and fix any failures"
```

### 构建功能和修复 Bug

用自然语言描述你想要什么。CSC 会规划方法、跨多个文件编写代码，并验证其正常工作。

对于 Bug，粘贴错误消息或描述症状。CSC 会在代码库中追踪问题、识别根本原因并实施修复。查看常见工作流了解更多示例。

### 创建提交和拉取请求

CSC 直接与 git 协作。它暂存更改、编写提交消息、创建分支并打开拉取请求。

```bash
csc "commit my changes with a descriptive message"
```

在 CI 中，你可以使用 GitHub Actions 或 GitLab CI/CD 自动化代码审查和问题分类。

### 使用 MCP 连接你的工具

模型上下文协议（MCP）是一个开放标准，用于将 AI 工具连接到外部数据源。

### 使用指令、skills和hooks进行自定义

`CLAUDE.md` 是你添加到项目根目录的 Markdown 文件，CSC 在每次会话开始时读取它。使用它来设置编码标准、架构决策、首选库和审查清单。CSC 还会在工作中构建自动记忆，跨会话保存构建命令和调试见解等学习内容，无需你手动编写。

创建自定义命令来打包可重复的工作流，供团队共享，如 `/review-pr` 或 `/deploy-staging`。

钩子让你在 CSC 操作前后运行 Shell 命令，比如在每次文件编辑后自动格式化或在提交前运行 lint。

### 运行代理团队和构建自定义代理

生成多个 CSC 代理，同时处理任务的不同部分。主导代理协调工作、分配子任务并合并结果。

对于完全自定义的工作流，Agent SDK 让你构建由 CSC 工具和能力驱动的自定义代理，完全控制编排、工具访问和权限。

### 管道、脚本和 CLI 自动化

CSC 是可组合的，遵循 Unix 哲学。将日志管道输入、在 CI 中运行或与其他工具链式组合：

```bash
# 分析最近的日志输出
tail -200 app.log | csc -p "Slack me if you see any anomalies"

# 在 CI 中自动化翻译
csc -p "translate new strings into French and raise a PR for review"

# 跨文件批量操作
git diff main --name-only | csc -p "review these changed files for security issues"
```

查看 CLI 参考了解完整的命令和标志集。


