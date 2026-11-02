import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
type State = {
  saved: string[];
  compare: string[];
  toggleSaved: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  notify: (message: string) => void;
  toast: string;
};
const Context = createContext<State | null>(null);
function readSaved(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem('apex:saved') || '[]');
    return Array.isArray(value) ? value.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
export function ShowroomProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>(readSaved);
  const [compare, setCompare] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);
  const toggleSaved = (id: string) =>
    setSaved((old) => {
      const next = old.includes(id) ? old.filter((x) => x !== id) : [...old, id];
      try {
        localStorage.setItem('apex:saved', JSON.stringify(next));
      } catch {
        /* Storage can be unavailable in private mode. */
      }
      return next;
    });
  const toggleCompare = (id: string) => {
    if (compare.includes(id)) {
      setCompare(compare.filter((x) => x !== id));
      return;
    }
    if (compare.length >= 3) {
      notify('تا 3 ماشین را می‌توانی مقایسه کنی. برای افزودن ماشین جدید، یکی را حذف کن.');
      return;
    }
    setCompare([...compare, id]);
  };
  return (
    <Context.Provider
      value={{
        saved,
        compare,
        toggleSaved,
        toggleCompare,
        clearCompare: () => setCompare([]),
        notify,
        toast,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useShowroom() {
  const context = useContext(Context);
  if (!context) throw new Error('ShowroomProvider missing');
  return context;
}
