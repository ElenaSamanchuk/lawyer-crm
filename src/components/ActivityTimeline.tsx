import type { ActivityEntry } from '../types';
import { formatShortDate } from '../lib/format';

const ICONS: Record<ActivityEntry['type'], string> = {
  created: '＋',
  updated: '✎',
  status_changed: '↻',
  contact_marked: '☎',
  note_saved: '📝',
  checklist_updated: '☑',
  follow_up_changed: '📅',
};

type ActivityTimelineProps = {
  items: ActivityEntry[];
  compact?: boolean;
};

export function ActivityTimeline({ items, compact = false }: ActivityTimelineProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Пока нет записей в истории.</p>;
  }

  return (
    <ol className={compact ? 'timeline timeline--compact' : 'timeline'}>
      {items.map((item) => (
        <li key={item.id} className="timeline__item">
          <span className="timeline__icon" aria-hidden="true">
            {ICONS[item.type]}
          </span>
          <div className="timeline__content">
            <p className="timeline__message">{item.message}</p>
            <time className="timeline__time" dateTime={item.at}>
              {formatShortDate(item.at)} ·{' '}
              {new Date(item.at).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
