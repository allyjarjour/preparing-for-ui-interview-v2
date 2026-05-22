import { AbstractComponent, type TComponentConfig } from '@course/utils'
import css from './tooltip.module.css'

type TPositionType = 'top' | 'bottom' | 'left' | 'right' | 'auto'

type TCandidate = { position: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number }

type TTooltipProps = {
    position?: TPositionType
    children: HTMLElement
    content: string
    boundary?: HTMLElement
}

const positions: Record<TPositionType, string> = {
    top: css.top,
    bottom: css.bottom,
    left: css.left,
    right: css.right,
    auto: ''
} as const

let id = 0

/**
 * Helper: determine best position when position='auto'
 * - Get bounding rects for tooltip and container
 * - Check candidates (top, right, bottom, left) against boundary
 * - Return first position that fits, or 'top' as fallback
 */
function getAutoPosition(
    tooltip: HTMLElement,
    container: HTMLElement,
    boundaryElement: HTMLElement,
): Exclude<TPositionType, 'auto'> {
    const [t, c, b] = [tooltip, container, boundaryElement].map(el => el.getBoundingClientRect())
    /**
     *                  ┌───TOP───┐
     *                  └─────────┘
     *     ┌──LEFT──┐   ┌─────────┐   ┌──RIGHT──┐
     *     └────────┘   │CONTAINER│   └─────────┘
     *                  └─────────┘
     *                  ┌──BOTTOM─┐
     *                  └─────────┘
     */
    const candidates: TCandidate[] = [
        { position: 'top', x: c.left, y: c.top - t.height },
        { position: 'right', x: c.right, y: c.top },
        { position: 'bottom', x: c.left, y: c.bottom },
        { position: 'left', x: c.left - t.width, y: c.top },
    ];

    /**
     * boundaryRect.left          boundaryRect.right
     *        ↓                          ↓
     *        ┌──────────────────────────┐  ← boundaryRect.top
     *        │                          │
     *        │                          │
     *        │      ┌──────────┐        │
     *        │      │  TOOLTIP │        │
     *        │      └──────────┘        │
     *        │                          │
     *        │                          │
     *        └──────────────────────────┘  ← boundaryRect.bottom
     */
    const fit = ({ x, y }: TCandidate) => {
        const isFitHorizontal = x >= b.left && x + t.width <= b.right;
        const isFitVertical = y >= b.top && Math.ceil(y + t.height) <= b.bottom;
        return isFitHorizontal && isFitVertical;

    }

    const candiate = candidates.find(fit);
    return candiate?.position ?? 'top';
}

/**
 * Expected input:
 * {
 *   "children": HTMLElement (the trigger element),
 *   "content": "Tooltip text",
 *   "position": "top" | "bottom" | "left" | "right" | "auto",
 *   "boundary": HTMLElement (optional, for auto-positioning)
 * }
 *
 * Step 1: Extend AbstractComponent<TTooltipProps>
 * - Call super() with config, adding:
 *   - className: [css.container]
 *   - listeners: ['mouseenter', 'mouseleave', 'focusin', 'focusout', 'keydown']
 * - Store a unique id and a reference for the tooltip element
 */
export class Tooltip extends AbstractComponent<TTooltipProps> {

    id = `${id++}`;
    tooltip: HTMLElement | null = null;

    constructor(config: TComponentConfig<TTooltipProps>) {
        super({
            ...config,
            className: [css.container],
            listeners: ['mouseenter', 'mouseleave', 'focusin', 'focusout', 'keydown'],
        })
    }

    /**
     * Step 2: Implement toHTML
     * - Return a <div> with role="tooltip", unique id, display:none
     * - Apply css.tooltip class and position class from positions map
     * - Content comes from this.config.content
     * a11y: role="tooltip" on the tooltip element
     */
    toHTML(): string {
        return `<div  class="${css.tooltip}" id="${this.id}" role="tooltip">${this.config.content}</div>`;
    }

    /**
     * Step 3: Implement afterRender
     * - Append this.config.children (the trigger element) to this.container
     * - Query and store the tooltip element by its id
     * a11y: set aria-describedby on the trigger element pointing to the tooltip id
     */
    afterRender(): void {
        this.container?.appendChild(this.config.children);
        this.tooltip = document.getElementById(this.id)
    }

    /**
     * Step 4: Implement event handlers
     * - onMouseenter / onFocusin: show the tooltip (call showTooltip)
     * - onMouseleave / onFocusout: hide the tooltip (set display to 'none')
     * - onKeydown: hide on Escape key
     * a11y: focusin/focusout ensure keyboard users can trigger tooltip; Escape dismisses it
     */
    onMouseenter() {
        this.showTooltip()
    }

    onMouseleave() {
        this.hideTooltip()
    }

    onFocusin() {
        this.showTooltip()
    }

    onFocusout() {
        this.hideTooltip()
    }

    onKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            this.tooltip!.style.display = 'none'
        }
    }

    /**
     * Step 5: Implement showTooltip
     * - Set tooltip display to 'block'
     * - If position is 'auto': compute best position using getAutoPosition,
     *   remove all position classes, add the computed one
     */
    showTooltip() {
        const tooltip = this.tooltip!;
        const position = this.config.position;
        tooltip.style.display = 'block'

        const positionClass = position === 'auto' ? getAutoPosition(this.tooltip!, this.container!, this.config.boundary ?? document.body) : position ?? 'top';
        for (const classname of Object.values(positions)) {
            if (classname) {
                tooltip.classList.remove(classname)
            }
        }
        tooltip.classList.add(positions[positionClass])
    }

    hideTooltip() {
        this.tooltip!.style.display = 'none'
    }
}
