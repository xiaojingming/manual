---
sidebar_position: 1
---

# Create custom Subagents

> Create and use specialized AI Subagents in CSC for task-specific workflows and improved context management.

Subagents are specialized AI assistants that handle specific types of tasks. Use one when a side task would flood your main conversation with search results, logs, or file contents you won't reference again: the Subagent does that work in its own context and returns only the summary. Define a custom Subagent when you keep spawning the same kind of worker with the same instructions.

Each Subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions. When Claude encounters a task that matches a Subagent's description, it delegates to that Subagent, which works independently and returns results. To see the context savings in practice, the context window visualization walks through a session where a Subagent handles research in its own separate window.

> **Note:** If you need multiple agents working in parallel and communicating with each other, see Agent teams. Subagents work within a single session; Agent teams coordinate across separate sessions.

Subagents help you:

* **Preserve context** by keeping exploration and implementation out of your main conversation
* **Enforce constraints** by limiting which tools a Subagent can use
* **Reuse configurations** across projects with user-level Subagents
* **Specialize behavior** with focused system prompts for specific domains
* **Control costs** by routing tasks to faster, cheaper models like Haiku

CSC uses each Subagent's description to decide when to delegate tasks. When you create a Subagent, write a clear description so CSC knows when to use it.

CSC includes several built-in Subagents like **Explore**, **Plan**, and **general-purpose**. You can also create custom Subagents to handle specific tasks. This page covers built-in Subagents, how to create your own, full configuration options, patterns for working with Subagents, and example Subagents.

## Built-in Subagents

CSC includes built-in Subagents that CSC automatically uses when appropriate. Each inherits the parent conversation's permissions with additional tool restrictions.

### Explore

A fast, read-only agent optimized for searching and analyzing codebases.

* **Tools**: Read-only tools (denied access to Write and Edit tools)
* **Purpose**: File discovery, code search, codebase exploration

When CSC needs to search or understand a codebase without making changes, it delegates to Explore. This keeps exploration results out of your main conversation context.

When invoking Explore, Claude specifies a thoroughness level: **quick** for targeted lookups, **medium** for balanced exploration, or **very thorough** for comprehensive analysis.

### Plan

A research agent used in plan mode to gather context before presenting a plan.

* **Model**: Inherits from main conversation
* **Tools**: Read-only tools (denied access to Write and Edit tools)
* **Purpose**: Codebase research for planning

When you're in plan mode and CSC needs to understand your codebase, it delegates research to the Plan Subagent. This prevents infinite nesting (Subagents cannot spawn other Subagents) while still gathering necessary context.

### General-purpose

A capable agent for complex, multi-step tasks that require both exploration and action.

* **Model**: Inherits from main conversation
* **Tools**: All tools
* **Purpose**: Complex research, multi-step operations, code modifications

When the task requires both exploration and modification, complex reasoning to interpret results, or multiple dependent steps, CSC delegates to general-purpose.

## Quickstart: create your first Subagent

Subagents are defined in Markdown files with YAML frontmatter. You can create them manually or use the `/agents` command.

This walkthrough guides you through creating a user-level Subagent with the `/agents` command. The Subagent reviews code and suggests improvements for the codebase.

#### Open the Subagents interface

In CSC, run:

```text
/agents
```

#### Choose a location

Switch to the **Library** tab, select **Create new agent**, then choose **Personal**. This saves the Subagent to `~/.claude/agents/` so it's available in all your projects.

#### Generate with Claude

Select **Generate with Claude**. When prompted, describe the Subagent:

```text
A code improvement agent that scans files and suggests improvements
for readability, performance, and best practices. It should explain
each issue, show the current code, and provide an improved version.
```

Claude generates the identifier, description, and system prompt for you.

#### Select tools

For a read-only reviewer, deselect everything except **Read-only tools**. If you keep all tools selected, the Subagent inherits all tools available to the main conversation.

#### Select model

