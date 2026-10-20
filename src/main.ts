import './style.css';
import { EXAMPLE_LABEL, EXAMPLE_NOTE, EXAMPLE_REQUESTS } from './data/examples';
import type { PresetId } from './score';
import { clearSavedState, defaultState, loadState, saveState, type AppState } from './storage';
import { mountBoard } from './ui/board';
import { mountFileControls, mountFormula } from './ui/controls';
import { h } from './ui/dom';
import { renderIssues, renderRanked } from './ui/ranked';
import { renderSensitivity } from './ui/sensitivity';
import { mountWhyNot } from './ui/whynot';
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
const boardBadge = h('span', { class: 'badge' }, EXAMPLE_LABEL);
const formulaRoot = h('div', {});
const fileRoot = h('div', { class: 'toolbar' });
const tableRoot = h('ul', { class: 'requests' });
const boardRoot = h('div', {});
const sensitivityRoot = h('div', {});
const whyNotRoot = h('div', {});
const issuesRoot = h('ul', { class: 'issues', role: 'status' });
const rankedRoot = h('div', {});
const saveNote = h('p', { class: 'status error', role: 'status', hidden: true });

app.append(
  h('a', { class: 'skip', href: '#h-board' }, 'Skip to the board'),
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
      { 'aria-labelledby': 'h-board' },
      h('h2', { id: 'h-board' }, 'Board ', boardBadge),
      issuesRoot,
      boardRoot,
    ),
    h(
      'section',
      { 'aria-labelledby': 'h-sens' },
      h('h2', { id: 'h-sens' }, 'Sensitivity'),
      sensitivityRoot,
    ),
    h(
      'section',
      { 'aria-labelledby': 'h-whynot' },
      h('h2', { id: 'h-whynot' }, 'Why not now'),
      whyNotRoot,
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
const board = mountBoard(boardRoot, state, (weeks) => {
  state.capacity = weeks;
  changed(false);
});
const whyNot = mountWhyNot(whyNotRoot, state, () => saveState(state));
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
  state.notes = next.notes;
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
      replaceState({ ...state, requests: [], notes: {} });
      formula.say('Cleared all requests. Use Add request or Import JSON to start.');
    },
  },
  (message, isError) => formula.say(message, isError),
);

function changed(structural: boolean): void {
  if (structural) table.rebuild();
  else table.refresh();
  board.render();
  renderSensitivity(sensitivityRoot, state);
  whyNot.render();
  renderRanked(rankedRoot, state);
  renderIssues(issuesRoot, state);
  const showExamples = state.requests.some((r) => exampleIds.has(r.id));
  banner.hidden = !showExamples;
  boardBadge.hidden = !showExamples;
  const saved = saveState(state);
  saveNote.hidden = saved;
  saveNote.textContent = saved
    ? ''
    : 'Browser storage is blocked, so edits last only until you close this tab. Use Export JSON to keep them.';
}

changed(true);
