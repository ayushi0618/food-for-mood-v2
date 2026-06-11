import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Notification from './components/Notification';

import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import './App.css';

function App() {

  const [notification, setNotification] =
    useState(null);

  useEffect(() => {

    const socket =
      new WebSocket(
        'ws://localhost:5000'
      );

    socket.onmessage = (event) => {

      const data =
        JSON.parse(event.data);

      if (
        data.type === 'ORDER_PLACED'
      ) {

        setNotification(data);

        setTimeout(() => {

          setNotification(null);

        }, 5000);

      }

    };

    return () => socket.close();

  }, []);

  return (
    <BrowserRouter>

      <nav className="navbar">

        <div className="logo">
          Food For Mood
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <a href="/#analyze">
            Analyze
          </a>

          <Link to="/cart">
            Cart
          </Link>
          <Link to ='/orders'>
            Orders
            </Link>

        </div>

      </nav>

      <Notification
        notification={notification}
      />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />
        <Route 
          path="/orders"
          element={<Orders />}
          />
      </Routes>
      

    </BrowserRouter>
  );
}

export default App;