import { Star } from 'lucide-react';

const QUOTES = [
  {
    text: 'The recommendation was surprisingly accurate. It felt personal.',
    name: 'Priya',
    detail: 'Ordered Khichdi on a sick day',
  },
  {
    text: 'Simple idea, but really fun to use after a long day.',
    name: 'Arjun',
    detail: 'Biryani after deadline week',
  },
  {
    text: 'I ended up ordering exactly what it suggested.',
    name: 'Neha',
    detail: 'Gulab Jamun for a celebration',
  },
];

function Testimonials() {
  return (
    <section className="section">
      <div className="section-head center">
        <span className="eyebrow">Loved by foodies</span>
        <h2>What users say</h2>
      </div>
      <div className="testimonial-grid">
        {QUOTES.map((q) => (
          <div className="testimonial" key={q.name}>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p>"{q.text}"</p>
            <div className="who">
              <span className="avatar">{q.name[0]}</span>
              <div>
                <b>{q.name}</b>
                <span>{q.detail}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
