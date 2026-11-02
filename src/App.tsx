import { lazy, Suspense, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { ShowroomProvider, useShowroom } from './state';
import { Header, Footer } from './components/Layout';
import Home from './pages/Home';
import ExperienceLoader, { LoadingScreen } from './components/ExperienceLoader';
const Collection = lazy(() => import('./pages/Collection'));
const Detail = lazy(() => import('./pages/Detail'));
const Studio = lazy(() => import('./pages/Studio'));
const Compare = lazy(() => import('./pages/Compare'));
const About = lazy(() => import('./pages/About'));
function Shell() {
  const location = useLocation();
  const { toast, notify, compare, clearCompare } = useShowroom();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => notify(''), 4500);
    return () => clearTimeout(timer);
  }, [toast, notify]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        رفتن به محتوای اصلی
      </a>
      <div
        className="site-ambient"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(180deg, #070c0a70, #070c0a9c), url("${import.meta.env.BASE_URL}assets/editorial/atelier-background.png")`,
        }}
      />
      <Header />
      <main id="main" tabIndex={-1}>
        <div className="route-view" key={location.pathname}>
          <Suspense fallback={<LoadingScreen progress={0} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/cars/:id" element={<Detail />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/about" element={<About />} />
              <Route
                path="*"
                element={
                  <section className="not-found">
                    <span className="eyebrow">404 / مسیر پیدا نشد</span>
                    <h1>این مسیر به جایی نمی‌رسد</h1>
                    <p>صفحه‌ای که می‌خواهید در این مجموعه نیست.</p>
                    <Link className="button primary" to="/">
                      بازگشت به نمایشگاه <ArrowRight size={18} />
                    </Link>
                  </section>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </main>
      {location.pathname !== '/studio' && <Footer />}
      {compare.length > 0 && location.pathname !== '/compare' && (
        <div className="compare-tray">
          <span>
            <strong>{compare.length}</strong> ماشین انتخاب شده
          </span>
          <Link to="/compare">
            Compare <ArrowRight size={16} />
          </Link>
          <button className="icon-button" onClick={clearCompare} aria-label="پاک کردن مقایسه">
            <X size={16} />
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button onClick={() => notify('')} aria-label="بستن پیام">
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
export default function App() {
  return (
    <ShowroomProvider>
      <ExperienceLoader>
        <Shell />
      </ExperienceLoader>
    </ShowroomProvider>
  );
}
