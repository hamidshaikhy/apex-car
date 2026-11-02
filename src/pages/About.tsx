import { useEffect } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Mark } from '../components/Layout';
import { cars } from '../data/cars';

export default function About() {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.title = 'دربارهٔ APEX';
  }, []);
  return (
    <div className="about-editorial">
      <section className="about-opening section-pad">
        <div className="about-opening-copy">
          <span className="overline">
            پشت نام <bdi dir="ltr">APEX</bdi>
          </span>
          <h1>
            یک علاقهٔ شخصی
            <br />
            یک دنیای دیدنی
          </h1>
          <p>
            ماشین‌ها برای بعضی‌ها وسیله‌اند. برای ما، ترکیبی از طراحی، صدا و حس حرکت.{' '}
            <bdi dir="ltr">APEX</bdi> از همین علاقه شروع شد؛ ساختن فضایی که تماشای ماشین را به تجربه
            تبدیل کند.
          </p>
          <Link className="text-link" to="/studio">
            این تجربه را ببین <ArrowUpRight size={21} />
          </Link>
        </div>
        <motion.div
          className="about-emblem"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 1 }}
          aria-hidden="true"
        >
          <div className="emblem-ring ring-one" />
          <div className="emblem-ring ring-two" />
          <div className="emblem-ring ring-three" />
          <Mark />
          <span className="emblem-name" dir="ltr">
            APEX
          </span>
          <span className="emblem-caption" dir="ltr">
            MOTOR COLLECTIVE — EST. 2026
          </span>
        </motion.div>
      </section>
      <div className="about-facts section-pad">
        <div>
          <strong dir="ltr">12</strong>
          <span>ماشین، با شخصیت‌های متفاوت</span>
        </div>
        <div>
          <strong dir="ltr">360°</strong>
          <span>برای کشف هر زاویه</span>
        </div>
        <div>
          <strong dir="ltr">2</strong>
          <span>فضای روشن و تاریک</span>
        </div>
      </div>
      <section className="about-point-of-view section-pad">
        <h2>
          جزئیات را
          <br />
          باید تجربه کرد
        </h2>
        <div>
          <p>
            از خطوط یک سوپراسپرت تا وقار یک سدان لوکس؛ هر ماشین زبان خودش را دارد. در{' '}
            <bdi dir="ltr">APEX</bdi> نور، رنگ و زاویهٔ دید کنار هم قرار می‌گیرند تا این تفاوت‌ها
            دیده شوند.
          </p>
          <div className="about-principle">
            <span>طراحی فارسی</span>
            <p>چیدمانی برای خواندن از راست به چپ، با حفظ هویت نام‌ها و نشان‌های اصلی</p>
          </div>
          <div className="about-principle">
            <span>آزادیِ نگاه</span>
            <p>چرخش کامل ماشین، تغییر رنگ و انتخاب نور؛ با کنترل‌هایی که تصویر را شلوغ نمی‌کنند</p>
          </div>
          <div className="about-principle">
            <span>دقت در جزئیات</span>
            <p>مشخصات همراه با منابع و مبنای اندازه‌گیری، برای مقایسه‌ای روشن‌تر</p>
          </div>
        </div>
      </section>
      <section className="about-maker section-pad">
        <div>
          <span className="overline">طراحی و توسعه</span>
          <h2 dir="ltr">Hamid Shaikhy</h2>
          <p>توسعه‌دهندهٔ فرانت‌اند؛ علاقه‌مند به طراحی و تجربه‌های تعاملی وب</p>
        </div>
        <div className="maker-links">
          <a href="https://hamidshaikhy.vercel.app/" target="_blank" rel="noreferrer">
            دیدن نمونه‌کارها <ArrowUpRight size={20} />
          </a>
          <a href="https://github.com/hamidshaikhy" target="_blank" rel="noreferrer">
            <Github size={18} /> GitHub <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="about-credits section-pad">
        <div>
          <h2>دربارهٔ این مجموعه</h2>
          <p>
            <bdi dir="ltr">APEX</bdi> یک پروژهٔ نمایشی مستقل است. قیمت‌ها و کارکردها فرضی هستند و
            درخواست‌ها به نمایشگاهی ارسال نمی‌شوند. تصاویر با هوش مصنوعی ساخته شده‌اند و مدل‌های
            سه‌بعدی اثر هنرمندان مستقل‌اند. نام‌ها و نشان‌های تجاری متعلق به سازندگان هستند.
          </p>
        </div>
        <details>
          <summary>هنرمندان و مجوز مدل‌ها</summary>
          <ul>
            {cars.map((car) => (
              <li key={car.id}>
                <bdi dir="ltr">{car.name}</bdi>
                <a href={car.modelSource} target="_blank" rel="noreferrer" dir="ltr">
                  {car.modelAuthor} <ArrowUpRight size={12} />
                </a>
                <small dir="ltr">{car.modelLicense.split(' (')[0]}</small>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
