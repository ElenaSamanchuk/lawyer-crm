type ToastProps = {
  message: string;
  action?: { label: string; href: string };
  onClose: () => void;
};

export function Toast({ message, action, onClose }: ToastProps) {
  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-xl border border-line bg-white p-4 shadow-panel"
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-ink">{message}</p>
        <button
          type="button"
          className="btn btn-ghost px-2 py-1 text-xs"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>
      {action ? (
        <a
          className="btn btn-secondary mt-3 w-full text-xs sm:w-auto"
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
