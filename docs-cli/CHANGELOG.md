# Changelog

All notable changes to the CSC (CoStrict CLI) project are documented in this file.

---

## [4.0.14] - 2026-05-12

### ✨ Highlights

- **Upstream Sync**: Merged community upstream code to v2.4.2, integrating long-accumulated feature enhancements.
- **Review System Refactor**: Migrated review agents and skills to the bundled skill files mechanism (`generate-review-builtin`), now unified and generated from the `costrict-review` repository.
- **Version Info Enhancement**: `--version` output now includes git commit hash and build time.
- **Binary Build Support**: Added `bun compile` script for Linux/Windows binary packaging (`build:binary:*`).

### 🚀 Improvements

- **Dynamic `max_tokens`**: Automatically adjusts `max_tokens` based on the current provider's available model list (CoStrict provider).
- **Agent-Type Header**: Added `x-agent-type` request header for the CoStrict provider.
- **rawDump Module**: New session data raw-dump reporting module with queue + batch worker to prevent 429 errors.
- **GitHub Integration**: Added issue, share, and autofix-pr GitHub-related commands.
- **Local Memory / Vault**: Added `LocalMemoryRecallTool` and Local Vault encrypted storage service.
- **Login & Auth Enhancement**: Supports workspace key, host guard, auth status, and more.
- **Provider Registry**: Added Provider registry center, StatusLine, and Cache Stats.

### 🐛 Bug Fixes

- Fixed severe Node.js memory spikes.
- Fixed beta import name mismatches.
- Fixed rawDump batch worker concurrency cascade and fetch timeout issues.
- Fixed CI test failures caused by Bun `mock.module` cross-file contamination (87 tests).
- Fixed issue-template tests accidentally deleting `.github/workflows` directory.
- Fixed non-UTF-8 encoding file read/write round-trip byte corruption (later reverted).
- Fixed GBK encoding auto-detection support (later reverted).
- Fixed CoStrict provider model list and token estimation issues.
- Moved `undici` to `dependencies` to fix Node.js startup hang caused by `https_proxy` environment variable.

### 🧹 Cleanup & Optimization

- Removed npm auth token from `.npmrc`.
- Disabled the default `FORK_SUBAGENT` feature flag.
- Removed deprecated `ctx_viz` type declarations and obsolete documentation.

### 🏗️ Build & CI

- Added Vite build process support.
- Added Codecov coverage reporting in CI.
- Added review agent generation step in CI.
- Added npm publish workflow.
- Unified `typecheck` command.

---

## [4.0.13] - 2026-04-29

### ✨ Highlights

- **Full Rebrand**: CLI fully renamed from Claude to CoStrict / `csc`, including command-line help output and terminal title.
- Unified all provider User-Agent strings to `csc/${VERSION}`.

### 🚀 Improvements

- **BUDDY Enabled by Default**: Removed date restrictions; available out of the box.
- **Build-Time Feature Flags**: `feature('FLAG_NAME')` is now automatically replaced with `true/false` at build time, eliminating runtime environment variable dependencies.
- **Built-in KB Suite (cosknow)**: The KB knowledge-base suite is now bundled into `csc` and automatically registers commands to `~/.claude/commands/` after installation.

### 🐛 Bug Fixes

- **Fixed CoStrict Provider Recursive Parsing**: `getDefaultSonnetModel` / `getDefaultHaikuModel` now return concrete model names to prevent infinite recursion.
- **Fixed sideQuery / Model Selection**: Corrected model selection logic under CoStrict and OpenAI providers.
- **Fixed Login Prompt Issues**: Added `costrict` to the `is3P` check to eliminate false "Not logged in" prompts after login.
- **Fixed `truncate` Crash**: No longer crashes when receiving `undefined` / `null` input.
- **Fixed ripgrep Installation**: Supports fallback downloads from internal private registry.

### ⚡ Performance

- **Removed Diff Rendering from Message Stream**: Only retains diff display on the permission approval page, reducing memory peak usage.

### 🔒 Security

- **Bash Network Pseudo-Device Detection**: Added security detection for `/dev/tcp`, `/dev/udp`, and other Bash network pseudo-devices.

### 🧪 Tests

- Added test cases for subagent deadlock scenarios.
- Fixed full-run failures in `RemoteTriggerTool` and autonomy tests.

---

## [4.0.12] - 2026-04-24

### 📝 Changes

- Version bumped to 4.0.12.

---

## [4.0.8] - 2026-04-23

### ✨ New Features

- Synchronized latest code from the upstream main repository.
- Remote control web display optimization, status synchronization, and bridging control flow improvements.
- Added support for the ACP protocol.
- Refactored provider hierarchy.
- Added Vite build process.
- Added environment variable support to override `max_tokens` settings.
- Added Langfuse LLM generation logging with tool definitions.

### 🐛 Bug Fixes

- Fixed loading button calculation errors under Node.js.
- Fixed Linux installation issues.
- Fixed type-checking issues.
- **Package**: Added missing `scripts/run-parallel.mjs` to the `files` field, fixing `MODULE_NOT_FOUND` errors during `npm install`.

### 🔄 Changes

- **Commands**: Removed `desktop` command and related registrations.
- **UI**: `LogoV2` now forced to condensed mode, skipping release notes / onboarding detection.
- **Tips**: Updated desktop app hint copy to CoStrict Web.
- **Package**: Package renamed to `@costrict/csc`, description updated to `costrict`.
- **Bin**: Bin command unified to `csc`; removed `ccb`, `ccb-bun`, and `claude-code-best`.

---

## [4.0.6] - 2026-04-16

### ✨ New Features

- Removed runtime dependency on Bun.

---

## [4.0.5] - 2026-04-15

### ✨ New Features

- Major refactor of the tool layer and MCP.
- Completed the first MCP Chrome browser integration version.
- Added Langfuse monitoring support.
- Langfuse tool calls now display in nested structures.
- Brave as a fallback search engine for `WebSearchTool`.
- Supports self-hosted `remote-control-server`.
- Supports **Ultraplan Feature** for advanced multi-agent planning.
- Added `upgrade` / `update` commands.

### 🤖 Agent System

- Added CoStrict agent suite for structured workflows.
- Added TDD workflow (four agents: test design / prepare / execute / run-and-fix).
- Added `QuickExploreAgent`; enabled default planning agents.
- Added `planApply` agent tool list.
- Added StrictPlan mode.

### 🛠️ Skills

- Added `project-wiki` skill for automatic technical documentation generation.
- Added built-in `security-review` skill for code auditing.

### 🐛 Bug Fixes

- Fixed built-in agent prompt tool name reference normalization.
- Fixed Mintlify ignore and sidebar issues.
- Fixed `bun.exe` command recognition on Windows.
- Fixed first-time login validation issues.
- Fixed various type issues.

---

## Earlier Versions

For changes prior to v4.0.5, please refer to the repository commit history.
