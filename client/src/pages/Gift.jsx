import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gift, ShoppingBag, Sparkles, Quote, ArrowRight } from 'lucide-react';
import { getGift, addToCart, notifyCartUpdated } from '../services/api';
import { findDish } from '../data/dishes';
import foodImages from '../data/foodImages';
import { dishImage, imgFallback } from '../utils/img';
import { MOOD_LIST } from '../utils/mood';
import MoodPlaylist from '../components/MoodPlaylist';
import { useToast } from '../toast';

// Public gift reveal page: /gift/:id — shows the dish, the note and the
// mood playlist. Anyone with the link can view it (the viral loop).
function GiftPage() {
  const { id } = useParams();
  const pushToast = useToast();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getGift(id);
        if (!cancelled) setGift(data.gift);
      } catch {
        if (!cancelled) setGift(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const orderDish = async () => {
    if (!gift || added) return;
    try {
      await addToCart({
        food: gift.dish,
        reason: `A mood gift from ${gift.fromName}`,
        price: gift.price,
        incident: 'Ordered from a gift link',
      });
      notifyCartUpdated();
      setAdded(true);
      pushToast('Added to cart', `${gift.dish} is waiting in your cart.`);
    } catch {
      pushToast('Could not add', 'The kitchen is unreachable right now.');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
          <p className="panel-sub">Unwrapping your gift…</p>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="page">
        <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
          <h2>This gift link didn't work</h2>
          <p className="panel-sub">It may be mistyped or removed.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Send your own mood <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const catalogDish = findDish(gift.dish);
  const image = dishImage(gift.dish, foodImages);
  const moodMeta = MOOD_LIST.find((m) => m.id === gift.mood) || { label: gift.mood, color: '#C2571B' };

  return (
    <div className="page">
      <div className="gift-page">
        <div className="gift-hero">
          <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#C2571B,#9C4313)', margin: '0 auto 16px' }}>
            <Gift size={28} />
          </span>
          <span className="eyebrow">Someone sent you a mood</span>
          <h1>
            For {gift.toName}, <span className="grad">with love.</span>
          </h1>
          {gift.note && (
            <div className="gift-note">
              <Quote size={18} />
              <p>{gift.note}</p>
            </div>
          )}
          <p className="panel-sub">— {gift.fromName}</p>
        </div>

        <div className="gift-dish">
          <div className="gift-dish-media">
            <img src={image} alt={gift.dish} onError={imgFallback} />
          </div>
          <div className="gift-dish-body">
            <span
              className="mood-badge"
              style={{ background: `${moodMeta.color}22`, color: moodMeta.color }}
            >
              <Sparkles size={13} /> {moodMeta.label} mood
            </span>
            <h2>{gift.dish}</h2>
            {catalogDish?.blurb && <p className="panel-sub">{catalogDish.blurb}</p>}
            <div className="gift-dish-foot">
              <b className="gift-price">₹{gift.price}</b>
              <button className="btn btn-primary" onClick={orderDish} disabled={added}>
                <ShoppingBag size={16} /> {added ? 'In your cart' : 'Order this dish'}
              </button>
            </div>
            {added && (
              <Link to="/cart" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>
                View cart <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>

        <MoodPlaylist moodId={gift.mood} moodLabel={moodMeta.label} />

        <div className="panel" style={{ textAlign: 'center', marginTop: 8 }}>
          <h3>Know someone who needs this?</h3>
          <p className="panel-sub">Pick their mood, we pick the food and the tunes.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>
            Send your own mood <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GiftPage;
