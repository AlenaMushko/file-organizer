import { Cleanup } from '../lib/cleanup.js';
import {
  renderCleanupComplete,
  renderCleanupFileList,
  renderDeleteWarning,
  renderDryRunFooter,
} from '../formatters/cleanup.js';
import { drawProgressBar } from '../utils/format.js';
import { resolveTargetDirectory } from '../utils/fs.js';

export async function runCleanup(directory, { olderThan, confirm }) {
  const cleanup = new Cleanup();
  let deleted = 0;
  let deleteTotal = 0;

  const targetDirectory = resolveTargetDirectory(directory);

  console.log(`🧹 Cleanup: ${targetDirectory}`);
  console.log(`Looking for files older than ${olderThan} days...\n`);

  cleanup.on('delete-start', ({ totalFiles }) => {
    deleteTotal = totalFiles;

    if (totalFiles > 0) {
      process.stdout.write(`Deleting... ${drawProgressBar(0, totalFiles)}`);
    }
  });

  cleanup.on('file-deleted', () => {
    deleted += 1;
    process.stdout.write(
      `\rDeleting... ${drawProgressBar(deleted, deleteTotal)}`
    );
  });

  const scanResult = await cleanup.findOldFiles(directory, olderThan);

  console.log(renderCleanupFileList(scanResult));

  if (scanResult.files.length === 0) {
    return scanResult;
  }

  if (!confirm) {
    console.log(renderDryRunFooter());
    return scanResult;
  }

  console.log('');
  console.log(renderDeleteWarning(scanResult));
  console.log('');

  const deleteResult = await cleanup.deleteFiles(scanResult.files);

  if (deleteTotal > 0) {
    process.stdout.write('\n');
  }

  const result = {
    ...scanResult,
    confirm,
    ...deleteResult,
  };

  cleanup.emit('cleanup-complete', result);

  console.log(renderCleanupComplete(result));
  return result;
}
