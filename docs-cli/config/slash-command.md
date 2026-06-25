---
sidebar_position: 5
---

# Custom Commands

Shortcut commands for common operations in CoStrict CLI.

## Overview

Slash commands provide shortcuts for common operations.

## Configuration Location

● Global: ~/.config/costrict/commands/

● Project: .costrict/commands/

## Example

In the project root directory, .costrict/commands/my-test.md:

```
---
description: Run tests with coverage
agent: build
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest fixes.
```

Parameter description: agent is an optional configuration option. If not specified, it will default to your current agent.

**Note**: After configuration, it is recommended to restart the CLI to load commands.

## Testing

![img](img/slash-command/png.webp)

## Other Configurations

● Use the $ARGUMENTS placeholder to pass parameters to the command.

```
---
description: Create a new component
---

Create a new React component named $ARGUMENTS with TypeScript support.
Include proper typing and basic structure.
```

You can also access individual parameters using positional arguments:

$1 - First parameter, $2 - Second parameter, $3 - Third parameter

```
---
description: Create a new file with content
---

Create a file named $1 in the directory $2
with the following content: $3
```

Usage: `/xxx config.json src "{ \"key\": \"value\" }"`

● subtask: true, optional parameter, forces execution as a sub-agent.

● model: anthropic/claude-3-5-sonnet-20241022, optional parameter, configures the model used by the command.
