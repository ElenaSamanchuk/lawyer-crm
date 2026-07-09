import type { ChecklistItem } from '../types';
import { CASE_TYPES } from '../types';

const CHECKLIST_BY_TYPE: Record<(typeof CASE_TYPES)[number], string[]> = {
  Консультация: [
    'Первичная консультация',
    'Договор на услуги',
    'Счёт / оплата',
    'Рекомендации переданы клиенту',
  ],
  Договор: [
    'Сбор вводных',
    'Проект договора',
    'Согласование с клиентом',
    'Подписание и передача',
  ],
  Суд: [
    'Анализ документов',
    'Подготовка иска',
    'Госпошлина',
    'Подача в суд',
    'Судебное заседание',
  ],
  Претензия: [
    'Сбор доказательств',
    'Проект претензии',
    'Отправка контрагенту',
    'Контроль ответа',
  ],
  Сопровождение: [
    'План работ',
    'Еженедельный отчёт',
    'Контроль сроков',
    'Закрывающие документы',
  ],
};

export function defaultChecklist(caseType: string): ChecklistItem[] {
  const labels =
    CHECKLIST_BY_TYPE[caseType as (typeof CASE_TYPES)[number]] ??
    CHECKLIST_BY_TYPE['Консультация'];

  return labels.map((label) => ({
    id: crypto.randomUUID(),
    label,
    done: false,
  }));
}

export function checklistProgress(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}
