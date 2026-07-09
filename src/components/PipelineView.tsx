import type { CaseStatus, Client } from '../types';
import { STATUS_LABELS, STATUS_ORDER } from '../types';
import { daysUntil } from '../lib/dates';
import { formatPhone } from '../lib/format';
import { ClientAvatar } from './ui/ClientAvatar';
import { PriorityBadge } from './ui/PriorityBadge';

type PipelineViewProps = {
  clients: Client[];
  onSelect: (client: Client) => void;
  onStatusChange: (id: string, status: CaseStatus) => void;
};

export function PipelineView({ clients, onSelect, onStatusChange }: PipelineViewProps) {
  const columns = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    clients: clients.filter((client) => client.status === status),
  }));

  const handleDrop = (clientId: string, status: CaseStatus) => {
    onStatusChange(clientId, status);
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="section-title text-xl">Воронка дел</h2>
        <p className="section-hint">
          Перетащите карточку между колонками, чтобы сменить статус. Клик — открыть карточку клиента.
        </p>
      </div>
      <div className="pipeline">
        {columns.map((column) => (
          <div
            key={column.status}
            className="pipeline__column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const clientId = event.dataTransfer.getData('text/client-id');
              if (clientId) handleDrop(clientId, column.status);
            }}
          >
            <div className="pipeline__head">
              <h3 className="pipeline__title">{column.label}</h3>
              <span className="pipeline__count">{column.clients.length}</span>
            </div>
            <div className="pipeline__list">
              {column.clients.length === 0 ? (
                <p className="pipeline__empty">Перетащите сюда дело</p>
              ) : (
                column.clients.map((client) => {
                  const dueIn = daysUntil(client.followUpDate);
                  return (
                    <article
                      key={client.id}
                      className="pipeline-card"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/client-id', client.id);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                    >
                      <button type="button" className="pipeline-card__button" onClick={() => onSelect(client)}>
                        <div className="flex items-start gap-3">
                          <ClientAvatar name={client.name} size="sm" />
                          <div className="min-w-0 text-left">
                            <p className="truncate font-semibold text-ink">{client.name}</p>
                            <p className="truncate text-xs text-muted">{client.caseType}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <PriorityBadge priority={client.priority} />
                          <span className="text-xs font-medium text-muted">
                            {dueIn < 0 ? `−${Math.abs(dueIn)} дн.` : dueIn === 0 ? 'Сегодня' : `${dueIn} дн.`}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-xs text-muted">{formatPhone(client.phone)}</p>
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
