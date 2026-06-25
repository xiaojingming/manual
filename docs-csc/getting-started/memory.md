---
sidebar_position: 4
---

# How CSC remembers your project

> Give CSC persistent instructions with AGENTS.md files, and let CSC accumulate learnings automatically with auto memory.

Each CSC session begins with a fresh context window. Two mechanisms carry knowledge across sessions:

* **AGENTS.md files**: instructions you write to give CSC persistent context
* **Auto memory**: notes CSC writes itself based on your corrections and preferences

This page covers how to:

* Write and organize AGENTS.md files
* Scope rules to specific file types with `.costrict/rules/`
* Configure auto memory so CSC takes notes automatically
* Troubleshoot when instructions aren't being followed

## AGENTS.md vs auto memory

CSC has two complementary memory systems. Both are loaded at the start of every conversation. CSC treats them as context, not enforced configuration. The more specific and concise your instructions, the more consistently CSC follows them.

|                      | AGENTS.md files                                   | Auto memory                                                      |
| :------------------- | :------------------------------------------------ | :--------------------------------------------------------------- |
| **Who writes it**    | You                                               | CSC                                                              |
| **What it contains** | Instructions and rules                            | Learnings and patterns                                           |
| **Scope**            | Project, user, or org                             | Per working tree                                                 |
| **Loaded into**      | Every session                                     | Every session (first 200 lines or 25KB)                          |
| **Use for**          | Coding standards, workflows, project architecture | Build commands, debugging insights, preferences CSC discovers |

Use AGENTS.md files when you want to guide CSC's behavior. Auto memory lets CSC learn from your corrections without manual effort.

Subagents can also maintain their own auto memory. See subagent configuration for details.

## AGENTS.md files

AGENTS.md files are markdown files that give CSC persistent instructions for a project, your personal workflow, or your entire organization. You write these files in plain text; CSC reads them at the start of every session.

### When to add to AGENTS.md

Treat AGENTS.md as the place you write down what you'd otherwise re-explain. Add to it when:

* CSC makes the same mistake a second time
* A code review catches something CSC should have known about this codebase
* You type the same correction or clarification into chat that you typed last session
* A new teammate would need the same context to be productive

Keep it to facts CSC should hold in every session: build commands, conventions, project layout, "always do X" rules. If an entry is a multi-step procedure or only matters for one part of the codebase, move it to a skill or a path-scoped rule instead. The extension overview covers when to use each mechanism.

### Choose where to put AGENTS.md files

AGENTS.md files can live in several locations, each with a different scope. More specific locations take precedence over broader ones.

| Scope                    | Location                                                                                                                                                                | Purpose                                                    | Use case examples                                                    | Shared with                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------- |
| **Managed policy**       | • macOS: `/Library/Application Support/CoStrict/AGENTS.md`<br />• Linux and WSL: `/etc/costrict/AGENTS.md`<br />• Windows: `C:\Program Files\CoStrict\AGENTS.md` | Organization-wide instructions managed by IT/DevOps        | Company coding standards, security policies, compliance requirements | All users in organization       |
| **Project instructions** | `./AGENTS.md` or `./.costrict/AGENTS.md`                                                                                                                                  | Team-shared instructions for the project                   | Project architecture, coding standards, common workflows             | Team members via source control |
| **User instructions**    | `~/.costrict/AGENTS.md`                                                                                                                                                   | Personal preferences for all projects                      | Code styling preferences, personal tooling shortcuts                 | Just you (all projects)         |
| **Local instructions**   | `./AGENTS.local.md`                                                                                                                                                     | Personal project-specific preferences; add to `.gitignore` | Your sandbox URLs, preferred test data                               | Just you (current project)      |

AGENTS.md and AGENTS.local.md files in the directory hierarchy above the working directory are loaded in full at launch. Files in subdirectories load on demand when CSC reads files in those directories. See How AGENTS.md files load for the full resolution order.

