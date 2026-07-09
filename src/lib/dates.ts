const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSince(iso: string): number {
  const then = new Date(iso).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((now - then) / DAY_MS);
}

export function daysUntil(dateStr: string): number {
  const then = new Date(`${dateStr}T12:00:00`).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((then - now) / DAY_MS);
}

export function defaultFollowUpDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
}

export function isOverdue(client: { followUpDate: string; status: string }): boolean {
  if (client.status === 'closed') return false;
  return daysUntil(client.followUpDate) < 0;
}

export function isStaleContact(client: { lastContactAt: string; status: string }): boolean {
  if (client.status === 'closed') return false;
  return daysSince(client.lastContactAt) > 3;
}
