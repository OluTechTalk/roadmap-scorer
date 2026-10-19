import { describe, expect, it } from 'vitest';
import {
  findCycles,
  plan,
  rank,
  scoreRequest,
  sensitivity,
  validate,
  validateRequest,
  type Request,
} from '../src/score';

const req = (id: string, over: Partial<Request> = {}): Request => ({
  id,
  name: id,
  requester: 'Test',
  impact: 5,
  confidence: 1,
  effort: 1,
  dependsOn: [],
  ...over,
});

const ids = (list: { request: Request }[]): string[] => list.map((p) => p.request.id);
const ICE = 'impact-confidence-effort';

describe('score presets', () => {
  it('default preset is impact × confidence ÷ effort', () => {
    expect(scoreRequest(req('a', { impact: 8, confidence: 0.5, effort: 2 }), ICE)).toBe(2);
  });
  it('impact ÷ effort ignores confidence', () => {
    expect(scoreRequest(req('a', { impact: 8, confidence: 0.1, effort: 4 }), 'impact-effort')).toBe(
      2,
    );
  });
  it('impact × confidence ignores effort', () => {
    expect(
      scoreRequest(req('a', { impact: 8, confidence: 0.5, effort: 40 }), 'impact-confidence'),
    ).toBe(4);
  });
  it('rounds away floating-point noise', () => {
    expect(scoreRequest(req('a', { impact: 1, confidence: 1, effort: 3 }), ICE)).toBe(0.333333);
  });
});

describe('validation', () => {
  it('rejects zero effort with a message', () => {
    const issues = validateRequest(req('a', { effort: 0 }));
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toMatch(/effort above 0/);
    expect(scoreRequest(req('a', { effort: 0 }), ICE)).toBeNull();
  });
  it('rejects negative, NaN and infinite effort', () => {
    for (const effort of [-1, NaN, Infinity]) {
      expect(scoreRequest(req('a', { effort }), ICE)).toBeNull();
    }
  });
  it('rejects impact and confidence out of range', () => {
    expect(validateRequest(req('a', { impact: 11 }))[0]?.code).toBe('impact');
    expect(validateRequest(req('a', { impact: 0 }))[0]?.code).toBe('impact');
    expect(validateRequest(req('a', { confidence: 1.1 }))[0]?.code).toBe('confidence');
    expect(validateRequest(req('a', { confidence: -0.1 }))[0]?.code).toBe('confidence');
  });
  it('accepts confidence of exactly 0 and 1', () => {
    expect(validateRequest(req('a', { confidence: 0 }))).toEqual([]);
    expect(validateRequest(req('a', { confidence: 1 }))).toEqual([]);
  });
  it('warns about unknown dependencies and duplicate ids', () => {
    const issues = validate([req('a', { dependsOn: ['ghost'] }), req('a')]);
    expect(issues.map((i) => i.code).sort()).toEqual(['duplicate-id', 'unknown-dependency']);
  });
});

describe('ranking', () => {
  it('sorts by score, highest first, with 1-based ranks', () => {
    const r = rank([req('low', { impact: 2 }), req('high', { impact: 9 })], ICE);
    expect(r.map((x) => [x.request.id, x.rank])).toEqual([
      ['high', 1],
      ['low', 2],
    ]);
  });
  it('breaks ties by lower effort first', () => {
    const r = rank(
      [req('big', { impact: 8, effort: 4 }), req('small', { impact: 4, effort: 2 })],
      ICE,
    );
    expect(ids(r)).toEqual(['small', 'big']);
  });
  it('breaks remaining ties by name', () => {
    const r = rank([req('b'), req('a'), req('c')], ICE);
    expect(ids(r)).toEqual(['a', 'b', 'c']);
  });
  it('is stable regardless of input order', () => {
    const items = [req('b'), req('a'), req('c', { impact: 9 })];
    expect(ids(rank(items, ICE))).toEqual(ids(rank([...items].reverse(), ICE)));
  });
  it('leaves invalid requests out of the ranking', () => {
    expect(ids(rank([req('ok'), req('bad', { effort: 0 })], ICE))).toEqual(['ok']);
  });
  it('changes order when the preset changes', () => {
    const items = [
      req('sure', { impact: 4, confidence: 1, effort: 1 }),
      req('hope', { impact: 9, confidence: 0.2, effort: 1 }),
    ];
    expect(ids(rank(items, 'impact-effort'))).toEqual(['hope', 'sure']);
    expect(ids(rank(items, ICE))).toEqual(['sure', 'hope']);
  });
});

