---
sidebar_position: 3
---
# TDD测试驱动开发

## 启动 TDD 模式

回到 **Build** 模式（按 Tab 键切换）执行 **/test** 命令（或配合输入待测需求 */test 测试一下 tdd agent 的功能*）开始执行自测试自闭环

![img](img/tdd/png.webp)

前序编码流程结束后，AI会具体情况推荐是否立即测试，选择后可以启动测试效果同/test

![img](img/tdd/png-17700915168521.webp)

##  /test 命令自动化流程说明

![img](img/tdd/png-17700915168522.webp)

1）可运行性验证。将自动拉起 RunAndFix agent 用于可运行性验证，保障当前项目没有基本运行问题。当前主要验证**编译类问题**，会执行编译命令并修复**编码类缺陷**直至编译通过。

2）测试需求确认。将从 plan 模式提案、历史上下文、当前变更文件、近期提交历史内，按优先级获取待测需求，并进行用户确认：

![img](img/tdd/png-17700915168523.webp)

​	选择或自定义输入待测需求即可。

3）执行 TestDesign agent 用于测试设计，将根据待测功能进行测试点设计，优先完成集成测试、对遗漏点再进行单元测试，在 .cospec/test-plans/ 下生成当前任务的测试点文档。最后生成测试用例文件。

4）执行 TestAndFix agent 用于测试并修复流程，根据测试点与测试用例，执行测试并完成编码问题修复。

## TestPrepare Agent 的测试指导自动生成

在测试执行过程中，将涉及到与当前项目有关的操作，包括编译命令、测试命令、用例设计规范等。

各 agent 将优先阅读项目中的**测试指导文档（TEST_GUIDE.md）**，若存在则作为唯一测试方案遵循，否则将**自动启用** TestPrepare agent 用于自动化生成测试指导方案。

TestPrepare agent 的检索应用优先级为：

1）用户配置的扩展命令与 skill 能力，若能辅助测试将自动识别

2）AGENTS.md、CONTRIBUTING.md、DEVELOPMENT.md 等文档

3）package.json、makefile 等配置文件

4）scripts/ 等脚本存放目录

5）根据当前项目的编程语言与框架自动决策生成

检索完成后将包含测试指导核心三部分内容供用户确认（也均支持手动调整）：

1）可运行性验证方式（例如使用 go build、npm run build 等命令）

2）测试用例组织方式（使用 xxx.test.go 等组织、存放对应 tests/ 目录等知识）

3）测试执行方式（使用 npm run test、bun test tests/play.test.ts 等知识）

![img](img/tdd/png-17700915168524.webp)

确认后结果将保存于 `<project>.cospec/TEST_GUIDE.md` 内供后续复用。

## TEST_GUIDE.md 测试指导文件说明

测试相关 agent 均会默认加载 TEST_GUIDE.md 测试指导文档内容，加载路径如下（有多份将合并）：

- `<project>.cospec/TEST_GUIDE.md`

- `<project>TEST_GUIDE.md`

也允许手动编写该文档来定制化测试方案，可用于补充额外的测试知识点来辅助测试流程。

**注意事项：**

该版本有lsp功能（参考 4.4.9 章节），建议安装好对应的环境效果更好，更快收敛。

![img](img/tdd/png-17700915168535.webp)

 
