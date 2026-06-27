import { useEffect, useMemo, useRef } from "react";

const ITEM_H = 40;
const VISIBLE = 5; // odd number of rows
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;
const CONTAINER_H = VISIBLE * ITEM_H;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

function WheelColumn({
  items,
  index,
  onIndexChange,
}: {
  items: string[];
  index: number;
  onIndexChange: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep the scroll position in sync when the selected index changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTo({ top: target });
  }, [index]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const i = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, i));
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      if (clamped !== index) onIndexChange(clamped);
    }, 90);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="no-scrollbar flex-1 overflow-y-auto"
      style={{ height: CONTAINER_H, scrollSnapType: "y mandatory" }}
    >
      <div style={{ height: PAD }} />
      {items.map((it, i) => (
        <div
          key={i}
          onClick={() => onIndexChange(i)}
          className={`flex cursor-pointer select-none items-center justify-center transition-all ${
            i === index ? "text-base font-semibold text-foreground" : "text-sm text-muted-foreground/50"
          }`}
          style={{ height: ITEM_H, scrollSnapAlign: "center" }}
        >
          {it}
        </div>
      ))}
      <div style={{ height: PAD }} />
    </div>
  );
}

export function DateWheelPicker({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (iso: string) => void;
}) {
  const parsed = value ? new Date(value) : null;
  const valid = parsed && !isNaN(parsed.getTime());
  const d = valid ? parsed!.getDate() : 1;
  const m = valid ? parsed!.getMonth() : 0;
  const y = valid ? parsed!.getFullYear() : 1970;

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let yr = currentYear; yr >= currentYear - 100; yr--) arr.push(yr);
    return arr;
  }, [currentYear]);

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => pad(i + 1)),
    [daysInMonth],
  );

  const emit = (nd: number, nm: number, ny: number) => {
    const dim = new Date(ny, nm + 1, 0).getDate();
    const day = Math.min(nd, dim);
    onChange(`${ny}-${pad(nm + 1)}-${pad(day)}`);
  };

  const yearIndex = Math.max(0, years.indexOf(y));

  return (
    <div className="relative rounded-xl border border-input bg-background px-2 py-1">
      {/* center highlight band */}
      <div
        className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary/10"
        style={{ height: ITEM_H }}
      />
      <div className="relative flex">
        <WheelColumn items={days} index={d - 1} onIndexChange={(i) => emit(i + 1, m, y)} />
        <WheelColumn items={MONTHS} index={m} onIndexChange={(i) => emit(d, i, y)} />
        <WheelColumn items={years.map(String)} index={yearIndex} onIndexChange={(i) => emit(d, m, years[i])} />
      </div>
    </div>
  );
}