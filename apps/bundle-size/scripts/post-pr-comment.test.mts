import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bundleSizeCommentMarker,
  createBundleSizeComment,
  parsePullRequestNumber,
  upsertBundleSizeComment,
  validateBundleSizeReport,
} from './post-pr-comment.mts';

const validReport = `# Bundle size report

Tree-shaken, minified production esbuild bundles with React and React Native runtimes externalized.

| Scenario | Modules-Mac (Δ) | Modules-Win (Δ) | Size-Mac (Δ) | Size-Win (Δ) |
| --- | ---: | ---: | ---: | ---: |
| design-color-lib | 6  (+0) | 6  (+0) | 6.33k  (+0b) | 6.33k  (+0b) |
| components-button | 62 (New) | 63 (New) | 49.48k (New) | 49.40k (New) |

The job is advisory: size changes are reported but do not fail the pull request. Bundle or analysis errors still fail.
`;

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('validateBundleSizeReport', () => {
  it('accepts the generated report shape', () => {
    assert.equal(validateBundleSizeReport(validReport), validReport.trimEnd());
  });

  it('rejects content outside the generated report shape', () => {
    assert.throws(
      () => validateBundleSizeReport(validReport.replace('components-button', '@reviewers [click](https://example.com)')),
      /invalid table row/,
    );
  });
});

describe('createBundleSizeComment', () => {
  it('adds a stable marker and trusted workflow link', () => {
    const comment = createBundleSizeComment(validReport, 'microsoft/fluentui-react-native', '123');

    assert.match(comment, new RegExp(`^${bundleSizeCommentMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    assert.match(comment, /\| Scenario \| Modules-Mac \(Δ\) \| Modules-Win \(Δ\) \| Size-Mac \(Δ\) \| Size-Win \(Δ\) \|/);
    assert.match(comment, /\| design-color-lib \| 6 {2}\(\+0\) \| 6 {2}\(\+0\) \| 6\.33k {2}\(\+0b\) \| 6\.33k {2}\(\+0b\) \|/);
    assert.match(comment, /https:\/\/github\.com\/microsoft\/fluentui-react-native\/actions\/runs\/123\)$/);
  });

  it('rejects untrusted workflow link inputs', () => {
    assert.throws(() => createBundleSizeComment(validReport, 'other/repo', '123?redirect=example.com'), /workflow identity/);
  });
});

describe('parsePullRequestNumber', () => {
  it('accepts artifact metadata containing one positive integer', () => {
    assert.equal(parsePullRequestNumber('42\n'), 42);
  });

  it('rejects artifact metadata containing anything else', () => {
    assert.throws(() => parsePullRequestNumber('42\n43'), /Invalid pull request number/);
    assert.throws(() => parsePullRequestNumber('0'), /Invalid pull request number/);
  });
});

describe('upsertBundleSizeComment', () => {
  it('updates the existing Actions comment after verifying the pull request head', async () => {
    const requests: { url: string; options?: RequestInit }[] = [];
    const fetchImplementation = async (input: string | URL | Request, options?: RequestInit): Promise<Response> => {
      const url = String(input);
      requests.push({ url, options });
      if (url.endsWith('/pulls/42')) {
        return jsonResponse({ head: { sha: 'abc123', repo: { full_name: 'contributor/fluentui-react-native' } } });
      }
      if (url.includes('/issues/42/comments?')) {
        return jsonResponse([{ id: 7, body: `${bundleSizeCommentMarker}\nold`, user: { login: 'github-actions[bot]' } }]);
      }
      if (url.endsWith('/issues/comments/7')) {
        return jsonResponse({ id: 7 });
      }
      throw new Error(`Unexpected request: ${url}`);
    };

    await upsertBundleSizeComment({
      body: `${bundleSizeCommentMarker}\nnew`,
      expectedHeadRepository: 'contributor/fluentui-react-native',
      expectedHeadSha: 'abc123',
      fetchImplementation,
      pullRequestNumber: 42,
      repository: 'microsoft/fluentui-react-native',
      token: 'test-token',
    });

    assert.equal(requests.at(-1)?.options?.method, 'PATCH');
    const requestBody = requests.at(-1)?.options?.body;
    assert.ok(typeof requestBody === 'string');
    assert.deepEqual(JSON.parse(requestBody), { body: `${bundleSizeCommentMarker}\nnew` });
  });

  it('creates a comment when no prior marker exists', async () => {
    const requests: { url: string; options?: RequestInit }[] = [];
    const fetchImplementation = async (input: string | URL | Request, options?: RequestInit): Promise<Response> => {
      const url = String(input);
      requests.push({ url, options });
      if (url.endsWith('/pulls/42')) {
        return jsonResponse({ head: { sha: 'abc123', repo: { full_name: 'microsoft/fluentui-react-native' } } });
      }
      if (url.includes('/issues/42/comments?')) {
        return jsonResponse([]);
      }
      if (url.endsWith('/issues/42/comments')) {
        return jsonResponse({ id: 8 }, 201);
      }
      throw new Error(`Unexpected request: ${url}`);
    };

    await upsertBundleSizeComment({
      body: `${bundleSizeCommentMarker}\nnew`,
      expectedHeadRepository: 'microsoft/fluentui-react-native',
      expectedHeadSha: 'abc123',
      fetchImplementation,
      pullRequestNumber: 42,
      repository: 'microsoft/fluentui-react-native',
      token: 'test-token',
    });

    assert.equal(requests.at(-1)?.options?.method, 'POST');
  });

  it('rejects a stale workflow run before reading comments', async () => {
    const fetchImplementation = async () =>
      jsonResponse({ head: { sha: 'new-head', repo: { full_name: 'contributor/fluentui-react-native' } } });

    await assert.rejects(
      upsertBundleSizeComment({
        body: `${bundleSizeCommentMarker}\nnew`,
        expectedHeadRepository: 'contributor/fluentui-react-native',
        expectedHeadSha: 'old-head',
        fetchImplementation,
        pullRequestNumber: 42,
        repository: 'microsoft/fluentui-react-native',
        token: 'test-token',
      }),
      /does not match the current pull request head/,
    );
  });

  it('rejects a pull request whose fork has been deleted', async () => {
    const fetchImplementation = async () => jsonResponse({ head: { sha: 'abc123', repo: null } });

    await assert.rejects(
      upsertBundleSizeComment({
        body: `${bundleSizeCommentMarker}\nnew`,
        expectedHeadRepository: 'contributor/fluentui-react-native',
        expectedHeadSha: 'abc123',
        fetchImplementation,
        pullRequestNumber: 42,
        repository: 'microsoft/fluentui-react-native',
        token: 'test-token',
      }),
      /does not match the current pull request head/,
    );
  });
});
