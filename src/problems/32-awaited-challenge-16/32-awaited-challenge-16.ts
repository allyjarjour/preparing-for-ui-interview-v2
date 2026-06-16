/**
 * 4.3 Awaited
 *
 * If we have a type which is wrapped type like Promise. How we can get a type which is inside the wrapped type?
 * For example: if we have `Promise<ExampleType>` how to get ExampleType?
 *
 * @example
 * type ExampleType = Promise<string>
 * type Result = MyAwaited<ExampleType> // string
 * type ResultX = MyAwaited<X> // string
 * type ResultY = MyAwaited<Y> // number
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type MyAwaited<T> = T extends { then: (onfulfilled: (arg: infer V) => any) => any }
  ? MyAwaited<V>
  : T

/* _____________ Test Cases _____________ */

type X = Promise<string>
type Y = Promise<{ field: number }>
type Z = Promise<Promise<string | number>>
type Z1 = Promise<Promise<Promise<string | boolean>>>
type T = { then: (onfulfilled: (arg: number) => any) => any }

type cases = [
  Expect<Equal<MyAwaited<X>, string>>,
  Expect<Equal<MyAwaited<Y>, { field: number }>>,
  Expect<Equal<MyAwaited<Z>, string | number>>,
  Expect<Equal<MyAwaited<Z1>, string | boolean>>,
  Expect<Equal<MyAwaited<T>, number>>,
]
