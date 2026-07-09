export function clientInitials(name: string): string {
  const cleaned = name.replace(/[«»"']/g, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase();
}
