import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Cart from './pages/Cart';

import './App.css';

function App() {
  return (
    <BrowserRouter>
    <nav className="navbar">

  <div className="logo">
    Food For Mood
  </div>

  <div className="nav-links">

    <Link to="/">Home</Link>

    <a href="/#analyze">
      Analyze
    </a>

    <Link to="/cart">
      Cart
    </Link>

  </div>

</nav>
       



      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;