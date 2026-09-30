import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

// Toast-style notifications, rendered from App state. Supports an optional
// action link (e.g. "View orders" after a real-time ORDER_PLACED event).
function Notification({ toasts = [], dismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div className="toast" key={t.id} onClick={() => dismiss(t.id)}>
          <span className="t-icon">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <b>{t.title}</b>
            {t.body && <p>{t.body}</p>}
          </div>
          {t.link && (
            <Link to={t.link} onClick={(e) => e.stopPropagation()}>
              {t.linkLabel || 'View'}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default Notification;
