import { useMemo, useState } from 'react';
import { ActivityTimeline } from './components/ActivityTimeline';
import { ClientDrawer } from './components/ClientDrawer';
import { ClientModal } from './components/ClientModal';
import { ClientTable } from './components/ClientTable';
import { DashboardView } from './components/DashboardView';
import { PipelineView } from './components/PipelineView';
import { Sidebar } from './components/layout/Sidebar';
import { StatsBar } from './components/StatsBar';
import { Toast } from './components/Toast';
import { useClientsApp } from './hooks/useClientsApp';
import { allActivity } from './lib/activity';
import { isOverdue } from './lib/dates';
import { downloadCsv } from './lib/export';
import type { AppView, Client } from './types';
import { VIEW_LABELS } from './types';

export default function App() {
  const {
    clients,
    toast,
    stats,
    addClient,
    editClient,
    changeStatus,
    deleteClient,
    markContact,
    saveNotes,
    toggleChecklistItem,
    setFollowUpDate,
    clearToast,
  } = useClientsApp();

  const [view, setView] = useState<AppView>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [drawerClientId, setDrawerClientId] = useState<string | null>(null);
  const [pendingDeleteInDrawer, setPendingDeleteInDrawer] = useState(false);

  const overdueCount = useMemo(
    () => clients.filter((client) => isOverdue(client)).length,
    [clients],
  );

  const drawerClient = clients.find((client) => client.id === drawerClientId) ?? null;
  const recentActivity = useMemo(() => allActivity(clients), [clients]);

  const openCreate = () => {
    setModalMode('create');
    setEditingClient(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setModalMode('edit');
    setEditingClient(client);
    setModalOpen(true);
  };

  const openDrawer = (client: Client) => {
    setDrawerClientId(client.id);
    setPendingDeleteInDrawer(false);
  };

  const closeDrawer = () => {
    setDrawerClientId(null);
    setPendingDeleteInDrawer(false);
  };

  return (
    <div className="app-layout">
      <Sidebar
        view={view}
        onViewChange={setView}
        onCreateClient={openCreate}
        onExport={() => downloadCsv(clients)}
        clientCount={clients.length}
        overdueCount={overdueCount}
      />

      <div className="app-main">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">LexDesk · прототип legal CRM</p>
            <h2 className="topbar__title">{VIEW_LABELS[view]}</h2>
          </div>
          <div className="topbar__actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadCsv(clients)}>
              Экспорт
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              + Клиент
            </button>
          </div>
        </header>

        <main className="app-content space-y-6">
          <StatsBar totals={stats} overdueCount={overdueCount} />

          {view === 'dashboard' ? (
            <>
              <DashboardView clients={clients} onSelectClient={openDrawer} />
              <section className="panel">
                <div className="panel-head">
                  <h3 className="section-title">Последняя активность</h3>
                  <p className="section-hint">История действий по всем клиентам</p>
                </div>
                <div className="panel-body">
                  <ActivityTimeline items={recentActivity} />
                </div>
              </section>
            </>
          ) : null}

          {view === 'clients' ? (
            <ClientTable
              clients={clients}
              onSelect={openDrawer}
              onStatusChange={changeStatus}
              onDelete={(id) => {
                deleteClient(id);
                if (drawerClientId === id) closeDrawer();
              }}
              onMarkContact={markContact}
            />
          ) : null}

          {view === 'pipeline' ? (
            <PipelineView
              clients={clients}
              onSelect={openDrawer}
              onStatusChange={changeStatus}
            />
          ) : null}
        </main>
      </div>

      <ClientModal
        open={modalOpen}
        mode={modalMode}
        initial={editingClient ?? undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={(draft) => {
          if (modalMode === 'create') {
            void addClient(draft).then((id) => setDrawerClientId(id));
          } else if (editingClient) {
            editClient(editingClient.id, draft);
          }
        }}
      />

      <ClientDrawer
        client={drawerClient}
        open={Boolean(drawerClient)}
        onClose={closeDrawer}
        onEdit={openEdit}
        onStatusChange={(status) => drawerClient && changeStatus(drawerClient.id, status)}
        onMarkContact={() => drawerClient && markContact(drawerClient.id)}
        onDeleteRequest={() => setPendingDeleteInDrawer(true)}
        onDeleteConfirm={() => {
          if (drawerClient) {
            deleteClient(drawerClient.id);
            closeDrawer();
          }
        }}
        onDeleteCancel={() => setPendingDeleteInDrawer(false)}
        pendingDelete={pendingDeleteInDrawer}
        onSaveNotes={(notes) => drawerClient && saveNotes(drawerClient.id, notes)}
        onToggleChecklist={(itemId) => drawerClient && toggleChecklistItem(drawerClient.id, itemId)}
        onFollowUpChange={(date) => drawerClient && setFollowUpDate(drawerClient.id, date)}
      />

      {toast ? (
        <Toast message={toast.message} action={toast.action} onClose={clearToast} />
      ) : null}
    </div>
  );
}
