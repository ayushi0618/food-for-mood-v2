import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';

import Navbar from './components/Navbar';
import Notification from './components/Notification';
import { ToastContext } from './toast';
import { WS_URL, notifyCartUpdated } from './services/api';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Insights from './pages/Insights';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import './App.css';

let toastSeq = 0;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [toasts, setToasts] = useState([]);
  const retryRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (title, body, opts = {}) => {
      const id = ++toastSeq;
      setToasts((prev) => [...prev.slice(-2), { id, title, body, ...opts }]);
      setTimeout(() => dismiss(id), opts.duration || 6000);
    },
    [dismiss]
  );

  // Real-time order updates with reconnect. URL is configurable via
  // REACT_APP_WS_URL; defaults to the production Render service.
  useEffect(() => {
    let socket;
    let timer;
    let closed = false;

    const connect = () => {
      try {
        socket = new WebSocket(WS_URL);
      } catch {
        scheduleRetry();
        return;
      }

      socket.onopen = () => {
        retryRef.current = 0;
      };

      socket.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
        if (data.type === 'ORDER_PLACED') {
          pushToast('Order confirmed', `${data.food} is being prepared.`, {
            link: '/orders',
            linkLabel: 'Track',
            duration: 8000,
          });
          notifyCartUpdated();
        }
      };

      socket.onclose = () => {
        if (!closed) scheduleRetry();
      };
      socket.onerror = () => {
        try {
          socket.close();
        } catch {
          /* noop */
        }
      };
    };

    const scheduleRetry = () => {
      retryRef.current += 1;
      const delay = Math.min(30000, 2000 * 2 ** Math.min(retryRef.current, 4));
      timer = setTimeout(() => {
        if (!closed) connect();
      }, delay);
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      try {
        socket && socket.close();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastContext.Provider value={pushToast}>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Notification toasts={toasts} dismiss={dismiss} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ToastContext.Provider>
  );
}

export default App;
