import { useEffect, useState } from 'react';

function Orders() {

  const [orders, setOrders] =
    useState([]);

  useEffect(() => {

    fetch('http://localhost:5000/api/orders')

      .then((res) => res.json())

      .then((data) => {
        setOrders(data);
      })

      .catch((err) => {
        console.log(err);
      });

  }, []);

  return (

    <div className="page">

      <h1>
        Order History
      </h1>

      {

        orders.length === 0 ?

        (

          <p>
            No orders yet.
          </p>

        )

        :

        (

          <table className="orders-table">

            <thead>

              <tr>

                <th>Food</th>

                <th>Price</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {

                orders.map(item => (

                  <tr key={item._id}>

                    <td>{item.food}</td>

                    <td>₹{item.price}</td>

                    <td>

                      <span className="status-success">
                        Ordered
                      </span>

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

export default Orders;