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

    loadCart();
  }

  return (

    <div className="page">

      <h1>
        Your Food Cart
      </h1>

      {

        items.length === 0 ?

        (

          <p>
            No items in cart.
          </p>

        )

        :

        (

          <table className="cart-table">

            <thead>

              <tr>

                <th>Food</th>

                <th>Reason</th>

                <th>Price</th>

                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {

                items.map(item => (

                  <tr key={item._id}>

                    <td>{item.food}</td>

                    <td>{item.reason}</td>

                    <td>₹{item.price}</td>

                    <td>

                      <button
                        onClick={() =>
                          checkout(item._id)
                        }
                      >
                        Checkout
                      </button>

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        )

      }

    </div>

  );

}

export default Cart;