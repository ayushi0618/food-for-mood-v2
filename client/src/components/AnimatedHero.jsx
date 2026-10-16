// 21st.dev-inspired Animated Hero (@tommyjepsen/animated-hero)
// Layered animated landing hero: drifting amber blobs, a kinetic
// headline, floating dish cards with mood callouts, and a scrolling
// comfort-dish marquee.
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame, Leaf, Star, Moon, Sun, CloudRain } from 'lucide-react';
import foodImages from '../data/foodImages';
import { imgFallback } from '../utils/img';

const MARQUEE = [
  'Biryani', 'Masala Dosa', 'Rajma Chawal', 'Chole Bhature', 'Pav Bhaji',
  'Dal Makhani', 'Gulab Jamun', 'Khichdi', 'Butter Chicken', 'Rasmalai',
];

function AnimatedHero() {
  return (
    <section className="hero21">
      <div className="hero21-bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="grain" />
      </div>

      <div className="hero21-inner">
        <div className="hero21-content">
          <span className="eyebrow eyebrow-glow">
            <Sparkles size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            AI-powered comfort food
          </span>
          <h1 className="hero21-title">
            Eat for <em>how</em>
            <br />
            you <span className="grad">feel.</span>
          </h1>
          <p className="hero21-sub">
            Tell us what's happening in your day. Our AI reads the mood and
            matches you with the perfect Indian comfort dish — then tracks what
            actually lifts your spirits.
          </p>
          <div className="hero-ctas">
            <a href="#analyze" className="btn btn-primary btn-xl">
              Analyze my mood <ArrowRight size={17} />
            </a>
            <Link to="/menu" className="btn btn-ghost btn-xl">
              Browse the menu
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <b>16+</b>
              <span>Curated dishes</span>
            </div>
            <div className="hero-stat">
              <b>AI</b>
              <span>Gemini-powered matching</span>
            </div>
            <div className="hero-stat">
              <b>Live</b>
              <span>Real-time order updates</span>
            </div>
          </div>
        </div>

        <div className="hero21-art" aria-hidden="true">
          <div className="hero21-dish main">
            <img src={foodImages['Biryani']} alt="" onError={imgFallback} />
            <span className="hero21-dish-tag">Stressed? → Biryani</span>
          </div>
          <div className="hero21-dish a">
            <img src={foodImages['Gulab Jamun']} alt="" onError={imgFallback} />
          </div>
          <div className="hero21-dish b">
            <img src={foodImages['Masala Dosa']} alt="" onError={imgFallback} />
          </div>
          <div className="hero21-chip c1">
            <Flame size={15} color="#C2571B" /> Long day? Khichdi helps
          </div>
          <div className="hero21-chip c2">
            <Leaf size={15} color="#5F8D4E" /> Feeling low? Maggi time
          </div>
          <div className="hero21-chip c3">
            <Star size={15} color="#D9A441" /> 4.9 from foodies
          </div>
          <div className="hero21-chip c4">
            <Moon size={15} color="#6B8CAE" /> Midnight craving? Sorted
          </div>
          <div className="hero21-chip c5">
            <Sun size={15} color="#E8912D" /> Celebrating? Go big
          </div>
          <div className="hero21-chip c6">
            <CloudRain size={15} color="#9A8FBF" /> Rainy &amp; homesick? Rajma
          </div>
        </div>
      </div>

      <div className="hero21-marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((d, i) => (
            <span key={i} className="marquee-item">
              {d} <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AnimatedHero;
