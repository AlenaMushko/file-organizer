import { Scanner } from '../lib/scanner.js';
import { renderScanResults } from '../formatters/scan.js';
import { drawProgressBar } from '../utils/format.js';

export async function runScan(directory) {
  const scanner = new Scanner();
  let processed = 0;
  let total = 0;

  scanner.on('scan-start', ({ directory: targetDirectory, totalFiles }) => {
    console.log(`📂 Scanning: ${targetDirectory}`);
    total = totalFiles;

    if (totalFiles > 0) {
      process.stdout.write(`Processing... ${drawProgressBar(0, total)}`);
    }
  });

  scanner.on('file-found', () => {
    processed += 1;
    process.stdout.write(`\rProcessing... ${drawProgressBar(processed, total)}`);
  });

  const stats = await scanner.scan(directory);

  if (total > 0) {
    process.stdout.write('\n');
  }

  console.log(renderScanResults(stats));
  return stats;
}
