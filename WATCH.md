# watch() - High Level Summary

## What It Does

`watch()` observes a reactive source and executes a callback when its value changes.

## API

```typescript
watch(source, callback, options?)
```

### Parameters

- **source**: `Ref<T>` | `() => T`
  - A ref, or a getter function that returns a value
- **callback**: `(newValue, oldValue, onCleanup) => void`
  - Called when source value changes
- **options**: `{ immediate?: boolean }`
  - `immediate: true` - fire callback immediately on init

### Returns

```typescript
{ stop: () => void }
```

## How It Works

```
1. watch(source, cb)
   │
   ▼
2. Create effect() that reads source
   │
   ▼
3. On first run: record oldValue, return (no callback)
   │
   ▼
4. On source change: compare new vs old
   │
   ▼
5. If different: run callback(new, old, onCleanup)
```

## Key Concepts

### 1. Uses effect() internally

```javascript
watch(count, cb)  →  effect(() => count.value)
```

The effect tracks all dependencies automatically.

### 2. First run skips callback

```javascript
const runWatch = () => {
  const newValue = source.value
  
  if (isFirstRun) {
    isFirstRun = false
    if (options.immediate) cb(newValue, undefined, onCleanup)
    oldValue = newValue
    return  // ← skip callback
  }
  
  // subsequent runs: compare and callback
  if (newValue !== oldValue) {
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
}
```

### 3. Immediate option

- Default: lazy - only fires when value **changes**
- `immediate: true` - fires once immediately with `undefined` as old value

### 4. Cleanup function

```javascript
watch(count, (newVal, oldVal, onCleanup) => {
  // Clean up previous side effect
  onCleanup(() => {
    cleanupPreviousApiCall()
  })
})
```

Called before next callback runs - useful for cleanup.

## Examples

### Watch a ref

```javascript
const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(`${oldVal} → ${newVal}`)
})

count.value = 5  // logs: 0 → 5
```

### Watch with getter

```javascript
const state = reactive({ a: 1, b: 2 })

watch(() => state.a, (newVal, oldVal) => {
  console.log(`a: ${oldVal} → ${newVal}`)
})

state.a = 100  // logs: 1 → 100
```

### Immediate mode

```javascript
watch(count, (newVal, oldVal) => {
  console.log(`init: ${newVal}`)
}, { immediate: true })

// Immediately logs: init: 0
```