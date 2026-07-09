import type { Client, ClientDraft } from '../types';
import { STATUS_LABELS } from '../types';
import { createActivity, prependActivity } from './activity';
import { defaultChecklist } from './checklist';
import { defaultFollowUpDate } from './dates';

export function draftFromClient(client: Client): ClientDraft {
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

export function createClientFromDraft(draft: ClientDraft): Client {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: draft.name.trim(),
    phone: draft.phone,
    email: draft.email.trim(),
    status: draft.status,
    caseType: draft.caseType,
    priority: draft.priority,
    followUpDate: draft.followUpDate,
    notes: draft.notes.trim(),
    checklist: defaultChecklist(draft.caseType),
    activity: [
      createActivity(
        'created',
        `Клиент добавлен · ${draft.caseType} · статус «${STATUS_LABELS[draft.status]}»`,
      ),
    ],
    createdAt: now,
    updatedAt: now,
    lastContactAt: now,
  };
}

export function updateClientFromDraft(client: Client, draft: ClientDraft): Client {
  const now = new Date().toISOString();
  const checklist =
    draft.caseType !== client.caseType
      ? defaultChecklist(draft.caseType)
      : client.checklist;

  const activity = prependActivity(
    client.activity,
    createActivity('updated', 'Карточка клиента обновлена'),
  );

  return {
    ...client,
    name: draft.name.trim(),
    phone: draft.phone,
    email: draft.email.trim(),
    status: draft.status,
    caseType: draft.caseType,
    priority: draft.priority,
    followUpDate: draft.followUpDate,
    notes: draft.notes.trim(),
    checklist,
    activity,
    updatedAt: now,
  };
}

export function emptyDraft(): ClientDraft {
  return {
    name: '',
    phone: '',
    email: '',
    status: 'new',
    caseType: 'Консультация',
    priority: 'normal',
    followUpDate: defaultFollowUpDate(),
    notes: '',
  };
}
