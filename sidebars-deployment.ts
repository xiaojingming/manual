import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebarsDeployment: SidebarsConfig = {
  deploymentSidebar: [
    'foreword',
    'introduction',
    'code-review',
    'casdoor',
    'docker-offline-install',
    'deploy-faq',
    'release-notes',
    'others',
    {
      type: 'category',
      label: 'Legacy Configuration',
      items: [
        'old-version-config/higress',
        'old-version-config/auto-model-config',
      ],
    },
  ],
};

export default sidebarsDeployment;
