import { useMemo, useState } from 'react';
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type CaseStatus,
  type Client,
} from '../types';
import { daysSince, daysUntil, isOverdue, isStaleContact } from '../lib/dates';
import { buildReminderMessage, telegramShareLink, whatsAppLink } from '../lib/messages';

type SortKey = 'name' | 'followUpDate' | 'status';

type ClientTableProps = {
  clients: Client[];
  onStatusChange: (id: string, status: CaseStatus) => void;
  onDelete: (id: string) => void;
  onMarkContact: (id: string) => void;
};

function formatPhone(phone: string): string {
  if (phone.startsWith('+375') && phone.length >= 12) {
    const d = phone.replace(/\D/g, '');
    return `+375 ${d.slice(3, 5)} ${d.slice(5, 8)}-${d.slice(8, 10)}-${d.slice(10, 12)}`;
  }
  return phone;
}

export function ClientTable({
  clients,
  onStatusChange,
  onDelete,
  onMarkContact,
}: ClientTableProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('followUpDate');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients.filter((client) => {
      const matchesQuery =
        !q ||
        client.name.toLowerCase().includes(q) ||
        client.phone.includes(q) ||
        client.caseType.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'ru');
      if (sortKey === 'status') {
        return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      }
      return a.followUpDate.localeCompare(b.followUpDate);
    });

    return list;
  }, [clients, query, sortKey, statusFilter]);

  return (
    <section className="rounded-2xl border border-line bg-white shadow-panel">
      <div className="border-b border-line p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-brand">Клиенты</h2>
            <p className="mt-1 text-sm text-muted">
              {filtered.length} из {clients.length} · поиск, фильтр, напоминания
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <input
              className="field-input min-w-[220px]"
              placeholder="Поиск по имени, телефону, делу…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Поиск клиентов"
            />
            <select
              className="field-input min-w-[160px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
              aria-label="Фильтр по статусу"
            >
              <option value="all">Все статусы</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <select
              className="field-input min-w-[180px]"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Сортировка"
            >
              <option value="followUpDate">По дате контакта</option>
              <option value="name">По имени</option>
              <option value="status">По статусу</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-serif text-lg text-brand">Нет клиентов по фильтру</p>
          <p className="mt-2 text-sm text-muted">
            Измените поиск или добавьте нового клиента в форме выше.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold sm:px-6">Клиент</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Контакт</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Дело</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Статус</th>
                <th className="px-4 py-3 font-semibold sm:px-6">След. шаг</th>
                <th className="px-4 py-3 font-semibold sm:px-6">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((client) => {
                const overdue = isOverdue(client);
                const stale = isStaleContact(client);
                const message = buildReminderMessage(client);

                return (
                  <tr
                    key={client.id}
                    className={overdue ? 'bg-red-50/60' : stale ? 'bg-amber-50/50' : undefined}
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <p className="font-semibold text-ink">{client.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        в базе с {new Date(client.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <a
                        className="font-medium text-accent hover:underline"
                        href={`tel:${client.phone}`}
                      >
                        {formatPhone(client.phone)}
                      </a>
                      <p className="mt-0.5 text-xs text-muted">
                        без контакта {daysSince(client.lastContactAt)} дн.
                      </p>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <span className="rounded-md bg-canvas px-2 py-1 text-xs font-medium text-ink">
                        {client.caseType}
                      </span>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <select
                        className="field-input max-w-[150px] py-1.5 text-xs font-semibold"
                        value={client.status}
                        aria-label={`Статус для ${client.name}`}
                        onChange={(e) =>
                          onStatusChange(client.id, e.target.value as CaseStatus)
                        }
                      >
                        {STATUS_ORDER.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <p className="font-medium">
                        {new Date(client.followUpDate).toLocaleDateString('ru-RU')}
                      </p>
                      {overdue ? (
                        <span className="status-pill status-pill--active mt-1 bg-red-100 text-red-800">
                          просрочено {Math.abs(daysUntil(client.followUpDate))} дн.
                        </span>
                      ) : daysUntil(client.followUpDate) === 0 ? (
                        <span className="status-pill status-pill--active mt-1">сегодня</span>
                      ) : (
                        <p className="mt-0.5 text-xs text-muted">
                          через {daysUntil(client.followUpDate)} дн.
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex min-w-[220px] flex-wrap gap-2">
                        <a
                          className="btn btn-secondary px-3 py-1.5 text-xs"
                          href={whatsAppLink(client.phone, message)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                        <a
                          className="btn btn-secondary px-3 py-1.5 text-xs"
                          href={telegramShareLink(message)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Telegram
                        </a>
                        <button
                          type="button"
                          className="btn btn-ghost px-3 py-1.5 text-xs"
                          onClick={() => onMarkContact(client.id)}
                        >
                          Контакт был
                        </button>
                        {pendingDeleteId === client.id ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-danger px-3 py-1.5 text-xs"
                              onClick={() => {
                                onDelete(client.id);
                                setPendingDeleteId(null);
                              }}
                            >
                              Удалить
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost px-3 py-1.5 text-xs"
                              onClick={() => setPendingDeleteId(null)}
                            >
                              Отмена
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-ghost px-3 py-1.5 text-xs text-red-600"
                            onClick={() => setPendingDeleteId(client.id)}
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
