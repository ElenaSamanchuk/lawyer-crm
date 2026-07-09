export type CaseStatus = 'new' | 'active' | 'closed';

export type Client = {
  id: string;
  name: string;
  phone: string;
  status: CaseStatus;
  createdAt: string;
};

export const STATUS_LABELS: Record<CaseStatus, string> = {
  new: 'Новый',
  active: 'В работе',
  closed: 'Закрыт',
};

export const STATUS_ORDER: CaseStatus[] = ['new', 'active', 'closed'];
