---
sidebar_position: 3
---

# Run CSC programmatically

> Use the Agent SDK to run CSC programmatically from the CLI, Python, or TypeScript.

The Agent SDK gives you the same tools, agent loop, and context management that power CSC. It's available as a CLI for scripts and CI/CD, or as Python and TypeScript packages for full programmatic control.

> **Note:** The CLI was previously called "headless mode." The `-p` flag and all CLI options work the same way.

To run CSC programmatically from the CLI, pass `-p` with your prompt and any CLI options:

```bash
csc -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"
```

This page covers using the Agent SDK via the CLI (`csc -p`). For the Python and TypeScript SDK packages with structured outputs, tool approval callbacks, and native message objects, see the full Agent SDK documentation.

## Basic usage

Add the `-p` (or `--print`) flag to any `csc` command to run it non-interactively. All CLI options work with `-p`, including:

* `--continue` for continuing conversations
* `--allowedTools` for auto-approving tools
* `--output-format` for structured output

This example asks CSC a question about your codebase and prints the response:

```bash
csc -p "What does the auth module do?"
```

### Start faster with bare mode

Add `--bare` to reduce startup time by skipping auto-discovery of Hooks, Skills, Plugins, MCP servers, auto memory, and CLAUDE.md. Without it, `csc -p` loads the same context an interactive session would, including anything configured in the working directory or `~/.claude`.

Bare mode is useful for CI and scripts where you need the same result on every machine. A hook in a teammate's `~/.claude` or an MCP server in the project's `.mcp.json` won't run, because bare mode never reads them. Only flags you pass explicitly take effect.

This example runs a one-off summarize task in bare mode and pre-approves the Read tool so the call completes without a permission prompt:

```bash
csc --bare -p "Summarize this file" --allowedTools "Read"
```

In bare mode CSC has access to the Bash, file read, and file edit tools. Pass any context you need with a flag:

| To load                 | Use                                                     |
| ----------------------- | ------------------------------------------------------- |
| System prompt additions | `--append-system-prompt`, `--append-system-prompt-file` |
| Settings                | `--settings <file-or-json>`                             |
| MCP servers             | `--mcp-config <file-or-json>`                           |
| Custom agents           | `--agents <json>`                                       |
| Plugin directory        | `--plugin-dir <path>`                                   |

> **Note:** `--bare` is the recommended mode for scripted and SDK calls, and will become the default for `-p` in a future release.

## Examples

These examples highlight common CLI patterns. For CI and other scripted calls, add `--bare` so they don't pick up whatever happens to be configured locally.

### Get structured output

Use `--output-format` to control how responses are returned:

* `text` (default): plain text output
* `json`: structured JSON with result, session ID, and metadata
* `stream-json`: newline-delimited JSON for real-time streaming

This example returns a project summary as JSON with session metadata, with the text result in the `result` field:

```bash
csc -p "Summarize this project" --output-format json
```

To get output conforming to a specific schema, use `--output-format json` with `--json-schema` and a JSON Schema definition. The response includes metadata about the request (session ID, usage, etc.) with the structured output in the `structured_output` field.

This example extracts function names and returns them as an array of strings:

```bash
csc -p "Extract the main function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

> **Tip:** Use a tool like jq to parse the response and extract specific fields:

  ```bash
  # Extract the text result
  csc -p "Summarize this project" --output-format json | jq -r '.result'

  # Extract structured output
  csc -p "Extract function names from auth.py" \
    --output-format json \
    --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
    | jq '.structured_output'
  ```

### Stream responses

Use `--output-format stream-json` with `--verbose` and `--include-partial-messages` to receive tokens as they're generated. Each line is a JSON object representing an event:

```bash
csc -p "Explain recursion" --output-format stream-json --verbose --include-partial-messages
```

The following example uses jq to filter for text deltas and display just the streaming text. The `-r` flag outputs raw strings (no quotes) and `-j` joins without newlines so tokens stream continuously:

```bash
csc -p "Write a poem" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

When an API request fails with a retryable error, CSC emits a `system/api_retry` event before retrying. You can use this to surface retry progress or implement custom backoff logic.

| Field            | Type            | Description                                                                                                                                  |
| ---------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`           | `"system"`      | message type                                                                                                                                 |
| `subtype`        | `"api_retry"`   | identifies this as a retry event                                                                                                             |
| `attempt`        | integer         | current attempt number, starting at 1                                                                                                        |
| `max_retries`    | integer         | total retries permitted                                                                                                                      |
| `retry_delay_ms` | integer         | milliseconds until the next attempt                                                                                                          |
| `error_status`   | integer or null | HTTP status code, or `null` for connection errors with no HTTP response                                                                      |
| `error`          | string          | error category: `authentication_failed`, `billing_error`, `rate_limit`, `invalid_request`, `server_error`, `max_output_tokens`, or `unknown` |
| `uuid`           | string          | unique event identifier                                                                                                                      |
| `session_id`     | string          | session the event belongs to                                                                                                                 |

For programmatic streaming with callbacks and message objects, see the Agent SDK documentation on real-time streaming responses.

### Auto-approve tools

Use `--allowedTools` to let CSC use certain tools without prompting. This example runs a test suite and fixes failures, allowing CSC to execute Bash commands and read/edit files without asking for permission:

```bash
csc -p "Run the test suite and fix any failures" \
  --allowedTools "Bash,Read,Edit"
```

To set a baseline for the whole session instead of listing individual tools, pass a permission mode. `dontAsk` denies anything not in your `permissions.allow` rules, which is useful for locked-down CI runs. `acceptEdits` lets CSC write files without prompting and also auto-approves common filesystem commands such as `mkdir`, `touch`, `mv`, and `cp`. Other shell commands and network requests still need an `--allowedTools` entry or a `permissions.allow` rule, otherwise the run aborts when one is attempted:

```bash
csc -p "Apply the lint fixes" --permission-mode acceptEdits
```

### Create a commit

This example reviews staged changes and creates a commit with an appropriate message:

```bash
csc -p "Look at my staged changes and create an appropriate commit" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

The `--allowedTools` flag uses permission rule syntax. The trailing ` *` enables prefix matching, so `Bash(git diff *)` allows any command starting with `git diff`. The space before `*` is important: without it, `Bash(git diff*)` would also match `git diff-index`.

> **Note:** User-invoked Skills like `/commit` and built-in commands are only available in interactive mode. In `-p` mode, describe the task you want to accomplish instead.

### Customize the system prompt

Use `--append-system-prompt` to add instructions while keeping CSC's default behavior. This example pipes a PR diff to CSC and instructs it to review for security vulnerabilities:

```bash
gh pr diff "$1" | csc -p \
  --append-system-prompt "You are a security engineer. Review for vulnerabilities." \
  --output-format json
```

For more options including using `--system-prompt` to fully replace the default prompt, see the system prompt flags.

### Continue conversations

Use `--continue` to continue the most recent conversation, or `--resume` with a session ID to continue a specific conversation. This example runs a review, then sends follow-up prompts:

```bash
# First request
csc -p "Review this codebase for performance issues"

# Continue the most recent conversation
csc -p "Now focus on the database queries" --continue
csc -p "Generate a summary of all issues found" --continue
```

If you're running multiple conversations, capture the session ID to resume a specific one:

```bash
session_id=$(csc -p "Start a review" --output-format json | jq -r '.session_id')
csc -p "Continue that review" --resume "$session_id"
```
