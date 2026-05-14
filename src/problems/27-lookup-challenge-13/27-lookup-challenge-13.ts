/**
 * 3.5 Lookup
 *
 * Sometimes, you may want to lookup for a value regarding the attributes in a union of types.
 * In this challenge, we would likes to get the corresponding type by searching for the common `type` field in the union `Cat | Dog`.
 * In other words, we will expect to get `Dog` for `LookUp<Dog | Cat, 'dog'>` and `Cat` for `LookUp<Dog | Cat, 'cat'>`.
 *
 * @example
 * interface Cat { type: 'cat'; breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal' }
 * interface Dog { type: 'dog'; breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer' }
 *
 * type MyDog = LookUp<Cat | Dog, 'dog'> // Dog
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type LookUp<T extends { type: string }, U> = T extends { type: U } ? T : never

/* _____________ Test Cases _____________ */

interface Cat {
  type: 'cat'
  breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal'
}

interface Dog {
  type: 'dog'
  breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer'
  color: 'brown' | 'white' | 'black'
}

type Animal = Cat | Dog

type cases = [Expect<Equal<LookUp<Animal, 'dog'>, Dog>>, Expect<Equal<LookUp<Animal, 'cat'>, Cat>>]
