# Changelog

All notable changes to the CSC (CoStrict CLI) project are documented in this file.

---

## [4.2.0] - 2026-06-09

### ✨ New Features
- **Legacy Compatibility**: Added comprehensive legacy `~/.claude/` directory fallback across session scanning, file history, paste cache, stats cache, session env, insights, and transcript reader.
- **Session Management**: `applySortAndLimit` now deduplicates session IDs with primary priority.

### 🐛 Bug Fixes
- **API**: Emit `session.error` on streamed API errors with stream message tracking.
- **Legacy Compatibility**: Added legacy fallback for user `CLAUDE.md` and rules discovery.
- **Legacy Compatibility**: `stats.ts` and `cleanup.ts` now scan legacy `~/.claude/projects/` for session stats and cleanup.
- **Legacy Compatibility**: Replaced hardcoded `~/.claude/history.jsonl` path with config-home resolution.
- **Legacy Compatibility**: Added legacy `~/.claude/backups/` fallback in `findMostRecentBackup`.
- **Legacy Compatibility**: Added legacy `~/.claude/plugins/` fallback for marketplace config.
- **Legacy Compatibility**: Added legacy `~/.claude/` read fallback for 6 subsystems and memory directory.
- **Memory Panel**: Resolved `CLAUDE.md`/`AGENTS.md` path mismatch in `/memory` panel.

### 🏗️ Build & CI
- **Workspace**: Updated workspace scope from `@ant`/`@anthropic-ai` to `@costrict`.

### 🧹 Cleanup & Chores
- Simplified self-verify scripts in `package.json`.
- Removed unused `basename` import in `listSessionsImpl.ts`.

---

## [4.1.12] - 2026-06-08

### ✨ New Features
- **Self-Verify**: Added `--only` filter to run specific scenario subsets and switched the default to the full scenario suite.
- **Self-Verify**: Credentials are now auto-loaded from `settings.json` env section, with support for `ANTHROPIC_AUTH_TOKEN` detection.
- **Self-Verify**: Artifacts now default to being preserved; cleanup is retried on Windows to avoid permission errors.

### 🐛 Bug Fixes
- **Build**: Fixed local dev build to copy the `ripgrep` binary into `dist/vendor`.
- **Self-Verify**: Fixed `stdout`/`stderr` race condition and applied `timeoutMultiplier` correctly.

### 🧹 Cleanup & Chores
- **Brand Compliance**: Pruned stale feature flags and added `LODESTONE` / `CHICAGO_MCP` flags.
- **Docs**: Removed CSC system-architecture doc and moved the self-verify design doc to the repo root.

---

## [4.1.11] - 2026-06-08

### ✨ New Features
- **API**: Propagated `parentAgentId` and `agentId` via HTTP headers across all LLM providers; removed client-side caching from Grok and OpenAI.
- **Session Warm Pool**: Pre-spawns child-process connections to reduce cold-start latency.
- **Self-Verify**: Implemented design-spec gaps — provider detection, credential preflight, stderr severity classification, and isolation audit.
- **Brand Compliance**: Added backward-compatibility for legacy `~/.claude/` config paths, `CLAUDE_CODE_*` / `ANTHROPIC_*` env vars, and `OAUTH_CLIENT_ID` legacy mapping with `COSTRICT_` prefix support.
- **Model Options**: Added `supportsImages` flag to model capabilities.
- **Security**: Added a pre-publish security-scan command to guard against npm dependency poisoning.
- **Self-Verify**: Added full release-p0 scenarios (16 scenarios), smoke scenarios (version, help, model, config-isolation), and reporting modules (JSON, Markdown, console, redaction).

### 🐛 Bug Fixes
- **Costrict Core**: Recursively strips unsupported image blocks from `tool_result` content.
- **Sessions**: Correctly handles stopped session status and passes `eventBus` to `ssePrompt`.
- **Brand Compliance**: Replaced hardcoded `.claude` paths in `loadSkillsDir.ts`, core context loading, bundled skill prompts, CLI output, plugin-management UI, memory/skills/TUI/doctor/rawDump UI, agent wizard labels, core path constants, and the permission system.
- **Brand Compliance**: Updated attribution email from `anthropic.com` to `costrict.ai`; reverted over-replaced Anthropic branding in login/auth and added auto model alias.
- **Build**: Resolved Bun build failure caused by top-level await in the rawDump worker.
- **Brand Compliance**: Removed remaining Claude brand references in tip registry, Ink components, UI strings, env vars, and tool UIs.
- **API**: Restored CoStrict env compatibility and fixed remaining `antModel` imports corrupted by earlier sed replacements.

