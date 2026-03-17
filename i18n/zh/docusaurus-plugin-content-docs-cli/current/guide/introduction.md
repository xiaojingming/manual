---
sidebar_position: 0
---

# CoStrict CLI 简介

CoStrict CLI（命令行工具）是一款基于终端的 AI 编程助手，让你无需离开命令行即可与大语言模型协作完成编码任务。

![img](img/feature/main.png)

---

## 核心能力

### 多种启动方式
- **TUI 交互界面**：`cs` 启动全功能终端 UI，支持多会话管理
- **非交互模式**：`cs run "你的指令"` 用于脚本和自动化
- **Web 界面**：`cs web` 在浏览器中使用

### 强大的工具集
CoStrict 内置文件读写、Shell 执行、代码搜索、网络请求等工具，并可通过 **自定义工具** 和 **MCP 服务器** 进行无限扩展。

### 灵活的配置体系
通过 `costrict.json` 配置文件管理模型选择、工具权限、主题、快捷键等，支持项目级和全局两套配置。

### 插件系统
使用 JS/TS 插件挂钩工具执行、会话事件、文件变更等各类事件，实现深度定制。

### IDE 集成
通过 ACP 协议与 Zed、JetBrains、Neovim 等编辑器深度集成，也可通过 VS Code 扩展使用。

---

## 快速上手

### 安装

**一键安装（推荐）**
```bash
# Linux / macOS
curl -fsSL https://costrict.ai/install.sh | bash

# Windows PowerShell
powershell iwr https://costrict.ai/install.bat -Out install.bat;.\install.bat
```

**NPM 安装**
```bash
npm install -g @costrict/cs
```

### 启动
```bash
cs
```

> **注意**: Windows Terminal 支持在 x86、x64 和 arm64 架构下编译，最低系统要求为 Windows 10 Build 18362 版本。

> 💡 更多安装选项（指定版本、权限问题解决等）详见 [安装流程](./installation)，完整功能说明见 [功能介绍](./feature)。
