import { Link } from 'react-router-dom';
import foodImages from '../data/foodImages';

function FoodCard({ food }) {

  if (!food) return null;

  const image =
    foodImages[food.food] ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';

  return (
    <div className="food-card">

      <img
        src={image}
        alt={food.food}
        className="food-image"
      />

      <div className="food-content">

        <h3>{food.food}</h3>

        <div className="reason-box">
            <h4>Why this recommendation?</h4>
            <p>{food.reason}</p>
        </div>

        <div className="food-footer">
          <span>₹{food.price}</span>
          
        </div>

        <div className="food-actions">
            <button
             classname="cart-btn"
             onClick={()=> alert('added to cart')}
            >
                Add to Cart
                </button>

          <Link to="/cart">
            <button className="cart-btn">
              View Cart
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default FoodCard;