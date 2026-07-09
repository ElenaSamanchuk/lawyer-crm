import type { AppView } from '../../types';
import { VIEW_LABELS } from '../../types';

type SidebarProps = {
  view: AppView;
  onViewChange: (view: AppView) => void;
  onCreateClient: () => void;
  onExport: () => void;
  clientCount: number;
  overdueCount: number;
};

const NAV: AppView[] = ['dashboard', 'clients', 'pipeline'];

export function Sidebar({
  view,
  onViewChange,
  onCreateClient,
  onExport,
  clientCount,
  overdueCount,
}: SidebarProps) {
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar__brand">
          <p className="sidebar__eyebrow">Legal CRM</p>
          <h1 className="sidebar__title">LexDesk</h1>
          <p className="sidebar__caption">Рабочий стол юриста</p>
        </div>

        <nav className="sidebar__nav" aria-label="Основная навигация">
          {NAV.map((item) => (
            <button
              key={item}
              type="button"
              className={`sidebar__link ${view === item ? 'sidebar__link--active' : ''}`}
              onClick={() => onViewChange(item)}
            >
              {VIEW_LABELS[item]}
            </button>
          ))}
        </nav>

        <div className="sidebar__actions">
          <button type="button" className="btn btn-primary w-full" onClick={onCreateClient}>
            + Новый клиент
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={onExport}>
            Экспорт CSV
          </button>
        </div>

        <div className="sidebar__stats">
          <p className="sidebar__stats-label">Сводка</p>
          <p className="sidebar__stats-value">{clientCount} клиентов</p>
          <p className="sidebar__stats-hint">
            {overdueCount > 0 ? `${overdueCount} просроченных контактов` : 'Просрочек нет'}
          </p>
        </div>
      </aside>

      <nav className="mobile-nav" aria-label="Мобильная навигация">
        {NAV.map((item) => (
          <button
            key={item}
            type="button"
            className={`mobile-nav__link ${view === item ? 'mobile-nav__link--active' : ''}`}
            onClick={() => onViewChange(item)}
          >
            {VIEW_LABELS[item]}
          </button>
        ))}
      </nav>
    </>
  );
}
