/**
 * ============================================================
 * REACTIVE - Makes an object deeply reactive
 * ============================================================
 */

import { track, trigger } from './effect'
import { targetMap } from './dep'

export function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key) {
      track(target, key)
      return Reflect.get(target, key)
    },

    set(target, key, value) {
      const result = Reflect.set(target, key, value)
      trigger(target, key)
      return result
    },

    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key)
      trigger(target, key)
      return result
    }
  })
}