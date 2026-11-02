import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Heart } from 'lucide-react';
import CarCard from '../components/CarCard';
import { cars } from '../data/cars';
import { useShowroom } from '../state';
export default function Collection() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const brand = params.get('brand') || 'All';
  const sort = params.get('sort') || 'curated';
  const savedOnly = params.get('saved') === '1';
  const { saved } = useShowroom();
  useEffect(() => {
    document.title = 'مجموعهٔ ماشین‌ها — APEX';
  }, []);
  function update(key: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }
  const filtered = useMemo(() => {
    const list = cars.filter(
      (c) =>
        (brand === 'All' || c.brand === brand) &&
        (!savedOnly || saved.includes(c.id)) &&
        `${c.name} ${c.brand} ${c.englishName} ${c.engine}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    return sort === 'price-asc'
      ? list.sort((a, b) => a.price - b.price)
      : sort === 'price-desc'
        ? list.sort((a, b) => b.price - a.price)
        : sort === 'power'
          ? list.sort((a, b) => b.power.sortValue - a.power.sortValue)
          : list;
  }, [brand, savedOnly, saved, query, sort]);
  return (
    <section className="catalog-page section-pad">
      <div className="page-intro">
        <span className="eyebrow muted">مجموعهٔ ماشین‌های APEX</span>
        <h1>
          ماشین بعدی‌ات را
          <br />
          <em>اینجا پیدا کن</em>
        </h1>
        <p>از سوپراسپرت‌های خاص تا کلاسیک‌های ماندگار؛ انتخاب تو کدام است؟</p>
      </div>
      <div className="catalog-controls">
        <label className="search-input">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => {
              update('q', e.target.value);
            }}
            placeholder="جست‌وجوی برند، مدل یا پیشرانه"
            aria-label="جست‌وجوی ماشین"
          />
          {query && (
            <button
              aria-label="پاک کردن جست‌وجو"
              onClick={() => {
                update('q', '');
              }}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <button
          className={`saved-filter ${savedOnly ? 'active' : ''}`}
          onClick={() => update('saved', savedOnly ? '' : '1')}
        >
          <Heart size={16} fill={savedOnly ? 'currentColor' : 'none'} /> ذخیره‌شده ({saved.length})
        </button>
        <label className="sort-select">
          <SlidersHorizontal size={16} />
          <span className="sr-only">مرتب‌سازی ماشین‌ها</span>
          <select value={sort} onChange={(e) => update('sort', e.target.value)}>
            <option value="curated">انتخاب نمایشگاه</option>
            <option value="price-asc">قیمت: کم به زیاد</option>
            <option value="price-desc">قیمت: زیاد به کم</option>
            <option value="power">قدرت: زیاد به کم</option>
          </select>
        </label>
      </div>
      <div className="catalog-filters">
        {['All', ...cars.map((c) => c.brand)].map((b) => (
          <button
            key={b}
            className={`filter-pill ${brand === b ? 'active' : ''}`}
            onClick={() => update('brand', b === 'All' ? '' : b)}
          >
            {b === 'All' ? 'همهٔ ماشین‌ها' : b}
          </button>
        ))}
        <span>{String(filtered.length).padStart(2, '0')} ماشین</span>
      </div>
      {filtered.length ? (
        <div className="car-grid">
          {filtered.map((car, i) => (
            <CarCard key={car.id} car={car} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={32} />
          <h2>ماشینی با این مشخصات پیدا نشد</h2>
          <p>عبارت دیگری جست‌وجو کن یا فیلترها را بردار.</p>
          <button
            className="button dark"
            onClick={() => {
              setParams({});
            }}
          >
            پاک کردن فیلترها <X size={15} />
          </button>
        </div>
      )}
      <p className="catalog-footnote">
        A portfolio collection. All asking prices and mileage are illustrative; no ماشین are offered
        for sale.
      </p>
    </section>
  );
}
