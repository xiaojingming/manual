---
sidebar_position: 3
---

# Extend CSC with Skills

> Create, manage, and share Skills to extend CSC's capabilities. Includes custom commands and bundled Skills.

Skills extend what CSC can do. Create a `SKILL.md` file with instructions, and CSC adds it to its toolkit. CSC uses Skills when relevant, or you can invoke one directly with `/skill-name`.

Create a Skill when you keep pasting the same playbook, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact. Unlike CLAUDE.md content, a Skill's body loads only when it's used, so long reference material costs almost nothing until you need it.

> **Note:** For built-in commands like `/help` and `/compact`, and bundled Skills like `/debug` and `/simplify`, see the commands reference.
>
> **Custom commands have been merged into Skills.** A file at `.claude/commands/deploy.md` and a Skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way. Your existing `.claude/commands/` files keep working. Skills add optional features: a directory for supporting files, frontmatter to control whether you or CSC invokes them, and the ability for CSC to load them automatically when relevant.

CSC Skills follow the Agent Skills open standard, which works across multiple AI tools. CSC extends the standard with additional features like invocation control, Subagent execution, and dynamic context injection.

## Bundled Skills

CSC includes a set of bundled Skills that are available in every session, including `/simplify`, `/batch`, `/debug`, `/loop`, and `/claude-api`. Unlike built-in commands, which execute fixed logic directly, bundled Skills are prompt-based: they give CSC a detailed playbook and let it orchestrate the work using its tools. You invoke them the same way as any other Skill, by typing `/` followed by the Skill name.

Bundled Skills are listed alongside built-in commands in the commands reference, marked **Skill** in the Purpose column.

## Getting started

### Create your first Skill

This example creates a Skill that teaches CSC to explain code using visual diagrams and analogies. Since it uses default frontmatter, CSC can load it automatically when you ask how something works, or you can invoke it directly with `/explain-code`.

### Create the Skill directory

Create a directory for the Skill in your personal Skills folder. Personal Skills are available across all your projects.

```bash
mkdir -p ~/.claude/skills/explain-code
```

### Write SKILL.md

Every Skill needs a `SKILL.md` file with two parts: YAML frontmatter (between `---` markers) that tells CSC when to use the Skill, and markdown content with instructions CSC follows when the Skill is invoked. The `name` field becomes the `/slash-command`, and the `description` helps CSC decide when to load it automatically.

Create `~/.claude/skills/explain-code/SKILL.md`:

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
```

### Test the Skill

You can test it two ways:

**Let CSC invoke it automatically** by asking something that matches the description:

```text
How does this code work?
```

**Or invoke it directly** with the Skill name:

```text
/explain-code src/auth/login.ts
```

Either way, CSC should include an analogy and ASCII diagram in its explanation.

### Where Skills live

Where you store a Skill determines who can use it:

| Location   | Path                                    | Applies to           |
| :--------- | :-------------------------------------- | :------------------- |
| Enterprise | See managed settings                    | All users in your organization |
| Personal   | `~/.claude/skills/<skill-name>/SKILL.md` | All your projects    |
| Project    | `.claude/skills/<skill-name>/SKILL.md`   | This project only    |
| Plugins    | `<plugin>/skills/<skill-name>/SKILL.md`  | Where Plugins are enabled |

When Skills share the same name across levels, higher-priority locations win: enterprise > personal > project. Plugin skills use a `plugin-name:skill-name` namespace, so they cannot conflict with other levels. If you have files in `.claude/commands/`, those work the same way, but if a Skill and a command share the same name, the Skill takes precedence.

#### Automatic discovery from nested directories

When you work with files in subdirectories, CSC automatically discovers Skills from nested `.claude/skills/` directories. For example, if you're editing a file in `packages/frontend/`, CSC also looks for Skills in `packages/frontend/.claude/skills/`. This supports monorepo setups where packages have their own Skills.

Each Skill is a directory with `SKILL.md` as the entrypoint:

```text
my-skill/
├── SKILL.md           # Main instructions (required)
├── template.md        # Template for CSC to fill in
├── examples/
│   └── sample.md      # Example output showing expected format
└── scripts/
    └── validate.sh    # Script CSC can execute
