import css from './portfolio-visualizer.module.css'
import cx from '@course/cx'
import styles from '@course/styles'
import { useState, useRef, useEffect } from 'react'

export type TPortfolioNode = {
  id: string
  name: string
  value: number
  children?: TPortfolioNode[]
}

// Flat state node with parent/children references by ID (no circular refs)
type TPortfolioStateNode = {
  id: string
  name: string
  value: number
  parentID: string | null
  childrenIDs: string[]
}

type TPortfolioVisualizerProps = {
  data: TPortfolioNode
}

/**
 * Expected data:
 * {
 *   id: 'root', name: 'Portfolio', value: 1000,
 *   children: [
 *     { id: 'stocks', name: 'Stocks', value: 600, children: [
 *       { id: 'aapl', name: 'AAPL', value: 300 },
 *       { id: 'goog', name: 'GOOG', value: 300 },
 *     ]},
 *     { id: 'bonds', name: 'Bonds', value: 400 },
 *   ]
 * }
 */

// Normalizes a nested tree into a flat Map<id, node> for O(1) lookups
const prepare = (data: TPortfolioNode): Map<string, TPortfolioStateNode> => {
  const store = new Map<string, TPortfolioStateNode>()
  const walk = (node: TPortfolioNode, parentID: string | null) => {
    const childrenIDs = (node.children ?? []).map((ch) => ch.id)
    store.set(node.id, {
      id: node.id,
      name: node.name,
      value: node.value,
      parentID,
      childrenIDs,
    })
    for (const child of node.children ?? []) {
      walk(child, node.id)
    }
  }
  walk(data, null)
  return store
}

type TPortfolioNodeProps = {
  nodeId: string
  store: Map<string, TPortfolioStateNode>
  total: number // root node's value — all percentages are relative to root
}

function PortfolioNode({ nodeId, store, total }: TPortfolioNodeProps) {
  const node = store.get(nodeId)!
  const { value, childrenIDs, id, name } = node
  // Percentage relative to root total (not parent)
  const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'

  const ref = useRef<HTMLInputElement>(null)

  // Sync uncontrolled input with state when value changes externally
  // (e.g. after a rejected edit reverts, or if state updates from elsewhere)
  useEffect(() => {
    if (ref.current) {
      ref.current.value = `${value}`
    }
  }, [value])

  // Unallocated cash = parent value minus sum of children values
  const childrenSum = childrenIDs.reduce((acc, cid) => acc + store.get(cid)!.value, 0)
  const unallocated = value - childrenSum

  return (
    <details className={cx(styles.paddingLeft16, styles.paddingVer8, css.details)} open>
      <summary className={styles.flexRowBetween}>
        <div className={cx(styles.flexRowBetween, styles.flexRowGap16, styles.wh100)}>
          <label htmlFor={id}>
            <strong>{name}</strong>
          </label>
          <div className={cx(styles.flexRowGap8, styles.flexRowBetween)}>
            {/* data-node-id used by event delegation in onKeyDown handler */}
            <input ref={ref} data-node-id={id} id={id} type="text" defaultValue={value} />
            <output className={styles.w100px}>{percentage}%</output>
          </div>
        </div>
      </summary>
      {childrenIDs.length > 0 &&
        childrenIDs.map((cid) => (
          <PortfolioNode nodeId={cid} store={store} total={total} key={cid} />
        ))}
      {/* Show unallocated cash only for parent nodes where value > children sum */}
      {childrenIDs.length > 0 && unallocated > 0 && (
        <p>
          <strong>Unallocated cash: </strong>
          {unallocated}
        </p>
      )}
    </details>
  )
}

export function PortfolioVisualizer({ data }: TPortfolioVisualizerProps) {
  // Lazy init: normalize nested tree into flat Map once
  const [store, setStore] = useState<Map<string, TPortfolioStateNode>>(() => prepare(data))
  const rootId = data.id
  const root = store.get(rootId)!

  // Single onKeyDown handler on container div — event delegation via data-node-id
  const onNodeUpdate = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target
    if (!(target instanceof HTMLInputElement) || e.key !== 'Enter') return

    // Identify which node was edited via data attribute
    const nodeId = target.dataset.nodeId ?? ''
    if (!store.has(nodeId)) {
      return
    }
    const node = store.get(nodeId)!
    const childrenSum = node.childrenIDs.reduce((acc, cid) => acc + store.get(cid)!.value, 0)
    const value = +target.value

    // Budget constraint: parent cannot be reduced below its children's sum
    if (Number.isNaN(value) || childrenSum > value) {
      target.value = `${node.value}` // revert input on rejection
      return
    }

    // Budget constraint: child cannot exceed parent's unallocated budget
    if (node.parentID) {
      const parent = store.get(node.parentID)!
      // Sum of all siblings (excluding this node)
      const siblingsSum = parent.childrenIDs.reduce(
        (acc, cid) => acc + (cid === nodeId ? 0 : store.get(cid)!.value),
        0,
      )
      const maxAllowed = parent.value - siblingsSum
      if (value > maxAllowed) {
        target.value = `${node.value}` // revert input on rejection
        return
      }
    }

    // Immutable update: shallow-copy the Map, replace only the changed node
    const newStore = new Map(store)
    newStore.set(nodeId, { ...node, value })
    setStore(newStore)
  }

  // onKeyDown on container div captures Enter from any nested input (event delegation)
  return (
    <div
      className={cx(styles.w600px, styles.b4, styles.bgBlack1, styles.padding16)}
      onKeyDown={onNodeUpdate}
    >
      <PortfolioNode nodeId={rootId} store={store} total={root.value} />
    </div>
  )
}
