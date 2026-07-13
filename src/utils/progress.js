import { drawProgressBar } from './format.js';

export async function runWithProgress(emitter, options, task) {
  const { startEvent, progressEvent, getStartMessage, progressLabel, render } =
    options;
  let processed = 0;
  let total = 0;

  emitter.on(startEvent, (data) => {
    const { header, total: totalItems } = getStartMessage(data);

    console.log(header);
    total = totalItems;

    if (totalItems > 0) {
      process.stdout.write(`${progressLabel} ${drawProgressBar(0, total)}`);
    }
  });

  emitter.on(progressEvent, () => {
    processed += 1;
    process.stdout.write(
      `\r${progressLabel} ${drawProgressBar(processed, total)}`
    );
  });

  const result = await task();

  if (total > 0) {
    process.stdout.write('\n');
  }

  console.log(render(result));
  return result;
}
