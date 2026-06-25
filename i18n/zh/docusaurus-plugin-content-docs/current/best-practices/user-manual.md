---
sidebar_position: 4
---

# 案例实践4 - CoStrict 严肃编程模式

## 1.什么是strict模式？

Strict模式是结构化的成果物，用于将应用程序中复杂功能的开发流程规范化。它们提供了一种系统的方法，能把高层次的想法转化为详细的实施计划，且具备清晰的跟踪和可追溯性。

借助Strict模式，你可以：

- 深度分析项目并生成全面的项目文档

- 将需求分解为带有验收标准的用户故事

- 利用序列图和架构规划来生成设计文档

- 跟踪不同独立任务的实施进度

- 独立执行接口测试单元测试

- 自动生成并运行测试，确保代码可靠与稳定

## 2.快速入门

准备好创建你的第一个Strict模式项目吗？以下是入门方法：

项目wiki→需求澄清→设计约束→任务拆解→测试案例、分为五个阶段的工作流程。

### 2.1.开始前准备

安装好基本的项目基础环境，如：golang，python环境、数据库环境等

按照好git命令：做需求、设计、项目变更时依赖\
打开对应的工程

### 2.2.项目wiki

项目wiki旨在增强已有项目的设计和编码效果，非必选流程；

也可以作为初次了解该工程代码参考

#### 2.2.1.点击project wiki即可

![descript](./img/manual/image1.webp)

#### 2.2.2.wiki生成中

等待一段时候，即可在.cospec目录下生成项目wiki

![descript](./img/manual/image2.webp)

### 2.3.strict模式（不带测试案例情况）

需求澄清→设计约束→任务拆解，这3步流程只需要输入一句话需求即可，建议生成完成后进行修改

#### 2.3.1.选择strict模式

选择Strict模式这里可以看到除了strict的agent，还出现了requirement、task、test等众多agent，这些agent将帮助你生成需求、设计、任务、测试用例等辅助编程文档。

![descript](./img/manual/image3.webp)

#### 2.3.2.输入你的需求

只需要在strict模式下简单的输入你的需求，接下来多个agent将会对你的需求、wiki以及代码进行分析，生成合适的相关文档和测试用例

![descript](./img/manual/image4.webp)

#### 2.3.3.strict agent会自动拆解4个任务

注意：strict
agent会判断你的需求，如果你的需求很简单，如改一个小的样式，可能直接进入code模式完成任务。

![descript](./img/manual/image5.webp)

#### 2.3.4.strict agent会指挥各agent完成相应的任务

![descript](./img/manual/image6.webp)

#### 2.3.5.生成完成

.cospec\/\{功能名\} 目录下会生成对应需求、设计、 任务文档

![descript](./img/manual/image7.webp)

#### 2.3.6.需求与任务关联

![descript](./img/manual/image8.webp)

#### 2.3.7.代码编写

点击task.md上run即可开始编写当前任务。

![descript](./img/manual/image9.webp)

#### 2.3.8.代码编写中

![descript](./img/manual/image10.webp)

#### 2.3.9.任务完成

任务完成后会标识结束

如果遇到回话异常，导致非正常结束，可以手动标识\[x\]为结束或者重试\
run all task会执行所有任务，推荐单步运行，可控性更好。

![descript](./img/manual/image11.webp)

### 2.4.文档变更

为了保障变更得可控性，你需要按照需求→设计→任务的流程变更

#### 2.4.1.需求变更

##### 2.4.1.1需求修改

requirements.md可以直接进行编辑或在requirements agent下进行对话变更

![descript](./img/manual/image12.webp)

##### 2.4.1.2.同步变更到设计

点击文档任意update即可将变更后的需求同步到设计文档

这里我将FR-006删除，可以看到右边变更设计后发起FR-006删除任务

![descript](./img/manual/image13.webp)

同时，文档末尾将会自动插入文档变更记录

![descript](./img/manual/image14.webp)

#### 2.4.2.架构设计变更

##### 2.4.2.1.架构设计变更

design.md可以直接进行编辑或在架构师
agent下进行对话变更，这里你可以修改技术细节

![descript](./img/manual/image15.webp)

##### 2.4.2.2.同步变更到任务

点击文档任意update即可将变更后的设计同步到任务

变更后同步任务：任务会根据需求和设计重新生成任务。

![descript](./img/manual/image16.webp)

##### 2.4.2.3.变更结果

这里可以看到FR-006的任务已经删除

![descript](./img/manual/image17.webp)

#### 2.4.3.任务变更

##### 2.4.3.1.任务变更

task.md可以直接进行编辑或在任务
agent下进行对话变更，这里你可以修改任务执行细节

这里你可以编辑你的任务执行细节，使得执行变得更可控

或者删除一些不必要的任务

![descript](./img/manual/image18.webp)

#### 2.4.4.任务执行

变更后可以直接执行对应任务块

![descript](./img/manual/image19.webp)

### 2.5.测试用例及测试

#### 2.5.1.生成测试用例

点击首页即可为工程生成测试用例和方案

![descript](./img/manual/image20.webp)

#### 2.5.2.测试任务与任务关联

在strict模式下通过对话可以将测试用例关联到任务分布执行

如果.cospec一开始存在TEST_GUILDE.md文件，则在生成任务后，自动有一个用例生成阶段。

![descript](./img/manual/image21.webp)
