import { DuplicateFinder } from '../lib/duplicates.js';
import { renderDuplicatesResults } from '../formatters/duplicates.js';
import { runWithProgress } from '../utils/progress.js';

export async function runDuplicates(directory) {
  const finder = new DuplicateFinder();

  return runWithProgress(
    finder,
    {
      startEvent: 'search-start',
      progressEvent: 'file-processed',
      progressLabel: 'Calculating hashes...',
      getStartMessage: ({ directory: targetDirectory, totalFiles }) => ({
        header: `🔍 Searching for duplicates in: ${targetDirectory}`,
        total: totalFiles,
      }),
      render: renderDuplicatesResults,
    },
    () => finder.find(directory)
  );
}
