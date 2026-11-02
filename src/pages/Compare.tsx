import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X, Plus } from 'lucide-react';
import { cars } from '../data/cars';
import { useShowroom } from '../state';
import { money } from '../components/CarCard';
export default function Compare() {
  useEffect(() => {
    document.title = 'مقایسهٔ ماشین‌ها | APEX';
  }, []);
  const { compare, toggleCompare } = useShowroom();
  const selected = cars.filter((c) => compare.includes(c.id));
  const rows = [
    { label: 'قیمت نمایشی', values: selected.map((c) => money(c.price)) },
    { label: 'پیشرانه', values: selected.map((c) => c.engine) },
    { label: 'حداکثر قدرت', values: selected.map((c) => `${c.power.value} ${c.power.unit}`) },
    {
      label: 'شتاب',
      values: selected.map((c) => `${c.acceleration.value}s (${c.acceleration.label})`),
    },
    { label: 'حداکثر سرعت', values: selected.map((c) => `${c.topSpeed.value} ${c.topSpeed.unit}`) },
    { label: 'وزن', values: selected.map((c) => c.weight) },
    { label: 'گیربکس', values: selected.map((c) => c.transmissionShort) },
    { label: 'محور محرک', values: selected.map((c) => c.drivetrain) },
  ];
  return (
    <section className="compare-page section-pad">
      <div className="page-intro">
        <span className="eyebrow muted">انتخاب‌های تو، کنار هم</span>
        <h1>
          شخصیت‌های متفاوت
          <br />
          <em>یک عشق مشترک</em>
        </h1>
        <p>
          تا 3 ماشین را کنار هم مقایسه کن. واحد قدرت و مبنای اندازه‌گیری وزن برای هر ماشین مشخص است.
        </p>
      </div>
      {selected.length === 0 ? (
        <div className="empty-state">
          <h2>اول انتخاب‌های خودت را اضافه کن</h2>
          <p>برای مقایسه، حداقل 2 ماشین از مجموعه انتخاب کن.</p>
          <Link to="/collection" className="button dark">
            کشف مجموعه <ArrowUpRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="comparison-scroll">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>
                  <span className="eyebrow muted">جزئیات</span>
                  {selected.length < 3 && (
                    <div className="compare-choices">
                      {cars
                        .filter((c) => !compare.includes(c.id))
                        .map((c) => (
                          <button key={c.id} onClick={() => toggleCompare(c.id)}>
                            <Plus size={13} />
                            {c.shortName}
                          </button>
                        ))}
                    </div>
                  )}
                </th>
                {selected.map((c) => (
                  <th key={c.id}>
                    <button
                      className="remove-compare"
                      onClick={() => toggleCompare(c.id)}
                      aria-label={`حذف ${c.name}`}
                    >
                      <X size={16} />
                    </button>
                    <img src={c.image} alt={c.name} />
                    <span className="eyebrow muted">{c.brand}</span>
                    <Link to={`/cars/${c.id}`}>
                      {c.model}
                      <ArrowUpRight size={17} />
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((value, i) => (
                    <td key={selected[i].id}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="catalog-footnote">
        اعداد عملکرد از اطلاعات سازنده گرفته شده‌اند، مگر جایی که در صفحهٔ ماشین توضیح دیگری آمده
        باشد. PS و SAE hp دو واحد متفاوت‌اند. قیمت‌ها نمایشی هستند.
      </p>
    </section>
  );
}