### 🏗️ Build & CI
- **Brand Compliance**: Added CoStrict brand-compliance integration test suite.

### 🧹 Cleanup & Chores
- Removed brand-compliance test-report and root-cause-analysis docs.
- Updated contributors list.

---

## [4.1.10] - 2026-06-04

### ✨ New Features
- **Matrix Tactical**: Added permission-mode loop hint in the matrix status line.
- **Docs**: Added architecture overview and self-verify design docs.
- **Raw Dump**: Implemented full conversation-history reporting with deduplication to minimize duplicate uploads.
- **Raw Dump**: Split `commit` and `statistics` into independent timers.

### 🐛 Bug Fixes
- **Matrix Tactical**: Clarified API error rendering.
- **UI**: Removed CachePill countdown timer to prevent terminal scrollback.
- **UI**: Applied theme text color to prompt input.
- **Plugins**: Corrected `cospowers` marketplace auto-update name.
- **Matrix Tactical**: Hoisted theme hook and integrated status-field extensions.
- **Raw Dump**: Fixed data-consistency issues (P0/P1), incorrect `incomplete` counts, and negative counters after summary/statistics/conversation reporting.
- **Raw Dump**: `saveTasks` now recalculates `incomplete` to avoid sync drift.
- **Matrix Tactical**: Refined color tokens, tactical prompt presentation, and theme awareness.

### 🧹 Cleanup & Chores
- Reverted accidental `.husky/pre-commit` shebang addition.
- Removed redundant code.
- Updated contributors list.

---

## [4.1.9] - 2026-06-01

### 🐛 Bug Fixes
- **Matrix Tactical**: Replaced Chinese text with English in the permission-review banner.
- **Matrix Tactical**: Aligned background colors with the theme base to remove visible color blocks.
- **Intranet**: Fixed test mock pollution and added `require()` comments.
- **Date Switching**: Fixed missing yesterday-change statistics when switching dates.

### ✨ New Features
- **Poor Mode**: Added three-state semantics with intranet-default support.
- **Intranet**: Added CoStrict intranet-detection helper and bootstrap caching.
- **Matrix Tactical**: Added per-segment status coloring, correct prompt width, left border, tone-to-text color mapping, amber double-line border for permission frames, and segmented status-line colors by metric type.

### 🧹 Cleanup & Chores
- Untracked local plans and specs from branch tracking.
- Updated contributors list.

---

## [4.1.8] - 2026-05-29

### ✨ New Features
- **Server**: Made pending queries async with CWD-based session filtering.
- **Plugins**: Hot-reload cloud-favorited plugins without restart.
- **Matrix Tactical**: Added prompt footer styling, status-line presentation, tool-use line, permission frame, welcome presentation, bracket-frame loading format with blinking cursor, triangle-glyph spinner, and presentation helpers.
- **Server**: Normalized SSE event data with automatic `type` field injection.
- **Matrix Tactical**: Registered CLI theme and migrated default theme config.
- **Raw Dump**: Auto-creates the `raw-dump` directory on startup.
- **Compaction**: Adapted SSE translation layer for compact events.
- **API Errors**: Added friendly error messages and actionable remediation suggestions.

### 🐛 Bug Fixes
- **Serve**: Emits completed events for tools when `tool_result` doesn't arrive via stdout.
- **Costrict**: Caches intranet base URL during startup for `poorMode` default.
- **Matrix Tactical**: Corrected tool-category color values and matching priority.
- **Matrix Tactical**: Memoized `displayMessage` and fixed glimmer width for bracket format.
- **Matrix Tactical**: Restored prompt border for non-matrix themes.
- **Matrix Tactical**: Preserved status-reset metadata and kept footer hint inline.
- **Matrix Tactical**: Refreshed status-reset countdown.
- **Matrix Tactical**: Aligned status-line border with prompt edge.
- **Matrix Tactical**: Hardened presentation helpers and aligned presentation boxes.
- **Matrix Tactical**: Truncated presentation-box titles.
- **Matrix Tactical**: Rendered tool tags outside text and preserved tool-state layout metadata.
- **Matrix Tactical**: Used explicit `ThemeProvider` in spinner-glyph tests.
- **Config**: Used raw migration during config saves and persisted theme-migration guard.
- **Raw Dump**: Fixed anonymous-reporting URL error, improved diff-building robustness, and added exception handling.
- **Sessions**: Resolved session-status updates and permission API errors.
- **Events**: Removed duplicate `control_request` events for `AskUserQuestion` and elicitation.
- **Build**: Disabled code splitting and background completion cache update.

