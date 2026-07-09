export type CaseStatus = 'new' | 'active' | 'closed';
export type Priority = 'low' | 'normal' | 'high';
export type AppView = 'dashboard' | 'clients' | 'pipeline';

export type ActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'contact_marked'
  | 'note_saved'
  | 'checklist_updated'
  | 'follow_up_changed';

export type ActivityEntry = {
  id: string;
  type: ActivityType;
  at: string;
  message: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: CaseStatus;
  caseType: string;
  priority: Priority;
  followUpDate: string;
  notes: string;
  checklist: ChecklistItem[];
  activity: ActivityEntry[];
  createdAt: string;
  updatedAt: string;
  lastContactAt: string;
};

export const STATUS_LABELS: Record<CaseStatus, string> = {
  new: 'Новый',
  active: 'В работе',
  closed: 'Закрыт',
};

export const STATUS_ORDER: CaseStatus[] = ['new', 'active', 'closed'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
};

export const CASE_TYPES = [
  'Консультация',
  'Договор',
  'Суд',
  'Претензия',
  'Сопровождение',
] as const;

export type ClientDraft = {
  name: string;
  phone: string;
  email: string;
  status: CaseStatus;
  caseType: string;
  priority: Priority;
  followUpDate: string;
  notes: string;
};

export type FormErrors = Partial<Record<keyof ClientDraft, string>>;

export const VIEW_LABELS: Record<AppView, string> = {
  dashboard: 'Обзор',
  clients: 'Клиенты',
  pipeline: 'Воронка дел',
};
