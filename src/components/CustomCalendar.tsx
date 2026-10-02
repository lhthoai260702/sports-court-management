import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
  position?: 'left' | 'right';
  compact?: boolean;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ selectedDate, onSelect, onClose, position = 'left', compact = false }) => {
  const [viewDate, setViewDate] = React.useState(selectedDate || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    let d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const today = new Date();
  
  const widthClass = compact ? 'w-[210px]' : 'w-72';
  const containerPadding = compact ? 'p-2' : 'p-4';
  const cellPadding = compact ? 'py-1' : 'p-2';
  const cellText = compact ? 'text-[11px]' : 'text-sm';
  const headerMb = compact ? 'mb-1' : 'mb-4';
  
  const days = [];
  
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(
      <div key={`prev-${i}`} className={`${cellPadding} text-center text-[#9ca3af] ${cellText}`}>
        {prevMonthDays - i}
      </div>
    );
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const isSelected = selectedDate && date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    days.push(
      <div
        key={`current-${i}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(date);
          onClose();
        }}
        className={`${cellPadding} text-center ${cellText} rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#006948] text-white font-bold shadow-sm'
            : isToday
            ? 'bg-[#eff4ff] text-[#0051d5] font-bold hover:bg-[#dce9ff]'
            : 'text-[#0b1c30] hover:bg-[#f8f9ff]'
        }`}
      >
        {i}
      </div>
    );
  }
  
  const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const remainingSlots = totalSlots - (firstDay + daysInMonth);
  for (let i = 1; i <= remainingSlots; i++) {
    days.push(
      <div key={`next-${i}`} className={`${cellPadding} text-center text-[#9ca3af] ${cellText}`}>
        {i}
      </div>
    );
  }

  const alignClass = position === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`absolute top-full ${alignClass} mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#e5eeff] ${containerPadding} ${widthClass} z-50 cursor-default`} onClick={(e) => e.stopPropagation()}>
      <div className={`flex items-center justify-between ${headerMb}`}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setViewDate(new Date(year, month - 1, 1));
          }} 
          className={`rounded-lg hover:bg-[#f8f9ff] text-[#545c72] transition-colors cursor-pointer ${compact ? 'p-0.5' : 'p-1.5'}`}
        >
          <ChevronLeft className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
        </button>
        <span className={`font-bold text-[#0b1c30] ${compact ? 'text-xs' : ''}`}>
          Tháng {month + 1}, {year}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setViewDate(new Date(year, month + 1, 1));
          }} 
          className={`rounded-lg hover:bg-[#f8f9ff] text-[#545c72] transition-colors cursor-pointer ${compact ? 'p-0.5' : 'p-1.5'}`}
        >
          <ChevronRight className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
        </button>
      </div>
      
      <div className={`grid grid-cols-7 ${compact ? 'mb-1' : 'mb-2'}`}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
          <div key={day} className={`text-center font-bold text-[#6d7a72] uppercase ${compact ? 'text-[10px]' : 'text-xs'}`}>{day}</div>
        ))}
      </div>
      
      <div className={`grid grid-cols-7 ${compact ? 'gap-0.5' : 'gap-1'}`}>
        {days}
      </div>
      
      <div className={`${compact ? 'mt-1.5 pt-1.5' : 'mt-4 pt-3'} border-t border-[#e5eeff] flex justify-between`}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelect(new Date());
            onClose();
          }}
          className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-[#006948] hover:text-[#00855d] px-2 py-1 rounded-lg hover:bg-[#f0fbf7] transition-colors cursor-pointer`}
        >
          Hôm nay
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-[#545c72] hover:text-[#0b1c30] px-2 py-1 rounded-lg hover:bg-[#f8f9ff] transition-colors cursor-pointer`}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
