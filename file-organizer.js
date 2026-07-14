import process from 'node:process';

import {
  COMMANDS,
  COMMAND_NAMES,
} from './src/constants/commands.js';
import { isHelpFlag, renderGlobalHelp } from './src/utils/cli.js';
import { runCommand } from './src/utils/errors.js';
import { runScan } from './src/commands/scan.js';
import { runDuplicates } from './src/commands/duplicates.js';
import { runOrganize } from './src/commands/organize.js';
import { runCleanup } from './src/commands/cleanup.js';

function printHelp(exitCode = 0) {
  console.log(renderGlobalHelp());
  process.exit(exitCode);
}

const argv = process.argv.slice(2);
const command = argv[0];
const folderPath = argv[1];

if (!command || isHelpFlag(command)) {
  printHelp(0);
}

if (!(command in COMMANDS)) {
  console.error(`❌ Unknown command: ${command}`);
  printHelp(1);
}

if (argv.some(isHelpFlag)) {
  printHelp(0);
}

const commandList = Object.keys(COMMAND_NAMES);

if(commandList.includes(command) && !folderPath) {
  console.error(`❌ ${command} command requires a directory path`);
  printHelp(1);
}

await runCommand(async () => {
  switch (command) {
    case COMMAND_NAMES.SCAN: {
      await runScan(folderPath);
      break;
    }
    case COMMAND_NAMES.DUPLICATES: {
      await runDuplicates(folderPath);
      break;
    }
    case COMMAND_NAMES.ORGANIZE: {
      const outputIndex = argv.indexOf('--output');
      const outputPath = outputIndex !== -1 ? argv[outputIndex + 1] : null;

      if (!outputPath) {
        console.error('❌ organize command requires --output <target-directory>');
        printHelp(1);
      }

      await runOrganize(folderPath, outputPath);
      break;
    }
    case COMMAND_NAMES.CLEANUP: {
      const olderThanIndex = argv.indexOf('--older-than');
      const olderThanValue =
        olderThanIndex !== -1 ? Number(argv[olderThanIndex + 1]) : null;
      const confirm = argv.includes('--confirm');

      if (!olderThanValue || Number.isNaN(olderThanValue)) {
        console.error('❌ cleanup command requires --older-than <days>');
        printHelp(1);
      }

      await runCleanup(folderPath, {
        olderThan: olderThanValue,
        confirm,
      });
      break;
    }
    default: {
      printHelp(1);
    }
  }
}, folderPath);