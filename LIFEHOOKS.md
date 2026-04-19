# Lifecycle Hooks - High Level Summary

## What They Are

Lifecycle hooks let you register callbacks to run at specific points in a component's life.

## API

### Registration Functions

| Function | When It Runs |
|----------|-------------|
| `onMounted(fn)` | After component mounts (attached to DOM) |
| `onUpdated(fn)` | After component re-renders (DOM updated) |
| `onUnmounted(fn)` | After component removes from DOM |
| `onBeforeUnmount(fn)` | Before component removes from DOM |

## How It Works

```
Component Life Cycle:

  create → mount → update → update → ... → beforeUnmount → unmount
              ↑           ↑                                 ↑
           onMounted   onUpdated                        onBeforeUnmount → onUnmounted
```

## Implementation

### Simple Registry Pattern

```javascript
const lifecycleHooks = {
  mounted: [],
  updated: [],
  unmounted: [],
  beforeUnmount: []
}

function onMounted(fn) {
  lifecycleHooks.mounted.push(fn)
}

function onUpdated(fn) {
  lifecycleHooks.updated.push(fn)
}

function onUnmounted(fn) {
  lifecycleHooks.unmounted.push(fn)
}

function onBeforeUnmount(fn) {
  lifecycleHooks.beforeUnmount.push(fn)
}

// Call at appropriate time
function triggerLifecycleHook(hookName) {
  for (const fn of lifecycleHooks[hookName]) {
    fn()
  }
}
```

### In Vue's Actual Implementation

In real Vue 3:

1. **setup()** runs first - registers hooks via `onMounted()`, etc.
2. Component **mounts** - Vue calls all registered `onMounted` hooks
3. Component **updates** - Vue calls all registered `onUpdated` hooks
4. Component **unmounts** - Vue calls `onBeforeUnmount`, then removes DOM, then calls `onUnmounted`

## Examples

### Basic Usage

```javascript
import { onMounted, onUpdated, onUnmounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('Component mounted!')
    })
    
    onUpdated(() => {
      console.log('Component updated!')
    })
    
    onUnmounted(() => {
      console.log('Component unmounted!')
    })
    
    return {}
  }
}
```

### with `<script setup>`

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const count = ref(0)

onMounted(() => {
  console.log('Setup: mounted')
  
  // Good place for: event listeners, timers, API calls
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  console.log('Setup: unmounted')
  
  // Good place for: cleanup
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  // ...
}
</script>
```

## Real World Use Cases

| Hook | Good For |
|------|----------|
| `onMounted` | DOM refs, event listeners, initial API fetch |
| `onUpdated` | DOM manipulations after update |
| `onBeforeUnmount` | Save state, confirm dialogs |
| `onUnmounted` | Cleanup: remove listeners, cancel timers |

## Key Points

1. **Only work in `setup()`** - not in Options API data/computed
2. **called synchronously** - during component lifecycle
3. **Callstack order** - parent → children on mount, children → parent on unmount
4. **Cleanup is critical** - prevent memory leaks from listeners/timers