```

The `SKILL.md` contains the main instructions and is required. Other files are optional and let you build more powerful Skills: templates for CSC to fill in, example outputs showing the expected format, scripts CSC can execute, or detailed reference documentation. Reference these files from your `SKILL.md` so CSC knows what they contain and when to load them. See adding supporting files for more details.

> **Note:** Files in `.claude/commands/` still work and support the same frontmatter. Skills are recommended since they support additional features like supporting files.

#### Skills from additional directories

The `--add-dir` flag grants file access rather than configuration discovery, but Skills are an exception: `.claude/skills/` within an added directory is loaded automatically and picked up by live change detection, so you can edit those Skills during a session without restarting.

Other `.claude/` configuration such as Subagents, commands, and output styles is not loaded from additional directories. See the exceptions table for the complete list of what is and isn't loaded, and the recommended ways to share configuration across projects.

> **Note:** CLAUDE.md files from `--add-dir` directories are not loaded by default. To load them, set `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`. See loading from additional directories.

## Configure Skills

Skills are configured through YAML frontmatter at the top of `SKILL.md` and the markdown content that follows.

### Types of Skill content

Skill files can contain any instructions, but thinking about how you want to invoke them helps guide what to include:

**Reference content** adds knowledge CSC applies to your current work. Conventions, patterns, style guides, domain knowledge. This content runs inline so CSC can use it alongside your conversation context.

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

**Task content** gives CSC step-by-step instructions for a specific action, like deployments, commits, or code generation. These are often actions you want to invoke directly with `/skill-name` rather than letting CSC decide when to run them. Add `disable-model-invocation: true` to prevent CSC from triggering it automatically.

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

Your `SKILL.md` can contain anything, but thinking through how you want the Skill invoked (by you, by CSC, or both) and where you want it to run (inline or in a Subagent) helps guide what to include. For complex Skills, you can also add supporting files to keep the main Skill focused.

### Frontmatter reference

Beyond the markdown content, you can configure Skill behavior using YAML frontmatter fields between `---` markers at the top of your `SKILL.md` file:

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read Grep
---

Your skill instructions here...
```

All fields are optional. Only `description` is recommended so CSC knows when to use the Skill.

| Field                      | Required    | Description                                                                                                                                                                                                                                                  |
| :------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                     | No          | Display name for the Skill. If omitted, uses the directory name. Lowercase letters, numbers, and hyphens only (max 64 characters).                                                                                                                           |
| `description`              | Recommended | What the Skill does and when to use it. CSC uses this to decide when to apply the Skill. If omitted, uses the first paragraph of markdown content. Front-load the key use case: descriptions longer than 250 characters are truncated in the Skill listing to reduce context usage. |
| `argument-hint`            | No          | Hint shown during autocomplete to indicate expected arguments. Example: `[issue-number]` or `[filename] [format]`.                                                                                                                                           |
| `disable-model-invocation` | No          | Set to `true` to prevent CSC from automatically loading this Skill. Use for workflows you want to trigger manually with `/name`. Default: `false`.                                                                                                           |
| `user-invocable`           | No          | Set to `false` to hide from the `/` menu. Use for background knowledge users shouldn't invoke directly. Default: `true`.                                                                                                                                     |
| `allowed-tools`            | No          | Tools CSC can use without asking permission when this Skill is active. Accepts a space-separated string or a YAML list.                                                                                                                                      |
| `model`                    | No          | Model to use when this Skill is active.                                                                                                                                                                                                                      |
| `effort`                   | No          | Effort level when this Skill is active. Overrides the session effort level. Default: inherits from session. Options: `low`, `medium`, `high`, `max` (Opus 4.6 only).                                                                                         |
| `context`                  | No          | Set to `fork` to run in a forked Subagent context.                                                                                                                                                                                                           |
| `agent`                    | No          | Which Subagent type to use when `context: fork` is set.                                                                                                                                                                                                      |
| `hooks`                    | No          | Hooks scoped to this Skill's lifecycle. See Hooks in Skills and agents for configuration format.                                                                                                                                                             |
| `paths`                    | No          | Glob patterns that limit when this Skill is activated. Accepts a comma-separated string or a YAML list. When set, CSC loads the Skill automatically only when working with files matching the patterns. Uses the same format as path-specific rules.        |
| `shell`                    | No          | Shell to use for `` !`command` `` and ` ```! ` blocks in this Skill. Accepts `bash` (default) or `powershell`. Setting `powershell` runs inline shell commands via PowerShell on Windows. Requires `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`.                      |

#### Available string substitutions

Skills support string substitution for dynamic values in the Skill content:

| Variable               | Description                                                                                                                                                                                                                                     |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$ARGUMENTS`           | All arguments passed when invoking the Skill. If `$ARGUMENTS` is not present in the content, arguments are appended as `ARGUMENTS: <value>`.                                                                                                    |
| `$ARGUMENTS[N]`        | Access a specific argument by 0-based index, such as `$ARGUMENTS[0]` for the first argument.                                                                                                                                                    |
| `$N`                   | Shorthand for `$ARGUMENTS[N]`, such as `$0` for the first argument or `$1` for the second.                                                                                                                                                      |
| `${CLAUDE_SESSION_ID}` | The current session ID. Useful for logging, creating session-specific files, or correlating Skill output with sessions.                                                                                                                         |
| `${CLAUDE_SKILL_DIR}`  | The directory containing the Skill's `SKILL.md` file. For Plugin skills, this is the Skill's subdirectory within the Plugin, not the Plugin root. Use this in bash injection commands to reference scripts or files bundled with the Skill, regardless of the current working directory. |

