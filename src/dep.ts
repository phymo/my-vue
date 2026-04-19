/**
 * ============================================================
 * DEP (Dependency) - Core unit of reactivity tracking
 * ============================================================
 */

type EffectFn = () => void | (() => void)

// Global map: reactive object -> key -> Dep
export const targetMap = new WeakMap<object, Map<string | symbol, Dep>>()

/**
 * Dep - The core unit of reactivity tracking
 * 
 * Each reactive property has its own Dep instance.
 * When an effect reads the property, it subscribes to that Dep.
 * When the property changes, Dep notifies all subscribed effects.
 */
export class Dep {
  private subscribers = new Set<EffectFn>()

  addSub(effect: EffectFn) {
    this.subscribers.add(effect)
  }

  removeSub(effect: EffectFn) {
    this.subscribers.delete(effect)
  }

  notify() {
    for (const effect of this.subscribers) {
      effect()
    }
  }

  getSubscribers() {
    return Array.from(this.subscribers)
  }
}

/**
 * getDep - Get or create a Dep for a specific property
 */
export function getDep(target: object, key: string | symbol): Dep {
  let deps = targetMap.get(target)
  if (!deps) {
    deps = new Map()
    targetMap.set(target, deps)
  }

  let dep = deps.get(key)
  if (!dep) {
    dep = new Dep()
    deps.set(key, dep)
  }

  return dep!
}