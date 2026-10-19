import {
  LANES,
  LANE_LABEL,
  MAX_CAPACITY,
  MIN_CAPACITY,
  plan,
  type Lane,
  type Placed,
} from '../score';
import type { AppState } from '../storage';
import { clear, fmt, h, weeks } from './dom';

const LANE_HINT: Record<Lane, string> = {
  now: 'Committed this window',
  next: 'The following window',
  later: 'Not scheduled yet',
};

export interface BoardHandle {
  render(): void;
}

function card(p: Placed): HTMLLIElement {
  const r = p.request;
  const meta = [
    `score ${fmt(p.score)}`,
    `${fmt(r.effort)} wk`,
    r.requester.trim() || 'no requester',
  ].join(' · ');
  return h(
    'li',
    { class: `card${p.blockedReason ? ' held' : ''}` },
    h('span', { class: 'rank-no', 'aria-label': `Rank ${p.rank}` }, `#${p.rank}`),
    h(
      'span',
      { class: 'card-main' },
      h('strong', {}, r.name.trim() || r.id),
      h('span', { class: 'muted' }, meta),
      p.blockedReason
        ? h('span', { class: 'reason' }, h('strong', {}, 'Held back: '), p.blockedReason)
        : '',
    ),
  );
}

export function mountBoard(
  root: HTMLElement,
  state: AppState,
  onCapacity: (weeks: number) => void,
): BoardHandle {
  const slider = h('input', {
    type: 'range',
    id: 'capacity',
    min: MIN_CAPACITY,
    max: MAX_CAPACITY,
    step: 1,
  });
  const readout = h('output', { for: 'capacity', class: 'cap-readout' });
  slider.addEventListener('input', () => {
    onCapacity(slider.valueAsNumber);
  });
  const summary = h('p', { class: 'summary', role: 'status' });
  const board = h('div', { class: 'board' });

  root.append(
    h(
      'div',
      { class: 'capacity' },
      h('label', { for: 'capacity' }, 'Team capacity (engineering weeks per window)'),
      h('div', { class: 'cap-row' }, slider, readout),
    ),
    summary,
    board,
  );

  const render = (): void => {
    const result = plan(state.requests, state.preset, state.capacity);
    slider.value = String(state.capacity);
    slider.setAttribute('aria-valuetext', weeks(state.capacity));
    readout.textContent = weeks(state.capacity);

    const total = result.placed.length;
    const nowCount = result.lanes.now.length;
    summary.textContent =
      total === 0
        ? 'No ranked requests yet.'
        : `At ${weeks(state.capacity)}: ${nowCount} of ${total} requests committed in Now (${weeks(result.used.now)} used).` +
          (result.cutoffScore === null
            ? ' Nothing fits.'
            : ` Lowest score in Now: ${fmt(result.cutoffScore)}.`) +
          (result.excluded.length > 0
            ? ` ${result.excluded.length} not ranked because of errors.`
            : '');

    clear(board);
    for (const lane of LANES) {
      const items = result.lanes[lane];
      const over = lane === 'next' && result.used.next > state.capacity + 1e-9;
      const list = h('ul', { class: 'cards' });
      for (const p of items) list.append(card(p));
      if (items.length === 0) list.append(h('li', { class: 'empty muted' }, 'Nothing here.'));
      board.append(
        h(
          'section',
          { class: `lane lane-${lane}`, 'aria-label': `${LANE_LABEL[lane]} lane` },
          h(
            'header',
            {},
            h('h3', {}, LANE_LABEL[lane]),
            h('span', { class: 'muted' }, LANE_HINT[lane]),
            lane === 'later'
              ? h('span', { class: 'weeks' }, `${weeks(result.used[lane])} of work`)
              : h(
                  'span',
                  { class: `weeks${over ? ' over' : ''}` },
                  `${fmt(result.used[lane])} of ${weeks(state.capacity)} used${over ? ' (over capacity)' : ''}`,
                ),
          ),
          list,
        ),
      );
      if (lane === 'now') {
        board.append(
          h(
            'div',
            { class: 'cutline', role: 'separator', 'aria-label': 'Capacity cut line' },
            h(
              'span',
              {},
              `Capacity cut line · ${weeks(state.capacity)}` +
                (result.cutoffScore === null
                  ? ' · nothing fits'
                  : ` · lowest score above it: ${fmt(result.cutoffScore)}`),
            ),
          ),
        );
      }
    }
  };
  return { render };
}