Indexed arguments use shell-style quoting, so wrap multi-word values in quotes to pass them as a single argument. For example, `/my-skill "hello world" second` makes `$0` expand to `hello world` and `$1` to `second`. The `$ARGUMENTS` placeholder always expands to the full argument string as typed.

**Example using substitutions:**

```yaml
---
name: session-logger
description: Log activity for this session
---

Log the following to logs/${CLAUDE_SESSION_ID}.log:

$ARGUMENTS
```

### Add supporting files

Skills can include multiple files in their directory. This keeps `SKILL.md` focused on the essentials while letting CSC access detailed reference material only when needed. Large reference docs, API specifications, or example collections don't need to load into context every time the Skill runs.

```text
my-skill/
├── SKILL.md (required - overview and navigation)
├── reference.md (detailed API docs - loaded when needed)
├── examples.md (usage examples - loaded when needed)
└── scripts/
    └── helper.py (utility script - executed, not loaded)
```

Reference supporting files from `SKILL.md` so CSC knows what each file contains and when to load it:

```markdown
## Additional resources

- For complete API details, see reference.md
- For usage examples, see examples.md
```

> **💡 Tip:** Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files.

### Control who invokes a Skill

By default, both you and CSC can invoke any Skill. You can type `/skill-name` to invoke it directly, and CSC can load it automatically when relevant to your conversation. Two frontmatter fields let you restrict this:

* **`disable-model-invocation: true`**: Only you can invoke the Skill. Use this for workflows with side effects or that you want to control timing, like `/commit`, `/deploy`, or `/send-slack-message`. You don't want CSC deciding to deploy because your code looks ready.

* **`user-invocable: false`**: Only CSC can invoke the Skill. Use this for background knowledge that isn't actionable as a command. A `legacy-system-context` Skill explains how an old system works. CSC should know this when relevant, but `/legacy-system-context` isn't a meaningful action for users to take.

This example creates a deploy Skill that only you can trigger. The `disable-model-invocation: true` field prevents CSC from running it automatically:

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:

1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

Here's how the two fields affect invocation and context loading:

| Frontmatter                      | You can invoke | CSC can invoke | When loaded into context                                     |
| :------------------------------- | :------------- | :------------- | :----------------------------------------------------------- |
| (default)                        | Yes            | Yes            | Description always in context, full Skill loads when invoked |
| `disable-model-invocation: true` | Yes            | No             | Description not in context, full Skill loads when you invoke |
| `user-invocable: false`          | No             | Yes            | Description always in context, full Skill loads when invoked |

