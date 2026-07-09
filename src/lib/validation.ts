import type { ClientDraft, FormErrors } from '../types';

const NAME_RE = /^[\p{L}\p{N}\s«»"'.,()\-–—&]+$/u;
const PHONE_RE = /^\+[\d\s()-]{10,18}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits.replace(/(?!^)\+/g, '');
  if (digits.startsWith('375')) return `+${digits}`;
  if (digits.startsWith('7') && digits.length === 11) return `+${digits}`;
  if (digits.startsWith('8') && digits.length === 11) return `+7${digits.slice(1)}`;
  return trimmed.startsWith('+') ? trimmed : `+${digits}`;
}

export function validateClientDraft(draft: ClientDraft, editing = false): FormErrors {
  const errors: FormErrors = {};
  const name = draft.name.trim();

  if (!name) {
    errors.name = 'Укажите имя клиента или название компании';
  } else if (name.length < 2) {
    errors.name = 'Минимум 2 символа';
  } else if (name.length > 120) {
    errors.name = 'Слишком длинное значение';
  } else if (!NAME_RE.test(name)) {
    errors.name = 'Допустимы буквы, цифры и знаки препинания';
  }

  const phone = normalizePhone(draft.phone);
  if (!phone || phone === '+') {
    errors.phone = 'Укажите телефон в международном формате';
  } else if (!PHONE_RE.test(phone)) {
    errors.phone = 'Формат: +375 29 123-45-67 или +7 999 000-00-00';
  }

  const email = draft.email.trim();
  if (email && !EMAIL_RE.test(email)) {
    errors.email = 'Некорректный email';
  }

  if (!draft.caseType.trim()) {
    errors.caseType = 'Выберите тип дела';
  }

  if (!draft.followUpDate) {
    errors.followUpDate = 'Укажите дату следующего контакта';
  } else if (!editing) {
    const selected = new Date(`${draft.followUpDate}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.followUpDate = 'Дата не может быть в прошлом';
    }
  }

  if (draft.notes.length > 2000) {
    errors.notes = 'Заметка слишком длинная (макс. 2000 символов)';
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
