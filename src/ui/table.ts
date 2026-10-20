import { scoreRequest, validateRequest, type Request } from '../score';
import type { AppState } from '../storage';
import { clear, fmt, h } from './dom';

interface RowRefs {
  el: HTMLLIElement;
  request: Request;
  score: HTMLElement;
  error: HTMLElement;
  depSummary: HTMLElement;
  depBody: HTMLElement;
  remove: HTMLButtonElement;
  depSig: string;
}

export interface TableHandle {
  /** Rebuild every row (rows added, removed or replaced). */
  rebuild(): void;
  /** Update scores, errors and dependency labels in place, without touching the inputs. */
  refresh(): void;
}

let counter = 0;
export function newRequest(): Request {
  counter += 1;
  return {
    id: `new-${Date.now().toString(36)}-${counter}`,
    name: 'New request',
    requester: '',
    impact: 5,
    confidence: 0.5,
    effort: 1,
    dependsOn: [],
  };
}

export function mountTable(
  root: HTMLElement,
  state: AppState,
  onChange: (structural: boolean) => void,
): TableHandle {
  let rows: RowRefs[] = [];

  const field = (label: string, input: HTMLInputElement, className = ''): HTMLLabelElement =>
    h('label', { class: `field ${className}`.trim() }, h('span', {}, label), input);

  const numberInput = (
    value: number,
    attrs: Record<string, string>,
    set: (n: number) => void,
  ): HTMLInputElement => {
    const input = h('input', { type: 'number', inputmode: 'decimal', ...attrs });
    input.value = Number.isFinite(value) ? String(value) : '';
    input.addEventListener('input', () => {
      set(input.valueAsNumber);
      onChange(false);
    });
    return input;
  };

  const buildRow = (request: Request): RowRefs => {
    const name = h('input', { type: 'text' });
    name.value = request.name;
    name.addEventListener('input', () => {
      request.name = name.value;
      onChange(false);
    });
    const requester = h('input', { type: 'text' });
    requester.value = request.requester;
    requester.addEventListener('input', () => {
      request.requester = requester.value;
      onChange(false);
    });

    const impact = numberInput(request.impact, { min: '1', max: '10', step: '0.5' }, (n) => {
      request.impact = n;
    });
    const confidence = numberInput(
      request.confidence,
      { min: '0', max: '1', step: '0.05' },
      (n) => {
        request.confidence = n;
      },
    );
    const effort = numberInput(request.effort, { min: '0', step: '0.5' }, (n) => {
      request.effort = n;
    });

    const score = h('output', { class: 'score' });
    const error = h('p', { class: 'row-error', role: 'alert' });
    const depSummary = h('summary', {});
    const depBody = h('div', { class: 'dep-list' });
    const deps = h('details', { class: 'deps' }, depSummary, depBody);

    const remove = h(
      'button',
      {
        type: 'button',
        class: 'ghost danger',
        onclick: () => {
          const i = state.requests.indexOf(request);
          if (i < 0) return;
          state.requests.splice(i, 1);
          delete state.notes[request.id];
          for (const r of state.requests) r.dependsOn = r.dependsOn.filter((d) => d !== request.id);
          onChange(true);
        },
      },
      'Remove',
    );

    const el = h(
      'li',
      { class: 'req', 'data-id': request.id },
      field('Request', name, 'f-name'),
      field('Requester', requester, 'f-requester'),
      field('Impact (1–10)', impact, 'f-num'),
      field('Confidence (0–1)', confidence, 'f-num'),
      field('Effort (weeks)', effort, 'f-num'),
      h('div', { class: 'field f-score' }, h('span', {}, 'Score'), score),
      h('div', { class: 'field f-deps' }, h('span', {}, 'Depends on'), deps),
      h('div', { class: 'f-actions' }, remove),
      error,
    );
    return { el, request, score, error, depSummary, depBody, remove, depSig: '' };
  };

  const refreshDeps = (row: RowRefs): void => {
    const others = state.requests.filter((r) => r !== row.request);
    const chosen = row.request.dependsOn.filter((d) => others.some((o) => o.id === d));
    row.depSummary.textContent = chosen.length === 0 ? 'None' : `${chosen.length} selected`;
    // Only rebuild the checkboxes when the list of other requests changed, so keyboard focus survives.
    const sig = others.map((o) => `${o.id}:${o.name}`).join('|');
    if (sig === row.depSig) return;
    row.depSig = sig;
    clear(row.depBody);
    if (others.length === 0) {
      row.depBody.append(h('p', { class: 'muted' }, 'No other requests.'));
      return;
    }
    for (const other of others) {
      const box = h('input', { type: 'checkbox' });
      box.checked = row.request.dependsOn.includes(other.id);
      box.addEventListener('change', () => {
        const set = new Set(row.request.dependsOn);
        if (box.checked) set.add(other.id);
        else set.delete(other.id);
        row.request.dependsOn = [...set];
        onChange(false);
      });
      row.depBody.append(h('label', { class: 'check' }, box, other.name.trim() || other.id));
    }
  };

  const handle: TableHandle = {
    rebuild() {
      clear(root);
      rows = state.requests.map(buildRow);
      for (const row of rows) root.append(row.el);
      handle.refresh();
    },
    refresh() {
      for (const row of rows) {
        const issues = validateRequest(row.request);
        const s = scoreRequest(row.request, state.preset);
        row.score.textContent = s === null ? 'not ranked' : fmt(s);
        row.error.textContent = issues.map((i) => i.message).join(' ');
        row.el.classList.toggle('invalid', issues.length > 0);
        row.remove.setAttribute('aria-label', `Remove ${row.request.name.trim() || 'request'}`);
        refreshDeps(row);
      }
    },
  };
  return handle;
}