> **Note:** In a regular session, Skill descriptions are loaded into context so CSC knows what's available, but full Skill content only loads when invoked. Subagents with preloaded Skills work differently: the full Skill content is injected at startup.

### Skill content lifecycle

When you or CSC invoke a Skill, the rendered `SKILL.md` content enters the conversation as a single message and stays there for the rest of the session. CSC does not re-read the Skill file on later turns, so write guidance that should apply throughout a task as standing instructions rather than one-time steps.

Auto-compaction carries invoked Skills forward within a token budget. When the conversation is summarized to free context, CSC re-attaches the most recent invocation of each Skill after the summary, keeping the first 5,000 tokens of each. Re-attached Skills share a combined budget of 25,000 tokens. CSC fills this budget starting from the most recently invoked Skill, so older Skills can be dropped entirely after compaction if you invoked many in one session.

If a Skill seems to stop influencing behavior after the first response, the content is usually still present and the model is choosing other tools or approaches. Strengthen the Skill's `description` and instructions so the model keeps preferring it, or use Hooks to enforce behavior. If the Skill is large or you invoked several others after it, re-invoke it after compaction to restore the full content.

### Pre-approve tools for a Skill

The `allowed-tools` field grants permission for the listed tools while the Skill is active, so CSC can use them without prompting you for approval. It does not restrict which tools are available: every tool remains callable, and your permission settings still govern tools that are not listed.

This Skill lets CSC run git commands without per-use approval whenever you invoke it:

```yaml
---
name: commit
description: Stage and commit the current changes
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

To block a Skill from using certain tools, add deny rules in your permission settings.

### Pass arguments to Skills

Both you and CSC can pass arguments when invoking a Skill. Arguments are available via the `$ARGUMENTS` placeholder.

This Skill fixes a GitHub issue by number. The `$ARGUMENTS` placeholder gets replaced with whatever follows the Skill name:

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Understand the requirements
3. Implement the fix
4. Write tests
5. Create a commit
```

When you run `/fix-issue 123`, CSC receives "Fix GitHub issue 123 following our coding standards..."

If you invoke a Skill with arguments but the Skill doesn't include `$ARGUMENTS`, CSC appends `ARGUMENTS: <your input>` to the end of the Skill content so CSC still sees what you typed.

To access individual arguments by position, use `$ARGUMENTS[N]` or the shorter `$N`:

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $ARGUMENTS[0] component from $ARGUMENTS[1] to $ARGUMENTS[2].
Preserve all existing behavior and tests.
```

Running `/migrate-component SearchBar React Vue` replaces `$ARGUMENTS[0]` with `SearchBar`, `$ARGUMENTS[1]` with `React`, and `$ARGUMENTS[2]` with `Vue`. The same Skill using the `$N` shorthand:

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

## Advanced patterns

### Inject dynamic context

The `` !`<command>` `` syntax runs shell commands before the Skill content is sent to CSC. The command output replaces the placeholder, so CSC receives actual data, not the command itself.

This Skill summarizes a pull request by fetching live PR data with the GitHub CLI. The `` !`gh pr diff` `` and other commands run first, and their output gets inserted into the prompt:

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

When this Skill runs:

1. Each `` !`<command>` `` executes immediately (before CSC sees anything)
2. The output replaces the placeholder in the Skill content
3. CSC receives the fully-rendered prompt with actual PR data

This is preprocessing, not something CSC executes. CSC only sees the final result.

For multi-line commands, use a fenced code block opened with ` ```! ` instead of the inline form:

````markdown
## Environment
```!
node --version
npm --version
git status --short
```
````

To disable this behavior for Skills and custom commands from user, project, Plugin, or additional-directory sources, set `"disableSkillShellExecution": true` in settings. Each command is replaced with `[shell command execution disabled by policy]` instead of being run. Bundled and managed Skills are not affected. This setting is most useful in managed settings, where users cannot override it.

> **💡 Tip:** To enable extended thinking in a Skill, include the word "ultrathink" anywhere in your Skill content.

