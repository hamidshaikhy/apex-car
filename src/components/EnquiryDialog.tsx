import { useEffect, useRef, useState } from 'react';
import { X, ArrowUpRight, Check, Download } from 'lucide-react';
import type { Car } from '../data/cars';
export default function EnquiryDialog({
  car,
  onClose,
  initialFinish,
}: {
  car: Car;
  onClose: () => void;
  initialFinish?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [finish, setFinish] = useState(initialFinish || car.colors[0].name);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            project: 'APEX — portfolio concept',
            vehicle: car.name,
            finish,
            name,
            email,
            status: 'Local demo — not sent to a dealer',
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex-${car.id}-enquiry.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <dialog
      ref={ref}
      className="enquiry-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button className="dialog-close icon-button" onClick={onClose} aria-label="بستن درخواست">
        <X />
      </button>
      {done ? (
        <div className="enquiry-success">
          <span className="success-mark">
            <Check size={30} />
          </span>
          <span className="eyebrow muted">درخواست تو آماده است</span>
          <h2>
            انتخابت آماده است،
            <br />
            <em>{name.split(' ')[0]}</em>
          </h2>
          <p>
            درخواست نمایشی {car.name} با رنگ {finish} آماده است. اطلاعات در همین صفحه می‌ماند و به
            نمایشگاهی ارسال نمی‌شود.
          </p>
          <button className="button dark" onClick={download}>
            دریافت فایل درخواست <Download size={17} />
          </button>
          <button className="text-link" onClick={onClose}>
            بازگشت به مجموعه <ArrowUpRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <span className="eyebrow muted">یک قدم نزدیک‌تر</span>
          <h2>
            انتخاب بعدی‌ات را
            <br />
            <em>تصور کن</em>
          </h2>
          <div className="enquiry-car">
            <img src={car.image} alt={car.name} />
            <div>
              <span>{car.brand}</span>
              <strong>{car.model}</strong>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setName(name.trim());
              setDone(true);
            }}
          >
            <label>
              نام شما
              <input
                required
                pattern=".*\S.*"
                autoComplete="name"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام و نام خانوادگی"
              />
            </label>
            <label>
              ایمیل
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
              />
            </label>
            <label>
              رنگ دلخواه
              <select value={finish} onChange={(e) => setFinish(e.target.value)}>
                {car.colors.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" required />
              می‌دانم این یک پروژهٔ نمایشی است و پیشنهاد فروش ماشین نیست.
            </label>
            <button className="button dark" type="submit">
              ساخت درخواست نمایشی <ArrowUpRight size={18} />
            </button>
            <p className="form-note">اطلاعات شما در همین صفحه می‌ماند و پرداختی انجام نمی‌شود.</p>
          </form>
        </>
      )}
    </dialog>
  );
}
