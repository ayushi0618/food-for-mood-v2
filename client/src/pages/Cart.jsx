import { useEffect, useState } from 'react';

import {
  getCart,
  checkoutOrder
} from '../services/api';

function Cart() {

  const [items, setItems] = useState([]);

  async function loadCart() {

    const data = await getCart();

    setItems(data);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function checkout(id) {

    await checkoutOrder(id);
    alert('Order placed successfully!');

    loadCart();
  }

  return (
    <div className="page">

      <h1>Your Food Cart</h1>
      <p style={{ marginBottom: '20px'}}>
        Review your recommendations before checkout.
        </p>

      {items.length === 0 && (
        <p>No items in cart.</p>
      )}

      {items.map(item => (

        <div
          key={item._id}
          className="cart-item"
        >
          <div>

            <h3>{item.food}</h3>

            <p>{item.reason}</p>

          </div>

          <div>

            <p>₹{item.price}</p>

            <button
              onClick={() =>
                checkout(item._id)
              }
            >
              Checkout
            </button>

          </div>

        </div>

      ))}
    </div>
  );
}

export default Cart;