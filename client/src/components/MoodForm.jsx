import { useState } from 'react';
import { analyzeIncident } from '../services/api';
import FoodCard from './FoodCard';

function MoodForm() {

  const [incident, setIncident] = useState('');
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {

    if (!incident.trim()) return;

    try {

      setLoading(true);

      const result =
        await analyzeIncident(incident);

      setFood(result);

    } catch (error) {

      console.error(error);

      alert('Unable to get recommendation.');
    }

    setLoading(false);
  }

  return (
    <section className="section" id="analyze">

      <h2>Tell us what's happening</h2>

      <div className="form-card">

        <textarea
          value={incident}
          onChange={(e) => setIncident(e.target.value)}
          placeholder="Example: I failed my exam and it has been raining all day."
        />

        <button onClick={handleSubmit}>
          {loading ? 'Analyzing...' : 'Get Recommendation'}
        </button>

      </div>

      <FoodCard food={food} />

    </section>
  );
}

export default MoodForm;