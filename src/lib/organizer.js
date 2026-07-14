import fs from 'node:fs/promises';
import path from 'node:path';
import { EventEmitter } from 'node:events';

import {
  ORGANIZE_CATEGORY_ORDER,
} from '../constants/organize.js';
import { getFileCategory } from '../utils/category.js';
import { copyFileSmart, resolveUniquePath } from '../utils/copy.js';
import {
  collectFiles,
  forEachFile,
  resolveTargetDirectory,
  validateDirectory,
} from '../utils/fs.js';

export class Organizer extends EventEmitter {
  async organize(sourceDirectory, outputDirectory) {
    const source = resolveTargetDirectory(sourceDirectory);
    const output = resolveTargetDirectory(outputDirectory);

    await validateDirectory(source);

    const files = await collectFiles(source, (data) =>
      this.emit('copy-error', data)
    );
    const stats = this.createEmptyStats(source, output);

    this.emit('organize-start', {
      source,
      output,
      totalFiles: files.length,
    });

    await this.createCategoryFolders(output);

    this.emit('folders-created', {
      output,
      categories: ORGANIZE_CATEGORY_ORDER,
    });

    await forEachFile(
      files,
      async (filePath) => {
        const fileStats = await fs.stat(filePath);
        const extension = path.extname(filePath);
        const category = getFileCategory(extension);
        const fileName = path.basename(filePath);
        const categoryDirectory = path.join(output, category);
        const initialTarget = path.join(categoryDirectory, fileName);
        const targetPath = await resolveUniquePath(initialTarget);

        this.emit('copy-start', {
          source: filePath,
          target: targetPath,
          category,
        });

        await copyFileSmart(filePath, targetPath);

        stats.byCategory[category].count += 1;
        stats.byCategory[category].totalSize += fileStats.size;
        stats.totalCopied += 1;
        stats.totalSize += fileStats.size;

        this.emit('copy-complete', {
          source: filePath,
          target: targetPath,
          category,
          size: fileStats.size,
        });
      },
      (data) => this.emit('copy-error', data)
    );

    this.emit('organize-complete', stats);
    return stats;
  }

  async createCategoryFolders(outputDirectory) {
    await fs.mkdir(outputDirectory, { recursive: true });

    for (const category of ORGANIZE_CATEGORY_ORDER) {
      await fs.mkdir(path.join(outputDirectory, category), { recursive: true });
    }
  }

  createEmptyStats(source, output) {
    const byCategory = {};

    for (const category of ORGANIZE_CATEGORY_ORDER) {
      byCategory[category] = {
        count: 0,
        totalSize: 0,
      };
    }

    return {
      source,
      output,
      byCategory,
      totalCopied: 0,
      totalSize: 0,
    };
  }
}
