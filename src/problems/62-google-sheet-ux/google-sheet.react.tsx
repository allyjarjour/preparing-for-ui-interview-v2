import { type CellId, TableEngine } from '../61-google-sheet-recompute/solution/table-engine.ts'
import css from './google-sheet.module.css'
import cx from '@course/cx'

export const COLS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const

export type TTableColumn = (typeof COLS)[number]

export function fromCellReference(id: CellId): { row: number; col: string } {
  const col = id[0] as string
  const row = Number(id.slice(1))
  return { row, col }
}

export function toCellReference(row: number, col: TTableColumn): CellId {
  return `${col}${row}`
}

function getCellElement(row: number, column: string) {
  return document.querySelector(`[data-column="${column}"][data-row="${row}"]`)
}

const EMPTY = Symbol(' ')
const MAX_ROWS = 50
const TABLE_COLUMNS = [EMPTY, ...COLS]

const engine = new TableEngine()

// ── Prepopulated data: Q1 Sales Report ──────────────────────────────
// // Row 1: Table headers
// engine.setRaw('A1', 'Product')
// engine.setRaw('B1', 'Q1 Sales')
// engine.setRaw('C1', 'Q2 Sales')
// engine.setRaw('D1', 'Total')
// engine.setRaw('E1', 'Margin %')
// engine.setRaw('F1', 'Status')

// // Rows 2-5: Product data with formulas
// engine.setRaw('A2', 'Widgets')
// engine.setRaw('B2', '1200')
// engine.setRaw('C2', '1450')
// engine.setRaw('D2', '=B2+C2') // Total = 2650
// engine.setRaw('E2', '0.35')
// engine.setRaw('F2', 'Active')

// engine.setRaw('A3', 'Gadgets')
// engine.setRaw('B3', '800')
// engine.setRaw('C3', '950')
// engine.setRaw('D3', '=B3+C3') // Total = 1750
// engine.setRaw('E3', '0.42')
// engine.setRaw('F3', 'Active')

// engine.setRaw('A4', 'Gizmos')
// engine.setRaw('B4', '2100')
// engine.setRaw('C4', '1800')
// engine.setRaw('D4', '=B4+C4') // Total = 3900
// engine.setRaw('E4', '0.28')
// engine.setRaw('F4', 'Review')

// engine.setRaw('A5', 'Doohickeys')
// engine.setRaw('B5', '450')
// engine.setRaw('C5', '0')
// engine.setRaw('D5', '=B5+C5') // Total = 450
// engine.setRaw('E5', '0.15')
// engine.setRaw('F5', 'Discontinued')

// // Row 6: Summary row with aggregation formulas
// engine.setRaw('A6', 'TOTAL')
// engine.setRaw('B6', '=B2+B3+B4+B5') // Sum of Q1 Sales = 4550
// engine.setRaw('C6', '=C2+C3+C4+C5') // Sum of Q2 Sales = 4200
// engine.setRaw('D6', '=D2+D3+D4+D5') // Grand total = 8750

// // Row 8: Edge cases & error demonstrations
// engine.setRaw('A8', 'Edge Cases:')
// engine.setRaw('B8', '=1/0') // Division by zero error
// engine.setRaw('C8', '=A9+1') // Circular reference (A9 → C8 → A9)
// engine.setRaw('A9', '=C8+1') // Circular reference partner

type TCellProps = {
  column: string | symbol
  row: number
  value: string | number
}

const resizeClass = {
  columnheader: css['resize-horizontal'],
  rowheader: css['resize-vertical'],
  gridcell: '',
} as const

/* Step 1: Cell component
   - Determine the cell's role: 'columnheader' (row === 0), 'rowheader' (column === EMPTY), or 'gridcell'
   - Build className using cx(): css.cell + css.header (if header) + resizeClass[role]
   - Render a <div> with:
     role, data-value={value}, data-column={String(column)}, data-row={row}, className
     contentEditable={role === 'gridcell'}, suppressContentEditableWarning
   - Children: {value}
*/
function Cell({ column, row, value }: TCellProps) {
  let role: 'columnheader' | 'rowheader' | 'gridcell' = 'gridcell'

  if (row === 0) {
    role = 'columnheader'
  } else if (column === EMPTY) {
    role = 'rowheader'
  }

  const className = cx(css.cell, row === 0 || column === EMPTY ? css.header : '', resizeClass[role])

  return (
    <div
      className={className}
      role={role}
      data-column={String(column)}
      data-row={row}
      contentEditable={role === 'gridcell'}
      suppressContentEditableWarning
    >
      {value}
    </div>
  )
}

