import fs from 'node:fs/promises';
import path from 'node:path';

import { MS_PER_DAY } from '../constants/format.js';
import { createFsError } from './errors.js';

export function resolveTargetDirectory(directory) {
  return path.resolve(directory);
}

export function getFileAgeInDays(mtime) {
  return Math.floor((Date.now() - mtime.getTime()) / MS_PER_DAY);
}

export async function validateDirectory(directory) {
  const stats = await fs.stat(directory);

  if (!stats.isDirectory()) {
    throw createFsError('ENOTDIR', directory);
  }
}

export async function collectFiles(directory, onError) {
  const files = [];

  await walkDirectory(directory, files, onError);

  return files;
}

export async function prepareDirectoryScan(directory, onError) {
  const targetDirectory = resolveTargetDirectory(directory);

  await validateDirectory(targetDirectory);

  const files = await collectFiles(targetDirectory, onError);

  return { targetDirectory, files };
}

export async function forEachFile(files, onFile, onError) {
  for (const filePath of files) {
    try {
      await onFile(filePath);
    } catch (error) {
      onError?.({ path: filePath, error });
    }
  }
}

async function walkDirectory(directory, files, onError) {
  let entries;

  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    onError?.({ path: directory, error });
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(fullPath, files, onError);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
}
