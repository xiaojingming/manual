---
sidebar_position: 4
---

# Skills

Skills 通过自定义命令和工作流扩展 CoStrict CLI 的能力。

## 概述

Skills 是可重用的命令模板，封装了常见的工作流和最佳实践。

## Skill文件放置位置

每个技能名称创建一个文件夹，并在其中放入一个SKILL.md。CoStrict会搜索这些位置：

​                ● 项目配置：`.costrict/{skill|skills}/<name>/SKILL.md`

​                ● 全局配置：`~/.config/costrict/skill/<name>/SKILL.md`

​                ● 项目Claude兼容：`.claude/skills/<name>/SKILL.md`

​                ● 全局Claude兼容：`~/.claude/skills/<name>/SKILL.md`

## 编写示例

在项目根目录下，创建 `.costrict/skill/git-release/SKILL.md` 如下：

```
---
name: git-release
description: Create consistent releases and changelogs
---
 
## What I do
 
- Draft release notes from merged PRs
- Propose a version bump
- Provide a copy-pasteable `gh release create` command
 
## When to use me
 
Use this when you are preparing a tagged release.
Ask clarifying questions if the target versioning scheme is unclear.
```

**注意：**

- 编写完成后，重启 cli程序以加载Skills。

- name 必须：

​                ● 长度为1–64个字符
​                ● 由小写字母数字组成，使用单个连字符分隔
​                ● 不能以-开头或结尾
​                ● 不得包含连续的--
​                ● 匹配包含SKILL.md的目录名称

等效正则表达式：

```
^[a-z0-9]+(-[a-z0-9]+)*$
```

description必须为1-1024个字符。请确保其足够具体，以便智能体能够正确选择。

## 测试

![img](img/skills/png.webp)
