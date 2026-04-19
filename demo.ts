import { reactive, ref, computed, effect, watch, onMounted, onUpdated, onUnmounted, onBeforeUnmount, triggerLifecycleHook, targetMap, Dep } from './reactivity'

// Demo: reactive()
console.log('=== reactive() Demo ===')
const rawState = { count: 0, name: 'Vue' }
const state = reactive(rawState)

effect(() => {
  console.log('count:', state.count)
})

state.count = 1
state.count = 2

// Demo: ref()
console.log('\n=== ref() Demo ===')
const count = ref(0)

effect(() => {
  console.log('ref value:', count.value)
})

count.value = 10
count.value = 20

// Demo: computed()
console.log('\n=== computed() Demo ===')
const firstName = ref('Hello')
const lastName = ref('World')

const fullName = computed(() => firstName.value + ' ' + lastName.value)

console.log('fullName:', fullName.value)

lastName.value = 'Vue'

console.log('fullName after change:', fullName.value)

// Demo: watch()
console.log('\n=== watch() Demo ===')
const watchCount = ref(0)

watch(watchCount, (newVal, oldVal) => {
  console.log('watch: change from', oldVal, 'to', newVal)
}, { immediate: true })

watchCount.value = 5
watchCount.value = 10

// Demo: watch with getter
const state2 = reactive({ a: 1, b: 2 })
watch(() => state2.a, (newVal, oldVal) => {
  console.log('watch getter: state.a changed from', oldVal, 'to', newVal)
}, { immediate: true })

state2.a = 100
state2.a = 200

// Demo: Lifecycle hooks
console.log('\n=== Lifecycle Hooks Demo ===')
onMounted(() => {
  console.log('lifecycle: onMounted called')
})
onUpdated(() => {
  console.log('lifecycle: onUpdated called')
})
onBeforeUnmount(() => {
  console.log('lifecycle: onBeforeUnmount called')
})
onUnmounted(() => {
  console.log('lifecycle: onUnmounted called')
})

console.log('trigger mounted...')
triggerLifecycleHook('mounted')
console.log('trigger updated...')
triggerLifecycleHook('updated')
console.log('trigger beforeUnmount...')
triggerLifecycleHook('beforeUnmount')
console.log('trigger unmounted...')
triggerLifecycleHook('unmounted')

console.log('\n=== All demos passed! ===')

// ============================================================
// Inspect internal structures: targetMap, Dep subscribers, etc.
// ============================================================
console.log('\n=== Internal structures snapshot ===')

function printDepsForTarget(name: string, target: any) {
  const deps = targetMap.get(target)
  console.log(`Target: ${name}`, deps ? 'has deps' : 'no deps')
  if (deps) {
    for (const [key, dep] of deps) {
      console.log(' key:', String(key))
      // Dep.getSubscribers() returns the array of subscriber functions
      try {
        const subs = (dep as any).getSubscribers ? (dep as any).getSubscribers() : []
        console.log('  subscribers count:', subs.length)
      } catch (e) {
        console.log('  subscribers: <unable to inspect>')
      }
    }
  }
}

printDepsForTarget('state', state)
printDepsForTarget('state (proxy)', state)
printDepsForTarget('state (raw)', rawState)
printDepsForTarget('count ref', count)
printDepsForTarget('firstName ref', firstName)
printDepsForTarget('lastName ref', lastName)

// Show an example Dep object for state.count if available
const stateDeps = targetMap.get(rawState)
const depForCount = stateDeps && stateDeps.get('count')
console.log('\nExample Dep for state.count:', depForCount ? depForCount.getSubscribers() : '<none>')