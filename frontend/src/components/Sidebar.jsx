import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ onNavigate }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNav = () => {
    if (typeof onNavigate === "function") {
      onNavigate();
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-mark">AI</span>
        <div>
          <strong>Business Inbox</strong>
          <p>Action Agent</p>
        </div>
      </div>

      <nav>
        <NavLink to="/dashboard" onClick={handleNav}>
          Dashboard
        </NavLink>
        <NavLink to="/inbox" onClick={handleNav}>
          Inbox
        </NavLink>
        <NavLink to="/customers" onClick={handleNav}>
          Customers
        </NavLink>
        <NavLink to="/leads" onClick={handleNav}>
          Leads
        </NavLink>
        <NavLink to="/products" onClick={handleNav}>
          Products
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
