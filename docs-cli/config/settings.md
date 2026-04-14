---
sidebar_position: 10
---
# Other Settings

## Tool Permissions

Each permission rule boils down to one of the following cases:

- "allow" — Run without approval

- "ask" — Request approval

- "deny" — Block the operation

Configure in ~/.config/costrict/costrict.json global configuration or costrict.json in the project root directory:

- Use * to match all tools and override permissions for specific tools

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "*": "ask",
    "bash": "allow",
    "edit": "deny"
  }
}
```

- Set all permissions at once

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": "allow"
}
```

- Fine-grained rules

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm *": "allow",
      "rm *": "deny",
      "grep *": "allow"
    },
    "edit": {
      "*": "deny",
      "packages/web/src/content/docs/*.mdx": "allow"
    }
  }
}
```

Permission patterns use simple wildcard matching:

● * matches zero or more arbitrary characters

● ? matches exactly one character

● All other characters are matched literally

- External directories:

```
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "external_directory": {
      "~/projects/personal/**": "allow"
    },
    "edit": {
      "~/projects/personal/**": "deny"
    }
  }
}
```




(5) Agent permissions

You can override permissions for each agent. Agent permissions are merged with global configuration, and agent rules take precedence.

.costrict/agents/review.md:

```
---
description: Code review without edits
mode: subagent
permission:
  edit: deny
  bash: ask
  webfetch: deny
---

Only analyze code and suggest changes.
```

## Environment Variables

- COSTRICT_BASE_URL: CoStrict server address, used for private deployment backend configuration;
- COSTRICT_EXPERIMENTAL_LSP_TOOL: Enable experimental LSP tool;
