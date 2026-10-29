import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { object, text } from './controlAssessment.ts';
import {
  assessmentArtifactName,
  beginCiExecution,
  beginCiUnitCollection,
  combineCiEvidence,
  finishCiExecution,
  git,
} from './controlAssessmentCi.ts';
import {
  AssessmentGitHub,
  inspectReportUpdate,
  preparePublication,
  publishAssessment,
  readBundle,
  verifyReportUpdate,
} from './controlAssessmentGithub.ts';
import type { Candidate } from './controlAssessmentGithub.ts';

function output(name: string, value: string | boolean): void {
  if (/[\r\n]/.test(String(value))) throw new Error('Invalid multiline workflow output.');
  appendFileSync(text(process.env.GITHUB_OUTPUT, 'GITHUB_OUTPUT'), `${name}=${value}\n`);
}

function notice(message: string): void {
  process.stdout.write(`${message}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${message}\n\n`);
}

async function main(args = process.argv.slice(2)): Promise<void> {
  const env = process.env;
  const root = git(process.cwd(), ['rev-parse', '--show-toplevel']);
  const command = args[0];
  if (command === 'begin') {
    beginCiExecution(root, env);
    notice('Captured pre-execution Checkbox inputs. Hosted physical input remains disabled.');
  } else if (command === 'begin-unit') {
    beginCiUnitCollection(root, env);
    notice('Prepared capture of the existing component Jest invocation; no additional unit tests are launched.');
  } else if (command === 'combine') {
    const bundle = combineCiEvidence(root, env);
    notice(
      `Assessed existing JS/native results from run ${bundle.identity.runId}, attempt ${bundle.identity.runAttempt}; no tests were rerun.`,
    );
  } else if (command === 'finish') {
    const bundle = finishCiExecution(root, env);
    notice(
      `Advisory Checkbox assessment generated for run ${bundle.identity.runId}, attempt ${bundle.identity.runAttempt}. No maturity stage assigned.`,
    );
  } else if (command === 'inspect') {
    const github = new AssessmentGitHub({ token: text(env.GITHUB_TOKEN, 'GITHUB_TOKEN') });
    const candidate = await inspectReportUpdate(root, env, github);
    output('candidate', candidate.reportOnly);
    if (candidate.reportOnly) {
      const candidatePath = path.join(text(env.RUNNER_TEMP, 'RUNNER_TEMP'), 'checkbox-assessment-candidate.json');
      writeFileSync(candidatePath, JSON.stringify(candidate));
      output('candidate-path', candidatePath);
      output('run-id', candidate.reference.runId);
      output('artifact-name', `${assessmentArtifactName}-${candidate.reference.runAttempt}`);
      notice('Report-only candidate found. Source jobs remain gated until the original evidence and rendered report are verified.');
    } else {
      output('report-only', false);
      notice(candidate.reason);
    }
  } else if (command === 'verify') {
    const candidate = JSON.parse(readFileSync(text(env.CANDIDATE_PATH, 'CANDIDATE_PATH'), 'utf8')) as Candidate;
    verifyReportUpdate(root, candidate, readBundle(text(env.BUNDLE_PATH, 'BUNDLE_PATH')));
    if (!candidate.reportOnly) throw new Error('No report-only candidate.');
    output('report-only', true);
    output('source-result', candidate.sourceResult);
    notice(
      `Verified unchanged tested inputs and exact generated report/SPEC assessment fields. Reusing source validation result: ${candidate.sourceResult}.`,
    );
  } else if (command === 'find-artifact') {
    const event = object(JSON.parse(readFileSync(text(env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH'), 'utf8')), 'Workflow event');
    const run = object(event.workflow_run, 'Source workflow run');
    const github = new AssessmentGitHub({ token: text(env.GITHUB_TOKEN, 'GITHUB_TOKEN') });
    const found = await github.hasArtifact(text(env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY'), String(run.id), Number(run.run_attempt));
    output('found', found);
    output('artifact-name', `${assessmentArtifactName}-${Number(run.run_attempt)}`);
    notice(
      found
        ? 'Found the source attempt assessment bundle.'
        : 'No assessment artifact exists for this attempt. Report-only verification runs do not execute or republish native assessments.',
    );
  } else if (command === 'prepare-publication') {
    const event = object(JSON.parse(readFileSync(text(env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH'), 'utf8')), 'Workflow event');
    const run = object(event.workflow_run, 'Source workflow run');
    const github = new AssessmentGitHub({ token: text(env.GITHUB_TOKEN, 'GITHUB_TOKEN') });
    const publication = await preparePublication(root, readBundle(text(env.BUNDLE_PATH, 'BUNDLE_PATH')), github, {
      repository: text(env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY'),
      runId: String(run.id),
      runAttempt: Number(run.run_attempt),
      defaultBranch: text(object(event.repository, 'Repository').default_branch, 'Default branch'),
    });
    output('eligible', publication.eligible);
    if (publication.eligible) {
      notice('Validated the source attempt, native evidence, merged input tree, target PR, and both allowlisted assessment write paths.');
    } else {
      notice(publication.reason);
    }
  } else if (command === 'publish') {
    // Revalidate after acquiring the write credential; never trust a stale prepared mutation.
    const event = object(JSON.parse(readFileSync(text(env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH'), 'utf8')), 'Workflow event');
    const run = object(event.workflow_run, 'Source workflow run');
    const readGitHub = new AssessmentGitHub({ token: text(env.GITHUB_TOKEN, 'GITHUB_TOKEN') });
    const publication = await preparePublication(root, readBundle(text(env.BUNDLE_PATH, 'BUNDLE_PATH')), readGitHub, {
      repository: text(env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY'),
      runId: String(run.id),
      runAttempt: Number(run.run_attempt),
      defaultBranch: text(object(event.repository, 'Repository').default_branch, 'Default branch'),
    });
    if (!publication.eligible) {
      notice(publication.reason);
      return;
    }
    const writer = new AssessmentGitHub({ token: text(env.ASSESSMENT_WRITE_TOKEN, 'ASSESSMENT_WRITE_TOKEN') });
    const commit = await publishAssessment(publication, writer);
    notice(
      `Published the generated Checkbox summary and SPEC assessment fields in commit ${commit}. Contract content, code, dependencies and workflows are unchanged.`,
    );
  } else {
    throw new Error('Expected begin, begin-unit, finish, combine, inspect, verify, find-artifact, prepare-publication, or publish.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
