import css from './solution/accordion.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

/**
 * Expected input:
 * {
 *   items: [
 *     { id: "1", title: "Section 1", content: "Lorem ipsum..." },
 *     { id: "2", title: "Section 2", content: "Sed ut perspiciatis..." }
 *   ]
 * }
 *
 * Steps to complete:
 * 1. Define properties — create TAccordionItem type (id, title, content) and props type (items array)
 * 2. Init constructor — accept items via props destructuring
 * 3. Provide toHTML template — map over items, render <details>/<summary>/<p> for each
 * 4. Add CSS — use styles and cx() for className composition
 */

type TProps = {
  items: Array<{
    id: string
    title: string
    content: string
  }>
}

export const Accordion = ({ items }: TProps) => {  
  return (
     <div className={cx(css.container, flex.maxW600px, flex.flexColumnGap12, flex.w100)}>
      {items.map((item) => (
        <details key={item.id} className={css.details}>
          <summary
            className={cx(
              css.summary,
              flex.flexRowBetween,
              flex.paddingHor16,
              flex.paddingVer12,
              flex.fontXL,
            )}
          >
            {item.title}
          </summary>
          <p className={cx(css.content, flex.paddingVer16, flex.paddingHor16)}>{item.content}</p>
        </details>
      ))}
    </div>
  )
}
