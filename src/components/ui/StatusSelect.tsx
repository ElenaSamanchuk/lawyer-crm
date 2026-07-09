import type { CaseStatus } from '../../types';
import { STATUS_LABELS, STATUS_ORDER } from '../../types';

type StatusSelectProps = {
  value: CaseStatus;
  label: string;
  onChange: (status: CaseStatus) => void;
  compact?: boolean;
};

export function StatusSelect({ value, label, onChange, compact = false }: StatusSelectProps) {
  return (
    <select
      className={`status-select status-select--${value} ${compact ? 'w-full' : 'w-[9.5rem]'}`}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value as CaseStatus)}
    >
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

export function StatusPill({ status }: { status: CaseStatus }) {
  return <span className={`status-pill status-pill--${status}`}>{STATUS_LABELS[status]}</span>;
}
