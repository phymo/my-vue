/**
 * ============================================================
 * EFFECT - Creates reactive effects
 * ============================================================
 */

import { getDep } from './dep'

type EffectFn = () => void | (() => void)

// Currently running effect
let currentEffect: EffectFn | null = null

export function getCurrentEffect() {
  return currentEffect
}

/**
 * effect() - Creates a reactive effect
 * 
 * An effect is a function that automatically re-runs when
 * any reactive value it reads gets updated.
 */
export function effect(fn: EffectFn): EffectFn {
  const reactiveFn = () => {
    currentEffect = fn
    try {
      fn()
    } finally {
      currentEffect = null
    }
  }

  reactiveFn()
  return reactiveFn
}

/**
 * track() - Track a reactive read
 */
export function track(target: object, key: string | symbol) {
  if (currentEffect) {
    const dep = getDep(target, key)
    dep.addSub(currentEffect)
  }
}

/**
 * trigger() - Trigger all effects that depend on a property
 */
export function trigger(target: object, key: string | symbol) {
  const dep = getDep(target, key)
  dep.notify()
}