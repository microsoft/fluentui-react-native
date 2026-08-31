import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bundleSizeCommentMarker,
  createBundleSizeComment,
  parsePullRequestNumber,
  upsertBundleSizeComment,
  validateBundleSizeReport,
} from './post-pr-comment.mjs';

const validReport = `# Bundle size report

Tree-shaken production Metro bundles. Component costs are relative to their platform shell; shell costs are absolute.

| Platform | Scenario | Baseline cost | Current cost | Cost delta | Change | Gzip delta | Module delta |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| macos | shell | 801.3 KiB | 801.3 KiB | 0.0 KiB | 0.00% | 0.0 KiB | +0 |
| macos | components-button | New | 46.4 KiB | New | New | New | New |

The job is advisory: size changes are reported but do not fail the pull request. Bundle or analysis errors still fail.
`;

function jsonResponse(value, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => value,
    text: async () => JSON.stringify(value),
  };
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
    const requests = [];
    const fetchImplementation = async (url, options) => {
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

    assert.equal(requests.at(-1).options.method, 'PATCH');
    assert.deepEqual(JSON.parse(requests.at(-1).options.body), { body: `${bundleSizeCommentMarker}\nnew` });
  });

  it('creates a comment when no prior marker exists', async () => {
    const requests = [];
    const fetchImplementation = async (url, options) => {
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

    assert.equal(requests.at(-1).options.method, 'POST');
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
