// 21st.dev-inspired Menu Item Card (@ravikatiyar162/menu-item-card)
// Food card with image, veg badge, price (+ original strike), serves,
// prep time and an animated ADD button — used for the mood-results grid
// and the Menu page. Wired into the app's cart + favorites services.
import { useState } from 'react';
import { Heart, ShoppingBag, Check, Clock, Users, Star, Gift } from 'lucide-react';
import { isFavorite, toggleFavorite } from '../services/store';
import { addToCart, notifyCartUpdated } from '../services/api';
import { imgFallback } from '../utils/img';

function MenuItemCard({ dish, onToast, onGift }) {
  const [fav, setFav] = useState(() => isFavorite(dish.name));
  const [state, setState] = useState('idle'); // idle | adding | added

  const originalPrice = Math.round(dish.price * 1.4);
  const discount = Math.round((1 - dish.price / originalPrice) * 100);

  const handleFav = () => {
    const nowFav = toggleFavorite(dish);
    setFav(nowFav);
    onToast?.(
      nowFav ? 'Saved to favorites' : 'Removed from favorites',
      `${dish.name} ${nowFav ? 'added to' : 'removed from'} your favorites.`
    );
  };

  const handleAdd = async () => {
    if (state !== 'idle') return;
    setState('adding');
    try {
      await addToCart({
        food: dish.name,
        reason: `Handpicked from the menu — ${dish.blurb}`,
        price: dish.price,
        incident: 'Picked directly from the menu',
      });
      notifyCartUpdated();
      setState('added');
      onToast?.('Added to cart', `${dish.name} is waiting in your cart.`);
      setTimeout(() => setState('idle'), 1600);
    } catch {
      setState('idle');
      onToast?.('Could not add', 'The kitchen is unreachable right now.');
    }
  };

  return (
    <article className="mic21">
      <div className="mic21-img">
        <img src={dish.image} alt={dish.name} loading="lazy" onError={imgFallback} />
        <span className={`mic21-veg ${dish.veg ? 'veg' : 'nonveg'}`}>
          <i />
        </span>
        <span className="mic21-off">{discount}% OFF</span>
        <button
          className={`mic21-fav ${fav ? 'active' : ''}`}
          onClick={handleFav}
          aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mic21-body">
        <div className="mic21-top">
          <h3>{dish.name}</h3>
          <span className="mic21-cuisine">{dish.cuisine}</span>
        </div>

        <div className="mic21-meta">
          {dish.rating && (
            <>
              <span className={`mic21-rating ${dish.rating >= 4.5 ? 'top' : ''}`}>
                <Star size={12} fill="currentColor" /> {dish.rating.toFixed(1)}
              </span>
              <span className="mic21-dot" />
            </>
          )}
          <span className="mic21-meta-item">
            <Users size={13} /> {dish.serves || 'Serves 1'}
          </span>
          <span className="mic21-dot" />
          <span className="mic21-meta-item">
            <Clock size={13} /> {dish.prepTime || 20} min
          </span>
        </div>

        <div className="mic21-tags">
          {dish.tags.slice(0, 3).map((t) => (
            <span key={t} className="tag tag-sm">
              {t}
            </span>
          ))}
        </div>

        <div className="mic21-foot">
          <div className="mic21-price">
            <b>₹{dish.price}</b>
            <s>₹{originalPrice}</s>
          </div>
          <button
            className={`mic21-add ${state === 'added' ? 'done' : ''}`}
            onClick={handleAdd}
            disabled={state === 'adding'}
          >
            {state === 'added' ? (
              <>
                <Check size={15} /> Added
              </>
            ) : state === 'adding' ? (
              <span className="mic21-spinner" />
            ) : (
              <>
                <ShoppingBag size={15} /> Add
              </>
            )}
          </button>
          {onGift && (
            <button
              className="mic21-gift"
              onClick={() => onGift(dish)}
              aria-label={`Send ${dish.name} as a gift`}
              title="Send as a gift"
            >
              <Gift size={15} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default MenuItemCard;