/* Step 2: HEADER_ROWS — map TABLE_COLUMNS to <Cell> with row=0
   - For EMPTY column: value is '' (empty string)
   - For letter columns: value is the column letter
*/
const HEADER_ROWS = (
  <div role="row" style={{ display: 'contents' }}>
    {TABLE_COLUMNS.map((column) => (
      <Cell
        key={String(column)}
        row={0}
        column={column}
        value={column === EMPTY ? '' : String(column)}
      />
    ))}
  </div>
)

/* Step 3: BODY_ROWS — for each row (1..MAX_ROWS), map TABLE_COLUMNS to <Cell>
   - For EMPTY column: value is the row number (rowId)
   - For letter columns: value is null (empty editable cell)
*/
const BODY_ROWS = Array.from({ length: MAX_ROWS }).map((_, idx) => {
  const rowId = idx + 1
  return (
    <div role="row" key={idx} style={{ display: 'contents' }}>
      {TABLE_COLUMNS.map((col) => {
        return (
          <Cell key={String(col)} row={rowId} column={col} value={col === EMPTY ? rowId : ''} />
        )
      })}
    </div>
  )
})

export function GoogleSheet() {
  /* Step 4: updateCellView(id) — refresh a cell's displayed text
       - Use fromCellReference(id) to get row/col, then getCellElement to find the DOM node
       - If the cell is currently focused (document.activeElement === cell): show raw formula via engine.getRaw(id)
       - Otherwise: show computed value via engine.getValue(id)
    */
  const updateCellView = (id: CellId) => {
    const { row, col } = fromCellReference(id)
    if (!col || !row) return

    const element = getCellElement(row, col)
    if (!element) return

    if (document.activeElement === element) {
      const raw = engine.getRaw(id)
      element.textContent = raw
    } else {
      element.textContent = engine.getValue(id)
    }
  }
  /* Step 5: handleCellFocus — when a cell gains focus, show its raw formula
       - Read column and row from target.dataset
       - Build the CellId with toCellReference
       - Set target.textContent = engine.getRaw(id)
    */
  const handleCellFocus: React.FocusEventHandler<HTMLDivElement> = ({ target }) => {
    if (target instanceof HTMLElement && target.dataset.row && target.dataset.column) {
      const [row, col] = [+target.dataset.row, target.dataset.column as TTableColumn]
      const id = toCellReference(row, col)

      if (col && row) {
        target.textContent = engine.getRaw(id)
      }
    }
  }
  /* Step 6: handeCellChange — when a cell loses focus (blur), commit the edit
       - Read column and row from target.dataset, build CellId
       - Get the raw text from target.textContent
       - Call engine.setRaw(id, raw) — returns { changed: Set<CellId> }
       - Set target.textContent = engine.getValue(id) to show computed value
       - Loop through changed set and call updateCellView for each affected cell
    */
  const handeCellChange: React.FocusEventHandler<HTMLDivElement> = ({ target }) => {
    if (target instanceof HTMLElement && target.dataset.row && target.dataset.column) {
      const [row, col] = [+target.dataset.row, target.dataset.column as TTableColumn]
      const id = toCellReference(row, col)
      const raw = target.textContent ?? ''
      const { changed } = engine.setRaw(id, raw)
      updateCellView(id)

      for (const cell of changed) {
        updateCellView(cell)
      }
    }
  }

  return (
    <section>
      <div
        className={css.grid}
        role="grid"
        aria-label="Spreadsheet"
        onBlurCapture={handeCellChange}
        onFocusCapture={handleCellFocus}
      >
        {HEADER_ROWS}
        {BODY_ROWS}
      </div>
    </section>
  )
}
