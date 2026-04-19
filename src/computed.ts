/**
 * ============================================================
 * COMPUTED - Creates a computed value
 * ============================================================
 */

import { effect } from './effect'

export interface ComputedRef<T> {
  value: T
}

export function computed<T>(getter: () => T): ComputedRef<T> {
  let result = getter()

  effect(() => {
    result = getter()
  })

  return {
    get value() {
      return result
    }
  }
}