describe('capacity lanes', () => {
  const items = [
    req('a', { impact: 9, effort: 4 }),
    req('b', { impact: 8, effort: 4 }),
    req('c', { impact: 7, effort: 4 }),
    req('d', { impact: 6, effort: 4 }),
    req('e', { impact: 5, effort: 4 }),
    req('f', { impact: 4, effort: 4 }),
  ];
  it('puts the top requests that fit into Now and the next window into Next', () => {
    const p = plan(items, ICE, 8);
    expect(ids(p.lanes.now)).toEqual(['a', 'b']);
    expect(ids(p.lanes.next)).toEqual(['c', 'd']);
    expect(ids(p.lanes.later)).toEqual(['e', 'f']);
    expect(p.used).toEqual({ now: 8, next: 8, later: 8 });
  });
  it('a request that exactly fills capacity fits', () => {
    expect(ids(plan(items, ICE, 4).lanes.now)).toEqual(['a']);
  });
  it('reports the cut-off score and rank of the last Now item', () => {
    const p = plan(items, ICE, 8);
    expect(p.cutoffScore).toBe(2);
    expect(p.cutRank).toBe(2);
  });
  it('moves the cut line when capacity changes', () => {
    const small = plan(items, ICE, 4);
    const big = plan(items, ICE, 16);
    expect(small.cutRank).toBe(1);
    expect(big.cutRank).toBe(4);
    expect(big.cutoffScore).toBeLessThan(small.cutoffScore as number);
  });
  it('0 weeks of capacity commits nothing', () => {
    const p = plan(items, ICE, 0);
    expect(p.lanes.now).toHaveLength(0);
    expect(p.cutoffScore).toBeNull();
    expect(p.cutRank).toBe(0);
    expect(p.lanes.later).toHaveLength(items.length);
  });
  it('huge capacity puts everything in Now', () => {
    const p = plan(items, ICE, 1000);
    expect(p.lanes.now).toHaveLength(items.length);
    expect(p.lanes.next).toHaveLength(0);
  });
  it('treats negative and NaN capacity as 0', () => {
    expect(plan(items, ICE, -5).lanes.now).toHaveLength(0);
    expect(plan(items, ICE, NaN).lanes.now).toHaveLength(0);
  });
  it('a request bigger than one window goes to Later with a reason and does not block others', () => {
    const p = plan([req('whale', { impact: 10, effort: 20 }), req('x', { impact: 3 })], ICE, 12);
    expect(ids(p.lanes.now)).toEqual(['x']);
    expect(p.lanes.later[0]?.blockedReason).toMatch(/more than one 12-week window/);
  });
  it('stops at the first request that does not fit so the cut line is a clean prefix', () => {
    const p = plan(
      [
        req('a', { impact: 9, effort: 6 }),
        req('b', { impact: 8, effort: 6 }),
        req('c', { impact: 1, effort: 1 }),
      ],
      ICE,
      8,
    );
    expect(ids(p.lanes.now)).toEqual(['a']);
    expect(ids(p.lanes.next)).toEqual(['b', 'c']);
  });
  it('lists invalid requests as excluded instead of placing them', () => {
    const p = plan([req('ok'), req('bad', { effort: 0 })], ICE, 12);
    expect(p.excluded.map((r) => r.id)).toEqual(['bad']);
    expect(p.placed).toHaveLength(1);
  });
});

