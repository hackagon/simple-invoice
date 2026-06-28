import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getInitials } from '../../lib/initials';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label = user?.fullname ?? user?.email ?? '';
  const initials = getInitials(label);

  function handleProfile() {
    setOpen(false);
    navigate('/profile');
  }

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="avatar-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        title={label}
      >
        {initials}
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <span className="avatar-btn avatar-btn--lg" aria-hidden="true">
              {initials}
            </span>
            <div className="user-menu__id">
              <div className="user-menu__name">{user?.fullname}</div>
              <div className="user-menu__email">{user?.email}</div>
            </div>
          </div>
          <div className="user-menu__divider" />
          <button
            type="button"
            className="user-menu__item"
            role="menuitem"
            onClick={handleProfile}
          >
            Profile
          </button>
          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            role="menuitem"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
