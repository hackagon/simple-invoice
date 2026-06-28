import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getInitials } from '../../lib/initials';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const label = user.fullname || user.email;

  return (
    <section className="profile-page">
      <div className="detail-page__top">
        <Link to="/" className="back-link">
          ← Back to invoices
        </Link>
      </div>

      <div className="card profile-card">
        <div className="avatar-btn avatar-btn--xl" aria-hidden="true">
          {getInitials(label)}
        </div>
        <h1 className="profile-card__name">{user.fullname}</h1>
        <p className="muted">{user.email}</p>

        <dl className="info-list profile-card__info">
          <div>
            <dt>Full name</dt>
            <dd>{user.fullname}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd className="mono">{user.id}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
