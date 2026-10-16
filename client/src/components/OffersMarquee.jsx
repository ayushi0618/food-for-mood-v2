// 21st.dev-style infinite marquee strip announcing live offers.
// Pure CSS animation, duplicated content for a seamless loop.
import { BadgePercent } from 'lucide-react';
import OFFERS from '../data/offers';

function OffersMarquee() {
  const items = [...OFFERS, ...OFFERS, ...OFFERS];
  return (
    <div className="marquee21" aria-hidden="true">
      <div className="marquee21-track">
        {items.map((o, i) => (
          <span className="marquee21-item" key={`${o.code}-${i}`}>
            <BadgePercent size={14} />
            <b>{o.code}</b> · {o.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export default OffersMarquee;
