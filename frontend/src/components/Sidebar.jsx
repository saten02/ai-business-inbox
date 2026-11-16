import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="sidebar">

      <div className="logo">
        AI Business Inbox
      </div>

      <nav>

        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/inbox">
          Inbox
        </NavLink>

        <NavLink to="/customers">
          Customers
        </NavLink>

        <NavLink to="/leads">
          Leads
        </NavLink>

        <NavLink to="/products">
          Products
        </NavLink>

      </nav>

      <button
        className="logout-btn"
        onClick={logout}
      >
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;