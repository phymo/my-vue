/**
 * ============================================================
 * VUE 3 REACTIVITY SYSTEM - Entry Point
 * ============================================================
 */

// Core - dependency tracking
export { targetMap, Dep, getDep } from './dep'

// Effect - the reactive primitive
export { effect, track, trigger, getCurrentEffect } from './effect'

// Reactive API
export { reactive } from './reactive'
export { ref, Ref } from './ref'
export { computed, ComputedRef } from './computed'

// Composed API
export { watch, WatchCallback, WatchOptions, WatchHandle } from './watch'
export {
  onMounted,
  onUpdated,
  onUnmounted,
  onBeforeUnmount,
  triggerLifecycleHook
} from './lifecycle'