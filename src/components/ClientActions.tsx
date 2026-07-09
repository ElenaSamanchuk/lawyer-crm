import type { Client } from '../types';
import { buildReminderMessage, telegramShareLink, whatsAppLink } from '../lib/messages';

type ClientActionsProps = {
  client: Client;
  pendingDelete: boolean;
  menuUp?: boolean;
  onMarkContact: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
};

export function ClientActions({
  client,
  pendingDelete,
  menuUp = false,
  onMarkContact,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: ClientActionsProps) {
  const message = buildReminderMessage(client);

  if (pendingDelete) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-danger btn-sm" onClick={onDeleteConfirm}>
          Подтвердить удаление
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDeleteCancel}>
          Отмена
        </button>
      </div>
    );
  }

  return (
    <details className="action-menu">
      <summary>Действия</summary>
      <div
        className={`action-menu__panel ${menuUp ? 'action-menu__panel--up' : ''}`}
        role="menu"
      >
        <a
          className="action-menu__item"
          href={whatsAppLink(client.phone, message)}
          target="_blank"
          rel="noreferrer"
          role="menuitem"
        >
          Напомнить в WhatsApp
        </a>
        <a
          className="action-menu__item"
          href={telegramShareLink(message)}
          target="_blank"
          rel="noreferrer"
          role="menuitem"
        >
          Напомнить в Telegram
        </a>
        <button
          type="button"
          className="action-menu__item"
          onClick={onMarkContact}
          role="menuitem"
        >
          Отметить контакт
        </button>
        <button
          type="button"
          className="action-menu__item action-menu__item--danger"
          onClick={onDeleteRequest}
          role="menuitem"
        >
          Удалить клиента
        </button>
      </div>
    </details>
  );
}
