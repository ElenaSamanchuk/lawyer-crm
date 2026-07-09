export type CaseStatus = 'new' | 'active' | 'closed';

export type Client = {
  id: string;
  name: string;
  phone: string;
  status: CaseStatus;
  caseType: string;
  followUpDate: string;
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
  status: CaseStatus;
  caseType: string;
  followUpDate: string;
};

export type FormErrors = Partial<Record<keyof ClientDraft, string>>;