### Run Skills in a Subagent

Add `context: fork` to your frontmatter when you want a Skill to run in isolation. The Skill content becomes the prompt that drives the Subagent. It won't have access to your conversation history.

> **⚠️ Warning:** `context: fork` only makes sense for Skills with explicit instructions. If your Skill contains guidelines like "use these API conventions" without a task, the Subagent receives the guidelines but no actionable prompt, and returns without meaningful output.

Skills and Subagents work together in two directions:

| Approach                     | System prompt                             | Task                        | Also loads                   |
| :--------------------------- | :---------------------------------------- | :-------------------------- | :--------------------------- |
| Skill with `context: fork`   | From agent type (`Explore`, `Plan`, etc.) | SKILL.md content            | CLAUDE.md                    |
| Subagent with `skills` field | Subagent's markdown body                  | CSC's delegation message    | Preloaded Skills + CLAUDE.md |

With `context: fork`, you write the task in your Skill and pick an agent type to execute it. For the inverse (defining a custom Subagent that uses Skills as reference material), see Subagents.

#### Example: Research Skill using Explore agent

This Skill runs research in a forked Explore agent. The Skill content becomes the task, and the agent provides read-only tools optimized for codebase exploration:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

When this Skill runs:

1. A new isolated context is created
2. The Subagent receives the Skill content as its prompt ("Research $ARGUMENTS thoroughly...")
3. The `agent` field determines the execution environment (model, tools, and permissions)
4. Results are summarized and returned to your main conversation

The `agent` field specifies which Subagent configuration to use. Options include built-in agents (`Explore`, `Plan`, `general-purpose`) or any custom Subagent from `.claude/agents/`. If omitted, uses `general-purpose`.

### Restrict CSC's Skill access

By default, CSC can invoke any Skill that doesn't have `disable-model-invocation: true` set. Skills that define `allowed-tools` grant CSC access to those tools without per-use approval when the Skill is active. Your permission settings still govern baseline approval behavior for all other tools. Built-in commands like `/compact` and `/init` are not available through the Skill tool.

Three ways to control which Skills CSC can invoke:

**Disable all Skills** by denying the Skill tool in `/permissions`:

```text
# Add to deny rules:
Skill
```

**Allow or deny specific Skills** using permission rules:

```text
# Allow only specific skills
Skill(commit)
Skill(review-pr *)

# Deny specific skills
Skill(deploy *)
```

Permission syntax: `Skill(name)` for exact match, `Skill(name *)` for prefix match with any arguments.

**Hide individual Skills** by adding `disable-model-invocation: true` to their frontmatter. This removes the Skill from CSC's context entirely.

> **Note:** The `user-invocable` field only controls menu visibility, not Skill tool access. Use `disable-model-invocation: true` to block programmatic invocation.

## Share Skills

Skills can be distributed at different scopes depending on your audience:

* **Project Skills**: Commit `.claude/skills/` to version control
* **Plugins**: Create a `skills/` directory in your Plugin
* **Managed**: Deploy organization-wide through managed settings

### Generate visual output

Skills can bundle and run scripts in any language, giving CSC capabilities beyond what's possible in a single prompt. One powerful pattern is generating visual output: interactive HTML files that open in your browser for exploring data, debugging, or creating reports.

This example creates a codebase explorer: an interactive tree view where you can expand and collapse directories, see file sizes at a glance, and identify file types by color.

Create the Skill directory:

```bash
mkdir -p ~/.claude/skills/codebase-visualizer/scripts
```

Create `~/.claude/skills/codebase-visualizer/SKILL.md`. The description tells CSC when to activate this Skill, and the instructions tell CSC to run the bundled script:

````yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo, understanding project structure, or identifying large files.
allowed-tools: Bash(python *)
---

# Codebase Visualizer

Generate an interactive HTML tree view that shows your project's file structure with collapsible directories.

## Usage

