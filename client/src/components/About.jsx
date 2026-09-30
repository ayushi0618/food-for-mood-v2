import { MessageSquareText, BrainCircuit, UtensilsCrossed } from 'lucide-react';

const STEPS = [
  {
    icon: MessageSquareText,
    title: 'Describe your situation',
    text: 'Share your mood, event or situation in a few words — no account needed, no judgment.',
  },
  {
    icon: BrainCircuit,
    title: 'AI reads the emotion',
    text: 'Gemini understands the emotional context and matches it against Indian comfort-food wisdom.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Get your perfect dish',
    text: 'Receive one tailored recommendation with the reasoning, nutrition snapshot and price.',
  },
];

function About() {
  return (
    <section className="section">
      <div className="section-head center">
        <span className="eyebrow">How it works</span>
        <h2>From feeling to food in three steps</h2>
        <p>A simple loop: express, analyze, enjoy — then watch your patterns in Insights.</p>
      </div>
      <div className="info-grid">
        {STEPS.map((s, i) => (
          <div className="info-card" key={s.title}>
            <div className="step-num">{i + 1}</div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default About;
