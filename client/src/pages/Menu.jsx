import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import MenuItemCard from '../components/MenuItemCard';
import CuisineChips from '../components/CuisineChips';
import { useToast } from '../toast';
import DISHES from '../data/dishes';
import { getPreferences } from '../services/store';

const CUISINES = [...new Set(DISHES.map((d) => d.cuisine))];

function Menu() {
  const pushToast = useToast();
  const prefs = getPreferences();
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState(prefs.diet); // 'any' | 'veg' | 'nonveg'
  const [spice, setSpice] = useState('any'); // 'any' | '1' | '2' | '3'
  const [sort, setSort] = useState('popular'); // 'popular' | 'price-low' | 'price-high'
  const [cuisines, setCuisines] = useState([]); // multi-select; empty = all

  const toggleCuisine = (c) =>
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const dishes = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = DISHES.filter((d) => {
      const matchesQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.cuisine.toLowerCase().includes(q) ||
        d.tags.some((t) => t.includes(q));
      const matchesDiet =
        diet === 'any' || (diet === 'veg' ? d.veg : !d.veg);
      const matchesSpice = spice === 'any' || d.spice === Number(spice);
      const matchesCuisine =
        cuisines.length === 0 || cuisines.includes(d.cuisine);
      return matchesQ && matchesDiet && matchesSpice && matchesCuisine;
    });
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, diet, spice, sort, cuisines]);

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Menu</span>
        <h1>Comfort, catalogued</h1>
        <p>
          {DISHES.length} handpicked Indian comfort dishes. Search, filter by
          diet and spice, save favorites — or add straight to your cart.
        </p>
      </div>

      <CuisineChips
        cuisines={CUISINES}
        selected={cuisines}
        onToggle={toggleCuisine}
        onClear={() => setCuisines([])}
      />

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, cuisines, tags…"
          />
        </div>
        <div className="seg">
          {[
            ['any', 'All'],
            ['veg', 'Veg'],
            ['nonveg', 'Non-veg'],
          ].map(([v, label]) => (
            <button key={v} className={diet === v ? 'on' : ''} onClick={() => setDiet(v)}>
              {label}
            </button>
          ))}
        </div>
        <div className="seg">
          {[
            ['any', 'Any spice'],
            ['1', 'Mild'],
            ['2', 'Medium'],
            ['3', 'Hot'],
          ].map(([v, label]) => (
            <button key={v} className={spice === v ? 'on' : ''} onClick={() => setSpice(v)}>
              {label}
            </button>
          ))}
        </div>
        <div className="seg">
          {[
            ['popular', 'Popular'],
            ['price-low', '₹ Low → High'],
            ['price-high', '₹ High → Low'],
          ].map(([v, label]) => (
            <button key={v} className={sort === v ? 'on' : ''} onClick={() => setSort(v)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {dishes.length === 0 ? (
        <div className="empty">
          <h3>Nothing matched</h3>
          <p>Try a different search or loosen the filters.</p>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setQuery('');
              setDiet('any');
              setSpice('any');
              setCuisines([]);
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 16, fontWeight: 600 }}>
            Showing {dishes.length} of {DISHES.length} dishes
          </p>
          <div className="mic21-grid">
            {dishes.map((d) => (
              <MenuItemCard key={d.name} dish={d} onToast={(t, b) => pushToast(t, b)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Menu;
