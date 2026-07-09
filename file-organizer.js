import process from 'node:process';

import {
  COMMANDS,
  COMMAND_NAMES,
} from './src/constants/commands.js';
import { renderScanResults } from './src/formatters/scan.js';
import { Scanner } from './src/lib/scanner.js';
import { isHelpFlag, renderGlobalHelp } from './src/utils/cli.js';
import { drawProgressBar } from './src/utils/format.js';

function printHelp(exitCode = 0) {
  console.log(renderGlobalHelp());
  process.exit(exitCode);
}

const argv = process.argv.slice(2);
const command = argv[0];
const commandArgs = argv.slice(1);

if (!command || isHelpFlag(command)) {
  printHelp(0);
}

if (!(command in COMMANDS)) {
  console.error(`❌ Unknown command: ${command}`);
  printHelp(1);
}

if (commandArgs.some(isHelpFlag)) {
  printHelp(0);
}

function printFileSystemError(error, targetPath) {
  if (error.code === 'ENOENT') {
    console.error(`❌ Error: Directory not found: ${targetPath}`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Error: Permission denied: ${targetPath}`);
  } else if (error.code === 'ENOTDIR') {
    console.error(`❌ Error: Path is not a directory: ${targetPath}`);
  } else {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function runScan(directory) {
  if (!directory) {
    console.error('❌ Error: scan command requires a directory path');
    printHelp(1);
  }

  const scanner = new Scanner();
  let processedFiles = 0;
  let totalFiles = 0;

  scanner.on('scan-start', (data) => {
    totalFiles = data.totalFiles;
    console.log(`📂 Scanning: ${data.directory}`);
    process.stdout.write(`Processing... ${drawProgressBar(0, totalFiles)}`);
  });

  scanner.on('file-found', () => {
    processedFiles += 1;
    process.stdout.write(
      `\rProcessing... ${drawProgressBar(processedFiles, totalFiles)}`
    );
  });

  scanner.on('file-error', ({ path, error }) => {
    process.stdout.write('\n');
    console.error(`⚠️ Skipped file: ${path} (${error.message})`);
  });

  scanner.on('scan-complete', (stats) => {
    process.stdout.write('\n');
    console.log(renderScanResults(stats));
  });

  try {
    await scanner.scan(directory);
  } catch (error) {
    process.stdout.write('\n');
    printFileSystemError(error, directory);
    process.exit(1);
  }
}

switch (command) {
  case COMMAND_NAMES.SCAN: {
    await runScan(commandArgs[0]);
    break;
  }
  case COMMAND_NAMES.DUPLICATES: {
    console.log('DUPLICATES');
    break;
  }
  case COMMAND_NAMES.ORGANIZE: {
    console.log('ORGANIZE');
    break;
  }
  case COMMAND_NAMES.CLEANUP: {
    console.log('CLEANUP');
    break;
  }
  default: {
    printHelp(1);
  }
}

