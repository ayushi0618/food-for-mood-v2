// 21st.dev-inspired Waitlist Hero (@minhxthanh/waitlist-hero)
// adapted for Food for Mood as a LOGIN section (not a waitlist):
// warm dark-hearth section with orbiting food + mood icons,
// centered brand tile, "Sign in to start your mood-food journey"
// headline and a login CTA. Secondary CTA on Home — it does not
// replace the main animated hero.
import { Link } from 'react-router-dom';
import {
  Pizza,
  Coffee,
  Croissant,
  Soup,
  CakeSlice,
  IceCreamCone,
  Sandwich,
  Cookie,
  CupSoda,
  Drumstick,
  Salad,
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

const ICONS = [Pizza, Coffee, Croissant, Soup, CakeSlice, IceCreamCone, Sandwich, Cookie, CupSoda, Drumstick, Salad, Bike, ShoppingBag];
const MOODS = ['😊', '😌', '😋', '🤩', '😴', '🥳', '😍', '🤤'];

// Floating tiles: alternating lucide food icons and mood emojis,
// scattered like the original's orbiting app icons.
const FLOATERS = Array.from({ length: 20 }, (_, i) => {
  const isIcon = i % 2 === 0;
  const pos = [
    ['4%', '10%'], ['14%', '66%'], ['88%', '14%'], ['76%', '70%'],
    ['28%', '6%'], ['66%', '4%'], ['93%', '46%'], ['2%', '42%'],
    ['10%', '88%'], ['84%', '88%'], ['44%', '94%'], ['56%', '2%'],
    ['38%', '22%'], ['62%', '26%'], ['20%', '28%'], ['80%', '30%'],
    ['48%', '78%'], ['30%', '80%'], ['70%', '82%'], ['8%', '58%'],
  ][i];
  return {
    kind: isIcon ? 'icon' : 'emoji',
    Icon: ICONS[i % ICONS.length],
    emoji: MOODS[i % MOODS.length],
    x: pos[0],
    y: pos[1],
    s: 0.7 + ((i * 37) % 50) / 100,
    d: (i * 0.7) % 3,
    dur: 7 + (i % 5),
  };
});

function LoginHero() {
  return (
    <section className="wl21" aria-label="Sign in">
      <div className="wl21-floaters" aria-hidden="true">
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className={`wl21-tile ${f.kind === 'icon' ? 'wl21-tile-icon' : ''}`}
            style={{
              left: f.x,
              top: f.y,
              fontSize: `${2.6 * f.s}rem`,
              animationDelay: `${f.d}s`,
              animationDuration: `${f.dur}s`,
            }}
          >
            {f.kind === 'icon' ? <f.Icon size={Math.round(34 * f.s)} /> : f.emoji}
          </span>
        ))}
        <span className="wl21-glow" />
      </div>

      <div className="wl21-inner">
        <span className="wl21-logo">
          <UtensilsCrossed size={38} />
        </span>

        <h2 className="wl21-title">
          Sign in to start your <span className="grad">mood-food journey.</span>
        </h2>
        <p className="wl21-sub">
          Your moods, your cravings, your comfort-food shelf — saved and
          waiting every time you return. One profile, endless perfect plates.
        </p>

        <div className="wl21-ctas">
          <Link to="/profile" className="wl21-btn">
            <LogIn size={17} /> Sign in
          </Link>
          <Link to="/menu" className="wl21-btn-ghost">
            Explore the menu
          </Link>
        </div>

        <p className="wl21-note">
          <ShieldCheck size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />
          Private by design — your journal never leaves this browser
        </p>
      </div>
    </section>
  );
}

export default LoginHero;
