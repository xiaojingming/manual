---
sidebar_position: 11
---

# Custom Agents

## Overview

There are two types of agents in CoStrict: primary agents and sub-agents. Primary agents are the main assistants you interact with directly. You can switch between them using the `<Tab>` key.

Sub-agents are specialized assistants that primary agents can invoke for specific tasks. You can also manually invoke them by **@mentioning** them in messages.

## Agent File Placement

● Global: `~/.config/costrict/agents/`

● Project: `.costrict/agents/`

## Example

You can create an agent using a command:

```
cs agent create
```

Or manually create a file.

In the project root directory, create .costrict/agents/review.md:

```
---
description: Reviews code for quality and best practices
mode: primary
---

You are in code review mode. Focus on:

- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations

Provide constructive feedback without making direct changes.
```

- Parameter description: The mode option can be set to primary, subagent, or all. If mode is not specified, the default value is all.

**Note**: After configuring the agent, it is recommended to restart the CLI to load the agent.

## Testing

![img](img/custom-agent/png.webp)

## Other Configurations

### Specify Agent Model, Temperature, and Disable Tools

```
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
---

You are in code review mode. Focus on:

- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations

Provide constructive feedback without making direct changes.
```

### Control Agent Tool Permissions, Subagent Permissions, and Skills Permissions

```
---
description: Code review without edits
mode: subagent
permission:
  edit: deny
  bash:
    "*": ask
    "git diff": allow
    "git log*": allow
    "grep *": allow
  webfetch: deny
  task:
    "*": "deny"
    "orchestrator-*": "allow"
    "code-reviewer": "ask"
  skill:
    "documents-*": "allow"
---

Only analyze code and suggest changes.
```
