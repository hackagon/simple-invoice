import { Link, NavLink, Outlet } from 'react-router-dom';
import { UserMenu } from '../UserMenu';

export function Layout() {
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
          </nav>
          <UserMenu />
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
