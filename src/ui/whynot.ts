import { LANE_LABEL, plan, whyNotDraft } from '../score';
import type { AppState } from '../storage';
import { clear, h } from './dom';

export interface WhyNotHandle {
  render(): void;
}

/** One editable draft per request outside Now. Typing here never re-renders the list. */
export function mountWhyNot(root: HTMLElement, state: AppState, onNote: () => void): WhyNotHandle {
  const render = (): void => {
    clear(root);
    const result = plan(state.requests, state.preset, state.capacity);
    const below = [...result.lanes.next, ...result.lanes.later];
    if (below.length === 0) {
      root.append(
        h('p', { class: 'muted' }, 'Everything fits in Now, so there is nothing to explain.'),
      );
      return;
    }
    root.append(
      h(
        'p',
        { class: 'muted' },
        'Drafts built from each request’s own numbers, with no model involved. Edit any of them; your wording is kept.',
      ),
    );
    const list = h('ul', { class: 'whynot' });
    for (const p of below) {
      const id = p.request.id;
      const draft = whyNotDraft(p, result, state.preset);
      const area = h('textarea', { rows: 3, id: `note-${id}` });
      area.value = state.notes[id] ?? draft;
      const badge = h('span', { class: 'badge' });
      const reset = h('button', { type: 'button', class: 'ghost' }, 'Reset to draft');
      const sync = (): void => {
        const edited = state.notes[id] !== undefined;
        badge.textContent = edited ? 'Edited' : 'Draft';
        reset.hidden = !edited;
      };
      area.addEventListener('input', () => {
        state.notes[id] = area.value;
        sync();
        onNote();
      });
      reset.addEventListener('click', () => {
        delete state.notes[id];
        area.value = draft;
        sync();
        onNote();
      });
      sync();
      const name = p.request.name.trim() || id;
      list.append(
        h(
          'li',
          {},
          h(
            'label',
            { for: `note-${id}` },
            h('strong', {}, name),
            h('span', { class: 'muted' }, ` · ${LANE_LABEL[p.lane]} · rank #${p.rank} `),
            badge,
          ),
          area,
          reset,
        ),
      );
    }
    root.append(list);
  };
  return { render };
}
