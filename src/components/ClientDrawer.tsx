import { useEffect, useState } from 'react';
import type { Client } from '../types';
import { checklistProgress } from '../lib/checklist';
import { daysSince, daysUntil } from '../lib/dates';
import { formatPhone, formatShortDate } from '../lib/format';
import { buildReminderMessage, telegramShareLink, whatsAppLink } from '../lib/messages';
import { ActivityTimeline } from './ActivityTimeline';
import { ClientActions } from './ClientActions';
import { ClientAvatar } from './ui/ClientAvatar';
import { PriorityBadge } from './ui/PriorityBadge';
import { StatusSelect } from './ui/StatusSelect';
import type { CaseStatus } from '../types';

type ClientDrawerProps = {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onStatusChange: (status: CaseStatus) => void;
  onMarkContact: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  pendingDelete: boolean;
  onSaveNotes: (notes: string) => void;
  onToggleChecklist: (itemId: string) => void;
  onFollowUpChange: (date: string) => void;
};

export function ClientDrawer({
  client,
  open,
  onClose,
  onEdit,
  onStatusChange,
  onMarkContact,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  pendingDelete,
  onSaveNotes,
  onToggleChecklist,
  onFollowUpChange,
}: ClientDrawerProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) setNotes(client.notes);
  }, [client]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !client) return null;

  const progress = checklistProgress(client.checklist);
  const dueIn = daysUntil(client.followUpDate);
  const message = buildReminderMessage(client);

  return (
    <div className="drawer-root" role="presentation" onClick={onClose}>
      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Карточка клиента ${client.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <div className="flex items-start gap-3">
            <ClientAvatar name={client.name} size="lg" />
            <div className="min-w-0">
              <h2 className="break-anywhere font-serif text-2xl font-bold text-brand">{client.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="case-tag">{client.caseType}</span>
                <PriorityBadge priority={client.priority} />
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <section className="drawer-section">
            <h3 className="drawer-section__title">Контакты</h3>
            <div className="drawer-kv">
              <a className="drawer-link" href={`tel:${client.phone}`}>
                {formatPhone(client.phone)}
              </a>
              {client.email ? (
                <a className="drawer-link" href={`mailto:${client.email}`}>
                  {client.email}
                </a>
              ) : (
                <p className="text-sm text-muted">Email не указан</p>
              )}
            </div>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section__title">Статус и сроки</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Статус дела</p>
                <div className="mt-2">
                  <StatusSelect
                    value={client.status}
                    label={`Статус для ${client.name}`}
                    onChange={onStatusChange}
                    compact
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Следующий контакт</p>
                <input
                  type="date"
                  className="field-date mt-2"
                  value={client.followUpDate}
                  onChange={(e) => onFollowUpChange(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted">
                  {dueIn < 0
                    ? `Просрочено ${Math.abs(dueIn)} дн.`
                    : dueIn === 0
                      ? 'Сегодня'
                      : `Через ${dueIn} дн.`}
                  {' · '}
                  без контакта {daysSince(client.lastContactAt)} дн.
                </p>
              </div>
            </div>
          </section>

          <section className="drawer-section">
            <div className="flex items-center justify-between gap-3">
              <h3 className="drawer-section__title">Чеклист по делу</h3>
              <span className="text-xs font-semibold text-muted">{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <ul className="checklist mt-4">
              {client.checklist.map((item) => (
                <li key={item.id}>
                  <label className="checklist__item">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => onToggleChecklist(item.id)}
                    />
                    <span className={item.done ? 'checklist__label checklist__label--done' : 'checklist__label'}>
                      {item.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section__title">Заметка</h3>
            <textarea
              className="field-textarea mt-2"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Контекст дела, договорённости, следующие шаги…"
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-3"
              onClick={() => onSaveNotes(notes)}
            >
              Сохранить заметку
            </button>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section__title">Быстрые действия</h3>
            <div className="flex flex-wrap gap-2">
              <a className="btn btn-secondary btn-sm" href={whatsAppLink(client.phone, message)} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <a className="btn btn-secondary btn-sm" href={telegramShareLink(message)} target="_blank" rel="noreferrer">
                Telegram
              </a>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(client)}>
                Редактировать
              </button>
            </div>
            <div className="mt-3">
              <ClientActions
                client={client}
                pendingDelete={pendingDelete}
                onMarkContact={onMarkContact}
                onDeleteRequest={onDeleteRequest}
                onDeleteConfirm={onDeleteConfirm}
                onDeleteCancel={onDeleteCancel}
              />
            </div>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section__title">История</h3>
            <ActivityTimeline items={client.activity} compact />
            <p className="mt-3 text-xs text-muted">
              Создан {formatShortDate(client.createdAt)} · обновлён {formatShortDate(client.updatedAt)}
            </p>
          </section>
        </div>
      </aside>
    </div>
  );
}