For large projects, you can break instructions into topic-specific files using project rules. Rules let you scope instructions to specific file types or subdirectories.

### Set up a project AGENTS.md

A project AGENTS.md can be stored in either `./AGENTS.md` or `./.costrict/AGENTS.md`. Create this file and add instructions that apply to anyone working on the project: build and test commands, coding standards, architectural decisions, naming conventions, and common workflows. These instructions are shared with your team through version control, so focus on project-level standards rather than personal preferences.

> **💡 Tip:** Run `/init` to generate a starting AGENTS.md automatically. CSC analyzes your codebase and creates a file with build commands, test instructions, and project conventions it discovers. If a AGENTS.md already exists, `/init` suggests improvements rather than overwriting it. Refine from there with instructions CSC wouldn't discover on its own.
>
> Set `CLAUDE_CODE_NEW_INIT=1` to enable an interactive multi-phase flow. `/init` asks which artifacts to set up: AGENTS.md files, skills, and hooks. It then explores your codebase with a subagent, fills in gaps via follow-up questions, and presents a reviewable proposal before writing any files.

### Write effective instructions

AGENTS.md files are loaded into the context window at the start of every session, consuming tokens alongside your conversation. The context window visualization shows where AGENTS.md loads relative to the rest of the startup context. Because they're context rather than enforced configuration, how you write instructions affects how reliably CSC follows them. Specific, concise, well-structured instructions work best.

**Size**: target under 200 lines per AGENTS.md file. Longer files consume more context and reduce adherence. If your instructions are growing large, split them using imports or `.costrict/rules/` files.

**Structure**: use markdown headers and bullets to group related instructions. CSC scans structure the same way readers do: organized sections are easier to follow than dense paragraphs.

**Specificity**: write instructions that are concrete enough to verify. For example:

* "Use 2-space indentation" instead of "Format code properly"
* "Run `npm test` before committing" instead of "Test your changes"
* "API handlers live in `src/api/handlers/`" instead of "Keep files organized"

**Consistency**: if two rules contradict each other, CSC may pick one arbitrarily. Review your AGENTS.md files, nested AGENTS.md files in subdirectories, and `.costrict/rules/` periodically to remove outdated or conflicting instructions. In monorepos, use `costrictMdExcludes` to skip AGENTS.md files from other teams that aren't relevant to your work.

### Import additional files

AGENTS.md files can import additional files using `@path/to/import` syntax. Imported files are expanded and loaded into context at launch alongside the AGENTS.md that references them.

Both relative and absolute paths are allowed. Relative paths resolve relative to the file containing the import, not the working directory. Imported files can recursively import other files, with a maximum depth of five hops.

To pull in a README, package.json, and a workflow guide, reference them with `@` syntax anywhere in your AGENTS.md:

```text
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

For private per-project preferences that shouldn't be checked into version control, create a `AGENTS.local.md` at the project root. It loads alongside `AGENTS.md` and is treated the same way. Add `AGENTS.local.md` to your `.gitignore` so it isn't committed; running `/init` and choosing the personal option does this for you.

If you work across multiple git worktrees of the same repository, a gitignored `AGENTS.local.md` only exists in the worktree where you created it. To share personal instructions across worktrees, import a file from your home directory instead:

```text
# Individual Preferences
- @~/.costrict/my-project-instructions.md
```

> **⚠️ Warning:** The first time CSC encounters external imports in a project, it shows an approval dialog listing the files. If you decline, the imports stay disabled and the dialog does not appear again.

For a more structured approach to organizing instructions, see `.costrict/rules/`.

### AGENTS.md

CSC reads `AGENTS.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `AGENTS.md` that imports it so both tools read the same instructions without duplicating them. You can also add CSC-specific instructions below the import. CSC loads the imported file at session start, then appends the rest:

```markdown AGENTS.md
@AGENTS.md

## CSC

Use plan mode for changes under `src/billing/`.
```

### How AGENTS.md files load

