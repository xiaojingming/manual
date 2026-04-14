---
sidebar_position: 3
---

# Explore the .claude directory

> Where CSC reads CLAUDE.md, settings.json, hooks, Skills, Subagents, commands, rules, and auto memory. Explore the .claude directory in your project and ~/.claude in your home directory.

CSC reads instructions, settings, Skills, Subagents, and memory from your project directory and from `~/.claude` in your home directory. Commit project files to git to share with your team; files in `~/.claude` are personal configuration that applies to all your projects.

If you set `CLAUDE_CONFIG_DIR`, every `~/.claude` path on this page will be under that directory instead.

Most users only need to edit `CLAUDE.md` and `settings.json`. The rest of the directory is optional: add Skills, rules, or Subagents as needed.

## Project-level files

The following files live in your project directory.

### CLAUDE.md

**Summary:** Project instructions CSC reads every session

**When loaded:** Loaded into context at the start of every session

**Description:** Project-specific instructions that shape how CSC works in this repository. Put your conventions, common commands, and architectural context here so CSC operates with the same assumptions your team does.

**Tips:**

- Target under 200 lines. Longer files still load in full but may reduce adherence
- CLAUDE.md loads into every session. If something only matters for specific tasks, move it to a Skill or a path-scoped rule so it loads only when needed
- List the commands you run most, like build, test, and format, so CSC knows them without you spelling them out each time
- Run `/memory` to open and edit CLAUDE.md from within a session
- Also works at `.claude/CLAUDE.md` if you prefer to keep the project root clean

**Example intro:** This example is for a TypeScript and React project. It lists the build and test commands, the framework conventions CSC should follow, and project-specific rules like export style and file layout.

```markdown
# Project conventions

## Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Stack
- TypeScript with strict mode
- React 19, functional components only

## Rules
- Named exports, never default exports
- Tests live next to source: `foo.ts` -> `foo.test.ts`
- All API routes return `{ data, error }` shape
```

---

### .mcp.json

**Summary:** Project-scoped MCP servers, shared with your team

**When loaded:** Servers connect when the session begins. Tool schemas are deferred by default and load on demand via tool search

**Description:** Configures Model Context Protocol (MCP) servers that give CSC access to external tools: databases, APIs, browsers, and more. This file holds the project-scoped servers your whole team uses. Personal servers you want to keep to yourself go in `~/.claude.json` instead.

**Tips:**

- Use environment variable references for secrets: `${GITHUB_TOKEN}`
- Lives at the project root, not inside `.claude/`
- For servers only you need, run `csc mcp add --scope user`. This writes to `~/.claude.json` instead of `.mcp.json`

**Example intro:** This example configures the GitHub MCP server so CSC can read issues and open pull requests. The `${GITHUB_TOKEN}` reference is read from your shell environment when CSC starts the server, so the token never lands in the file.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

### .worktreeinclude

**Summary:** Gitignored files to copy into new worktrees

**When loaded:** Read when CSC creates a git worktree via `--worktree`, the `EnterWorktree` tool, or Subagent `isolation: worktree`

**Description:** Lists gitignored files to copy from your main repository into each new worktree. Worktrees are fresh checkouts, so untracked files like `.env` are missing by default. Patterns here use `.gitignore` syntax. Only files that match a pattern and are also gitignored get copied, so tracked files are never duplicated.

**Tips:**
- Lives at the project root, not inside `.claude/`
- Git-only: if you configure a WorktreeCreate hook for a different VCS, this file is not read. Copy files inside your hook script instead
- Also applies to parallel sessions in the desktop app

**Example intro:** This example copies your local environment files and a secrets config into every worktree CSC creates. Comments start with # and blank lines are ignored, same as .gitignore.

```
# Local environment
.env
.env.local

# API credentials
config/secrets.json
```

---

## Project .claude/ directory

Project-level configuration, rules, and extensions. Everything CSC reads that is specific to this project. If you use git, commit most files here so your team shares them; a few, like settings.local.json, are automatically gitignored.

### settings.json

**Summary:** Permissions, hooks, and configuration

**When loaded:** Overrides global `~/.claude/settings.json`. Local settings, CLI flags, and managed settings override this

