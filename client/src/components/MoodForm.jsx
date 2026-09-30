import { useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { analyzeIncident, notifyCartUpdated } from '../services/api';
import { logJournalEntry } from '../services/store';
import { detectMood, MOOD_SUGGESTIONS } from '../utils/mood';
import FoodCard from './FoodCard';

function MoodForm() {
  const [incident, setIncident] = useState('');
  const [result, setResult] = useState(null);
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          Describe your day in a sentence or two. Gemini reads the emotional
          context and plates up one perfect comfort dish.
        </p>
      </div>

      <div className="analyze-card">
        <textarea
          value={incident}
          onChange={(e) => setIncident(e.target.value)}
          placeholder="Example: I failed my exam and it has been raining all day."
          rows={4}
          maxLength={500}
        />

        <div className="mood-chips">
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

        <button
          className="btn btn-primary btn-block"
          onClick={handleSubmit}
          disabled={loading || !incident.trim()}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spinner" style={{ border: 'none' }} />
              Reading your mood…
            </>
          ) : (
            <>
              <BrainCircuit size={18} /> Get my recommendation
            </>
          )}
        </button>

        {error && <div className="mood-error">{error}</div>}
      </div>

      {result && <FoodCard food={result} mood={mood} onNew={() => {
        setResult(null);
        setIncident('');
      }} />}
    </section>
  );
}

export default MoodForm;
