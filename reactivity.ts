/**
 * ============================================================
 * MINIMAL VUE 3 REACTIVITY SYSTEM
 * ============================================================
 * This is a simplified implementation of Vue 3's core reactivity.
 * We'll build: reactive(), ref(), effect(), and computed()
 * 
 * Core Concepts in Vue 3 Reactivity:
 * 1. Dep (Dependency) - Tracks which effects depend on a reactive value
 * 2. Effect - A function that re-runs when its dependencies change
 * 3. Track - Recording that an effect reads a reactive value
 * 4. Trigger - Notifying effects to re-run when a value changes
 * ============================================================
 */

// Type for effect callback function
type EffectFn = () => void | (() => void)

// Global map: reactive object -> key -> Dep (dependency collector)
export const targetMap = new WeakMap<object, Map<string | symbol, Dep>>()

// Currently running effect (for tracking)
// Set BEFORE fn() runs, reset AFTER fn() returns
// This allows track() to know what's currently executing
let currentEffect: EffectFn | null = null

/**
 * Dep (Dependency) - The core unit of reactivity tracking
 * 
 * In Vue 3, each reactive property has its own Dep instance.
 * When an effect reads the property, it subscribes to that Dep.
 * When the property changes, Dep notifies all subscribed effects.
 * 
 * Think of it like: Property → Dep → [Effect1, Effect2, ...]
 */
class Dep {
  // Set of effects that depend on this property
  private subscribers = new Set<EffectFn>()

  /**
   * Add an effect as a subscriber
   * Called when we read this property inside an effect function
   */
  addSub(effect: EffectFn) {
    this.subscribers.add(effect)
  }

  /**
   * Remove an effect from subscribers
   */
  removeSub(effect: EffectFn) {
    this.subscribers.delete(effect)
  }

  /**
   * Notify all subscriber effects to re-run
   * This is the "trigger" part of the reactivity system
   */
  notify() {
    // Run all subscriber effects
    // Use for...of instead of forEach for better perf
    for (const effect of this.subscribers) {
      effect()
    }
  }

  /**
   * For debugging: return current subscribers as an array
   */
  getSubscribers() {
    return Array.from(this.subscribers)
  }
}

/**
 * getDep - Get or create a Dep for a specific property
 * 
 * This is essentially targetMap.get(target)[key] with auto-creation
 * @param target - The reactive object (e.g., { count: 0 })
 * @param key - The property name (e.g., 'count')
 */
function getDep(target: object, key: string | symbol): Dep {
  // 1. Get or create the property map for this target
  let deps = targetMap.get(target)
  if (!deps) {
    deps = new Map()
    targetMap.set(target, deps)
  }

  // 2. Get or create the Dep for this specific key
  let dep = deps.get(key)
  if (!dep) {
    dep = new Dep()
    deps.set(key, dep)
  }

  return dep!
}

/**
 * effect() - Creates a reactive effect
 * 
 * This is Vue 3's fundamental reactive primitive.
 * An effect is a function that automatically re-runs when
 * any reactive value it reads gets updated.
 * 
 * @param fn - The function to run reactively
 * @returns The function (so you can dispose/cleanup)
 * 
 * Example:
 * ```js
 * const count = ref(0)
 * effect(() => {
 *   console.log('count is:', count.value)  // Runs immediately, logs "count is: 0"
 * })
 * count.value = 5  // Automatically re-runs, logs "count is: 5"
 * ```
 */
export function effect(fn: EffectFn): EffectFn {
  const reactiveFn = () => {
    currentEffect = fn   // 1. Set BEFORE calling fn()
    try {
      fn()              // 2. fn() runs here - track() sees currentEffect
    } finally {
      currentEffect = null   // 3. Reset AFTER fn() returns
    }
  }

  reactiveFn()
  return reactiveFn
}

/**
 * track() - Begin tracking a reactive read
 * 
 * Called before reading a reactive property inside an effect.
 * Registers the current effect as a subscriber to that property's Dep.
 */
function track(target: object, key: string | symbol) {
  if (currentEffect) {
    const dep = getDep(target, key)
    dep.addSub(currentEffect)
  }
}

