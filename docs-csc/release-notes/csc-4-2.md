---
sidebar_position: 1
---

# CSC 4.2 release guide

> This guide is for developers who use CSC today or plan to upgrade. It summarizes the changes from 4.2.0 through 4.2.6 and turns the changelog into practical guidance for daily use.

## Short version

The CSC 4.2 series focuses on **more reliable session recovery, steadier context management, better OpenAI-compatible provider support, stronger Chinese and i18n quality, and timely security fixes**.

If you are using 4.2.0, 4.2.1, 4.2.2, or 4.2.3, upgrade directly to 4.2.6. You get more resilient long-session behavior, better Windows and legacy configuration compatibility, and more reliable third-party model integration.

## Who should upgrade

- **Developers who frequently resume sessions**: The 4.2 series improves `--resume`, `--continue`, session file discovery, and legacy configuration fallback behavior.
- **Developers running long-context tasks**: 4.2.6 enables reactive compact by default and restores automatic compression retry when prompts become too long.
- **Teams using OpenAI-compatible models**: 4.2.4 through 4.2.6 improve retry behavior, error conversion, and structured output for OpenAI-compatible endpoints such as Ollama, DeepSeek, vLLM, and other compatible services.
- **Chinese and bilingual teams**: 4.2.5 improves i18n coverage, CJK width handling, menu shortcuts, and user-facing copy.
- **Security-conscious teams**: Multiple 4.2 releases patch high-severity dependency vulnerabilities through upgrades and overrides.

## Release map

| Version | Focus | User value |
| --- | --- | --- |
| 4.2.6 | Retry, Reactive Compact, security fixes | More resilient APIs, more reliable long-context compression, and several high-severity vulnerability fixes |
| 4.2.5 | i18n, build controls, message metadata | Better Chinese UX, consistent streaming message IDs, and build-time API selection |
| 4.2.4-beta | Tool result merging, OpenAI retry, session lookup | Fewer messages, steadier third-party providers, and easier session recovery |
| 4.2.3 | `/goal` command | Set a session goal and preserve it across resumed sessions |
| 4.2.2 | Session Warm Pool, Knowledge Hub | Lower first-message latency and better knowledge update flows |
| 4.2.1 | Agent panel and UI fixes | Clearer agent state, context usage, and model display |
| 4.2.0 | Legacy compatibility, workspace rename | Smoother migration from older legacy paths and package scopes |

## Key changes and how to use them

### 1. Session recovery and legacy compatibility are more reliable

Starting in 4.2.0, CSC added broad legacy configuration fallback support across session scanning, file history, paste cache, stats cache, backups, memory, plugin marketplace data, and user rule discovery. Later releases improved session resume, file loading, case-insensitive lookup, and assistant prompt fallback.

This means you do not need to manually migrate every old configuration file before upgrading. CSC prefers the newer CoStrict paths and falls back to legacy directories when needed.

Common commands:

```bash
csc --continue
csc --resume <session-id>
```

This is most useful when you:

- continue a previous task after upgrading;
- recover older sessions on Windows;
- resume a project after path casing changes;
- keep legacy configuration while gradually moving to `~/.costrict/` paths.

### 2. Long-context work is steadier

4.2.2 introduced Session Warm Pool and context prewarm to reduce first-message latency. 4.2.4 improved message routing and token usage tracking. 4.2.6 enables reactive compact by default and restores automatic compression retry for prompt-too-long failures.

For users, long-running work becomes less fragile. When the context approaches the model limit, CSC can compact more proactively. When a request fails because the prompt is too long, CSC can retry after automatic compression instead of stopping immediately.

Recommended usage:

- use the latest 4.2 release for large refactors, long investigations, and multi-file tasks;
- use `/goal` to make the task objective explicit;
- let CSC attempt automatic compression before splitting the task manually.

### 3. OpenAI-compatible providers are more production-ready

4.2.4 wraps OpenAI-compatible chat completions in shared retry logic and converts OpenAI errors into CSC-compatible errors. 4.2.6 adds unified retry behavior for 429 and 529 responses, and moves retry error handling into a shared module.

This is important for teams using third-party model endpoints. Temporary rate limits, overloaded services, and compatibility-layer errors now follow a more consistent retry path.

Example configuration:

```bash
export COSTRICT_USE_OPENAI=1
export OPENAI_API_KEY=<your-api-key>
export OPENAI_BASE_URL=<your-openai-compatible-endpoint>
export OPENAI_MODEL=<your-model>

csc
```

4.2.4 also fixes OpenAI structured output handling by mapping output format requests to `response_format` with `json_schema`. If your workflow depends on structured output, tool calls, or automated parsing, use at least 4.2.4-beta; for production usage, prefer 4.2.6.

### 4. `/goal` keeps long sessions focused

4.2.3 adds the `/goal` command to set, clear, and show the current session goal. The goal participates in the query loop and is restored with `--resume` and `--continue`.

Example:

```text
/goal Fix the login failure, add regression tests, and make sure bun run typecheck passes
```

Use it when you:

- want clear acceptance criteria before fixing a complex bug;
- need CSC to stay aligned during a multi-turn refactor;
- resume a session after an interruption;
- collaborate with a team and want the shared objective visible.

### 5. Chinese and i18n UX are more complete

