import type { Client } from '../types';
import { daysUntil, isOverdue, isStaleContact } from '../lib/dates';
import { formatPhone } from '../lib/format';
import { ClientAvatar } from './ui/ClientAvatar';
import { PriorityBadge } from './ui/PriorityBadge';

type QuickClientListProps = {
  title: string;
  hint: string;
  clients: Client[];
  emptyText: string;
  onSelect: (client: Client) => void;
};

export function QuickClientList({
  title,
  hint,
  clients,
  emptyText,
  onSelect,
}: QuickClientListProps) {
  return (
    <section className="panel h-full">
      <div className="panel-head">
        <h3 className="section-title">{title}</h3>
        <p className="section-hint">{hint}</p>
      </div>
      <div className="panel-body">
        {clients.length === 0 ? (
          <p className="text-sm text-muted">{emptyText}</p>
        ) : (
          <ul className="quick-list">
            {clients.map((client) => {
              const overdue = isOverdue(client);
              const stale = isStaleContact(client);
              const dueIn = daysUntil(client.followUpDate);

              return (
                <li key={client.id}>
                  <button
                    type="button"
                    className={`quick-list__item ${overdue ? 'quick-list__item--danger' : stale ? 'quick-list__item--warn' : ''}`}
                    onClick={() => onSelect(client)}
                  >
                    <ClientAvatar name={client.name} size="sm" />
                    <div className="min-w-0 text-left">
                      <p className="truncate font-semibold text-ink">{client.name}</p>
                      <p className="truncate text-xs text-muted">
                        {client.caseType} · {formatPhone(client.phone)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <PriorityBadge priority={client.priority} />
                      <p className="mt-1 text-xs font-medium text-muted">
                        {overdue
                          ? `−${Math.abs(dueIn)} дн.`
                          : dueIn === 0
                            ? 'Сегодня'
                            : `${dueIn} дн.`}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export function DashboardView({
  clients,
  onSelectClient,
}: {
  clients: Client[];
  onSelectClient: (client: Client) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const dueToday = clients.filter(
    (client) => client.status !== 'closed' && client.followUpDate === today,
  );
  const overdue = clients.filter((client) => isOverdue(client));
  const stale = clients.filter(
    (client) => client.status !== 'closed' && isStaleContact(client) && !isOverdue(client),
  );

  const activeClients = clients.filter((client) => client.status !== 'closed').length;
  const highPriority = clients.filter((client) => client.priority === 'high' && client.status !== 'closed').length;

  return (
    <div className="space-y-6">
      <section className="hero-grid">
        <article className="hero-card">
          <p className="hero-card__label">Активные дела</p>
          <p className="hero-card__value">{activeClients}</p>
          <p className="hero-card__hint">Клиенты в статусах «Новый» и «В работе»</p>
        </article>
        <article className="hero-card hero-card--warn">
          <p className="hero-card__label">Сегодня к контакту</p>
          <p className="hero-card__value">{dueToday.length}</p>
          <p className="hero-card__hint">Запланированные звонки и сообщения</p>
        </article>
        <article className="hero-card hero-card--danger">
          <p className="hero-card__label">Просрочено</p>
          <p className="hero-card__value">{overdue.length}</p>
          <p className="hero-card__hint">Дела, где дата контакта уже прошла</p>
        </article>
        <article className="hero-card">
          <p className="hero-card__label">Высокий приоритет</p>
          <p className="hero-card__value">{highPriority}</p>
          <p className="hero-card__hint">Требуют внимания в первую очередь</p>
        </article>
      </section>

      <div className="dashboard-grid">
        <QuickClientList
          title="Сегодня к контакту"
          hint="Клиенты, с которыми нужно связаться сегодня"
          clients={dueToday}
          emptyText="На сегодня контактов не запланировано."
          onSelect={onSelectClient}
        />
        <QuickClientList
          title="Просроченные"
          hint="Дела, где следующий шаг уже должен был случиться"
          clients={overdue}
          emptyText="Просроченных дел нет — отличная работа."
          onSelect={onSelectClient}
        />
        <QuickClientList
          title="Долго без контакта"
          hint="Более 3 дней без отметки о связи"
          clients={stale}
          emptyText="Все клиенты на связи."
          onSelect={onSelectClient}
        />
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">Как пользоваться LexDesk</h3>
          <p className="section-hint">
            Прототип собран по паттернам legal CRM: обзор, клиенты, воронка, карточка дела, чеклист и
            история действий.
          </p>
        </div>
        <div className="panel-body grid gap-4 md:grid-cols-3">
          <article className="feature-card">
            <p className="feature-card__step">1</p>
            <h4 className="feature-card__title">Добавьте клиента</h4>
            <p className="feature-card__text">
              Укажите контакты, тип дела, приоритет и дату следующего шага. Поля валидируются до
              сохранения.
            </p>
          </article>
          <article className="feature-card">
            <p className="feature-card__step">2</p>
            <h4 className="feature-card__title">Ведите дело</h4>
            <p className="feature-card__text">
              Открывайте карточку клиента: чеклист по типу дела, заметки, смена статуса и история
              действий.
            </p>
          </article>
          <article className="feature-card">
            <p className="feature-card__step">3</p>
            <h4 className="feature-card__title">Напоминайте в один клик</h4>
            <p className="feature-card__text">
              WhatsApp и Telegram открываются с готовым текстом. Браузерные уведомления — при
              добавлении и смене статуса.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
