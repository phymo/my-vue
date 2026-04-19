/**
 * ============================================================
 * REF - Creates a reactive reference
 * ============================================================
 */

import { track, trigger } from './effect'

export interface Ref<T> {
  value: T
}

export function ref<T>(value: T): Ref<T> {
  const refObj = {
    get value() {
      track(refObj, 'value' as any)
      return value
    },

    set value(newValue) {
      value = newValue
      trigger(refObj, 'value' as any)
    }
  }

  return refObj as Ref<T>
}