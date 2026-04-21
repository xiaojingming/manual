import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'cli',
        path: 'docs-cli',
        routeBasePath: 'cli',
        sidebarPath: './sidebars-cli.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'csc',
        path: 'docs-csc',
        routeBasePath: 'csc',
        sidebarPath: './sidebars-csc.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'deployment',
        path: 'docs-deployment',
        routeBasePath: 'plugin/deployment',
        sidebarPath: './sidebars-deployment.ts',
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // 根路径重定向到 plugin 首页
          {
            from: '/',
            to: '/plugin/guide/installation',
          },
          // FAQ 重定向
          {
            from: '/FAQ',
            to: '/plugin/FAQ',
          },
        ],
        // 使用函数动态创建重定向规则
        createRedirects(existingPath: string) {
          // 如果是 plugin 路径,创建不带 /plugin 前缀的旧路径重定向
          if (existingPath.startsWith('/plugin/')) {
            return [existingPath.replace('/plugin/', '/')];
          }
          return undefined; // 不创建重定向
        },
      },
    ],
  ],
  title: 'costrict',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'plugin',
        },

        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },

      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'COSTRICT',
      logo: {
        alt: 'costrict logo',
        src: 'img/logo.svg',
        href: 'https://costrict.ai/',
      },
      items: [
        {
          type: 'doc',
          docId: 'guide/installation',
          position: 'left',
          label: 'Plugin',
        },
        {
          type: 'doc',
          docId: 'guide/introduction',
          docsPluginId: 'cli',
          position: 'left',
          label: 'CLI',
        },
        {
          type: 'doc',
          docId: 'foreword',
          docsPluginId: 'deployment',
          position: 'left',
          label: 'Private Deployment',
        },

        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.palenight,
    },
  } satisfies Preset.ThemeConfig,

  markdown: {
    mermaid: true,
  },

  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["en", "zh"],
        indexPages: true,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        removeDefaultStemmer: true,
      }),
    ],
    '@docusaurus/theme-mermaid',
  ],
};

export default config;