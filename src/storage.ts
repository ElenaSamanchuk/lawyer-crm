import type { ActivityEntry, Client } from './types';
import { defaultChecklist } from './lib/checklist';
import { defaultFollowUpDate } from './lib/dates';
import { createActivity } from './lib/activity';

const KEY = 'lawyer-crm-clients-v3';

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
  const caseType = raw.caseType ?? 'Консультация';

  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name?.trim() || 'Без имени',
    phone: raw.phone?.trim() || '',
    email: raw.email?.trim() ?? '',
    status: raw.status ?? 'new',
    caseType,
    priority: raw.priority ?? 'normal',
    followUpDate: raw.followUpDate ?? defaultFollowUpDate(),
    notes: raw.notes ?? '',
    checklist: Array.isArray(raw.checklist) ? raw.checklist : defaultChecklist(caseType),
    activity: Array.isArray(raw.activity) ? raw.activity : [
      createActivity('created', 'Клиент импортирован в систему'),
    ],
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

  const today = new Date().toISOString().slice(0, 10);

  return [
    makeSeed({
      name: 'Анна Петрова',
      phone: '+375291234567',
      email: 'anna.petrova@mail.ru',
      status: 'active',
      caseType: 'Договор',
      priority: 'high',
      followUpDate: followSoon.toISOString().slice(0, 10),
      notes: 'Нужно согласовать допсоглашение к договору аренды до конца недели.',
      createdAt: now,
      lastContactAt: now,
    }),
    makeSeed({
      name: 'ИП «Север»',
      phone: '+375339001122',
      email: 'info@sever.by',
      status: 'new',
      caseType: 'Консультация',
      priority: 'normal',
      followUpDate: today,
      notes: 'Первичный запрос по регистрации товарного знака.',
      createdAt: now,
      lastContactAt: weekAgo.toISOString(),
    }),
    makeSeed({
      name: 'ООО «Вектор»',
      phone: '+79991234567',
      email: 'legal@vector.ru',
      status: 'active',
      caseType: 'Суд',
      priority: 'high',
      followUpDate: overdue.toISOString().slice(0, 10),
      notes: 'Подготовить позицию к заседанию 15.07. Запросить выписку из ЕГРЮЛ.',
      createdAt: now,
      lastContactAt: weekAgo.toISOString(),
      checklistDone: 2,
    }),
  ];
}

function makeSeed(input: {
  name: string;
  phone: string;
  email: string;
  status: Client['status'];
  caseType: string;
  priority: Client['priority'];
  followUpDate: string;
  notes: string;
  createdAt: string;
  lastContactAt: string;
  checklistDone?: number;
}): Client {
  const checklist = defaultChecklist(input.caseType).map((item, index) => ({
    ...item,
    done: index < (input.checklistDone ?? 0),
  }));

  const activity: ActivityEntry[] = [
    createActivity('created', `Клиент добавлен · ${input.caseType}`),
    createActivity('note_saved', 'Добавлена первая заметка по делу'),
  ];

  return {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    email: input.email,
    status: input.status,
    caseType: input.caseType,
    priority: input.priority,
    followUpDate: input.followUpDate,
    notes: input.notes,
    checklist,
    activity,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    lastContactAt: input.lastContactAt,
  };
}
