// 21st.dev-inspired Cuisine Selector Chips (@uniquesonu/cuisine-selector-chips)
// Animated multi-select cuisine chips with checkmarks for the Menu page.
import { Check } from 'lucide-react';

function CuisineChips({ cuisines, selected, onToggle, onClear }) {
  const allOn = selected.length === 0;

  return (
    <div className="chips21">
      <button
        type="button"
        className={`chip21 ${allOn ? 'on' : ''}`}
        onClick={onClear}
      >
        {allOn && <Check size={13} />}
        All cuisines
      </button>
      {cuisines.map((c) => {
        const on = selected.includes(c);
        return (
          <button
            key={c}
            type="button"
            className={`chip21 ${on ? 'on' : ''}`}
            onClick={() => onToggle(c)}
            aria-pressed={on}
          >
            {on && <Check size={13} />}
            {c}
          </button>
        );
      })}
    </div>
  );
}

export default CuisineChips;
