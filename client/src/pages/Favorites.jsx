import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import DishCard from '../components/DishCard';
import { useToast } from '../toast';
import { getFavorites } from '../services/store';

function Favorites() {
  const pushToast = useToast();
  const [favs, setFavs] = useState(() => getFavorites());

  // Re-read after a toggle inside DishCard
  const refresh = () => setFavs(getFavorites());

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Favorites</span>
        <h1>Your comfort shelf</h1>
        <p>
          Dishes you've saved with the heart button. They live in this browser —
          no account needed.
        </p>
      </div>

      {favs.length === 0 ? (
        <div className="empty">
          <span className="e-icon">
            <Heart size={30} />
          </span>
          <h3>No favorites yet</h3>
          <p>Tap the heart on any dish in the menu to save it here.</p>
          <Link to="/menu" className="btn btn-primary">
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="dish-grid" key={favs.length}>
          {favs.map((d) => (
            <div key={d.id || d.name} onClickCapture={refresh}>
              <DishCard dish={d} onToast={(t, b) => pushToast(t, b)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
