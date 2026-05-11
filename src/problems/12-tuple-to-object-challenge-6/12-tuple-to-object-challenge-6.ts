/**
 * 2.4 Tuple to Object
 *
 * Give an array, transform into an object type and the key/value must be in the given array.
 *
 * @example
 * const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const
 *
 * type result = TupleToObject<typeof tuple>
 * // { 'tesla': 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type TupleToObject<T extends readonly (string | number | symbol)[]> = {
  [K in T[number]]: K
}

/* _____________ Test Cases _____________ */

const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const
const tupleNumber = [1, 2, 3, 4] as const
const sym1 = Symbol(1)
const sym2 = Symbol(2)
const tupleSymbol = [sym1, sym2] as const
const tupleMix = [1, '2', 3, '4', sym1] as const

type cases = [
  Expect<
    Equal<
      TupleToObject<typeof tuple>,
      { tesla: 'tesla'; 'model 3': 'model 3'; 'model X': 'model X'; 'model Y': 'model Y' }
    >
  >,
  Expect<Equal<TupleToObject<typeof tupleNumber>, { 1: 1; 2: 2; 3: 3; 4: 4 }>>,
  Expect<Equal<TupleToObject<typeof tupleSymbol>, { [sym1]: typeof sym1; [sym2]: typeof sym2 }>>,
  Expect<
    Equal<TupleToObject<typeof tupleMix>, { 1: 1; '2': '2'; 3: 3; '4': '4'; [sym1]: typeof sym1 }>
  >,
]

// @ts-expect-error nested arrays are not valid keys
type error = TupleToObject<[[1, 2], {}]>
