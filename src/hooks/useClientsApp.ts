import { useCallback, useMemo, useState } from 'react';
import { createActivity, prependActivity } from '../lib/activity';
import { createClientFromDraft, draftFromClient, updateClientFromDraft } from '../lib/clientFactory';
import { buildReminderMessage, whatsAppLink } from '../lib/messages';
import { notifyLawyer } from '../lib/notifications';
import { loadClients, saveClients } from '../storage';
import {
  STATUS_LABELS,
  type CaseStatus,
  type Client,
  type ClientDraft,
} from '../types';

type ToastState = {
  message: string;
  action?: { label: string; href: string };
};

export function useClientsApp() {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [toast, setToast] = useState<ToastState | null>(null);

  const persist = useCallback((next: Client[]) => {
    setClients(next);
    saveClients(next);
  }, []);

  const showToast = useCallback((state: ToastState) => {
    setToast(state);
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const updateOne = useCallback(
    (id: string, updater: (client: Client) => Client) => {
      persist(clients.map((client) => (client.id === id ? updater(client) : client)));
    },
    [clients, persist],
  );

  const addClient = useCallback(
    async (draft: ClientDraft) => {
      const client = createClientFromDraft(draft);
      persist([client, ...clients]);

      const notified = await notifyLawyer(
        'Новый клиент в LexDesk',
        `${client.name} · ${client.caseType} · ${STATUS_LABELS[client.status]}`,
      );

      showToast({
        message: notified
          ? `«${client.name}» добавлен · уведомление отправлено`
          : `«${client.name}» добавлен`,
        action: {
          label: 'Написать в WhatsApp',
          href: whatsAppLink(client.phone, buildReminderMessage(client)),
        },
      });

      return client.id;
    },
    [clients, persist, showToast],
  );

  const editClient = useCallback(
    (id: string, draft: ClientDraft) => {
      const prev = clients.find((client) => client.id === id);
      if (!prev) return;

      const next = updateClientFromDraft(prev, draft);
      persist(clients.map((client) => (client.id === id ? next : client)));
      showToast({ message: `Карточка «${next.name}» сохранена` });
    },
    [clients, persist, showToast],
  );

  const changeStatus = useCallback(
    (id: string, status: CaseStatus) => {
      const prev = clients.find((client) => client.id === id);
      if (!prev || prev.status === status) return;

      const now = new Date().toISOString();
      updateOne(id, (client) => ({
        ...client,
        status,
        updatedAt: now,
        activity: prependActivity(
          client.activity,
          createActivity(
            'status_changed',
            `Статус: ${STATUS_LABELS[prev.status]} → ${STATUS_LABELS[status]}`,
          ),
        ),
      }));

      void notifyLawyer(
        'Статус дела изменён',
        `${prev.name}: ${STATUS_LABELS[prev.status]} → ${STATUS_LABELS[status]}`,
      );

      showToast({
        message: `${prev.name}: ${STATUS_LABELS[prev.status]} → ${STATUS_LABELS[status]}`,
      });
    },
    [clients, showToast, updateOne],
  );

  const deleteClient = useCallback(
    (id: string) => {
      const removed = clients.find((client) => client.id === id);
      persist(clients.filter((client) => client.id !== id));
      if (removed) showToast({ message: `Клиент «${removed.name}» удалён` });
    },
    [clients, persist, showToast],
  );

  const markContact = useCallback(
    (id: string) => {
      const prev = clients.find((client) => client.id === id);
      if (!prev) return;

      const now = new Date().toISOString();
      updateOne(id, (client) => ({
        ...client,
        lastContactAt: now,
        updatedAt: now,
        activity: prependActivity(
          client.activity,
          createActivity('contact_marked', 'Отмечен контакт с клиентом'),
        ),
      }));

      showToast({ message: `Контакт с «${prev.name}» отмечен` });
    },
    [clients, showToast, updateOne],
  );

  const saveNotes = useCallback(
    (id: string, notes: string) => {
      const now = new Date().toISOString();
      updateOne(id, (client) => ({
        ...client,
        notes,
        updatedAt: now,
        activity: prependActivity(
          client.activity,
          createActivity('note_saved', 'Заметка по делу обновлена'),
        ),
      }));
      showToast({ message: 'Заметка сохранена' });
    },
    [showToast, updateOne],
  );

  const toggleChecklistItem = useCallback(
    (id: string, itemId: string) => {
      const now = new Date().toISOString();
      updateOne(id, (client) => {
        const checklist = client.checklist.map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item,
        );

        const item = client.checklist.find((entry) => entry.id === itemId);
        const toggled = checklist.find((entry) => entry.id === itemId);

        return {
          ...client,
          checklist,
          updatedAt: now,
          activity: prependActivity(
            client.activity,
            createActivity(
              'checklist_updated',
              item && toggled
                ? `${toggled.done ? 'Выполнено' : 'Снято'}: ${item.label}`
                : 'Чеклист обновлён',
            ),
          ),
        };
      });
    },
    [updateOne],
  );

  const setFollowUpDate = useCallback(
    (id: string, followUpDate: string) => {
      const now = new Date().toISOString();
      updateOne(id, (client) => ({
        ...client,
        followUpDate,
        updatedAt: now,
        activity: prependActivity(
          client.activity,
          createActivity('follow_up_changed', `Следующий контакт: ${followUpDate}`),
        ),
      }));
      showToast({ message: 'Дата следующего контакта обновлена' });
    },
    [showToast, updateOne],
  );

  const stats = useMemo(() => {
    const totals = {
      all: clients.length,
      new: 0,
      active: 0,
      closed: 0,
    } as Record<'all' | CaseStatus, number>;

    for (const client of clients) {
      totals[client.status] += 1;
    }

    return totals;
  }, [clients]);

  return {
    clients,
    toast,
    stats,
    showToast,
    clearToast,
    addClient,
    editClient,
    changeStatus,
    deleteClient,
    markContact,
    saveNotes,
    toggleChecklistItem,
    setFollowUpDate,
    draftFromClient,
  };
}
