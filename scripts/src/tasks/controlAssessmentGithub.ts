import { readFileSync } from 'node:fs';

import { hex, object, text } from './controlAssessment.ts';
import {
  assessmentArtifactName,
  assessmentSummaryPath,
  assessmentWorkflowPath,
  assertFresh,
  assertTestedInputs,
  ensureCommit,
  formatCiSummary,
  formatCiSpec,
  git,
  gitFile,
  inputDigest,
  isReportOnlyUpdate,
  parseBundle,
  parseReportReference,
} from './controlAssessmentCi.ts';
import type { CiBundle, CiIdentity, ReportReference } from './controlAssessmentCi.ts';
import { assessmentSpecPath } from './controlAssessmentSpec.ts';

type Run = {
  id: number;
  run_attempt: number;
  event: string;
  status: string;
  path: string;
  head_sha: string;
  head_branch: string;
  head_repository: { full_name: string } | null;
};
type PullRequest = {
  number: number;
  state: string;
  base: { sha: string; ref: string; repo: { full_name: string } };
  head: { sha: string; ref: string; repo: { full_name: string } | null };
  merge_commit_sha: string | null;
};
type Jobs = { jobs: { name: string; conclusion: string | null }[]; total_count: number };
type Artifacts = { artifacts: { name: string; expired: boolean }[]; total_count: number };
type GitHubOptions = { token: string; fetchImplementation?: typeof fetch };

export class AssessmentGitHub {
  private readonly token: string;
  private readonly fetchImplementation: typeof fetch;

  constructor({ token, fetchImplementation = fetch }: GitHubOptions) {
    this.token = text(token, 'GitHub token');
    this.fetchImplementation = fetchImplementation;
  }

