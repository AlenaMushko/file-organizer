import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

export class Scanner extends EventEmitter {
  async scan(directory) {
    const targetDirectory = path.resolve(directory);
    await this.validateDirectory(targetDirectory);

    const files = await this.getAllFiles(targetDirectory);
    const stats = this.createEmptyStats(targetDirectory);

    this.emit('scan-start', {
      directory: targetDirectory,
      totalFiles: files.length,
    });

    for (const filePath of files) {
      try {
        const fileStats = await fs.stat(filePath);
        const fileData = this.createFileData(filePath, fileStats);

        this.updateStats(stats, fileData);
        this.emit('file-found', fileData);
      } catch (error) {
        this.emit('file-error', { path: filePath, error });
      }
    }

    stats.largestFiles.sort((a, b) => b.size - a.size);
    stats.largestFiles = stats.largestFiles.slice(0, 3);
    stats.extensions = Object.fromEntries(stats.extensions);

    this.emit('scan-complete', stats);
    return stats;
  }

  async validateDirectory(directory) {
    const stats = await fs.stat(directory);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${directory}`);
    }
  }

  async getAllFiles(directory, fileList = []) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await this.getAllFiles(fullPath, fileList);
      } else if (entry.isFile()) {
        fileList.push(fullPath);
      }
    }

    return fileList;
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
    const daysOld = Math.floor(
      (Date.now() - fileStats.mtime.getTime()) / (1000 * 60 * 60 * 24)
    );

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
