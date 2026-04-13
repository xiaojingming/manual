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
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsible: true,
      collapsed: true,
      items: [
        'guide/installation',
        'guide/quick_start',
        'guide/feature',
      ],
    },
    {
      type: 'category',
      label: 'Product Features',
      collapsible: true,
      collapsed: true,
      items: [
        'product-features/code-completion',
        'product-features/prompt',
        'product-features/slash-command',
        'product-features/todolist',
        'product-features/ai-agent',
        'product-features/project-wiki',
        'product-features/mcp',
        'product-features/skills',
        'product-features/rules',
        // {
        //   type: 'category',
        //   label: 'Code Review',
        //   collapsible: true,
        //   collapsed: true,
        //   items: [
        'product-features/code-review/guide',
        //     // 'product-features/code-review/gitlab-integration',
        //     // 'product-features/code-review/overview',
        //     // 'product-features/code-review/benchmarks',
        //   ],
        // },
        // {
        //   type: 'category',
        //   label: 'Security Review',
        //   collapsible: true,
        //   collapsed: true,
        //   items: [
        //     // 'product-features/security-review/overview',
        'product-features/security-review/guide',
        //     // 'product-features/security-review/benchmarks',
        //   ],
        // },
        'product-features/plan',
        'product-features/strict-mode',
      ],
    },
    {
      type: 'category',
      label: 'Local deployment',
      collapsible: true,
      collapsed: true,
      items: [
        'deployment/foreword',
        'deployment/introduction',
        'deployment/higress',
        'deployment/casdoor',
        'deployment/auto-model-config',
        'deployment/docker-offline-install',
        'deployment/deploy-faq',
        'deployment/release-notes',
        'deployment/others',
      ],
    },
    {
      type: 'category',
      label: 'Best Practices',
      collapsible: true,
      collapsed: true,
      items: [
        'best-practices/best-practices1',
        'best-practices/best-practices2',
        'best-practices/best-practices3',
        'best-practices/user-manual',
      ],
    },
    'FAQ',
    'tutorial-videos/video',
    {
      type: 'category',
      label: 'Billing',
      collapsible: true,
      collapsed: true,
      items: [
        'billing/usage',
        'billing/purchase',
        'billing/service',
      ],
    },
    {
      type: 'category',
      label: 'Version notes',
      collapsible: true,
      collapsed: true,
      items: [
        'version-notes/version_notes',
        'version-notes/version_notes2.0.0',
        'version-notes/version_notes2.1.0',
      ],
    },
    {
      type: 'category',
      label: 'Others',
      collapsible: true,
      collapsed: true,
      items: [
        'policy/privacy-policy',
        'policy/terms-of-service',
      ],
    },
  ],
};

export default sidebars;
