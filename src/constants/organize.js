export const CATEGORY_NAMES = Object.freeze({
  DOCUMENTS: 'Documents',
  IMAGES: 'Images',
  ARCHIVES: 'Archives',
  CODE: 'Code',
  VIDEOS: 'Videos',
  OTHER: 'Other',
});

export const CATEGORIES = Object.freeze({
  [CATEGORY_NAMES.DOCUMENTS]: Object.freeze([
    '.pdf',
    '.docx',
    '.doc',
    '.txt',
    '.md',
    '.xlsx',
    '.pptx',
  ]),
  [CATEGORY_NAMES.IMAGES]: Object.freeze([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
    '.bmp',
  ]),
  [CATEGORY_NAMES.ARCHIVES]: Object.freeze([
    '.zip',
    '.rar',
    '.tar',
    '.gz',
    '.7z',
  ]),
  [CATEGORY_NAMES.CODE]: Object.freeze([
    '.js',
    '.py',
    '.java',
    '.cpp',
    '.html',
    '.css',
    '.json',
  ]),
  [CATEGORY_NAMES.VIDEOS]: Object.freeze([
    '.mp4',
    '.avi',
    '.mkv',
    '.mov',
    '.webm',
  ]),
  [CATEGORY_NAMES.OTHER]: Object.freeze([]),
});

export const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024;
