# npm, Bundlers & Babel

The build pipeline that takes many modules and modern syntax and turns them into fast, compatible production files.

## An Overview of Modern JavaScript Development

> In development you write many modules plus npm packages. A **build step** bundles them, transpiles modern syntax, adds polyfills, and minifies for production.

**Development → build → production**
1. **Bundling**: join modules into a few optimized files, remove unused code (tree-shaking), split chunks.
2. **Transpiling / polyfilling**: convert new syntax to older equivalents (Babel, esbuild, SWC) and add missing APIs (core-js).
3. **Minifying**: strip whitespace, shorten names, compress.

Common tools: **Vite** (esbuild + Rollup), webpack, Parcel, Rollup, Turbopack.

::: tip When to use
Any app with more than a couple of scripts or any npm dependency. For a tiny static page, plain `<script type="module">` with no build is fine.
:::

## Introduction to npm

> npm (Node Package Manager) installs packages from the registry into `node_modules` and records them in `package.json`. `package-lock.json` pins exact versions.

```bash
npm init -y                     # create package.json
npm install leaflet lodash-es   # runtime dependencies
npm install -D vite eslint      # dev-only tools (devDependencies)
npm install                     # reinstall everything from package.json (e.g. after cloning)
npm ci                          # clean, exact install from the lockfile (CI servers)
npm run build                   # run a script from package.json
npx vite                        # run a package binary without installing globally
npm outdated && npm update      # check and update
```

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": { "leaflet": "^1.9.4" },
  "devDependencies": { "vite": "^5.4.0" }
}
```

**Semver:** `^1.9.4` allows `1.x.x` updates; `~1.9.4` allows `1.9.x`; `1.9.4` exact. Never commit `node_modules`; always commit the lockfile.

::: tip When to use
Every project with dependencies. Use `npm ci` in CI/CD (like GitHub Actions deploys) for reproducible builds.
:::

## Bundling and npm Scripts

> A bundler starts at your entry file, follows every `import`, and outputs optimized bundles. npm scripts give each task a short command.

```js
// Import npm packages by name: the bundler resolves them from node_modules
import cloneDeep from 'lodash-es/cloneDeep';
import { format } from 'date-fns';

// Assets and CSS can be imported too
import './styles.css';
import logoUrl from './logo.svg';

// Environment variables (Vite)
const API_URL = import.meta.env.VITE_API_URL;

// Hot Module Replacement: keep state while editing in dev
if (import.meta.hot) import.meta.hot.accept();
```

```bash
npm run dev     # dev server with HMR on http://localhost:5173
npm run build   # optimized files in dist/
```

**Parcel** (used in the course) needs zero config: `parcel index.html`. **Vite** is today's common default for the same workflow.

::: tip When to use
Vite for new vanilla/React/Vue/Svelte projects; keep the existing bundler in established codebases. Check `dist/` sizes after a build to catch accidentally huge dependencies.
:::

## Configuring Babel and Polyfilling

> **Transpiling** rewrites new **syntax** (`?.`, classes, arrows) into older syntax. **Polyfilling** adds missing **APIs** (`Promise`, `Array.prototype.at`) as real code. You need both for old browsers.

```js
// Syntax: transpiled
const city = user?.address?.city ?? 'N/A';
// → var _user$address; var city = (_user$address = user?.address) ... (ES5 output)

// APIs: can't be transpiled, must be polyfilled
[1, 2, 3].at(-1);
Object.groupBy(items, fn);
Promise.allSettled(list);

// Polyfill everything you use (based on your browserslist targets)
import 'core-js/stable';
```

```jsonc
// package.json: which browsers to support (used by Babel, Autoprefixer, Vite plugins)
{ "browserslist": ["> 0.5%", "last 2 versions", "not dead"] }
```

| Transpile | Polyfill |
| --- | --- |
| New **syntax** | New **built-in APIs** |
| `?.`, `??`, classes, arrows, spread | `Promise`, `fetch`, `Array.at`, `Object.groupBy`, `structuredClone` |
| Babel, esbuild, SWC, TypeScript | core-js, polyfill services |

::: tip When to use
Only when your audience needs it. Define targets with browserslist; modern evergreen-only apps can skip most polyfills (Vite targets modern browsers by default, and `@vitejs/plugin-legacy` adds them for old ones).
:::
