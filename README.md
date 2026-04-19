# Minimal Vue 3 Reactivity Implementation

A simplified implementation of Vue 3's core reactivity system for learning purposes.

## What's Included

- `reactive()` - Makes an object deeply reactive using Proxy
- `ref()` - Wraps primitives in a reactive reference
- `computed()` - Creates reactive derived values
- `effect()` - Runs functions that auto-re-run on dependency changes

## Core Concepts

### 1. Dep (Dependency)
Each reactive property has a `Dep` instance. Effects subscribe to Dep when reading the property. When the property changes, Dep notifies all subscribed effects.

### 2. currentEffect
- **currentEffect** - Global variable holding the effect currently running
- Set BEFORE executing effect function, reset AFTER it returns
- This is how track() knows what to subscribe

### 3. Track & Trigger
- **track()** - Called when reading a property, uses currentEffect to subscribe
- **trigger()** - Called when writing a property, notifies all dependents

### 3. Proxy
Vue 3 uses JavaScript's `Proxy` to intercept all property operations. The Proxy's `get`/`set` traps call `track()` and `trigger()`.

### 4. targetMap
A `WeakMap<object, Map<key, Dep>>` that stores all dependencies globally.

## How to Test

Run the demo:

```bash
npx ts-node demo.ts
```

### Why did we need `ts-node`?

Node.js by default only understands JavaScript (`.js` files). When we try to run a TypeScript file (`.ts`) directly with Node, we get this error:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/zhou/projects/my-vue/reactivity'
```

This happens because:

1. **Node.js doesn't natively support TypeScript** - It can't import `.ts` files directly
2. **Module resolution fails** - When `demo.ts` has `import { reactive } from './reactivity'`, Node.js looks for a `.js` file but we have `.ts`
3. **Missing configuration** - Without a `tsconfig.json`, TypeScript compiler options aren't defined

**Solution:** Use `ts-node` which:
- Transpiles TypeScript to JavaScript on-the-fly
- Registers TypeScript compiler automatically
- Handles module resolution for `.ts` files

We also added `tsconfig.json` with:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true
  }
}
```

This ensures proper module handling between the TypeScript files.

Expected output:

```
=== reactive() Demo ===
count: 0
count: 1
count: 2

=== ref() Demo ===
ref value: 0
ref value: 10
ref value: 20

=== computed() Demo ===
fullName: Hello World
fullName after change: Hello Vue

=== All demos passed! ===
```

## File Structure

```
my-vue/
├── src/
│   ├── dep.ts        # Dep class, targetMap, getDep()
│   ├── effect.ts    # effect(), currentEffect, track(), trigger()
│   ├── reactive.ts # reactive() - uses effect.ts
│   ├── ref.ts      # ref() - uses effect.ts
│   ├── computed.ts # computed() - uses effect.ts
│   ├── watch.ts    # watch() - uses effect.ts
│   ├── lifecycle.ts # onMounted, onUpdated, onUnmounted
│   └── index.ts   # exports all
├── demo.ts        # Test demos
├── WATCH.md      # watch() documentation
├── LIFEHOOKS.md  # lifecycle hooks documentation
└── README.md    # This file
```

## Module Dependencies

```
dep.ts (core)
    │
    ▼
effect.ts
    │
    ├──► reactive.ts
    ├──► ref.ts
    ├──► computed.ts
    └──► watch.ts
          │
          ▼
    lifecycle.ts (standalone)
```

## Next Steps

This simplified implementation demonstrates the architecture. To dive deeper:

1. Read Vue 3's actual source: `packages/reactivity/src/index.ts`
2. Study how nested effects are handled (effectStack)
3. Learn about `cleanup` for component unmounting
4. Understand `shallowReactive()` and `markRaw()`