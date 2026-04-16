import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebarsCli: SidebarsConfig = {
  cliSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsible: true,
      collapsed: true,
      items: [
        'guide/introduction',
        'guide/installation',
        'guide/quick_start',
        'guide/feature',
        'guide/cli',
        // 'guide/ide',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      collapsible: true,
      collapsed: true,
      items: [
        'config/plugins',
        'config/formatters',
        'config/config',
        'config/keybinds',
        'config/language',
        'config/modes',
        'config/models',
        'config/tools',
        'config/settings',
        'config/notify',
        'config/network',
        'config/themes',
        'config/custom-agent',
        'config/slash-command',
        'config/custom-model',
        'config/provider',
        'config/rules',
        'config/custom-tools',
        'config/acp',
        'config/lsp',
        'config/mcp',
        'config/skills',
      ],
    },
    {
      type: 'category',
      label: 'Product Characteristics',
      collapsible: true,
      collapsed: true,
      items: [
        'product-characteristics/init',
        'product-characteristics/project-wiki',
        'product-characteristics/strict-plan',
        'product-characteristics/tdd',
        // {
        //   type: 'category',
        //   label: 'Security Review',
        //   collapsible: true,
        //   collapsed: true,
        //   items: [
        'product-characteristics/security-review/guide',
        //   ],
        // },
        'product-characteristics/strict-spec',
        'product-characteristics/cloud',
      ],
    },
    'best-practices',
    'FAQ',
    'redirect',
  ],
};

export default sidebarsCli;