Choose which model the Subagent uses. For this example agent, select **Sonnet**, which balances capability and speed for analyzing code patterns.

#### Choose a color

Pick a background color for the Subagent. This helps you identify which Subagent is running in the UI.

#### Configure memory

Select **User scope** to give the Subagent a persistent memory directory at `~/.claude/agent-memory/`. The Subagent uses this to accumulate insights across conversations, such as codebase patterns and recurring issues. Select **None** if you don't want the Subagent to persist learnings.

#### Save and try it out

Review the configuration summary. Press `s` or `Enter` to save, or press `e` to save and edit the file in your editor. The Subagent is available immediately. Try it:

```text
Use the code-improver agent to suggest improvements in this project
```

Claude delegates to your new Subagent, which scans the codebase and returns improvement suggestions.

You now have a Subagent you can use in any project on your machine to analyze codebases and suggest improvements.

You can also create Subagents manually as Markdown files, define them via CLI flags, or distribute them through Plugins. The following sections cover all configuration options.

## Configure Subagents

### Use the /agents command

The `/agents` command opens a tabbed interface for managing Subagents. The **Running** tab shows live Subagents and lets you open or stop them. The **Library** tab lets you:

* View all available Subagents (built-in, user, project, and plugin)
* Create new Subagents with guided setup or Claude generation
* Edit existing Subagent configuration and tool access
* Delete custom Subagents
* See which Subagents are active when duplicates exist

This is the recommended way to create and manage Subagents. For manual creation or automation, you can also add Subagent files directly.

To list all configured Subagents from the command line without starting an interactive session, run `csc agents`. This shows agents grouped by source and indicates which are overridden by higher-priority definitions.

### Choose the Subagent scope

Subagents are Markdown files with YAML frontmatter. Store them in different locations depending on scope. When multiple Subagents share the same name, the higher-priority location wins.

| Location                     | Scope                   | Priority    | How to create                                 |
| :--------------------------- | :---------------------- | :---------- | :-------------------------------------------- |
| Managed settings             | Organization-wide       | 1 (highest) | Deployed via managed settings                 |
| `--agents` CLI flag          | Current session         | 2           | Pass JSON when launching CSC                  |
| `.claude/agents/`            | Current project         | 3           | Interactive or manual                         |
| `~/.claude/agents/`          | All your projects       | 4           | Interactive or manual                         |
| Plugin's `agents/` directory | Where plugin is enabled | 5 (lowest)  | Installed with Plugins                        |

**Project Subagents** (`.claude/agents/`) are ideal for Subagents specific to a codebase. Check them into version control so your team can use and improve them collaboratively.

Project Subagents are discovered by walking up from the current working directory. Directories added with `--add-dir` grant file access only and are not scanned for Subagents. To share Subagents across projects, use `~/.claude/agents/` or Plugins.

**User Subagents** (`~/.claude/agents/`) are personal Subagents available in all your projects.

**CLI-defined Subagents** are passed as JSON when launching CSC. They exist only for that session and aren't saved to disk, making them useful for quick testing or automation scripts. You can define multiple Subagents in a single `--agents` call:

