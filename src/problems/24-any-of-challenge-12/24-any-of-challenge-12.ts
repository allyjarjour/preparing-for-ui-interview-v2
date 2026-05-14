/**
 * 3.4 AnyOf
 *
 * Implement a type which takes an array type as argument/parameter.
 * If any element in the array is "truthy", return `true`, otherwise return `false`.
 *
 * @example
 * type Sample1 = AnyOf<[1, "", false, []]> // true (1 is truthy)
 * type Sample2 = AnyOf<[0, "", false, [], {}]> // false (all falsy)
 */

import type { Equal, Expect } from '@course/types'

type Falsy = '' | 0 | false | undefined | null | []

/* _____________ Your Code Here _____________ */

type IsTruthy<T> = T extends Falsy ? false : keyof T extends never ? false : true

type AnyOf<T extends readonly any[]> = T extends [infer First, ...infer Rest]
  ? IsTruthy<First> extends true
  ? true
  : AnyOf<Rest>
  : false

/* _____________ Test Cases _____________ */

type cases = [
  Expect<Equal<AnyOf<[1, 'test', true, [1], { name: 'test' }, { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[1, '', false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, 'test', false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', true, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [1], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { name: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { name: 'test' }, { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], {}, undefined, null]>, false>>,
  Expect<Equal<AnyOf<[]>, false>>,
]
