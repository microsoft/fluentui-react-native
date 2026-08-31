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

export function formatBundleSizeTable(results) {
  const rows = results.map(({ platform, scenario, comparison }) => [
    `${platform}: ${scenario}`,
    comparison.currentModuleCost,
    comparison.status === 'new' ? 'New' : formatSigned(comparison.moduleCostDelta, integerFormatter.format),
    formatSize(comparison.currentCost),
    comparison.status === 'new' ? 'New' : formatSigned(comparison.costDelta, formatSize),
  ]);

  return formatAsTable(rows, {
    columns: [
      { label: 'Platform: scenario' },
      { label: 'New modules', align: 'right', format: integerFormatter.format },
      { label: 'Module delta', align: 'right' },
      { label: 'New size', align: 'right' },
      { label: 'Size delta', align: 'right' },
    ],
  });
}