```bash
csc --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

The `--agents` flag accepts JSON with the same frontmatter fields as file-based Subagents: `description`, `prompt`, `tools`, `disallowedTools`, `model`, `permissionMode`, `mcpServers`, `hooks`, `maxTurns`, `skills`, `initialPrompt`, `memory`, `effort`, `background`, `isolation`, and `color`. Use `prompt` for the system prompt, equivalent to the markdown body in file-based Subagents.

**Managed Subagents** are deployed by organization administrators. Place markdown files in `.claude/agents/` inside the managed settings directory, using the same frontmatter format as project and user Subagents. Managed definitions take precedence over project and user Subagents with the same name.

**Plugin Subagents** come from Plugins you've installed. They appear in `/agents` alongside your custom Subagents. See the plugin components reference for details on creating plugin Subagents.

> **Note:** For security reasons, Plugin Subagents do not support the `hooks`, `mcpServers`, or `permissionMode` frontmatter fields. These fields are ignored when loading agents from a Plugin. If you need them, copy the agent file into `.claude/agents/` or `~/.claude/agents/`. You can also add rules to `permissions.allow` in `settings.json` or `settings.local.json`, but these rules apply to the entire session, not just the Plugin Subagent.

Subagent definitions from any of these scopes are also available to Agent teams: when spawning a teammate, you can reference a Subagent type and the teammate uses its `tools` and `model`, with the definition's body appended to the teammate's system prompt as additional instructions. See Agent teams for which frontmatter fields apply on that path.

### Write Subagent files

Subagent files use YAML frontmatter for configuration, followed by the system prompt in Markdown:

> **Note:** Subagents are loaded at session start. If you create a Subagent by manually adding a file, restart your session or use `/agents` to load it immediately.

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

The frontmatter defines the Subagent's metadata and configuration. The body becomes the system prompt that guides the Subagent's behavior. Subagents receive only this system prompt (plus basic environment details like working directory), not the full CSC system prompt.

A Subagent starts in the main conversation's current working directory. Within a Subagent, `cd` commands do not persist between Bash or PowerShell tool calls and do not affect the main conversation's working directory. To give the Subagent an isolated copy of the repository, set `isolation: worktree`.

#### Supported frontmatter fields

The following fields can be used in the YAML frontmatter. Only `name` and `description` are required.

| Field             | Required | Description                                                                                                                                                                                                                                                                  |
| :---------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | Yes      | Unique identifier using lowercase letters and hyphens                                                                                                                                                                                                                        |
| `description`     | Yes      | When Claude should delegate to this Subagent                                                                                                                                                                                                                                 |
| `tools`           | No       | Tools the Subagent can use. Inherits all tools if omitted                                                                                                                                                                                                                    |
| `disallowedTools` | No       | Tools to deny, removed from inherited or specified list                                                                                                                                                                                                                      |
| `model`           | No       | Model to use: `sonnet`, `opus`, `haiku`, a full model ID (for example, `claude-opus-4-6`), or `inherit`. Defaults to `inherit`                                                                                                                                                |
| `permissionMode`  | No       | Permission mode: `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, or `plan`                                                                                                                                                                                 |
| `maxTurns`        | No       | Maximum number of agentic turns before the Subagent stops                                                                                                                                                                                                                    |
| `skills`          | No       | Skills to load into the Subagent's context at startup. The full skill content is injected, not just made available for invocation. Subagents don't inherit Skills from the parent conversation                                                                                |
| `mcpServers`      | No       | MCP servers available to this Subagent. Each entry is either a server name referencing an already-configured server (e.g., `"slack"`) or an inline definition with the server name as key and a full MCP server config as value                                              |
| `hooks`           | No       | Lifecycle Hooks scoped to this Subagent                                                                                                                                                                                                                                      |
| `memory`          | No       | Persistent memory scope: `user`, `project`, or `local`. Enables cross-session learning                                                                                                                                                                                       |
| `background`      | No       | Set to `true` to always run this Subagent as a background task. Default: `false`                                                                                                                                                                                              |
| `effort`          | No       | Effort level when this Subagent is active. Overrides the session effort level. Default: inherits from session. Options: `low`, `medium`, `high`, `max` (Opus 4.6 only)                                                                                                       |
| `isolation`       | No       | Set to `worktree` to run the Subagent in a temporary git worktree, giving it an isolated copy of the repository. The worktree is automatically cleaned up if the Subagent makes no changes                                                                                   |
| `color`           | No       | Display color for the Subagent in the task list and transcript. Accepts `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, or `cyan`                                                                                                                              |
| `initialPrompt`   | No       | Auto-submitted as the first user turn when this agent runs as the main session agent (via `--agent` or the `agent` setting). Commands and Skills are processed. Prepended to any user-provided prompt                                                                         |

### Choose a model

The `model` field controls which AI model the Subagent uses:

* **Model alias**: Use one of the available aliases: `sonnet`, `opus`, or `haiku`
* **Full model ID**: Use a full model ID such as `claude-opus-4-6` or `claude-sonnet-4-6`. Accepts the same values as the `--model` flag
* **inherit**: Use the same model as the main conversation
* **Omitted**: If not specified, defaults to `inherit` (uses the same model as the main conversation)

When CSC invokes a Subagent, it can also pass a `model` parameter for that specific invocation. CSC resolves the Subagent's model in this order:

1. The `CLAUDE_CODE_SUBAGENT_MODEL` environment variable, if set
2. The per-invocation `model` parameter
3. The Subagent definition's `model` frontmatter
4. The main conversation's model

### Control Subagent capabilities

You can control what Subagents can do through tool access, permission modes, and conditional rules.

#### Available tools

Subagents can use any of CSC's internal tools. By default, Subagents inherit all tools from the main conversation, including MCP tools.

To restrict tools, use either the `tools` field (allowlist) or the `disallowedTools` field (denylist). This example uses `tools` to exclusively allow Read, Grep, Glob, and Bash. The Subagent can't edit files, write files, or use any MCP tools:

```yaml
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

