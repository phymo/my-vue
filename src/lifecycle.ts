/**
 * ============================================================
 * LIFECYCLE - Lifecycle hooks
 * ============================================================
 */

type LifecycleHookFn = () => void

const lifecycleHooks = {
  mounted: [] as LifecycleHookFn[],
  updated: [] as LifecycleHookFn[],
  unmounted: [] as LifecycleHookFn[],
  beforeUnmount: [] as LifecycleHookFn[]
}

export function onMounted(fn: LifecycleHookFn) {
  lifecycleHooks.mounted.push(fn)
}

export function onUpdated(fn: LifecycleHookFn) {
  lifecycleHooks.updated.push(fn)
}

export function onUnmounted(fn: LifecycleHookFn) {
  lifecycleHooks.unmounted.push(fn)
}

export function onBeforeUnmount(fn: LifecycleHookFn) {
  lifecycleHooks.beforeUnmount.push(fn)
}

export function triggerLifecycleHook(hookName: 'mounted' | 'updated' | 'unmounted' | 'beforeUnmount') {
  const hooks = lifecycleHooks[hookName]
  for (const fn of hooks) {
    fn()
  }
}