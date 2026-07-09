import { STATUS_LABELS, type Client } from '../types';

export function buildReminderMessage(client: Client): string {
  const date = new Date(client.followUpDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  return [
    `Добрый день, ${client.name}!`,
    '',
    `Напоминаю о вашем деле (${client.caseType.toLowerCase()}).`,
    `Текущий статус: ${STATUS_LABELS[client.status].toLowerCase()}.`,
    `Следующий шаг запланирован на ${date}.`,
    '',
    'Если удобно — напишите, когда можем созвониться.',
    '',
    'С уважением,',
    'ваш юрист',
  ].join('\n');
}

export function whatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function telegramShareLink(text: string): string {
  return `https://t.me/share/url?text=${encodeURIComponent(text)}`;
}
