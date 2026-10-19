import { PRESETS, getPreset, type PresetId } from '../score';
import { parseState, serializeState, type AppState } from '../storage';
import { h } from './dom';

export interface ControlsHooks {
  onPreset(id: PresetId): void;
  /** Replace everything (import, reset, clear). */
  onReplace(next: AppState): void;
  onReset(): void;
  onClear(): void;
}

export interface ControlsHandle {
  setPreset(id: PresetId): void;
  say(message: string, isError?: boolean): void;
}

export function mountFormula(
  root: HTMLElement,
  state: AppState,
  hooks: Pick<ControlsHooks, 'onPreset'>,
): ControlsHandle {
  const formula = h('code', { id: 'formula' });
  const status = h('p', { class: 'status', role: 'status' });
  const radios = new Map<PresetId, HTMLInputElement>();
  const group = h('fieldset', { class: 'presets' }, h('legend', {}, 'Scoring formula'));

  for (const preset of PRESETS) {
    const input = h('input', { type: 'radio', name: 'preset', value: preset.id });
    input.checked = preset.id === state.preset;
    input.addEventListener('change', () => {
      if (input.checked) hooks.onPreset(preset.id);
    });
    radios.set(preset.id, input);
    group.append(h('label', { class: 'radio' }, input, preset.label));
  }
  const show = (id: PresetId): void => {
    formula.textContent = getPreset(id).formula;
  };
  show(state.preset);
  root.append(
    group,
    h('p', { class: 'formula-line' }, 'Current formula: ', formula),
    h(
      'p',
      { class: 'muted' },
      'Impact is on a 1 to 10 scale with no unit. Confidence is 0 to 1. Effort is engineering weeks.',
    ),
    status,
  );
  return {
    setPreset(id) {
      const input = radios.get(id);
      if (input) input.checked = true;
      show(id);
    },
    say(message, isError = false) {
      status.textContent = message;
      status.classList.toggle('error', isError);
    },
  };
}

export function mountFileControls(
  root: HTMLElement,
  state: AppState,
  hooks: ControlsHooks,
  say: (message: string, isError?: boolean) => void,
): void {
  const file = h('input', {
    type: 'file',
    accept: 'application/json,.json',
    hidden: true,
    id: 'import-file',
  });
  file.addEventListener('change', async () => {
    const picked = file.files?.[0];
    file.value = '';
    if (!picked) return;
    const result = parseState(await picked.text());
    if (!result.ok) {
      say(`Import failed: ${result.error} Your current requests are unchanged.`, true);
      return;
    }
    hooks.onReplace(result.state);
    say(`Imported ${result.state.requests.length} requests from ${picked.name}.`);
  });

  const exportBtn = h(
    'button',
    {
      type: 'button',
      onclick: () => {
        const url = URL.createObjectURL(
          new Blob([serializeState(state)], { type: 'application/json' }),
        );
        const a = h('a', { href: url, download: 'roadmap-scorer.json' });
        document.body.append(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        say('Exported roadmap-scorer.json.');
      },
    },
    'Export JSON',
  );
  const importBtn = h('button', { type: 'button', onclick: () => file.click() }, 'Import JSON');
  const resetBtn = h(
    'button',
    { type: 'button', class: 'ghost', onclick: () => hooks.onReset() },
    'Reset to examples',
  );
  const clearBtn = h(
    'button',
    { type: 'button', class: 'ghost', onclick: () => hooks.onClear() },
    'Clear all',
  );
  root.append(exportBtn, importBtn, resetBtn, clearBtn, file);
}
