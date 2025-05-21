export function classNames(mapping: Record<string, string>, classes: string): string {
  return classes
    .trim()
    .split(/\s+/)
    .map((className) => mapping[className] ?? className)
    .join(' ');
}

export function join(...parts: Array<string>): string {
  return parts.join('');
}
