import { HASH_PREVIEW_LENGTH } from '../constants/duplicates.js';
import { REPORT_SEPARATOR } from '../constants/format.js';
import { formatRelativePath, formatSize } from '../utils/format.js';
import { pluralize } from '../utils/pluralize.js';

function formatHashPreview(hash) {
  return `${hash.slice(0, HASH_PREVIEW_LENGTH)}...`;
}

export function renderDuplicatesResults(result) {
  const { directory, groups, totalWasted } = result;

  if (groups.length === 0) {
    return '\nNo duplicate files found.';
  }

  const lines = [
    '',
    `Found ${groups.length} duplicate ${pluralize(groups.length, 'group')} (${formatSize(totalWasted)} wasted):`,
  ];

  groups.forEach((group, index) => {
    lines.push(REPORT_SEPARATOR);
    lines.push(
      `Group ${index + 1} (${group.files.length} ${pluralize(group.files.length, 'copy')}, ${formatSize(group.size)} each):`
    );
    lines.push(`  SHA-256: ${formatHashPreview(group.hash)}`);
    lines.push('');

    for (const file of group.files) {
      lines.push(`  📄 ${formatRelativePath(directory, file.path)}`);
    }

    lines.push('');
    lines.push(`  Wasted space: ${formatSize(group.wastedSpace)}`);
  });

  lines.push(REPORT_SEPARATOR);
  lines.push(`💾 Total wasted space: ${formatSize(totalWasted)}`);

  return lines.join('\n');
}
