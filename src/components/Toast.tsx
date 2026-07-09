type ToastProps = {
  message: string;
  action?: { label: string; href: string };
  onClose: () => void;
};

export function Toast({ message, action, onClose }: ToastProps) {
  return (
    <div
      className="safe-bottom fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-line bg-surface p-4 shadow-float sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-ink">{message}</p>
        <button
          type="button"
          className="btn btn-ghost btn-sm shrink-0 px-2"
          onClick={onClose}
          aria-label="Закрыть уведомление"
        >
          ✕
        </button>
      </div>
      {action ? (
        <a
          className="btn btn-secondary btn-sm mt-3 w-full sm:w-auto"
          href={action.href}
          target="_blank"
          rel="noreferrer"
        >
          {action.label}
        </a>
      ) : null}
    </div>
  );
}
