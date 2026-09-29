import { formatAsTable } from '@rnx-kit/tools-formatting';

import type { Comparison, ScenarioComparison } from './types.mts';

const kilobyteFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export function formatSize(bytes: number): string {
  const absoluteBytes = Math.abs(bytes);
  if (absoluteBytes < 1000) {
    return `${bytes}b`;
  }

  const sign = bytes < 0 ? '-' : '';
  return `${sign}${kilobyteFormatter.format(absoluteBytes / 1000)}k`;
}

function formatSigned(value: number, formatter: (value: number) => string): string {
  const sign = value < 0 ? '-' : '+';
  return `${sign}${formatter(Math.abs(value))}`;
}

function formatWithDelta(value: number, formatter: (value: number) => string, comparison: Comparison, metric: 'size' | 'module'): string {
  if (comparison.status === 'new') {
    return `${formatter(value)} (New)`;
  }

  const delta = metric === 'size' ? comparison.costDelta : comparison.moduleCostDelta;
  const magnitude = formatter(Math.abs(delta));
  const integerDigits = magnitude.match(/^[\d,]+/)?.[0].replaceAll(',', '').length ?? 0;
  const padding = integerDigits === 1 ? ' ' : '';
  return `${formatter(value)} ${padding}(${formatSigned(delta, formatter)})`;
}

export function groupComparisonsByScenario(results: ScenarioComparison[]): Map<string, Map<string, Comparison>> {
  const scenarios = new Map<string, Map<string, Comparison>>();
  for (const { platform, scenario, comparison } of results) {
    const platformResults = scenarios.get(scenario) ?? new Map<string, Comparison>();
    platformResults.set(platform, comparison);
    scenarios.set(scenario, platformResults);
  }
  return scenarios;
}

export function formatModuleComparison(comparison?: Comparison): string {
  return comparison ? formatWithDelta(comparison.currentModuleCost, integerFormatter.format, comparison, 'module') : '-';
}

export function formatSizeComparison(comparison?: Comparison): string {
  return comparison ? formatWithDelta(comparison.currentCost, formatSize, comparison, 'size') : '-';
}

export function formatBundleSizeTable(results: ScenarioComparison[]): string {
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
