/**
 * 6.1 Deep Readonly
 *
 * Implement a generic `DeepReadonly<T>` which make every parameter of an object - and its sub-objects recursively - readonly.
 *
 * @example
 * type X = {
 *   x: {
 *     a: 1
 *     b: 'hi'
 *   }
 *   y: 'hey'
 * }
 *
 * type Expected = {
 *   readonly x: {
 *     readonly a: 1
 *     readonly b: 'hi'
 *   }
 *   readonly y: 'hey'
 * }
 *
 * type Result = DeepReadonly<X> // should be same as `Expected`
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type DeepReadonly<T> = keyof T extends never
  ? T
  : {
      readonly [Property in keyof T]: DeepReadonly<T[Property]>
    }

/* _____________ Test Cases _____________ */

type X1 = {
  a: () => 22
  b: string
  c: {
    d: boolean
    e: {
      g: {
        h: {
          i: true
          j: 'string'
        }
        k: 'hello'
      }
      l: [
        'hi',
        {
          m: ['hey']
        },
      ]
    }
  }
}

type Expected1 = {
  readonly a: () => 22
  readonly b: string
  readonly c: {
    readonly d: boolean
    readonly e: {
      readonly g: {
        readonly h: {
          readonly i: true
          readonly j: 'string'
        }
        readonly k: 'hello'
      }
      readonly l: readonly [
        'hi',
        {
          readonly m: readonly ['hey']
        },
      ]
    }
  }
}

type cases = [Expect<Equal<DeepReadonly<X1>, Expected1>>]
