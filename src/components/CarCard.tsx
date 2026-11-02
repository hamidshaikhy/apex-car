import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Plus, Check, Rotate3D } from 'lucide-react';
import { useShowroom } from '../state';
import { motion, useReducedMotion } from 'framer-motion';
import type { Car } from '../data/cars';
export const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
export default function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  const { saved, toggleSaved, compare, toggleCompare } = useShowroom();
  const reduced = useReducedMotion();
  return (
    <motion.article
      className="car-card"
      initial={reduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, delay: (index % 2) * 0.08, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      <div className="card-visual">
        <Link to={`/cars/${car.id}`} className="card-image-link" aria-label={`کشف ${car.name}`}>
          <motion.img
            whileHover={reduced ? undefined : { scale: 1.035, transition: { duration: 0.5 } }}
            variants={{
              hidden: { clipPath: 'inset(100% 0% 0% 0%)', y: 28, scale: 1.035 },
              visible: {
                clipPath: 'inset(0% 0% 0% 0%)',
                y: 0,
                scale: 1,
                transition: { duration: 0.95, delay: 0.08, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            src={car.image}
            alt={`${car.name} با رنگ ${car.colorName}`}
            loading="lazy"
            width="900"
            height="600"
          />
        </Link>
        <button
          className={`save-button ${saved.includes(car.id) ? 'saved' : ''}`}
          aria-label={`${saved.includes(car.id) ? 'حذف از ذخیره‌ها' : 'ذخیرهٔ'} ${car.name}`}
          aria-pressed={saved.includes(car.id)}
          onClick={() => toggleSaved(car.id)}
        >
          <Heart size={19} fill={saved.includes(car.id) ? 'currentColor' : 'none'} />
        </button>
        <Link className="view-3d" to={`/studio?car=${car.id}`}>
          <Rotate3D size={14} /> نمای 360°
        </Link>
      </div>
      <div className="card-info">
        <span className="eyebrow muted">{car.brand}</span>
        <Link className="card-name" to={`/cars/${car.id}`}>
          {car.model}
        </Link>
        <p className="card-meta">
          {car.year}
          <span /> {car.mileage}
          <span /> {car.transmissionShort}
        </p>
        <div className="card-performance-line">
          <span>{car.engine.split(' + ')[0]}</span>
          <span>
            {car.power.value} {car.power.unit}
          </span>
          {car.acceleration.value !== '—' && <span dir="ltr">{car.acceleration.value} s</span>}
        </div>
        <div className="card-price-row">
          <div>
            <span className="price-label">قیمت نمایشی</span>
            <strong>{money(car.price)}</strong>
          </div>
          <Link className="circle-arrow" to={`/cars/${car.id}`} aria-label={`دیدن ${car.name}`}>
            <ArrowUpRight size={21} />
          </Link>
        </div>
        <button
          className={`compare-add ${compare.includes(car.id) ? 'selected' : ''}`}
          onClick={() => toggleCompare(car.id)}
          aria-pressed={compare.includes(car.id)}
        >
          {compare.includes(car.id) ? <Check size={13} /> : <Plus size={13} />}{' '}
          {compare.includes(car.id) ? 'به مقایسه اضافه شد' : 'مقایسهٔ این ماشین'}
        </button>
      </div>
    </motion.article>
  );
}
