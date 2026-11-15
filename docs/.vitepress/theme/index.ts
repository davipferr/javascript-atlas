import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import FeatureIndex from './components/FeatureIndex.vue'
import SectionMap from './components/SectionMap.vue'
import ParetoPath from './components/ParetoPath.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FeatureIndex', FeatureIndex)
    app.component('SectionMap', SectionMap)
    app.component('ParetoPath', ParetoPath)
  }
} satisfies Theme
