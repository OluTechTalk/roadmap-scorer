import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clampCapacity,
  defaultState,
  loadState,
  parseState,
  saveState,
  serializeState,
} from '../src/storage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('export and import', () => {
  it('round-trips the default state', () => {
    const state = defaultState();
    const result = parseState(serializeState(state));
    expect(result).toEqual({ ok: true, state });
  });
  it('rejects text that is not JSON', () => {
    expect(parseState('nope')).toEqual({ ok: false, error: 'That file is not valid JSON.' });
  });
  it('rejects JSON with no request list', () => {
    expect(parseState('{"a":1}').ok).toBe(false);
    expect(parseState('[]').ok).toBe(false);
  });
  it('rejects a non-object request', () => {
    expect(parseState('{"requests":[3]}').ok).toBe(false);
  });
  it('coerces numeric strings and keeps bad numbers as NaN so they get flagged', () => {
    const result = parseState('{"requests":[{"id":"a","name":"A","impact":"7","effort":"x"}]}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.requests[0]?.impact).toBe(7);
      expect(result.state.requests[0]?.effort).toBeNaN();
    }
  });
  it('gives missing and duplicate ids safe values', () => {
    const result = parseState('{"requests":[{"name":"A"},{"id":"x"},{"id":"x"}]}');
    expect(result.ok && result.state.requests.map((r) => r.id)).toEqual(['imp-1', 'x', 'x-dup']);
  });
  it('falls back to the default preset and clamps capacity', () => {
    const result = parseState('{"requests":[],"preset":"free-text","capacity":999}');
    expect(result.ok && result.state.preset).toBe('impact-confidence-effort');
    expect(result.ok && result.state.capacity).toBe(40);
  });
  it('keeps edited notes for known requests only and drops non-text notes', () => {
    const result = parseState(
      '{"requests":[{"id":"a","name":"A"}],"notes":{"a":"my reason","ghost":"x","b":5}}',
    );
    expect(result.ok && result.state.notes).toEqual({ a: 'my reason' });
  });
  it('clamps capacity to 1 to 40 and defaults non-numbers to 12', () => {
    expect(clampCapacity(0)).toBe(1);
    expect(clampCapacity(100)).toBe(40);
    expect(clampCapacity(NaN)).toBe(12);
  });
});

describe('localStorage', () => {
  it('works with storage blocked: load returns null and save returns false', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    vi.stubGlobal('localStorage', blocked);
    expect(loadState()).toBeNull();
    expect(saveState(defaultState())).toBe(false);
  });
  it('saves and loads through storage', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
    const state = { ...defaultState(), capacity: 20 };
    expect(saveState(state)).toBe(true);
    expect(loadState()).toEqual(state);
  });
  it('ignores corrupted saved text', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{broken' });
    expect(loadState()).toBeNull();
  });
});
