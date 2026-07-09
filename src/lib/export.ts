import type { Client } from '../types';
import { STATUS_LABELS } from '../types';
import { formatShortDate } from './format';

export function exportClientsCsv(clients: Client[]): string {
  const header = [
    'Имя',
    'Телефон',
    'Email',
    'Статус',
    'Тип дела',
    'Приоритет',
    'Следующий контакт',
    'Заметки',
    'Последний контакт',
    'Создан',
  ];

  const rows = clients.map((client) => [
    client.name,
    client.phone,
    client.email,
    STATUS_LABELS[client.status],
    client.caseType,
    client.priority,
    formatShortDate(client.followUpDate),
    client.notes.replace(/\n/g, ' '),
    formatShortDate(client.lastContactAt),
    formatShortDate(client.createdAt),
  ]);

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  return [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
}

export function downloadCsv(clients: Client[]): void {
  const csv = exportClientsCsv(clients);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lexdesk-clients-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
