import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Heart, UtensilsCrossed } from 'lucide-react';

import Hero from '../components/Hero';
import MoodForm from '../components/MoodForm';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import DishCard from '../components/DishCard';

import { getRecent } from '../services/api';
import { getJournal } from '../services/store';
import { useToast } from '../toast';
import foodImages from '../data/foodImages';
import DISHES from '../data/dishes';
import { imgFallback, dishImage } from '../utils/img';

function Home() {
  const [recent, setRecent] = useState([]);
  const pushToast = useToast();

  useEffect(() => {
    // Fixed: previously pointed at http://localhost:5000, which is dead in
    // production. Now goes through the centralized API client.
    getRecent()
      .then((data) => setRecent(Array.isArray(data) ? data : []))
      .catch(() => setRecent([]));
  }, []);

  const journalCount = getJournal().length;
  const previewDishes = DISHES.slice(0, 4);

  return (
    <>
      <Hero />
      <MoodForm />
      <About />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="eyebrow">From the menu</span>
          <h2>Crowd favorites</h2>
          <p>A few beloved comfort dishes. Save the ones you love, order in one tap.</p>
        </div>
        <div className="dish-grid">
          {previewDishes.map((d) => (
            <DishCard
              key={d.name}
              dish={d}
              onToast={(t, b) => pushToast(t, b)}
            />
          ))}
        </div>
        <div style={{ marginTop: 26 }}>
          <Link to="/menu" className="btn btn-ghost">
            Explore full menu <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="panel" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#5F8D4E,#476B3A)' }}>
            <BarChart3 size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3>Your cravings have patterns</h3>
            <p className="panel-sub" style={{ margin: '6px 0 0' }}>
              {journalCount > 0
                ? `You've logged ${journalCount} mood check-in${journalCount === 1 ? '' : 's'}. See which moods and dishes dominate your week.`
                : 'Every analysis is journaled automatically. Open Insights to see your mood trends, top comfort foods and spending.'}
            </p>
          </div>
          <Link to="/insights" className="btn btn-green">
            Open Insights <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="eyebrow">Community</span>
          <h2>Recent recommendations</h2>
          <p>Fresh from the AI kitchen — what others were matched with lately.</p>
        </div>
        {recent.length === 0 ? (
          <div className="empty">
            <span className="e-icon">
              <UtensilsCrossed size={30} />
            </span>
            <h3>No recommendations yet</h3>
            <p>Be the first — analyze your mood above.</p>
          </div>
        ) : (
          <div className="recent-strip">
            {recent.map((item) => (
              <div className="recent-card" key={item._id}>
                <img
                  src={dishImage(item.food, foodImages)}
                  alt={item.food}
                  loading="lazy"
                  onError={imgFallback}
                />
                <div className="rc-body">
                  <h4>{item.food}</h4>
                  <span>₹{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="panel" style={{ textAlign: 'center', background: 'linear-gradient(135deg,#2E1F16,#4A382A)', border: 'none' }}>
          <Heart size={30} color="#D9A441" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: '#fff' }}>Save dishes you love</h3>
          <p className="panel-sub" style={{ color: '#D8CBBD', maxWidth: 480, margin: '6px auto 18px' }}>
            Tap the heart on any dish to build your personal comfort-food shelf.
          </p>
          <Link to="/favorites" className="btn btn-primary">
            View favorites
          </Link>
        </div>
      </section>

      <Testimonials />
      <Footer />
    </>
  );
}

export default Home;
