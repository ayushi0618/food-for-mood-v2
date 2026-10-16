// Mood analyzer section — rebuilt with 21st.dev components:
// CameraPermissionCard (onboarding) + EmojiRating (tap-how-you-feel) +
// PromptBox (rich AI prompt box w/ voice input + selfie upload).
// Analysis flow, journaling, cart and toasts are unchanged.
import { useState } from 'react';
import { analyzeIncident, notifyCartUpdated } from '../services/api';
import { logJournalEntry } from '../services/store';
import { detectMood, MOOD_SUGGESTIONS } from '../utils/mood';
import FoodCard from './FoodCard';
import CameraPermissionCard from './CameraPermissionCard';
import EmojiRating from './EmojiRating';
import PromptBox from './PromptBox';

function MoodForm() {
  const [incident, setIncident] = useState('');
  const [result, setResult] = useState(null);
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);

  async function handleSubmit() {
    if (!incident.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeIncident(incident.trim());
      if (data.error) throw new Error(data.error);
      const detected = detectMood(incident);
      setMood(detected);
      setResult(data);
      // The backend already saved this recommendation to the cart (status 'cart').
      logJournalEntry({
        incident,
        mood: detected.label,
        food: data.food,
        price: data.price,
        orderId: data.orderId,
      });
      notifyCartUpdated();
    } catch (err) {
      console.error(err);
      setError(
        'The AI chef is taking a break. Please check your connection and try again.'
      );
    }
    setLoading(false);
  }

  return (
    <section className="section" id="analyze">
      <div className="section-head center">
        <span className="eyebrow">Mood analyzer</span>
        <h2>Tell us what's happening</h2>
        <p>
          Describe your day, tap an emoji, or just speak — Gemini reads the
          emotional context and plates up one perfect comfort dish.
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <CameraPermissionCard />

        <EmojiRating
          onPick={(e) => setIncident(e.text)}
        />

        <div style={{ marginTop: 22 }}>
          <PromptBox
            value={incident}
            onChange={setIncident}
            onSubmit={handleSubmit}
            loading={loading}
            onVoiceTranscript={(t) => setIncident(t)}
            onPhoto={setPhoto}
            photoAttached={photo}
            onClearPhoto={() => setPhoto(null)}
          />
        </div>

        <div className="mood-chips" style={{ marginTop: 18 }}>
          {MOOD_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              className="mood-chip"
              onClick={() => setIncident(s.text)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && <div className="mood-error">{error}</div>}
      </div>

      {result && (
        <FoodCard
          food={result}
          mood={mood}
          onNew={() => {
            setResult(null);
            setIncident('');
            setPhoto(null);
          }}
        />
      )}
    </section>
  );
}

export default MoodForm;