4.2.5 is the main i18n quality release. It applies a broad audit, standardizes terminology such as Agent, Vault, and Plan, externalizes security messages and pipe/IPC copy, and fixes CJK width handling and empty-string fallback in `t()`.

The locales directory also moves from `src/locales/` to the root-level `locales/` directory to improve bundled package compatibility. Permission menus, MCP menus, ConfigTool settings, tool validation messages, and shortcut hints also receive better externalization.

Users should notice:

- more complete Chinese menus and prompts;
- more accurate terminal layout with mixed Chinese and English text;
- fewer untranslated permission and MCP messages;
- stronger i18n checks across source scanning, locale symmetry, component contracts, and CLI smoke tests.

### 6. Security fixes are included throughout the series

The 4.2 series continuously addresses dependency vulnerabilities:

- 4.2.1 upgrades vulnerable dependencies including `shell-quote`, `exporter-prometheus`, and `tmp`;
- 4.2.2 forces `@grpc/grpc-js >= 1.14.4`;
- 4.2.3 forces `esbuild >= 0.28.1`;
- 4.2.4-beta overrides vulnerable `form-data`, `protobufjs`, and `ws` versions;
- 4.2.6 fixes multiple high-severity `hono` and `undici` vulnerabilities.

If you use CSC in enterprise, CI/CD, or remote development environments, these security patches are a strong reason to upgrade.

## What changes after upgrading from 4.2.0 to 4.2.6

The biggest difference is lower day-to-day failure rate, not a dramatic UI redesign:

- historical sessions are easier to recover;
- long-context tasks are less likely to stop because a prompt is too long;
- OpenAI-compatible endpoints can recover from 429 and 529 responses more often;
- Chinese terminal UI is more consistent;
- permission, MCP, and configuration prompts are clearer;
- dependency vulnerability exposure is reduced.

For heavy CSC users, these changes translate into fewer manual recovery steps, fewer repeated prompts, and fewer interruptions from provider instability.

## Upgrade recommendation

### Recommended version

Use **4.2.6** as the 4.2 baseline. It includes the improvements from 4.2.0 through 4.2.5 and adds important retry, compaction, security, and i18n fixes.

```bash
npm install -g @costrict/csc@latest
csc --version
```

### Before upgrading

- If you still use legacy configuration, keep `~/.costrict/` available.
- If you use an OpenAI-compatible provider, confirm `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL` are configured.
- If you use the Chinese UI, run a few common flows after upgrading to confirm menu, permission, and MCP copy look correct.
- If you use CSC in CI or enterprise images, reinstall dependencies so security overrides take effect.

## Version details

### 4.2.6: stability and security fixes

4.2.6 focuses on runtime stability. It enables reactive compact by default, restores prompt-too-long automatic compression retry, and fixes API retry message formatting, MCP ENOENT error classification, permission/MCP menu i18n, and shortcut issues.

The OpenAI-compatible provider gains unified retry behavior for 429 and 529 responses, with added test coverage. Dependencies also receive several high-severity `hono` and `undici` vulnerability fixes.

### 4.2.5: i18n and build controls

4.2.5 is the main Chinese and i18n quality release. It improves terminology consistency, CJK width handling, user-facing text externalization, and L1-L4 i18n scan coverage.

It also adds the `COSTRICT_ENABLED_API` build macro for build-time API selection. Streaming message metadata now reuses one `messageUUID`, making event IDs, transcript storage, and the final assistant message UUID more consistent.

### 4.2.4-beta: tool result merging and provider stability

4.2.4-beta adds `mergeToolResults`, merging `tool_result` content back into the corresponding `tool_use.output` field to reduce message count and improve API efficiency. The OpenAI provider gains shared retry behavior and correct structured output mapping.

Session file lookup also improves with legacy fallback and case-insensitive matching, which is especially useful on Windows.

### 4.2.3: goal management

4.2.3 adds `/goal`, making the session objective explicit state. Goals can be restored after session resume and are integrated into tracking and completion checks.

This is useful for long tasks, complex bug fixes, and team workflows where staying aligned matters.

### 4.2.2: cold-start and knowledge updates

4.2.2 introduces Session Warm Pool and context prewarm to reduce first-message latency. Message Routing supports token calculation after compaction, and Knowledge Hub gains update detection, batch update, and UI status indicators.

It also fixes orphaned batch workers, a Ctrl+Z infinite loop, and legacy fallback for session resume and file loading.

### 4.2.1: agent panel fixes

4.2.1 improves the Agent Detail Panel and related UI. Agent rows show context usage and model information, and the status line removes noisy labels and cost display.

It also fixes model name display, context row layout, slash command suggestion spacing, and session resume diagnostics.

### 4.2.0: migration foundation

4.2.0 is the migration foundation for the series. It adds broad legacy configuration fallback support and moves workspace scopes from `@ant` to `@costrict`.

It also fixes `session.error` emission for streaming API errors, session deduplication, and `/memory` path mismatches.

## Summary

The CSC 4.2 series delivers three main benefits:

1. **Smoother migration**: old configuration, sessions, and legacy directories can still be discovered.
2. **More stable long-running work**: warm pools, reactive compact, prompt-too-long retry, and goal management improve continuity.
3. **More reliable provider compatibility**: OpenAI retry behavior, error conversion, and structured output support make third-party model integration more practical.

For day-to-day use, treat 4.2.6 as the recommended baseline for the 4.2 series.
