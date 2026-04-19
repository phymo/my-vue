/**
 * ============================================================
 * SETUP - Component, App, and Rendering
 * ============================================================
 */

import { ref, Ref } from './ref'
import { effect } from './effect'
import { reactive } from './reactive'

// ============================================================
// 1. VNode - Virtual DOM Node
// ============================================================
export interface VNode {
  type: string | ((props?: any) => VNode)  // 'div' or render function
  props?: Record<string, any>
  children?: VNode[] | string
  key?: string
}

/**
 * h() - Create a Virtual DOM node
 * 
 * VNode is a JavaScript object describing a DOM element.
 * Vue uses it to track and update the real DOM.
 * 
 * VNode structure:
 * {
 *   type: 'div',           // tag name
 *   props: { id: 'app' }, // attributes
 *   children: [...]      // child VNodes
 * }
 */
export function h(tag: string, children?: VNode[] | string): VNode {
  return { type: tag, children }
}

// ============================================================
// 2. Component Instance
// ============================================================
export interface ComponentInstance {
  props: Record<string, any>
  setupState: Record<string, any>
  render?: () => VNode
  mounted?: () => void
}

/**
 * createComponentInstance - Create component from options
 * 
 * Flow:
 * 1. Create props from options
 * 2. Call setup() to get exposed state
 * 3. If setup returns a function, use it as render
 * 4. Return component instance
 */
function createComponentInstance(options: ComponentOptions, rootProps?: any): ComponentInstance {
  // 1. Create props object
  const props = reactive({ ...rootProps })
  
  // 2. Create setup context
  const context: SetupContext = {
    attrs: {},
    slots: {},
    emit: (event: string, ...args: any[]) => {
      console.log(`[emit] ${event}:`, args)
    }
  }
  
  // 3. Call setup() if defined
  let setupState: Record<string, any> = {}
  let renderFn: (() => VNode) | undefined = undefined
  
  if (options.setup) {
    const result = options.setup(props, context)
    
    // If setup returns a function, it's the render function
    if (typeof result === 'function') {
      renderFn = result as () => VNode
    } else {
      // Otherwise, treat as exposed state
      setupState = reactive(result as Record<string, any>)
    }
  }
  
  // 4. Return instance
  return {
    props,
    setupState,
    render: renderFn,
    mounted: options.mounted
  }
}

// ============================================================
// 3. render() - Convert VNode to Real DOM
// ============================================================
/**
 * render() - Convert VNode to real DOM element
 * 
 * Flow:
 * 1. Create element from VNode.type (tag name)
 * 2. Set attributes from VNode.props
 * 3. Create child elements from VNode.children
 * 4. Append to parent
 */
function render(vnode: VNode, parent: HTMLElement): HTMLElement {
  // 1. Create element
  const el = document.createElement(vnode.type as string)
  
  // 2. Set props/attributes (simplified)
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      el.setAttribute(key, String(value))
    }
  }
  
  // 3. Handle children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      // Text node
      el.textContent = vnode.children
    } else if (Array.isArray(vnode.children)) {
      // Child VNodes - recurse
      for (const child of vnode.children) {
        const childEl = render(child, el)
        el.appendChild(childEl)
      }
    }
  }
  
  return el
}

// ============================================================
// 4. defineComponent - Component Definition
// ============================================================
export interface SetupContext {
  attrs: Record<string, any>
  slots: Record<string, any>
  emit: (event: string, ...args: any[]) => void
}

export interface ComponentOptions {
  name?: string
  props?: Record<string, any>
  emits?: string[]
  setup?: (props: any, context: SetupContext) => Record<string, any> | (() => VNode)
  mounted?: () => void
  [key: string]: any
}

/**
 * defineComponent() - Define a component
 * 
 * At RUNTIME: just returns the options object.
 * At TYPESCRIPT: enables type inference for template.
 * 
 * This is why it's called a "type helper" -
 * it doesn't do anything at runtime, only helps TS know
 * the types of your component.
 */
export function defineComponent(options: ComponentOptions): ComponentOptions {
  // Simple - just return options
  // In real Vue, same thing
  return options
}

// ============================================================
// 5. createApp - Create and Mount App
// ============================================================
export interface App {
  mount: (selector: string) => App
  unmount: () => App
}

/**
 * createApp() - Create Vue app and mount to DOM
 * 
 * COMPLETE FLOW:
 * 
 * 1. createApp(AppComponent)
 *    │
 *    ▼
 * 2. app.mount('#app')
 *    │
 *    ▼
 * 3. Create component instance
 *    - Call setup() → get setupState
 *    - Get render function
 *    │
 *    ▼
 * 4. Call render function → get VNode
 *    │
 *    ▼
 * 5. render(vnode, container) → Real DOM
 *    │
 *    ▼
 * 6. Call mounted() hooks
 */
export function createApp(rootComponent: ComponentOptions, rootProps?: any): App {
  let instance: ComponentInstance | null = null
  let container: HTMLElement | null = null
  
  const app = {
    /**
     * mount() - Mount app to DOM element
     */
    mount(selector: string): App {
      // 1. Find container
      container = document.querySelector(selector) as HTMLElement
      if (!container) {
        throw new Error(`Container ${selector} not found`)
      }
      
      // 2. Create component instance
      instance = createComponentInstance(rootComponent, rootProps)
      
      // 3. Get VNode from render function
      let vnode: VNode
      if (instance.render) {
        // Use render function
        vnode = instance.render()
      } else if (Object.keys(instance.setupState).length > 0) {
        // No render function - convert setupState to VNode
        // This is simplified - real Vue compiles template
        vnode = convertStateToVNode(instance.setupState)
      } else {
        // Empty component
        vnode = h('div', '')
      }
      
      // 4. Render VNode to real DOM
      container.innerHTML = ''  // Clear container
      const el = render(vnode, container)
      container.appendChild(el)
      
      // 5. Call mounted hooks
      if (instance.mounted) {
        instance.mounted()
      }
      
      return this
    },
    
    /**
     * unmount() - Unmount app from DOM
     */
    unmount(): App {
      if (container) {
        container.innerHTML = ''
        container = null
      }
      instance = null
      return this
    }
  }
  
  return app
}

/**
 * convertStateToVNode - Convert setup state to VNode
 * Simplified demo conversion
 */
function convertStateToVNode(state: Record<string, any>): VNode {
  const children: VNode[] = []
  
  for (const [key, value] of Object.entries(state)) {
    // Skip functions (methods)
    if (typeof value === 'function') continue
    
    // Add as text node or element
    children.push(h('div', String(value)))
  }
  
  return h('div', children)
}

// ============================================================
// 6. Fragment
// ============================================================
/**
 * Fragment - A special VNode that renders children without wrapper
 * 
 * In Vue 3:
 * <template>
 *   <div>A</div>
 *   <div>B</div>
 * </template>
 * 
 * Compiles to:
 * {
 *   type: Fragment,
 *   children: [VNode, VNode]
 * }
 */
export function Fragment(props: { default: () => VNode }): () => VNode {
  return props.default
}