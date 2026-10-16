import { useState } from 'react';
import { X, Gift, Send, Copy, Check, MessageCircle } from 'lucide-react';
import { createGift } from '../services/api';
import { MOOD_LIST } from '../utils/mood';

// Modal to compose a "Send a mood" gift: pick who it's for, your name, a
// note and the mood — then share the gift link anywhere.
function GiftModal({ dish, moodId, onClose, onToast }) {
  const [toName, setToName] = useState('');
  const [fromName, setFromName] = useState('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState(moodId || 'happy');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [giftId, setGiftId] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!dish) return null;

  const giftUrl = giftId ? `${window.location.origin}/gift/${giftId}` : '';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await createGift({
        dish: dish.name,
        price: dish.price,
        mood,
        toName: toName.trim(),
        fromName: fromName.trim(),
        note: note.trim(),
      });
      setGiftId(data.id);
      onToast?.('Gift ready', `Your mood gift for ${toName.trim()} is ready to share.`);
    } catch (err) {
      setError(err.message || 'Could not create your gift — please try again');
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy failed — long-press the link to copy it manually');
    }
  };

  const shareText = `Someone sent you a mood 🍛 "${dish.name}" + a playlist to match. Open your gift: ${giftUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="gift-overlay" onClick={onClose}>
      <div className="gift-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gift-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {!giftId ? (
          <>
            <div className="gift-head">
              <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#C2571B,#9C4313)', margin: '0 auto 12px' }}>
                <Gift size={24} />
              </span>
              <h2>Send a mood</h2>
              <p className="panel-sub" style={{ margin: 0 }}>
                {dish.name} · ₹{dish.price} — plus a {mood} playlist, wrapped up for someone.
              </p>
            </div>

            <form onSubmit={submit}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="field">
                  <label>It's for</label>
                  <input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="e.g. Priya" maxLength={40} required />
                </div>
                <div className="field">
                  <label>From</label>
                  <input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your name" maxLength={40} required />
                </div>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="field">
                  <label>Their mood</label>
                  <div className="choice-row" style={{ flexWrap: 'wrap' }}>
                    {MOOD_LIST.slice(0, 8).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`choice ${mood === m.id ? 'on' : ''}`}
                        onClick={() => setMood(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>A note for them <span style={{ fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Heard you had a rough day — this always fixes mine."
                    maxLength={280}
                    rows={3}
                  />
                </div>
              </div>

              {error && <p style={{ color: '#B3261E', fontSize: '0.9rem' }}>{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%', marginTop: 8 }}>
                {busy ? 'Wrapping it up…' : (<><Send size={16} /> Create gift link</>)}
              </button>
            </form>
          </>
        ) : (
          <div className="gift-done">
            <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#3E7C4F,#2A5A38)', margin: '0 auto 12px' }}>
              <Check size={24} />
            </span>
            <h2>Gift ready 🎁</h2>
            <p className="panel-sub">Send this link to {toName} — it opens your gift with the dish, your note and the playlist.</p>
            <div className="gift-link-row">
              <code>{giftUrl}</code>
              <button className="btn btn-ghost btn-sm" onClick={copyLink}>
                {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
              </button>
            </div>
            {error && <p style={{ color: '#B3261E', fontSize: '0.9rem' }}>{error}</p>}
            <div className="gift-share-row">
              <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle size={16} /> Share on WhatsApp
              </a>
              <button className="btn btn-ghost" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GiftModal;
