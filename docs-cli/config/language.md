---
sidebar_position: 5
---
# Language Settings

## Conversation Language Settings

Configure in `~/.config/costrict/costrict.json` global configuration:

```json
{
  "promptLanguage": "en" // Options: zh-CN (Chinese), en (English)
}
```

### Usage Instructions

- **`zh-CN` (default)**: Communicate with AI in Chinese
- **`en`**: Communicate with AI in English

:::tip Important
When `promptLanguage` is set to `en`, your questions and commands **must also be in English**. This ensures that AI can better understand your intentions and provide more accurate responses.

For example:
- ✅ Correct: `How do I implement a binary search tree?`
- ❌ Incorrect: `如何实现二叉搜索树？`
:::

### Language Switching Effects

Switching the language setting affects the following features:

1. **Conversation Language**: AI response language will match the configuration
2. **System Prompts**: Internal system prompt language will be adjusted accordingly
3. **Error Messages**: Some error prompts will be displayed based on the setting
