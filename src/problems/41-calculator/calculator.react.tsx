// bun test src/problems/41-calculator/test/calculator.utils.test.ts
import { useState } from 'react'
import css from './calculator.module.css'
import { BUTTONS } from './calculator.utils'

const buttons = [...BUTTONS.values()].map((button) => (
  <button key={button.label} data-operator={button.label}>
    {button.label}
  </button>
))
export const Calculator = () => {
  const [value, setValue] = useState('0')

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.target instanceof HTMLElement && event.target.dataset.operator?.length) {
      const { operator } = event.target.dataset
      const button = BUTTONS.get(operator)
      if (button) {
        setValue(button.action(value, operator))
      }
    }
  }

  return (
    <section className={css.calculator} onClick={handleButtonClick}>
      <output>{value}</output>
      {buttons}
    </section>
  )
}
