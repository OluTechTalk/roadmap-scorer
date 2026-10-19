import './style.css';
import { EXAMPLE_LABEL, EXAMPLE_NOTE, EXAMPLE_REQUESTS } from './data/examples';
import type { PresetId } from './score';
import { clearSavedState, defaultState, loadState, saveState, type AppState } from './storage';
import { mountFileControls, mountFormula } from './ui/controls';
import { h } from './ui/dom';
import { renderIssues, renderRanked } from './ui/ranked';
import { mountTable, newRequest } from './ui/table';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app');

const state: AppState = loadState() ?? defaultState();
const exampleIds = new Set(EXAMPLE_REQUESTS.map((r) => r.id));

const banner = h(
  'div',
  { class: 'example-banner', role: 'note' },
  h('strong', {}, EXAMPLE_LABEL),
  ' ',
  EXAMPLE_NOTE,
);
const formulaRoot = h('div', {});
const fileRoot = h('div', { class: 'toolbar' });
const tableRoot = h('ul', { class: 'requests' });
const issuesRoot = h('ul', { class: 'issues', role: 'status' });
const rankedRoot = h('div', {});
const saveNote = h('p', { class: 'status error', role: 'status', hidden: true });

app.append(
  h(
    'header',
    {},
    h('h1', {}, 'Roadmap Scorer'),
    h('p', { class: 'lede' }, 'Rank feature requests by expected gain per engineering week.'),
  ),
  banner,
  h(
    'main',
    {},
    h(
      'section',
      { 'aria-labelledby': 'h-formula' },
      h('h2', { id: 'h-formula' }, 'Formula'),
      formulaRoot,
    ),
    h(
      'section',
      { 'aria-labelledby': 'h-requests' },
      h('h2', { id: 'h-requests' }, 'Requests'),
      fileRoot,
      saveNote,
      tableRoot,
      h(
        'button',
        {
          type: 'button',
          class: 'add',
          onclick: () => {
            state.requests.push(newRequest());
            changed(true);
            tableRoot.lastElementChild?.querySelector('input')?.focus();
          },
        },
        'Add request',
      ),
      issuesRoot,
    ),
    h(
      'section',
      { 'aria-labelledby': 'h-ranked' },
      h('h2', { id: 'h-ranked' }, 'Ranked list'),
      rankedRoot,
    ),
  ),
);

const table = mountTable(tableRoot, state, (structural) => changed(structural));
const formula = mountFormula(formulaRoot, state, {
  onPreset(id: PresetId) {
    state.preset = id;
    formula.setPreset(id);
    changed(false);
  },
});

function replaceState(next: AppState): void {
  state.requests = next.requests;
  state.preset = next.preset;
  state.capacity = next.capacity;
  formula.setPreset(state.preset);
  changed(true);
}

mountFileControls(
  fileRoot,
  state,
  {
    onPreset: () => undefined,
    onReplace: replaceState,
    onReset() {
      clearSavedState();
      replaceState(defaultState());
      formula.say('Reset to the example requests.');
    },
    onClear() {
      replaceState({ ...state, requests: [] });
      formula.say('Cleared all requests. Use Add request or Import JSON to start.');
    },
  },
  (message, isError) => formula.say(message, isError),
);

function changed(structural: boolean): void {
  if (structural) table.rebuild();
  else table.refresh();
  renderRanked(rankedRoot, state);
  renderIssues(issuesRoot, state);
  banner.hidden = !state.requests.some((r) => exampleIds.has(r.id));
  const saved = saveState(state);
  saveNote.hidden = saved;
  saveNote.textContent = saved
    ? ''
    : 'Browser storage is blocked, so edits last only until you close this tab. Use Export JSON to keep them.';
}

changed(true);
