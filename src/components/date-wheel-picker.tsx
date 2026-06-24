import { useState, useRef, useEffect } from 'react';

interface DateWheelPickerProps {
  value?: string;
  onChange?: (date: string) => void;
}

export function DateWheelPicker({ value, onChange }: DateWheelPickerProps) {
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1990);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setDay(d.getDate());
      setMonth(d.getMonth() + 1);
      setYear(d.getFullYear());
    }
  }, [value]);

  const updateDate = (newDay: number, newMonth: number, newYear: number) => {
    const dateStr = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
    onChange?.(dateStr);
  };

  return (
    <div className="flex justify-center gap-4 py-4">
      {/* Day */}
      <div className="w-20 text-center">
        <div className="text-xs text-gray-500 mb-1">Day</div>
        <select 
          value={day} 
          onChange={(e) => {
            const newDay = parseInt(e.target.value);
            setDay(newDay);
            updateDate(newDay, month, year);
          }}
          className="w-full border rounded-lg p-2 text-center"
        >
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Month */}
      <div className="w-24 text-center">
        <div className="text-xs text-gray-500 mb-1">Month</div>
        <select 
          value={month} 
          onChange={(e) => {
            const newMonth = parseInt(e.target.value);
            setMonth(newMonth);
            updateDate(day, newMonth, year);
          }}
          className="w-full border rounded-lg p-2 text-center"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('default', { month: 'short' })}</option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div className="w-24 text-center">
        <div className="text-xs text-gray-500 mb-1">Year</div>
        <select 
          value={year} 
          onChange={(e) => {
            const newYear = parseInt(e.target.value);
            setYear(newYear);
            updateDate(day, month, newYear);
          }}
          className="w-full border rounded-lg p-2 text-center"
        >
          {Array.from({ length: 100 }, (_, i) => 2026 - i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}