import { formatAsTable } from '@rnx-kit/tools-formatting';

const kilobyteFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export function formatSize(bytes) {
  const absoluteBytes = Math.abs(bytes);
  if (absoluteBytes < 1000) {
    return `${bytes}b`;
  }

  const sign = bytes < 0 ? '-' : '';
  return `${sign}${kilobyteFormatter.format(absoluteBytes / 1000)}k`;
}

function formatSigned(value, formatter) {
  const sign = value < 0 ? '-' : '+';
  return `${sign}${formatter(Math.abs(value))}`;
}

function formatWithDelta(value, delta, formatter, status) {
  if (status === 'new') {
    return `${formatter(value)} (New)`;
  }

  const magnitude = formatter(Math.abs(delta));
  const integerDigits = magnitude.match(/^[\d,]+/)?.[0].replaceAll(',', '').length ?? 0;
  const padding = integerDigits === 1 ? ' ' : '';
  return `${formatter(value)} ${padding}(${formatSigned(delta, formatter)})`;
}

export function groupComparisonsByScenario(results) {
  const scenarios = new Map();
  for (const { platform, scenario, comparison } of results) {
    const platformResults = scenarios.get(scenario) ?? new Map();
    platformResults.set(platform, comparison);
    scenarios.set(scenario, platformResults);
  }
  return scenarios;
}

export function formatModuleComparison(comparison) {
  return comparison
    ? formatWithDelta(comparison.currentModuleCost, comparison.moduleCostDelta, integerFormatter.format, comparison.status)
    : '-';
}

export function formatSizeComparison(comparison) {
  return comparison ? formatWithDelta(comparison.currentCost, comparison.costDelta, formatSize, comparison.status) : '-';
}

export function formatBundleSizeTable(results) {
  const rows = [...groupComparisonsByScenario(results)].map(([scenario, platformResults]) => {
    const macos = platformResults.get('macos');
    const windows = platformResults.get('windows');
    return [
      scenario,
      formatModuleComparison(macos),
      formatModuleComparison(windows),
      formatSizeComparison(macos),
      formatSizeComparison(windows),
    ];
  });

  return formatAsTable(rows, {
    columns: [
      { label: 'Scenario' },
      { label: 'Modules-Mac (Δ)', align: 'right' },
      { label: 'Modules-Win (Δ)', align: 'right' },
      { label: 'Size-Mac (Δ)', align: 'right' },
      { label: 'Size-Win (Δ)', align: 'right' },
    ],
  });
}
