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
  it('shows bundle costs and signed baseline deltas', () => {
    const output = formatBundleSizeTable([
      {
        platform: 'macos',
        scenario: 'components-button',
        comparison: {
          status: 'compared',
          currentModuleCost: 737,
          currentCost: 414_038,
          moduleCostDelta: 2,
          costDelta: -999,
        },
      },
      {
        platform: 'windows',
        scenario: 'components-button',
        comparison: {
          status: 'compared',
          currentModuleCost: 1503,
          currentCost: 1000,
          moduleCostDelta: -12,
          costDelta: 1000,
        },
      },
      {
        platform: 'macos',
        scenario: 'design-color-lib',
        comparison: {
          status: 'new',
          currentModuleCost: 6,
          currentCost: 999,
        },
      },
    ]);

    assert.match(output, /Scenario/);
    assert.match(output, /Modules-Mac \(Δ\)/);
    assert.match(output, /Modules-Win \(Δ\)/);
    assert.match(output, /Size-Mac \(Δ\)/);
    assert.match(output, /Size-Win \(Δ\)/);
    assert.match(
      output,
      /components-button\s+│\s+737 {2}\(\+2\)\s+│\s+1,503 \(-12\)\s+│\s+414\.04k \(-999b\)\s+│\s+1\.00k {2}\(\+1\.00k\)/,
    );
    assert.doesNotMatch(output, /1,234\.56k/);
    assert.match(output, /design-color-lib\s+│\s+6 \(New\)\s+│\s+-\s+│\s+999b \(New\)\s+│\s+-/);
  });
});
