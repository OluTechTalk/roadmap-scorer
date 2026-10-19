// Pure scoring functions. No DOM, no storage, no network.

export interface Request {
  id: string;
  name: string;
  requester: string;
  /** Unlabelled 1 to 10 scale. */
  impact: number;
  /** 0 to 1. */
  confidence: number;
  /** Engineering weeks, must be above 0. */
  effort: number;
  /** Ids of requests that must land in the same or an earlier lane. */
  dependsOn: string[];
}

export type PresetId = 'impact-confidence-effort' | 'impact-effort' | 'impact-confidence';

export interface Preset {
  id: PresetId;
  label: string;
  /** Shown on screen next to the preset switcher. */
  formula: string;
  usesConfidence: boolean;
  compute: (r: Request) => number;
}

export const PRESETS: readonly Preset[] = [
  {
    id: 'impact-confidence-effort',
    label: 'Impact × confidence ÷ effort',
    formula: 'score = impact × confidence ÷ effort (weeks)',
    usesConfidence: true,
    compute: (r) => (r.impact * r.confidence) / r.effort,
  },
  {
    id: 'impact-effort',
    label: 'Impact ÷ effort',
    formula: 'score = impact ÷ effort (weeks)',
    usesConfidence: false,
    compute: (r) => r.impact / r.effort,
  },
  {
    id: 'impact-confidence',
    label: 'Impact × confidence',
    formula: 'score = impact × confidence',
    usesConfidence: true,
    compute: (r) => r.impact * r.confidence,
  },
];

export const DEFAULT_PRESET: PresetId = 'impact-confidence-effort';

export function getPreset(id: PresetId): Preset {
  return PRESETS.find((p) => p.id === id) ?? (PRESETS[0] as Preset);
}

export const DEFAULT_CAPACITY = 12;
export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 40;
export const CONFIDENCE_STEP = 0.2;

export type IssueCode =
  'effort' | 'impact' | 'confidence' | 'duplicate-id' | 'unknown-dependency' | 'cycle';

export interface Issue {
  code: IssueCode;
  /** Request the issue is about, when there is one. */
  id?: string;
  /** Error: the request is left out of the ranking. Warning: it is still ranked. */
  severity: 'error' | 'warning';
  message: string;
}

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Field-level problems that make a request impossible to score. */
export function validateRequest(r: Request): Issue[] {
  const issues: Issue[] = [];
  const label = r.name.trim() || r.id;
  if (!isNum(r.effort) || r.effort <= 0) {
    issues.push({
      code: 'effort',
      id: r.id,
      severity: 'error',
      message: `"${label}" needs effort above 0 weeks, so it is left out of the ranking.`,
    });
  }
  if (!isNum(r.impact) || r.impact < 1 || r.impact > 10) {
    issues.push({
      code: 'impact',
      id: r.id,
      severity: 'error',
      message: `"${label}" needs impact between 1 and 10, so it is left out of the ranking.`,
    });
  }
  if (!isNum(r.confidence) || r.confidence < 0 || r.confidence > 1) {
    issues.push({
      code: 'confidence',
      id: r.id,
      severity: 'error',
      message: `"${label}" needs confidence between 0 and 1, so it is left out of the ranking.`,
    });
  }
  return issues;
}

/**
 * Dependency cycles, each as an ordered list of ids (the first id is not repeated at the end).
 * A request that depends on itself is a cycle of one. Unknown ids are ignored.
 */
export function findCycles(requests: readonly Request[]): string[][] {
  const byId = new Map(requests.map((r) => [r.id, r]));
  const state = new Map<string, 'open' | 'done'>();
  const stack: string[] = [];
  const cycles: string[][] = [];
  const seen = new Set<string>();

  const visit = (id: string): void => {
    state.set(id, 'open');
    stack.push(id);
    for (const dep of byId.get(id)?.dependsOn ?? []) {
      if (!byId.has(dep)) continue;
      const s = state.get(dep);
      if (s === 'open') {
        const cycle = stack.slice(stack.indexOf(dep));
        const key = [...cycle].sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(cycle);
        }
      } else if (s === undefined) {
        visit(dep);
      }
    }
    stack.pop();
    state.set(id, 'done');
  };

  for (const r of requests) if (!state.has(r.id)) visit(r.id);
  return cycles;
}