CSC reads AGENTS.md files by walking up the directory tree from your current working directory, checking each directory along the way for `AGENTS.md` and `AGENTS.local.md` files. This means if you run CSC in `foo/bar/`, it loads instructions from `foo/bar/AGENTS.md`, `foo/AGENTS.md`, and any `AGENTS.local.md` files alongside them.

All discovered files are concatenated into context rather than overriding each other. Within each directory, `AGENTS.local.md` is appended after `AGENTS.md`, so when instructions conflict, your personal notes are the last thing CSC reads at that level.

CSC also discovers `AGENTS.md` and `AGENTS.local.md` files in subdirectories under your current working directory. Instead of loading them at launch, they are included when CSC reads files in those subdirectories.

If you work in a large monorepo where other teams' AGENTS.md files get picked up, use `costrictMdExcludes` to skip them.

Block-level HTML comments (`{/* maintainer notes */}`) in AGENTS.md files are stripped before the content is injected into CSC's context. Use them to leave notes for human maintainers without spending context tokens on them. Comments inside code blocks are preserved. When you open a AGENTS.md file directly with the Read tool, comments remain visible.

#### Load from additional directories

The `--add-dir` flag gives CSC access to additional directories outside your main working directory. By default, AGENTS.md files from these directories are not loaded.

