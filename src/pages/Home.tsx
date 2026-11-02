import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Rotate3D,
  MoveHorizontal,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
} from 'lucide-react';
import { cars } from '../data/cars';
import CarCard from '../components/CarCard';
import { useExperienceReady } from '../components/ExperienceLoader';

const featuredCars = cars.slice(0, 4);
export default function Home() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  const experienceReady = useExperienceReady();
  const [brand, setBrand] = useState('همهٔ ماشین‌ها');
  const [sort, setSort] = useState('curated');
  const car = featuredCars[active];
  const reduced = useReducedMotion();
  const shouldPlay =
    experienceReady && !reduced && !paused && inView && pageVisible && !hovered && !keyboardFocus;
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => setInView(entries[0].isIntersecting), {
      threshold: 0.2,
    });
    if (hero.current) observer.observe(hero.current);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    if (!experienceReady || reduced || !progressBar.current) return;
    const current = progressBar.current.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      {
        duration: 6800,
        easing: 'cubic-bezier(.12,.65,.22,1)',
        fill: 'forwards',
      },
    );
    current.pause();
    current.onfinish = () => setActive((index) => (index + 1) % featuredCars.length);
    animation.current = current;
    return () => {
      current.onfinish = null;
      current.cancel();
      animation.current = null;
    };
  }, [active, cycle, experienceReady, reduced]);
  useEffect(() => {
    if (shouldPlay) animation.current?.play();
    else animation.current?.pause();
  }, [shouldPlay, active, cycle, experienceReady, reduced]);
  useEffect(() => {
    document.title = 'APEX | نمایشگاه ماشین‌های خاص';
  }, []);
  const visible = cars
    .filter((c) => brand === 'همهٔ ماشین‌ها' || c.brand === brand)
    .sort((a, b) =>
      sort === 'price'
        ? a.price - b.price
        : sort === 'power'
          ? b.power.sortValue - a.power.sortValue
          : 0,
    );
  function scrollToCollection() {
    document
      .getElementById('collection')
      ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
  }
  return (
    <>
      <section
        ref={hero}
        className="cinema-hero"
        aria-roledescription="carousel"
        aria-label="ماشین‌های منتخب نمایشگاه"
        style={{ '--accent': car.accent } as React.CSSProperties}
      >
        {featuredCars.map((item, index) => (
          <motion.img
            key={item.id}
            className="cinema-image"
            src={item.heroImage}
            alt={active === index ? `${item.name} در فضای نمایشگاه` : ''}
            aria-hidden={active !== index}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            initial={false}
            animate={{
              opacity: active === index ? 1 : 0,
              scale: reduced || active === index ? 1 : 1.035,
            }}
            transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        <div className="cinema-shade" />
        <div className="cinema-copy">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: reduced ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="hero-car-brand" dir="ltr">
                {car.brand}
              </span>
              <h1 dir="ltr">{car.shortName}</h1>
            </motion.div>
          </AnimatePresence>
        </div>
        <Link to={`/cars/${car.id}`} className="hero-vehicle-label">
          <span>{car.brand}</span>
          <strong>{car.model}</strong>
          <ArrowUpRight size={19} />
        </Link>
        <div className="cinema-footer">
          <div className="cinema-performance" key={car.id}>
            <div className="cinema-values">
              <div>
                <strong>
                  {car.power.value}
                  <small>{car.power.unit}</small>
                </strong>
                <span>حداکثر قدرت</span>
              </div>
              <div>
                <strong>
                  {car.acceleration.value}
                  <small>s</small>
                </strong>
                <span>{car.acceleration.label}</span>
              </div>
              <div>
                <strong>
                  {car.topSpeed.value}
                  <small>km/h</small>
                </strong>
                <span>حداکثر سرعت</span>
              </div>
            </div>
          </div>
          <button
            className="cinema-slideshow-toggle"
            disabled={!!reduced}
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? 'پخش اسلایدهای نمایشگاه' : 'توقف اسلایدهای نمایشگاه'}
            aria-pressed={paused}
            title={paused ? 'پخش اسلایدها' : 'توقف اسلایدها'}
          >
            {paused || reduced ? <Play size={13} /> : <Pause size={13} />}
          </button>
          <div
            className="cinema-selector"
            role="group"
            aria-label="انتخاب ماشین هیرو"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocusCapture={(event) => {
              if (event.target.matches(':focus-visible')) setKeyboardFocus(true);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node))
                setKeyboardFocus(false);
            }}
          >
            {featuredCars.map((item, i) => (
              <button
                key={item.id}
                className={active === i ? 'active' : ''}
                aria-pressed={active === i}
                aria-label={`نمایش ${item.name}`}
                onClick={() => {
                  setActive(i);
                  setCycle((value) => value + 1);
                }}
              >
                <img src={item.image} alt="" />
                <span>{item.shortName}</span>
                <i className="selector-progress-track" aria-hidden="true">
                  <span
                    className="selector-progress-fill"
                    ref={active === i ? progressBar : null}
                    style={{ transform: reduced && active === i ? 'scaleX(1)' : 'scaleX(0)' }}
                  />
                </i>
              </button>
            ))}
          </div>
        </div>
        <button className="cinema-scroll" onClick={scrollToCollection} aria-label="رفتن به مجموعه">
          <ArrowDown size={16} />
        </button>
      </section>
      <section className="apex-collection section-pad" id="collection">
        <div className="collection-title-row">
          <div>
            <span className="overline muted">هر ماشین، یک شخصیت</span>
            <h2>
              مجموعهٔ{' '}
              <bdi className="collection-wordmark" dir="ltr">
                APEX
              </bdi>
            </h2>
            <p>انتخاب‌شده برای متفاوت بودن</p>
          </div>
          <Link to="/collection" className="collection-all">
            دیدن همهٔ ماشین‌ها <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="apex-filter-row">
          <div className="apex-brand-filters" aria-label="فیلتر بر اساس برند">
            {['همهٔ ماشین‌ها', ...cars.map((c) => c.brand)].map((b) => (
              <button
                key={b}
                className={brand === b ? 'active' : ''}
                aria-pressed={brand === b}
                onClick={() => setBrand(b)}
              >
                {b}
              </button>
            ))}
          </div>
          <label className="apex-sort">
            مرتب‌سازی{' '}
            <select
              aria-label="مرتب‌سازی مجموعه"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="curated">انتخاب نمایشگاه</option>
              <option value="price">قیمت: کم به زیاد</option>
              <option value="power">حداکثر قدرت</option>
            </select>
          </label>
        </div>
        <div className="car-grid">
          {visible.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </div>
        <div className="apex-collection-end">
          <span>هرکدام، تعریفی تازه از هیجان</span>
          <Link to="/compare">
            مقایسه کن، انتخاب کن <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="apex-studio-invite">
        <img src={cars[2].heroImage} alt="Mercedes-AMG GT در استودیوی تاریک" loading="lazy" />
        <div className="invite-shade" />
        <div className="invite-copy">
          <span className="overline">تجربهٔ 360°</span>
          <h2>
            از این زاویه زیباست
            <br />
            از هر زاویه
            <br />
            دیدنی‌تر
          </h2>
          <p>
            به جزئیات نزدیک‌تر شو
            <br />
            ماشین موردعلاقه‌ات را از هر طرف ببین
          </p>
          <Link to="/studio" className="button outline-white">
            ورود به استودیو <ArrowUpRight size={18} />
          </Link>
        </div>
        <Link
          to="/studio?car=amg"
          className="invite-orbit"
          aria-label="دیدن AMG GT در نمای 360 درجه"
        >
          <Rotate3D size={32} />
          <span>360°</span>
        </Link>
        <span className="invite-drag">
          <MoveHorizontal size={17} /> یک زاویهٔ تازه در انتظار توست
        </span>
      </section>
    </>
  );
}
