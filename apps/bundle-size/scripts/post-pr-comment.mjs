import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const bundleSizeCommentMarker = '<!-- furn-bundle-size-report -->';

const reportHeader = '# Bundle size report';
const reportDescription =
  'Tree-shaken production Metro bundles. Component costs are relative to their platform shell; shell costs are absolute.';
const tableHeader = '| Platform | Scenario | Baseline cost | Current cost | Cost delta | Change | Gzip delta | Module delta |';
const tableSeparator = '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |';
const reportFooter =
  'The job is advisory: size changes are reported but do not fail the pull request. Bundle or analysis errors still fail.';
const tableRowPattern =
  /^\| [A-Za-z0-9][A-Za-z0-9._/-]{0,79} \| [A-Za-z0-9][A-Za-z0-9._:/-]{0,79} \| (?:New|[+-]?\d+\.\d KiB) \| (?:New|[+-]?\d+\.\d KiB) \| (?:New|[+-]?\d+\.\d KiB) \| (?:New|[+-]?\d+\.\d{2}%) \| (?:New|[+-]?\d+\.\d KiB) \| (?:New|[+-]?\d+) \|$/;
const maximumReportBytes = 60_000;
const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function validateBundleSizeReport(report) {
  if (Buffer.byteLength(report, 'utf8') > maximumReportBytes) {
    throw new Error(`Bundle-size report exceeds ${maximumReportBytes} bytes`);
  }

  const normalized = report.replaceAll('\r\n', '\n').trimEnd();
  const lines = normalized.split('\n');
  if (
    lines[0] !== reportHeader ||
    lines[1] !== '' ||
    lines[2] !== reportDescription ||
    lines[3] !== '' ||
    lines[4] !== tableHeader ||
    lines[5] !== tableSeparator
  ) {
    throw new Error('Bundle-size report header does not match the trusted format');
  }

  const footerIndex = lines.length - 1;
  if (footerIndex < 8 || lines[footerIndex - 1] !== '' || lines[footerIndex] !== reportFooter) {
    throw new Error('Bundle-size report footer does not match the trusted format');
  }

  const rows = lines.slice(6, footerIndex - 1);
  if (rows.length === 0 || rows.some((row) => !tableRowPattern.test(row))) {
    throw new Error('Bundle-size report contains an invalid table row');
  }

  return normalized;
}

export function createBundleSizeComment(report, repository, runId) {
  if (!repositoryPattern.test(repository) || !/^\d+$/.test(runId)) {
    throw new Error('Invalid bundle-size workflow identity');
  }

  const runUrl = `https://github.com/${repository}/actions/runs/${runId}`;
  return `${bundleSizeCommentMarker}\n${validateBundleSizeReport(report)}\n\n---\n[View bundle-size workflow run](${runUrl})`;
}

export function parsePullRequestNumber(value) {
  const normalized = value.trim();
  if (!/^[1-9]\d*$/.test(normalized)) {
    throw new Error(`Invalid pull request number: ${normalized}`);
  }

  const pullRequestNumber = Number(normalized);
  if (!Number.isSafeInteger(pullRequestNumber)) {
    throw new Error(`Invalid pull request number: ${normalized}`);
  }

  return pullRequestNumber;
}

async function requestJson(fetchImplementation, url, token, options = {}) {
  const response = await fetchImplementation(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}): ${await response.text()}`);
  }

  return response.status === 204 ? undefined : response.json();
}

export async function upsertBundleSizeComment({
  apiUrl = 'https://api.github.com',
  body,
  expectedHeadRepository,
  expectedHeadSha,
  fetchImplementation = fetch,
  pullRequestNumber,
  repository,
  token,
}) {
  if (!repositoryPattern.test(repository)) {
    throw new Error(`Invalid GitHub repository: ${repository}`);
  }
  if (!Number.isSafeInteger(pullRequestNumber) || pullRequestNumber <= 0) {
    throw new Error(`Invalid pull request number: ${pullRequestNumber}`);
  }

  const repositoryPath = repository
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const request = (path, options) => requestJson(fetchImplementation, `${apiUrl}/repos/${repositoryPath}${path}`, token, options);
  const pullRequest = await request(`/pulls/${pullRequestNumber}`);
  if (pullRequest.head.sha !== expectedHeadSha || pullRequest.head.repo?.full_name !== expectedHeadRepository) {
    throw new Error('Workflow run does not match the current pull request head');
  }

  let existingComment;
  for (let page = 1; page <= 20 && !existingComment; page += 1) {
    const comments = await request(`/issues/${pullRequestNumber}/comments?per_page=100&page=${page}`);
    existingComment = comments.find(
      (comment) => comment.user?.login === 'github-actions[bot]' && comment.body?.includes(bundleSizeCommentMarker),
    );
    if (comments.length < 100) {
      break;
    }
  }

  if (existingComment) {
    await request(`/issues/comments/${existingComment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    });
  } else {
    await request(`/issues/${pullRequestNumber}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }
}

async function main() {
  const {
    EXPECTED_HEAD_REPOSITORY: expectedHeadRepository,
    EXPECTED_HEAD_SHA: expectedHeadSha,
    GITHUB_API_URL: apiUrl,
    GITHUB_REPOSITORY: repository,
    GITHUB_TOKEN: token,
    PR_NUMBER: pullRequestNumberValue,
    PR_NUMBER_PATH: pullRequestNumberPath,
    REPORT_PATH: reportPath,
    SOURCE_RUN_ID: runId,
  } = process.env;

  if (
    !expectedHeadRepository ||
    !expectedHeadSha ||
    !repository ||
    !token ||
    (!pullRequestNumberValue && !pullRequestNumberPath) ||
    !reportPath ||
    !runId
  ) {
    throw new Error('Missing required bundle-size PR comment environment');
  }

  const pullRequestNumber = parsePullRequestNumber(pullRequestNumberValue ?? (await readFile(pullRequestNumberPath, 'utf8')));
  const report = await readFile(reportPath, 'utf8');
  const body = createBundleSizeComment(report, repository, runId);
  await upsertBundleSizeComment({
    apiUrl,
    body,
    expectedHeadRepository,
    expectedHeadSha,
    pullRequestNumber,
    repository,
    token,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
