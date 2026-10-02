import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TimeRangePickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimeRangePicker({ value, onChange, className = '', placeholder = '08:00 - 10:00' }: TimeRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value
  const parseTime = (val: string) => {
    const parts = val.split('-');
    const s = parts[0]?.trim() || '08:00';
    const e = parts[1]?.trim() || '10:00';
    const [sh, sm] = s.split(':');
    const [eh, em] = e.split(':');
    return {
      sh: sh?.padStart(2, '0') || '08', 
      sm: sm?.padStart(2, '0') || '00', 
      eh: eh?.padStart(2, '0') || '10', 
      em: em?.padStart(2, '0') || '00'
    };
  };

  const times = parseTime(value || placeholder);

  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        popupRef.current && !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const popupHeight = 320; // Estimated height of the popup
        const spaceBelow = window.innerHeight - rect.bottom;
        
        let top = rect.bottom + 4;
        // If not enough space below and enough space above, position it above
        if (spaceBelow < popupHeight && rect.top > popupHeight) {
           top = rect.top - popupHeight - 4;
        }

        setPopupStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${rect.left}px`,
          zIndex: 99999,
        });
      }
    };

    const handleScroll = (e: Event) => {
      const target = e.target as Node;
      if (popupRef.current && popupRef.current.contains(target)) {
        return; // Ignore scroll inside the popup itself
      }
      updatePosition();
    };

    const preventBackgroundScroll = (e: Event) => {
      const target = e.target as Node;
      if (popupRef.current && popupRef.current.contains(target)) {
        return; // Allow scroll inside the popup
      }
      e.preventDefault();
    };

    const preventBackgroundKeyScroll = (e: KeyboardEvent) => {
      const target = e.target as Node;
      if (popupRef.current && popupRef.current.contains(target)) {
        return;
      }
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', handleScroll, true); 
      // Lock background scrolling
      window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
      window.addEventListener('touchmove', preventBackgroundScroll, { passive: false });
      window.addEventListener('keydown', preventBackgroundKeyScroll, { passive: false });
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('wheel', preventBackgroundScroll);
      window.removeEventListener('touchmove', preventBackgroundScroll);
      window.removeEventListener('keydown', preventBackgroundKeyScroll);
    };
  }, [isOpen]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const updateTime = (newTimes: Partial<typeof times>) => {
    const t = { ...times, ...newTimes };
    onChange(`${t.sh}:${t.sm} - ${t.eh}:${t.em}`);
  };

  const ScrollColumn = ({ data, selected, onSelect, label }: { data: string[], selected: string, onSelect: (val: string) => void, label: string }) => {
    const selectedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen && selectedRef.current) {
        selectedRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    }, [isOpen]);

    return (
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</span>
        <div 
          className="h-64 w-12 overflow-y-auto border border-gray-100 rounded-md bg-white shadow-inner flex flex-col"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for cleaner look
        >
          <style>{`
            .h-64.w-12.overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {data.map((item) => (
            <div
              key={item}
              ref={selected === item ? selectedRef : null}
              onClick={() => onSelect(item)}
              className={`flex-shrink-0 px-2 py-1.5 text-center text-sm cursor-pointer transition-colors ${
                selected === item ? 'bg-[#006948] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <input
        type="text"
        value={value}
        onClick={() => setIsOpen(true)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        title="Bấm để chọn giờ thuê sân"
      />
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={popupRef}
          style={popupStyle}
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xl z-[99999] flex flex-col gap-3 min-w-[320px]"
        >
          <div className="flex justify-between items-start">
            {/* Start Time */}
            <div className="flex flex-col gap-2 bg-[#f0fbf7] p-2.5 rounded-xl border border-[#85f8c4]">
              <span className="text-xs font-extrabold text-[#006948] text-center">BẮT ĐẦU</span>
              <div className="flex gap-1 items-center">
                <ScrollColumn data={hours} selected={times.sh} onSelect={(sh) => updateTime({ sh })} label="Giờ" />
                <span className="text-xl font-bold text-[#006948] pb-1">:</span>
                <ScrollColumn data={minutes} selected={times.sm} onSelect={(sm) => updateTime({ sm })} label="Phút" />
              </div>
            </div>

            <div className="flex flex-col justify-center items-center px-1 mt-12">
              <span className="text-gray-400 font-bold">👉</span>
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-2 bg-[#fff0f0] p-2.5 rounded-xl border border-[#ffc2c2]">
              <span className="text-xs font-extrabold text-[#ea5455] text-center">KẾT THÚC</span>
              <div className="flex gap-1 items-center">
                <ScrollColumn data={hours} selected={times.eh} onSelect={(eh) => updateTime({ eh })} label="Giờ" />
                <span className="text-xl font-bold text-[#ea5455] pb-1">:</span>
                <ScrollColumn data={minutes} selected={times.em} onSelect={(em) => updateTime({ em })} label="Phút" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-[#006948] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-[#005238] transition-colors shadow-md"
            >
              Xác Nhận
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
