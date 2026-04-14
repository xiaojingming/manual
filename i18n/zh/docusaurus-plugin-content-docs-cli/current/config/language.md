---
sidebar_position: 5
---
# 语言设置

## 对话语言设置

在 `~/.config/costrict/costrict.json` 全局配置中配置：

```json
{
  "promptLanguage": "en" // zh-CN/en 不填默认为 zh-CN
}
```

### 使用说明

- **`zh-CN`（默认）**：使用中文与 AI 进行对话和交互
- **`en`**：使用英文与 AI 进行对话和交互

:::tip 重要提示
当配置 `promptLanguage` 为 `en` 时，您提交的问题和指令也**必须使用英文**。这样可以确保 AI 能够更好地理解您的意图，并提供更准确的回复。

例如：
- ✅ 正确：`How do I implement a binary search tree?`
- ❌ 错误：`如何实现二叉搜索树？`
:::

### 语言切换效果

切换语言设置后会影响以下功能：

1. **对话语言**：AI 的回复语言会与配置保持一致
2. **系统提示词**：内部系统提示词的语言会相应调整
3. **错误信息**：部分错误提示的语言会根据设置显示
