/**
 * 4.1 Return Type
 *
 * Implement the built-in `ReturnType<T>` generic without using it.
 *
 * @example
 * const fn = (v: boolean) => v ? 1 : 2
 * type Result = MyReturnType<typeof fn> // 1 | 2
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never

/* _____________ Test Cases _____________ */

const fn = (v: boolean) => (v ? 1 : 2)
const fn1 = (v: boolean, w: any) => (v ? 1 : 2)

type cases = [
  Expect<Equal<string, MyReturnType<() => string>>>,
  Expect<Equal<123, MyReturnType<() => 123>>>,
  Expect<Equal<ComplexObject, MyReturnType<() => ComplexObject>>>,
  Expect<Equal<Promise<boolean>, MyReturnType<() => Promise<boolean>>>>,
  Expect<Equal<() => 'foo', MyReturnType<() => () => 'foo'>>>,
  Expect<Equal<1 | 2, MyReturnType<typeof fn>>>,
  Expect<Equal<1 | 2, MyReturnType<typeof fn1>>>,
]

type ComplexObject = {
  a: [12, 'foo']
  bar: 'hello'
  prev(): number
}
