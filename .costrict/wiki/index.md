# costrict 项目技术文档索引

## 📚 文档导航

本索引为AI提供costrict项目的完整技术文档导航,支持快速信息定位和上下文理解。

### 📋 项目概述

**项目定位**: 基于Docusaurus 3.8.1构建的静态文档网站,提供Plugin和CLI两部分产品文档,支持中英文双语  
**技术栈**: React 19.0.0 + TypeScript 5.6.2 + Docusaurus 3.8.1 + Docker + Nginx  
**架构特点**: 双文档集隔离架构、客户端+服务端双重重定向、本地搜索优化、容器化部署

### 🏗️ 组织结构

```
manual/
├─ docs/                        # Plugin英文文档:产品功能/部署/计费
│  ├─ guide/                    # 使用指南:安装/快速入门
│  ├─ product-features/         # 产品功能:AI Agent/代码审查
│  ├─ deployment/               # 部署文档:Docker/Higress
│  ├─ billing/                  # 计费文档:购买/服务说明
│  └─ version-notes/            # 版本说明:更新日志
├─ docs-cli/                    # CLI英文文档:命令行工具
│  ├─ guide/                    # CLI指南:安装/功能/IDE集成
│  ├─ config/                   # CLI配置:快捷键/主题/模型
│  └─ product-characteristics/  # CLI特性:Notify/ACP/TDD
├─ i18n/zh/                     # 中文翻译:国际化内容
│  ├─ docusaurus-plugin-content-docs/        # Plugin中文文档
│  ├─ docusaurus-plugin-content-docs-cli/    # CLI中文文档
│  └─ code.json                              # UI文本翻译
├─ src/                         # 源码目录:React组件和样式
│  ├─ components/               # 自定义组件
│  │  └─ DownloadButton/        # Markdown下载按钮
│  └─ css/                      # 全局样式
├─ docusaurus.config.ts         # 核心配置:站点/插件/主题
├─ sidebars.ts                  # Plugin侧边栏配置
├─ sidebars-cli.ts              # CLI侧边栏配置
├─ Dockerfile                   # Docker多阶段构建
└─ nginx.conf                   # Nginx配置
```

### 🎯 核心文档导航

| 文档名称 | 文件路径 | 主要内容 | 适用场景 |
|---------|---------|---------|---------|
| **项目概述** | [.costrict/wiki/1-项目概述.md](.costrict/wiki/1-项目概述.md) | 系统架构、技术栈、核心特性分析 | 项目理解、技术选型 |
| **快速开始** | [.costrict/wiki/2-快速开始.md](.costrict/wiki/2-快速开始.md) | 环境搭建、开发服务器、构建命令 | 开发入门、环境配置 |
| **文档编写指南** | [.costrict/wiki/3-文档编写指南.md](.costrict/wiki/3-文档编写指南.md) | 目录结构、Frontmatter、侧边栏配置 | 文档编写、内容管理 |
| **架构设计** | [.costrict/wiki/4-架构设计.md](.costrict/wiki/4-架构设计.md) | 多文档集实现、路由重定向、搜索插件 | 架构理解、系统设计 |
| **核心配置详解** | [.costrict/wiki/5-核心配置详解.md](.costrict/wiki/5-核心配置详解.md) | docusaurus配置、侧边栏、主题定制 | 配置修改、功能扩展 |
| **国际化工作流** | [.costrict/wiki/6-国际化工作流.md](.costrict/wiki/6-国际化工作流.md) | i18n配置、翻译文件、同步维护流程 | 多语言支持、翻译管理 |
| **自定义组件开发** | [.costrict/wiki/7-自定义组件开发.md](.costrict/wiki/7-自定义组件开发.md) | DownloadButton组件实现、React开发规范 | 组件开发、功能扩展 |
| **部署方案** | [.costrict/wiki/8-部署方案.md](.costrict/wiki/8-部署方案.md) | Docker构建、Nginx配置、CI/CD流程 | 生产部署、运维管理 |
| **开发规范与最佳实践** | [.costrict/wiki/9-开发规范与最佳实践.md](.costrict/wiki/9-开发规范与最佳实践.md) | 文件命名、Git提交、代码质量、测试流程 | 代码规范、质量控制 |
