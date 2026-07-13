import { REPORT_SEPARATOR } from '../constants/format.js';
import { formatSize } from '../utils/format.js';
import { pluralizeFile } from '../utils/pluralize.js';

export function renderScanResults(stats) {
  const extensions = Object.entries(stats.extensions).sort(
    ([, first], [, second]) => second.count - first.count
  );

  const lines = [
    '',
    '📊 Scan Results:',
    REPORT_SEPARATOR,
    `Total files: ${stats.totalFiles}`,
    `Total size: ${formatSize(stats.totalSize)}`,
    '',
    'By File Type:',
  ];

  for (const [extension, data] of extensions) {
    lines.push(
      `  ${extension.padEnd(8)} ${String(data.count).padStart(4)} ${pluralizeFile(data.count).padEnd(5)}   ${formatSize(data.totalSize)}`
    );
  }

  lines.push(
    '',
    'File Age:',
    `  Last 7 days:    ${stats.age.last7Days} ${pluralizeFile(stats.age.last7Days)}`,
    `  Last 30 days:   ${stats.age.last30Days} ${pluralizeFile(stats.age.last30Days)}`,
    `  Older than 90:  ${stats.age.olderThan90Days} ${pluralizeFile(stats.age.olderThan90Days)}`,
    '',
    'Largest files:'
  );

  stats.largestFiles.forEach((file, index) => {
    lines.push(
      `  ${index + 1}. ${file.name.padEnd(24)} ${formatSize(file.size)}`
    );
  });

  if (stats.oldestFile) {
    lines.push(
      '',
      `Oldest file: ${stats.oldestFile.name} (modified ${stats.oldestFile.daysOld} days ago)`
    );
  }

  return lines.join('\n');
}
