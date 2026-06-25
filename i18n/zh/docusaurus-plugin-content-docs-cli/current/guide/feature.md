---
sidebar_position: 3
---

# 基本功能入门

## 启动方式

### TUI 交互界面

```bash
cs
```

启动当前目录的终端交互界面（TUI）。也可以指定工作目录：

```bash
cs /path/to/project
```

![img](img/feature/main.webp)

### 非交互模式

直接传入提示词，适合脚本和自动化场景：

```bash
cs run --agent build --model costrict/GLM-4.7 "你好"
# 你好！有什么可以帮助你的吗？
```

### Web 界面

```bash
cs web                              # 默认 http://127.0.0.1:4096/
cs web --hostname 0.0.0.0 --port 8080  # 自定义 IP 和端口
```

![img](img/feature/png-17700885881302.webp)

### Docker 容器

```bash
docker pull zgsm/costrict-cli:latest
docker run -it zgsm/costrict-cli:latest
```

---

## 输入方式

### 文件引用

在消息中使用 `@` 引用文件，支持模糊搜索当前工作目录下的文件：

```
@packages/src/api/index.ts 这个文件的认证逻辑是怎么实现的？
```

文件内容会自动添加到对话上下文中。

### 执行 Shell 命令

以 `!` 开头的消息会作为 shell 命令执行，输出结果会添加到对话中：

```bash
!ls -la
!git log --oneline -10
```

---

## 会话管理

### 开始新会话

```bash
/new
```

快捷键：`ctrl+x n`

### 继续上次会话

```bash
cs --continue
```

或在 TUI 中输入 `/sessions`，从列表中选择要继续的会话。

快捷键：`ctrl+x l`

### 撤销 / 重做

`/undo` 撤销最后一条消息及所有文件更改，`/redo` 恢复被撤销的内容。

> 撤销/重做依赖 Git 管理文件变更，项目需要是一个 Git 仓库。

快捷键：`ctrl+x u` / `ctrl+x r`

### 压缩上下文

当上下文过长时，使用 `/compact` 压缩当前会话：

```bash
/compact
```

快捷键：`ctrl+x c`

---

## 模型管理

### 选择模型

```bash
/models
```

快捷键：`ctrl+x m`

### 切换模型变体

使用 `ctrl+t` 在同一模型的不同变体（如不同推理强度）之间切换。

### 配置默认模型

在 `costrict.json` 中设置：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
```

详见[模型与提供商文档](../config/models)。

---

## Agent 管理

### 切换 Agent

- **父 Agent**：在对话框中使用 `Tab` / `Shift+Tab` 键切换，默认内置 Build 和 StrictPlan Agent。
- **子 Agent**：使用 `@名字` 方式调用。

### 进入 / 退出子 Agent 对话

- **进入**：双击子 Agent 对话，进入子 Agent 内部。
- **退出**：按页面上方提示的快捷键；如果快捷键冲突，可点击左上角的 **Parent** 退出。

---

## 斜杠命令

在 TUI 中输入 `/` 后跟命令名称执行操作：

| 命令 | 说明 | 快捷键 |
| ---- | ---- | ------ |
| `/new` | 开始新会话（别名 `/clear`） | `ctrl+x n` |
| `/sessions` | 列出并切换会话（别名 `/resume`） | `ctrl+x l` |
| `/models` | 选择模型 | `ctrl+x m` |
| `/compact` | 压缩当前会话（别名 `/summarize`） | `ctrl+x c` |
| `/undo` | 撤销最后一条消息及文件更改 | `ctrl+x u` |
| `/redo` | 重做被撤销的内容 | `ctrl+x r` |
| `/connect` | 添加提供商 API Key | — |
| `/init` | 创建或更新 `AGENTS.md` 文件 | `ctrl+x i` |
| `/editor` | 用外部编辑器编写消息 | `ctrl+x e` |
| `/export` | 将对话导出为 Markdown | `ctrl+x x` |
| `/theme` | 选择界面主题 | `ctrl+x t` |
| `/thinking` | 切换思考过程的显示 | — |
| `/details` | 切换工具执行详情的显示 | — |
| `/help` | 显示帮助 | `ctrl+x h` |
| `/exit` | 退出（别名 `/quit`、`/q`） | `ctrl+x q` |

---

## 外部编辑器设置

`/editor` 和 `/export` 命令使用 `EDITOR` 环境变量指定的编辑器。

**Linux / macOS：**

```bash
export EDITOR="code --wait"   # VS Code
export EDITOR=vim
```

将其添加到 `~/.bashrc` 或 `~/.zshrc` 使其永久生效。

**Windows（PowerShell）：**

```powershell
$env:EDITOR = "code --wait"
```

常用编辑器：`code`（VS Code）、`cursor`、`windsurf`、`nvim`、`vim`、`nano`、`notepad`。

> GUI 编辑器（VS Code、Cursor 等）需要加 `--wait` 标志，使编辑器关闭后才返回。

---

## TUI 配置

通过 `costrict.json` 自定义 TUI 行为：

```json title="costrict.json"
{
  "$schema": "https://opencode.ai/config.json",
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": {
      "enabled": true
    },
    "diff_style": "auto"
  }
}
```

- `scroll_speed` — 滚动速度倍率（默认 `3`，最小 `1`）
- `scroll_acceleration.enabled` — 启用平滑滚动加速，启用后优先于 `scroll_speed`
- `diff_style` — 差异渲染方式：`"auto"` 根据终端宽度自适应，`"stacked"` 始终单列显示

---

更多命令行参数和环境变量配置，详见 [CLI 参考文档](./cli)。
