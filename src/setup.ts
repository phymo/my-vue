/**
 * ============================================================
 * SETUP - Component setup function
 * ============================================================
 */

import { ref, Ref } from './ref'

export interface SetupContext {
  attrs: Record<string, any>
  slots: Record<string, any>
  emit: (event: string, ...args: any[]) => void
}

export interface ComponentOptions {
  props?: Record<string, any>
  emits?: string[]
  setup?: (props: any, context: SetupContext) => any
  mounted?: () => void
  updated?: () => void
  [key: string]: any
}

/**
 * defineComponent - Define a Vue component (simplified)
 * 
 * In real Vue, this is a type helper that enables type inference.
 * At runtime, it's essentially a no-op.
 */
export function defineComponent(options: ComponentOptions): ComponentOptions {
  return options
}

/**
 * createApp - Create a Vue app (simplified)
 * 
 * In real Vue, this creates the app instance and mounts to DOM.
 */
export function createApp(rootComponent: any, rootProps?: any) {
  let rootEl: HTMLElement | null = null
  
  const app = {
    mount(selector: string) {
      rootEl = document.querySelector(selector) as HTMLElement
      return this
    },
    
    unmount() {
      rootEl = null
      return this
    }
  }
  
  return app
}

/**
 * h - Create a virtual DOM node (simplified)
 * 
 * In real Vue, this creates a VNode.
 * For learning: just returns a simple object.
 */
export function h(tag: string, children?: any): any {
  return { type: tag, children }
}

/**
 * Fragment - Wrapper for Fragment vnodes
 */
export function Fragment<T>({ default: children }: { default: () => T }): () => T {
  return children
}