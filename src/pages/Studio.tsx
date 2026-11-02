import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Rotate3D,
  RotateCcw,
  Play,
  Pause,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Info,
  X,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
} from 'lucide-react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { LoadingScreen } from '../components/ExperienceLoader';
import { cars } from '../data/cars';
import { useScrollLock } from '../lib/useScrollLock';
const CarScene = lazy(() => import('../components/CarScene'));
class ViewerBoundary extends Component<
  { children: ReactNode; image: string; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? (
      <div className="turntable-fallback">
        <img src={this.props.image} alt="عکس ثابت ماشین" />
        <div>
          <h2>استودیو بارگذاری نشد</h2>
          <p>برای چرخاندن ماشین، صفحه را در مرورگری با پشتیبانی WebGL دوباره باز کن.</p>
          <button className="button light" onClick={() => window.location.reload()}>
            بارگذاری دوبارهٔ استودیو <RotateCcw size={16} />
          </button>
        </div>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function Studio() {
  useScrollLock();
  const [params, setParams] = useSearchParams();
  const car = cars.find((c) => c.id === params.get('car')) || cars[0];
  const colorIndex = Math.max(0, Math.min(2, Number(params.get('color')) || 0));
  const reduced = useReducedMotion();
  const [lighting, setLighting] = useState<'studio' | 'day'>('studio');
  useEffect(() => {
    document.documentElement.dataset.studioTheme = lighting;
    return () => {
      delete document.documentElement.dataset.studioTheme;
    };
  }, [lighting]);
  const [rotate, setRotate] = useState(false);
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [presentation, setPresentation] = useState(false);
  const [failed, setFailed] = useState(false);
  const [info, setInfo] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const carRail = useRef<HTMLDivElement>(null);
  const railDrag = useRef({ x: 0, scroll: 0, pointer: -1, dragging: false });
  useEffect(() => {
    const selected = carRail.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    selected?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: reduced ? 'instant' : 'smooth',
    });
  }, [car.id, reduced]);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  useEffect(() => {
    document.title = `${car.name} — APEX استودیوی 360°`;
  }, [car]);
  useEffect(() => {
    window.scrollTo(0, 0);
    const studio = document.getElementById('turntable-studio');
    const containWheel = (event: WheelEvent) => {
      const rail = carRail.current;
      if (rail?.contains(event.target as Node)) {
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        rail.scrollLeft += getComputedStyle(rail).direction === 'rtl' ? -delta : delta;
      }
      event.preventDefault();
    };
    studio?.addEventListener('wheel', containWheel, { passive: false });
    return () => {
      studio?.removeEventListener('wheel', containWheel);
    };
  }, []);
  useEffect(() => {
    const update = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPresentation(false);
      if (
        event.key.toLowerCase() === 'h' &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      )
        setPresentation((value) => !value);
    };
    document.addEventListener('keydown', toggle);
    return () => document.removeEventListener('keydown', toggle);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.presentation = String(presentation);
    return () => {
      delete document.documentElement.dataset.presentation;
    };
  }, [presentation]);
  function selectCar(id: string) {
    if (id === car.id) return;
    setReady(false);
    setProgress(0);
    setFailed(false);
    setAngle(0);
    setZoom(1);
    setRotate(false);
    setParams({ car: id, color: '0' });
  }
  async function full() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.getElementById('turntable-studio')?.requestFullscreen();
    } catch {
      setInfo(true);
    }
  }
  const disabled = !ready || failed;
  return (
    <section
      id="turntable-studio"
      className={`turntable-studio atmosphere-${lighting} ${presentation ? 'is-presentation' : ''}`}
      style={{ '--accent': car.accent } as React.CSSProperties}
    >
      <div className="turntable-top">
        <Link to={`/cars/${car.id}`}>
          <ArrowLeft size={16} /> مشخصات ماشین
        </Link>
        <span>
          استودیوی APEX <i /> 360°
        </span>
        <div className="turntable-top-actions">
          <button
            className="icon-button"
            onClick={() => setPresentation(true)}
            aria-label="پنهان کردن کنترل‌ها برای ضبط (H)"
            title="پنهان کردن کنترل‌ها · H"
          >
            <EyeOff size={19} />
          </button>
          <button
            className="icon-button"
            onClick={() => setInfo(!info)}
            aria-label="راهنمای استودیو"
            aria-expanded={info}
          >
            <Info size={19} />
          </button>
        </div>
      </div>
      <div className="turntable-title">
        <span className="overline">{car.brand}</span>
        <h1>{car.shortName}</h1>
        <p>{car.engine}</p>
      </div>
      <div
        className="turntable-canvas"
        key={car.id}
        role="group"
        tabIndex={0}
        aria-label={`${car.name}؛ نمای تعاملی 360 درجه. برای چرخش بکش و برای زوم اسکرول کن. کلیدهای جهت هم زاویه را تغییر می‌دهند.`}
        onKeyDown={(e) => {
          if (disabled) return;
          if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            setRotate(false);
            setAngle((a) => a + (e.key === 'ArrowRight' ? 1 : 3));
          }
          if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            setZoom((z) => Math.min(1.55, z + 0.15));
          }
          if (e.key === '-') {
            e.preventDefault();
            setZoom((z) => Math.max(0.8, z - 0.15));
          }
        }}
      >
        <ViewerBoundary image={car.image} onError={onError}>
          <Suspense fallback={null}>
            <CarScene
              car={car}
              color={car.colors[colorIndex].hex}
              lighting={lighting}
              autoRotate={rotate && !reduced}
              angle={angle}
              zoom={zoom}
              quality="high"
              onReady={onReady}
              onProgress={setProgress}
            />
          </Suspense>
        </ViewerBoundary>
      </div>
      <aside className="turntable-palette">
        <span className="overline">رنگ بدنه</span>
        <strong>{car.colors[colorIndex].name}</strong>
        <div className="color-swatches">
          {car.colors.map((c, i) => (
            <button
              key={c.name}
              style={{ '--swatch': c.hex } as React.CSSProperties}
              title={c.name}
              disabled={disabled}
              className={colorIndex === i ? 'active' : ''}
              aria-label={`رنگ ${c.name}`}
              aria-pressed={colorIndex === i}
              onClick={() => setParams({ car: car.id, color: String(i) }, { replace: true })}
            >
              {colorIndex === i && <Check size={15} />}
            </button>
          ))}
        </div>
        <div className="turntable-light-controls">
          <button
            disabled={disabled}
            className={lighting === 'studio' ? 'active' : ''}
            aria-label="استودیوی تاریک"
            aria-pressed={lighting === 'studio'}
            onClick={() => setLighting('studio')}
          >
            <Moon size={16} />
          </button>
          <button
            disabled={disabled}
            className={lighting === 'day' ? 'active' : ''}
            aria-label="استودیوی سفید"
            aria-pressed={lighting === 'day'}
            onClick={() => setLighting('day')}
          >
            <Sun size={18} />
          </button>
        </div>
      </aside>
      <div className="turntable-interaction">
        <span className="turntable-instruction">
          <Rotate3D size={17} />
          {failed
            ? 'عکس ثابت ماشین'
            : ready
              ? 'برای چرخش بکش، برای نزدیک‌تر شدن اسکرول کن'
              : 'در حال آماده‌سازی جزئیات'}
        </span>
        <div className="turntable-controls">
          <button
            disabled={disabled}
            onClick={() => {
              setRotate(false);
              setAngle((a) => a + 3);
            }}
            aria-label="چرخش به چپ"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="turntable-views" aria-label="زاویهٔ دوربین">
            {['سه‌ربع', 'جلو', 'کنار', 'پشت'].map((label, i) => (
              <button
                key={label}
                disabled={disabled}
                aria-pressed={angle % 4 === i}
                className={angle % 4 === i ? 'active' : ''}
                onClick={() => {
                  setRotate(false);
                  setAngle((a) => Math.floor(a / 4) * 4 + i + (a % 4 === i ? 4 : 0));
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            disabled={disabled}
            onClick={() => {
              setRotate(false);
              setAngle((a) => a + 1);
            }}
            aria-label="چرخش به راست"
          >
            <ChevronRight size={18} />
          </button>
          <span className="control-separator" />
          <button
            disabled={disabled || !!reduced}
            onClick={() => setRotate(!rotate)}
            aria-label={rotate ? 'توقف چرخش' : 'چرخش خودکار'}
            aria-pressed={rotate}
          >
            {rotate ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            disabled={disabled}
            onClick={() => {
              setAngle((a) => a + 4 - (a % 4));
              setZoom(1);
              setRotate(false);
            }}
            aria-label="بازنشانی نما"
          >
            <RotateCcw size={16} />
          </button>
          <button onClick={full} aria-label={fullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}>
            {fullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </div>
      </div>
      <div className="turntable-zoom">
        <button
          disabled={disabled || zoom >= 1.55}
          onClick={() => setZoom((z) => Math.min(1.55, z + 0.15))}
          aria-label="نزدیک‌تر"
        >
          <Plus size={17} />
        </button>
        <span />
        <button
          disabled={disabled || zoom <= 0.8}
          onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))}
          aria-label="دورتر"
        >
          <Minus size={17} />
        </button>
      </div>
      <div className="turntable-bottom">
        <div className="turntable-car-browser">
          <button
            className="rail-arrow"
            aria-label="ماشین‌های قبلی"
            onClick={() =>
              carRail.current?.scrollBy({
                left: getComputedStyle(carRail.current).direction === 'rtl' ? 540 : -540,
                behavior: reduced ? 'instant' : 'smooth',
              })
            }
          >
            <ChevronRight size={20} />
          </button>
          <div
            className="turntable-cars"
            ref={carRail}
            role="group"
            aria-label="انتخاب ماشین"
            onPointerDown={(event) => {
              if (event.pointerType !== 'mouse' || event.button !== 0) return;
              railDrag.current = {
                x: event.clientX,
                scroll: event.currentTarget.scrollLeft,
                pointer: event.pointerId,
                dragging: false,
              };
            }}
            onPointerMove={(event) => {
              const drag = railDrag.current;
              if (drag.pointer !== event.pointerId || event.buttons !== 1) return;
              const distance = event.clientX - drag.x;
              if (!drag.dragging && Math.abs(distance) > 6) {
                drag.dragging = true;
                event.currentTarget.setPointerCapture(event.pointerId);
                event.currentTarget.dataset.dragging = 'true';
              }
              if (drag.dragging) event.currentTarget.scrollLeft = drag.scroll - distance;
            }}
            onPointerUp={(event) => {
              railDrag.current.pointer = -1;
              delete event.currentTarget.dataset.dragging;
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={(event) => {
              railDrag.current.pointer = -1;
              delete event.currentTarget.dataset.dragging;
            }}
            onClickCapture={(event) => {
              if (railDrag.current.dragging) {
                event.preventDefault();
                event.stopPropagation();
                railDrag.current.dragging = false;
              }
            }}
          >
            {cars.map((c) => (
              <button
                key={c.id}
                className={c.id === car.id ? 'active' : ''}
                aria-pressed={c.id === car.id}
                onClick={() => selectCar(c.id)}
              >
                <img src={c.image} alt="" draggable={false} />
                <span>{c.shortName}</span>
              </button>
            ))}
          </div>
          <button
            className="rail-arrow"
            aria-label="ماشین‌های بعدی"
            onClick={() =>
              carRail.current?.scrollBy({
                left: getComputedStyle(carRail.current).direction === 'rtl' ? -540 : 540,
                behavior: reduced ? 'instant' : 'smooth',
              })
            }
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <Link to={`/cars/${car.id}`} className="turntable-details">
          <span>
            تمام جزئیات
            <strong>
              کشف <bdi dir="ltr">{car.shortName}</bdi>
            </strong>
          </span>
          <ArrowUpRight size={24} />
        </Link>
      </div>
      {info && (
        <aside className="turntable-info">
          <button
            className="icon-button"
            aria-label="بستن راهنمای استودیو"
            onClick={() => setInfo(false)}
          >
            <X size={18} />
          </button>
          <span className="overline muted">استودیوی APEX</span>
          <h2>از زاویه‌ای تازه</h2>
          <p>
            برای چرخش، ماشین را بکش. با اسکرول یا حرکت دو انگشت زوم کن. دکمه‌های نما و کلیدهای جهت،
            زاویهٔ دوربین را تغییر می‌دهند.
          </p>
          <p>
            مدل سه‌بعدی از{' '}
            <a href={car.modelSource} target="_blank" rel="noreferrer">
              {car.modelAuthor} <ArrowUpRight size={12} />
            </a>{' '}
            با مجوز <bdi dir="ltr">{car.modelLicense.split(' (')[0]}</bdi>. رنگ‌ها نمایشی هستند و
            جزئیات مدل ممکن است با نسخهٔ کارخانه تفاوت داشته باشد.
          </p>
          <Link to="/about" className="text-link">
            دربارهٔ پروژه <ArrowUpRight size={15} />
          </Link>
        </aside>
      )}
      {presentation && (
        <button
          className="presentation-return"
          onClick={() => setPresentation(false)}
          aria-label="نمایش کنترل‌ها (H)"
        >
          <Eye size={17} /> نمایش کنترل‌ها
        </button>
      )}
      <AnimatePresence>
        {!ready && !failed && (
          <LoadingScreen
            key={car.id}
            progress={progress}
            stage="studio"
            compact
            title={`آماده‌سازی ${car.shortName}`}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
