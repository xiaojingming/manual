---
sidebar_position: 2
---

# 快速开始

> 欢迎使用 CSC！

本快速开始指南将让你在几分钟内使用 AI 驱动的编程助手。完成后，你将了解如何使用 CSC 完成常见的开发任务。

## 开始之前

请确保你已具备：

* 一个已打开的终端或命令提示符
* 一个代码项目
* CoStrict账户

## 第 1 步：安装 CSC

安装 CSC，请使用以下方法之一：

### 原生安装（推荐）

**macOS、Linux、WSL：**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell：**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD：**

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

如果你看到 `The token '&&' is not a valid statement separator`，说明你在 PowerShell 中而不是 CMD。请使用上面的 PowerShell 命令。在 PowerShell 中，提示符会显示 `PS C:\`。

**Windows 需要安装 Git for Windows。** 如果尚未安装，请先安装。

> **ℹ️ 信息：** 原生安装会在后台自动更新，保持你使用最新版本。

## 第 2 步：登录你的账户

CSC 需要账户才能使用。当你使用 `csc` 命令启动交互式会话时，你需要登录：

```bash
csc
# 首次使用时会提示你登录
```

```bash
/login
# 按照提示使用你的账户登录
```

你可以使用以下任一账户类型登录：

* Costrict（推荐）
* 自定义provider

![image-20260413170545028](.\assets\login.png)

登录后，你的凭据将被保存，无需再次登录。之后要切换账户，请使用 `/login` 命令。

## 第 3 步：启动你的第一个会话

在任何项目目录中打开终端并启动 CSC：

```bash
cd /path/to/your/project
csc
```

你将看到 CSC 欢迎界面，包含你的会话信息、最近的对话和最新更新。输入 `/help` 查看可用命令，或输入 `/resume` 继续之前的对话。

> **💡 提示：** 登录后（第 2 步），你的凭据会保存在系统中。了解更多请查看凭据管理。

## 第 4 步：提出你的第一个问题

让我们从了解你的代码库开始。尝试以下命令之一：

```text
what does this project do?
```

CSC 会分析你的文件并提供摘要。你也可以提出更具体的问题：

```text
what technologies does this project use?
```

```text
where is the main entry point?
```

```text
explain the folder structure
```

你还可以询问 CSC 自身的能力：

```text
what can CSC do?
```

```text
how do I create custom skills in CSC?
```

```text
can CSC work with Docker?
```

> **注意：** CSC 会根据需要读取你的项目文件。你无需手动添加上下文。

## 第 5 步：进行你的第一次代码修改

现在让 CSC 进行一些实际的编码工作。尝试一个简单的任务：

```text
add a hello world function to the main file
```

CSC 将会：

1. 找到合适的文件
2. 展示建议的更改
3. 请求你的批准
4. 执行编辑

> **注意：** CSC 在修改文件前总是会请求许可。你可以批准单个更改，或为会话启用"全部接受"模式。

## 第 6 步：使用 Git 与 CSC

CSC 让 Git 操作变得对话化：

```text
what files have I changed?
```

```text
commit my changes with a descriptive message
```

你还可以提示更复杂的 Git 操作：

```text
create a new branch called feature/quickstart
```

```text
show me the last 5 commits
```

```text
help me resolve merge conflicts
```

## 第 7 步：修复 Bug 或添加功能

CSC 擅长调试和功能实现。

用自然语言描述你想要什么：

```text
add input validation to the user registration form
```

或修复现有问题：

```text
there's a bug where users can submit empty forms - fix it
```

CSC 将会：

* 定位相关代码
* 理解上下文
* 实现解决方案
* 如果有测试则运行测试

## 第 8 步：尝试其他常见工作流

有多种方式可以与 CSC 协作：

**重构代码**

```text
refactor the authentication module to use async/await instead of callbacks
```

**编写测试**

```text
write unit tests for the calculator functions
```

**更新文档**

```text
update the README with installation instructions
```

**代码审查**

```text
review my changes and suggest improvements
```

> **💡 提示：** 像与一位乐于助人的同事交流一样与 CSC 对话。描述你想要实现的目标，它会帮助你达成。

## 常用命令

以下是日常使用中最重要的命令：

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| `csc` | 启动交互模式 | `csc` |
| `csc "task"` | 运行一次性任务 | `csc "fix the build error"` |
| `csc -p "query"` | 运行一次性查询后退出 | `csc -p "explain this function"` |
| `csc -c` | 在当前目录继续最近的对话 | `csc -c` |
| `csc -r` | 恢复之前的对话 | `csc -r` |
| `/clear` | 清除对话历史 | `/clear` |
| `/help` | 显示可用命令 | `/help` |
| `exit` 或 Ctrl+D | 退出 CSC | `exit` |

查看 CLI 参考获取完整的命令列表。

## 新手专业技巧

更多内容请查看最佳实践和常见工作流。

### 请求要具体

不要说："fix the bug"

试试："fix the login bug where users see a blank screen after entering wrong credentials"

### 使用分步指令

将复杂任务分解为步骤：

```text
1. create a new database table for user profiles
2. create an API endpoint to get and update user profiles
3. build a webpage that allows users to see and edit their information
```

### 让 CSC 先探索

在进行更改之前，让 CSC 先了解你的代码：

```text
analyze the database schema
```

```text
build a dashboard showing products that are most frequently returned by our UK customers
```

### 使用快捷方式节省时间

* 按 `?` 查看所有可用的键盘快捷键
* 使用 Tab 进行命令补全
* 按 ↑ 查看命令历史
* 输入 `/` 查看所有命令和技能

## 接下来做什么？

现在你已经学会了基础知识，可以探索更多高级功能：

* **CSC 的工作原理**：了解智能循环、内置工具以及 CSC 如何与你的项目交互
* **最佳实践**：通过有效的提示和项目设置获得更好的结果
* **常见工作流**：常见任务的分步指南
* **扩展 CSC**：使用 CLAUDE.md、技能、钩子、MCP 等进行自定义
