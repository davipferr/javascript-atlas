import { defineConfig } from 'vitepress'
import { sections } from './sections'

export default defineConfig({
  title: 'JavaScript Atlas',
  description: 'A map of JavaScript features: short explanations, real-world examples and when to use each one.',
  lang: 'en-US',
  // GitHub Pages serves the site at https://<user>.github.io/javascript-atlas/
  base: '/javascript-atlas/',
  lastUpdated: true,

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/javascript-atlas/logo.svg' }]],

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: false
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Feature Index', link: '/features' },
      { text: 'Start', link: '/fundamentals/variables' }
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [{ text: 'Feature Index', link: '/features' }]
      },
      ...sections.map((section) => ({
        text: `${section.icon} ${section.text}`,
        collapsed: false,
        items: section.items
      }))
    ],

    outline: { level: 2, label: 'Features on this page' },

    search: { provider: 'local' },

    docFooter: { prev: 'Previous', next: 'Next' },

    footer: {
      message: 'Personal JavaScript reference built from my course notes.',
      copyright: 'JavaScript Atlas'
    }
  }
})
