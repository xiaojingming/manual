---
sidebar_position: 2
---

# Extend CSC

> Understand when to use CLAUDE.md, Skills, Subagents, Hooks, MCP, and Plugins.

CSC combines a model that reasons about your code with built-in tools for file operations, search, execution, and web access. The built-in tools cover most coding tasks. This guide covers the extension layer: features you add to customize what CSC knows, connect it to external services, and automate workflows.

> **Note:** For how the core agentic loop works, see how CSC works.

**New to CSC?** Start with CLAUDE.md for project conventions, then add other extensions as specific triggers come up.

## Overview

Extensions plug into different parts of the agentic loop:

* **CLAUDE.md** adds persistent context CSC sees every session
* **Skills** add reusable knowledge and invocable workflows
* **MCP** connects CSC to external services and tools
* **Subagents** run their own loops in isolated context, returning summaries
* **Agent teams** coordinate multiple independent sessions with shared tasks and peer-to-peer messaging
* **Hooks** run outside the loop entirely as deterministic scripts
* **Plugins** and **marketplaces** package and distribute these features

Skills are the most flexible extension. A skill is a markdown file containing knowledge, workflows, or instructions. You can invoke skills with a command like `/deploy`, or CSC can load them automatically when relevant. Skills can run in your current conversation or in an isolated context via Subagents.

## Match features to your goal

Features range from always-on context that CSC sees every session, to on-demand capabilities you or CSC can invoke, to background automation that runs on specific events. The table below shows what's available and when each one makes sense.

| Feature           | What it does                                               | When to use it                                                                  | Example                                                                         |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **CLAUDE.md**     | Persistent context loaded every conversation               | Project conventions, "always do X" rules                                        | "Use pnpm, not npm. Run tests before committing."                               |
| **Skills**        | Instructions, knowledge, and workflows CSC can use         | Reusable content, reference docs, repeatable tasks                              | `/deploy` runs your deployment checklist; API docs skill with endpoint patterns |
| **Subagents**     | Isolated execution context that returns summarized results | Context isolation, parallel tasks, specialized workers                          | Research task that reads many files but returns only key findings               |
| **Agent teams**   | Coordinate multiple independent CSC sessions               | Parallel research, new feature development, debugging with competing hypotheses | Spawn reviewers to check security, performance, and tests simultaneously        |
| **MCP**           | Connect to external services                               | External data or actions                                                        | Query your database, post to Slack, control a browser                           |
| **Hooks**         | Deterministic script that runs on events                   | Predictable automation, no LLM involved                                         | Run ESLint after every file edit                                                |

**Plugins** are the packaging layer. A plugin bundles Skills, Hooks, Subagents, and MCP servers into a single installable unit. Plugin skills are namespaced (like `/my-plugin:review`) so multiple plugins can coexist. Use plugins when you want to reuse the same setup across multiple repositories or distribute to others via a **marketplace**.

### Build your setup over time

You don't need to configure everything up front. Each feature has a recognizable trigger, and most teams add them in roughly this order:

| Trigger                                                                          | Add                                             |
| :------------------------------------------------------------------------------- | :---------------------------------------------- |
| CSC gets a convention or command wrong twice                                     | Add it to CLAUDE.md                             |
| You keep typing the same prompt to start a task                                  | Save it as a user-invocable Skill               |
| You paste the same playbook or multi-step procedure into chat for the third time | Capture it as a Skill                           |
| You keep copying data from a browser tab CSC can't see                           | Connect that system as an MCP server            |
| A side task floods your conversation with output you won't reference again       | Route it through a Subagent                     |
| You want something to happen every time without asking                           | Write a Hook                                    |
| A second repository needs the same setup                                         | Package it as a Plugin                          |

The same triggers tell you when to update what you already have. A repeated mistake or a recurring review comment is a CLAUDE.md edit, not a one-off correction in chat. A workflow you keep tweaking by hand is a Skill that needs another revision.

### Compare similar features

Some features can seem similar. Here's how to tell them apart.

### Skills vs Subagents

