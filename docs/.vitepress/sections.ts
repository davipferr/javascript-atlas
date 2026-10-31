// Single source of truth for the site structure.
// Used by the sidebar (config.mts) and by the feature index loader (features.data.ts).

export interface Page {
  text: string
  link: string
}

export interface Section {
  text: string
  icon: string
  description: string
  items: Page[]
}

export const sections: Section[] = [
  {
    text: 'Fundamentals',
    icon: '🧱',
    description: 'Variables, data types, operators, coercion, equality and strings.',
    items: [
      { text: 'Variables & Language Basics', link: '/fundamentals/variables' },
      { text: 'Data Types', link: '/fundamentals/data-types' },
      { text: 'Operators', link: '/fundamentals/operators' },
      { text: 'Coercion, Truthy & Equality', link: '/fundamentals/coercion' },
      { text: 'Strings', link: '/fundamentals/strings' }
    ]
  },
  {
    text: 'Control Flow',
    icon: '🔀',
    description: 'if/else, switch, the ternary operator, expressions and every kind of loop.',
    items: [
      { text: 'Conditionals', link: '/control-flow/conditionals' },
      { text: 'Loops', link: '/control-flow/loops' }
    ]
  },
  {
    text: 'Functions',
    icon: '⚙️',
    description: 'Declarations, arrows, higher-order functions, call/apply/bind and closures.',
    items: [
      { text: 'Function Basics', link: '/functions/basics' },
      { text: 'Higher-Order Functions', link: '/functions/higher-order' },
      { text: 'Closures & IIFE', link: '/functions/closures' }
    ]
  },
  {
    text: 'Behind the Scenes',
    icon: '🔬',
    description: 'Engine and runtime, call stack, scope, hoisting, this and memory.',
    items: [
      { text: 'Engine, Runtime & Call Stack', link: '/behind-the-scenes/engine-runtime' },
      { text: 'Scope & Hoisting', link: '/behind-the-scenes/scope-hoisting' },
      { text: 'The this Keyword', link: '/behind-the-scenes/this' },
      { text: 'Memory, References & Copies', link: '/behind-the-scenes/memory' }
    ]
  },
  {
    text: 'Data Structures & Modern Operators',
    icon: '📦',
    description: 'Objects, destructuring, spread/rest, ?? and ?., Sets and Maps.',
    items: [
      { text: 'Objects', link: '/data-structures/objects' },
      { text: 'Destructuring', link: '/data-structures/destructuring' },
      { text: 'Spread & Rest', link: '/data-structures/spread-rest' },
      { text: 'Modern Operators', link: '/data-structures/modern-operators' },
      { text: 'Sets & Maps', link: '/data-structures/sets-maps' }
    ]
  },
  {
    text: 'Arrays',
    icon: '🗂️',
    description: 'Array basics, map/filter/reduce, searching, sorting, grouping and immutable methods.',
    items: [
      { text: 'Array Basics', link: '/arrays/basics' },
      { text: 'Transforming: map, filter, reduce', link: '/arrays/transformations' },
      { text: 'Searching & Testing', link: '/arrays/searching' },
      { text: 'Sorting, Grouping & Creating', link: '/arrays/sorting-creating' }
    ]
  },
  {
    text: 'Numbers, Dates & Intl',
    icon: '🔢',
    description: 'Parsing and rounding numbers, BigInt, Dates, Intl formatting and timers.',
    items: [
      { text: 'Numbers & Math', link: '/numbers-dates/numbers' },
      { text: 'Dates & Intl', link: '/numbers-dates/dates-intl' },
      { text: 'Timers', link: '/numbers-dates/timers' }
    ]
  },
  {
    text: 'DOM & Events',
    icon: '🖱️',
    description: 'Selecting and changing elements, events, delegation, observers and script loading.',
    items: [
      { text: 'DOM Manipulation', link: '/dom/manipulation' },
      { text: 'Events', link: '/dom/events' },
      { text: 'Scrolling & Observers', link: '/dom/observers' },
      { text: 'Page Lifecycle & Script Loading', link: '/dom/lifecycle' }
    ]
  },
  {
    text: 'Object-Oriented Programming',
    icon: '🧩',
    description: 'Prototypes, constructor functions, classes, encapsulation and inheritance.',
    items: [
      { text: 'Prototypes', link: '/oop/prototypes' },
      { text: 'Classes', link: '/oop/classes' },
      { text: 'Inheritance', link: '/oop/inheritance' }
    ]
  },
  {
    text: 'Browser APIs',
    icon: '🌐',
    description: 'Web Storage, Geolocation, hash routing and third-party libraries.',
    items: [{ text: 'Storage, Geolocation & More', link: '/browser-apis/web-apis' }]
  },
  {
    text: 'Asynchronous JavaScript',
    icon: '⏳',
    description: 'AJAX, Promises, fetch, the event loop, async/await and combinators.',
    items: [
      { text: 'Promises & fetch', link: '/async/promises' },
      { text: 'The Event Loop', link: '/async/event-loop' },
      { text: 'async/await & Combinators', link: '/async/async-await' }
    ]
  },
  {
    text: 'Modules & Tooling',
    icon: '🛠️',
    description: 'ES modules, CommonJS, npm, bundlers, Babel and polyfills.',
    items: [
      { text: 'Modules', link: '/modules/modules' },
      { text: 'npm, Bundlers & Babel', link: '/modules/tooling' }
    ]
  },
  {
    text: 'Architecture & Clean Code',
    icon: '🏛️',
    description: 'Clean modern JS, functional principles, MVC and publisher-subscriber.',
    items: [
      { text: 'Clean & Functional JavaScript', link: '/architecture/clean-code' },
      { text: 'MVC & Publisher-Subscriber', link: '/architecture/mvc' }
    ]
  }
]
