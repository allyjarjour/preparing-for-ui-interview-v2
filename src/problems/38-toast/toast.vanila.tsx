import { AbstractComponent, type TComponentConfig } from '@course/utils'
import css from './toast.module.css'
import flex from '@course/styles'
import cx from '@course/cx'
type TToastItem = {
  id: string
  text: string
}
/**
 * Expected usage:
 *   const toast = new Toast({ root: containerElement })
 *   toast.render()
 *   toast.toast({ id: '1', text: 'Hello' })
 *
 * Toast item: { id: '1', text: 'Vanilla Toast: 1' }
 */
let toastInstanceID = 0
const TIMER = 3000
export class Toast extends AbstractComponent<object> {
  id = toastInstanceID++
  listElement: HTMLUListElement | null = null
  // Step 1: Constructor — pass listeners: ['animationend'], store a unique instance id
  // Step 2: toast(item) — create a DOM element from getToastTemplate(item),
  //   append it to this.listElement,
  //   setTimeout(3000) to swap fadeIn→fadeOut class and set data-removed='true'
  // Step 3: onAnimationend(event) — if target.dataset.removed === 'true', remove the element from DOM
  // Step 4: toHTML() — return a <ul> with unique id, aria-live="polite", toast-list class
  // Step 5: getToastTemplate(item) — return <li> with role="status", data-removed="false",
  //   data-id, fadeIn class, containing <div class="toast"><p>{text}</p></div>
  // Step 6: afterRender() — store reference to the <ul> element via document.getElementById
  constructor(config: TComponentConfig<object>) {
    super({
      ...config,
      listeners: ['animationend'],
    })
  }
  toHTML() {
    return `<ul aria-live="polite" aria-relevant="additions removals" id="toast-instance-${this.id}"></ul>`
  }

  getToastItem(item: TToastItem) {
    return `<li role="status" aria-atomic="true" aria-live="polite" key="${item.id}" data-removed="false" data-id="${item.id}" class="${css.fadeIn}">
                <div class="${cx(flex.flexColumnCenter, css.toast)}">
                    <p>${item.text}</p>
                </div>
            </li>`
  }

  toast(item: TToastItem) {
    const element = document.createElement('div')
    element.innerHTML = this.getToastItem(item)
    const toastElement = element.firstElementChild as HTMLLIElement
    this.listElement?.appendChild(toastElement)
    element.classList.add(css.fadeIn)

    setTimeout(() => {
      toastElement.classList.remove(css.fadeIn)
      toastElement.classList.add(css.fadeOut)
      toastElement.dataset.removed = 'true'
    }, TIMER)
  }

  afterRender(): void {
    this.listElement = document.getElementById(`toast-instance-${this.id}`) as HTMLUListElement
  }

  onAnimationend({ target }: AnimationEvent) {
    if (target instanceof HTMLElement && target.dataset.removed === 'true') {
      target.remove()
    }
  }
}