**Description:** Settings that CSC applies directly. Permissions control which commands and tools CSC can use; hooks run your scripts at specific points in a session. Unlike CLAUDE.md, which CSC reads as guidance, these are enforced whether CSC follows them or not.

**Common keys:**
- permissions: allow, deny, or prompt before CSC uses specific tools or commands
- hooks: run your own scripts on events like before a tool call or after a file edit
- statusLine: customize the line shown at the bottom while CSC works
- model: pick a default model for this project
- env: environment variables set in every session
- outputStyle: select a custom system-prompt style from output-styles/

**Tips:**
- Bash permission patterns support wildcards: `Bash(npm test *)` matches any command starting with `npm test`
- Array settings like `permissions.allow` combine across all scopes; scalar settings like `model` use the most specific value

**Example intro:** This example allows `npm test` and `npm run` commands without prompting, blocks `rm -rf`, and runs Prettier on files after CSC edits or writes them.

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test *)",
      "Bash(npm run *)"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
      }]
    }]
  }
}
```

---

### settings.local.json

**Summary:** Your personal settings overrides for this project

**When loaded:** Highest of the user-editable settings files; CLI flags and managed settings still take precedence

**Description:** Personal settings that take precedence over the project defaults. Same JSON format as settings.json, but not committed. Use this when you need different permissions or defaults than the team config.

**Tips:**
- Same schema as settings.json. Array settings like `permissions.allow` combine across scopes; scalar settings like `model` use the local value
- CSC adds this file to `~/.config/git/ignore` the first time it writes one. If you use a custom `core.excludesFile`, add the pattern there too. To share the ignore rule with your team, also add it to the project `.gitignore`

**Example intro:** This example adds Docker permissions on top of whatever the team settings.json allows.

```json
{
  "permissions": {
    "allow": [
      "Bash(docker *)"
    ]
  }
}
```

---

### rules/

**Summary:** Topic-scoped instructions, optionally gated by file paths

**When loaded:** Rules without `paths:` load at session start. Rules with `paths:` load when a matching file enters context

**Description:** Project instructions split into topic files that can load conditionally based on file paths. A rule without `paths:` frontmatter loads at session start like CLAUDE.md; a rule with `paths:` loads only when CSC reads a matching file.

Like CLAUDE.md, rules are guidance CSC reads, not configuration CSC enforces. For guaranteed behavior, use hooks or permissions.

**Tips:**
- Use `paths:` frontmatter with globs to scope rules to directories or file types
- Subdirectories work: `.claude/rules/frontend/react.md` is discovered automatically
- When CLAUDE.md approaches 200 lines, start splitting into rules

---

#### testing.md

**Summary:** Test conventions scoped to test files

**When loaded:** Loaded when CSC reads a file matching the `paths:` globs below

**Description:** An example rule that only loads when CSC is working on test files. The `paths:` globs in the frontmatter define which files trigger it; here, anything ending in .test.ts or .test.tsx. For other files, this rule is not loaded into context.

```yaml
---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Testing Rules

- Use descriptive test names: "should [expected] when [condition]"
- Mock external dependencies, not internal modules
- Clean up side effects in afterEach
```

---

#### api-design.md

**Summary:** API conventions scoped to backend code

**When loaded:** Loaded when CSC reads a file matching the `paths:` glob below

**Description:** A second example showing a rule scoped to backend code. The `paths:` glob matches files under src/api/, so these conventions load only when CSC is editing API routes.

```yaml
---
paths:
  - "src/api/**/*.ts"
---

# API Design Rules

