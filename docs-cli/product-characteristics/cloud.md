---
sidebar_position: 6
---
# CoStrict Cloud

**Official Cloud URL: [https://zgsm.sangfor.com/cloud](https://zgsm.sangfor.com/cloud)**

[CoStrict Cloud](https://zgsm.sangfor.com/cloud/workspace) is an **AI-powered cloud programming workspace** that lets you remotely connect to your personal devices (local or private servers) from any browser. It features conversational AI programming, project file management, multi-session persistence, and remote terminal collaboration — enabling **seamless browser-based remote development, real-time AI coding and debugging, and cross-device project continuity**.

## Quick Start

### 1. Sign In

**Official Cloud Entry: [https://zgsm.sangfor.com/cloud](https://zgsm.sangfor.com/cloud)**

Open the official cloud URL above to enter the web portal, then sign in to your personal account. If you are not signed in, click the **Sign In** button at the bottom of the left sidebar.

> **Important:**
> The CoStrict CLI command-line tool and the CoStrict Cloud web portal **must be signed in with the same account**. If the accounts do not match, the device will not appear in the web portal's device list.

### 2. Register a Device

On the personal computer or server you want to connect to remotely, first install the [CoStrict CLI tool](https://docs.costrict.ai/cli/guide/installation).

Sign in via CLI:

```bash
csc auth login
```

After signing in, run the device registration and startup command:

```bash
csc cloud start
```

> The first time you run `csc cloud start`, it will automatically pull dependency plugins and runtime components from the cloud. Please be patient while the automatic download and installation completes — no manual intervention is required.

Once registered, the device will automatically sync and appear in the **device list** in the left sidebar of the web portal.

### 3. Create a Workspace

1. Visit the default cloud URL: [https://zgsm.sangfor.com/cloud](https://zgsm.sangfor.com/cloud) and open the device list.
2. Find the registered online device and click the **"+" button** on the right side of the device card.
3. Select the target project directory on the device to create the workspace.
4. Each workspace **uniquely maps to an independent project directory** on the device. Multiple projects can be managed via separate, isolated workspaces.

### 4. Connect to a Workspace

When a workspace is in the **idle** state, click the **connect icon** on the right side of the workspace card to establish a remote connection.

Once connected, you can use the following core capabilities:

- **Remote Conversational Programming** — Interact with the AI assistant in real time for requirements, code generation, bug debugging, and logic refactoring.
- **Multi-Session Management** — Freely create, switch between, and revisit sessions with full conversation history preserved.
- **Remote Project Collaboration** — Browse, edit, and run code files on the remote device directly from the browser.
- **Built-in API Documentation** — The service comes with API documentation that can be accessed directly for debugging.

---

## Workspace Core Capabilities

### 1. Mobile Access & Session QR Code Entry

CoStrict Cloud supports accessing workspaces via mobile browser, so you can check workspace runtime status, session content, and pending interactions right from your phone — no need to stay at your desk.

The web session page provides a QR code entry. Scan it with your phone to directly enter the corresponding workspace and specific session. This is ideal for commuting, meetings, and on-the-go scenarios: when an AI session generates a response, requires permission confirmation, or needs additional survey input, you can continue working directly from your phone without having to relocate the device, project directory, or conversation history.

### 2. Create Independent Workspaces on Specific Devices

Cloud workspaces are defined by the core boundary of **device + project directory**. Users can select a target device from the list of registered and online devices, then specify a local project directory on that device to create a workspace.

Each workspace corresponds to an independent project directory on the device, making it suitable for managing different repositories, services, or client projects separately. Once a workspace is created, all AI conversations, file browsing, Git status, and terminal execution are scoped to that directory, reducing the risk of unintended operations in other directories.

### 3. AI Session Status & Multi-Workspace Preview

Cloud provides status indicators designed for parallel multi-workspace usage. The workspace list and session tabs display whether an AI session is running, has unread replies, or has pending permission requests or survey questions that need user attention.

When multiple workspaces are running tasks simultaneously, you can prioritize spaces with interaction prompts, quickly determine which sessions are still executing, which have completed their responses, and which require authorization to proceed — minimizing the risk of missed notifications and idle waiting during long-running AI programming tasks.

### 4. Workspace-Level Auto-Permission Approval

For AI programming tasks that require frequent command execution, file reading, or tool access, Cloud supports enabling auto-permission approval at the workspace level. When enabled, permission events that match the workspace settings are automatically authorized, eliminating the need to repeatedly confirm similar requests in trusted projects.

This toggle takes effect on a per-workspace basis and is suitable for clearly trusted personal projects, test environments, or internal R&D environments. For production environments, sensitive repositories, or uncertain tasks, it is recommended to keep manual confirmation enabled so you retain control over critical operations.

### 5. Reference Directories or Files from Other Workspaces in Conversations

On the same device, Cloud supports referencing directories or specific files from other workspaces within AI conversations, allowing the AI to analyze with more complete engineering context. For example, you can reference a backend directory, documentation directory, or to-do files from a frontend workspace, letting the AI simultaneously understand interfaces, implementations, and requirements.

This capability is ideal for multi-repository collaboration, frontend-backend integration, documentation-driven development, and cross-module troubleshooting. You don't need to merge all code into a single directory or manually copy file contents into prompts — the AI can access context that more closely reflects real-world engineering workflows.

---

## Code & Runtime Environment Capabilities

### 1. Git Status Integration

Workspaces include built-in Git status display, supporting viewing the current branch, whether the repository has uncommitted changes, ahead/behind status, and change counts. Upon entering a workspace, you can quickly assess whether the current directory is clean, has local modifications, or needs to sync with the remote branch first.

This capability brings AI programming tasks closer to real development workflows: before generating code, fixing bugs, or executing commands, you can first confirm the current repository state and avoid stacking further modifications on top of undetected existing changes.

### 2. File Tree & Online File Preview

Cloud provides a remote project file tree, allowing you to expand directories, browse file structures, and open files within the workspace for online preview — all from the browser. For common text content such as code, configuration files, and Markdown documents, you can quickly view file contents without logging into the remote machine or opening a local IDE.

The file tree capability pairs well with AI conversations: you can first locate a target file, then provide its path or contents as context to the AI; or after the AI completes modifications, quickly verify relevant file structures and content changes through the browser.

### 3. Diff List & Change Content Viewing

Cloud supports displaying the Git diff list within a workspace and viewing corresponding files by change status. You can open individual file diffs online to quickly understand code differences introduced by AI or user operations.

This capability is suited for code review, change confirmation, and pre-commit inspection. You don't need to switch to a local terminal and run Git commands — instead, you can view which files have been modified, whether the changes meet expectations, and whether there are still unhandled modifications, all within the Cloud page.

### 4. Web Terminal & Shell Command Execution

Workspaces include a built-in web terminal, allowing you to connect to the remote device from the browser and execute shell commands within the current working directory context. Common scenarios include installing dependencies, running tests, launching scripts, viewing logs, and executing build commands.

The web terminal sits alongside AI sessions, the file tree, and the diff view within the same workspace, enabling you to view AI conversations and code changes while executing verification commands — forming a complete remote development loop.

---

## Notification & Identity Capabilities

### 1. WeCom Bot Notifications & Natural Language Responses

Cloud supports configuring WeCom (WeChat Work) as a notification channel. When an AI session has pending permission requests, survey questions, or other interaction events that haven't been addressed in time, the system can notify you via WeCom bot, preventing tasks from being blocked for extended periods without confirmation.

The WeCom bot is not only for reminders — it also supports natural language responses. You can directly express approval, rejection, supplementary notes, or answer questions within WeCom, and Cloud will relay these as session interactions back to the AI. This is ideal for mobile work, asynchronous collaboration, and team scenarios requiring timely responses.

### 2. Multi-Identity Binding

The Cloud console supports multi-identity binding, allowing you to link GitHub, phone number, IDTrust, and other identities under a single account system. Multi-identity binding reduces account fragmentation caused by logging in from different entry points, ensuring consistent identity across the web portal, CLI, device registration, and organizational collaboration.

- **GitHub binding**: Convenient for logging in with a GitHub account and aligning with code hosting and developer identity scenarios.
- **Phone number binding**: Facilitates account recovery, notification delivery, and personnel identification within organizations.
- **IDTrust binding**: Suitable for enterprise unified identity authentication and internal trusted identity system integration.

When different identities may correspond to existing accounts, Cloud guides you through the binding or merging process to prevent devices, workspaces, and historical data from being scattered across multiple accounts.

---

## Skill Store (Knowledge Hub)

Knowledge Hub (formerly "Skill Store"): [https://zgsm.sangfor.com/cloud/store](https://zgsm.sangfor.com/cloud/store) — a one-stop platform for extending AI programming capabilities. Browse curated skills, sub-agents, commands, MCPs, and plugins. **Subscribe to deploy them to your workspace** and collaborate in sync across your team.

### 1. Five Modules

The Knowledge Hub offers five independently browsable core extension types, usable individually or in combination:

| Module | Purpose | Typical Scenarios |
|---|---|---|
| Skill | A capability package that encapsulates instructions, templates, and workflows for specific tasks, which the AI automatically matches and executes | Standardized processes such as requirements analysis, backend development, frontend design, and deployment operations |
| Sub-agent | An "expert role" focused on a single responsibility, callable by the main AI to collaborate on complex tasks | Role-based agents such as senior Java backend engineer, code audit expert, and test engineer |
| Command | Shortcut commands executable directly in the CLI / conversation, encapsulating scripts / command templates for common operations | One-click deployment, environment initialization, log troubleshooting, and other repetitive operations |
| MCP Server | A standardized tool connector based on the Model Context Protocol, allowing the AI to securely call external services / data | Connecting to external resources such as databases, third-party APIs, and cloud services |
| Plugin | A Claude Code ecosystem marketplace plugin. A single plugin can bundle skills, sub-agents, commands, rules, templates, and other sub-capabilities, installed as a directory tree | One-stop adoption of a full suite of companion capabilities (e.g., a framework's complete scaffolding and best practices) |

> Note: In addition to the above types, **Rules** and **Templates** are also independent capability types, typically installed as sub-items bundled within a plugin.

### 2. Key Information on Capability Cards

Each capability is presented as a card for quick evaluation and selection. Key information includes:

- **Title & Description**: The capability name and a brief summary of its use case
- **Category**: For filtering and discovery
- **Risk Level**: A risk label from security scanning (see "Risk Levels" below)
- **Tags**: Multi-dimensional tags to aid search
- **Source**: The source platform
- **Experience Score**: A gold-star rating reflecting overall experience quality
- **Favorites & Last Updated**: Popularity and freshness indicators
- **"From Plugin" badge**: Indicates the entry originates from a plugin package

Filter by **Category, Risk Level, Tags**, and other dimensions. Sub-categories under the current primary type allow further drill-down.

### 3. Subscribe & Distribute

- **Subscribe to deploy**: Subscribing (favoriting) a capability in the Knowledge Hub automatically deploys it to your workspace. On the device side, use the `/hub` command to manage subscribed capabilities.
- **Proactive distribution**: Capabilities can be distributed to specific users or organizations
  - **Scope**: Individual / Organization
  - **Permission mode**: Read-only (view and use only) / Rejectable (recipients can remove from distribution list)
  - Supports attaching an explanatory message (e.g., "Recommended for the whole team to standardize on this skill")

### 4. Risk Levels

Every capability undergoes security scanning and is labeled with a risk level for informed selection:

| Level | Meaning |
|------|------|
| No Risk | No risks detected |
| Low Risk | Minor risks present, safe to use |
| Caution | Moderate risk — confirm before use |
| High Risk | Significant risk — use with caution |
| Critical Risk | Extremely high risk — evaluate thoroughly before using |

Use the risk level filter in the sidebar to quickly locate capabilities that meet your security requirements.

### 5. Value

- **Ready out of the box**: Subscribe / load with one click — no need to build from scratch
- **Reduce duplication**: Reuse established, standardized capabilities and avoid reinventing the wheel
- **Flexible workflow extension**: Freely combine the five modules to extend specialized capabilities as needed
- **Unified team distribution**: Subscribe to sync to workspaces, enabling team-wide collaboration and sharing

---

## Common Operations

### Start the Cloud Service

After first-time registration or if the service has stopped, run the start command:

```bash
csc cloud start
```

### Restart the Cloud Service

If the device goes offline, connection becomes abnormal, or the service hangs, run the restart command:

```bash
csc cloud restart
```

### Normal Startup Log Example

```
➜  csc cloud start
  ✓ Device registered
  device_id: 21484ad96b82e1468cba65be0e55a666df1aba78834ffdeee19404a5e72b0ce9
  ✓ Device token validated
  → Starting daemon...
  ✓ cs-cloud started
  pid: 16571
  mode: cloud
  url: http://127.0.0.1:56973
  docs: http://127.0.0.1:56973/api/v1/docs
  logs: /User/user/.costrict/cs-cloud/app.log
```

Key information explained:

- `device_id`: Unique device identifier.
- `pid`: Background daemon process ID.
- `url`: Local service access address.
- `docs`: API documentation address.
- `logs`: Log file path, the key reference for troubleshooting.

---

## FAQ

### Q1: The CLI is running, but the device is not visible on the web portal?

**A1:**

1. Make sure you are accessing the default cloud URL: [https://zgsm.sangfor.com/cloud](https://zgsm.sangfor.com/cloud).
2. Verify that the account used for `csc auth login` is **exactly the same** as the web portal account.
3. Run `csc cloud restart` to restart the service and re-sync the device list.
4. Check whether the local network can access the cloud platform normally and that the firewall is not blocking the port.

### Q2: The first `csc cloud start` hangs or downloads slowly?

**A2:**

1. The first startup will automatically pull cloud plugins and dependencies. This is normal behavior.
2. Check the device's network connectivity and try switching networks if needed.
3. Do not manually interrupt the process; wait for the automatic initialization to complete.

### Q3: Workspace connection fails or drops frequently?

**A3:**

1. First, run `csc cloud restart` to restart the local daemon.
2. Check the log file at `~/.costrict/cs-cloud/app.log` for error messages.
3. Confirm that the local firewall or security group is not blocking the service port.

### Q4: How to troubleshoot errors, exceptions, or unavailable features?

**A4:**

For all exceptions, prioritize locating the cause via the **log file**. The log path is:

```
~/.costrict/cs-cloud/app.log
```

You can view full logs covering process start/stop, device authentication, network connections, and plugin loading to quickly identify the root cause.

### Q5: How do I view the local service address and API documentation?

**A5:**

After running `csc cloud start` successfully, the terminal will automatically output:

- Local service access address `url`
- API documentation address `docs`

Copy these directly into your browser to access them.

---

## Learn More

- Official Cloud Entry: [https://zgsm.sangfor.com/cloud](https://zgsm.sangfor.com/cloud)
- Try the Workspace Now: [CoStrict Cloud Workspace](https://zgsm.sangfor.com/cloud/workspace)
- Capability Extensions: [App Store — Skills / Sub-agents / MCP Servers](https://zgsm.sangfor.com/cloud/store)
- Official Docs & Updates: [costrict.ai](https://costrict.ai)
