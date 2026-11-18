import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import {
  applyTheme,
  getPreferredTheme,
  toggleTheme,
} from "../utils/theme";

function Layout() {
  const [theme, setTheme] = useState(getPreferredTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleThemeToggle = () => {
    setTheme((current) => toggleTheme(current));
  };

  const closeSidebar = () => setSidebarOpen(false);

  let userName = "User";

  try {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    if (stored?.name) {
      userName = stored.name;
    }
  } catch {
    // ignore invalid local storage
  }

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <Sidebar onNavigate={closeSidebar} />

      <div className="content-shell">
        <header className="app-header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="header-copy">
              <p className="header-eyebrow">Workspace</p>
              <h1 className="header-title">Business Inbox</h1>
            </div>
          </div>

          <div className="header-actions">
            <span className="header-user">{userName}</span>
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
