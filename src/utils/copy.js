import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { LARGE_FILE_THRESHOLD_BYTES } from '../constants/organize.js';

export async function copyFileSmart(sourcePath, targetPath) {
  const stats = await fsPromises.stat(sourcePath);

  if (stats.size >= LARGE_FILE_THRESHOLD_BYTES) {
    await pipeline(
      fs.createReadStream(sourcePath),
      fs.createWriteStream(targetPath)
    );
    return;
  }

  await fsPromises.copyFile(sourcePath, targetPath);
}

export async function resolveUniquePath(targetPath) {
  try {
    await fsPromises.access(targetPath);
  } catch {
    return targetPath;
  }

  const directory = path.dirname(targetPath);
  const extension = path.extname(targetPath);
  const baseName = path.basename(targetPath, extension);
  let counter = 1;

  while (true) {
    const candidate = path.join(directory, `${baseName}(${counter})${extension}`);

    try {
      await fsPromises.access(candidate);
      counter += 1;
    } catch {
      return candidate;
    }
  }
}
