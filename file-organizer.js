import process from 'node:process';

import {
  COMMANDS,
  COMMAND_NAMES,
} from './src/constants/commands.js';
import { isHelpFlag, renderGlobalHelp } from './src/utils/cli.js';
import { runCommand } from './src/utils/errors.js';
import { runScan } from './src/commands/scan.js';

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
}, folderPath);