- All endpoints must validate input with Zod schemas
- Return shape: { data: T } | { error: string }
- Rate limit all public endpoints
```

---

### skills/

**Summary:** Reusable prompts you or CSC invoke by name

**When loaded:** Invoked with `/skill-name` or when CSC matches the task to a Skill

**Description:** Each Skill is a folder with a SKILL.md file plus any supporting files it needs. By default, both you and CSC can invoke a Skill. Use frontmatter to control that: `disable-model-invocation: true` for user-only workflows like `/deploy`, or `user-invocable: false` to hide from the `/` menu while CSC can still invoke it.

**Tips:**
- Skills accept arguments: `/deploy staging` passes "staging" as `$ARGUMENTS`. Use `$0`, `$1`, and so on for positional access
- The `description` frontmatter determines when CSC auto-invokes the Skill
- Bundle reference docs alongside SKILL.md. CSC knows the Skill directory path and can read supporting files when you mention them

---

#### security-review/ Skill

**Summary:** A Skill bundling SKILL.md with supporting files

##### SKILL.md

**Badge:** committed

**Summary:** Entrypoint: trigger, invocability, instructions

**When loaded:** User types `/security-review <target>`; CSC cannot auto-invoke this Skill

**Description:** This Skill uses `disable-model-invocation: true` so only you can trigger it; CSC never invokes it on its own.

The `!`...`` line runs a shell command and injects its output into the prompt. `$ARGUMENTS` substitutes whatever you typed after the Skill name. CSC sees the Skill directory path, so mentioning a bundled file like checklist.md lets CSC read it.

```markdown
---
description: Reviews code changes for security vulnerabilities, authentication gaps, and injection risks
disable-model-invocation: true
argument-hint: <branch-or-path>
---

## Diff to review

!`git diff $ARGUMENTS`

Audit the changes above for:

1. Injection vulnerabilities (SQL, XSS, command)
2. Authentication and authorization gaps
3. Hardcoded secrets or credentials

Use checklist.md in this skill directory for the full review checklist.

Report findings with severity ratings and remediation steps.
```

---

##### checklist.md

**Summary:** Supporting file bundled with the Skill

**When loaded:** CSC reads it on demand while running the Skill

**Description:** Skills can bundle any supporting files: reference docs, templates, scripts. The Skill directory path is prepended to SKILL.md, so CSC can read bundled files by name. For scripts in bash injection commands, use the `${CLAUDE_SKILL_DIR}` placeholder.

```markdown
# Security Review Checklist

## Input Validation
- [ ] All user input sanitized before DB queries
- [ ] File upload MIME types validated
- [ ] Path traversal prevented on file operations

## Authentication
- [ ] JWT tokens expire after 24 hours
- [ ] API keys stored in environment variables
- [ ] Passwords hashed with bcrypt or argon2
```

---

### commands/

> **Tip:** Commands and Skills are now the same mechanism. For new workflows, use skills/ instead: same `/name` invocation, plus you can bundle supporting files.

**Summary:** Single-file prompts invoked with `/name`

**When loaded:** User types `/command-name`

**Description:** A file at `commands/deploy.md` creates `/deploy` the same way a Skill at `skills/deploy/SKILL.md` does, and both can be auto-invoked by CSC. Skills use a directory with SKILL.md, letting you bundle reference docs, templates, or scripts alongside the prompt.

**Tips:**
- Use `$ARGUMENTS` in the file to accept parameters: `/fix-issue 123`
- If a Skill and command share a name, the Skill takes precedence
- New commands should usually be Skills instead; commands remain supported

---

#### fix-issue.md

> **Tip:** Commands and Skills are now the same mechanism. For new workflows, use skills/ instead: same `/name` invocation, plus you can bundle supporting files.

**Summary:** Invoked as `/fix-issue <number>`

**Description:** An example command for fixing a GitHub issue. Type `/fix-issue 123` and the `!`...`` line runs `gh issue view 123` in your shell, injecting the output into the prompt before CSC sees it.

`$ARGUMENTS` substitutes whatever you typed after the command name. For positional access, use `$0` `$1` and so on.

```markdown
---
argument-hint: <issue-number>
---

!`gh issue view $ARGUMENTS`

Investigate and fix the issue above.

1. Trace the bug to its root cause
2. Implement the fix
3. Write or update tests
4. Summarize what you changed and why
```

---

### output-styles/

**Summary:** Project-scoped output styles, if your team shares any

**When loaded:** Applied at session start when selected via the outputStyle setting

**Description:** Output styles are usually personal, so most live in `~/.claude/output-styles/`. Put one here if your team shares a style, like a review mode everyone uses. See the Global section for the full explanation and example.

---

### agents/

**Summary:** Specialized Subagents with their own context window

**When loaded:** Runs in its own context window when you or CSC invoke it

**Description:** Each markdown file defines a Subagent with its own system prompt, tool access, and optionally its own model. Subagents run in a fresh context window, keeping the main conversation clean. Useful for parallel work or isolated tasks.

**Tips:**
- Each agent gets a fresh context window, separate from your main session
- Restrict tool access per agent with the `tools:` frontmatter field
- Type @ and pick an agent from the autocomplete to delegate directly

---

#### code-reviewer.md

**Summary:** Subagent for isolated code review

**When loaded:** CSC spawns it for review tasks, or you @-mention it from the autocomplete

**Description:** An example Subagent restricted to read-only tools. The `description` frontmatter tells CSC when to delegate to it automatically; `tools:` limits it to Read, Grep, and Glob so it can inspect code but never edit. The body becomes the Subagent's system prompt.

```markdown
---
name: code-reviewer
description: Reviews code for correctness, security, and maintainability
tools: Read, Grep, Glob
---

