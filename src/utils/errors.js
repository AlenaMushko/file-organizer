import process from 'node:process';

const FS_ERROR_MESSAGES = {
  ENOENT: (targetPath) => `❌ Error: Directory not found: ${targetPath}`,
  EACCES: (targetPath) => `❌ Error: Permission denied: ${targetPath}`,
  ENOTDIR: (targetPath) => `❌ Error: Path is not a directory: ${targetPath}`,
};

function formatFsError(error, targetPath) {
  const format = FS_ERROR_MESSAGES[error.code];

  if (format) {
    return format(targetPath);
  }

  return `❌ Unexpected error: ${error.message}`;
}

export function createFsError(code, targetPath) {
  const error = new Error(formatFsError({ code }, targetPath));
  error.code = code;
  return error;
}

export async function runCommand(fn, targetPath) {
  try {
    return await fn();
  } catch (error) {
    console.error(formatFsError(error, targetPath));
    process.exit(1);
  }
}
