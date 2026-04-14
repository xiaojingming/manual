---
sidebar_position: 5
---

# 选择权限模式

> 控制 CSC 在编辑文件或运行命令前是否询问。在 CLI 中使用 Shift+Tab 切换模式。

当 CSC 想要编辑文件、运行 shell 命令或发起网络请求时，它会暂停并请求你批准该操作。权限模式控制该暂停发生的频率。你选择的模式决定了会话的流程：默认模式让你逐一审查每个操作，而更宽松的模式让 CSC 在更长的不间断时段内工作并在完成后汇报。对于敏感工作选择更多监督，当你信任方向时选择更少中断。

## 可用模式

每种模式在便利性和监督之间做出不同的权衡。下表显示了每种模式下 CSC 无需权限提示即可执行的操作。

| 模式 | 无需询问即可运行的操作 | 适用场景 |
| :--- | :--- | :--- |
| `default` | 仅读取 | 入门使用、敏感工作 |
| `acceptEdits` | 读取、文件编辑和常见文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等） | 迭代你正在审查的代码 |
| `plan` | 仅读取 | 在修改前探索代码库 |
| `auto` | 所有操作，带有后台安全检查 | 长时间任务、减少提示疲劳 |
| `dontAsk` | 仅预批准的工具 | 锁定的 CI 和脚本 |
| `bypassPermissions` | 除受保护路径外的所有操作 | 仅限隔离容器和虚拟机 |

无论何种模式，对受保护路径的写入操作永远不会被自动批准，以保护仓库状态和 CSC 自身配置免受意外损坏。

模式设定了基线。在其之上叠加权限规则，可以在除 `bypassPermissions` 之外的任何模式中预批准或阻止特定工具，`bypassPermissions` 会完全跳过权限层。

## 切换权限模式

你可以在会话中、启动时或作为持久默认值切换模式。模式通过这些控件设置，而不是通过在聊天中询问 CSC。选择你的界面以查看如何更改。

### CLI

**会话期间**：按 `Shift+Tab` 循环切换 `default` → `acceptEdits` → `plan`。当前模式显示在状态栏中。并非每个模式都在默认循环中：

* `auto`：在你使用 `--enable-auto-mode` 或设置中的持久等效项选择加入后出现
* `bypassPermissions`：在你使用 `--permission-mode bypassPermissions`、`--dangerously-skip-permissions` 或 `--allow-dangerously-skip-permissions` 启动后出现；`--allow-` 变体将模式添加到循环中而不激活它
* `dontAsk`：永远不会出现在循环中；使用 `--permission-mode dontAsk` 设置

启用的可选模式在 `plan` 之后插入，`bypassPermissions` 在前，`auto` 在后。如果你同时启用了两者，你将在前往 `auto` 的途中循环经过 `bypassPermissions`。

**启动时**：将模式作为标志传入。

```bash
csc --permission-mode plan
```

**作为默认值**：在设置中设置 `defaultMode`。

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

同样的 `--permission-mode` 标志可与 `-p` 一起用于非交互式运行。



## 使用 acceptEdits 模式自动批准文件编辑

`acceptEdits` 模式让 CSC 无需提示即可在工作目录中创建和编辑文件。当此模式激活时，状态栏显示 `⏵⏵ accept edits on`。

除了文件编辑，`acceptEdits` 模式还自动批准常见的文件系统 Bash 命令：`mkdir`、`touch`、`rm`、`rmdir`、`mv`、`cp` 和 `sed`。当这些命令带有安全环境变量前缀（如 `LANG=C` 或 `NO_COLOR=1`）或进程包装器（如 `timeout`、`nice` 或 `nohup`）时，也会被自动批准。与文件编辑一样，自动批准仅适用于工作目录或 `additionalDirectories` 内的路径。该范围之外的路径、对受保护路径的写入以及所有其他 Bash 命令仍会提示。

当你想在事后通过编辑器或 `git diff` 审查更改而不是逐一批准每个编辑时，请使用 `acceptEdits`。从默认模式按一次 `Shift+Tab` 进入，或直接以此模式启动：

```bash
csc --permission-mode acceptEdits
```

## 使用计划模式在编辑前分析

计划模式告诉 CSC 在不进行修改的情况下研究和提议更改。CSC 读取文件、运行 shell 命令进行探索并编写计划，但不会编辑你的源代码。权限提示与默认模式相同。

通过按 `Shift+Tab` 或在单个提示前加 `/plan` 前缀进入计划模式。你也可以从 CLI 以计划模式启动：

```bash
csc --permission-mode plan
```

再次按 `Shift+Tab` 可在不批准计划的情况下离开计划模式。

当计划准备好时，CSC 会呈现它并询问如何继续。在该提示中你可以：

* 批准并以自动模式开始
* 批准并接受编辑
* 批准并手动审查每个编辑
* 根据反馈继续规划
* 使用 Ultraplan 进行基于浏览器的审查

每个批准选项还提供先清除规划上下文的选项。

### 分类器默认阻止的内容

分类器信任你的工作目录和仓库配置的远程地址。其他一切都被视为外部资源，直到你配置受信任的基础设施。

**默认阻止**：

* 下载并执行代码，如 `curl | bash`
* 向外部端点发送敏感数据
* 生产部署和迁移
* 云存储上的批量删除
* 授予 IAM 或仓库权限
* 修改共享基础设施
* 不可逆地销毁会话之前已存在的文件
* 强制推送，或直接推送到 `main`

