import { useState } from 'react';
import {
  CASE_TYPES,
  STATUS_LABELS,
  STATUS_ORDER,
  type CaseStatus,
  type ClientDraft,
  type FormErrors,
} from '../types';
import { defaultFollowUpDate } from '../lib/dates';
import {
  hasErrors,
  normalizePhone,
  validateClientDraft,
} from '../lib/validation';

const EMPTY_DRAFT: ClientDraft = {
  name: '',
  phone: '',
  status: 'new',
  caseType: CASE_TYPES[0],
  followUpDate: defaultFollowUpDate(),
};

type ClientFormProps = {
  onSubmit: (draft: ClientDraft) => void;
};

export function ClientForm({ onSubmit }: ClientFormProps) {
  const [draft, setDraft] = useState<ClientDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ClientDraft, boolean>>>({});

  const touch = (field: keyof ClientDraft) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateClientDraft(draft));
  };

  const update = <K extends keyof ClientDraft>(field: K, value: ClientDraft[K]) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    if (touched[field]) {
      setErrors(validateClientDraft(next));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized: ClientDraft = {
      ...draft,
      name: draft.name.trim(),
      phone: normalizePhone(draft.phone),
    };
    const nextErrors = validateClientDraft(normalized);
    setErrors(nextErrors);
    setTouched({
      name: true,
      phone: true,
      status: true,
      caseType: true,
      followUpDate: true,
    });
    if (hasErrors(nextErrors)) return;

    onSubmit(normalized);
    setDraft({
      ...EMPTY_DRAFT,
      followUpDate: defaultFollowUpDate(),
    });
    setErrors({});
    setTouched({});
  };

  const showError = (field: keyof ClientDraft) =>
    touched[field] && errors[field] ? errors[field] : undefined;

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6">
      <div className="mb-5">
        <h2 className="font-serif text-xl font-bold text-brand">Новый клиент</h2>
        <p className="mt-1 text-sm text-muted">
          Поля проверяются до сохранения — телефон в международном формате, дата контакта не в
          прошлом.
        </p>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="field-label" htmlFor="client-name">
            Имя / компания <span className="text-red-500">*</span>
          </label>
          <input
            id="client-name"
            className={`field-input ${showError('name') ? 'field-input--error' : ''}`}
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={() => touch('name')}
            placeholder="Иванов И.И. или ООО «Вектор»"
            autoComplete="name"
          />
          {showError('name') ? <p className="field-error">{errors.name}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="client-phone">
            Телефон <span className="text-red-500">*</span>
          </label>
          <input
            id="client-phone"
            className={`field-input ${showError('phone') ? 'field-input--error' : ''}`}
            value={draft.phone}
            onChange={(e) => update('phone', e.target.value)}
            onBlur={() => {
              update('phone', normalizePhone(draft.phone));
              touch('phone');
            }}
            placeholder="+375 29 123-45-67"
            inputMode="tel"
            autoComplete="tel"
          />
          {showError('phone') ? <p className="field-error">{errors.phone}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="client-case-type">
            Тип дела <span className="text-red-500">*</span>
          </label>
          <select
            id="client-case-type"
            className={`field-input ${showError('caseType') ? 'field-input--error' : ''}`}
            value={draft.caseType}
            onChange={(e) => update('caseType', e.target.value)}
            onBlur={() => touch('caseType')}
          >
            {CASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {showError('caseType') ? <p className="field-error">{errors.caseType}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="client-status">
            Статус дела
          </label>
          <select
            id="client-status"
            className="field-input"
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

        <div className="md:col-span-2">
          <label className="field-label" htmlFor="client-follow-up">
            Следующий контакт <span className="text-red-500">*</span>
          </label>
          <input
            id="client-follow-up"
            type="date"
            className={`field-input max-w-xs ${showError('followUpDate') ? 'field-input--error' : ''}`}
            value={draft.followUpDate}
            onChange={(e) => update('followUpDate', e.target.value)}
            onBlur={() => touch('followUpDate')}
          />
          {showError('followUpDate') ? (
            <p className="field-error">{errors.followUpDate}</p>
          ) : (
            <p className="mt-1 text-xs text-muted">
              Напоминание и просрочка считаются от этой даты.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Добавить клиента
          </button>
        </div>
      </form>
    </section>
  );
}
