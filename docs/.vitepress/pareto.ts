// The 80/20 path: the ~20% of the atlas that gives a full-stack developer with zero
// JavaScript knowledge ~80% of what they use every day.
//
// Every `features` entry is the exact title of a `## ` heading on that page.
// ParetoPath.vue resolves them against features.data.ts, so links and summaries stay
// in sync with the content (a title that no longer exists is flagged on the page).

export interface ParetoRead {
  page: string // page link, e.g. '/fundamentals/variables'
  features: string[] // feature titles on that page, in reading order
}

export interface ParetoStep {
  title: string
  goal: string // "Be able to…"
  why: string // why this is in the 20%
  reads: ParetoRead[]
}

export interface ParetoLater {
  page: string
  why: string
}

export const paretoSteps: ParetoStep[] = [
  {
    title: 'Values and variables',
    goal: 'Store values in variables, choose between const and let, and recognize every primitive type, including null and undefined.',
    why: 'Every line of JavaScript works with values in variables. Using const by default and knowing why var is avoided prevents a whole class of bugs.',
    reads: [
      { page: '/fundamentals/variables', features: ['Values and Variables', 'let, const and var'] },
      { page: '/fundamentals/data-types', features: ['Primitive Types', 'undefined vs null'] }
    ]
  },
  {
    title: 'Making decisions',
    goal: 'Write conditions that behave as you expect: truthy and falsy values, === instead of ==, if/else and the ternary.',
    why: 'Coercion and loose equality are the most common source of "JavaScript is weird" bugs. The ternary is everywhere in UI code.',
    reads: [
      { page: '/fundamentals/coercion', features: ['Truthy and Falsy Values', 'Equality: == vs ==='] },
      {
        page: '/control-flow/conditionals',
        features: ['if / else Statements', 'The Conditional (Ternary) Operator']
      }
    ]
  },
  {
    title: 'Strings and loops',
    goal: 'Build strings with template literals and loop over any list with for...of.',
    why: 'Template literals replace string concatenation, and for...of is the loop you will write most. Array methods (step 6) replace most of the rest.',
    reads: [
      { page: '/fundamentals/strings', features: ['Template Literals'] },
      { page: '/control-flow/loops', features: ['The for...of Loop'] }
    ]
  },
  {
    title: 'Functions',
    goal: 'Write function declarations and arrow functions, and pass functions to other functions as callbacks.',
    why: 'Functions are the building block of every program, and callbacks are what array methods, events, promises and Express handlers all use.',
    reads: [
      { page: '/functions/basics', features: ['Function Declarations', 'Arrow Functions'] },
      { page: '/functions/higher-order', features: ['Functions Accepting Callbacks'] }
    ]
  },
  {
    title: 'Objects and modern syntax',
    goal: 'Create and read objects, loop over their entries, and use destructuring, spread, ?? and ?. without thinking.',
    why: 'API payloads, configs, props and DB rows are all objects. This modern syntax appears in nearly every file of a React or Node codebase.',
    reads: [
      {
        page: '/data-structures/objects',
        features: ['Object Literals', 'Looping Objects: Keys, Values and Entries']
      },
      { page: '/data-structures/destructuring', features: ['Destructuring Objects'] },
      { page: '/data-structures/spread-rest', features: ['The Spread Operator'] },
      {
        page: '/data-structures/modern-operators',
        features: ['The Nullish Coalescing Operator (??)', 'Optional Chaining (?.)']
      }
    ]
  },
  {
    title: 'Arrays',
    goal: 'Add and remove items, and turn lists of data into the shape you need with map, filter, reduce and find.',
    why: 'Most full-stack work is turning a list of records into another list: rendering rows, totals, search results. These five methods cover most of it.',
    reads: [
      { page: '/arrays/basics', features: ['Basic Mutating Methods'] },
      {
        page: '/arrays/transformations',
        features: ['The map Method', 'The filter Method', 'The reduce Method']
      },
      { page: '/arrays/searching', features: ['The find Method'] }
    ]
  },
  {
    title: 'How JavaScript really behaves',
    goal: 'Explain why changing a copied object also changes the original, what a closure is, and why this differs in arrow functions.',
    why: 'These three ideas explain the bugs that confuse beginners most: shared object references, stale values in callbacks and a lost this.',
    reads: [
      {
        page: '/behind-the-scenes/memory',
        features: ['Primitives vs Objects in Memory', 'Shallow Copies']
      },
      { page: '/functions/closures', features: ['Closures'] },
      { page: '/behind-the-scenes/this', features: ['Regular Functions vs Arrow Functions'] }
    ]
  },
  {
    title: 'Asynchronous code',
    goal: 'Call an API with fetch, use async/await with try...catch, and run independent requests in parallel.',
    why: 'Every full-stack app waits for something: the network, the database, the file system. async/await is how all of it is written today.',
    reads: [
      {
        page: '/async/promises',
        features: ['Synchronous vs Asynchronous Code', 'Promises and the Fetch API']
      },
      {
        page: '/async/async-await',
        features: [
          'Consuming Promises with async/await',
          'Error Handling with try...catch',
          'Running Promises in Parallel (Promise.all)'
        ]
      }
    ]
  },
  {
    title: 'Modules and npm',
    goal: 'Split code into files with import/export, read require() in Node code, and install packages with npm.',
    why: 'No real project is one file, and every project depends on npm packages. Node code still uses CommonJS in many places.',
    reads: [
      {
        page: '/modules/modules',
        features: ['Exporting and Importing in ES Modules', 'CommonJS Modules']
      },
      { page: '/modules/tooling', features: ['Introduction to npm'] }
    ]
  },
  {
    title: 'The browser',
    goal: 'Find elements on a page, change their content and react to user events.',
    why: 'The front end runs on the DOM. Frameworks hide most of it, but these three ideas are what they do underneath.',
    reads: [
      {
        page: '/dom/manipulation',
        features: ['Selecting Elements', 'Reading and Changing Content']
      },
      { page: '/dom/events', features: ['Handling Events with addEventListener'] }
    ]
  },
  {
    title: 'Classes and clean code',
    goal: 'Read and write a class, and prefer declarative, modern code in your own work.',
    why: 'Classes appear in libraries, errors and back-end frameworks. Clean, declarative habits are what makes your code easy to review.',
    reads: [
      { page: '/oop/classes', features: ['ES6 Classes'] },
      {
        page: '/architecture/clean-code',
        features: ['Modern Language Choices', 'Declarative vs Imperative Code']
      }
    ]
  }
]

