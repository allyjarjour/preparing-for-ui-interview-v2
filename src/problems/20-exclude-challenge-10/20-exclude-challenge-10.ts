/**
 * 3.2 Exclude
 *
 * Implement the built-in Exclude<T, U>.
 * Exclude from T those types that are assignable to U.
 *
 * @example
 * type Result = MyExclude<'a' | 'b' | 'c', 'a'>
 * // 'b' | 'c'
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type MyExclude<T, U> = T extends U ? never : T

/* _____________ Test Cases _____________ */

type cases = [
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, 'b' | 'c'>>,
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a' | 'b'>, 'c'>>,

  Expect<Equal<MyExclude<string | number | (() => void), Function>, string | number>>,
]
