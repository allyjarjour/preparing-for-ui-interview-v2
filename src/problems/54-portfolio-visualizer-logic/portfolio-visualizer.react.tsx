import cx from '@course/cx'
import styles from '@course/styles'
import { useEffect, useRef, useState } from 'react'

export type TPortfolioNode = {
  id: string
  name: string
  value: number
  children?: TPortfolioNode[]
}

type TPortfolioVisualizerProps = {
  data: TPortfolioNode
}

type TPortfolioStateNode = Omit<TPortfolioNode, 'children'> & {
  parentId: string | null
  childrenIds?: string[]
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

// PortfolioNode — receives nodeId, store (Map), and total (root value for percentage)
type TPortfolioNodeProps = {
  nodeId: string
  store: Map<string, TPortfolioStateNode>
  total: number
}

function PortfolioNode({ nodeId, store, total }: TPortfolioNodeProps) {
  const node = store.get(nodeId)!
  const { id, name, value, childrenIds = [] } = node
  const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'

  // Step C: useRef<HTMLInputElement> + useEffect to sync uncontrolled input
  //   - When state value changes (e.g. after rejection revert), update input.value via ref
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = `${value}`
    }
  }, [value])

  // Step D: Compute unallocated cash = value - sum of children values
  //   - Render "Unallocated cash: {amount}" when childrenIDs.length > 0 && unallocated > 0

  const childrenSum = childrenIds?.reduce((acc, childId) => acc + store.get(childId)!.value, 0) ?? 0

  const unallocated = childrenIds?.length > 0 ? value - childrenSum : 0

  return (
    <details open={true}>
      <summary className={styles.flexRowBetween}>
        <label htmlFor={id}>
          <strong>{name}</strong>
        </label>
        <div className={cx(styles.flexRowGap8, styles.flexRowCenter)}>
          <input data-node-id={id} id={id} type="text" defaultValue={value} />
          <output className={styles.w100px}>{percentage}%</output>
        </div>
      </summary>
      {childrenIds.length > 0 ? (
        <ul className={cx(styles.flexColumnGap12, styles.paddingLeft16, styles.paddingVer8)}>
          {childrenIds.map((childId) => (
            <li key={childId}>
              <PortfolioNode nodeId={childId} store={store} total={total} />
            </li>
          ))}
        </ul>
      ) : null}
      {unallocated > 0 ? <p>Unallocated cash: {unallocated}</p> : null}
    </details>
  )
}

export function PortfolioVisualizer({ data }: TPortfolioVisualizerProps) {
  const prepare = (data: TPortfolioNode) => {
    const store: Map<string, TPortfolioStateNode> = new Map()

    const walk = (node: TPortfolioNode, parentId: string | null) => {
      const newNode = {
        parentId,
        childrenIds: (node.children ?? []).map((child) => child.id),
        id: node.id,
        name: node.name,
        value: node.value,
      }
      store.set(node.id, newNode)
      for (const child of node.children ?? []) {
        walk(child, node.id)
      }
    }

    walk(data, null)
    return store
  }

  const [state, setState] = useState(() => prepare(data))

  // Step 2: State — useState<Map> initialized lazily from prepare: useState(() => prepare(data))
  //   - Get root node from store by data.id

  // Step 3: onNodeUpdate — onKeyDown handler (event delegation on container):
  //   - Only handle Enter key on HTMLInputElement
  //   - Read data-node-id from target.dataset, parse new value
  //   - Reject NaN values
  //   - Budget constraint (parent floor):
  //          - if node has children, reject if newValue < sum of children values
  //          - if node has parent, reject if newValue > parent.value - siblingsSum
  //   - On rejection, revert input: target.value = `${node.value}`
  //   - On success: create new Map(store), set updated node, setStore

  const onNodeUpdate: React.KeyboardEventHandler = ({ key, target }) => {
    if (key !== 'Enter' || !(target instanceof HTMLInputElement)) return

    if (target.dataset.nodeId === null) return

    const nodeId = target.dataset.nodeId || ''
    const node = state.get(nodeId)

    if (node == null) return

    const childrenSum =
      node?.childrenIds?.reduce((acc, childId) => acc + state.get(childId)!.value, 0) ?? 0
    const newValue = Number(target.value)

    if (Number.isNaN(newValue) || childrenSum > newValue) {
      target.value = `${node.value}`
      return
    }

    const parentId = node.parentId

    if (parentId) {
      const parent = state.get(parentId)!
      // Sum of all siblings (excluding this node)
      const siblingsSum =
        parent.childrenIds?.reduce(
          (acc, cid) => acc + (cid === nodeId ? 0 : state.get(cid)!.value),
          0,
        ) ?? 0
      const maxAllowedCash = parent!.value - siblingsSum
      if (newValue > maxAllowedCash) {
        target.value = `${node.value}`
        return
      }
    }

    const newNode = {
      ...node,
      value: newValue,
    }

    const clone = new Map(state)
    clone.set(node.id, newNode)
    setState(clone)
  }

  // Step 4: Render — container div with onKeyDown={onNodeUpdate}, render root PortfolioNode
  return (
    <div
      className={cx(styles.w600px, styles.b4, styles.bgBlack1, styles.padding16)}
      onKeyDown={onNodeUpdate}
    >
      <PortfolioNode nodeId={data.id} total={data.value} store={state} />
    </div>
  )
}
