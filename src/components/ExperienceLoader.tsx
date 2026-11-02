import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cars } from '../data/cars';
import { Mark } from './Layout';
import { useScrollLock } from '../lib/useScrollLock';
const ExperienceReadyContext = createContext(false);
export const useExperienceReady = () => useContext(ExperienceReadyContext);

let preparation: Promise<void> | undefined;
let progressValue = 0;
const listeners = new Set<(value: number) => void>();
function report(value: number) {
  progressValue = Math.max(progressValue, Math.min(100, value));
  listeners.forEach((fn) => fn(progressValue));
}
function prepareExperience() {
  if (preparation) return preparation;
  preparation = (async () => {
    const images = [
      ...cars.map((car) => car.image),
      `${import.meta.env.BASE_URL}assets/editorial/atelier-background.png`,
    ].map(
      (source) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = source;
          img.decode().then(
            () => resolve(),
            () => resolve(),
          );
        }),
    );
    await Promise.all([document.fonts.ready, ...images]);
    report(18);
    const { prepareModel } = await import('../lib/models');
    const fractions = cars.map(() => 0);
    await Promise.allSettled(
      cars.map((car, i) =>
        prepareModel(car, (fraction) => {
          fractions[i] = fraction;
          report(18 + (fractions.reduce((a, b) => a + b, 0) / cars.length) * 80);
        }),
      ),
    );
    report(100);
  })();
  return preparation;
}
export function LoadingScreen({
  progress,
  stage = 'collection',
  title,
  compact = false,
}: {
  progress: number;
  stage?: 'collection' | 'studio';
  title?: string;
  compact?: boolean;
}) {
  const value = Math.round(progress);
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`experience-loader ${compact ? 'studio-preloader' : ''}`}
      role="status"
      aria-label={`آماده‌سازی، ${value} درصد`}
      initial={{ opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { y: '-100%' }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="loader-top">
        <span>
          <Mark /> APEX
        </span>
        <span>تجربه‌ای تازه از نمایشگاه ماشین</span>
      </div>
      <div className="loader-center">
        <div className="loader-orbit" aria-hidden="true">
          <svg viewBox="0 0 420 420">
            <circle cx="210" cy="210" r="190" />
            <circle
              className="loader-progress-circle"
              cx="210"
              cy="210"
              r="190"
              pathLength="100"
              strokeDasharray={`${progress} 100`}
            />
            <path d="M210 20V36M210 384V400M20 210H36M384 210H400" />
          </svg>
          <div className="loader-emblem">
            <Mark />
          </div>
        </div>
        <div className="loader-wordmark" aria-hidden="true">
          APEX<span style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}>APEX</span>
        </div>
        <p>
          {title ||
            (stage === 'studio'
              ? 'آماده‌سازی زاویهٔ دید تو'
              : 'برای یک تجربهٔ خاص، چند لحظه صبر کن')}
        </p>
      </div>
      <div className="loader-bottom">
        <div className="loader-phase">
          <span className="loader-pulse" />
          <div>
            <strong>
              {progress >= 100
                ? 'همه‌چیز آماده است'
                : stage === 'studio'
                  ? 'آماده‌سازی نور، متریال و دوربین'
                  : progress < 18
                    ? 'آماده‌سازی نمایشگاه'
                    : 'بارگذاری مجموعه'}
            </strong>
            <span>
              {stage === 'studio' ? 'تمرکز روی تک‌تک جزئیات' : 'ماشین‌های خاص، تا آخرین جزئیات'}
            </span>
          </div>
        </div>
        <div className="loader-number">
          <span>{String(value).padStart(2, '0')}</span>
          <small>%</small>
        </div>
      </div>
      <div className="loader-track">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <span className="sr-only">
        {stage === 'studio'
          ? 'آماده‌سازی استودیوی 360 درجه'
          : 'بارگذاری عکس‌ها و مدل‌های کامل سه‌بعدی'}
      </span>
    </motion.div>
  );
}
export default function ExperienceLoader({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(progressValue);
  const [ready, setReady] = useState(false);
  useScrollLock(!ready);
  const started = useRef(performance.now());
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const update = (value: number) => setProgress(value);
    listeners.add(update);
    prepareExperience().finally(() => {
      if (!active) return;
      timer = setTimeout(
        () => {
          if (active) setReady(true);
        },
        Math.max(650, 2300 - (performance.now() - started.current)),
      );
    });
    return () => {
      active = false;
      listeners.delete(update);
      clearTimeout(timer);
    };
  }, []);
  return (
    <ExperienceReadyContext.Provider value={ready}>
      <div inert={!ready} className="experience-content">
        {children}
      </div>
      <AnimatePresence>{!ready && <LoadingScreen progress={progress} />}</AnimatePresence>
    </ExperienceReadyContext.Provider>
  );
}