This example uses `disallowedTools` to inherit every tool from the main conversation except Write and Edit. The Subagent keeps Bash, MCP tools, and everything else:

```yaml
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

If both are set, `disallowedTools` is applied first, then `tools` is resolved against the remaining pool. A tool listed in both is removed.

#### Restrict which Subagents can be spawned

When an agent runs as the main thread with `csc --agent`, it can spawn Subagents using the Agent tool. To restrict which Subagent types it can spawn, use `Agent(agent_type)` syntax in the `tools` field.

> **Note:** In version 2.1.63, the Task tool was renamed to Agent. Existing `Task(...)` references in settings and agent definitions still work as aliases.

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

This is an allowlist: only the `worker` and `researcher` Subagents can be spawned. If the agent tries to spawn any other type, the request fails and the agent sees only the allowed types in its prompt. To block specific agents while allowing all others, use `permissions.deny`.

To allow spawning any Subagent without restrictions, use `Agent` without parentheses:

```yaml
tools: Agent, Read, Bash
```

If `Agent` is omitted from the `tools` list entirely, the agent cannot spawn any Subagents. This restriction only applies to agents running as the main thread with `csc --agent`. Subagents cannot spawn other Subagents, so `Agent(agent_type)` has no effect in Subagent definitions.

#### Scope MCP servers to a Subagent

Use the `mcpServers` field to give a Subagent access to MCP servers that aren't available in the main conversation. Inline servers defined here are connected when the Subagent starts and disconnected when it finishes. String references share the parent session's connection.

Each entry in the list is either an inline server definition or a string referencing an MCP server already configured in your session:

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # Inline definition: scoped to this subagent only
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # Reference by name: reuses an already-configured server
  - github
---

Use the Playwright tools to navigate, screenshot, and interact with pages.
```

Inline definitions use the same schema as `.mcp.json` server entries (`stdio`, `http`, `sse`, `ws`), keyed by the server name.

To keep an MCP server out of the main conversation entirely and avoid its tool descriptions consuming context there, define it inline here rather than in `.mcp.json`. The Subagent gets the tools; the parent conversation does not.

#### Permission modes

The `permissionMode` field controls how the Subagent handles permission prompts. Subagents inherit the permission context from the main conversation and can override the mode, except when the parent mode takes precedence as described below.

| Mode                | Behavior                                                                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `default`           | Standard permission checking with prompts                                                                                                   |
| `acceptEdits`       | Auto-accept file edits and common filesystem commands for paths in the working directory or `additionalDirectories`                         |
| `auto`              | Auto mode: a background classifier reviews commands and protected-directory writes                                                          |
| `dontAsk`           | Auto-deny permission prompts (explicitly allowed tools still work)                                                                          |
| `bypassPermissions` | Skip permission prompts                                                                                                                     |
| `plan`              | Plan mode (read-only exploration)                                                                                                           |

