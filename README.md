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

### 2. Track & Trigger
- **track()** - Called when reading a property, records the dependency
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
├── reactivity.ts   # Core implementation
├── demo.ts        # Test demos
└── README.md     # This file
```

## Next Steps

This simplified implementation demonstrates the architecture. To dive deeper:

1. Read Vue 3's actual source: `packages/reactivity/src/index.ts`
2. Study how `activeEffect` stack prevents infinite loops
3. Learn about `cleanup` for component unmounting
4. Understand `shallowReactive()` and `markRaw()`