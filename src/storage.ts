import { EXAMPLE_REQUESTS } from './data/examples';
import {
  DEFAULT_CAPACITY,
  DEFAULT_PRESET,
  MAX_CAPACITY,
  MIN_CAPACITY,
  PRESETS,
  type PresetId,
  type Request,
} from './score';

export interface AppState {
  requests: Request[];
  preset: PresetId;
  capacity: number;
  /** Why-not notes the user has edited, by request id. Untouched drafts are not stored. */
  notes: Record<string, string>;
}

export const STORAGE_KEY = 'roadmap-scorer:v1';
const FORMAT_VERSION = 1;
const MAX_REQUESTS = 200;
const MAX_NOTE = 2000;

export function defaultState(): AppState {
  return {
    requests: EXAMPLE_REQUESTS.map((r) => ({ ...r, dependsOn: [...r.dependsOn] })),
    preset: DEFAULT_PRESET,
    capacity: DEFAULT_CAPACITY,
    notes: {},
  };
}

export function serializeState(state: AppState): string {
  return JSON.stringify({ version: FORMAT_VERSION, ...state }, null, 2);
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Keeps out-of-range numbers as they are so the table can flag them instead of silently changing them. */
const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
};

export function clampCapacity(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_CAPACITY;
  return Math.min(MAX_CAPACITY, Math.max(MIN_CAPACITY, n));
}

export type ParseResult = { ok: true; state: AppState } | { ok: false; error: string };

/** Turns untrusted JSON text into app state, or says what is wrong with it. */
export function parseState(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (!isRecord(raw) || !Array.isArray(raw.requests)) {
    return { ok: false, error: 'That file has no list of requests.' };
  }
  if (raw.requests.length > MAX_REQUESTS) {
    return { ok: false, error: `That file has more than ${MAX_REQUESTS} requests.` };
  }
  const requests: Request[] = [];
  const seen = new Set<string>();
  for (const [i, item] of raw.requests.entries()) {
    if (!isRecord(item)) return { ok: false, error: `Request ${i + 1} is not an object.` };
    let id = typeof item.id === 'string' && item.id ? item.id : `imp-${i + 1}`;
    while (seen.has(id)) id += '-dup';
    seen.add(id);
    requests.push({
      id,
      name: typeof item.name === 'string' ? item.name : '',
      requester: typeof item.requester === 'string' ? item.requester : '',
      impact: toNumber(item.impact),
      confidence: toNumber(item.confidence),
      effort: toNumber(item.effort),
      dependsOn: Array.isArray(item.dependsOn)
        ? item.dependsOn.filter((d): d is string => typeof d === 'string')
        : [],
    });
  }
  const preset = PRESETS.find((p) => p.id === raw.preset)?.id ?? DEFAULT_PRESET;
  const capacity = clampCapacity(toNumber(raw.capacity));
  const notes: Record<string, string> = {};
  if (isRecord(raw.notes)) {
    for (const [id, text] of Object.entries(raw.notes)) {
      if (typeof text === 'string' && seen.has(id)) notes[id] = text.slice(0, MAX_NOTE);
    }
  }
  return { ok: true, state: { requests, preset, capacity, notes } };
}

/** Saved edits, or null when nothing is saved, storage is blocked, or the saved text is unusable. */
export function loadState(): AppState | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    const result = parseState(text);
    return result.ok ? result.state : null;
  } catch {
    return null;
  }
}

/** Returns false when storage is blocked or full; the app keeps working without it. */
export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, serializeState(state));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked: nothing to clear */
  }
}
