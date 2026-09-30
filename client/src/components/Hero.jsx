import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame, Leaf, Star } from 'lucide-react';
import foodImages from '../data/foodImages';
import { imgFallback } from '../utils/img';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <span className="eyebrow">
            <Sparkles size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            AI-powered comfort food
          </span>
          <h1>
            Eat for <em>how</em> you feel.
          </h1>
          <p className="hero-sub">
            Tell us what's happening in your day. Our AI reads the mood and
            matches you with the perfect Indian comfort dish — then tracks what
            actually lifts your spirits.
          </p>
          <div className="hero-ctas">
            <a href="#analyze" className="btn btn-primary">
              Analyze my mood <ArrowRight size={17} />
            </a>
            <Link to="/menu" className="btn btn-ghost">
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

        <div className="hero-art" aria-hidden="true">
          <div className="hero-dish small-a">
            <img
              src={foodImages['Gulab Jamun']}
              alt=""
              onError={imgFallback}
            />
          </div>
          <div className="hero-dish main">
            <img src={foodImages['Biryani']} alt="" onError={imgFallback} />
          </div>
          <div className="hero-dish small-b">
            <img
              src={foodImages['Masala Dosa']}
              alt=""
              onError={imgFallback}
            />
          </div>
          <div className="hero-chip c1">
            <Flame size={16} color="#C2571B" /> Stressed? Try Biryani
          </div>
          <div className="hero-chip c2">
            <Leaf size={16} color="#5F8D4E" /> Feeling low? Khichdi helps
          </div>
          <div
            className="hero-chip"
            style={{ left: 200, bottom: 10, animationDelay: '3.4s' }}
          >
            <Star size={16} color="#D9A441" /> 4.9 from foodies
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
