import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, Leaf, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';
import foodImages from '../data/foodImages';
import { findDish } from '../data/dishes';
import { getNutrition } from '../data/nutrition';
import { getPreferences, isFavorite, toggleFavorite } from '../services/store';
import { imgFallback, dishImage } from '../utils/img';

// Recommendation result card. Note: /api/analyze already persists the dish to
// the cart (status 'cart'), so there is no fake "add" step — the card shows
// the honest saved state with actions to view the cart or analyze again.
function FoodCard({ food, mood, onNew }) {
  const [fav, setFav] = useState(() => isFavorite(food?.food || ''));
  if (!food) return null;

  const image = dishImage(food.food, foodImages);
  const nutrition = getNutrition(food.food);
  const catalogDish = findDish(food.food);
  const prefs = getPreferences();
  const matchesDiet =
    prefs.diet !== 'any' &&
    catalogDish &&
    ((prefs.diet === 'veg' && catalogDish.veg) ||
      (prefs.diet === 'nonveg' && !catalogDish.veg));

  const handleFav = () => {
    if (catalogDish) setFav(toggleFavorite(catalogDish));
  };

  return (
    <div className="food-card">
      <div className="food-media">
        <img src={image} alt={food.food} onError={imgFallback} />
        <span className="price-tag">₹{food.price}</span>
      </div>

      <div className="food-body">
        {mood && (
          <span
            className="mood-badge"
            style={{ background: `${mood.color}22`, color: mood.color }}
          >
            <Sparkles size={13} /> Detected mood: {mood.label}
          </span>
        )}
        <h3>{food.food}</h3>

        {matchesDiet && (
          <div>
            <span className="pref-chip">
              <Leaf size={14} /> Matches your {prefs.diet === 'veg' ? 'vegetarian' : 'non-veg'} preference
            </span>
          </div>
        )}

        <div className="reason-box">
          <h4>Why this dish?</h4>
          <p>{food.reason}</p>
        </div>

        {nutrition && (
          <div className="nutrition">
            <h4>
              Nutrition snapshot <span>· approx. per {nutrition.serving}</span>
            </h4>
            <div className="nutri-grid">
              <div className="nutri"><b>{nutrition.calories}</b><span>kcal</span></div>
              <div className="nutri"><b>{nutrition.protein}g</b><span>protein</span></div>
              <div className="nutri"><b>{nutrition.carbs}g</b><span>carbs</span></div>
              <div className="nutri"><b>{nutrition.fat}g</b><span>fat</span></div>
            </div>
          </div>
        )}

        <div className="food-actions">
          <span className="saved-note">
            <Check size={17} /> Saved to your cart
          </span>
          <Link to="/cart" className="btn btn-primary btn-sm">
            <ShoppingBag size={15} /> View cart
          </Link>
          {catalogDish && (
            <button
              className={`btn btn-ghost btn-sm ${fav ? '' : ''}`}
              onClick={handleFav}
              style={fav ? { borderColor: '#C0495B', color: '#C0495B' } : undefined}
            >
              <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
              {fav ? 'Favorited' : 'Save'}
            </button>
          )}
          {onNew && (
            <button className="btn btn-ghost btn-sm" onClick={onNew}>
              <RotateCcw size={15} /> Analyze another
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