/** Every problem in a list of requests: field errors, duplicates, unknown dependencies, cycles. */
export function validate(requests: readonly Request[]): Issue[] {
  const issues: Issue[] = [];
  const ids = new Set<string>();
  const nameOf = new Map(requests.map((r) => [r.id, r.name.trim() || r.id]));
  for (const r of requests) {
    if (ids.has(r.id)) {
      issues.push({
        code: 'duplicate-id',
        id: r.id,
        severity: 'error',
        message: `Two requests share the id "${r.id}".`,
      });
    }
    ids.add(r.id);
    issues.push(...validateRequest(r));
  }
  for (const r of requests) {
    for (const dep of r.dependsOn) {
      if (!ids.has(dep)) {
        issues.push({
          code: 'unknown-dependency',
          id: r.id,
          severity: 'warning',
          message: `"${nameOf.get(r.id)}" depends on a request that no longer exists, so that dependency is ignored.`,
        });
      }
    }
  }
  for (const cycle of findCycles(requests)) {
    const names = cycle.map((id) => nameOf.get(id) ?? id);
    const path =
      cycle.length === 1 ? `${names[0]} depends on itself` : [...names, names[0]].join(' → ');
    issues.push({
      code: 'cycle',
      id: cycle[0],
      severity: 'warning',
      message: `Dependency cycle: ${path}. These requests cannot be scheduled until the cycle is broken, so they sit in Later.`,
    });
  }
  return issues;
}

/** Scores are rounded so that floating-point noise never decides a tie. */
const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

/** Score of one request, or null if it has a field error. */
export function scoreRequest(r: Request, preset: PresetId): number | null {
  if (validateRequest(r).length > 0) return null;
  return round6(getPreset(preset).compute(r));
}

export interface Ranked {
  request: Request;
  score: number;
  /** 1-based position in the ranking. */
  rank: number;
}

/**
 * Highest score first. Ties break by lower effort, then by name, then by id, so the order is stable.
 * Requests with field errors are left out.
 */
export function rank(requests: readonly Request[], preset: PresetId): Ranked[] {
  const scored: Omit<Ranked, 'rank'>[] = [];
  for (const request of requests) {
    const score = scoreRequest(request, preset);
    if (score !== null) scored.push({ request, score });
  }
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.request.effort - b.request.effort ||
      a.request.name.localeCompare(b.request.name) ||
      a.request.id.localeCompare(b.request.id),
  );
  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}

export type Lane = 'now' | 'next' | 'later';
export const LANES: readonly Lane[] = ['now', 'next', 'later'];
export const LANE_LABEL: Record<Lane, string> = { now: 'Now', next: 'Next', later: 'Later' };
const laneOrder = (l: Lane): number => LANES.indexOf(l);

export interface Placed extends Ranked {
  lane: Lane;
  /** Why the request is not where its score alone would put it, if it is not. */
  blockedReason?: string;
}

export interface Plan {
  capacity: number;
  placed: Placed[];
  lanes: Record<Lane, Placed[]>;
  /** Engineering weeks committed in each lane. Next can exceed capacity when items are pushed into it. */
  used: Record<Lane, number>;
  /** Score of the lowest-scoring request in Now, or null when Now is empty. */
  cutoffScore: number | null;
  /** Number of ranked positions at or above the cut line (rank of the last Now item, or 0). */
  cutRank: number;
  /** Requests left out because of field errors. */
  excluded: Request[];
}

/**
 * Fill a lane with the highest-ranked candidates that fit, stopping at the first one that does not,
 * so everything above the cut line outranks everything below it.
 */
function takeWindow(candidates: Ranked[], capacity: number): { taken: Ranked[]; rest: Ranked[] } {
  let total = 0;
  let n = 0;
  for (const c of candidates) {
    if (total + c.request.effort > capacity + 1e-9) break;
    total += c.request.effort;
    n += 1;
  }
  return { taken: candidates.slice(0, n), rest: candidates.slice(n) };
}

