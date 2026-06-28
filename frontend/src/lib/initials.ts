export function getInitials(nameOrEmail: string): string {
  const value = (nameOrEmail ?? '').trim();
  if (!value) return '?';
  const parts = value.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
