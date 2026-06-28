import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

/** App shell: top bar with branding, navigation and the signed-in user. */
export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="app-brand">
            <span className="app-brand__mark">SI</span>
            <span className="app-brand__name">SimpleInvoice</span>
          </Link>
          <nav className="app-nav">
            <NavLink to="/" end className="app-nav__link">
              Invoices
            </NavLink>
            <NavLink to="/invoices/new" className="app-nav__link">
              New Invoice
            </NavLink>
          </nav>
          <div className="app-user">
            <span className="app-user__name" title={user?.email}>
              {user?.fullname ?? user?.email}
            </span>
            <button className="btn btn--ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
