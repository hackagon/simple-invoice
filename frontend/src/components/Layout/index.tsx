import { Link, NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../Logo';
import { UserMenu } from '../UserMenu';

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="app-brand">
            <Logo />
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
