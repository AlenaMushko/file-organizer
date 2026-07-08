import process from 'node:process';

import {
  COMMANDS,
  COMMAND_NAMES,
} from './src/constants/commands.js';
import { isHelpFlag, renderGlobalHelp } from './src/utils/cli.js';

function printHelp(exitCode = 0) {
  console.log(renderGlobalHelp());
  process.exit(exitCode);
}

const argv = process.argv.slice(2);
const command = argv[0];

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

switch (command) {
  case COMMAND_NAMES.SCAN: {
    console.log('SCAN');
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

