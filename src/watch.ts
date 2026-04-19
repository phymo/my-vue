/**
 * ============================================================
 * WATCH - Watch reactive sources
 * ============================================================
 */

import { effect } from './effect'
import { Ref } from './ref'

export type WatchCallback<T> = (value: T, oldValue: T, onCleanup: (fn: () => void) => void) => void

export interface WatchOptions {
  immediate?: boolean
}

export interface WatchHandle {
  stop: () => void
}

export function watch<T>(
  source: Ref<T> | (() => T),
  callback: WatchCallback<T>,
  options: WatchOptions = {}
): WatchHandle {
  let oldValue: T = undefined as unknown as T
  let cleanupFn: (() => void) | null = null
  let isFirstRun = true

  const runWatch = () => {
    const newValue = typeof source === 'function'
      ? (source as () => T)()
      : (source as Ref<T>).value as any as T

    if (isFirstRun) {
      isFirstRun = false
      if (options.immediate) {
        callback(newValue, oldValue, (fn) => { cleanupFn = fn })
      }
      oldValue = newValue
      return
    }

    if (newValue !== oldValue) {
      if (cleanupFn) cleanupFn()
      callback(newValue, oldValue, (fn) => { cleanupFn = fn })
      oldValue = newValue
    }
  }

  effect(runWatch)

  return { stop: () => {} }
}