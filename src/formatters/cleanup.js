import { CLEANUP_PREVIEW_LIMIT } from '../constants/cleanup.js';
import { REPORT_SEPARATOR } from '../constants/format.js';
import { formatDate, formatSize } from '../utils/format.js';
import { pluralizeFile } from '../utils/pluralize.js';

function renderFileEntry(file) {
  return [
    file.name,
    `  Size: ${formatSize(file.size)}`,
    `  Modified: ${file.daysOld} days ago (${formatDate(file.modifiedAt)})`,
  ].join('\n');
}

export function renderCleanupFileList(result) {
  if (result.files.length === 0) {
    return 'No files found to delete.';
  }

  const lines = [
    `Found ${result.files.length} ${pluralizeFile(result.files.length)} to delete:`,
    '',
    REPORT_SEPARATOR,
  ];

  const previewFiles = result.files.slice(0, CLEANUP_PREVIEW_LIMIT);

  for (const file of previewFiles) {
    lines.push(renderFileEntry(file), '');
  }

  const hiddenCount = result.files.length - previewFiles.length;

  if (hiddenCount > 0) {
    lines.push(`... (${hiddenCount} more ${pluralizeFile(hiddenCount)})`, '');
  }

  lines.push(
    REPORT_SEPARATOR,
    '',
    `Total: ${result.files.length} ${pluralizeFile(result.files.length)} (${formatSize(result.totalSize)})`
  );

  return lines.join('\n');
}

export function renderDryRunFooter() {
  return [
    '',
    '⚠️  DRY RUN MODE: No files were deleted.',
    'To actually delete these files, run with --confirm flag.',
  ].join('\n');
}

export function renderDeleteWarning(result) {
  return `⚠️  DELETING ${result.files.length} ${pluralizeFile(result.files.length)} (${formatSize(result.totalSize)}). This action cannot be undone!`;
}

export function renderCleanupComplete(result) {
  return [
    '',
    '✅ Cleanup complete!',
    `Deleted: ${result.deletedCount} ${pluralizeFile(result.deletedCount)} (${formatSize(result.freedSize)} freed)`,
  ].join('\n');
}
