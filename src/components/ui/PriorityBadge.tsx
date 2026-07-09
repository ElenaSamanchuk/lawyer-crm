import type { Priority } from '../../types';
import { PRIORITY_LABELS } from '../../types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority-badge priority-badge--${priority}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
