import { useMemo, useState } from 'react';
import { loadClients, saveClients } from './storage';
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type CaseStatus,
  type Client,
} from './types';
import './App.css';

type FormState = { name: string; phone: string; status: CaseStatus };

const EMPTY_FORM: FormState = { name: '', phone: '', status: 'new' };

function countByStatus(clients: Client[], status: CaseStatus): number {
  return clients.filter((c) => c.status === status).length;
}

export default function App() {
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [toast, setToast] = useState<string | null>(null);

  const totals = useMemo(
    () => ({
      all: clients.length,
      new: countByStatus(clients, 'new'),
      active: countByStatus(clients, 'active'),
      closed: countByStatus(clients, 'closed'),
    }),
    [clients],
  );

  const persist = (next: Client[]) => {
    setClients(next);
    saveClients(next);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name || !phone) return;

    const client: Client = {
      id: crypto.randomUUID(),
      name,
      phone,
      status: form.status,
      createdAt: new Date().toISOString(),
    };

    persist([client, ...clients]);
    setForm(EMPTY_FORM);
    showToast(`Клиент «${name}» добавлен · уведомление отправлено (демо)`);
  };

  const handleStatusChange = (id: string, status: CaseStatus) => {
    const prev = clients.find((c) => c.id === id);
    if (!prev || prev.status === status) return;

    persist(clients.map((c) => (c.id === id ? { ...c, status } : c)));
    showToast(
      `${prev.name}: ${STATUS_LABELS[prev.status]} → ${STATUS_LABELS[status]} · Telegram (демо)`,
    );
  };

  return (
    <div className="app">
      <header className="hero">
        <p className="hero__eyebrow">Прототип · vibe coding · Cursor</p>
        <h1>Client Desk</h1>
        <p className="hero__lead">
          Мини-CRM для юриста: клиенты, статусы дел и быстрый обзор нагрузки. Данные
          сохраняются в браузере.
        </p>
      </header>

      <section className="stats" aria-label="Счётчики по статусам">
        <article className="stat">
          <span className="stat__value">{totals.all}</span>
          <span className="stat__label">Всего клиентов</span>
        </article>
        {STATUS_ORDER.map((status) => (
          <article key={status} className={`stat stat--${status}`}>
            <span className="stat__value">{totals[status]}</span>
            <span className="stat__label">{STATUS_LABELS[status]}</span>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Добавить клиента</h2>
        <form className="form" onSubmit={handleAdd}>
          <label>
            <span>Имя / компания</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Иванов И.И."
              required
            />
          </label>
          <label>
            <span>Телефон</span>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+375 29 …"
              required
            />
          </label>
          <label>
            <span>Статус дела</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as CaseStatus })
              }
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn--primary">
            Добавить клиента
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2>Клиенты</h2>
          <p className="panel__hint">{clients.length} в базе</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Статус</th>
                <th>Добавлен</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">
                    Пока нет клиентов — добавьте первого выше.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td data-label="Клиент">
                      <strong>{client.name}</strong>
                    </td>
                    <td data-label="Телефон">{client.phone}</td>
                    <td data-label="Статус">
                      <select
                        className={`status-select status-select--${client.status}`}
                        value={client.status}
                        aria-label={`Статус для ${client.name}`}
                        onChange={(e) =>
                          handleStatusChange(client.id, e.target.value as CaseStatus)
                        }
                      >
                        {STATUS_ORDER.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Добавлен" className="muted">
                      {new Date(client.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
