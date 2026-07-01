import { useRef, useState } from 'react'
import styles from './square-game.module.css'

const GAME_SIZE = 3

type TSquareGameProps = {
  initState?: Array<Array<number | null>>
}

const validate = ([x, y]: [number, number], [x2, y2]: [number, number]) => {
  const isValid =
    (Math.abs(x - x2) === 0 && Math.abs(y - y2) === 1) ||
    (Math.abs(x - x2) === 1 && Math.abs(y - y2) === 0)

  return isValid
}

const getGameState = (): Array<Array<number | null>> => {
  const state = Array.from(
    {
      length: GAME_SIZE ** 2,
    },
    (_, index) => (index === GAME_SIZE ** 2 - 1 ? null : index + 1),
  )

  state.sort(() => Math.random() - 0.5)
  return Array.from(
    {
      length: GAME_SIZE,
    },
    (_, index) => state.slice(index * GAME_SIZE, (index + 1) * GAME_SIZE),
  )
}

const isWin = (state: Array<Array<number | null>>) => {
  return state.flat().every((value, i) => {
    if (value === null) {
      return i === GAME_SIZE ** 2 - 1
    }
    return value === i + 1
  })
}

export const SquareGame = ({ initState }: TSquareGameProps = {}) => {
  const [state, setState] = useState<Array<Array<number | null>>>(initState ?? getGameState())
  const emptySquare = useRef<HTMLDivElement | null>(null)

  const handleCellClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.dataset.row &&
      event.target.dataset.col
    ) {
      const greySquareRow = parseInt(emptySquare.current?.dataset?.row ?? '0')
      const greySquareCol = parseInt(emptySquare.current?.dataset?.col ?? '0')
      const newSquareRow = parseInt(event.target.dataset.row)
      const newSquareCol = parseInt(event.target.dataset.col)

      const isValid = validate([newSquareRow, newSquareCol], [greySquareRow, greySquareCol])

      if (isValid) {
        const newState = [...(state ?? [])]
        newState[newSquareRow]?.splice(newSquareCol, 1, null)
        newState[greySquareRow]?.splice(greySquareCol, 1, parseInt(event.target.innerText ?? ''))
        setState(newState)
      }
    }
  }

  const squares = state?.map((row, rowIdx) => {
    return row.map((sq, colIdx) => {
      return (
        <div
          key={sq}
          data-row={rowIdx}
          data-col={colIdx}
          data-empty={sq === null}
          className={styles.square}
          ref={sq === null ? emptySquare : null}
        >
          {sq === null ? '' : `${sq}`}
        </div>
      )
    })
  })

  return (
    <>
      <div className={styles.status}>Game status: {isWin(state) ? 'win' : 'not yet'}</div>
      <div onClick={handleCellClick} className={styles.container}>
        {squares}
      </div>
    </>
  )
}
