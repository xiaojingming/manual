---
sidebar_position: 6
---

# 输出样式

> 将 CSC 适配到软件工程之外的用途

输出样式改变的是 CSC 的回复方式，而非 CSC 所知道的内容。它们修改系统提示以设定角色、语气和输出格式，同时保留运行脚本、读写文件和跟踪 TODO 等核心能力。当你每轮对话都在重复要求相同的语气或格式时，或者当你希望 CSC 扮演软件工程师以外的角色时，请使用输出样式。

如需关于项目、约定或代码库的说明，请改用 CLAUDE.md。

## 内置输出样式

CSC 的**默认**输出样式是现有的系统提示，旨在帮助你高效完成软件工程任务。

还有两种额外的内置输出样式，专注于教你了解代码库和 CSC 的运作方式：

* **解释型**：在帮助你完成软件工程任务的同时提供教育性的"见解"。帮助你理解实现选择和代码库模式。

* **学习型**：协作式边做边学模式，CSC 不仅会在编码时分享"见解"，还会要求你自己贡献一些小的、战略性的代码片段。CSC 会在你的代码中添加 `TODO(human)` 标记，供你实现。

## 输出样式的工作原理

输出样式直接修改 CSC 的系统提示。

* 自定义输出样式会排除编码相关的指令（例如用测试验证代码），除非 `keep-coding-instructions` 为 true。
* 所有输出样式都会将各自的自定义指令添加到系统提示的末尾。
* 所有输出样式都会在对话过程中触发提醒，要求 CSC 遵守输出样式指令。

Token 使用量取决于样式。向系统提示添加指令会增加输入 token 数量，不过提示缓存会在会话中首次请求后降低此成本。内置的解释型和学习型样式按设计会产生比默认样式更长的回复，从而增加输出 token。对于自定义样式，输出 token 使用量取决于你的指令要求 CSC 生成什么内容。

## 更改输出样式

运行 `/config` 并选择**输出样式**，从菜单中选择一个样式。你的选择会保存到 `.claude/settings.local.json` 中的本地项目级别。

要在不使用菜单的情况下设置样式，请直接在设置文件中编辑 `outputStyle` 字段：

```json
{
  "outputStyle": "Explanatory"
}
```

由于输出样式在会话开始时设置到系统提示中，更改将在下次启动新会话时生效。这使得系统提示在整个对话过程中保持稳定，以便提示缓存可以降低延迟和成本。

## 创建自定义输出样式

自定义输出样式是带有 frontmatter 和将要添加到系统提示中的文本的 Markdown 文件：

```markdown
---
name: My Custom Style
description:
  A brief description of what this style does, to be displayed to the user
---

# Custom Style Instructions

You are an interactive CLI tool that helps users with software engineering
tasks. [Your custom instructions here...]

## Specific Behaviors

[Define how the assistant should behave in this style...]
```

你可以将这些文件保存在用户级别（`~/.claude/output-styles`）或项目级别（`.claude/output-styles`）。插件也可以在 `output-styles/` 目录中提供输出样式。

### Frontmatter

输出样式文件支持 frontmatter 来指定元数据：

| Frontmatter                | 用途                                                       | 默认值                 |
| :------------------------- | :-------------------------------------------------------- | :---------------------- |
| `name`                     | 输出样式的名称，如果不是文件名                               | 继承自文件名 |
| `description`              | 输出样式的描述，显示在 `/config` 选择器中                    | 无                    |
| `keep-coding-instructions` | 是否保留 CSC 系统提示中与编码相关的部分。                     | false                   |

## 与相关功能的比较

### 输出样式 vs. CLAUDE.md vs. --append-system-prompt

输出样式会完全"关闭" CSC 默认系统提示中专门针对软件工程的部分。CLAUDE.md 和 `--append-system-prompt` 都不会编辑 CSC 的默认系统提示。CLAUDE.md 将内容作为用户消息添加到 CSC 默认系统提示*之后*。`--append-system-prompt` 将内容追加到系统提示末尾。

### 输出样式 vs. 智能体

输出样式直接影响主智能体循环，且仅影响系统提示。智能体被调用以处理特定任务，可以包含额外的设置，如使用的模型、可用的工具，以及何时使用智能体的上下文。

### 输出样式 vs. 技能

输出样式修改 CSC 的回复方式（格式、语气、结构），一旦选择即始终生效。技能是特定任务的提示，你可以通过 `/skill-name` 调用，或由 CSC 在相关时自动加载。使用输出样式来保持一致的格式偏好；使用技能来处理可复用的工作流和任务。
