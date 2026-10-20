import { CONFIDENCE_STEP, sensitivity, type Request } from '../score';
import type { AppState } from '../storage';
import { clear, h } from './dom';

const names = (list: Request[]): string => list.map((r) => r.name.trim() || r.id).join(', ');
const count = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

export function renderSensitivity(root: HTMLElement, state: AppState): void {
  clear(root);
  const result = sensitivity(state.requests, state.preset, state.capacity);
  if (!result.usesConfidence) {
    root.append(
      h(
        'p',
        {},
        'This formula ignores confidence, so shifting it by 0.2 moves nothing. Switch to a formula that uses confidence to see the check.',
      ),
    );
    return;
  }
  const crossings = result.cases.reduce((n, c) => n + c.enteredNow.length + c.leftNow.length, 0);
  root.append(
    h(
      'p',
      { class: 'summary' },
      crossings === 0
        ? `The Now list holds if every confidence is off by ${CONFIDENCE_STEP} in either direction.`
        : `The Now list changes if every confidence is off by ${CONFIDENCE_STEP}.`,
    ),
  );
  const list = h('ul', { class: 'sens' });
  for (const c of result.cases) {
    const sign = c.delta < 0 ? '−' : '+';
    list.append(
      h(
        'li',
        {},
        h('strong', {}, `Confidence ${sign}${CONFIDENCE_STEP}: `),
        c.leftNow.length > 0
          ? `${count(c.leftNow.length, 'request leaves', 'requests leave')} Now (${names(c.leftNow)}). `
          : 'No request leaves Now. ',
        c.enteredNow.length > 0
          ? `${count(c.enteredNow.length, 'request enters', 'requests enter')} Now (${names(c.enteredNow)}). `
          : 'No request enters Now. ',
        `${count(c.rankChanges, 'request changes', 'requests change')} rank position.`,
      ),
    );
  }
  root.append(list, h('p', { class: 'muted' }, 'Confidence is clamped to 0 to 1 after the shift.'));
}