/**
 * trigger() - Trigger all effects that depend on a property
 * 
 * Called after writing to a reactive property.
 * Notifies all subscriber effects to re-run.
 */
function trigger(target: object, key: string | symbol) {
  const dep = getDep(target, key)
  dep.notify()
}

// ============================================================
// reactive() - Makes an object reactive
// ============================================================
/**
 * reactive() - Create a deeply reactive object
 * 
 * Vue 3 uses Proxy to intercept all property accesses/writes.
 * This is the core of the reactivity system.
 * 
 * @param target - Plain object to make reactive
 * @returns Proxied version that tracks changes
 * 
 * How it works:
 * 1. Proxy.get traps: track() - record that we read this property
 * 2. Proxy.set traps: trigger() - notify subscribers when written
 * 
 * Example:
 * ```js
 * const state = reactive({ count: 0 })
 * effect(() => console.log(state.count))  // Logs 0
 * state.count = 1  // Automatically logs 1
 * ```
 */
export function reactive<T extends object>(target: T): T {
  // Use Proxy to intercept all property operations
  return new Proxy(target, {
    /**
     * GET trap - Called when reading any property
     * e.g., state.count
     */
    get(target, key) {
      // Mark that we're reading this property (for tracking)
      track(target, key)

      // Return the property value
      // Reflect.get is the "default" behavior
      return Reflect.get(target, key)
    },

    /**
     * SET trap - Called when writing any property
     * e.g., state.count = 5
     */
    set(target, key, value) {
      // Set the new value
      const result = Reflect.set(target, key, value)

      // Trigger all dependent effects
      trigger(target, key)

      return result
    },

    /**
     * DELETE trap - Called when deleting a property
     * e.g., delete state.count
     */
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key)

      // Trigger since the property no longer exists
      trigger(target, key)

      return result
    }
  })
}

// ============================================================
// ref() - Creates a reactive reference
// ============================================================
/**
 * ref() - Creates a reactive reference to a value
 * 
 * ref() is Vue 3's way to handle primitives (strings, numbers, etc.)
 * as reactive values. Since primitives can't be tracked like objects,
 * we wrap them in an object with a .value property.
 * 
 * @param value - The initial value (any type)
 * @returns An object with a .value property
 * 
 * Why ref() instead of reactive() for primitives?
 * - reactive() only works with objects
 * - Primitives are passed by value, can't be proxied
 * - ref() wraps the primitive in an object
 * 
 * Example:
 * ```js
 * const count = ref(0)
 * effect(() => console.log(count.value))  // Logs 0
 * count.value = 10  // Logs 10
 * ```
 */
export function ref<T>(value: T) {
  // The ref object - contains the actual value in .value
  const refObj = {
    // Getter for .value - triggers tracking
    get value() {
      // Track that we're reading this ref
      // In simplified version, we track on the refObj itself
      track(refObj, 'value' as any)
      return value
    },

    // Setter for .value - triggers updates
    set value(newValue) {
      value = newValue
      trigger(refObj, 'value' as any)
    }
  }

  return refObj
}

// ============================================================
// computed() - Creates a computed value
// ============================================================
/**
 * computed() - Creates a computed/reactive value
 * 
 * A computed value is a derived value that automatically
 * updates when its dependencies change.
 * 
 * @param getter - Function that computes the value
 * @returns A read-only ref-like object
 * 
 * How it works:
 * 1. Run getter to get initial value
 * 2. Wrap in effect() to track dependencies
 * 3. On dependency change, re-run getter
 * 
 * Example:
 * ```js
 * const first = ref('Hello')
 * const last = ref('World')
 * const fullName = computed(() => first.value + ' ' + last.value)
 * console.log(fullName.value)  // "Hello World"
 * last.value = 'Vue'
 * console.log(fullName.value)  // "Hello Vue" (auto-updated)
 * ```
 */
export function computed<T>(getter: () => T): { value: T } {
  // Store the computed value
  let result = getter()

  // Create an effect that re-computes when dependencies change
  effect(() => {
    result = getter()
  })

  // Return a read-only ref-like object
  return {
    get value() {
      // Read the cached result (which auto-updates via effect)
      return result
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================
export { Dep }