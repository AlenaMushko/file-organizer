import path from 'node:path';

import { ORGANIZE_CATEGORY_ORDER } from '../constants/organize.js';
import { formatSize } from '../utils/format.js';
import { pluralizeFile } from '../utils/pluralize.js';

export function renderOrganizeResults(result) {
  const outputName = path.basename(result.output);
  const lines = [
    '',
    '✅ Organization complete!',
    '',
    'Summary:',
  ];

  for (const category of ORGANIZE_CATEGORY_ORDER) {
    const { count } = result.byCategory[category];

    lines.push(
      `  ${category.padEnd(10)} ${String(count).padStart(3)} ${pluralizeFile(count).padEnd(5)} → ${outputName}/${category}/`
    );
  }

  lines.push('');
  lines.push(
    `Total copied: ${result.totalCopied} ${pluralizeFile(result.totalCopied)} (${formatSize(result.totalSize)})`
  );

  return lines.join('\n');
}