Run the visualization script from your project root:

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```

This creates `codebase-map.html` in the current directory and opens it in your default browser.

## What the visualization shows

- **Collapsible directories**: Click folders to expand/collapse
- **File sizes**: Displayed next to each file
- **Colors**: Different colors for different file types
- **Directory totals**: Shows aggregate size of each folder
````

Create `~/.claude/skills/codebase-visualizer/scripts/visualize.py`. This script scans a directory tree and generates a self-contained HTML file with:

* A **summary sidebar** showing file count, directory count, total size, and number of file types
* A **bar chart** breaking down the codebase by file type (top 8 by size)
* A **collapsible tree** where you can expand and collapse directories, with color-coded file type indicators

The script requires Python but uses only built-in libraries, so there are no packages to install:

```python
#!/usr/bin/env python3
"""Generate an interactive collapsible tree visualization of a codebase."""

import json
import sys
import webbrowser
from pathlib import Path
from collections import Counter

IGNORE = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build'}

def scan(path: Path, stats: dict) -> dict:
    result = {"name": path.name, "children": [], "size": 0}
    try:
        for item in sorted(path.iterdir()):
            if item.name in IGNORE or item.name.startswith('.'):
                continue
            if item.is_file():
                size = item.stat().st_size
                ext = item.suffix.lower() or '(no ext)'
                result["children"].append({"name": item.name, "size": size, "ext": ext})
                result["size"] += size
                stats["files"] += 1
                stats["extensions"][ext] += 1
                stats["ext_sizes"][ext] += size
            elif item.is_dir():
                stats["dirs"] += 1
                child = scan(item, stats)
                if child["children"]:
                    result["children"].append(child)
                    result["size"] += child["size"]
    except PermissionError:
        pass
    return result

