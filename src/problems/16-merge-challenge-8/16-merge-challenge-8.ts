/**
 * 2.6 Merge
 *
 * Merge two types into a new type. Keys of the second type overrides the first type.
 *
 * @example
 * type Foo = { a: number; b: string }
 * type Bar = { b: number; c: boolean }
 *
 * type Result = Merge<Foo, Bar>
 * // { a: number; b: number; c: boolean }
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type Merge<A extends {}, B extends {}> = {
  [Property in keyof B | keyof A]: Property extends keyof B ? B[Property] : Property extends keyof A ? A[Property] : void
}

type MergeV2<A extends {}, B extends {}> = {
  [Property in keyof (B & A)]: Property extends keyof B ? B[Property] : Property extends keyof A ? A[Property] : never
}

/* _____________ Test Cases _____________ */

type Foo = { a: number; b: string }
type Bar = { b: number; c: boolean }

type cases = [Expect<Equal<Merge<Foo, Bar>, { a: number; b: number; c: boolean }>>]
type cases2 = [Expect<Equal<MergeV2<Foo, Bar>, { a: number; b: number; c: boolean }>>]
