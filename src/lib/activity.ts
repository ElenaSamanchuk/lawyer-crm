import type { ActivityEntry, ActivityType } from '../types';

export function createActivity(type: ActivityType, message: string): ActivityEntry {
  return {
    id: crypto.randomUUID(),
    type,
    at: new Date().toISOString(),
    message,
  };
}

export function prependActivity(
  activity: ActivityEntry[],
  entry: ActivityEntry,
  limit = 30,
): ActivityEntry[] {
  return [entry, ...activity].slice(0, limit);
}

export function allActivity(clients: { activity: ActivityEntry[] }[]): ActivityEntry[] {
  return clients
    .flatMap((client) => client.activity)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12);
}
