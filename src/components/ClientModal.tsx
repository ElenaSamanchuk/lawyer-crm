import { useEffect, useState } from 'react';
import {
  CASE_TYPES,
  STATUS_LABELS,
  STATUS_ORDER,
  type CaseStatus,
  type Client,
  type ClientDraft,
  type FormErrors,
  type Priority,
} from '../types';
import { defaultFollowUpDate } from '../lib/dates';
import { hasErrors, normalizePhone, validateClientDraft } from '../lib/validation';
import { Modal } from './ui/Modal';

type ClientModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Client;
  onClose: () => void;
  onSubmit: (draft: ClientDraft) => void;
};

function draftFromInitial(client?: Client): ClientDraft {
  if (!client) {
    return {
      name: '',
      phone: '',
      email: '',
      status: 'new',
      caseType: CASE_TYPES[0],
      priority: 'normal',
      followUpDate: defaultFollowUpDate(),
      notes: '',
    };
  }

  return {
    name: client.name,
    phone: client.phone,
    email: client.email,
    status: client.status,
    caseType: client.caseType,
    priority: client.priority,
    followUpDate: client.followUpDate,
    notes: client.notes,
  };
}

export function ClientModal({ open, mode, initial, onClose, onSubmit }: ClientModalProps) {
  const [draft, setDraft] = useState<ClientDraft>(() => draftFromInitial(initial));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ClientDraft, boolean>>>({});

  useEffect(() => {
    if (open) {
      setDraft(draftFromInitial(initial));
      setErrors({});
      setTouched({});
    }
  }, [open, initial]);

  const touch = (field: keyof ClientDraft) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateClientDraft(draft, mode === 'edit'));
  };

  const update = <K extends keyof ClientDraft>(field: K, value: ClientDraft[K]) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    if (touched[field]) {
      setErrors(validateClientDraft(next, mode === 'edit'));
    }
  };

  const showError = (field: keyof ClientDraft) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized: ClientDraft = {
      ...draft,
      name: draft.name.trim(),
      phone: normalizePhone(draft.phone),
      email: draft.email.trim(),
      notes: draft.notes.trim(),
    };
    const nextErrors = validateClientDraft(normalized, mode === 'edit');
    setErrors(nextErrors);
    setTouched({
      name: true,
      phone: true,
      email: true,
      status: true,
      caseType: true,
      priority: true,
      followUpDate: true,
      notes: true,
    });
    if (hasErrors(nextErrors)) return;
    onSubmit(normalized);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={mode === 'create' ? 'Новый клиент' : 'Редактирование клиента'}
      subtitle="Все обязательные поля проверяются до сохранения"
    >
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="field-label" htmlFor="modal-name">
            Имя / компания *
          </label>
          <input
            id="modal-name"
            className={`field-input ${showError('name') ? 'field-input--error' : ''}`}
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={() => touch('name')}
            placeholder="Иванов И.И. или ООО «Вектор»"
          />
          {showError('name') ? <p className="field-error">{errors.name}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="modal-phone">
            Телефон *
          </label>
          <input
            id="modal-phone"
            className={`field-input ${showError('phone') ? 'field-input--error' : ''}`}
            value={draft.phone}
            onChange={(e) => update('phone', e.target.value)}
            onBlur={() => {
              update('phone', normalizePhone(draft.phone));
              touch('phone');
            }}
            placeholder="+375 29 123-45-67"
            inputMode="tel"
          />
          {showError('phone') ? <p className="field-error">{errors.phone}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="modal-email">
            Email
          </label>
          <input
            id="modal-email"
            className={`field-input ${showError('email') ? 'field-input--error' : ''}`}
            value={draft.email}
            onChange={(e) => update('email', e.target.value)}
            onBlur={() => touch('email')}
            placeholder="client@company.ru"
            inputMode="email"
          />
          {showError('email') ? <p className="field-error">{errors.email}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="modal-priority">
            Приоритет
          </label>
          <select
            id="modal-priority"
            className="field-select"
            value={draft.priority}
            onChange={(e) => update('priority', e.target.value as Priority)}
          >
            <option value="low">Низкий</option>
            <option value="normal">Обычный</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="modal-case-type">
            Тип дела *
          </label>
          <select
            id="modal-case-type"
            className="field-select"
            value={draft.caseType}
            onChange={(e) => update('caseType', e.target.value)}
          >
            {CASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="modal-status">
            Статус дела
          </label>
          <select
            id="modal-status"
            className="field-select"
            value={draft.status}
            onChange={(e) => update('status', e.target.value as CaseStatus)}
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid__full">
          <label className="field-label" htmlFor="modal-follow-up">
            Следующий контакт *
          </label>
          <input
            id="modal-follow-up"
            type="date"
            className={`field-date max-w-xs ${showError('followUpDate') ? 'field-input--error' : ''}`}
            value={draft.followUpDate}
            onChange={(e) => update('followUpDate', e.target.value)}
            onBlur={() => touch('followUpDate')}
          />
          {showError('followUpDate') ? (
            <p className="field-error">{errors.followUpDate}</p>
          ) : null}
        </div>

        <div className="form-grid__full">
          <label className="field-label" htmlFor="modal-notes">
            Заметка по делу
          </label>
          <textarea
            id="modal-notes"
            className={`field-textarea ${showError('notes') ? 'field-input--error' : ''}`}
            value={draft.notes}
            onChange={(e) => update('notes', e.target.value)}
            onBlur={() => touch('notes')}
            rows={4}
            placeholder="Краткий контекст: что нужно сделать, какие документы, дедлайны…"
          />
          {showError('notes') ? <p className="field-error">{errors.notes}</p> : null}
        </div>

        <div className="form-grid__full flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            {mode === 'create' ? 'Добавить клиента' : 'Сохранить изменения'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