def generate_html(data: dict, stats: dict, output: Path) -> None:
    ext_sizes = stats["ext_sizes"]
    total_size = sum(ext_sizes.values()) or 1
    sorted_exts = sorted(ext_sizes.items(), key=lambda x: -x[1])[:8]
    colors = {
        '.js': '#f7df1e', '.ts': '#3178c6', '.py': '#3776ab', '.go': '#00add8',
        '.rs': '#dea584', '.rb': '#cc342d', '.css': '#264de4', '.html': '#e34c26',
        '.json': '#6b7280', '.md': '#083fa1', '.yaml': '#cb171e', '.yml': '#cb171e',
        '.mdx': '#083fa1', '.tsx': '#3178c6', '.jsx': '#61dafb', '.sh': '#4eaa25',
    }
    lang_bars = "".join(
        f'<div class="bar-row"><span class="bar-label">{ext}</span>'
        f'<div class="bar" style="width:{(size/total_size)*100}%;background:{colors.get(ext,"#6b7280")}"></div>'
        f'<span class="bar-pct">{(size/total_size)*100:.1f}%</span></div>'
        for ext, size in sorted_exts
    )
    def fmt(b):
        if b < 1024: return f"{b} B"
        if b < 1048576: return f"{b/1024:.1f} KB"
        return f"{b/1048576:.1f} MB"

    html = f'''<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"><title>Codebase Explorer</title>
  <style>
    body {{ font: 14px/1.5 system-ui, sans-serif; margin: 0; background: #1a1a2e; color: #eee; }}
    .container {{ display: flex; height: 100vh; }}
    .sidebar {{ width: 280px; background: #252542; padding: 20px; border-right: 1px solid #3d3d5c; overflow-y: auto; flex-shrink: 0; }}
    .main {{ flex: 1; padding: 20px; overflow-y: auto; }}
    h1 {{ margin: 0 0 10px 0; font-size: 18px; }}
    h2 {{ margin: 20px 0 10px 0; font-size: 14px; color: #888; text-transform: uppercase; }}
    .stat {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3d3d5c; }}
    .stat-value {{ font-weight: bold; }}
    .bar-row {{ display: flex; align-items: center; margin: 6px 0; }}
    .bar-label {{ width: 55px; font-size: 12px; color: #aaa; }}
    .bar {{ height: 18px; border-radius: 3px; }}
    .bar-pct {{ margin-left: 8px; font-size: 12px; color: #666; }}
    .tree {{ list-style: none; padding-left: 20px; }}
    details {{ cursor: pointer; }}
    summary {{ padding: 4px 8px; border-radius: 4px; }}
    summary:hover {{ background: #2d2d44; }}
    .folder {{ color: #ffd700; }}
    .file {{ display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; }}
    .file:hover {{ background: #2d2d44; }}
    .size {{ color: #888; margin-left: auto; font-size: 12px; }}
    .dot {{ width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }}
  </style>
</head><body>
  <div class="container">
    <div class="sidebar">
      <h1>📊 Summary</h1>
      <div class="stat"><span>Files</span><span class="stat-value">{stats["files"]:,}</span></div>
      <div class="stat"><span>Directories</span><span class="stat-value">{stats["dirs"]:,}</span></div>
      <div class="stat"><span>Total size</span><span class="stat-value">{fmt(data["size"])}</span></div>
      <div class="stat"><span>File types</span><span class="stat-value">{len(stats["extensions"])}</span></div>
      <h2>By file type</h2>
      {lang_bars}
    </div>
    <div class="main">
      <h1>📁 {data["name"]}</h1>
      <ul class="tree" id="root"></ul>
    </div>
  </div>
  <script>
    const data = {json.dumps(data)};
    const colors = {json.dumps(colors)};
    function fmt(b) {{ if (b < 1024) return b + ' B'; if (b < 1048576) return (b/1024).toFixed(1) + ' KB'; return (b/1048576).toFixed(1) + ' MB'; }}
    function render(node, parent) {{
      if (node.children) {{
        const det = document.createElement('details');
        det.open = parent === document.getElementById('root');
        det.innerHTML = `<summary><span class="folder">📁 ${{node.name}}</span><span class="size">${{fmt(node.size)}}</span></summary>`;
        const ul = document.createElement('ul'); ul.className = 'tree';
        node.children.sort((a,b) => (b.children?1:0)-(a.children?1:0) || a.name.localeCompare(b.name));
        node.children.forEach(c => render(c, ul));
        det.appendChild(ul);
        const li = document.createElement('li'); li.appendChild(det); parent.appendChild(li);
      }} else {{
        const li = document.createElement('li'); li.className = 'file';
        li.innerHTML = `<span class="dot" style="background:${{colors[node.ext]||'#6b7280'}}"></span>${{node.name}}<span class="size">${{fmt(node.size)}}</span>`;
        parent.appendChild(li);
      }}
    }}
    data.children.forEach(c => render(c, document.getElementById('root')));
  </script>
</body></html>'''
    output.write_text(html)

if __name__ == '__main__':
    target = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    stats = {"files": 0, "dirs": 0, "extensions": Counter(), "ext_sizes": Counter()}
    data = scan(target, stats)
    out = Path('codebase-map.html')
    generate_html(data, stats, out)
    print(f'Generated {out.absolute()}')
    webbrowser.open(f'file://{out.absolute()}')
```

To test, open CSC in any project and ask "Visualize this codebase." CSC runs the script, generates `codebase-map.html`, and opens it in your browser.

This pattern works for any visual output: dependency graphs, test coverage reports, API documentation, or database schema visualizations. The bundled script does the heavy lifting while CSC handles orchestration.

## Troubleshooting

### Skill not triggering

If CSC doesn't use your Skill when expected:

1. Check the description includes keywords users would naturally say
2. Verify the Skill appears in "What Skills are available?"
3. Try rephrasing your request to match the description more closely
4. Invoke it directly with `/skill-name` if the Skill is user-invocable

### Skill triggers too often

If CSC uses your Skill when you don't want it:

1. Make the description more specific
2. Add `disable-model-invocation: true` if you only want manual invocation

### Skill descriptions are cut short

Skill descriptions are loaded into context so CSC knows what's available. All Skill names are always included, but if you have many Skills, descriptions are shortened to fit the character budget, which can strip the keywords CSC needs to match your request. The budget scales dynamically at 1% of the context window, with a fallback of 8,000 characters.

To raise the limit, set the `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable. Or trim descriptions at the source: front-load the key use case, since each entry is capped at 250 characters regardless of budget.
