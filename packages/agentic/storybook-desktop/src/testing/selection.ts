import { createHash } from 'node:crypto';
import path from 'node:path';

import type { DesktopStoryManifest, DesktopStoryManifestEntry } from '@fluentui-react-native/desktop-driver';
import { decideDesktopCase, resolveDesktopScopeDomains } from '@fluentui-react-native/desktop-driver/authoring';
import type {
  DesktopCaseTarget,
  DesktopDeclaredGap,
  DesktopScopeDomains,
  DesktopScopeValues,
  ResolvedDesktopCaseOptions,
} from '@fluentui-react-native/desktop-driver/authoring';
import type { SelectionExclusions } from '@fluentui-react-native/desktop-test/reporting';

import type { Platforms } from '../config/platforms.js';
import type { DesktopStorybookWdioOptions } from '../config/wdio.js';

export type WdioSelectionContext = {
  platform: Platforms;
  /** The domains and the values this target holds. Without it only the built-in domains exist and no key is supplied. */
  scope?: { domains: DesktopScopeDomains; values: DesktopScopeValues };
  /** Clock for quarantine expiry. */
  now?: number;
};

export type WdioDeclaredGap = DesktopDeclaredGap;

/** One declared case that matched the user's filters. A case with no `excluded` reason is part of the run. */
export type WdioCaseDecision = {
  storyId: string;
  name: string;
  descriptor: ResolvedDesktopCaseOptions;
  /** The first reason, in platform, scope, input order, that this target or lane does not run the case. */
  excluded?: keyof SelectionExclusions;
  /** Declared `unsupported` or quarantine; the case is selected but not executed. */
  gap?: WdioDeclaredGap;
};

export type WdioSelection = {
  /** Stories with at least one selected case, or a legacy callback that compatibility mode may run. */
  stories: readonly DesktopStoryManifestEntry[];
  /** Every declared case that matched the user's filters, in story and source order. */
  decisions: readonly WdioCaseDecision[];
  /** The selected declared cases by story and name. Legacy callbacks are absent. */
  selected: ReadonlyMap<string, ReadonlyMap<string, WdioCaseDecision>>;
  /** Only cases that matched the user's filters count, so a narrow `--story` is not blamed for what it never asked for. */
  excluded: SelectionExclusions;
};

/**
 * Decides every case before any session exists. Legacy callbacks run in compatibility mode and are an error in a lane,
 * where each is listed so they can be migrated in one pass. Declared gaps are resolved here too, so an expired
 * quarantine stops the run before anything executes.
 */
export function decideWdioSelection(
  manifest: DesktopStoryManifest,
  options: DesktopStorybookWdioOptions,
  context: WdioSelectionContext,
): WdioSelection {
  const domains = context.scope?.domains ?? resolveDesktopScopeDomains();
  const target: DesktopCaseTarget = {
    endpoint: context.platform,
    ...(options.input ? { lane: options.input } : {}),
    domains,
    values: context.scope?.values ?? {},
    now: context.now,
  };
  const stories: DesktopStoryManifestEntry[] = [];
  const decisions: WdioCaseDecision[] = [];
  const selected = new Map<string, Map<string, WdioCaseDecision>>();
  const excluded: SelectionExclusions = { platform: 0, scope: 0, input: 0 };
  const legacy: string[] = [];
  const entries = manifest.entries
    .filter((entry) => entry.wdio && (!options.story || path.matchesGlob(entry.id, options.story)))
    .filter((entry) => !options.tag || entry.tags.includes(options.tag))
    .sort((left, right) => left.id.localeCompare(right.id));
  for (const entry of entries) {
    const cases = entry.wdio!.cases;
    if (!cases?.length) {
      if (!(entry.wdio!.testNames ?? ['default']).some((name) => matchesWdioTest(name, options.test))) continue;
      if (options.input) legacy.push(entry.id);
      else stories.push(entry);
      continue;
    }
    const chosen = new Map<string, WdioCaseDecision>();
    for (const { name, options: descriptor } of cases) {
      if (!matchesWdioTest(name, options.test)) continue;
      const outcome = decideDesktopCase(descriptor, target, `${entry.id} / ${name}`);
      const decision: WdioCaseDecision = { storyId: entry.id, name, descriptor };
      if (outcome.kind === 'excluded') {
        decision.excluded = outcome.reason;
        excluded[outcome.reason]++;
      } else {
        if (outcome.kind === 'gap') decision.gap = outcome.gap;
        chosen.set(name, decision);
      }
      decisions.push(decision);
    }
    if (chosen.size) {
      stories.push(entry);
      selected.set(entry.id, chosen);
    }
  }
  if (legacy.length) {
    const shown = legacy.slice(0, 10).join(', ');
    const more = legacy.length > 10 ? `, and ${legacy.length - 10} more` : '';
    throw new Error(`Input lane "${options.input}" cannot run legacy wdio callbacks; declare them with desktopIt: ${shown}${more}.`);
  }
  return { stories, decisions, selected, excluded };
}

