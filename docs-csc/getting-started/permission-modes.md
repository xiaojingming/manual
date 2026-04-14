---
sidebar_position: 5
---

# Choose a permission mode

> Control whether CSC asks before editing files or running commands. Cycle modes with Shift+Tab in the CLI.

When CSC wants to edit a file, run a shell command, or make a network request, it pauses and asks you to approve the action. Permission modes control how often that pause happens. The mode you pick shapes the flow of a session: default mode has you review each action as it comes, while looser modes let CSC work in longer uninterrupted stretches and report back when done. Pick more oversight for sensitive work, or fewer interruptions when you trust the direction.

## Available modes

Each mode makes a different tradeoff between convenience and oversight. The table below shows what CSC can do without a permission prompt in each mode.

| Mode | What runs without asking | Best for |
| :--- | :--- | :--- |
| `default` | Reads only | Getting started, sensitive work |
| `acceptEdits` | Reads, file edits, and common filesystem commands (`mkdir`, `touch`, `mv`, `cp`, etc.) | Iterating on code you're reviewing |
| `plan` | Reads only | Exploring a codebase before changing it |
| `auto` | Everything, with background safety checks | Long tasks, reducing prompt fatigue |
| `dontAsk` | Only pre-approved tools | Locked-down CI and scripts |
| `bypassPermissions` | Everything except protected paths | Isolated containers and VMs only |

Regardless of mode, writes to protected paths are never auto-approved, guarding repository state and CSC's own configuration against accidental corruption.

Modes set the baseline. Layer permission rules on top to pre-approve or block specific tools in any mode except `bypassPermissions`, which skips the permission layer entirely.

## Switch permission modes

You can switch modes mid-session, at startup, or as a persistent default. The mode is set through these controls, not by asking CSC in chat. Select your interface to see how to change it.

### CLI

**During a session**: press `Shift+Tab` to cycle `default` → `acceptEdits` → `plan`. The current mode appears in the status bar. Not every mode is in the default cycle:

* `auto`: appears after you opt in with `--enable-auto-mode` or the persisted equivalent in settings
* `bypassPermissions`: appears after you start with `--permission-mode bypassPermissions`, `--dangerously-skip-permissions`, or `--allow-dangerously-skip-permissions`; the `--allow-` variant adds the mode to the cycle without activating it
* `dontAsk`: never appears in the cycle; set it with `--permission-mode dontAsk`

Enabled optional modes slot in after `plan`, with `bypassPermissions` first and `auto` last. If you have both enabled, you will cycle through `bypassPermissions` on the way to `auto`.

**At startup**: pass the mode as a flag.

```bash
csc --permission-mode plan
```

**As a default**: set `defaultMode` in settings.

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

The same `--permission-mode` flag works with `-p` for non-interactive runs.



## Auto-approve file edits with acceptEdits mode

`acceptEdits` mode lets CSC create and edit files in your working directory without prompting. The status bar shows `⏵⏵ accept edits on` while this mode is active.

