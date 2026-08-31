import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatBundleSizeTable, formatSize } from './format.mjs';

describe('formatSize', () => {
  it('formats bytes below 1000 without scaling', () => {
    assert.equal(formatSize(0), '0b');
    assert.equal(formatSize(999), '999b');
    assert.equal(formatSize(-999), '-999b');
  });

  it('formats kilobytes with grouping and two decimal places', () => {
    assert.equal(formatSize(1000), '1.00k');
    assert.equal(formatSize(1_234_560), '1,234.56k');
    assert.equal(formatSize(-1_234_560), '-1,234.56k');
  });
});

describe('formatBundleSizeTable', () => {
  it('shows shell-relative costs and signed baseline deltas', () => {
    const output = formatBundleSizeTable([
      {
        platform: 'macos',
        scenario: 'components-button',
        moduleCount: 1234,
        rawBytes: 1_234_560,
        deltaModules: 737,
        deltaBytes: 414_038,
        comparison: {
          status: 'compared',
          currentModuleCost: 737,
          currentCost: 414_038,
          moduleCostDelta: 2,
          costDelta: -999,
        },
      },
      {
        platform: 'win32',
        scenario: 'shell',
        moduleCount: 497,
        rawBytes: 999,
        comparison: {
          status: 'new',
          currentModuleCost: 497,
          currentCost: 999,
        },
      },
      {
        platform: 'windows',
        scenario: 'components-catalog',
        moduleCount: 2000,
        rawBytes: 2000,
        deltaModules: 1503,
        deltaBytes: 1000,
        comparison: {
          status: 'compared',
          currentModuleCost: 1503,
          currentCost: 1000,
          moduleCostDelta: -12,
          costDelta: 1000,
        },
      },
    ]);

    assert.match(output, /Platform: scenario/);
    assert.match(output, /New modules/);
    assert.match(output, /macos: components-button/);
    assert.match(output, /737/);
    assert.match(output, /\+2/);
    assert.match(output, /414\.04k/);
    assert.doesNotMatch(output, /1,234\.56k/);
    assert.match(output, /-999b/);
    assert.match(output, /win32: shell/);
    assert.match(output, /999b/);
    assert.match(output, /New/);
    assert.match(output, /windows: components-catalog/);
    assert.match(output, /1,503/);
    assert.match(output, /-12/);
    assert.match(output, /\+1\.00k/);
  });
});