### 🧹 Cleanup & Chores
- Updated contributors list.
- Removed docs/superpowers plans and specs from branch tracking.
- Fixed console version-display text.

---

## [4.1.7] - 2026-05-28

### ✨ New Features
- **Matrix Tactical**: Extracted stalled-spinner color with theme awareness, integrated status line and prompt footer into theme, centralized action prefixes, and extended matrix awareness to error/thinking messages.
- **Raw Dump**: Added statistics reporting and dead-letter logging for messages exceeding max retry count; improved retry-queue reliability and fixed conversation-reporting omissions.
- **Refactor**: Switched `X-Request-ID` from UUID v4 to UUID v7.
- **Matrix Tactical**: Replaced static welcome info with session context.

### 🐛 Bug Fixes
- **Raw Dump**: Fixed task `incomplete` count double-increment issue and queue-empty completion check.
- **Matrix Tactical**: Fixed a series of reporting failures.
- **Raw Dump**: Fixed date-format issues in statistics reporting and corrected `.claude` directory JSONL parsing.

### 🧹 Cleanup & Chores
- Updated contributors list.

---

## [4.1.6] - 2026-05-25

### ✨ New Features
- **Plugin Marketplace Reconciliation**: Cloud-favorited plugins are now automatically reconciled into the native `/plugin` panel. Unfavoriting a plugin uninstalls it locally, and removing a cloud favorite triggers an auto-sync unload.
- **Aggregated Marketplace**: Plugin reconciliation now uses the aggregated `costrict-plugins` marketplace for broader coverage.
- **Session ID Tracking**: Added `X-Session-Id` header to CoStrict and OpenAI provider requests for improved traceability.
- **Stream Input Preview**: Early tool input previews are now shown in stream events for faster feedback.

### 🐛 Bug Fixes
- **Session Status Management**: Improved session status handling to prevent stale or inconsistent states.
- **React Compiler Stability**: Replaced JSX with `React.createElement` in `processBashCommand` to prevent React Compiler crashes.
- **Plugin Reconcile Hardening**: Strengthened plugin reconciliation logic per code review feedback.

---

## [4.1.5] - 2026-05-22

### ✨ New Features
- **Tabbed `/hub` Interface**: Refactored the `/hub` command into a tabbed interface with category tabs for easier navigation.
- **Memory Cloud Sync**: Added memory cloud synchronization to the `costrict-web` API.
- **Permission Input Normalization**: Added input normalization to permission metadata for more consistent handling.

### 🐛 Bug Fixes
- **Session Delete Event Scope**: Restricted `session.deleted` events to API DELETE operations only, preventing unintended triggers.
- **Raw-Mode Bash Input**: Stripped the `!` prefix in raw-mode bash input and added defense-in-depth guards.
- **Cloud Command Stdin**: Resolved stdin issues in cloud commands by switching to a fast-path execution model.
- **File Handle Cleanup**: Replaced `await using` with manual `try-finally` for more reliable file handle cleanup.
- **Serve Mode Tool Events**: Fixed tool event emission in serve mode for proper UI rendering.
- **Search Extra Tools Schema**: `search-extra-tools` now returns the correct input schema in discover mode results.

### 🧹 Cleanup & Chores
- Added build artifacts to `.gitignore`.

---

## [4.1.4] - 2026-05-21

### ✨ New Features
- **Standalone Auto-Update**: Added a new standalone auto-update mechanism for smoother upgrades.
- **Command Execution Logging**: Added execution logging for cloud commands to aid debugging.
- **Subagent Status in Messages API**: The messages API now returns parts with accurate `running` status for active subagents.
- **Cost-Optimized Auxiliary Tasks**: CoStrict now uses the cheapest model (by `creditConsumption`) for haiku-tier auxiliary tasks.

