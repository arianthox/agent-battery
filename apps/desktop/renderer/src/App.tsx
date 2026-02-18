import { DashboardPage } from "@renderer/pages/Dashboard";
import { AccountsPage } from "@renderer/pages/Accounts";
import { SettingsPage } from "@renderer/pages/Settings";
import { useUiStore } from "@renderer/stores/uiStore";

export function App() {
  const { page, selectedAccountId, setPage, setSelectedAccountId } = useUiStore();

  return (
    <main style={{ margin: "1rem auto", maxWidth: 1100, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>Agent Battery</h1>
      <nav style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("accounts")}>Accounts</button>
        <button onClick={() => setPage("settings")}>Settings</button>
      </nav>

      {page === "dashboard" && (
        <DashboardPage
          onSelectAccount={(id) => {
            setSelectedAccountId(id);
            setPage("accounts");
          }}
        />
      )}
      {page === "accounts" && <AccountsPage accountId={selectedAccountId} />}
      {page === "settings" && <SettingsPage />}
    </main>
  );
}