/** The work a selection announces before launch, so work that never starts is still accounted for. */
export function plannedWdioWork(
  selection: WdioSelection,
  options: Pick<DesktopStorybookWdioOptions, 'test'>,
): readonly { workId: string; label: string }[] {
  return selection.stories.flatMap((entry) => {
    const declared = selection.selected.get(entry.id);
    const names = declared
      ? [...declared.keys()]
      : (entry.wdio?.testNames ?? ['default']).filter((name) => matchesWdioTest(name, options.test));
    return names.map((name) => ({ workId: csfTestId(entry.id, name), label: `${entry.id} / ${name}` }));
  });
}

/** One declared case in a `--list` result. */
export type WdioListedCase = Pick<ResolvedDesktopCaseOptions, 'input' | 'inputSource' | 'platforms' | 'scope'> & {
  name: string;
  requires: NonNullable<ResolvedDesktopCaseOptions['requires']>;
  /** Selected but not executed: a declared `unsupported` entry or an active quarantine. */
  gap?: WdioDeclaredGap;
};

export type WdioListedStory = {
  id: string;
  sourcePath: string;
  /** The names of a legacy callback, or the declared cases this target and lane run. */
  tests?: readonly string[] | readonly WdioListedCase[];
  /** Declared cases that matched the filters but do not run, each with the first reason it was excluded. */
  excluded?: readonly (WdioListedCase & { reason: keyof SelectionExclusions })[];
};

/** What a selection would run, and why each other declared case that matched the filters would not. */
export function listWdioSelection(selection: WdioSelection, options: Pick<DesktopStorybookWdioOptions, 'test'>): WdioListedStory[] {
  const decided = new Map<string, WdioCaseDecision[]>();
  for (const decision of selection.decisions) {
    const story = decided.get(decision.storyId);
    if (story) story.push(decision);
    else decided.set(decision.storyId, [decision]);
  }
  return selection.stories.map(({ id, sourcePath, wdio }) => {
    const decisions = decided.get(id);
    if (!selection.selected.has(id)) {
      const names = wdio?.testNames?.filter((name) => matchesWdioTest(name, options.test));
      return { id, sourcePath, ...(names ? { tests: names } : {}) };
    }
    const excluded = decisions!.flatMap((decision) => (decision.excluded ? [{ ...listedCase(decision), reason: decision.excluded }] : []));
    return {
      id,
      sourcePath,
      tests: decisions!.filter(({ excluded }) => !excluded).map(listedCase),
      ...(excluded.length ? { excluded } : {}),
    };
  });
}

/** Names what a selection left out, so an empty selection explains itself. Empty when nothing was excluded. */
export function describeWdioExclusions({ excluded }: Pick<WdioSelection, 'excluded'>): string {
  const { platform, scope, input } = excluded;
  return platform + scope + input > 0 ? ` (excluded ${platform} by platform, ${scope} by scope, ${input} by input)` : '';
}

export function matchesWdioTest(name: string, pattern?: string): boolean {
  return pattern === undefined || path.matchesGlob(name, pattern);
}

export function csfTestId(storyId: string, testName?: string): string {
  return `csf-${createHash('sha256')
    .update(JSON.stringify([storyId, testName ?? 'default']))
    .digest('hex')}`;
}

function listedCase({ name, descriptor, gap }: WdioCaseDecision): WdioListedCase {
  const { input, inputSource, platforms, scope, requires = [] } = descriptor;
  return {
    name,
    input,
    inputSource,
    requires,
    ...(platforms ? { platforms } : {}),
    ...(scope ? { scope } : {}),
    ...(gap ? { gap } : {}),
  };
}
