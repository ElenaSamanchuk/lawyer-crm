import type { Client } from './types';

const KEY = 'lawyer-crm-clients-v1';

export function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedClients();
    const parsed = JSON.parse(raw) as Client[];
    return Array.isArray(parsed) ? parsed : seedClients();
  } catch {
    return seedClients();
  }
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(KEY, JSON.stringify(clients));
}

function seedClients(): Client[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      name: 'Анна Петрова',
      phone: '+375 29 123-45-67',
      status: 'active',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'ИП «Север»',
      phone: '+375 33 900-11-22',
      status: 'new',
      createdAt: now,
    },
  ];
}