> **Warning:** Use `bypassPermissions` with caution. It skips permission prompts, allowing the Subagent to execute operations without approval. Writes to `.git`, `.claude`, `.vscode`, `.idea`, and `.husky` directories still prompt for confirmation, except for `.claude/commands`, `.claude/agents`, and `.claude/skills`. See permission modes for details.

If the parent uses `bypassPermissions`, this takes precedence and cannot be overridden. If the parent uses auto mode, the Subagent inherits auto mode and any `permissionMode` in its frontmatter is ignored: the classifier evaluates the Subagent's tool calls with the same block and allow rules as the parent session.

#### Preload Skills into Subagents

Use the `skills` field to inject Skills content into a Subagent's context at startup. This gives the Subagent domain knowledge without requiring it to discover and load Skills during execution.

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

The full content of each Skill is injected into the Subagent's context, not just made available for invocation. Subagents don't inherit Skills from the parent conversation; you must list them explicitly.

> **Note:** This is the inverse of running a Skill in a Subagent. With `skills` in a Subagent, the Subagent controls the system prompt and loads Skill content. With `context: fork` in a Skill, the Skill content is injected into the agent you specify. Both use the same underlying system.

#### Enable persistent memory

The `memory` field gives the Subagent a persistent directory that survives across conversations. The Subagent uses this directory to build up knowledge over time, such as codebase patterns, debugging insights, and architectural decisions.

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

Choose a scope based on how broadly the memory should apply:

| Scope     | Location                                      | Use when                                                                                    |
| :-------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `user`    | `~/.claude/agent-memory/<name-of-agent>/`     | The Subagent should remember learnings across all projects                                  |
| `project` | `.claude/agent-memory/<name-of-agent>/`       | The Subagent's knowledge is project-specific and shareable via version control              |
| `local`   | `.claude/agent-memory-local/<name-of-agent>/` | The Subagent's knowledge is project-specific but should not be checked into version control |

When memory is enabled:

* The Subagent's system prompt includes instructions for reading and writing to the memory directory.
* The Subagent's system prompt also includes the first 200 lines or 25KB of `MEMORY.md` in the memory directory, whichever comes first, with instructions to curate `MEMORY.md` if it exceeds that limit.
* Read, Write, and Edit tools are automatically enabled so the Subagent can manage its memory files.

##### Persistent memory tips

* `project` is the recommended default scope. It makes Subagent knowledge shareable via version control. Use `user` when the Subagent's knowledge is broadly applicable across projects, or `local` when the knowledge should not be checked into version control.
* Ask the Subagent to consult its memory before starting work: "Review this PR, and check your memory for patterns you've seen before."
* Ask the Subagent to update its memory after completing a task: "Now that you're done, save what you learned to your memory." Over time, this builds a knowledge base that makes the Subagent more effective.
* Include memory instructions directly in the Subagent's markdown file so it proactively maintains its own knowledge base:

  ```markdown
  Update your agent memory as you discover codepaths, patterns, library
  locations, and key architectural decisions. This builds up institutional
  knowledge across conversations. Write concise notes about what you found
  and where.
  ```

#### Conditional rules with Hooks

For more dynamic control over tool usage, use `PreToolUse` Hooks to validate operations before they execute. This is useful when you need to allow some operations of a tool while blocking others.

This example creates a Subagent that only allows read-only database queries. The `PreToolUse` Hook runs the script specified in `command` before each Bash command executes:

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

CSC passes hook input as JSON via stdin to hook commands. The validation script reads this JSON, extracts the Bash command, and exits with code 2 to block write operations:

```bash
#!/bin/bash
# ./scripts/validate-readonly-query.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Block SQL write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' > /dev/null; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2
fi

exit 0
```

See Hook input for the complete input schema and exit codes for how exit codes affect behavior.

#### Disable specific Subagents