Skills and Subagents solve different problems:

* **Skills** are reusable content you can load into any context
* **Subagents** are isolated workers that run separately from your main conversation

| Aspect          | Skills                                          | Subagents                                                         |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| **What it is**  | Reusable instructions, knowledge, or workflows | Isolated worker with its own context                             |
| **Key benefit** | Share content across contexts                  | Context isolation. Work happens separately, only summary returns |
| **Best for**    | Reference material, invocable workflows        | Tasks that read many files, parallel work, specialized workers   |

**Skills can be reference or action.** Reference skills provide knowledge CSC uses throughout your session (like your API style guide). Action skills tell CSC to do something specific (like `/deploy` that runs your deployment workflow).

**Use a Subagent** when you need context isolation or when your context window is getting full. The Subagent might read dozens of files or run extensive searches, but your main conversation only receives a summary. Since Subagent work doesn't consume your main context, this is also useful when you don't need the intermediate work to remain visible. Custom Subagents can have their own instructions and can preload Skills.

**They can combine.** A Subagent can preload specific Skills (`skills:` field). A Skill can run in isolated context using `context: fork`. See Skills for details.

### CLAUDE.md vs Skills

Both store instructions, but they load differently and serve different purposes.

| Aspect                    | CLAUDE.md                    | Skills                                   |
| ------------------------- | ---------------------------- | --------------------------------------- |
| **Loads**                 | Every session, automatically | On demand                               |
| **Can include files**     | Yes, with `@path` imports    | Yes, with `@path` imports               |
| **Can trigger workflows** | No                           | Yes, with `/<name>`                     |
| **Best for**              | "Always do X" rules          | Reference material, invocable workflows |

**Put it in CLAUDE.md** if CSC should always know it: coding conventions, build commands, project structure, "never do X" rules.

**Put it in a Skill** if it's reference material CSC needs sometimes (API docs, style guides) or a workflow you trigger with `/<name>` (deploy, review, release).

**Rule of thumb:** Keep CLAUDE.md under 200 lines. If it's growing, move reference content to Skills or split into `.claude/rules/` files.

### CLAUDE.md vs Rules vs Skills

All three store instructions, but they load differently:

| Aspect       | CLAUDE.md                           | `.claude/rules/`                                   | Skills                                    |
| ------------ | ----------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| **Loads**    | Every session                       | Every session, or when matching files are opened   | On demand, when invoked or relevant      |
| **Scope**    | Whole project                       | Can be scoped to file paths                        | Task-specific                            |
| **Best for** | Core conventions and build commands | Language-specific or directory-specific guidelines | Reference material, repeatable workflows |

**Use CLAUDE.md** for instructions every session needs: build commands, test conventions, project architecture.

**Use rules** to keep CLAUDE.md focused. Rules with `paths` frontmatter only load when CSC works with matching files, saving context.

**Use Skills** for content CSC only needs sometimes, like API documentation or a deployment checklist you trigger with `/<name>`.

### Subagents vs Agent teams

Both parallelize work, but they're architecturally different:

* **Subagents** run inside your session and report results back to your main context
* **Agent teams** are independent CSC sessions that communicate with each other

| Aspect            | Subagents                                         | Agent teams                                          |
| ----------------- | ------------------------------------------------ | --------------------------------------------------- |
| **Context**       | Own context window; results return to the caller | Own context window; fully independent               |
| **Communication** | Reports results back to the main agent only      | Teammates message each other directly               |
| **Coordination**  | Main agent manages all work                      | Shared task list with self-coordination             |
| **Best for**      | Focused tasks where only the result matters      | Complex work requiring discussion and collaboration |
| **Token cost**    | Lower: results summarized back to main context   | Higher: each teammate is a separate Claude instance |

**Use a Subagent** when you need a quick, focused worker: research a question, verify a claim, review a file. The Subagent does the work and returns a summary. Your main conversation stays clean.

**Use an Agent team** when teammates need to share findings, challenge each other, and coordinate independently. Agent teams are best for research with competing hypotheses, parallel code review, and new feature development where each teammate owns a separate piece.

