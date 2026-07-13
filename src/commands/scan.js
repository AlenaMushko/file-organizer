import { Scanner } from '../lib/scanner.js';
import { renderScanResults } from '../formatters/scan.js';
import { runWithProgress } from '../utils/progress.js';

export async function runScan(directory) {
  const scanner = new Scanner();

  return runWithProgress(
    scanner,
    {
      startEvent: 'scan-start',
      progressEvent: 'file-found',
      progressLabel: 'Processing...',
      getStartMessage: ({ directory: targetDirectory, totalFiles }) => ({
        header: `📂 Scanning: ${targetDirectory}`,
        total: totalFiles,
      }),
      render: renderScanResults,
    },
    () => scanner.scan(directory)
  );
}
