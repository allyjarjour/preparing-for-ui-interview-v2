// bun test src/problems/57-google-sheet-basic/test/table-engine.test.ts

import type { CellId, Compiled } from '../../utilities/google-sheet-parser'

export type { CellId } from '../../utilities/google-sheet-parser'

export class TableEngine {
  #raw: Map<CellId, string> = new Map()
  #val: Map<CellId, string> = new Map()
  #deps: Map<CellId, Set<CellId>> = new Map()
  #reverseDeps: Map<CellId, Set<CellId>> = new Map()
  #complied: Map<CellId, Compiled> = new Map()

  setRaw(id: CellId, raw: string): { changed: CellId[] } {
    this.#raw.set(id, raw)
    this.#val.set(id, raw)

    return { changed: [id] }
  }

  getRaw(id: CellId): string {
    return this.#raw.get(id) ?? ''
  }

  getValue(id: CellId): string {
    return this.#val.get(id) ?? ''
  }

  getDeps(id: CellId): ReadonlySet<CellId> {
    let set = this.#deps.get(id)

    if (!set) {
      set = new Set()
      this.#deps.set(id, set)
    }

    return set
  }

  getRevDeps(id: CellId): ReadonlySet<CellId> {
    let set = this.#reverseDeps.get(id)

    if (!set) {
      set = new Set()
      this.#reverseDeps.set(id, set)
    }

    return set
  }
}
