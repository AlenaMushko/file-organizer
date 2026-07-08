export const COMMAND_NAMES = {
  SCAN: 'scan',
  DUPLICATES: 'duplicates',
  ORGANIZE: 'organize',
  CLEANUP: 'cleanup',
};

export const COMMANDS = {
  [COMMAND_NAMES.SCAN]: {
    usage: 'node file-organizer.js scan <directory>',
    description: 'Recursively scans a directory and prints detailed file statistics.',
  },
  [COMMAND_NAMES.DUPLICATES]: {
    usage: 'node file-organizer.js duplicates <directory>',
    description: 'Finds duplicate files by SHA-256 hash.',
  },
  [COMMAND_NAMES.ORGANIZE]: {
    usage: 'node file-organizer.js organize <source> --output <target>',
    description:
      'Copies and sorts files into category folders without removing originals.',
  },
  [COMMAND_NAMES.CLEANUP]: {
    usage:
      'node file-organizer.js cleanup <directory> --older-than <days> [--confirm]',
    description:
      'Finds files older than N days; without --confirm it runs in dry-run mode.',
  },
};
