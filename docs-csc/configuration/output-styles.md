---
sidebar_position: 6
---

# Output styles

> Adapt CSC for uses beyond software engineering

Output styles change how CSC responds, not what CSC knows. They modify the system prompt to set role, tone, and output format while keeping core capabilities like running scripts, reading and writing files, and tracking TODOs. Use one when you keep re-prompting for the same voice or format every turn, or when you want CSC to act as something other than a software engineer.

For instructions about your project, conventions, or codebase, use CLAUDE.md instead.

## Built-in output styles

CSC's **Default** output style is the existing system prompt, designed to help you complete software engineering tasks efficiently.

There are two additional built-in output styles focused on teaching you the codebase and how CSC operates:

* **Explanatory**: Provides educational "Insights" in between helping you complete software engineering tasks. Helps you understand implementation choices and codebase patterns.

* **Learning**: Collaborative, learn-by-doing mode where CSC will not only share "Insights" while coding, but also ask you to contribute small, strategic pieces of code yourself. CSC will add `TODO(human)` markers in your code for you to implement.

## How output styles work

Output styles directly modify CSC's system prompt.

* Custom output styles exclude instructions for coding (such as verifying code with tests), unless `keep-coding-instructions` is true.
* All output styles have their own custom instructions added to the end of the system prompt.
* All output styles trigger reminders for CSC to adhere to the output style instructions during the conversation.

Token usage depends on the style. Adding instructions to the system prompt increases input tokens, though prompt caching reduces this cost after the first request in a session. The built-in Explanatory and Learning styles produce longer responses than Default by design, which increases output tokens. For custom styles, output token usage depends on what your instructions tell CSC to produce.

## Change your output style

Run `/config` and select **Output style** to pick a style from a menu. Your selection is saved to `.claude/settings.local.json` at the local project level.

To set a style without the menu, edit the `outputStyle` field directly in a settings file:

```json
{
  "outputStyle": "Explanatory"
}
```

Because the output style is set in the system prompt at session start, changes take effect the next time you start a new session. This keeps the system prompt stable throughout a conversation so prompt caching can reduce latency and cost.

## Create a custom output style

Custom output styles are Markdown files with frontmatter and the text that will be added to the system prompt:

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

You can save these files at the user level (`~/.claude/output-styles`) or project level (`.claude/output-styles`). Plugins can also ship output styles in an `output-styles/` directory.

### Frontmatter

Output style files support frontmatter for specifying metadata:

| Frontmatter                | Purpose                                                       | Default                 |
| :------------------------- | :---------------------------------------------------------- | :---------------------- |
| `name`                     | Name of the output style, if not the file name               | Inherits from file name |
| `description`              | Description of the output style, shown in the `/config` picker | None                    |
| `keep-coding-instructions` | Whether to keep the parts of CSC's system prompt related to coding. | false                   |

## Comparisons to related features

### Output Styles vs. CLAUDE.md vs. --append-system-prompt

Output styles completely "turn off" the parts of CSC's default system prompt specific to software engineering. Neither CLAUDE.md nor `--append-system-prompt` edit CSC's default system prompt. CLAUDE.md adds the contents as a user message *following* CSC's default system prompt. `--append-system-prompt` appends the content to the system prompt.

### Output Styles vs. Agents

Output styles directly affect the main agent loop and only affect the system prompt. Agents are invoked to handle specific tasks and can include additional settings like the model to use, the tools they have available, and some context about when to use the agent.

### Output Styles vs. Skills

Output styles modify how CSC responds (formatting, tone, structure) and are always active once selected. Skills are task-specific prompts that you invoke with `/skill-name` or that CSC loads automatically when relevant. Use output styles for consistent formatting preferences; use skills for reusable workflows and tasks.