**Transition point:** If you're running parallel Subagents but hitting context limits, or if your Subagents need to communicate with each other, Agent teams are the natural next step.

> **Note:** Agent teams are experimental and disabled by default. See Agent teams for setup and current limitations.

### MCP vs Skills

MCP connects CSC to external services. Skills extend what CSC knows, including how to use those services effectively.

| Aspect         | MCP                                                  | Skills                                                   |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| **What it is** | Protocol for connecting to external services         | Knowledge, workflows, and reference material            |
| **Provides**   | Tools and data access                                | Knowledge, workflows, reference material                |
| **Examples**   | Slack integration, database queries, browser control | Code review checklist, deploy workflow, API style guide |

These solve different problems and work well together:

**MCP** gives CSC the ability to interact with external systems. Without MCP, CSC can't query your database or post to Slack.

**Skills** give CSC knowledge about how to use those tools effectively, plus workflows you can trigger with `/<name>`. A Skill might include your team's database schema and query patterns, or a `/post-to-slack` workflow with your team's message formatting rules.

Example: An MCP server connects CSC to your database. A Skill teaches CSC your data model, common query patterns, and which tables to use for different tasks.

### Understand how features layer

Features can be defined at multiple levels: user-wide, per-project, via Plugins, or through managed policies. You can also nest CLAUDE.md files in subdirectories or place Skills in specific packages of a monorepo. When the same feature exists at multiple levels, here's how they layer:

* **CLAUDE.md files** are additive: all levels contribute content to CSC's context simultaneously. Files from your working directory and above load at launch; subdirectories load as you work in them. When instructions conflict, CSC uses judgment to reconcile them, with more specific instructions typically taking precedence. See how CLAUDE.md files load.
* **Skills and Subagents** override by name: when the same name exists at multiple levels, one definition wins based on priority (Skills: managed > user > project; Subagents: managed > CLI flag > project > user > Plugins). Plugin Skills are namespaced to avoid conflicts. See Skills discovery and Subagents scope.
* **MCP servers** override by name: local > project > user. See MCP scope.
* **Hooks** merge: all registered Hooks fire for their matching events regardless of source. See Hooks.

### Combine features

Each extension solves a different problem: CLAUDE.md handles always-on context, Skills handle on-demand knowledge and workflows, MCP handles external connections, Subagents handle isolation, and Hooks handle automation. Real setups combine them based on your workflow.

For example, you might use CLAUDE.md for project conventions, a Skill for your deployment workflow, MCP to connect to your database, and a Hook to run linting after every edit. Each feature handles what it's best at.

| Pattern                | How it works                                                                     | Example                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Skills + MCP**       | MCP provides the connection; a Skill teaches CSC how to use it well              | MCP connects to your database, a Skill documents your schema and query patterns                   |
| **Skills + Subagents** | A Skill spawns Subagents for parallel work                                       | `/audit` Skill kicks off security, performance, and style Subagents that work in isolated context |
| **CLAUDE.md + Skills** | CLAUDE.md holds always-on rules; Skills hold reference material loaded on demand | CLAUDE.md says "follow our API conventions," a Skill contains the full API style guide            |
| **Hooks + MCP**        | A Hook triggers external actions through MCP                                     | Post-edit Hook sends a Slack notification when CSC modifies critical files                        |

## Understand context costs

Every feature you add consumes some of CSC's context. Too much can fill up your context window, but it can also add noise that makes CSC less effective; Skills may not trigger correctly, or CSC may lose track of your conventions. Understanding these trade-offs helps you build an effective setup. For an interactive view of how these features combine in a running session, see Explore the context window.

### Context cost by feature

Each feature has a different loading strategy and context cost:

