import fs from 'node:fs/promises';
import path from 'node:path';
import { EventEmitter } from 'node:events';

import {
  collectFiles,
  getFileAgeInDays,
  resolveTargetDirectory,
  validateDirectory,
} from '../utils/fs.js';

export class Cleanup extends EventEmitter {
  async findOldFiles(directory, olderThan) {
    const targetDirectory = resolveTargetDirectory(directory);

    await validateDirectory(targetDirectory);

    const files = await collectFiles(targetDirectory, (data) =>
      this.emit('file-error', data)
    );
    const filesToDelete = [];

    for (const filePath of files) {
      try {
        const fileStats = await fs.stat(filePath);
        const daysOld = getFileAgeInDays(fileStats.mtime);

        if (daysOld > olderThan) {
          const fileData = {
            path: filePath,
            name: path.basename(filePath),
            size: fileStats.size,
            daysOld,
            modifiedAt: fileStats.mtime,
          };

          filesToDelete.push(fileData);
          this.emit('file-found', fileData);
        }
      } catch (error) {
        this.emit('file-error', { path: filePath, error });
      }
    }

    return {
      directory: targetDirectory,
      olderThan,
      files: filesToDelete,
      totalSize: filesToDelete.reduce((sum, file) => sum + file.size, 0),
    };
  }

  async deleteFiles(files) {
    const result = {
      deletedCount: 0,
      freedSize: 0,
    };

    if (files.length === 0) {
      return result;
    }

    this.emit('delete-start', { totalFiles: files.length });

    for (const fileData of files) {
      try {
        await fs.unlink(fileData.path);
        result.deletedCount += 1;
        result.freedSize += fileData.size;
        this.emit('file-deleted', fileData);
      } catch (error) {
        this.emit('file-error', { path: fileData.path, error });
      }
    }

    return result;
  }
}