**默认允许**：

* 工作目录中的本地文件操作
* 安装锁文件或清单中声明的依赖
* 读取 `.env` 并将凭据发送到匹配的 API
* 只读 HTTP 请求
* 推送到你启动时所在的分支或 CSC 创建的分支
* 沙盒网络访问请求

运行 `csc auto-mode defaults` 查看完整的规则列表。如果常规操作被阻止，管理员可以通过 `autoMode.environment` 设置添加受信任的仓库、存储桶和服务。

### 自动模式何时回退

每个被拒绝的操作会显示通知并出现在 `/permissions` 的"最近拒绝"标签下，你可以在那里按 `r` 手动批准后重试。

如果分类器连续阻止操作 3 次或总共阻止 20 次，自动模式暂停，CSC 恢复提示。批准提示的操作后恢复自动模式。这些阈值不可配置。任何允许的操作会重置连续计数器，而总计数器在会话期间持续存在，仅在其自身限制触发回退时重置。

在使用 `-p` 标志的非交互模式下，重复阻止会中止会话，因为没有用户可以提示。

重复阻止通常意味着分类器缺少关于你基础设施的上下文。使用 `/feedback` 报告误报，或让管理员配置受信任的基础设施。

### 分类器如何评估操作

每个操作经过固定的决策顺序。第一个匹配的步骤胜出：

1. 匹配你的允许或拒绝规则的操作立即解决
2. 工作目录中的只读操作和文件编辑被自动批准，对受保护路径的写入除外
3. 其他一切交给分类器
4. 如果分类器阻止，CSC 收到原因并尝试替代方案

进入自动模式时，授予任意代码执行的广泛允许规则会被丢弃：

* 全局 `Bash(*)`
* 通配符解释器如 `Bash(python*)`
* 包管理器运行命令
* `Agent` 允许规则

窄范围规则如 `Bash(npm test)` 会保留。丢弃的规则在你离开自动模式时恢复。

分类器可以看到用户消息、工具调用和你的 CLAUDE.md 内容。工具结果被剥离，因此文件或网页中的恶意内容无法直接操纵它。一个单独的服务器端探针在 CSC 读取之前扫描传入的工具结果并标记可疑内容。

### 自动模式如何处理子代理

分类器在三个点检查子代理的工作：

1. 子代理启动前，委派的任务描述会被评估，因此看起来危险的任务在生成时就被阻止
2. 子代理运行时，其每个操作都通过与父会话相同规则经过分类器，子代理 frontmatter 中的任何 `permissionMode` 都被忽略
3. 子代理完成时，分类器审查其完整操作历史；如果该返回检查标记了问题，安全警告会附加到子代理结果之前

### 成本和延迟

分类器当前在 Claude Sonnet 4.6 上运行，无论你的主会话模型是什么。分类器调用计入你的 token 使用量。每次检查发送部分对话记录加上待执行的操作，在执行前增加一个往返。受保护路径之外的读取和工作目录编辑跳过分类器，因此开销主要来自 shell 命令和网络操作。

## 使用 dontAsk 模式仅允许预批准的工具

`dontAsk` 模式自动拒绝每个未明确允许的工具。只有匹配你的 `permissions.allow` 规则的操作才能执行；显式的 `ask` 规则也会被拒绝而不是提示。这使得该模式对于 CI 管道或受限环境完全非交互，你可以在其中预先定义 CSC 可以执行的操作。

启动时使用标志设置：

```bash
csc --permission-mode dontAsk
```

## 使用 bypassPermissions 模式跳过所有检查

`bypassPermissions` 模式禁用权限提示和安全检查，使工具调用立即执行。对受保护路径的写入是唯一仍会提示的操作。仅在隔离环境（如没有互联网访问的容器、VM 或 devcontainer）中使用此模式，CSC 无法损害你的主机系统。

你无法从没有启用标志之一启动的会话中进入 `bypassPermissions`；使用标志重新启动以启用它：

```bash
csc --permission-mode bypassPermissions
```

`--dangerously-skip-permissions` 标志是等效的。

> **⚠️ 警告：** `bypassPermissions` 不提供针对提示注入或意外操作的保护。对于无需提示的后台安全检查，请改用自动模式。管理员可以通过在托管设置中将 `permissions.disableBypassPermissionsMode` 设置为 `"disable"` 来阻止此模式。

## 受保护路径

对一小部分路径的写入操作在每种模式下都不会被自动批准。这防止了仓库状态和 CSC 自身配置的意外损坏。在 `default`、`acceptEdits`、`plan` 和 `bypassPermissions` 中，这些写入会提示；在 `auto` 中，它们路由到分类器；在 `dontAsk` 中，它们被拒绝。

受保护目录：

* `.git`
* `.vscode`
* `.idea`
* `.husky`
* `.claude`，除了 `.claude/commands`、`.claude/agents`、`.claude/skills` 和 `.claude/worktrees`（CSC 常规创建内容的位置）

受保护文件：

* `.gitconfig`、`.gitmodules`
* `.bashrc`、`.bash_profile`、`.zshrc`、`.zprofile`、`.profile`
* `.ripgreprc`
* `.mcp.json`、`.claude.json`

