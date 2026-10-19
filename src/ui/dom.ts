type Prop = string | number | boolean | EventListener | undefined;

/** Tiny element builder. `on*` props become listeners; `class` sets className; false/undefined are skipped. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, Prop> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      el.className = String(value);
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  }
  el.append(...children);
  return el;
}

export function clear(el: HTMLElement): void {
  el.replaceChildren();
}

/** Formats a score or weeks value without trailing noise: 2, 1.87, 0.21. */
export function fmt(n: number, digits = 2): string {
  return Number.isFinite(n) ? String(Number(n.toFixed(digits))) : '–';
}