export function plan(
  requests: readonly Request[],
  presetId: PresetId,
  capacityWeeks: number,
): Plan {
  const capacity = isNum(capacityWeeks) ? Math.max(0, capacityWeeks) : 0;
  const ranked = rank(requests, presetId);
  const rankedIds = new Set(ranked.map((r) => r.request.id));
  const excluded = requests.filter((r) => !rankedIds.has(r.id));
  const nameOf = new Map(requests.map((r) => [r.id, r.name.trim() || r.id]));

  const cycleOf = new Map<string, string[]>();
  for (const cycle of findCycles(requests)) for (const id of cycle) cycleOf.set(id, cycle);

  // Requests that can never be placed by capacity alone go straight to Later and do not use up a window.
  const forcedLater = new Map<string, string>();
  const candidates: Ranked[] = [];
  for (const r of ranked) {
    const cycle = cycleOf.get(r.request.id);
    if (cycle) {
      const names = cycle.map((id) => nameOf.get(id) ?? id);
      forcedLater.set(
        r.request.id,
        cycle.length === 1
          ? 'depends on itself'
          : `in a dependency cycle: ${[...names, names[0]].join(' → ')}`,
      );
    } else if (r.request.effort > capacity + 1e-9) {
      forcedLater.set(
        r.request.id,
        `needs ${r.request.effort} weeks, more than one ${capacity}-week window`,
      );
    } else {
      candidates.push(r);
    }
  }

  const lane = new Map<string, Lane>();
  const now = takeWindow(candidates, capacity);
  const next = takeWindow(now.rest, capacity);
  for (const r of now.taken) lane.set(r.request.id, 'now');
  for (const r of next.taken) lane.set(r.request.id, 'next');
  for (const r of ranked) if (!lane.has(r.request.id)) lane.set(r.request.id, 'later');
  const natural = new Map(lane);

  // A request cannot sit ahead of its dependencies: push it down one lane at a time until it does not.
  // A dependency that was left out of the ranking counts as never arriving.
  const known = new Set(requests.map((r) => r.id));
  const laneOfDep = (id: string): number => {
    const l = lane.get(id);
    return l ? laneOrder(l) : LANES.length;
  };
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of ranked) {
      const current = lane.get(r.request.id) as Lane;
      if (current === 'later') continue;
      const blocked = r.request.dependsOn.some(
        (d) => known.has(d) && laneOfDep(d) > laneOrder(current),
      );
      if (blocked) {
        lane.set(r.request.id, LANES[laneOrder(current) + 1] as Lane);
        changed = true;
      }
    }
  }

  const placed: Placed[] = ranked.map((r) => {
    const final = lane.get(r.request.id) as Lane;
    const base = natural.get(r.request.id) as Lane;
    let blockedReason: string | undefined = forcedLater.get(r.request.id);
    if (!blockedReason && final !== base) {
      const blockers = r.request.dependsOn
        .filter((d) => known.has(d) && laneOfDep(d) > laneOrder(base))
        .map((d) => {
          const l = lane.get(d);
          return `${nameOf.get(d)} (${l ? LANE_LABEL[l] : 'needs a valid estimate'})`;
        });
      blockedReason = `blocked by ${blockers.join(', ')}`;
    }
    return { ...r, lane: final, ...(blockedReason ? { blockedReason } : {}) };
  });

  const lanes: Record<Lane, Placed[]> = { now: [], next: [], later: [] };
  const used: Record<Lane, number> = { now: 0, next: 0, later: 0 };
  for (const p of placed) {
    lanes[p.lane].push(p);
    used[p.lane] += p.request.effort;
  }
  for (const l of LANES) used[l] = Math.round(used[l] * 1e6) / 1e6;

  const lastNow = lanes.now[lanes.now.length - 1];
  return {
    capacity,
    placed,
    lanes,
    used,
    cutoffScore: lastNow ? lastNow.score : null,
    cutRank: lastNow ? lastNow.rank : 0,
    excluded,
  };
}

export interface SensitivityCase {
  /** Change applied to every confidence, before clamping to 0 to 1. */
  delta: number;
  enteredNow: Request[];
  leftNow: Request[];
  /** Requests whose rank position differs from the base ranking. */
  rankChanges: number;
}

export interface Sensitivity {
  /** False when the preset ignores confidence, so no change is possible. */
  usesConfidence: boolean;
  cases: SensitivityCase[];
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** Shift every confidence by minus and plus `step`, then report what crosses the Now cut line. */
export function sensitivity(
  requests: readonly Request[],
  presetId: PresetId,
  capacityWeeks: number,
  step: number = CONFIDENCE_STEP,
): Sensitivity {
  const base = plan(requests, presetId, capacityWeeks);
  const basePos = new Map(base.placed.map((p) => [p.request.id, p.rank]));
  const baseNow = new Set(base.lanes.now.map((p) => p.request.id));

  const cases = [-step, step].map((delta): SensitivityCase => {
    const shifted = requests.map((r) =>
      isNum(r.confidence) ? { ...r, confidence: clamp01(r.confidence + delta) } : r,
    );
    const alt = plan(shifted, presetId, capacityWeeks);
    const altNow = new Set(alt.lanes.now.map((p) => p.request.id));
    const original = new Map(requests.map((r) => [r.id, r]));
    const pick = (ids: Iterable<string>): Request[] =>
      [...ids].map((id) => original.get(id)).filter((r): r is Request => r !== undefined);
    return {
      delta,
      enteredNow: pick([...altNow].filter((id) => !baseNow.has(id))),
      leftNow: pick([...baseNow].filter((id) => !altNow.has(id))),
      rankChanges: alt.placed.filter((p) => basePos.get(p.request.id) !== p.rank).length,
    };
  });

  return { usesConfidence: getPreset(presetId).usesConfidence, cases };
}
