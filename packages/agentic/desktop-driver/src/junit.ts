/**
 * JUnit rendering.
 *
 * CI consumes JUnit on every run, so the renderer distinguishes an infrastructure error from a
 * test failure: the former becomes `<error>`, the latter `<failure>`.
 */

import type { DesktopTestResult } from './types.ts';

function escapeXml(value: string): string {
  return (
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      // eslint-disable-next-line no-control-regex -- XML 1.0 forbids these control characters outright
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  );
}

export function renderJUnit(suiteName: string, results: readonly DesktopTestResult[]): string {
  const failures = results.filter((result) => result.status === 'failed').length;
  const errors = results.filter((result) => result.status === 'infrastructureError').length;
  const skipped = results.filter((result) => result.status === 'skipped').length;
  const time = results.reduce((total, result) => total + result.durationMs, 0) / 1000;

  const cases = results
    .map((result) => {
      const attributes = [
        `name="${escapeXml(result.title)}"`,
        `classname="${escapeXml(result.storyId ?? suiteName)}"`,
        `time="${(result.durationMs / 1000).toFixed(3)}"`,
      ].join(' ');

      if (result.status === 'passed') {
        return `    <testcase ${attributes} />`;
      }
      if (result.status === 'skipped') {
        return `    <testcase ${attributes}>\n      <skipped />\n    </testcase>`;
      }
      const tag = result.status === 'infrastructureError' ? 'error' : 'failure';
      const message = escapeXml(result.error?.message ?? 'Unknown failure');
      const body = escapeXml(result.error?.stack ?? result.error?.message ?? '');
      return `    <testcase ${attributes}>\n      <${tag} message="${message}">${body}</${tag}>\n    </testcase>`;
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<testsuites>',
    `  <testsuite name="${escapeXml(suiteName)}" tests="${results.length}" failures="${failures}" errors="${errors}" skipped="${skipped}" time="${time.toFixed(3)}">`,
    cases,
    '  </testsuite>',
    '</testsuites>',
    '',
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}
