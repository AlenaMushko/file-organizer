import { Organizer } from '../lib/organizer.js';
import { renderOrganizeResults } from '../formatters/organize.js';
import { drawProgressBar } from '../utils/format.js';

export async function runOrganize(sourceDirectory, outputDirectory) {
  const organizer = new Organizer();
  let processed = 0;
  let total = 0;

  organizer.on('organize-start', ({ source, output, totalFiles }) => {
    console.log(`📦 Organizing: ${source}`);
    console.log(`Target: ${output}\n`);
    total = totalFiles;
  });

  organizer.on('folders-created', ({ categories }) => {
    console.log('Creating folders...');

    for (const category of categories) {
      console.log(`  ✓ ${category}/`);
    }

    console.log('');

    if (total > 0) {
      process.stdout.write(`Copying files... ${drawProgressBar(0, total)}`);
    }
  });

  organizer.on('copy-complete', () => {
    processed += 1;
    process.stdout.write(
      `\rCopying files... ${drawProgressBar(processed, total)}`
    );
  });

  const result = await organizer.organize(sourceDirectory, outputDirectory);

  if (total > 0) {
    process.stdout.write('\n');
  }

  console.log(renderOrganizeResults(result));
  return result;
}
