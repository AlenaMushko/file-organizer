export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function pluralizeFile(count) {
  return pluralize(count, 'file');
}