// The remaining ~80% of the atlas, grouped by page: read it when a real need shows up.
export const paretoLater: ParetoLater[] = [
  { page: '/behind-the-scenes/engine-runtime', why: 'Good to know how the engine works, but it rarely changes the code you write.' },
  { page: '/behind-the-scenes/scope-hoisting', why: 'With const, let and modules, hoisting and the TDZ rarely bite. Read it when a ReferenceError surprises you.' },
  { page: '/oop/prototypes', why: 'Classes hide prototypes. Read it to understand what classes do underneath.' },
  { page: '/oop/inheritance', why: 'Modern code prefers composition. Read it when a framework asks you to extend a class.' },
  { page: '/functions/higher-order', why: 'call, apply and bind are rare since arrow functions arrived.' },
  { page: '/data-structures/sets-maps', why: 'Useful for unique values and fast lookups. Arrays and objects cover most cases first.' },
  { page: '/numbers-dates/dates-intl', why: 'Dates and formatting matter when you build a feature that shows them.' },
  { page: '/async/event-loop', why: 'Explains the order async code runs in. Read it once async/await feels natural.' },
  { page: '/dom/observers', why: 'Scroll effects and lazy loading are specific UI features.' },
  { page: '/architecture/mvc', why: 'An architecture for vanilla apps. Frameworks give you their own structure.' },
  { page: '/modules/tooling', why: 'Bundlers and Babel come preconfigured in Vite, Next.js and similar templates.' }
]
