import fs from 'node:fs/promises';
import path from 'node:path';
import { EventEmitter } from 'node:events';

import {
  forEachFile,
  getFileAgeInDays,
  prepareDirectoryScan,
} from '../utils/fs.js';

export class Scanner extends EventEmitter {
  async scan(directory) {
    const { targetDirectory, files } = await prepareDirectoryScan(
      directory,
      (data) => this.emit('file-error', data)
    );
    const stats = this.createEmptyStats(targetDirectory);

    this.emit('scan-start', {
      directory: targetDirectory,
      totalFiles: files.length,
    });

    await forEachFile(
      files,
      async (filePath) => {
        const fileStats = await fs.stat(filePath);
        const fileData = this.createFileData(filePath, fileStats);

        this.updateStats(stats, fileData);
        this.emit('file-found', fileData);
      },
      (data) => this.emit('file-error', data)
    );

    stats.largestFiles.sort((a, b) => b.size - a.size);
    stats.largestFiles = stats.largestFiles.slice(0, 3);
    stats.extensions = Object.fromEntries(stats.extensions);

    this.emit('scan-complete', stats);
    return stats;
  }

  createEmptyStats(directory) {
    return {
      directory,
      totalFiles: 0,
      totalSize: 0,
      extensions: new Map(),
      age: {
        last7Days: 0,
        last30Days: 0,
        olderThan90Days: 0,
      },
      largestFiles: [],
      oldestFile: null,
    };
  }

  createFileData(filePath, fileStats) {
    const daysOld = getFileAgeInDays(fileStats.mtime);

    return {
      path: filePath,
      name: path.basename(filePath),
      extension: path.extname(filePath).toLowerCase() || '(other)',
      size: fileStats.size,
      modifiedAt: fileStats.mtime,
      daysOld,
    };
  }

  updateStats(stats, fileData) {
    stats.totalFiles += 1;
    stats.totalSize += fileData.size;

    const extensionStats = stats.extensions.get(fileData.extension) ?? {
      count: 0,
      totalSize: 0,
    };

    extensionStats.count += 1;
    extensionStats.totalSize += fileData.size;
    stats.extensions.set(fileData.extension, extensionStats);

    if (fileData.daysOld <= 7) {
      stats.age.last7Days += 1;
    }

    if (fileData.daysOld <= 30) {
      stats.age.last30Days += 1;
    }

    if (fileData.daysOld > 90) {
      stats.age.olderThan90Days += 1;
    }

    stats.largestFiles.push(fileData);

    if (!stats.oldestFile || fileData.modifiedAt < stats.oldestFile.modifiedAt) {
      stats.oldestFile = fileData;
    }
  }
}
