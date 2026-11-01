// 21st.dev-inspired Emoji Rating (@jatin-yadav05/emoji-rating)
// "Tap how you feel" — manual emotion picker that feeds the mood flow.
// Selecting a mood fills the analyzer's input with a natural sentence.
// NOTE 1 Nov 2026 (Ayushi's call): emojis removed — text-only mood pills.
import { useState } from 'react';

const EMOTIONS = [
  { id: 'happy', label: 'Happy', text: 'I am feeling really happy and cheerful today.' },
  { id: 'celebrating', label: 'Celebrating', text: 'I got great news and want to celebrate!' },
  { id: 'sad', label: 'Sad', text: 'I feel sad and low today.' },
  { id: 'stressed', label: 'Stressed', text: 'I am stressed and anxious about my deadlines.' },
  { id: 'tired', label: 'Tired', text: 'I am exhausted after a long, draining day.' },
  { id: 'sick', label: 'Unwell', text: 'I have a cold and feel under the weather.' },
  { id: 'angry', label: 'Angry', text: 'I am frustrated and angry right now.' },
  { id: 'bored', label: 'Bored', text: 'I am bored and have nothing interesting to do.' },
  { id: 'romantic', label: 'Romantic', text: 'Planning a romantic dinner tonight.' },
  { id: 'nostalgic', label: 'Nostalgic', text: 'Feeling nostalgic, missing home and childhood days.' },
  { id: 'hungry', label: 'Hungry', text: 'I am starving and craving something delicious.' },
  { id: 'curious', label: 'Curious', text: 'Feeling curious, surprise me with something new.' },
];

function EmojiRating({ onPick, selected }) {
  const [active, setActive] = useState(selected || null);

  const pick = (e) => {
    setActive(e.id);
    onPick?.(e);
  };

  return (
    <div className="emoji-rate">
      <p className="emoji-rate-title">Or tap how you feel right now</p>
      <div className="emoji-track" role="radiogroup" aria-label="How are you feeling">
        {EMOTIONS.map((e) => (
          <button
            key={e.id}
            type="button"
            role="radio"
            aria-checked={active === e.id}
            title={e.label}
            className={`emoji-item ${active === e.id ? 'on' : ''}`}
            onClick={() => pick(e)}
          >
            <span className="emoji-label">{e.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmojiRating;
