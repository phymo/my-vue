# setup() - High Level Summary

## What It Is

`setup()` is the **entry point** for Composition API components. It runs **before** the component is created (before `beforeCreate`), and returns what gets exposed to the template.

## How It Works

```
Component Creation:

1. setup(props, context)  ← runs FIRST
   │
   ▼
2. Return object with exposed state/methods
   │
   ▼
3. mounted() hook runs (if defined)
```

## Setup Function Signature

```typescript
setup(props, context) {
  // props: component props (reactive)
  // context: { attrs, slots, emit }
  
  // Define reactive state
  const count = ref(0)
  
  // Return what's available in template
  return {
    count,
    increment
  }
}
```

## context Object

| Property | Description |
|----------|------------|
| `attrs` | Non-prop attributes |
| `slots` | Component slots |
| `emit` | Emit events to parent |

## What setup() Returns

- **Object**: Keys become available in template
- **Function**: Used as render function

## defineComponent()

In real Vue, `defineComponent()` is a **type helper** - helps TypeScript infer component types. At runtime, it's a no-op.

```typescript
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: { title: String },
  emits: ['update'],
  
  setup(props, context) {
    const count = ref(0)
    return { count }
  }
})
```

## h() - Create VNode

```typescript
import { h } from 'vue'

// Create a div element
h('div', 'Hello')

// With children
h('div', [
  h('span', 'A'),
  h('span', 'B')
])
```

## createApp()

```typescript
import { createApp } from 'vue'

const app = createApp(AppComponent)
app.mount('#app')
```

## Lifecycle in setup()

```
Component Life:
  setup()      → returns exposed state
       ↓
  beforeCreate (auto)
       ↓
  mounted     → onMounted() hooks run
       ↓
  updated    → onUpdated() hooks run
       ↓
  beforeUnmount → onBeforeUnmount() hooks run
       ↓
  unmounted   → onUnmounted() hooks run
```

## Key Differences: Options API vs Composition API

| Options API | Composition API |
|------------|---------------|
| `data()` | `setup()` returning refs |
| `methods` | `setup()` returning functions |
| `computed` | `computed()` in setup() |
| `watch` | `watch()` in setup() |
| `mounted` | `onMounted()` in setup() |

## Examples

### Basic Component

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// Automatically available in template
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### With defineComponent

```typescript
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    title: { type: String, required: true }
  },
  
  setup(props) {
    const count = ref(0)
    return { count }
  }
})
```

### With Render Function

```typescript
import { defineComponent, ref, h } from 'vue'

export default defineComponent(() => {
  const count = ref(0)
  
  return () => h('div', count.value)
})
```

## Complete Rendering Flow

Here's how everything connects from `createApp()` to real DOM:

```
createApp(MyComponent)
    │
    ▼
app.mount('#app')
    │
    ▼
1. Create Component Instance
   - Call setup() → get setupState
   - Get render function (if any)
    │
    ▼
2. Call render function → get VNode
   VNode: { type: 'div', children: [...] }
    │
    ▼
3. render(VNode, container) → Real DOM
   - createElement('div')
   - append children recursively
    │
    ▼
4. Mount to DOM container
   container.appendChild(el)
    │
    ▼
5. Call mounted() hooks
```

### Why defineComponent Returns Options

```typescript
// This is what defineComponent does:
export function defineComponent(options) {
  return options  // Just returns options!
}
```

**Why?** Because:

1. **At runtime**: It's a no-op - just returns the options
2. **At TypeScript**: It enables type inference for:
   - `this` in template
   - Props types
   - Emit event types
   - Setup return types

So `defineComponent()` only helps TypeScript. At runtime, it's essentially empty.

### VNode Structure

```typescript
// h('div', 'Hello')
{ type: 'div', children: 'Hello' }

// h('div', [h('span', 'A'), h('span', 'B')])
{
  type: 'div',
  children: [
    { type: 'span', children: 'A' },
    { type: 'span', children: 'B' }
  ]
}
```

### Virtual DOM Benefits

1. **Platform independent**: Same VNode can render to:
   - Web DOM
   - Native iOS/Android
   - Canvas/WebGL
   
2. **Efficient updates**: Vue tracks VNode changes and only updates what's different

3. **Easy testing**: Can test VNode output without DOM

4. **Compiler friendly**: Templates compile to VNode creation functions