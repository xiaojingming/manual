import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebarsCsc: SidebarsConfig = {
  cscSidebar: [
    'overview',
    'quickstart',
    {
      type: 'category',
      label: 'Getting Started (Detailed)',
      collapsible: true,
      collapsed: true,
      items: [
        'getting-started/features-overview',
        'getting-started/how-claude-code-works',
        'getting-started/common-workflows',
        'getting-started/claude-directory',
        'getting-started/best-practices',
        'getting-started/permission-modes',
        'getting-started/memory',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      collapsible: true,
      collapsed: true,
      items: [
        'configuration/settings',
        'configuration/keybindings',
        'configuration/permissions',
        'configuration/sandboxing',
        'configuration/terminal-config',
        'configuration/output-styles',
        'configuration/fullscreen',
      ],
    },
    {
      type: 'category',
      label: 'Agent',
      collapsible: true,
      collapsed: true,
      items: [
        'agent/sub-agents',
        'agent/agent-teams',
      ],
    },
    {
      type: 'category',
      label: 'Tools and Plugins',
      collapsible: true,
      collapsed: true,
      items: [
        'tools-and-plugins/skills',
        'tools-and-plugins/plugins',
        'tools-and-plugins/mcp',
      ],
    },
    {
      type: 'category',
      label: 'Automation',
      collapsible: true,
      collapsed: true,
      items: [
        'automation/scheduled-tasks',
        'automation/hooks-guide',
        'automation/headless',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsible: true,
      collapsed: true,
      items: [
        'reference/cli-reference',
        'reference/commands',
        'reference/tools-reference',
        'reference/plugins-reference',
        'reference/interactive-mode',
        'reference/hooks',
        'reference/env-vars',
        'reference/checkpointing',
      ],
    },
  ],
};

export default sidebarsCsc;