You can prevent Claude from using specific Subagents by adding them to the `deny` array in your settings. Use the format `Agent(subagent-name)` where `subagent-name` matches the Subagent's name field.

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

This works for both built-in and custom Subagents. You can also use the `--disallowedTools` CLI flag:

```bash
csc --disallowedTools "Agent(Explore)"
```

See Permissions documentation for more details on permission rules.

### Define Hooks for Subagents

Subagents can define Hooks that run during the Subagent's lifecycle. There are two ways to configure Hooks:

1. **In the Subagent's frontmatter**: Define Hooks that run only while that Subagent is active
2. **In `settings.json`**: Define Hooks that run in the main session when Subagents start or stop

#### Hooks in Subagent frontmatter

Define Hooks directly in the Subagent's markdown file. These Hooks only run while that specific Subagent is active and are cleaned up when it finishes.

All Hook events are supported. The most common events for Subagents are:

| Event         | Matcher input | When it fires                                                       |
| :------------ | :------------ | :------------------------------------------------------------------ |
| `PreToolUse`  | Tool name     | Before the Subagent uses a tool                                     |
| `PostToolUse` | Tool name     | After the Subagent uses a tool                                      |
| `Stop`        | (none)        | When the Subagent finishes (converted to `SubagentStop` at runtime) |

This example validates Bash commands with the `PreToolUse` Hook and runs a linter after file edits with `PostToolUse`:

```yaml
---
name: code-reviewer
description: Review code changes with automatic linting
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh $TOOL_INPUT"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

`Stop` hooks in frontmatter are automatically converted to `SubagentStop` events.

#### Project-level Hooks for Subagent events

Configure Hooks in `settings.json` that respond to Subagent lifecycle events in the main session.

| Event           | Matcher input   | When it fires                    |
| :-------------- | :-------------- | :------------------------------- |
| `SubagentStart` | Agent type name | When a Subagent begins execution |
| `SubagentStop`  | Agent type name | When a Subagent completes        |

Both events support matchers to target specific agent types by name. This example runs a setup script only when the `db-agent` Subagent starts, and a cleanup script when any Subagent stops:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

See Hooks for the complete hook configuration format.

## Work with Subagents

### Understand automatic delegation

CSC automatically delegates tasks based on the task description in your request, the `description` field in Subagent configurations, and current context. To encourage proactive delegation, include phrases like "use proactively" in your Subagent's description field.

### Invoke Subagents explicitly

When automatic delegation isn't enough, you can request a Subagent yourself. Three patterns escalate from a one-off suggestion to a session-wide default:

* **Natural language**: name the Subagent in your prompt; CSC decides whether to delegate
* **@-mention**: guarantees the Subagent runs for one task
* **Session-wide**: the whole session uses that Subagent's system prompt, tool restrictions, and model via the `--agent` flag or the `agent` setting

For natural language, there's no special syntax. Name the Subagent and Claude typically delegates:

```text
Use the test-runner subagent to fix failing tests
Have the code-reviewer subagent look at my recent changes
```

**@-mention the Subagent.** Type `@` and pick the Subagent from the typeahead, the same way you @-mention files. This ensures that specific Subagent runs rather than leaving the choice to Claude:

```text
@"code-reviewer (agent)" look at the auth changes
```

Your full message still goes to Claude, which writes the Subagent's task prompt based on what you asked. The @-mention controls which Subagent Claude invokes, not what prompt it receives.

Subagents provided by an enabled Plugin appear in the typeahead as `<plugin-name>:<agent-name>`. Named background Subagents currently running in the session also appear in the typeahead, showing their status next to the name. You can also type the mention manually without using the picker: `@agent-<name>` for local Subagents, or `@agent-<plugin-name>:<agent-name>` for Plugin Subagents.

**Run the whole session as a Subagent.** Pass `--agent <name>` to start a session where the main thread itself takes on that Subagent's system prompt, tool restrictions, and model:

```bash
csc --agent code-reviewer
```

The Subagent's system prompt replaces the default CSC system prompt entirely, the same way `--system-prompt` does. `CLAUDE.md` files and project memory still load through the normal message flow. The agent name appears as `@<name>` in the startup header so you can confirm it's active.

This works with built-in and custom Subagents, and the choice persists when you resume the session.

For a Plugin-provided Subagent, pass the scoped name: `csc --agent <plugin-name>:<agent-name>`.

To make it the default for every session in a project, set `agent` in `.claude/settings.json`:

```json
{
  "agent": "code-reviewer"
}
```

The CLI flag overrides the setting if both are present.

### Run Subagents in foreground or background

Subagents can run in the foreground (blocking) or background (concurrent):

* **Foreground Subagents** block the main conversation until complete. Permission prompts and clarifying questions (like `AskUserQuestion`) are passed through to you.
* **Background Subagents** run concurrently while you continue working. Before launching, CSC prompts for any tool permissions the Subagent will need, ensuring it has the necessary approvals upfront. Once running, the Subagent inherits these permissions and auto-denies anything not pre-approved. If a background Subagent needs to ask clarifying questions, that tool call fails but the Subagent continues.

If a background Subagent fails due to missing permissions, you can start a new foreground Subagent with the same task to retry with interactive prompts.

CSC decides whether to run Subagents in the foreground or background based on the task. You can also:

* Ask CSC to "run this in the background"
* Press **Ctrl+B** to background a running task

To disable all background task functionality, set the `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` environment variable to `1`. See environment variables.

### Common patterns

#### Isolate high-volume operations

One of the most effective uses for Subagents is isolating operations that produce large amounts of output. Running tests, fetching documentation, or processing log files can consume significant context. By delegating these to a Subagent, the verbose output stays in the Subagent's context while only the relevant summary returns to your main conversation.

```text
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### Run parallel research

