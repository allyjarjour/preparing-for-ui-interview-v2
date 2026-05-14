import css from './star-rating.module.css'
import cx from '@course/cx'

/**
 * Expected input:
 * {
 *   value: number,
 *   onChange: (value: number) => void,
 *   readonly?: boolean
 * }
 *
 * Steps to complete:
 * 1. Init constructor - define props type with value, onChange, readonly
 * 2. Provide template - render star buttons with proper attributes
 * 3. Handle click event - delegate click to update value
 * 4. Add ARIA attributes:
 *    Container:
 *    - role="radiogroup" — groups related radio-like controls so screen readers announce "radiogroup" when entering
 *    - aria-label="Star Rating" — provides an accessible name for the group (no visible label exists)
 *    - aria-readonly="true/false" — tells assistive tech whether the rating can be changed
 *    Each star button:
 *    - role="radio" — each star acts as a radio option within the group
 *    - aria-checked="true/false" — indicates which star is currently selected
 *    - aria-label="N Star(s)" — provides a meaningful label (e.g. "3 Stars") instead of just the emoji
 * 5. Add CSS styles for stars
 */

const STAR = '⭐️'
const STARS_COUNT = 5

type TProps = {
  value: number
  onChange: (value: number) => void
  readonly?: boolean
}

export const StarRating = ({ value, onChange, readonly }: TProps) => {
  const buttons = Array.from({ length: STARS_COUNT }, (_, i) => {
    const starValue = i + 1
    const checked = starValue <= value

    return (
      <button
        key={starValue}
        role="radio"
        aria-label={`${starValue} Star${starValue > 1 ? 's' : ''}`}
        aria-checked={checked}
        aria-readonly={readonly}
        data-star-value={starValue}
        disabled={readonly}
        className={cx(css.star, value && starValue <= value ? css.checked : '')}
        onClick={() => {
          return !readonly && onChange?.(starValue)
        }}
      >
        {STAR}
      </button>
    )
  })

  const onClick = ({target}: React.MouseEvent) => {
    if (target instanceof HTMLButtonElement) {
      const btn = target.closest('button')
      onChange?.(btn ? Number(btn.getAttribute('data-star-value')) : 0)
    }
  }

  return (
    <div role="radiogroup" aria-label="Star Rating" onClick={onClick}>
      <input type="number" className={css.input} value={value} readOnly />
      {buttons}
    </div>
  )
}
