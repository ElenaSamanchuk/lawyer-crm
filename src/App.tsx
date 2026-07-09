import { useMemo, useState } from 'react';
import { ClientForm } from './components/ClientForm';
import { ClientTable } from './components/ClientTable';
import { StatsBar } from './components/StatsBar';
import { Toast } from './components/Toast';
import { isOverdue } from './lib/dates';
import { buildReminderMessage, whatsAppLink } from './lib/messages';
import { notifyLawyer } from './lib/notifications';
import { loadClients, saveClients } from './storage';
import {
  STATUS_LABELS,
  type CaseStatus,
  type Client,
  type ClientDraft,
} from './types';

type ToastState = {
  message: string;
  action?: { label: string; href: string };
};

function countByStatus(clients: Client[], status: CaseStatus): number {
  return clients.filter((c) => c.status === status).length;
}

export default function App() {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [toast, setToast] = useState<ToastState | null>(null);

  const totals = useMemo(
    () => ({
      all: clients.length,
      new: countByStatus(clients, 'new'),
      active: countByStatus(clients, 'active'),
      closed: countByStatus(clients, 'closed'),
    }),
    [clients],
  );

  const overdueCount = useMemo(
    () => clients.filter((client) => isOverdue(client)).length,
    [clients],
  );

  const persist = (next: Client[]) => {
    setClients(next);
    saveClients(next);
  };

  const showToast = (state: ToastState) => {
    setToast(state);
    window.setTimeout(() => setToast(null), 4500);
  };

  const handleAdd = async (draft: ClientDraft) => {
    const now = new Date().toISOString();
    const client: Client = {
      id: crypto.randomUUID(),
      name: draft.name,
      phone: draft.phone,
      status: draft.status,
      caseType: draft.caseType,
      followUpDate: draft.followUpDate,
      createdAt: now,
      updatedAt: now,
      lastContactAt: now,
    };

    persist([client, ...clients]);

    const notified = await notifyLawyer(
      'Новый клиент в LexDesk',
      `${client.name} · ${client.caseType} · ${STATUS_LABELS[client.status]}`,
    );

    const message = buildReminderMessage(client);
    showToast({
      message: notified
        ? `«${client.name}» добавлен · браузерное уведомление отправлено`
        : `«${client.name}» добавлен · можно сразу написать клиенту`,
      action: {
        label: 'Открыть WhatsApp с шаблоном',
        href: whatsAppLink(client.phone, message),
      },
    });
  };

  const handleStatusChange = (id: string, status: CaseStatus) => {
    const prev = clients.find((c) => c.id === id);
    if (!prev || prev.status === status) return;

    const now = new Date().toISOString();
    persist(
      clients.map((c) =>
        c.id === id ? { ...c, status, updatedAt: now } : c,
      ),
    );

    void notifyLawyer(
      'Статус дела изменён',
      `${prev.name}: ${STATUS_LABELS[prev.status]} → ${STATUS_LABELS[status]}`,
    );

    showToast({
      message: `${prev.name}: ${STATUS_LABELS[prev.status]} → ${STATUS_LABELS[status]}`,
    });
  };

  const handleDelete = (id: string) => {
    const removed = clients.find((c) => c.id === id);
    persist(clients.filter((c) => c.id !== id));
    if (removed) {
      showToast({ message: `Клиент «${removed.name}» удалён` });
    }
  };

  const handleMarkContact = (id: string) => {
    const now = new Date().toISOString();
    persist(
      clients.map((c) =>
        c.id === id ? { ...c, lastContactAt: now, updatedAt: now } : c,
      ),
    );
    const client = clients.find((c) => c.id === id);
    if (client) {
      showToast({ message: `Контакт с «${client.name}» отмечен сегодня` });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Прототип · тестовое задание
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">LexDesk</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
              Рабочий стол юриста: клиенты, статусы дел, контроль сроков и быстрые напоминания в
              WhatsApp / Telegram. Данные хранятся локально в браузере.
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
            <p className="font-semibold">Сегодня в фокусе</p>
            <p className="mt-1 text-white/85">
              {overdueCount > 0
                ? `${overdueCount} дел с просроченным контактом`
                : 'Просроченных контактов нет'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <StatsBar totals={totals} overdueCount={overdueCount} />
        <ClientForm onSubmit={handleAdd} />
        <ClientTable
          clients={clients}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onMarkContact={handleMarkContact}
        />

        <section className="rounded-2xl border border-dashed border-line bg-white/70 p-5 text-sm text-muted">
          <h3 className="font-semibold text-ink">Бонус: автоматизация</h3>
          <p className="mt-2 leading-relaxed">
            При добавлении клиента и смене статуса отправляется браузерное уведомление (если
            разрешено). Кнопки WhatsApp и Telegram открывают готовый текст с подстановкой имени,
            типа дела и даты следующего шага — без ручного копирования.
          </p>
        </section>
      </main>

      {toast ? (
        <Toast
          message={toast.message}
          action={toast.action}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