| Feature         | When it loads             | What loads                                    | Context cost                                 |
| --------------- | ------------------------- | --------------------------------------------- | -------------------------------------------- |
| **CLAUDE.md**   | Session start             | Full content                                  | Every request                                |
| **Skills**      | Session start + when used | Descriptions at start, full content when used | Low (descriptions every request)\*           |
| **MCP servers** | Session start             | Tool names; full schemas on demand            | Low until a tool is used                     |
| **Subagents**   | When spawned              | Fresh context with specified Skills           | Isolated from main session                   |
| **Hooks**       | On trigger                | Nothing (runs externally)                     | Zero, unless Hook returns additional context |

\*By default, skill descriptions load at session start so CSC can decide when to use them. Set `disable-model-invocation: true` in a skill's frontmatter to hide it from CSC entirely until you invoke it manually. This reduces context cost to zero for skills you only trigger yourself.

### Understand how features load

Each feature loads at different points in your session. The sections below explain when each one loads and what goes into context.

### CLAUDE.md

**When:** Session start

**What loads:** Full content of all CLAUDE.md files (managed, user, and project levels).

**Inheritance:** CSC reads CLAUDE.md files from your working directory up to the root, and discovers nested ones in subdirectories as it accesses those files. See how CLAUDE.md files load for details.

> **Tip:** Keep CLAUDE.md under 200 lines. Move reference material to Skills, which load on-demand.

### Skills

Skills are extra capabilities in CSC's toolkit. They can be reference material (like an API style guide) or invocable workflows you trigger with `/<name>` (like `/deploy`). CSC includes bundled skills like `/simplify`, `/batch`, and `/debug` that work out of the box. You can also create your own. CSC uses Skills when appropriate, or you can invoke one directly.

**When:** Depends on the Skill's configuration. By default, descriptions load at session start and full content loads when used. For user-only skills (`disable-model-invocation: true`), nothing loads until you invoke them.

**What loads:** For model-invocable Skills, CSC sees names and descriptions in every request. When you invoke a Skill with `/<name>` or CSC loads it automatically, the full content loads into your conversation.

**How CSC chooses Skills:** CSC matches your task against skill descriptions to decide which are relevant. If descriptions are vague or overlap, CSC may load the wrong skill or miss one that would help. To tell CSC to use a specific Skill, invoke it with `/<name>`. Skills with `disable-model-invocation: true` are invisible to CSC until you invoke them.

**Context cost:** Low until used. User-only skills have zero cost until invoked.

**In Subagents:** Skills work differently in Subagents. Instead of on-demand loading, Skills passed to a Subagent are fully preloaded into its context at launch. Subagents don't inherit Skills from the main session; you must specify them explicitly.

> **Tip:** Use `disable-model-invocation: true` for skills with side effects. This saves context and ensures only you trigger them.

### MCP servers

**When:** Session start.

**What loads:** Tool names from connected servers. Full JSON schemas stay deferred until CSC needs a specific tool.

**Context cost:** Tool search is on by default, so idle MCP tools consume minimal context.

**Reliability note:** MCP connections can fail silently mid-session. If a server disconnects, its tools disappear without warning. CSC may try to use a tool that no longer exists. If you notice CSC failing to use an MCP tool it previously could access, check the connection with `/mcp`.

> **Tip:** Run `/mcp` to see token costs per server. Disconnect servers you're not actively using.

### Subagents

**When:** On demand, when you or CSC spawns one for a task.

**What loads:** Fresh, isolated context containing:

* The system prompt (shared with parent for cache efficiency)
* Full content of Skills listed in the agent's `skills:` field
* CLAUDE.md and git status (inherited from parent)
* Whatever context the lead agent passes in the prompt

**Context cost:** Isolated from main session. Subagents don't inherit your conversation history or invoked Skills.

> **Tip:** Use Subagents for work that doesn't need your full conversation context. Their isolation prevents bloating your main session.

### Hooks

**When:** On trigger. Hooks fire at specific lifecycle events like tool execution, session boundaries, prompt submission, permission requests, and compaction. See Hooks for the full list.

**What loads:** Nothing by default. Hooks run as external scripts.

**Context cost:** Zero, unless the Hook returns output that gets added as messages to your conversation.

> **Tip:** Hooks are ideal for side effects (linting, logging) that don't need to affect CSC's context.
