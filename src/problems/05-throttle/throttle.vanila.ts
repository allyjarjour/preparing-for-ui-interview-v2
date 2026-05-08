// bun test src/problems/05-throttle/test/throttle.test.ts

export function throttle<F extends (...args: any[]) => void>(fn: F, delay: number): (...args: Parameters<F>) => void {
    let timestamp: number | null = null;

    return function throttled(this: unknown, ...args: Parameters<F>): void {
        if (timestamp && ((Date.now() - timestamp) <= delay)) {
            return;
        } else {
            fn.apply(this, args)
            timestamp = Date.now()
        }

    }
}

// --- Examples ---
// Uncomment to test your implementation:

// const log = throttle((msg: string) => console.log(msg), 300)
// log('a')  // fires immediately → "a"
// log('b')  // ignored (within 300ms)
// log('c')  // ignored (within 300ms)
// setTimeout(() => log('d'), 400)  // fires → "d" (300ms passed)
