import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import { describeDesktopUnsupported } from '@fluentui-react-native/desktop-test/reporting';

export type WdioCaseOutcome = {
  storyId: string;
  testName?: string;
  status: 'passed' | 'failed' | 'skipped' | 'unsupported';
  gap?: 'unsupported' | 'quarantine';
};

export type WdioCohortVerdict = {
  /** At least one selected case ran to a pass or a failure. */
  executed: boolean;
  incomplete: boolean;
  /** Why the cohort is incomplete. */
  message?: string;
};

export function hasExecutedWdioCase(results: readonly Pick<WdioCaseOutcome, 'status'>[]): boolean {
  return results.some(({ status }) => status === 'passed' || status === 'failed');
}

/** Counts for a summary line. The unsupported breakdown appears only when something is unsupported, so other summaries are unchanged. */
export function describeWdioCounts(results: readonly { status: string; gap?: WdioCaseOutcome['gap'] }[]): string {
  const count = (status: string) => results.filter((result) => result.status === status).length;
  const parts = [`${count('passed')} passed`, `${count('skipped')} skipped`];
  const unsupported = results.filter(({ status }) => status === 'unsupported');
  if (unsupported.length) {
    parts.push(
      describeDesktopUnsupported({
        unsupported: unsupported.length,
        declaredUnsupported: unsupported.filter(({ gap }) => gap === 'unsupported').length,
        quarantined: unsupported.filter(({ gap }) => gap === 'quarantine').length,
      }),
    );
  }
  return parts.join(', ');
}

/**
 * A cohort is incomplete when selected work did not finish, or when nothing executed and it is not `optional`. In an
 * input lane a run-time skip, or an `unsupported` result with no declared gap, is also incomplete, and `optional` never
 * masks it: only a declaration may excuse a case the lane selected. A cohort that is all declared gaps is the caller's
 * to judge, because a smoke run executes one story at a time and so cannot require every story to run something.
 */
export function assessWdioCohort(options: {
  results: readonly WdioCaseOutcome[];
  selected: number;
  lane?: DesktopInputLane;
  optional?: boolean;
}): WdioCohortVerdict {
  const { results, selected, lane, optional } = options;
  const executed = hasExecutedWdioCase(results);
  const undeclared = lane
    ? results.filter(({ status, gap }) => status === 'skipped' || (status === 'unsupported' && gap === undefined))
    : [];
  const reasons: string[] = [];
  if (results.length !== selected) reasons.push(`${selected - results.length} of ${selected} selected tests did not finish`);
  if (undeclared.length) {
    const names = undeclared.slice(0, 5).map(({ storyId, testName }) => (testName === undefined ? storyId : `${storyId} / ${testName}`));
    const more = undeclared.length > names.length ? `, and ${undeclared.length - names.length} more` : '';
    reasons.push(
      `the ${lane} lane could not run ${undeclared.length} selected tests that have no declared gap (${names.join(', ')}${more})`,
    );
  }
  if (!executed && !optional) reasons.push('no selected test executed');
  return {
    executed,
    incomplete: reasons.length > 0,
    ...(reasons.length ? { message: `Required executable story cohort is incomplete: ${reasons.join('; ')}.` } : {}),
  };
}
