import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Heart, Menu, X, ArrowUp } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useShowroom } from '../state';
export function Mark() {
  return (
    <svg viewBox="0 0 44 36" fill="none" aria-hidden="true">
      <path d="m4 31 18-28 18 28H29L22 19l-7 12H4Z" fill="currentColor" />
      <path d="m22 3 18 28" stroke="#f5723f" strokeWidth="2" />
    </svg>
  );
}
export function Header() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { saved } = useShowroom();
  useEffect(() => {
    setMenu(false);
  }, [location]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <header
      className={`header ${location.pathname === '/' ? 'header-home' : ''} ${location.pathname === '/' && !scrolled ? 'header-hero' : ''} ${['/studio', '/collection', '/about'].includes(location.pathname) ? 'header-dark' : ''}`}
    >
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="نمایشگاه APEX">
          <Mark />
          <span>
            APEX<span className="brand-sub">MOTOR COLLECTIVE</span>
          </span>
        </Link>
        <nav className={menu ? 'nav open' : 'nav'} aria-label="منوی اصلی">
          <NavLink to="/" end>
            نمایشگاه
          </NavLink>
          <NavLink to="/collection">مجموعه</NavLink>
          <NavLink to="/studio">
            استودیوی 360° <span className="nav-dot" />
          </NavLink>
          <NavLink to="/about">دربارهٔ APEX</NavLink>
        </nav>
        <div className="header-actions">
          <Link
            to="/collection?saved=1"
            className="icon-button"
            aria-label={`ماشین‌های ذخیره‌شده (${saved.length})`}
          >
            <Heart size={19} />
            {saved.length > 0 && <span className="count">{saved.length}</span>}
          </Link>
          <Link to="/collection" className="nav-cta">
            ماشین خودت را پیدا کن <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label={menu ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  const reduced = useReducedMotion();
  return (
    <footer className="apex-footer">
      <div className="apex-footer-main">
        <div className="apex-footer-signature">
          <Link to="/" className="footer-brand" aria-label="خانهٔ APEX">
            <Mark />
            <span>
              APEX<small>MOTOR COLLECTIVE</small>
            </span>
          </Link>
          <p>برای عشق به رانندگی</p>
        </div>
        <nav aria-label="منوی پایین صفحه">
          <Link to="/collection">مجموعهٔ ماشین‌ها</Link>
          <Link to="/studio">استودیوی 360°</Link>
          <Link to="/compare">مقایسه</Link>
          <Link to="/about">دربارهٔ APEX</Link>
        </nav>
        <button
          className="footer-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })}
          aria-label="بازگشت به بالا"
        >
          <ArrowUp size={22} />
        </button>
      </div>
      <div className="apex-footer-bottom">
        <span dir="ltr">© 2026 APEX</span>
        <span>
          طراحی و توسعه{' '}
          <a href="https://hamidshaikhy.vercel.app/" target="_blank" rel="noreferrer" dir="ltr">
            Hamid Shaikhy <ArrowUpRight size={13} />
          </a>
        </span>
        <span>پروژهٔ نمایشی مستقل؛ قیمت‌ها و کارکردها فرضی هستند.</span>
      </div>
    </footer>
  );
}