You are a senior code reviewer. Review for:

1. Correctness: logic errors, edge cases, null handling
2. Security: injection, auth bypass, data exposure
3. Maintainability: naming, complexity, duplication

Every finding must include a concrete fix.
```

---

### agent-memory/

**Badge:** committed / CSC auto-writes

**Summary:** Subagent persistent memory, separate from your main session auto memory

**When loaded:** First 200 lines (capped at 25KB) of MEMORY.md loaded into the Subagent system prompt when it runs

**Description:** Subagents with `memory: project` in their frontmatter get a dedicated memory directory here. This is distinct from your main session auto memory at `~/.claude/projects/`: each Subagent reads and writes its own MEMORY.md, not yours.

**Tips:**
- Only created for Subagents that set the `memory:` frontmatter field
- This directory holds project-scoped Subagent memory, meant to be shared with your team. To keep memory out of version control use `memory: local`, which writes to `.claude/agent-memory-local/` instead. For cross-project memory use `memory: user`, which writes to `~/.claude/agent-memory/`
- The main session auto memory is a different feature; see `~/.claude/projects/` in the Global section

---

#### \<agent-name\>/MEMORY.md

**Badge:** committed / CSC auto-writes

**Summary:** The Subagent writes and maintains this file automatically

**When loaded:** Loaded into the Subagent system prompt when the Subagent starts

**Description:** Works the same as your main auto memory: the Subagent creates and updates this file itself. You do not write it. The Subagent reads it at the start of each task and writes back what it learns.

```markdown
# code-reviewer memory

## Patterns seen
- Project uses custom Result<T, E> type, not exceptions
- Auth middleware expects Bearer token in Authorization header
- Tests use factory functions in test/factories/