### 🚀 Improvements / Refactors
- **Cloud Spawn Performance**: Optimized `cs-cloud` spawn performance and removed extraneous debug logging.
- **Execution Log Level**: Changed execution log output from `debug` to `info` level for better visibility.
- **Subagent Transcript Lookup**: Optimized subagent transcript lookup with caching, meta-based resolution, and startup indexing.

### 🐛 Bug Fixes
- **Linux Cloud Command Hangs**: Prevented cloud commands from hanging on Linux.
- **Task Updates Without Tool Calls**: Recovered task updates that were missing associated tool calls.
- **Tool Use Status Default**: Defaulted `tool_use` status to `completed` during transcript decomposition.
- **Task Progress Part Matching**: Used `callID` matching for more reliable task progress part updates.
- **Tool Name Normalization**: Normalized tool names and removed `metadata.sessionId` from `running`/`completed` events.
- **Favorite List Filtering**: The favorite list route now correctly respects the `type` query parameter.
- **WeChat Startup Guard**: Avoided startup initialization when no WeChat account is configured.
- **Ctrl+Enter Terminal Behavior**: Fixed Ctrl+Enter to insert a newline in standard terminals instead of sending the message.
- **OpenAI Reasoning Fallback**: Added fallback handling for non-standard `reasoning` / `reasoning_details` fields in the OpenAI stream adapter.

### 🏗️ Build & CI
- **Serve Event Standardization**: Added documentation for serve event standardization and consumer capabilities.

---

## [4.1.3] - 2026-05-19

### ✨ New Features
- **Raw Dump Parent IDs**: Added `parent_ids` to the raw-dump commit payload for richer lineage tracking.

### 🐛 Bug Fixes
- **Image Input Compatibility**: Handled image input for broader model compatibility in CoStrict.
- **Windows LSP ENOENT**: Fixed LSP server startup `ENOENT` errors on Windows.
- **Bun YAML Parser Guard**: Added a guard for Bun YAML parser availability to prevent runtime errors.

---

## [4.1.2] - 2026-05-18

### 🚀 Improvements / Refactors
- **Feature Flag Unification**: `dev.ts` and `build.ts` now uniformly import feature flags from `defines.ts`.

### 🐛 Bug Fixes
- **OpenAI Streamed Tool Arguments**: Rejected invalid streamed tool arguments to prevent downstream errors.
- **Cloud Favorite Lifecycle**: Fixed cloud favorite status priority and runtime lifecycle handling.
- **Git Bash Raw Input**: Restored raw input handling for Git Bash in Ink-based terminals.
- **Context Collapse**: Disabled `CONTEXT_COLLAPSE` to fix issues where automatic compression was not triggering.
- **Missing Task Tool Call Failures**: Surfaced failures from missing task tool calls instead of silently dropping them.
- **Marketplace Auto-Update Config**: Made marketplace auto-update configurable by default.

### 🏗️ Build & CI
- **Contributors Documentation**: Updated contributors documentation.

---

## [4.1.1] - 2026-05-16

### 🐛 Bug Fixes
- **Empty Agent Definitions**: Reloaded empty agent definitions correctly in the menu.
- **Hub Skills in Command List**: Ensured `/hub` enabled skills appear in the command list immediately.
- **OpenAI Missing Streamed Tool Calls**: Recovered missing streamed tool calls from the OpenAI adapter.
- **Ink UI Cleanup**: Cleared the Ink UI on REPL shutdown to prevent visual artifacts.
- **Serve Thinking Fragments**: Skipped thinking-only message fragments in serve mode to prevent duplicate responses in `cs-cloud`.

---

## [4.1.0] - 2026-05-15

### ✨ New Features
- **Footer Memory/PID Toggle**: Added `showMemoryPid` setting to toggle the footer memory and PID display.

### 🐛 Bug Fixes
- **MCP Server Availability Hints**: Added availability hints for failed MCP servers in the list panel.
- **Favorite Sync State**: Synchronized load/unload state for favorites and improved error visibility.
- **Update Failure Diagnostics**: Enhanced update failure diagnostics and prevented accidental `claude` symlink deletion.
- **Raw Dump Commit Order**: Reversed commit order in raw-dump to prevent duplicate uploads.
- **cs-cloud Linux Hang**: Used `process.argv` to get raw args for `cs-cloud`, fixing the Linux hang issue.
- **Raw Dump User-Agent**: Added `User-Agent` header to raw-dump worker requests.
- **UUID Type Guards**: Added type guards and null checks for UUID handling in snip functionality.
- **Windows Terminal Startup**: Prevented terminal startup failures on Windows.
- **SnipTool Undefined Messages**: Handled undefined `message_ids` in `SnipTool.call()`.
- **Agent Team Idle Coordination**: Fixed idle teammate coordination failures in agent teams.
- **Bash Foreground Task Wake**: Fixed foreground task wake behavior after auto-backgrounding.
- **Cursor ANSI Offset Recovery**: Handled ANSI wrapped line offset recovery for improved terminal cursor positioning.

