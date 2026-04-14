---
sidebar_position: 1
---

# How CSC works

> Understand the agentic loop, built-in tools, and how CSC interacts with your project.

CSC is an agentic assistant that runs in your terminal. While it excels at coding, it can help with anything you can do from the command line: writing docs, running builds, searching files, researching topics, and more.

This guide covers the core architecture, built-in capabilities, and tips for working effectively with CSC. For step-by-step walkthroughs, see Common workflows. For extensibility features like skills, MCP, and hooks, see Extend CSC.

## The agentic loop

When you give CSC a task, it works through three phases: **gather context**, **take action**, and **verify results**. These phases blend together. CSC uses tools throughout, whether searching files to understand your code, editing to make changes, or running tests to check its work.

The loop adapts to what you ask. A question about your codebase might only need context gathering. A bug fix cycles through all three phases repeatedly. A refactor might involve extensive verification. CSC decides what each step requires based on what it learned from the previous step, chaining dozens of actions together and course-correcting along the way.

You're part of this loop too. You can interrupt at any point to steer CSC in a different direction, provide additional context, or ask it to try a different approach. CSC works autonomously but stays responsive to your input.

The agentic loop is powered by two components: models that reason and tools that act. CSC serves as the **agentic harness** around the LLM: it provides the tools, context management, and execution environment that turn a language model into a capable coding agent.

### Tools

Tools are what make CSC agentic. Without tools, the LLM can only respond with text. With tools, the LLM can act: read your code, edit files, run commands, search the web, and interact with external services. Each tool use returns information that feeds back into the loop, informing the LLM's next decision.

The built-in tools generally fall into five categories, each representing a different kind of agency.

| Category              | What CSC can do                                                                 |
| --------------------- | -------------------------------------------------------------------------------- |
| **File operations**   | Read files, edit code, create new files, rename and reorganize                   |
| **Search**            | Find files by pattern, search content with regex, explore codebases              |
| **Execution**         | Run shell commands, start servers, run tests, use git                            |
| **Web**               | Search the web, fetch documentation, look up error messages                     |
| **Code intelligence** | See type errors and warnings after edits, jump to definitions, find references (requires code intelligence plugins) |

These are the primary capabilities. CSC also has tools for spawning subagents, asking you questions, and other orchestration tasks. See Tools available to CSC for the complete list.

CSC chooses which tools to use based on your prompt and what it learns along the way. When you say "fix the failing tests," CSC might:

1. Run the test suite to see what's failing
2. Read the error output
3. Search for the relevant source files
4. Read those files to understand the code
5. Edit the files to fix the issue
6. Run the tests again to verify

Each tool use gives CSC new information that informs the next step. This is the agentic loop in action.

**Extending the base capabilities:** The built-in tools are the foundation. You can extend what CSC knows with skills, connect to external services with MCP, automate workflows with hooks, and offload tasks to subagents. These extensions form a layer on top of the core agentic loop.

## What CSC can access

When you run `csc` in a directory, CSC gains access to:

* **Your project.** Files in your directory and subdirectories, plus files elsewhere with your permission.
* **Your terminal.** Any command you could run: build tools, git, package managers, system utilities, scripts. If you can do it from the command line, CSC can too.
* **Your git state.** Current branch, uncommitted changes, and recent commit history.
* **Your CLAUDE.md.** A markdown file where you store project-specific instructions, conventions, and context that CSC should know every session.
* **Auto memory.** Learnings CSC saves automatically as you work, like project patterns and your preferences. The first 200 lines or 25KB of MEMORY.md, whichever comes first, load at the start of each session.
* **Extensions you configure.** MCP servers for external services, skills for workflows, subagents for delegated work, and CSC in Chrome for browser interaction.

Because CSC sees your whole project, it can work across it. When you ask CSC to "fix the authentication bug," it searches for relevant files, reads multiple files to understand context, makes coordinated edits across them, runs tests to verify the fix, and commits the changes if you ask. This is different from inline code assistants that only see the current file.

## Work with sessions

CSC saves your conversation locally as you work. Each message, tool use, and result is written to a plaintext JSONL file under `~/.claude/projects/`, which enables rewinding changes, resuming, and forking sessions. Before Claude makes code changes, it also snapshots the affected files so you can revert if needed. For paths, retention, and how to clear this data, see application data in `~/.claude`.

**Sessions are independent.** Each new session starts with a fresh context window, without the conversation history from previous sessions. Claude can persist learnings across sessions using auto memory, and you can add your own persistent instructions in CLAUDE.md.

### Work across branches

Each CSC conversation is a session tied to your current directory. When you resume, you only see sessions from that directory.

CSC sees your current branch's files. When you switch branches, CSC sees the new branch's files, but your conversation history stays the same. CSC remembers what you discussed even after switching.

Since sessions are tied to directories, you can run parallel CSC sessions by using git worktrees, which create separate directories for individual branches.

### Resume or fork sessions

When you resume a session with `csc --continue` or `csc --resume`, you pick up where you left off using the same session ID. New messages append to the existing conversation. Your full conversation history is restored, but session-scoped permissions are not. You'll need to re-approve those.

To branch off and try a different approach without affecting the original session, use the `--fork-session` flag:

```bash
csc --continue --fork-session
```

This creates a new session ID while preserving the conversation history up to that point. The original session remains unchanged. Like resume, forked sessions don't inherit session-scoped permissions.