To also load AGENTS.md files from additional directories, including `AGENTS.md`, `.costrict/AGENTS.md`, and `.costrict/rules/*.md`, set the `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` environment variable:

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 csc --add-dir ../shared-config
```

`AGENTS.local.md` files in additional directories are not loaded.

### Organize rules with `.costrict/rules/`

For larger projects, you can organize instructions into multiple files using the `.costrict/rules/` directory. This keeps instructions modular and easier for teams to maintain. Rules can also be scoped to specific file paths, so they only load into context when CSC works with matching files, reducing noise and saving context space.

> **Note:** Rules load into context every session or when matching files are opened. For task-specific instructions that don't need to be in context all the time, use skills instead, which only load when you invoke them or when CSC determines they're relevant to your prompt.

#### Set up rules

Place markdown files in your project's `.costrict/rules/` directory. Each file should cover one topic, with a descriptive filename like `testing.md` or `api-design.md`. All `.md` files are discovered recursively, so you can organize rules into subdirectories like `frontend/` or `backend/`:

```text
your-project/
├── .costrict/
│   ├── AGENTS.md           # Main project instructions
│   └── rules/
│       ├── code-style.md   # Code style guidelines
│       ├── testing.md      # Testing conventions
│       └── security.md     # Security requirements
```

Rules without `paths` frontmatter are loaded at launch with the same priority as `.costrict/AGENTS.md`.

#### Path-specific rules

Rules can be scoped to specific files using YAML frontmatter with the `paths` field. These conditional rules only apply when CSC is working with files matching the specified patterns.

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

Rules without a `paths` field are loaded unconditionally and apply to all files. Path-scoped rules trigger when CSC reads files matching the pattern, not on every tool use.

Use glob patterns in the `paths` field to match files by extension, directory, or any combination:

| Pattern                | Matches                                  |
| ---------------------- | ---------------------------------------- |
| `**/*.ts`              | All TypeScript files in any directory    |
| `src/**/*`             | All files under `src/` directory         |
| `*.md`                 | Markdown files in the project root       |
| `src/components/*.tsx` | React components in a specific directory |

You can specify multiple patterns and use brace expansion to match multiple extensions in one pattern:

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

#### Share rules across projects with symlinks

The `.costrict/rules/` directory supports symlinks, so you can maintain a shared set of rules and link them into multiple projects. Symlinks are resolved and loaded normally, and circular symlinks are detected and handled gracefully.

This example links both a shared directory and an individual file:

```bash
ln -s ~/shared-costrict-rules .costrict/rules/shared
ln -s ~/company-standards/security.md .costrict/rules/security.md
```

#### User-level rules

Personal rules in `~/.costrict/rules/` apply to every project on your machine. Use them for preferences that aren't project-specific:

```text
~/.costrict/rules/
├── preferences.md    # Your personal coding preferences
└── workflows.md      # Your preferred workflows
```

User-level rules are loaded before project rules, giving project rules higher priority.

### Manage AGENTS.md for large teams

For organizations deploying CSC across teams, you can centralize instructions and control which AGENTS.md files are loaded.

#### Deploy organization-wide AGENTS.md

Organizations can deploy a centrally managed AGENTS.md that applies to all users on a machine. This file cannot be excluded by individual settings.

### Create the file at the managed policy location

* macOS: `/Library/Application Support/CoStrict/AGENTS.md`
* Linux and WSL: `/etc/costrict/AGENTS.md`
* Windows: `C:\Program Files\CoStrict\AGENTS.md`

### Deploy with your configuration management system

Use MDM, Group Policy, Ansible, or similar tools to distribute the file across developer machines. See managed settings for other organization-wide configuration options.

A managed AGENTS.md and managed settings serve different purposes. Use settings for technical enforcement and AGENTS.md for behavioral guidance:

| Concern                                        | Configure in                                              |
| :--------------------------------------------- | :-------------------------------------------------------- |
| Block specific tools, commands, or file paths  | Managed settings: `permissions.deny`                      |
| Enforce sandbox isolation                      | Managed settings: `sandbox.enabled`                       |
| Environment variables and API provider routing | Managed settings: `env`                                   |
| Authentication method and organization lock    | Managed settings: `forceLoginMethod`, `forceLoginOrgUUID` |
| Code style and quality guidelines              | Managed AGENTS.md                                         |
| Data handling and compliance reminders         | Managed AGENTS.md                                         |
| Behavioral instructions for CSC                | Managed AGENTS.md                                         |

Settings rules are enforced by the client regardless of what CSC decides to do. AGENTS.md instructions shape CSC's behavior but are not a hard enforcement layer.

#### Exclude specific AGENTS.md files

In large monorepos, ancestor AGENTS.md files may contain instructions that aren't relevant to your work. The `costrictMdExcludes` setting lets you skip specific files by path or glob pattern.

This example excludes a top-level AGENTS.md and a rules directory from a parent folder. Add it to `.costrict/settings.local.json` so the exclusion stays local to your machine:

```json
{
  "costrictMdExcludes": [
    "**/monorepo/AGENTS.md",
    "/home/user/monorepo/other-team/.costrict/rules/**"
  ]
}
```

Patterns are matched against absolute file paths using glob syntax. You can configure `costrictMdExcludes` at any settings layer: user, project, local, or managed policy. Arrays merge across layers.

Managed policy AGENTS.md files cannot be excluded. This ensures organization-wide instructions always apply regardless of individual settings.

## Auto memory

Auto memory lets CSC accumulate knowledge across sessions without you writing anything. CSC saves notes for itself as it works: build commands, debugging insights, architecture notes, code style preferences, and workflow habits. CSC doesn't save something every session. It decides what's worth remembering based on whether the information would be useful in a future conversation.

> **Note:** Auto memory requires CSC v2.1.59 or later. Check your version with `csc --version`.

### Enable or disable auto memory

Auto memory is on by default. To toggle it, open `/memory` in a session and use the auto memory toggle, or set `autoMemoryEnabled` in your project settings:

```json
{
  "autoMemoryEnabled": false
}
```

To disable auto memory via environment variable, set `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.

### Storage location

Each project gets its own memory directory at `~/.costrict/projects/<project>/memory/`. The `<project>` path is derived from the git repository, so all worktrees and subdirectories within the same repo share one auto memory directory. Outside a git repo, the project root is used instead.

To store auto memory in a different location, set `autoMemoryDirectory` in your user or local settings:

