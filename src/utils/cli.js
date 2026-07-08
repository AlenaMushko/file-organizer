import { COMMANDS } from '../constants/commands.js';

export function isHelpFlag(value) {
  return value === '--help' || value === '-h';
}

export function renderGlobalHelp({ commands = COMMANDS } = {}) {
  const commandList = Object.entries(commands)
    .map(([name, meta]) => `  ${name.padEnd(10)} ${meta.description}`)
    .join('\n');

  const usageList = Object.values(commands)
    .map((meta) => `  ${meta.usage}`)
    .join('\n');

  return `
file-organizer - CLI tool for analyzing, organizing, and cleaning directories.

Usage:
  node file-organizer.js <command> [args] [options]

Commands:
${commandList}

Command usage:
${usageList}

Global options:
  -h, --help   Show this help message

Examples:
  node file-organizer.js scan ./Downloads
  node file-organizer.js duplicates ./Downloads
  node file-organizer.js organize ./Downloads --output ./Organized
  node file-organizer.js cleanup ./Downloads --older-than 90
  node file-organizer.js cleanup ./Downloads --older-than 90 --confirm
`;
}
