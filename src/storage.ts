import type { Client } from './types';
import { defaultFollowUpDate } from './lib/dates';

const KEY = 'lawyer-crm-clients-v2';

export function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedClients();
    const parsed = JSON.parse(raw) as Partial<Client>[];
    if (!Array.isArray(parsed)) return seedClients();
    return parsed.map(migrateClient);
  } catch {
    return seedClients();
  }
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(KEY, JSON.stringify(clients));
}

function migrateClient(raw: Partial<Client>): Client {
  const now = new Date().toISOString();
  const createdAt = raw.createdAt ?? now;

  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name?.trim() || 'Без имени',
    phone: raw.phone?.trim() || '',
    status: raw.status ?? 'new',
    caseType: raw.caseType ?? 'Консультация',
    followUpDate: raw.followUpDate ?? defaultFollowUpDate(),
    createdAt,
    updatedAt: raw.updatedAt ?? createdAt,
    lastContactAt: raw.lastContactAt ?? createdAt,
  };
}

function seedClients(): Client[] {
  const now = new Date().toISOString();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 5);

  const followSoon = new Date();
  followSoon.setDate(followSoon.getDate() + 2);

  const overdue = new Date();
  overdue.setDate(overdue.getDate() - 1);

  return [
    {
      id: crypto.randomUUID(),
      name: 'Анна Петрова',
      phone: '+375291234567',
      status: 'active',
      caseType: 'Договор',
      followUpDate: followSoon.toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
      lastContactAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: 'ИП «Север»',
      phone: '+375339001122',
      status: 'new',
      caseType: 'Консультация',
      followUpDate: defaultFollowUpDate(),
      createdAt: now,
      updatedAt: now,
      lastContactAt: weekAgo.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'ООО «Вектор»',
      phone: '+79991234567',
      status: 'active',
      caseType: 'Суд',
      followUpDate: overdue.toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
      lastContactAt: weekAgo.toISOString(),
    },
  ];
}