For independent investigations, spawn multiple Subagents to work simultaneously:

```text
Research the authentication, database, and API modules in parallel using separate subagents
```

Each Subagent explores its area independently, then CSC synthesizes the findings. This works best when the research paths don't depend on each other.

> **Warning:** When Subagents complete, their results return to your main conversation. Running many Subagents that each return detailed results can consume significant context.

For tasks that need sustained parallelism or exceed your context window, Agent teams give each worker its own independent context.

#### Chain Subagents

For multi-step workflows, ask Claude to use Subagents in sequence. Each Subagent completes its task and returns results to CSC, which then passes relevant context to the next Subagent.

```text
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### Choose between Subagents and main conversation

Use the **main conversation** when:

* The task needs frequent back-and-forth or iterative refinement
* Multiple phases share significant context (planning → implementation → testing)
* You're making a quick, targeted change
* Latency matters. Subagents start fresh and may need time to gather context

Use **Subagents** when:

* The task produces verbose output you don't need in your main context
* You want to enforce specific tool restrictions or permissions
* The work is self-contained and can return a summary

Consider Skills instead when you want reusable prompts or workflows that run in the main conversation context rather than isolated Subagent context.

For a quick question about something already in your conversation, use `/btw` instead of a Subagent. It sees your full context but has no tool access, and the answer is discarded rather than added to history.

> **Note:** Subagents cannot spawn other Subagents. If your workflow requires nested delegation, use Skills or chain Subagents from the main conversation.

### Manage Subagent context

#### Resume Subagents

Each Subagent invocation creates a new instance with fresh context. To continue an existing Subagent's work instead of starting over, ask CSC to resume it.

Resumed Subagents retain their full conversation history, including all previous tool calls, results, and reasoning. The Subagent picks up exactly where it stopped rather than starting fresh.

When a Subagent completes, CSC receives its agent ID. CSC uses the `SendMessage` tool with the agent's ID as the `to` field to resume it. The `SendMessage` tool is only available when Agent teams are enabled via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

To resume a Subagent, ask Claude to continue the previous work:

```text
Use the code-reviewer subagent to review the authentication module
[Agent completes]