In addition to file edits, `acceptEdits` mode auto-approves common filesystem Bash commands: `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, and `sed`. These commands are also auto-approved when prefixed with safe environment variables such as `LANG=C` or `NO_COLOR=1`, or process wrappers such as `timeout`, `nice`, or `nohup`. Like file edits, auto-approval applies only to paths inside your working directory or `additionalDirectories`. Paths outside that scope, writes to protected paths, and all other Bash commands still prompt.

Use `acceptEdits` when you want to review changes in your editor or via `git diff` after the fact rather than approving each edit inline. Press `Shift+Tab` once from default mode to enter it, or start with it directly:

```bash
csc --permission-mode acceptEdits
```

## Analyze before you edit with plan mode

Plan mode tells CSC to research and propose changes without making them. CSC reads files, runs shell commands to explore, and writes a plan, but does not edit your source. Permission prompts still apply the same as default mode.

Enter plan mode by pressing `Shift+Tab` or prefixing a single prompt with `/plan`. You can also start in plan mode from the CLI:

```bash
csc --permission-mode plan
```

Press `Shift+Tab` again to leave plan mode without approving a plan.

When the plan is ready, CSC presents it and asks how to proceed. From that prompt you can:

* Approve and start in auto mode
* Approve and accept edits
* Approve and review each edit manually
* Keep planning with feedback
* Use Ultraplan for browser-based review

Each approve option also offers to clear the planning context first.

### What the classifier blocks by default

The classifier trusts your working directory and your repo's configured remotes. Everything else is treated as external until you configure trusted infrastructure.

**Blocked by default**:

* Downloading and executing code, like `curl | bash`
* Sending sensitive data to external endpoints
* Production deploys and migrations
* Mass deletion on cloud storage
* Granting IAM or repo permissions
* Modifying shared infrastructure
* Irreversibly destroying files that existed before the session
* Force push, or pushing directly to `main`

**Allowed by default**:

* Local file operations in your working directory
* Installing dependencies declared in your lock files or manifests
* Reading `.env` and sending credentials to their matching API
* Read-only HTTP requests
* Pushing to the branch you started on or one CSC created
* Sandbox network access requests

Run `csc auto-mode defaults` to see the full rule lists. If routine actions get blocked, an administrator can add trusted repos, buckets, and services via the `autoMode.environment` setting.

### When auto mode falls back

Each denied action shows a notification and appears in `/permissions` under the Recently denied tab, where you can press `r` to retry it with a manual approval.

If the classifier blocks an action 3 times in a row or 20 times total, auto mode pauses and CSC resumes prompting. Approving the prompted action resumes auto mode. These thresholds are not configurable. Any allowed action resets the consecutive counter, while the total counter persists for the session and resets only when its own limit triggers a fallback.

In non-interactive mode with the `-p` flag, repeated blocks abort the session since there is no user to prompt.

Repeated blocks usually mean the classifier is missing context about your infrastructure. Use `/feedback` to report false positives, or have an administrator configure trusted infrastructure.

### How the classifier evaluates actions

Each action goes through a fixed decision order. The first matching step wins:

1. Actions matching your allow or deny rules resolve immediately
2. Read-only actions and file edits in your working directory are auto-approved, except writes to protected paths
3. Everything else goes to the classifier
4. If the classifier blocks, CSC receives the reason and tries an alternative

On entering auto mode, broad allow rules that grant arbitrary code execution are dropped:

* Blanket `Bash(*)`
* Wildcarded interpreters like `Bash(python*)`
* Package-manager run commands
* `Agent` allow rules

Narrow rules like `Bash(npm test)` carry over. Dropped rules are restored when you leave auto mode.

The classifier sees user messages, tool calls, and your CLAUDE.md content. Tool results are stripped, so hostile content in a file or web page cannot manipulate it directly. A separate server-side probe scans incoming tool results and flags suspicious content before CSC reads it.

### How auto mode handles subagents

The classifier checks subagent work at three points:

1. Before a subagent starts, the delegated task description is evaluated, so a dangerous-looking task is blocked at spawn time.
2. While the subagent runs, each of its actions goes through the classifier with the same rules as the parent session, and any `permissionMode` in the subagent's frontmatter is ignored.
3. When the subagent finishes, the classifier reviews its full action history; if that return check flags a concern, a security warning is prepended to the subagent's results.

### Cost and latency

The classifier currently runs on Claude Sonnet 4.6 regardless of your main session model. Classifier calls count toward your token usage. Each check sends a portion of the transcript plus the pending action, adding a round-trip before execution. Reads and working-directory edits outside protected paths skip the classifier, so the overhead comes mainly from shell commands and network operations.

## Allow only pre-approved tools with dontAsk mode

`dontAsk` mode auto-denies every tool that is not explicitly allowed. Only actions matching your `permissions.allow` rules can execute; explicit `ask` rules are also denied rather than prompting. This makes the mode fully non-interactive for CI pipelines or restricted environments where you pre-define exactly what CSC may do.

Set it at startup with the flag:

```bash
csc --permission-mode dontAsk
```

## Skip all checks with bypassPermissions mode

`bypassPermissions` mode disables permission prompts and safety checks so tool calls execute immediately. Writes to protected paths are the only actions that still prompt. Only use this mode in isolated environments like containers, VMs, or devcontainers without internet access, where CSC cannot damage your host system.

You cannot enter `bypassPermissions` from a session that was started without one of the enabling flags; restart with one to enable it:

```bash
csc --permission-mode bypassPermissions
```

The `--dangerously-skip-permissions` flag is equivalent.

> **Warning:** `bypassPermissions` offers no protection against prompt injection or unintended actions. For background safety checks without prompts, use auto mode instead. Administrators can block this mode by setting `permissions.disableBypassPermissionsMode` to `"disable"` in managed settings.

## Protected paths

Writes to a small set of paths are never auto-approved, in every mode. This prevents accidental corruption of repository state and CSC's own configuration. In `default`, `acceptEdits`, `plan`, and `bypassPermissions` these writes prompt; in `auto` they route to the classifier; in `dontAsk` they are denied.

Protected directories:

* `.git`
* `.vscode`
* `.idea`
* `.husky`
* `.claude`, except for `.claude/commands`, `.claude/agents`, `.claude/skills`, and `.claude/worktrees` where CSC routinely creates content

Protected files:

* `.gitconfig`, `.gitmodules`
* `.bashrc`, `.bash_profile`, `.zshrc`, `.zprofile`, `.profile`
* `.ripgreprc`
* `.mcp.json`, `.claude.json`