### 🚀 Improvements / Refactors
- **Upgrade Command Simplification**: Removed special handling for the upgrade command, simplifying the logic.

---

## [4.0.26] - 2026-05-15

### 🐛 Bug Fixes
- **Dependencies**: Moved `semver` from `devDependencies` to `dependencies` to fix runtime issues.

---

## [4.0.25] - 2026-05-15

### 🏗️ Build & CI
- **NPM Publish**: Removed `--ignore-scripts` from publish command to ensure post-install hooks run correctly.
- **Build Switch**: Switched from Vite build to default build for stability.

---

## [4.0.24] - 2026-05-15

### 🐛 Bug Fixes
- **Ink Terminal**: Treat newline as return and suppress favorite fetch errors in TUI.

### 🏗️ Build & CI
- **Binary Publish**: Added publish binary workflow for automated binary releases.

---

## [4.0.23] - 2026-05-14

### 🏗️ Build & CI
- **NPM Publish**: Pinned Bun version, added Vite build, and ignored scripts on publish for reproducibility.

---

## [4.0.22] - 2026-05-14

### 🐛 Bug Fixes
- **Node.js v20 Compatibility**: Replaced `using` syntax with `withDisposable` for Node.js v20 compatibility.
- **Built-in Skills**: Fixed `listBuiltinSkills` import name mismatch.

### ✨ New Features
- **Cloud Command**: Restored cloud subcommand registration.

---

## [4.0.21] - 2026-05-14

### ✨ New Features
- **Favorites**: Optimized favorite list caching and expanded MCP type support.

### 🏗️ Build & CI
- **NPM Publish**: Added debug output and fault tolerance to version bump step.
- **CI Tags**: Recreate tag if it points to an old commit.

---

## [4.0.20] - 2026-05-14

### 🏗️ Build & CI
- **NPM Publish**: Added SSH setup and review builtin generation to publish workflow.
- **Tags**: Dropped `v` prefix from tags and skipped tests in publish workflow.
- **Workflow**: Corrected boolean condition for workflow dispatch inputs.

### 🐛 Bug Fixes
- **Auth Path**: Updated credential path comments to `~/.costrict/share/auth.json`.
- **Serve Binary**: Fixed compiled binary serve subprocess crash caused by unknown `--feature` option.

---

### 🏗️ Build & CI
- **NPM Publish**: Restricted to manual trigger, added dry-run support, normalized version input, and auto-create missing tags.

### ✨ New Features
- **Auth Branding**: Updated OAuth flow message to reference Costrict branding.
- **Third-Party Provider Gating**: Added remote API control config to gate third-party providers.

### 🐛 Bug Fixes
- **Serve Command**: Replaced fake server command stub with real serve implementation.
- **Permission Events**: Fixed permission events being swallowed by `shouldAvoidPermissionPrompts` in serve mode.

---

### ✨ New Features
- **Raw Dump**: Enabled raw dump by default with a reporting module supporting local mode and deduplication.
- **Server**: Optimized child process management and message reliability (inspired by vibe-kanban architecture).
- **Compact Mode**: Added CoStrict model support and prevented infinite compaction loops.

### 🚀 Improvements
- **Raw Dump Performance**: Reduced CPU usage and fixed worker spawn reliability.

### 🐛 Bug Fixes
- **CoStrict Provider**: Fixed child agent model alias inheritance from parent model.
- **Server Agent Switch**: Fixed missing system prompt injection when switching built-in agents, and prevented `@agent` from appearing in user messages.
- **Review Skills**: Cleaned target directory before extracting review skills.
- **Session Transcripts**: Delete disk transcript files when deleting historical sessions.
- **Windows**: Fixed `generate-review-builtin` cwd path for Windows.

---