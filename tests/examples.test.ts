import { describe, expect, it } from 'vitest';
import { EXAMPLE_REQUESTS } from '../src/data/examples';
import { DEFAULT_CAPACITY, DEFAULT_PRESET, plan, validate } from '../src/score';

describe('example data', () => {
  it('has 11 requests with unique ids, no errors and no cycles', () => {
    expect(EXAMPLE_REQUESTS).toHaveLength(11);
    expect(new Set(EXAMPLE_REQUESTS.map((r) => r.id)).size).toBe(11);
    expect(validate(EXAMPLE_REQUESTS)).toEqual([]);
  });
  it('has at least two requests with dependencies', () => {
    expect(EXAMPLE_REQUESTS.filter((r) => r.dependsOn.length > 0).length).toBeGreaterThanOrEqual(2);
  });
  it('spreads across all three lanes at the default capacity', () => {
    const p = plan(EXAMPLE_REQUESTS, DEFAULT_PRESET, DEFAULT_CAPACITY);
    expect(p.lanes.now.length).toBeGreaterThan(0);
    expect(p.lanes.next.length).toBeGreaterThan(0);
    expect(p.lanes.later.length).toBeGreaterThan(0);
  });
  it('shows at least one dependency block at the default capacity', () => {
    const p = plan(EXAMPLE_REQUESTS, DEFAULT_PRESET, DEFAULT_CAPACITY);
    expect(p.placed.some((x) => x.blockedReason?.startsWith('blocked by'))).toBe(true);
  });
});