describe('dependencies', () => {
  it('pushes a request down one lane when its dependency is in a later lane', () => {
    const p = plan(
      [
        req('feature', { impact: 9, effort: 2, dependsOn: ['base'] }),
        req('base', { impact: 3, effort: 6 }),
        req('filler', { impact: 5, effort: 6 }),
      ],
      ICE,
      8,
    );
    // Scores: feature 4.5, filler 0.83, base 0.5. Capacity 8: feature + (filler no) -> Now: feature, Next: filler, base.
    const feature = p.placed.find((x) => x.request.id === 'feature');
    expect(feature?.lane).toBe('next');
    expect(feature?.blockedReason).toBe('blocked by base (Next)');
  });
  it('leaves a request alone when its dependency is in the same or an earlier lane', () => {
    const p = plan(
      [
        req('base', { impact: 9, effort: 2 }),
        req('feature', { impact: 5, effort: 2, dependsOn: ['base'] }),
      ],
      ICE,
      12,
    );
    expect(ids(p.lanes.now)).toEqual(['base', 'feature']);
    expect(p.lanes.now.every((x) => x.blockedReason === undefined)).toBe(true);
  });
  it('pushes down more than one lane when the dependency is in Later', () => {
    const p = plan(
      [
        req('feature', { impact: 9, effort: 1, dependsOn: ['base'] }),
        req('a', { impact: 8, effort: 4 }),
        req('b', { impact: 7, effort: 4 }),
        req('base', { impact: 1, effort: 4 }),
      ],
      ICE,
      4,
    );
    expect(p.placed.find((x) => x.request.id === 'base')?.lane).toBe('later');
    expect(p.placed.find((x) => x.request.id === 'feature')?.lane).toBe('later');
  });
  it('passes the delay along a chain', () => {
    const p = plan(
      [
        req('c', { impact: 9, effort: 1, dependsOn: ['b'] }),
        req('b', { impact: 8, effort: 1, dependsOn: ['a'] }),
        req('a', { impact: 1, effort: 1 }),
        req('pad', { impact: 5, effort: 1 }),
      ],
      ICE,
      2,
    );
    const lane = (id: string) => p.placed.find((x) => x.request.id === id)?.lane;
    expect(lane('a')).toBe('next');
    expect(lane('b')).toBe('next');
    expect(lane('c')).toBe('next');
  });
  it('treats a dependency on an invalid request as never arriving', () => {
    const p = plan([req('a', { dependsOn: ['bad'] }), req('bad', { effort: 0 })], ICE, 12);
    expect(p.placed[0]?.lane).toBe('later');
    expect(p.placed[0]?.blockedReason).toBe('blocked by bad (needs a valid estimate)');
  });
  it('ignores a dependency on a request that does not exist', () => {
    const p = plan([req('a', { dependsOn: ['ghost'] })], ICE, 12);
    expect(p.placed[0]?.lane).toBe('now');
  });
});

describe('dependency cycles', () => {
  it('detects a two-request cycle', () => {
    const cycles = findCycles([req('a', { dependsOn: ['b'] }), req('b', { dependsOn: ['a'] })]);
    expect(cycles).toHaveLength(1);
    expect([...(cycles[0] ?? [])].sort()).toEqual(['a', 'b']);
  });
  it('detects a self-dependency and a longer cycle', () => {
    expect(findCycles([req('a', { dependsOn: ['a'] })])).toEqual([['a']]);
    const long = findCycles([
      req('a', { dependsOn: ['b'] }),
      req('b', { dependsOn: ['c'] }),
      req('c', { dependsOn: ['a'] }),
    ]);
    expect(long).toHaveLength(1);
    expect(long[0]).toHaveLength(3);
  });
  it('finds no cycle in a plain chain or a diamond', () => {
    expect(
      findCycles([
        req('a', { dependsOn: ['b', 'c'] }),
        req('b', { dependsOn: ['d'] }),
        req('c', { dependsOn: ['d'] }),
        req('d'),
      ]),
    ).toEqual([]);
  });
  it('reports a cycle message and puts cycle members in Later with a reason', () => {
    const items = [
      req('a', { impact: 9, dependsOn: ['b'] }),
      req('b', { impact: 9, dependsOn: ['a'] }),
      req('ok', { impact: 2 }),
    ];
    expect(
      validate(items).some((i) => i.code === 'cycle' && /a → b → a|b → a → b/.test(i.message)),
    ).toBe(true);
    const p = plan(items, ICE, 12);
    expect(ids(p.lanes.now)).toEqual(['ok']);
    expect(
      p.lanes.later.map((x) => x.blockedReason).every((r) => /dependency cycle/.test(r ?? '')),
    ).toBe(true);
  });
  it('pushes a request that depends on a cycle member to Later', () => {
    const p = plan(
      [
        req('a', { dependsOn: ['b'] }),
        req('b', { dependsOn: ['a'] }),
        req('c', { impact: 9, dependsOn: ['a'] }),
      ],
      ICE,
      12,
    );
    expect(p.placed.find((x) => x.request.id === 'c')?.lane).toBe('later');
  });
});