## Recurring issues
- Missing null checks on API responses (src/api/*)
- Unhandled promise rejections in background jobs
```

---

## Global-level files

The following files live in `~/` (your home directory).

### ~/.claude.json

**Badge:** local only

**Summary:** App state and UI preferences

**When loaded:** Read at session start for your preferences and MCP servers. CSC writes back to it when you change settings in `/config` or approve trust prompts

**Description:** Holds state that does not belong in settings.json: theme, OAuth session, per-project trust decisions, your personal MCP servers, and UI toggles. Mostly managed through `/config` rather than editing directly.

**Tips:**
- UI toggles like `showTurnDuration` and `terminalProgressBarEnabled` live here, not in settings.json
- The `projects` key tracks per-project state like trust-dialog acceptance and last-session metrics. Permission rules you approve in-session go to `.claude/settings.local.json` instead
- MCP servers here are yours only: user scope applies across all projects, local scope is per-project but not committed. Team-shared servers go in `.mcp.json` at the project root instead

```json
{
  "editorMode": "vim",
  "showTurnDuration": false,
  "mcpServers": {
    "my-tools": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"]
    }
  }
}
```

---

## Global ~/.claude/ directory

Your personal configuration across all projects. The global counterpart to your project .claude/ directory. Files here apply to every project you work in and are never committed to any repository.

### CLAUDE.md

**Summary:** Personal preferences across every project

**When loaded:** Loaded at the start of every session, in every project

**Description:** Your global instruction file. Loaded alongside the project CLAUDE.md at session start, so both are in context together. When instructions conflict, project-level instructions take priority. Keep this to preferences that apply everywhere: response style, commit format, personal conventions.

**Tips:**
- Keep it short since it loads into context for every project, alongside that project's own CLAUDE.md
- Good for response style, commit format, and personal conventions

```markdown
# Global preferences

- Keep explanations concise
- Use conventional commit format
- Show the terminal command to verify changes
- Prefer composition over inheritance
```

---

### settings.json

**Summary:** Default settings for all projects

**When loaded:** Your defaults. Project and local settings.json override any keys you also set there

**Description:** Same keys as project `settings.json`: permissions, hooks, model, environment variables, and the rest. Put settings here that you want in every project, like permissions you always allow, a preferred model, or a notification hook that runs regardless of which project you're in.

Settings follow a precedence order: project `settings.json` overrides any matching keys you set here. This is different from CLAUDE.md, where global and project files are both loaded into context rather than merged key by key.

```json
{
  "permissions": {
    "allow": [
      "Bash(git log *)",
      "Bash(git diff *)"
    ]
  }
}
```

---

### keybindings.json

**Summary:** Custom keyboard shortcuts

**When loaded:** Read at session start and hot-reloaded when you edit the file

**Description:** Rebind keyboard shortcuts in the interactive CLI. Run `/keybindings` to create or open this file with a schema reference. Ctrl+C, Ctrl+D, and Ctrl+M are reserved and cannot be rebound.

**Example intro:** This example binds `Ctrl+E` to open your external editor and unbinds `Ctrl+U` by setting it to `null`. The `context` field scopes bindings to a specific part of the CLI, here the main chat input.

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

---

### projects/

**Summary:** Auto memory: CSC's notes to itself, per project

**When loaded:** MEMORY.md loaded at session start; topic files read on demand

**Description:** Auto memory lets CSC accumulate knowledge across sessions without you writing anything. CSC saves notes as it works: build commands, debugging insights, architecture notes. Each project gets its own memory directory keyed by the repository path.

**Tips:**
- On by default. Toggle with `/memory` or `autoMemoryEnabled` in settings
- MEMORY.md is the index loaded each session. The first 200 lines, or 25KB, whichever comes first, are read
- Topic files like debugging.md are read on demand, not at startup
- These are plain markdown. Edit or delete them anytime

---

#### \<project\>/memory/MEMORY.md

**Summary:** CSC writes and maintains this file automatically

**When loaded:** First 200 lines (capped at 25KB) loaded at session start

**Description:** CSC creates and updates this file as it works; you do not write it yourself. It acts as an index that CSC reads at the start of every session, pointing to topic files for detail. You can edit or delete it, but CSC will keep updating it.

```markdown
# Memory Index

## Project
- build-and-test.md: npm run build (~45s), Vitest, dev server on 3001
- architecture.md: API client singleton, refresh-token auth

## Reference
- debugging.md: auth token rotation and DB connection troubleshooting
```

---

#### \<project\>/memory/debugging.md

**Summary:** Topic notes CSC writes when MEMORY.md gets long

**When loaded:** CSC reads this when a related task comes up

**Description:** An example of a topic file CSC creates when MEMORY.md grows too long. CSC picks the filename based on what it splits out: debugging.md, architecture.md, build-commands.md, or similar. You never create these yourself. CSC reads a topic file back only when the current task relates to it.

```yaml
---
name: Debugging patterns
description: Auth token rotation and database connection troubleshooting for this project
type: reference
---

## Auth Token Issues
- Refresh token rotation: old token invalidated immediately
- If 401 after refresh: check clock skew between client and server

## Database Connection Drops
- Connection pool: max 10 in dev, 50 in prod
- Always check `docker compose ps` first
```

---

### rules/

**Summary:** User-level rules that apply to every project

**When loaded:** Rules without `paths:` load at session start. Rules with `paths:` load when a matching file enters context

**Description:** Same as project .claude/rules/ but applies everywhere. Use this for conventions you want across all your work, like personal code style or commit message format.

---

### skills/

**Summary:** Personal Skills available in every project

**When loaded:** Invoked with `/skill-name` in any project

**Description:** Skills you built for yourself that work everywhere. Same structure as project Skills: each is a folder with SKILL.md, scoped to your user account instead of a single project.

---

### commands/

> **Tip:** Commands and Skills are now the same mechanism. For new workflows, use skills/ instead: same `/name` invocation, plus you can bundle supporting files.

**Summary:** Personal single-file commands available in every project

**When loaded:** User types `/command-name` in any project

**Description:** Same as project commands/ but scoped to your user account. Each markdown file becomes a command available everywhere.

---

### output-styles/

**Summary:** Custom system-prompt sections that adjust how CSC works

**When loaded:** Applied at session start when selected via the outputStyle setting

**Description:** Each markdown file defines an output style: a section appended to the system prompt that, by default, also drops the built-in software-engineering task instructions. Use this to adapt CSC for uses beyond coding, or to add teaching or review modes.

Select a built-in or custom style with `/config` or the `outputStyle` key in settings. Styles here are available in every project; project-level styles with the same name take precedence.

**Tips:**
- Built-in styles Explanatory and Learning are included with CSC; custom styles go here
- Set `keep-coding-instructions: true` in frontmatter to keep the default task instructions alongside your additions
- Changes take effect on the next session since the system prompt is fixed at startup for caching

---

#### teaching.md

**Summary:** Example style that adds explanations and leaves small changes for you

**When loaded:** Active when `outputStyle` in settings is set to `teaching`

**Description:** This style appends instructions to the system prompt: CSC adds a "Why this approach" note after each task and leaves TODO(human) markers for changes under 10 lines instead of writing them itself. Select it by setting `outputStyle` to the filename without .md, or to the `name` field if you set one in frontmatter.

```markdown
---
description: Explains reasoning and asks you to implement small pieces
keep-coding-instructions: true
---

After completing each task, add a brief "Why this approach" note
explaining the key design decision.

When a change is under 10 lines, ask the user to implement it
themselves by leaving a TODO(human) marker instead of writing it.
```

---

### agents/

**Summary:** Personal Subagents available in every project

**When loaded:** CSC delegates or you @-mention in any project

**Description:** Subagents defined here are available across all your projects. Same format as project agents.

---

### agent-memory/

**Summary:** Persistent memory for Subagents with `memory: user`

**When loaded:** Loaded into the Subagent system prompt when the Subagent starts

**Description:** Subagents with `memory: user` in their frontmatter store knowledge here that persists across all projects. For project-scoped Subagent memory, see `.claude/agent-memory/` instead.

---

## What's not shown

This page covers files you write and edit. Some related files live elsewhere:

| File | Location | Purpose |
| --- | --- | --- |
| `managed-settings.json` | System-level, varies by OS | Enterprise-enforced settings you cannot override. See managed settings |
| `CLAUDE.local.md` | Project root | Your private preferences for this project, loaded alongside CLAUDE.md. Create manually and add to `.gitignore` |
| Installed Plugins | `~/.claude/plugins/` | Cloned marketplaces, installed Plugin versions, and per-Plugin data, managed by the `csc plugin` command. Orphaned versions are deleted 7 days after a Plugin is updated or uninstalled. See Plugin cache |

`~/.claude` also holds data CSC writes as it works: transcripts, prompt history, file snapshots, caches, and logs. See Application data below.

## File reference

This table lists every file the page covers. Project-scoped files live under your repo's `.claude/` (or at the root for `CLAUDE.md`, `.mcp.json`, and `.worktreeinclude`). Global-scoped files live in `~/.claude/` and apply to all projects.

> **Note:** A few things can override what you put in these files:
> - Managed settings deployed by your organization take precedence over everything
> - CLI flags like `--permission-mode` or `--settings` override `settings.json` for that session
> - Some environment variables take precedence over their setting equivalents, but this varies case by case: check the environment variable reference for each
>
> For the full order, see settings precedence.

| File | Scope | Committed | Role |
| --- | --- | --- | --- |
| `CLAUDE.md` | Project and global | ✓ | Instructions loaded every session |
| `rules/*.md` | Project and global | ✓ | Topic-scoped instructions, optionally gated by path |
| `settings.json` | Project and global | ✓ | Permissions, hooks, env vars, model defaults |
| `settings.local.json` | Project only | | Your personal overrides, auto-gitignored |
| `.mcp.json` | Project only | ✓ | Team-shared MCP servers |
| `.worktreeinclude` | Project only | ✓ | Gitignored files to copy to new worktrees |
| `skills/<name>/SKILL.md` | Project and global | ✓ | Reusable prompts invoked with `/name` or auto-invoked |
| `commands/*.md` | Project and global | ✓ | Single-file prompts; same mechanism as skills |
| `output-styles/*.md` | Project and global | ✓ | Custom system-prompt sections |
| `agents/*.md` | Project and global | ✓ | Subagent definitions with their own prompt and tools |
| `agent-memory/<name>/` | Project and global | ✓ | Persistent memory for Subagents |
| `~/.claude.json` | Global only | | App state, OAuth, UI toggles, personal MCP servers |
| `projects/<project>/memory/` | Global only | | Auto memory: CSC's notes to itself across sessions |
| `keybindings.json` | Global only | | Custom keyboard shortcuts |

## Check what's loaded

This page shows which files can exist. To see what's actually loaded in the current session, use these commands:

| Command | Shows |
| --- | --- |
| `/context` | Token usage by category: system prompt, memory files, Skills, MCP tools, and messages |
| `/memory` | Which CLAUDE.md and rules files are loaded, plus auto memory entries |
| `/agents` | Configured Subagents and their settings |
| `/hooks` | Active hook configuration |
| `/mcp` | Connected MCP servers and their status |
| `/skills` | Available Skills from project, user, and Plugin sources |
| `/permissions` | Current allow and deny rules |
| `/doctor` | Installation and configuration diagnostics |

Run `/context` first for an overview, then use specific commands to investigate the areas you care about.

## Application data

Beyond the configuration you write, `~/.claude` also holds data CSC writes during sessions. These files are plain text. Anything that passes through a tool gets written to transcripts on disk: file contents, command output, pasted text.

### Auto-cleanup

Files in the following paths are deleted at startup once they exceed the number of days specified by `cleanupPeriodDays`. Defaults to 30 days.

| Path under `~/.claude/` | Contents |
| --- | --- |
| `projects/<project>/<session>.jsonl` | Full conversation transcripts: every message, tool call, and tool result |
| `projects/<project>/<session>/tool-results/` | Large tool outputs that spilled into separate files |
| `file-history/<session>/` | Pre-edit snapshots of files CSC changed, for checkpoint recovery |
| `plans/` | Plan files written in plan mode |
| `debug/` | Per-session debug logs, only written when launched with `--debug` or running `/debug` |
| `paste-cache/`, `image-cache/` | Contents of large pastes and attached images |
| `session-env/` | Per-session environment metadata |

### Kept until you delete

The following paths are not covered by auto-cleanup and will be retained indefinitely.

| Path under `~/.claude/` | Contents |
| --- | --- |
| `history.jsonl` | Every prompt you typed, with timestamps and project paths. Used for up-arrow recall. |
| `stats-cache.json` | Aggregated token and cost counts shown by `/cost` |
| `backups/` | Timestamped copies of `~/.claude.json` taken before config migrations |
| `todos/` | Legacy per-session task lists. Current versions no longer write here; safe to delete. |

`shell-snapshots/` holds runtime files that are deleted when sessions exit normally. Other small caches and lock files appear depending on which features you use and are safe to delete.

### Plaintext storage

Transcripts and history are not encrypted at rest. OS file permissions are the only protection. If a tool reads a `.env` file or a command prints credentials, that value gets written to `projects/<project>/<session>.jsonl`. To reduce exposure:

- Lower `cleanupPeriodDays` to shorten transcript retention
- In non-interactive mode, use `--no-session-persistence` with `-p` to skip writing transcripts entirely. In the Agent SDK, set `persistSession: false`. No equivalent for interactive mode.
- Use permission rules to deny reading credential files

### Clearing local data

You can delete any of the application data paths above at any time. New sessions are unaffected. The table below shows what past-session data you would lose.

| Delete | You lose |
| --- | --- |
| `~/.claude/projects/` | Resume, continue, and rollback of past sessions |
| `~/.claude/history.jsonl` | Up-arrow prompt recall |
| `~/.claude/file-history/` | Checkpoint recovery for past sessions |
| `~/.claude/stats-cache.json` | Historical totals shown by `/cost` |
| `~/.claude/backups/` | Rollback copies of `~/.claude.json` from past config migrations |
| `~/.claude/debug/`, `~/.claude/plans/`, `~/.claude/paste-cache/`, `~/.claude/image-cache/`, `~/.claude/session-env/` | No user-visible content |
| `~/.claude/todos/` | None. Legacy directory that current versions no longer write to. |

Do not delete `~/.claude.json`, `~/.claude/settings.json`, or `~/.claude/plugins/`: they hold your authentication, preferences, and installed Plugins.
