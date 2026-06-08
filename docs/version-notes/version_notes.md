---
sidebar_position: 1
---

# v1.6.2

## v1.6.2 Feature Preview

### 1. Quick Model Selection & Agent Auto Mode
CoStrict's latest release introduces Auto Mode, which intelligently selects the most suitable model for each task by comprehensively evaluating the current model list's performance, speed, and Credit consumption. We recommend this mode for users without specific model preferences. Click the second button below the input box to switch models.

{/* ![alt text](./img/1.png) */}

### 2. New codebase Service
The Codebase Index is an intelligent system that performs structured parsing, correlation, and storage of code repositories. By establishing efficient retrieval mechanisms for code elements (such as functions, classes, variables, and call relationships), it enhances code review accuracy. CoStrict builds the Codebase index before executing code reviews.

You can view the build progress and details in the "Settings > Context" module. The CoStrict plugin checks and synchronizes the Codebase index every few minutes by default, and automatically triggers index synchronization when files change. Users can enable or disable indexing (not recommended, as it affects code review functionality).

To configure excluded files, click the "Edit" button below the "Ignore File Configuration" module to add index file configurations to the .coignore file.

{/* ![alt text](./img/2.png) */}

### 3. Command Execution Support for Blacklist/Whitelist
Added command whitelist and blacklist in the auto-approval execution module. The whitelist contains command prefixes that can be automatically executed when "Auto-approve command-line operations" is enabled. Add * to allow all commands (not recommended).

Rejected commands (blacklist): Command prefixes that will be automatically filtered out (excluded). When conflicts occur with allowed commands, the longest prefix match takes precedence. Add * to reject all commands.

{/* ![alt text](./img/3.png) */}

### 4. Optimized Code Review Accuracy
Code review accuracy has been significantly improved.
Issues that users manually click "Reject" on will be automatically filtered out or have their occurrence probability reduced during subsequent code reviews.
Added confidence level in filtering conditions - higher confidence values result in fewer matching issues, and vice versa. We recommend using the "Moderate" setting.

{/* ![alt text](./img/4.png) */}

### 5. New Tool Support (todolist, simpleReadFileTool, etc.)
CoStrict has added the Todo List feature. For complex tasks, multi-step tasks, and in Architect mode, CoStrict automatically enables the Todo List feature. It lists the main steps of tasks and reflects the current task stage in real-time.

Click the bar below the task card at the top to expand and view all Todo List items. A white hollow circle indicates pending, a yellow solid circle indicates in progress, and a green solid circle indicates completed.
The list will also appear promptly during conversations to help you track task progress.

{/* ![alt text](./img/5.png) */}

### 6. Optimized Disk Usage and Oversized File Alerts
On the history page, CoStrict automatically calculates the disk space occupied by all historical tasks and reminds users to clean up disk space when it's insufficient.

{/* ![alt text](./img/6.png) */}

{/* ![alt text](./img/7.png) */}

### 7. Multi-file Reading
Users can set the concurrent file reading limit in the "Settings > Context > Concurrent File Reading Limit" module. Higher values may speed up reading multiple small files but will increase memory usage.

{/* ![alt text](./img/8.png) */}

### 8. Multi-file Editing
When enabled, CoStrict can edit multiple files in a single request. When disabled, CoStrict must edit files one by one. Consider disabling this feature when using less capable models or when more precise control over file modifications is needed.

{/* ![alt text](./img/9.png) */}

### 9. Independent User Information Section
Added a unified account management entry page, accessible by clicking the account avatar in the upper right corner of the CoStrict plugin panel. Click "View Account Details" to jump to the web page to view account information and quotas. Supports "Sign Out" and "Sign In Again" functions.

{/* ![alt text](./img/10.png) */}

### 10. Support for Manual MCP Refresh
Click the "..." button in the upper right corner of the plugin panel, select the MCP server option, and add the "Refresh MCP Server" feature on the MCP server page.

{/* ![alt text](./img/11.png) */}

### 11. Support for History Input Navigation with Arrow Keys
Support for quickly switching between historical conversation prompts using keyboard up/down arrows - up arrow for previous historical input, down arrow for next historical input.

### 12. Dialog Input Persistence
Input text will no longer be cleared when switching to other pages.

### 13. Custom Quick Commands
Common prompts can now be set as quick commands. Click the "Manage Slash Commands" button below the dialog box to support defining global commands and workspace commands. Slash commands allow you to create reusable prompts and workflows that can be triggered instantly. Convert complex multi-step processes into single commands, standardize team practices, and automate repetitive tasks using simple markdown.

{/* ![alt text](./img/12.png) */}

### 14. Support for Hiding [Auto-Approve]
On the "Settings > Auto-Approve" page, uncheck "Display options above chat box" and the option will no longer be fixed at the top of the dialog box.

{/* ![alt text](./img/13.png) */}

#### More features waiting for you to explore