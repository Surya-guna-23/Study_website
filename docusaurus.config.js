// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Surya Study Materials',
  tagline: 'DSA patterns with visual dry runs · JavaScript polyfills · clean solutions',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  markdown: {
    format: 'detect', // .md → CommonMark (no JSX), .mdx → MDX
  },

  // Set the production url of your site here
  url: 'https://surya-studymaterial.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served.
  // Vercel serves from the domain root, so this must be '/'.
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'Surya-guna-23', // Your GitHub org/user name.
  projectName: 'Study_website', // Your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/Surya-guna-23/Study_website/tree/main/',
          showLastUpdateTime: true,
          breadcrumbs: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/Surya-guna-23/Study_website/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    'docusaurus-lunr-search',
    [
      'docusaurus-plugin-image-zoom',
      /** @type {import('docusaurus-plugin-image-zoom').PluginOptions} */
      ({
        selector: '.markdown img',
        background: {
          light: 'rgba(30, 30, 46, 0.85)',
          dark: 'rgba(0, 0, 0, 0.9)',
        },
        config: {
          margin: 24,
          scrollOffset: 0,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      announcementBar: {
        id: 'star_repo',
        content:
          '⭐ If these notes help you, star the repo on <a target="_blank" rel="noopener noreferrer" href="https://github.com/Surya-guna-23/Study_website">GitHub</a>!',
        backgroundColor: '#25c2a0',
        textColor: '#1e1e2e',
        isCloseable: true,
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Surya Study Materials',
        logo: {
          alt: 'Surya Study Materials Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'dsaSidebar',
            position: 'left',
            label: 'DSA',
          },
          {
            type: 'docSidebar',
            sidebarId: 'polyfillsSidebar',
            position: 'left',
            label: 'Polyfills',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/Surya-guna-23/Study_website',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Study Notes',
            items: [
              {
                label: 'DSA',
                to: '/docs/dsa/intro',
              },
              {
                label: 'Polyfills',
                to: '/docs/polyfills/intro',
              },
            ],
          },
          {
            title: 'Practice',
            items: [
              {
                label: 'LeetCode',
                href: 'https://leetcode.com/',
              },
              {
                label: 'Striver (TakeUForward)',
                href: 'https://takeuforward.org/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/Surya-guna-23/Study_website',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Surya Study Materials. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java'],
      },
    }),
};

export default config;
