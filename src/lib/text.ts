export function clip(text: string, max: number): string {
  const chars = [...text.trim()];
  if (chars.length <= max) return chars.join('');
  return `${chars.slice(0, max).join('')}…`;
}

export function charCount(text: string): number {
  return [...text.replace(/\s/g, '')].length;
}

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (const ch of input) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function revisionStats(original: string, edited: string): {
  changed: boolean;
  added: number;
  removed: number;
} {
  const a = [...original.trim()];
  const b = [...edited.trim()];
  if (a.join('') === b.join('')) return { changed: false, added: 0, removed: 0 };
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let endA = a.length - 1;
  let endB = b.length - 1;
  while (endA >= start && endB >= start && a[endA] === b[endB]) {
    endA -= 1;
    endB -= 1;
  }
  return {
    changed: true,
    removed: endA - start + 1,
    added: endB - start + 1,
  };
}
