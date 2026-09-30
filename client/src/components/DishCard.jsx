import { useState } from 'react';
import { Heart, Flame, ShoppingBag } from 'lucide-react';
import { SPICE_LABEL } from '../data/dishes';
import { isFavorite, toggleFavorite } from '../services/store';
import { addToCart, notifyCartUpdated } from '../services/api';
import { imgFallback } from '../utils/img';

// Reusable dish card used by the Menu and Favorites pages.
function DishCard({ dish, onToast }) {
  const [fav, setFav] = useState(() => isFavorite(dish.name));
  const [adding, setAdding] = useState(false);

  const handleFav = () => {
    const nowFav = toggleFavorite(dish);
    setFav(nowFav);
    onToast?.(
      nowFav ? 'Saved to favorites' : 'Removed from favorites',
      `${dish.name} ${nowFav ? 'added to' : 'removed from'} your favorites.`
    );
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart({
        food: dish.name,
        reason: `Handpicked from the menu — ${dish.blurb}`,
        price: dish.price,
        incident: 'Picked directly from the menu',
      });
      notifyCartUpdated();
      onToast?.('Added to cart', `${dish.name} is waiting in your cart.`);
    } catch {
      onToast?.('Could not add', 'The kitchen is unreachable right now.');
    }
    setAdding(false);
  };

  return (
    <div className="dish-card">
      <div className="dish-img">
        <img src={dish.image} alt={dish.name} loading="lazy" onError={imgFallback} />
        <span className={`veg-dot ${dish.veg ? 'veg' : 'nonveg'}`} title={dish.veg ? 'Veg' : 'Non-veg'}>
          <i />
        </span>
        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={handleFav}
          aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart size={17} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="dish-body">
        <h3>{dish.name}</h3>
        <div className="dish-meta">
          <span>{dish.cuisine}</span>
          <span className="spice" title={`Spice: ${SPICE_LABEL[dish.spice]}`}>
            {[1, 2, 3].map((i) => (
              <Flame
                key={i}
                size={13}
                fill={i <= dish.spice ? 'currentColor' : 'none'}
                opacity={i <= dish.spice ? 1 : 0.3}
              />
            ))}
          </span>
        </div>
        <p className="dish-blurb">{dish.blurb}</p>
        <div className="dish-tags">
          {dish.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        <div className="dish-foot">
          <span className="dish-price">₹{dish.price}</span>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={adding}>
            <ShoppingBag size={15} /> {adding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DishCard;