describe('sensitivity', () => {
  const items = [
    req('sure', { impact: 6, confidence: 0.9, effort: 2 }),
    req('edge', { impact: 8, confidence: 0.6, effort: 2 }),
    req('maybe', { impact: 7, confidence: 0.5, effort: 2 }),
  ];
  it('reports no changes when nothing crosses the line', () => {
    const s = sensitivity([req('a'), req('b', { impact: 1 })], ICE, 100);
    expect(s.cases.every((c) => c.enteredNow.length === 0 && c.leftNow.length === 0)).toBe(true);
  });
  it('reports requests that enter or leave Now and counts rank changes', () => {
    const s = sensitivity(items, ICE, 4);
    const [minus, plus] = s.cases;
    expect(minus?.delta).toBeCloseTo(-0.2);
    expect(plus?.delta).toBeCloseTo(0.2);
    // Base scores: sure 2.7, edge 2.4, maybe 1.75. Now holds sure + edge.
    // +0.2: maybe 2.1 stays below edge 2.8 and sure 3.0 (confidence clamped to 1). No crossing.
    expect(plus?.enteredNow).toEqual([]);
    // -0.2: sure 2.1, edge 1.6, maybe 1.05 -> same order, no crossing.
    expect(minus?.leftNow).toEqual([]);
  });
  it('detects a crossing when two requests are close', () => {
    const close = [
      req('a', { impact: 6, confidence: 0.8, effort: 2 }),
      req('b', { impact: 10, confidence: 0.3, effort: 2 }),
    ];
    // Base: a 2.4, b 1.5. Capacity 2 -> Now: a. With +0.2: a 3.0, b 2.5. With -0.2: a 1.8, b 0.5.
    const s = sensitivity(close, ICE, 2);
    expect(s.cases.every((c) => c.enteredNow.length === 0)).toBe(true);
    const swap = [
      req('a', { impact: 6, confidence: 0.5, effort: 2 }),
      req('b', { impact: 9, confidence: 0.3, effort: 2 }),
    ];
    // Base: a 1.5, b 1.35. +0.2: a 2.1, b 2.25 -> b overtakes a.
    const s2 = sensitivity(swap, ICE, 2);
    const plus = s2.cases[1];
    expect(plus?.enteredNow.map((r) => r.id)).toEqual(['b']);
    expect(plus?.leftNow.map((r) => r.id)).toEqual(['a']);
    expect(plus?.rankChanges).toBe(2);
  });
  it('clamps shifted confidence to 0 to 1', () => {
    const s = sensitivity([req('a', { confidence: 1 }), req('b', { confidence: 0 })], ICE, 100);
    expect(s.cases).toHaveLength(2);
  });
  it('flags presets that ignore confidence, and finds no change for them', () => {
    const s = sensitivity(items, 'impact-effort', 4);
    expect(s.usesConfidence).toBe(false);
    expect(s.cases.every((c) => c.rankChanges === 0 && c.enteredNow.length === 0)).toBe(true);
  });
});
