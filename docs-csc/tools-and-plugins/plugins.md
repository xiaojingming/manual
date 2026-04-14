---
sidebar_position: 2
---

# Create Plugins

> Create custom Plugins to extend CSC with Skills, Subagents, Hooks, and MCP servers.

Plugins let you extend CSC with custom functionality that can be shared across projects and teams. This guide covers creating your own Plugins with Skills, Subagents, Hooks, and MCP servers.

Looking to install existing Plugins? See Discover and install Plugins. For complete technical specifications, see Plugins reference.

## When to use Plugins vs standalone configuration

CSC supports two ways to add custom Skills, Subagents, and Hooks:

| Approach                                                    | Skill names          | Best for                                                                                        |
| :---------------------------------------------------------- | :------------------- | :---------------------------------------------------------------------------------------------- |
| **Standalone** (`.claude/` directory)                       | `/hello`             | Personal workflows, project-specific customizations, quick experiments                          |
| **Plugins** (directories with `.claude-plugin/plugin.json`) | `/plugin-name:hello` | Sharing with teammates, distributing to community, versioned releases, reusable across projects |

**Use standalone configuration when**:

* You're customizing CSC for a single project
* The configuration is personal and doesn't need to be shared
* You're experimenting with Skills or Hooks before packaging them
* You want short Skill names like `/hello` or `/deploy`

**Use Plugins when**:

* You want to share functionality with your team or community
* You need the same Skills/Subagents across multiple projects
* You want version control and easy updates for your extensions
* You're distributing through a marketplace
* You're okay with namespaced Skills like `/my-plugin:hello` (namespacing prevents conflicts between Plugins)

> **Tip:** Start with standalone configuration in `.claude/` for quick iteration, then convert to a Plugin when you're ready to share.

## Quickstart

This quickstart walks you through creating a Plugin with a custom Skill. You'll create a manifest (the configuration file that defines your Plugin), add a Skill, and test it locally using the `--plugin-dir` flag.

### Prerequisites

* CSC installed and authenticated

> **Note:** If you don't see the `/plugin` command, update CSC to the latest version. See Troubleshooting for upgrade instructions.

### Create your first Plugin

#### Create the Plugin directory

Every Plugin lives in its own directory containing a manifest and your Skills, Subagents, or Hooks. Create one now:

```bash
mkdir my-first-plugin
```

#### Create the Plugin manifest

The manifest file at `.claude-plugin/plugin.json` defines your Plugin's identity: its name, description, and version. CSC uses this metadata to display your Plugin in the Plugin manager.

Create the `.claude-plugin` directory inside your Plugin folder:

```bash
mkdir my-first-plugin/.claude-plugin
```

Then create `my-first-plugin/.claude-plugin/plugin.json` with this content:

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

| Field         | Purpose                                                                                                |
| :------------ | :----------------------------------------------------------------------------------------------------- |
| `name`        | Unique identifier and Skill namespace. Skills are prefixed with this (e.g., `/my-first-plugin:hello`). |
| `description` | Shown in the Plugin manager when browsing or installing Plugins.                                       |
| `version`     | Track releases using semantic versioning.                  |
| `author`      | Optional. Helpful for attribution.                                                                     |

For additional fields like `homepage`, `repository`, and `license`, see the full manifest schema.

#### Add a Skill

Skills live in the `skills/` directory. Each Skill is a folder containing a `SKILL.md` file. The folder name becomes the Skill name, prefixed with the Plugin's namespace (`hello/` in a Plugin named `my-first-plugin` creates `/my-first-plugin:hello`).

Create a Skill directory in your Plugin folder:

```bash
mkdir -p my-first-plugin/skills/hello
```

Then create `my-first-plugin/skills/hello/SKILL.md` with this content:

```markdown
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

#### Test your Plugin

Run CSC with the `--plugin-dir` flag to load your Plugin:

```bash
csc --plugin-dir ./my-first-plugin
```

Once CSC starts, try your new Skill:

```shell
/my-first-plugin:hello
```

You'll see Claude respond with a greeting. Run `/help` to see your Skill listed under the Plugin namespace.

> **Note:** **Why namespacing?** Plugin Skills are always namespaced (like `/my-first-plugin:hello`) to prevent conflicts when multiple Plugins have Skills with the same name. To change the namespace prefix, update the `name` field in `plugin.json`.

#### Add Skill arguments

Make your Skill dynamic by accepting user input. The `$ARGUMENTS` placeholder captures any text the user provides after the Skill name.

Update your `SKILL.md` file:

```markdown
---
description: Greet the user with a personalized message
---

