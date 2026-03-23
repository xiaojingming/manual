---
sidebar_position: 4
---

# 安全扫描（Security Review）

> CoStrict Security 是一款自研的 AI 驱动安全扫描工具，帮助开发者快速发现代码中的安全漏洞和风险。

---

## 安装教程

详细下载安装步骤请访问：**[https://costrict.ai/download](https://costrict.ai/download)**

支持三种安装方式：
- **CLI 命令行工具**（版本要求：≥ 3.0.15）
- **VSCode 插件**（版本要求：≥ 2.4.7）
- **JetBrains 插件**（版本要求：≥ 2.4.7，支持 IDEA / PyCharm / WebStorm 等）

---

## 使用方式

### 步骤 1：进入交互窗口

在终端中输入以下命令启动 CoStrict：

```bash
cs
```

![CLI使用1-进入交互窗口](./img/security-review/CLI使用1-进入交互窗口.png)

### 步骤 2：选择扫描目标

进入安全扫描后，系统会询问您想要扫描的内容：

| 选项 | 说明 |
|------|------|
| Current directory | 扫描当前目录 |
| Specific file | 扫描指定文件 |
| Specific directory | 扫描指定目录 |

![CLI使用2-触发安全扫描](./img/security-review/CLI使用2-触发安全扫描.png)

### 步骤 3：查看扫描报告

扫描完成后，系统会生成详细的安全扫描报告，包括：

- **扫描摘要**：扫描的文件数量和发现的问题总数
- **问题列表**：每个安全问题的详细信息
  - 文件路径和行号
  - 严重级别
  - 问题描述
  - 修复建议

![CLI使用3-安全扫描报告](./img/security-review/CLI使用3-安全扫描报告.png)

---

## 私有化部署要求

### 模型配置

**对话模型**（CoStrict 对话、Code Review、Security Review 共用）

| 模型名称 | GPU 资源（推荐） |
|---------|----------------|
| GLM-4.7-FP8 或 GLM-4.7-Flash | 4 × H20 或 4 × RTX4090 |

### 后端服务器要求

**硬件要求**

| 配置项 | 最低要求 |
|--------|---------|
| CPU | Intel x64 架构，16 核 |
| 内存 | 32GB RAM |
| 存储 | 512GB 可用空间 |

**软件要求**

| 软件项 | 版本要求 |
|--------|---------|
| 操作系统 | CentOS 7+ 或 Ubuntu 18.04+ |
| Docker | 20.10+ |
| Docker Compose | 2.0+ |

### 部署文档

详细部署步骤请参考：**[部署检查清单](https://docs.costrict.ai/plugin/deployment/deploy-checklist/)**

---

## 获取帮助

- 官网：https://costrict.ai
- 下载页面：https://costrict.ai/download
- 问题反馈：support@costrict.ai