  async request<T>(route: string, options: RequestInit = {}): Promise<T> {
    if (!route.startsWith('/repos/') && route !== '/graphql') throw new Error('Unexpected assessment API route.');
    const response = await this.fetchImplementation(`https://api.github.com${route}`, {
      ...options,
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!response.ok) throw new Error(`Assessment GitHub API request failed (${response.status}): ${route}.`);
    return (await response.json()) as T;
  }

  async sourceRun(identity: CiIdentity): Promise<Run> {
    const run = await this.request<Run>(`/repos/${identity.repository}/actions/runs/${identity.runId}/attempts/${identity.runAttempt}`);
    if (
      String(run.id) !== identity.runId ||
      run.run_attempt !== identity.runAttempt ||
      run.event !== 'pull_request' ||
      run.status !== 'completed' ||
      run.path !== assessmentWorkflowPath ||
      run.head_sha !== identity.headCommit ||
      run.head_branch !== identity.headRef ||
      run.head_repository?.full_name !== identity.headRepository
    ) {
      throw new Error('Assessment evidence does not match the completed source PR workflow attempt.');
    }
    return run;
  }

  async sourceValidation(identity: CiIdentity): Promise<'success' | 'failure'> {
    const matches: Jobs['jobs'] = [];
    for (let page = 1; page <= 20; page++) {
      const data = await this.request<Jobs>(
        `/repos/${identity.repository}/actions/runs/${identity.runId}/attempts/${identity.runAttempt}/jobs?per_page=100&page=${page}`,
      );
      matches.push(...data.jobs.filter((job) => job.name === 'PR source validation'));
      if (page * 100 >= data.total_count) {
        if (matches.length !== 1) throw new Error('Source workflow must have exactly one PR source validation job.');
        return matches[0].conclusion === 'success' ? 'success' : 'failure';
      }
    }
    throw new Error('Source workflow job list exceeds the supported limit.');
  }

  async hasArtifact(repository: string, runId: string, runAttempt: number): Promise<boolean> {
    const name = `${assessmentArtifactName}-${runAttempt}`;
    let matches = 0;
    for (let page = 1; page <= 20; page++) {
      const data = await this.request<Artifacts>(`/repos/${repository}/actions/runs/${runId}/artifacts?per_page=100&page=${page}`);
      matches += data.artifacts.filter((artifact) => artifact.name === name && !artifact.expired).length;
      if (page * 100 >= data.total_count) {
        if (matches > 1) throw new Error('Source workflow has ambiguous assessment artifacts.');
        return matches === 1;
      }
    }
    throw new Error('Source workflow artifact list exceeds the supported limit.');
  }
}

export type Candidate =
  | { reportOnly: false; reason: string }
  | { reportOnly: true; reference: ReportReference; summary: string; spec: string; sourceResult: 'success' | 'failure' };

export async function inspectReportUpdate(
  root: string,
  env: NodeJS.ProcessEnv,
  github: AssessmentGitHub,
  now = new Date(),
): Promise<Candidate> {
  const event = object(JSON.parse(readFileSync(text(env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH'), 'utf8')), 'PR event');
  const pr = object(event.pull_request, 'PR event pull_request');
  const head = object(pr.head, 'PR head');
  const merge = hex(env.GITHUB_SHA, 40, 'PR merge revision');
  ensureCommit(root, merge);
  const parents = git(root, ['rev-list', '--parents', '-n', '1', merge]).split(' ');
  if (parents.length !== 3 || parents[1] !== object(pr.base, 'PR base').sha || parents[2] !== head.sha) {
    throw new Error('Current CI merge revision does not match the PR event.');
  }
  const summary = gitFile(root, merge, assessmentSummaryPath);
  if (summary === undefined) return { reportOnly: false, reason: 'No checked-in assessment: run normal source CI.' };
  let reference: ReportReference;
  try {
    reference = parseReportReference(summary);
    assertFresh(reference.generatedAt, now);
  } catch (error) {
    return { reportOnly: false, reason: `Assessment is not reusable; run normal source CI. ${String(error)}` };
  }
  if (
    reference.repository !== env.GITHUB_REPOSITORY ||
    reference.pullRequest !== pr.number ||
    reference.headRepository !== object(head.repo, 'PR head repository').full_name ||
    reference.headRef !== head.ref
  ) {
    return { reportOnly: false, reason: 'Assessment belongs to a different PR: run normal source CI.' };
  }
  if (!isReportOnlyUpdate(root, reference, hex(head.sha, 40, 'PR head revision'), merge)) {
    return {
      reportOnly: false,
      reason: 'Code, contract, test, dependency, configuration, or branch inputs changed: run normal source CI.',
    };
  }
  await github.sourceRun(reference);
  if (!(await github.hasArtifact(reference.repository, reference.runId, reference.runAttempt))) {
    throw new Error('Report-only update cannot reuse missing or expired source evidence.');
  }
  const spec = gitFile(root, hex(head.sha, 40, 'PR head revision'), assessmentSpecPath);
  if (spec === undefined) throw new Error('Report-only update is missing its SPEC assessment snapshot.');
  return { reportOnly: true, reference, summary, spec, sourceResult: await github.sourceValidation(reference) };
}

export function verifyReportUpdate(root: string, candidate: Candidate, bundle: CiBundle, now = new Date()): void {
  if (!candidate.reportOnly) throw new Error('No report-only candidate was identified.');
  assertFresh(bundle.generatedAt, now);
  const reference: ReportReference = { ...bundle.identity, generatedAt: bundle.generatedAt };
  if (JSON.stringify(reference) !== JSON.stringify(candidate.reference)) throw new Error('Downloaded evidence belongs to a different run.');
  if (formatCiSummary(root, bundle) !== candidate.summary) {
    throw new Error('Checked-in report is not the trusted rendering of its source evidence.');
  }
  if (formatCiSpec(root, bundle) !== candidate.spec)
    throw new Error('Checked-in SPEC is not the trusted rendering of its source evidence.');
}

export type Publication =
  | { eligible: false; reason: string }
  | { eligible: true; repository: string; branch: string; expectedHead: string; summary: string; spec: string; sourceRunId: string };

export async function preparePublication(
  root: string,
  bundle: CiBundle,
  github: AssessmentGitHub,
  expected: { repository: string; runId: string; runAttempt: number; defaultBranch: string },
  now = new Date(),
): Promise<Publication> {
  const identity = bundle.identity;
  if (identity.repository !== expected.repository || identity.runId !== expected.runId || identity.runAttempt !== expected.runAttempt) {
    throw new Error('Downloaded bundle is not from the triggering workflow attempt.');
  }
  assertFresh(bundle.generatedAt, now);
  await github.sourceRun(identity);
  assertTestedInputs(root, identity);
  const pr = await github.request<PullRequest>(`/repos/${identity.repository}/pulls/${identity.pullRequest}`);
  if (pr.state !== 'open') return { eligible: false, reason: 'PR is no longer open; no report commit was made.' };
  if (identity.headRepository !== identity.repository || pr.head.repo?.full_name !== identity.repository) {
    return { eligible: false, reason: 'Fork PR: the pilot publishes CI artifacts only; no fork branch write is attempted.' };
  }
  if (pr.base.repo.full_name !== identity.repository || pr.base.ref !== expected.defaultBranch || pr.head.ref === expected.defaultBranch) {
    return { eligible: false, reason: 'The pilot writes only to a PR source branch targeting the default branch, never to main.' };
  }
  if (pr.head.sha !== identity.headCommit || pr.head.ref !== identity.headRef) {
    return { eligible: false, reason: 'PR head moved since testing; discard the stale publication.' };
  }
  if (!pr.merge_commit_sha) return { eligible: false, reason: 'PR merge revision is unavailable or conflicted; resolve and rerun CI.' };
  ensureCommit(root, pr.merge_commit_sha);
  const parents = git(root, ['rev-list', '--parents', '-n', '1', pr.merge_commit_sha]).split(' ');
  if (parents.length !== 3 || parents[1] !== pr.base.sha || parents[2] !== pr.head.sha) {
    return { eligible: false, reason: 'GitHub has not refreshed the current PR merge revision; rerun publication after it is available.' };
  }
  if (inputDigest(root, pr.merge_commit_sha) !== identity.inputDigest) {
    return { eligible: false, reason: 'Merged source inputs changed since testing; update the branch and rerun CI.' };
  }
  const summary = formatCiSummary(root, bundle);
  const spec = formatCiSpec(root, bundle);
  if (Buffer.byteLength(summary) > 100_000) throw new Error('Generated assessment summary exceeds its publication limit.');
  if (Buffer.byteLength(spec) > 100_000) throw new Error('Generated SPEC exceeds its publication limit.');
  if (
    gitFile(root, identity.headCommit, assessmentSummaryPath) === summary &&
    gitFile(root, identity.headCommit, assessmentSpecPath) === spec
  ) {
    return { eligible: false, reason: 'The exact assessment is already present; no duplicate commit was made.' };
  }
  return {
    eligible: true,
    repository: identity.repository,
    branch: identity.headRef,
    expectedHead: identity.headCommit,
    summary,
    spec,
    sourceRunId: identity.runId,
  };
}

export async function publishAssessment(publication: Publication, github: AssessmentGitHub): Promise<string> {
  if (!publication.eligible) throw new Error('Assessment publication was not validated.');
  const response = await github.request<{
    data?: { createCommitOnBranch?: { commit?: { oid?: string } } };
    errors?: unknown[];
  }>('/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: 'mutation($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { oid } } }',
      variables: {
        input: {
          branch: { repositoryNameWithOwner: publication.repository, branchName: publication.branch },
          expectedHeadOid: publication.expectedHead,
          message: {
            headline: 'chore: update Checkbox Win32 assessment',
            body: `Auto-generated from CI run ${publication.sourceRunId}. No source inputs changed.`,
          },
          fileChanges: {
            additions: [
              { path: assessmentSummaryPath, contents: Buffer.from(publication.summary).toString('base64') },
              { path: assessmentSpecPath, contents: Buffer.from(publication.spec).toString('base64') },
            ],
          },
        },
      },
    }),
  });
  if (response.errors?.length) throw new Error('GitHub rejected the assessment commit; the branch may have moved or prohibit writes.');
  return hex(response.data?.createCommitOnBranch?.commit?.oid, 40, 'Published assessment commit');
}

export function readBundle(file: string): CiBundle {
  return parseBundle(readFileSync(file, 'utf8'));
}