# Hello Skill

Greet the user named "$ARGUMENTS" warmly and ask how you can help them today. Make the greeting personal and encouraging.
```

Run `/reload-plugins` to pick up the changes, then try the Skill with your name:

```shell
/my-first-plugin:hello Alex
```

Claude will greet you by name. For more on passing arguments to Skills, see Skills.

You've successfully created and tested a Plugin with these key components:

* **Plugin manifest** (`.claude-plugin/plugin.json`): describes your Plugin's metadata
* **Skills directory** (`skills/`): contains your custom Skills
* **Skill arguments** (`$ARGUMENTS`): captures user input for dynamic behavior

> **Tip:** The `--plugin-dir` flag is useful for development and testing. When you're ready to share your Plugin with others, see Create and distribute a Plugin marketplace.

## Plugin structure overview

You've created a Plugin with a Skill, but Plugins can include much more: custom Subagents, Hooks, MCP servers, and LSP servers.

> **Warning:** **Common mistake**: Don't put `commands/`, `agents/`, `skills/`, or `hooks/` inside the `.claude-plugin/` directory. Only `plugin.json` goes inside `.claude-plugin/`. All other directories must be at the Plugin root level.

| Directory         | Location    | Purpose                                                                        |
| :---------------- | :---------- | :----------------------------------------------------------------------------- |
| `.claude-plugin/` | Plugin root | Contains `plugin.json` manifest (optional if components use default locations) |
| `skills/`         | Plugin root | Skills as `<name>/SKILL.md` directories                                        |
| `commands/`       | Plugin root | Skills as flat Markdown files. Use `skills/` for new Plugins                   |
| `agents/`         | Plugin root | Custom Subagent definitions                                                    |
| `hooks/`          | Plugin root | Event handlers in `hooks.json`                                                 |
| `.mcp.json`       | Plugin root | MCP server configurations                                                      |
| `.lsp.json`       | Plugin root | LSP server configurations for code intelligence                                |
| `bin/`            | Plugin root | Executables added to the Bash tool's `PATH` while the Plugin is enabled        |
| `settings.json`   | Plugin root | Default settings applied when the Plugin is enabled            |

> **Note:** **Next steps**: Ready to add more features? Jump to Develop more complex Plugins to add Subagents, Hooks, MCP servers, and LSP servers. For complete technical specifications of all Plugin components, see Plugins reference.

## Develop more complex Plugins

Once you're comfortable with basic Plugins, you can create more sophisticated extensions.

### Add Skills to your Plugin

Plugins can include Agent Skills to extend Claude's capabilities. Skills are model-invoked: Claude automatically uses them based on the task context.

Add a `skills/` directory at your Plugin root with Skill folders containing `SKILL.md` files:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── code-review/
        └── SKILL.md
```

Each `SKILL.md` needs frontmatter with `name` and `description` fields, followed by instructions:

```yaml
---
name: code-review
description: Reviews code for best practices and potential issues. Use when reviewing code, checking PRs, or analyzing code quality.
---

When reviewing code, check for:
1. Code organization and structure
2. Error handling
3. Security concerns
4. Test coverage
```

After installing the Plugin, run `/reload-plugins` to load the Skills. For complete Skill authoring guidance including progressive disclosure and tool restrictions, see Agent Skills.

### Add LSP servers to your Plugin

> **Tip:** For common languages like TypeScript, Python, and Rust, install the pre-built LSP Plugins from the official marketplace. Create custom LSP Plugins only when you need support for languages not already covered.

LSP (Language Server Protocol) Plugins give Claude real-time code intelligence. If you need to support a language that doesn't have an official LSP Plugin, you can create your own by adding an `.lsp.json` file to your Plugin:

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

Users installing your Plugin must have the language server binary installed on their machine.

For complete LSP configuration options, see LSP servers.

### Ship default settings with your Plugin

Plugins can include a `settings.json` file at the Plugin root to apply default configuration when the Plugin is enabled. Currently, only the `agent` key is supported.

Setting `agent` activates one of the Plugin's custom Subagents as the main thread, applying its system prompt, tool restrictions, and model. This lets a Plugin change how CSC behaves by default when enabled.

