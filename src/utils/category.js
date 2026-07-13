import {
  CATEGORIES,
  CATEGORY_NAMES,
} from '../constants/organize.js';

export function getFileCategory(extension) {
  const normalizedExtension = extension.toLowerCase();

  for (const [category, extensions] of Object.entries(CATEGORIES)) {
    if (category === CATEGORY_NAMES.OTHER) {
      continue;
    }

    if (extensions.includes(normalizedExtension)) {
      return category;
    }
  }

  return CATEGORY_NAMES.OTHER;
}
