import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Rotate3D,
  Check,
  Plus,
  ExternalLink,
  ArrowRight,
  ChevronRight,
  X,
  Maximize2,
} from 'lucide-react';
import { cars } from '../data/cars';
import type { Car } from '../data/cars';
import { useShowroom } from '../state';
import { money } from '../components/CarCard';
import CarCard from '../components/CarCard';
import EnquiryDialog from '../components/EnquiryDialog';
import RichText from '../components/RichText';

const featureNames = ['پیشرانه', 'ساختار و شاسی', 'سیستم ترمز'];
function getFeature(car: Car, index: number) {
  const group = car.specs[index === 0 ? 0 : index === 1 ? 1 : 3];
  return {
    title: index === 0 ? car.engine : index === 1 ? car.drivetrain : group.items[0][1],
    items: group.items
      .filter(([key]) => index !== 0 || !['شتاب', 'بیشینهٔ سرعت', 'بیشینهٔ توان'].includes(key))
      .slice(0, 4),
  };
}
function Instrument({
  value,
  unit,
  label,
  note,
}: {
  value: string;
  unit: string;
  label: string;
  note: string;
}) {
  return (
    <div className="performance-instrument">
      <div className="instrument-dial">
        <svg viewBox="0 0 300 230" aria-hidden="true">
          <path className="instrument-track" d="M 35.805 197.25 A 126 126 0 1 1 264.195 197.25" />
          <path className="instrument-accent" d="M 35.805 197.25 A 126 126 0 1 1 264.195 197.25" />
          <g className="instrument-ticks">
            {Array.from({ length: 31 }, (_, i) => (
              <line
                key={i}
                x1="150"
                x2="150"
                y1="18"
                y2={i % 5 === 0 ? 31 : 25}
                transform={`rotate(${-115 + i * (230 / 30)} 150 144)`}
              />
            ))}
          </g>
        </svg>
        <div className="instrument-value">
          <strong>{value}</strong>
          <span>{unit}</span>
        </div>
      </div>
      <h3>
        <RichText text={label} />
      </h3>
      <p>
        <RichText text={note} />
      </p>
    </div>
  );
}
export default function Detail() {
  const { id } = useParams();
  const car = cars.find((c) => c.id === id);
  const { saved, toggleSaved, compare, toggleCompare } = useShowroom();
  const [enquiry, setEnquiry] = useState(false);
  const [category, setCategory] = useState(0);
  const [feature, setFeature] = useState(0);
  const [gallery, setGallery] = useState(0);
  const [largeImage, setLargeImage] = useState(false);
  const imageDialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    setCategory(0);
    setFeature(0);
    setGallery(0);
    setEnquiry(false);
    document.title = car ? `${car.name} — APEX` : 'ماشین پیدا نشد | APEX';
  }, [car]);
  useEffect(() => {
    if (!largeImage) return;
    const dialog = imageDialog.current;
    dialog?.showModal();
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLargeImage(false);
    };
    document.addEventListener('keydown', close);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.removeEventListener('keydown', close);
      document.body.style.overflow = previous;
    };
  }, [largeImage]);
  if (!car)
    return (
      <section className="not-found">
        <h1>این ماشین در مجموعه نیست</h1>
        <Link className="button dark" to="/collection">
          بازگشت به مجموعه
        </Link>
      </section>
    );
  const selectedFeature = getFeature(car, feature);
  const isSaved = saved.includes(car.id);
  const galleryViews = ['نمای کامل ماشین', 'خطوط بدنه از نزدیک', 'جزئیات چرخ‌ها'];
  return (
    <div className="vehicle-page" style={{ '--accent': car.accent } as React.CSSProperties}>
      <section className="vehicle-cover">
        <img
          className="vehicle-cover-image"
          src={car.heroImage}
          alt={`${car.name}، نمای سه‌ربع جلو`}
          fetchPriority="high"
        />
        <div className="vehicle-cover-shade" />
        <Link className="vehicle-back" to="/collection">
          <ArrowLeft size={16} /> مجموعهٔ ماشین‌ها
        </Link>
        <div className="vehicle-heading">
          <span className="overline">
            {car.brand} · {car.year}
          </span>
          <h1>{car.shortName}</h1>
          <p>
            <RichText text={car.headline} />
          </p>
        </div>
        <button
          className={`vehicle-save ${isSaved ? 'saved' : ''}`}
          onClick={() => toggleSaved(car.id)}
          aria-label={isSaved ? 'حذف از ذخیره‌ها' : 'ذخیرهٔ ماشین'}
          aria-pressed={isSaved}
        >
          <Heart size={21} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <div className="vehicle-cover-bottom">
          <span>{car.colorName}</span>
          <Link to={`/studio?car=${car.id}`}>
            <Rotate3D size={20} /> کشف نمای 360° <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <nav
        className="vehicle-subnav"
        aria-label="بخش‌های مشخصات ماشین"
        onClick={(event) => {
          const target = (event.target as HTMLElement).closest('a');
          if (target) {
            event.preventDefault();
            document
              .getElementById(target.hash.slice(1))
              ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
          }
        }}
      >
        <a href="#performance">عملکرد</a>
        <a href="#engineering">مهندسی</a>
        <a href="#gallery">گالری</a>
        <a href="#specifications">مشخصات فنی</a>
        <button onClick={() => setEnquiry(true)}>
          ثبت درخواست نمایشی <ArrowUpRight size={15} />
        </button>
      </nav>
      <section className="vehicle-performance section-pad" id="performance">
        <div className="performance-heading">
          <span className="overline muted">هیجان، به زبان عدد</span>
          <h2>
            فراتر از انتظار
            <br />
            در هر معیار
          </h2>
        </div>
        <div className="performance-instruments">
          <Instrument
            value={car.power.value}
            unit={car.power.unit}
            label="حداکثر قدرت"
            note={car.id === 'revuelto' ? 'مجموع قدرت سامانهٔ هیبریدی' : 'حداکثر قدرت پیشرانه'}
          />
          <Instrument
            value={
              car.acceleration.value === '—'
                ? car.engine.match(/^[\d.]+/)?.[0] || '—'
                : car.acceleration.value
            }
            unit={car.acceleration.value === '—' ? 'لیتر' : 'ثانیه'}
            label={car.acceleration.value === '—' ? 'حجم پیشرانه' : car.acceleration.label}
            note={car.id === 'mustang' ? 'اعلام سازنده · 0–60 mph' : 'با مبنای اندازه‌گیری درج‌شده'}
          />
          <Instrument
            value={car.topSpeed.value === '—' ? car.weight.split(' ')[0] : car.topSpeed.value}
            unit={car.topSpeed.value === '—' ? 'kg' : car.topSpeed.unit}
            label={car.topSpeed.value === '—' ? 'وزن آمادهٔ حرکت' : 'حداکثر سرعت'}
            note="جزئیات شرایط در بخش منابع"
          />
        </div>
      </section>
      <section className="vehicle-story section-pad">
        <span className="overline muted">{car.tag}</span>
        <div>
          <h2>{car.storyTitle}</h2>
          <p>
            <RichText text={car.description} />
          </p>
          <div className="vehicle-highlights">
            {car.highlights.map((h) => (
              <span key={h}>
                <Check size={15} /> <RichText text={h} />
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="vehicle-engineering" id="engineering">
        <div className="engineering-header">
          <span className="overline">زیر پوست ماشین</span>
          <h2>
            پشت هر جزئیات
            <br />
            یک دلیل هست
          </h2>
        </div>
        <div className={`engineering-image feature-${feature}`}>
          <img
            src={car.image}
            alt={`${car.name}؛ نمای بیرونی با نقاط تعاملی مهندسی`}
            loading="lazy"
          />
        </div>
        <div className="engineering-hotspots" role="group" aria-label="دیدن جزئیات مهندسی">
          {featureNames.map((name, i) => (
            <button
              key={name}
              className={`engineering-hotspot hotspot-${i} ${feature === i ? 'active' : ''}`}
              aria-label={`دیدن ${name}`}
              aria-pressed={feature === i}
              onClick={() => setFeature(i)}
            >
              <Plus size={20} />
              <span>{name}</span>
            </button>
          ))}
        </div>
        <div className="engineering-panel">
          <div className="engineering-tabs" role="tablist" aria-label="دسته‌های مهندسی">
            {featureNames.map((name, i) => (
              <button
                key={name}
                id={`feature-tab-${i}`}
                role="tab"
                aria-selected={feature === i}
                aria-controls="engineering-content"
                tabIndex={feature === i ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const next = (feature + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
                    setFeature(next);
                    document.getElementById(`feature-tab-${next}`)?.focus();
                  }
                }}
                className={feature === i ? 'active' : ''}
                onClick={() => setFeature(i)}
              >
                {name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={feature}
              id="engineering-content"
              role="tabpanel"
              aria-labelledby={`feature-tab-${feature}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
            >
              <h3>
                <RichText text={selectedFeature.title} />
              </h3>
              <div className="engineering-data">
                {selectedFeature.items.map(([key, value]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>
                      <RichText text={value} />
                    </strong>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      <section className="vehicle-gallery section-pad" id="gallery">
        <div className="collection-title-row">
          <div>
            <span className="overline muted">نگاهی نزدیک‌تر</span>
            <h2>
              طراحی‌ای که
              <br />
              نگاه را نگه می‌دارد
            </h2>
          </div>
          <span className="gallery-credit">تصاویر نمایشی با طراحی هنری هوش مصنوعی</span>
        </div>
        <button
          className={`gallery-main gallery-view-${gallery}`}
          onClick={() => setLargeImage(true)}
          aria-label={`بزرگ‌نمایی ${galleryViews[gallery]}`}
        >
          <img src={car.image} alt={`${car.name}: ${galleryViews[gallery]}`} loading="lazy" />
          <span>
            <Maximize2 size={18} /> دیدن عکس
          </span>
        </button>
        <div className="gallery-controls">
          <p>{galleryViews[gallery]}</p>
          <div role="group" aria-label="انتخاب جزئیات عکس">
            {['نمای کامل', 'بدنه', 'چرخ‌ها'].map((label, i) => (
              <button
                key={label}
                className={gallery === i ? 'active' : ''}
                aria-pressed={gallery === i}
                onClick={() => setGallery(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <Link to={`/studio?car=${car.id}`}>
            همهٔ زاویه‌ها <Rotate3D size={18} />
          </Link>
        </div>
      </section>
      <section className="vehicle-specifications section-pad" id="specifications">
        <div className="spec-heading">
          <span className="overline muted">همهٔ مشخصات</span>
          <h2>ماشین را بهتر بشناس</h2>
          <p>از پیشرانه تا شاسی؛ جزئیات مهم، در دسترس تو</p>
        </div>
        <div className="technical-tabs" role="tablist" aria-label="دسته‌های مشخصات فنی">
          {car.specs.map((s, i) => (
            <button
              id={`spec-tab-${i}`}
              key={s.title}
              role="tab"
              aria-selected={category === i}
              aria-controls="technical-panel"
              tabIndex={category === i ? 0 : -1}
              className={category === i ? 'active' : ''}
              onClick={() => setCategory(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const next =
                    (category + (e.key === 'ArrowRight' ? 1 : car.specs.length - 1)) %
                    car.specs.length;
                  setCategory(next);
                  document.getElementById(`spec-tab-${next}`)?.focus();
                }
              }}
            >
              {s.title}
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
        <div
          id="technical-panel"
          role="tabpanel"
          aria-labelledby={`spec-tab-${category}`}
          className="technical-panel"
          tabIndex={0}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.dl
              key={`${car.id}-${category}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
              className="technical-grid"
            >
              {car.specs[category].items.map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>
                    <RichText text={value} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          </AnimatePresence>
        </div>
        <details className="vehicle-source-notes">
          <summary>
            توضیحات و منابع مشخصات <Plus size={18} />
          </summary>
          <p>
            <RichText text={car.specNote} />
          </p>
          {car.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.title} <ExternalLink size={13} />
            </a>
          ))}
          <p>
            رنگ‌ها، تصاویر، قیمت‌ها و کارکردها نمایشی هستند. مدل‌های 360° توسط هنرمندان مستقل ساخته
            شده‌اند و ممکن است با جزئیات نسخهٔ کارخانه تفاوت داشته باشند.
          </p>
        </details>
      </section>
      <section className="vehicle-acquisition section-pad">
        <div>
          <span className="overline">انتخاب بعدی تو</span>
          <h2>این همون ماشین توئه؟</h2>
          <p>
            {car.year} <span> / </span> {car.mileage} <span> / </span> {car.transmissionShort}
          </p>
        </div>
        <div className="acquisition-action">
          <span>قیمت نمایشی</span>
          <strong>{money(car.price)}</strong>
          <button className="button light" onClick={() => setEnquiry(true)}>
            ثبت درخواست نمایشی <ArrowUpRight size={18} />
          </button>
          <button
            className="acquisition-compare"
            aria-pressed={compare.includes(car.id)}
            onClick={() => toggleCompare(car.id)}
          >
            {compare.includes(car.id) ? <Check size={15} /> : <Plus size={15} />}
            {compare.includes(car.id) ? 'به مقایسه اضافه شد' : 'افزودن به مقایسه'}
          </button>
        </div>
      </section>
      <section className="section-pad related-section">
        <div className="collection-title-row">
          <div>
            <span className="overline muted">هنوز کشف‌کردنی هست</span>
            <h2>
              یک تعریف دیگر
              <br />
              OF فراتر از انتظار
            </h2>
          </div>
          <Link className="collection-all" to="/collection">
            کل مجموعه <ArrowRight size={18} />
          </Link>
        </div>
        <div className="car-grid">
          {cars
            .filter((c) => c.id !== car.id)
            .slice(0, 2)
            .map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
        </div>
      </section>
      {enquiry && (
        <EnquiryDialog
          car={car}
          initialFinish={car.colors[0].name}
          onClose={() => setEnquiry(false)}
        />
      )}
      {largeImage && (
        <dialog
          ref={imageDialog}
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${car.name}؛ عکس بزرگ ماشین`}
          onCancel={() => setLargeImage(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setLargeImage(false);
          }}
        >
          <button
            autoFocus
            className="lightbox-close"
            aria-label="بستن عکس"
            onClick={() => setLargeImage(false)}
          >
            <X size={24} />
          </button>
          <img src={car.image} alt={car.name} />
          <p>{car.name} · تصویر نمایشی</p>
        </dialog>
      )}
    </div>
  );
}
