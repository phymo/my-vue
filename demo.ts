import { reactive, ref, computed, effect, targetMap, Dep } from './reactivity'

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