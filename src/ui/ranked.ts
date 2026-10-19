import { rank, validate } from '../score';
import type { AppState } from '../storage';
import { clear, fmt, h } from './dom';

export function renderRanked(root: HTMLElement, state: AppState): void {
  clear(root);
  const ranked = rank(state.requests, state.preset);
  if (ranked.length === 0) {
    root.append(
      h('p', { class: 'muted' }, 'Nothing to rank yet. Add a request or fix the errors above.'),
    );
    return;
  }
  const list = h('ol', { class: 'ranked' });
  for (const item of ranked) {
    const r = item.request;
    list.append(
      h(
        'li',
        {},
        h('span', { class: 'rank-no', 'aria-label': `Rank ${item.rank}` }, String(item.rank)),
        h(
          'span',
          { class: 'rank-main' },
          h('strong', {}, r.name.trim() || r.id),
          h(
            'span',
            { class: 'muted' },
            `${r.requester.trim() || 'no requester'} · impact ${fmt(r.impact)} · confidence ${fmt(r.confidence)} · ${fmt(r.effort)} wk`,
          ),
        ),
        h('span', { class: 'rank-score' }, fmt(item.score)),
      ),
    );
  }
  root.append(list);
}

export function renderIssues(root: HTMLElement, state: AppState): void {
  clear(root);
  // Field errors are shown on their rows; this list covers the cross-request problems.
  const issues = validate(state.requests).filter(
    (i) => i.code === 'cycle' || i.code === 'duplicate-id' || i.code === 'unknown-dependency',
  );
  root.hidden = issues.length === 0;
  for (const issue of issues) root.append(h('li', {}, issue.message));
}