Continue that code review and now analyze the authorization logic
[Claude resumes the subagent with full context from previous conversation]
```

If a stopped Subagent receives a `SendMessage`, it auto-resumes in the background without requiring a new `Agent` invocation.

You can also ask Claude for the agent ID if you want to reference it explicitly, or find IDs in the transcript files at `~/.claude/projects/{project}/{sessionId}/subagents/`. Each transcript is stored as `agent-{agentId}.jsonl`.

Subagent transcripts persist independently of the main conversation:

* **Main conversation compaction**: When the main conversation compacts, Subagent transcripts are unaffected. They're stored in separate files.
* **Session persistence**: Subagent transcripts persist within their session. You can resume a Subagent after restarting CSC by resuming the same session.
* **Automatic cleanup**: Transcripts are cleaned up based on the `cleanupPeriodDays` setting (default: 30 days).

#### Auto-compaction

Subagents support automatic compaction using the same logic as the main conversation. By default, auto-compaction triggers at approximately 95% capacity. To trigger compaction earlier, set `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` to a lower percentage (for example, `50`). See environment variables for details.

Compaction events are logged in Subagent transcript files:

```json
{
  "type": "system",
  "subtype": "compact_boundary",
  "compactMetadata": {
    "trigger": "auto",
    "preTokens": 167189
  }
}
```

The `preTokens` value shows how many tokens were used before compaction occurred.

## Example Subagents

These examples demonstrate effective patterns for building Subagents. Use them as starting points, or generate a customized version with CSC.

> **Tip:** **Best practices:**
>
> * **Design focused Subagents:** each Subagent should excel at one specific task
> * **Write detailed descriptions:** Claude uses the description to decide when to delegate
> * **Limit tool access:** grant only necessary permissions for security and focus
> * **Check into version control:** share project Subagents with your team

### Code reviewer

A read-only Subagent that reviews code without modifying it. This example shows how to design a focused Subagent with limited tool access (no Edit or Write) and a detailed prompt that specifies exactly what to look for and how to format output.

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### Debugger

A Subagent that can both analyze and fix issues. Unlike the code reviewer, this one includes Edit because fixing bugs requires modifying code. The prompt provides a clear workflow from diagnosis to verification.

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### Data scientist

A domain-specific Subagent for data analysis work. This example shows how to create Subagents for specialized workflows outside of typical coding tasks. It explicitly sets `model: sonnet` for more capable analysis.

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

### Database query validator

A Subagent that allows Bash access but validates commands to permit only read-only SQL queries. This example shows how to use `PreToolUse` Hooks for conditional validation when you need finer control than the `tools` field provides.

```markdown
---
name: db-reader
description: Execute read-only database queries. Use when analyzing data or generating reports.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access. Execute SELECT queries to answer questions about the data.

When asked to analyze data:
1. Identify which tables contain the relevant data
2. Write efficient SELECT queries with appropriate filters
3. Present results clearly with context

You cannot modify data. If asked to INSERT, UPDATE, DELETE, or modify schema, explain that you only have read access.
```

CSC passes hook input as JSON via stdin to hook commands. The validation script reads this JSON, extracts the command being executed, and checks it against a list of SQL write operations. If a write operation is detected, the script exits with code 2 to block execution and returns an error message to CSC via stderr.

Create the validation script anywhere in your project. The path must match the `command` field in your hook configuration:

```bash
#!/bin/bash
# Blocks SQL write operations, allows SELECT queries

# Read JSON input from stdin
INPUT=$(cat)

# Extract the command field from tool_input using jq
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed. Use SELECT queries only." >&2
  exit 2
fi

exit 0
```

Make the script executable:

```bash
chmod +x ./scripts/validate-readonly-query.sh
```

The hook receives JSON via stdin with the Bash command in `tool_input.command`. Exit code 2 blocks the operation and feeds the error message back to Claude. See Hooks for details on exit codes and Hook input for the complete input schema.