```json
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

This setting is accepted from policy, local, and user settings. It is not accepted from project settings (`.costrict/settings.json`) to prevent a shared project from redirecting auto memory writes to sensitive locations.

The directory contains a `MEMORY.md` entrypoint and optional topic files:

```text
~/.costrict/projects/<project>/memory/
├── MEMORY.md          # Concise index, loaded into every session
├── debugging.md       # Detailed notes on debugging patterns
├── api-conventions.md # API design decisions
└── ...                # Any other topic files CSC creates
```

`MEMORY.md` acts as an index of the memory directory. CSC reads and writes files in this directory throughout your session, using `MEMORY.md` to keep track of what's stored where.

Auto memory is machine-local. All worktrees and subdirectories within the same git repository share one auto memory directory. Files are not shared across machines or cloud environments.

### How it works

The first 200 lines of `MEMORY.md`, or the first 25KB, whichever comes first, are loaded at the start of every conversation. Content beyond that threshold is not loaded at session start. CSC keeps `MEMORY.md` concise by moving detailed notes into separate topic files.

This limit applies only to `MEMORY.md`. AGENTS.md files are loaded in full regardless of length, though shorter files produce better adherence.

Topic files like `debugging.md` or `patterns.md` are not loaded at startup. CSC reads them on demand using its standard file tools when it needs the information.

CSC reads and writes memory files during your session. When you see "Writing memory" or "Recalled memory" in the CSC interface, CSC is actively updating or reading from `~/.costrict/projects/<project>/memory/`.

### Audit and edit your memory

Auto memory files are plain markdown you can edit or delete at any time. Run `/memory` to browse and open memory files from within a session.

## View and edit with `/memory`

The `/memory` command lists all AGENTS.md, AGENTS.local.md, and rules files loaded in your current session, lets you toggle auto memory on or off, and provides a link to open the auto memory folder. Select any file to open it in your editor.

When you ask CSC to remember something, like "always use pnpm, not npm" or "remember that the API tests require a local Redis instance," CSC saves it to auto memory. To add instructions to AGENTS.md instead, ask CSC directly, like "add this to AGENTS.md," or edit the file yourself via `/memory`.

## Troubleshoot memory issues

These are the most common issues with AGENTS.md and auto memory, along with steps to debug them.

### CSC isn't following my AGENTS.md

AGENTS.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. CSC reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.

To debug:

* Run `/memory` to verify your AGENTS.md and AGENTS.local.md files are being loaded. If a file isn't listed, CSC can't see it.
* Check that the relevant AGENTS.md is in a location that gets loaded for your session (see Choose where to put AGENTS.md files).
* Make instructions more specific. "Use 2-space indentation" works better than "format code nicely."
* Look for conflicting instructions across AGENTS.md files. If two files give different guidance for the same behavior, CSC may pick one arbitrarily.

For instructions you want at the system prompt level, use `--append-system-prompt`. This must be passed every invocation, so it's better suited to scripts and automation than interactive use.

> **💡 Tip:** Use the `InstructionsLoaded` hook to log exactly which instruction files are loaded, when they load, and why. This is useful for debugging path-specific rules or lazy-loaded files in subdirectories.

### I don't know what auto memory saved

Run `/memory` and select the auto memory folder to browse what CSC has saved. Everything is plain markdown you can read, edit, or delete.

### My AGENTS.md is too large

Files over 200 lines consume more context and may reduce adherence. Move detailed content into separate files referenced with `@path` imports (see Import additional files), or split your instructions across `.costrict/rules/` files.

### Instructions seem lost after `/compact`

Project-root AGENTS.md survives compaction: after `/compact`, CSC re-reads it from disk and re-injects it into the session. Nested AGENTS.md files in subdirectories are not re-injected automatically; they reload the next time CSC reads a file in that subdirectory.

If an instruction disappeared after compaction, it was either given only in conversation or lives in a nested AGENTS.md that hasn't reloaded yet. Add conversation-only instructions to AGENTS.md to make them persist. See What survives compaction for the full breakdown.

See Write effective instructions for guidance on size, structure, and specificity.