**Same session in multiple terminals**: If you resume the same session in multiple terminals, both terminals write to the same session file. Messages from both get interleaved, like two people writing in the same notebook. Nothing corrupts, but the conversation becomes jumbled. Each terminal only sees its own messages during the session, but if you resume that session later, you'll see everything interleaved. For parallel work from the same starting point, use `--fork-session` to give each terminal its own clean session.

### The context window

CSC's context window holds your conversation history, file contents, command outputs, CLAUDE.md, auto memory, loaded skills, and system instructions. As you work, context fills up. CSC compacts automatically, but instructions from early in the conversation can get lost. Put persistent rules in CLAUDE.md, and run `/context` to see what's using space.

For an interactive walkthrough of what loads and when, see Explore the context window.

#### When context fills up

CSC manages context automatically as you approach the limit. It clears older tool outputs first, then summarizes the conversation if needed. Your requests and key code snippets are preserved; detailed instructions from early in the conversation may be lost. Put persistent rules in CLAUDE.md rather than relying on conversation history.

To control what's preserved during compaction, add a "Compact Instructions" section to CLAUDE.md or run `/compact` with a focus (like `/compact focus on the API changes`).

If a single file or tool output is so large that context refills immediately after each summary, CSC stops auto-compacting after a few attempts and shows an error instead of looping. See Auto-compaction stops with a thrashing error for recovery steps.

Run `/context` to see what's using space. MCP tool definitions are deferred by default and loaded on demand via tool search, so only tool names consume context until CSC uses a specific tool. Run `/mcp` to check per-server costs.

#### Manage context with skills and subagents

Beyond compaction, you can use other features to control what loads into context.

Skills load on demand. CSC sees skill descriptions at session start, but the full content only loads when a skill is used. For skills you invoke manually, set `disable-model-invocation: true` to keep descriptions out of context until you need them.

Subagents get their own fresh context, completely separate from your main conversation. Their work doesn't bloat your context. When done, they return a summary. This isolation is why subagents help with long sessions.

## Stay safe with checkpoints and permissions

CSC has two safety mechanisms: checkpoints let you undo file changes, and permissions control what CSC can do without asking.

### Undo changes with checkpoints

**Every file edit is reversible.** Before CSC edits any file, it snapshots the current contents. If something goes wrong, press `Esc` twice to rewind to a previous state, or ask CSC to undo.

Checkpoints are local to your session, separate from git. They only cover file changes. Actions that affect remote systems (databases, APIs, deployments) can't be checkpointed, which is why CSC asks before running commands with external side effects.

### Control what CSC can do

Press `Shift+Tab` to cycle through permission modes:

* **Default**: CSC asks before file edits and shell commands
* **Auto-accept edits**: CSC edits files and runs common filesystem commands like `mkdir` and `mv` without asking, still asks for other commands
* **Plan mode**: CSC uses read-only tools only, creating a plan you can approve before execution
* **Auto mode**: CSC evaluates all actions with background safety checks. Currently a research preview

You can also allow specific commands in `.claude/settings.json` so CSC doesn't ask each time. This is useful for trusted commands like `npm test` or `git status`. Settings can be scoped from organization-wide policies down to personal preferences. See Permissions for details.

***

## Work effectively with CSC

These tips help you get better results from CSC.

### Ask CSC for help

CSC can teach you how to use it. Ask questions like "how do I set up hooks?" or "what's the best way to structure my CLAUDE.md?" and CSC will explain.

Built-in commands also guide you through setup:

* `/init` walks you through creating a CLAUDE.md for your project
* `/agents` helps you configure custom subagents
* `/doctor` diagnoses common issues with your installation

### It's a conversation

CSC is conversational. You don't need perfect prompts. Start with what you want, then refine:

```text
Fix the login bug
```

\[CSC investigates, tries something]

```text
That's not quite right. The issue is in the session handling.
```

\[CSC adjusts approach]

When the first attempt isn't right, you don't start over. You iterate.

#### Interrupt and steer

You can interrupt CSC at any point. If it's going down the wrong path, just type your correction and press Enter. CSC will stop what it's doing and adjust its approach based on your input. You don't have to wait for it to finish or start over.

### Be specific upfront

The more precise your initial prompt, the fewer corrections you'll need. Reference specific files, mention constraints, and point to example patterns.

```text
The checkout flow is broken for users with expired cards.
Check src/payments/ for the issue, especially token refresh.
Write a failing test first, then fix it.
```

Vague prompts work, but you'll spend more time steering. Specific prompts like the one above often succeed on the first attempt.

### Give CSC something to verify against

CSC performs better when it can check its own work. Include test cases, paste screenshots of expected UI, or define the output you want.

```text
Implement validateEmail. Test cases: 'user@example.com' → true,
'invalid' → false, 'user@.com' → false. Run the tests after.
```

For visual work, paste a screenshot of the design and ask CSC to compare its implementation against it.

### Explore before implementing

For complex problems, separate research from coding. Use plan mode (press `Shift+Tab` twice) to analyze the codebase first:

```text
Read src/auth/ and understand how we handle sessions.
Then create a plan for adding OAuth support.
```

Review the plan, refine it through conversation, then let CSC implement. This two-phase approach produces better results than jumping straight to code.

### Delegate, don't dictate

Think of delegating to a capable colleague. Give context and direction, then trust Claude to figure out the details:

```text
The checkout flow is broken for users with expired cards.
The relevant code is in src/payments/. Can you investigate and fix it?
```

You don't need to specify which files to read or what commands to run. CSC figures that out.
