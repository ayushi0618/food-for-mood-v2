// 21st.dev-inspired Hover Preview (@minhxthanh/hover-preview)
// Hovering a food item NAME shows a floating preview card with the
// dish's image, name and key details. Works across Menu, Cart, Orders,
// Favorites, Home recommendations and the result card.
//
// Usage:
//   import { DishName, DishHoverRoot } from '../components/DishHover';
//   <DishName name={item.food} />
// Mount <DishHoverRoot /> once (done in App.js).
import { useEffect, useRef, useState } from 'react';
import { Clock, Users } from 'lucide-react';
import { findDish } from '../data/dishes';
import foodImages from '../data/foodImages';
import { imgFallback, dishImage } from '../utils/img';

const SHOW = 'ffm:dish-hover-show';
const HIDE = 'ffm:dish-hover-hide';

export function showDishHover(name, x, y) {
  window.dispatchEvent(new CustomEvent(SHOW, { detail: { name, x, y } }));
}

export function hideDishHover() {
  window.dispatchEvent(new CustomEvent(HIDE));
}

// Inline dish name that triggers the floating preview on hover.
export function DishName({ name, className = '' }) {
  return (
    <span
      className={`dish-hover-name ${className}`}
      onMouseEnter={(e) => showDishHover(name, e.clientX, e.clientY)}
      onMouseMove={(e) => showDishHover(name, e.clientX, e.clientY)}
      onMouseLeave={hideDishHover}
    >
      {name}
    </span>
  );
}

// Singleton floating card. Positioned near the cursor, clamped to viewport.
export function DishHoverRoot() {
  const [visible, setVisible] = useState(false);
  const [dish, setDish] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const hideTimer = useRef(null);

  useEffect(() => {
    const W = 300;
    const H = 260;
    const onShow = (e) => {
      const { name, x, y } = e.detail;
      const found = findDish(name);
      setDish(
        found || {
          name,
          cuisine: '',
          veg: true,
          price: null,
          prepTime: null,
          serves: '',
          image: dishImage(name, foodImages),
        }
      );
      clearTimeout(hideTimer.current);
      setVisible(true);
      setPos({
        x: Math.min(Math.max(12, x + 22), window.innerWidth - W - 12),
        y: Math.min(Math.max(12, y + 18), window.innerHeight - H - 12),
      });
    };
    const onHide = () => {
      // tiny delay so moving between adjacent names doesn't flicker
      hideTimer.current = setTimeout(() => setVisible(false), 90);
    };
    const onScroll = () => setVisible(false);
    window.addEventListener(SHOW, onShow);
    window.addEventListener(HIDE, onHide);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener(SHOW, onShow);
      window.removeEventListener(HIDE, onHide);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible || !dish) return null;

  return (
    <div
      className="dish-hover-card"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
      onMouseEnter={() => clearTimeout(hideTimer.current)}
      onMouseLeave={hideDishHover}
    >
      <div className="dish-hover-img">
        <img src={dish.image} alt="" onError={imgFallback} />
        <span className={`mic21-veg ${dish.veg ? 'veg' : 'nonveg'}`}>
          <i />
        </span>
      </div>
      <div className="dish-hover-body">
        <h4>{dish.name}</h4>
        <div className="dish-hover-meta">
          {dish.cuisine && <span>{dish.cuisine}</span>}
          {dish.price != null && <b>₹{dish.price}</b>}
        </div>
        {(dish.prepTime || dish.serves) && (
          <div className="dish-hover-sub">
            {dish.prepTime && (
              <span>
                <Clock size={12} /> {dish.prepTime} min
              </span>
            )}
            {dish.serves && (
              <span>
                <Users size={12} /> {dish.serves}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