```json
{
  "agent": "security-reviewer"
}
```

This example activates the `security-reviewer` Subagent defined in the Plugin's `agents/` directory. Settings from `settings.json` take priority over `settings` declared in `plugin.json`. Unknown keys are silently ignored.

### Organize complex Plugins

For Plugins with many components, organize your directory structure by functionality. For complete directory layouts and organization patterns, see Plugin directory structure.

### Test your Plugins locally

Use the `--plugin-dir` flag to test Plugins during development. This loads your Plugin directly without requiring installation.

```bash
csc --plugin-dir ./my-plugin
```

When a `--plugin-dir` Plugin has the same name as an installed marketplace Plugin, the local copy takes precedence for that session. This lets you test changes to a Plugin you already have installed without uninstalling it first. Marketplace Plugins force-enabled by managed settings are the only exception and cannot be overridden.

As you make changes to your Plugin, run `/reload-plugins` to pick up the updates without restarting. This reloads Plugins, Skills, Subagents, Hooks, Plugin MCP servers, and Plugin LSP servers. Test your Plugin components:

* Try your Skills with `/plugin-name:skill-name`
* Check that Subagents appear in `/agents`
* Verify Hooks work as expected

> **Tip:** You can load multiple Plugins at once by specifying the flag multiple times:

```bash
csc --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

### Debug Plugin issues

If your Plugin isn't working as expected:

1. **Check the structure**: Ensure your directories are at the Plugin root, not inside `.claude-plugin/`
2. **Test components individually**: Check each Skill, Subagent, and Hook separately
3. **Use validation and debugging tools**: See Debugging and development tools for CLI commands and troubleshooting techniques

### Share your Plugins

When your Plugin is ready to share:

1. **Add documentation**: Include a `README.md` with installation and usage instructions
2. **Version your Plugin**: Use semantic versioning in your `plugin.json`
3. **Create or use a marketplace**: Distribute through Plugin marketplaces for installation
4. **Test with others**: Have team members test the Plugin before wider distribution

Once your Plugin is in a marketplace, others can install it using the instructions in Discover and install Plugins.

### Submit your Plugin to the official marketplace

To submit a Plugin to the official Anthropic marketplace, use one of the in-app submission forms:

* **Claude.ai**: claude.ai/settings/plugins/submit
* **Console**: platform.claude.com/plugins/submit

> **Note:** For complete technical specifications, debugging techniques, and distribution strategies, see Plugins reference.

## Convert existing configurations to Plugins

If you already have Skills or Hooks in your `.claude/` directory, you can convert them into a Plugin for easier sharing and distribution.

### Migration steps

#### Create the Plugin structure

Create a new Plugin directory:

```bash
mkdir -p my-plugin/.claude-plugin
```

Create the manifest file at `my-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "my-plugin",
  "description": "Migrated from standalone configuration",
  "version": "1.0.0"
}
```

#### Copy your existing files

Copy your existing configurations to the Plugin directory:

```bash
# Copy commands
cp -r .claude/commands my-plugin/

# Copy agents (if any)
cp -r .claude/agents my-plugin/

# Copy skills (if any)
cp -r .claude/skills my-plugin/
```

#### Migrate Hooks

If you have Hooks in your settings, create a Hooks directory:

```bash
mkdir my-plugin/hooks
```

Create `my-plugin/hooks/hooks.json` with your Hooks configuration. Copy the `hooks` object from your `.claude/settings.json` or `settings.local.json`, since the format is the same. The command receives Hook input as JSON on stdin, so use `jq` to extract the file path:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix" }]
      }
    ]
  }
}
```

#### Test your migrated Plugin

Load your Plugin to verify everything works:

```bash
csc --plugin-dir ./my-plugin
```

Test each component: run your commands, check Subagents appear in `/agents`, and verify Hooks trigger correctly.

### What changes when migrating

| Standalone (`.claude/`)       | Plugin                           |
| :---------------------------- | :------------------------------- |
| Only available in one project | Can be shared via marketplaces   |
| Files in `.claude/commands/`  | Files in `plugin-name/commands/` |
| Hooks in `settings.json`      | Hooks in `hooks/hooks.json`      |
| Must manually copy to share   | Install with `/plugin install`   |

> **Note:** After migrating, you can remove the original files from `.claude/` to avoid duplicates. The Plugin version will take precedence when loaded.
