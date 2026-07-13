import fs from 'node:fs/promises';
import { EventEmitter } from 'node:events';

import {
  forEachFile,
  prepareDirectoryScan,
} from '../utils/fs.js';
import { calculateHash } from '../utils/hash.js';

export class DuplicateFinder extends EventEmitter {
  async find(directory) {
    const { targetDirectory, files } = await prepareDirectoryScan(
      directory,
      (data) => this.emit('file-error', data)
    );
    const hashMap = new Map();

    this.emit('search-start', {
      directory: targetDirectory,
      totalFiles: files.length,
    });

    await forEachFile(
      files,
      async (filePath) => {
        const fileStats = await fs.stat(filePath);
        const hash = await calculateHash(filePath);
        const group = hashMap.get(hash) ?? [];

        group.push({
          path: filePath,
          size: fileStats.size,
        });
        hashMap.set(hash, group);

        this.emit('file-processed', {
          path: filePath,
          hash,
          size: fileStats.size,
        });
      },
      (data) => this.emit('file-error', data)
    );

    const groups = this.buildDuplicateGroups(hashMap);
    const totalWasted = groups.reduce(
      (sum, group) => sum + group.wastedSpace,
      0
    );

    const result = {
      directory: targetDirectory,
      groups,
      totalWasted,
      totalFiles: files.length,
    };

    this.emit('duplicates-found', result);
    return result;
  }

  buildDuplicateGroups(hashMap) {
    const groups = [];

    for (const [hash, fileEntries] of hashMap) {
      if (fileEntries.length <= 1) {
        continue;
      }

      const size = fileEntries[0].size;
      const wastedSpace = size * (fileEntries.length - 1);

      groups.push({
        hash,
        size,
        files: fileEntries,
        wastedSpace,
      });
    }

    groups.sort((first, second) => second.wastedSpace - first.wastedSpace);

    return groups;
  }
}
