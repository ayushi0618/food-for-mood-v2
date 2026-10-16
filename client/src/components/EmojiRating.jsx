// 21st.dev-inspired Emoji Rating (@jatin-yadav05/emoji-rating)
// "Tap how you feel" — manual emotion picker that feeds the mood flow.
// Selecting an emoji fills the analyzer's input with a natural sentence.
import { useState } from 'react';

const EMOTIONS = [
  { id: 'happy', emoji: '😊', label: 'Happy', text: 'I am feeling really happy and cheerful today.' },
  { id: 'celebrating', emoji: '🥳', label: 'Celebrating', text: 'I got great news and want to celebrate!' },
  { id: 'sad', emoji: '😢', label: 'Sad', text: 'I feel sad and low today.' },
  { id: 'stressed', emoji: '😰', label: 'Stressed', text: 'I am stressed and anxious about my deadlines.' },
  { id: 'tired', emoji: '😴', label: 'Tired', text: 'I am exhausted after a long, draining day.' },
  { id: 'sick', emoji: '🤒', label: 'Unwell', text: 'I have a cold and feel under the weather.' },
  { id: 'angry', emoji: '😠', label: 'Angry', text: 'I am frustrated and angry right now.' },
  { id: 'bored', emoji: '😑', label: 'Bored', text: 'I am bored and have nothing interesting to do.' },
  { id: 'romantic', emoji: '😍', label: 'Romantic', text: 'Planning a romantic dinner tonight.' },
  { id: 'nostalgic', emoji: '🥹', label: 'Nostalgic', text: 'Feeling nostalgic, missing home and childhood days.' },
  { id: 'hungry', emoji: '😋', label: 'Hungry', text: 'I am starving and craving something delicious.' },
  { id: 'curious', emoji: '🤔', label: 'Curious', text: 'Feeling curious, surprise me with something new.' },
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
            <span className="emoji-glyph">{e.emoji}</span>
            <span className="emoji-label">{e.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmojiRating;
