/**
 * 2.5 Append to Object
 *
 * Implement a type that appends a new field to the interface.
 * The type takes three arguments. The output should be an object with the new field.
 *
 * @example
 * type Test = { id: '1' }
 * type Result = AppendToObject<Test, 'value', 4>
 * // { id: '1', value: 4 }
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type AppendToObject<T extends {}, K extends string, V> = {
  [Property in (keyof T) | K]: Property extends keyof T ? T[Property] : V
}

/* _____________ Test Cases _____________ */

type test1 = { key: 'cat'; value: 'green' }
type testExpect1 = { key: 'cat'; value: 'green'; home: boolean }

type test2 = { key: 'dog' | undefined; value: 'white'; sun: true }
type testExpect2 = { key: 'dog' | undefined; value: 'white'; sun: true; home: 1 }

type test3 = { key: 'cow'; value: 'yellow'; sun: false }
type testExpect3 = { key: 'cow'; value: 'yellow'; sun: false; moon: false | undefined }

type cases = [
  Expect<Equal<AppendToObject<test1, 'home', boolean>, testExpect1>>,
  Expect<Equal<AppendToObject<test2, 'home', 1>, testExpect2>>,
  Expect<Equal<AppendToObject<test3, 'moon', false | undefined>, testExpect3>>,
]
