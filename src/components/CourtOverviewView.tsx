import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, FileText } from 'lucide-react';
import { Court, Invoice } from '../types';
import { CustomCalendar } from './CustomCalendar';

interface CourtOverviewViewProps {
  courts: Court[];
  invoices: Invoice[];
  onSelectCourt: (court: Court) => void;
  onQuickBillClick: () => void;
  onQuickExpenseClick: () => void;
}

// Stylized Racket Icon matching the screenshot
const RacketIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="9.5" cy="9.5" r="6" />
    <path d="M14 14l6.5 6.5" />
    <path d="M17.5 17.5l2 2" />
  </svg>
);

export const CourtOverviewView: React.FC<CourtOverviewViewProps> = ({
  courts,
  invoices,
  onSelectCourt,
  onQuickBillClick,
  onQuickExpenseClick,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarContainerRef.current && !calendarContainerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const selectedInvoices = invoices.filter(inv => {
    let invDate;
    if (inv.createdAt.includes('-')) {
      // Handle standard "YYYY-MM-DD HH:mm" format
      const invDateStr = inv.createdAt.replace(' ', 'T');
      invDate = new Date(invDateStr);
    } else {
      // If it's just a time string like "10:15", assume it's created today
      invDate = new Date();
    }

    // Check if invDate is valid before calling isSameDay
    if (isNaN(invDate.getTime())) {
      return false;
    }
    return isSameDay(invDate, selectedDate);
  });

  const totalCourtFee = selectedInvoices.reduce((sum, inv) => sum + (inv.courtFee || 0), 0);
  const totalServiceFee = selectedInvoices.reduce((sum, inv) => sum + (inv.serviceFee || 0), 0);
  const totalRevenue = selectedInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const courtsWithStats = courts.map(court => {
    const courtInvoices = selectedInvoices.filter(inv => inv.courtId === court.id);
    const revenue = courtInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    return {
      ...court,
      revenueToday: revenue,
      invoicesCount: courtInvoices.length
    };
  });

  const featuredCourt1 = courtsWithStats.find((c) => c.id === 'pb-02') || courtsWithStats[0];
  const featuredCourt2 = courtsWithStats.find((c) => c.id === 'cl-05') || courtsWithStats[1];

  const listCourts = courtsWithStats.filter(
    (c) => c.id !== featuredCourt1?.id && c.id !== featuredCourt2?.id
  );


  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dateString = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (isSameDay(date, today)) {
      return `Hôm nay, ${dateString}`;
    } else if (isSameDay(date, yesterday)) {
      return `Hôm qua, ${dateString}`;
    } else if (isSameDay(date, tomorrow)) {
      return `Ngày mai, ${dateString}`;
    } else {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Toolbar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Date Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white text-[#545c72] hover:text-[#0b1c30] transition-colors cursor-pointer"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div 
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-[#0b1c30] cursor-pointer hover:bg-white rounded-lg transition-colors relative whitespace-nowrap"
              onClick={() => setShowCalendar(!showCalendar)}
              ref={calendarContainerRef}
            >
              <Calendar className="w-3.5 h-3.5 text-[#006948]" />
              <span>{formatDateDisplay(selectedDate).replace('Hôm nay, ', 'HN, ').replace('Hôm qua, ', 'HQ, ').replace('Ngày mai, ', 'NM, ')}</span>
              
              {showCalendar && (
                <CustomCalendar
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white text-[#545c72] hover:text-[#0b1c30] transition-colors cursor-pointer"
              title="Ngày tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs flex-1">
          <div className="flex items-center gap-1.5 bg-[#f8f9ff] px-2 py-1 sm:py-1.5 rounded-lg border border-[#e5eeff] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            <span className="text-[#6d7a72] font-medium hidden sm:inline">Tổng thu:</span>
            <span className="text-[#6d7a72] font-medium sm:hidden">Tổng:</span>
            <span className="font-bold text-[#f59e0b]">{formatCurrency(totalRevenue)} đ</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f8f9ff] px-2 py-1 sm:py-1.5 rounded-lg border border-[#e5eeff] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
            <span className="text-[#6d7a72] font-medium hidden sm:inline">Tiền sân:</span>
            <span className="text-[#6d7a72] font-medium sm:hidden">Sân:</span>
            <span className="font-bold text-[#006948]">{formatCurrency(totalCourtFee)} đ</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f8f9ff] px-2 py-1 sm:py-1.5 rounded-lg border border-[#e5eeff] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#316bf3]"></span>
            <span className="text-[#6d7a72] font-medium hidden sm:inline">Dịch vụ:</span>
            <span className="text-[#6d7a72] font-medium sm:hidden">DV:</span>
            <span className="font-bold text-[#316bf3]">{formatCurrency(totalServiceFee)} đ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onQuickBillClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bill</span>
          </button>

          <button
            type="button"
            onClick={onQuickExpenseClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] font-bold text-xs rounded-xl border border-[#dce9ff] transition-all cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-[#0051d5]" />
            <span>Chi Tiền</span>
          </button>
        </div>
      </div>

      {/* Main Court Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: 2 Large Featured Courts (Pickleball 2 & Cầu lông 5) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Card 1: Pickleball 2 */}
          {featuredCourt1 && (
            <div
              onClick={() => onSelectCourt(featuredCourt1)}
              className="group bg-gradient-to-br from-[#f0fbf7] to-white p-5 rounded-3xl border border-[#c6f6df] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[210px] relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#85f8c4]/20 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform"></div>

              {/* Header Badge */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#85f8c4]/60 text-[#006948] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <RacketIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#006948] uppercase tracking-wider">
                    {featuredCourt1.subType || 'PICKLEBALL COURT'}
                  </span>
                  <span className="text-xs text-[#545c72] font-medium mt-0.5">
                    {featuredCourt1.description}
                  </span>
                </div>
              </div>

              {/* Big Court Name */}
              <div className="my-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight group-hover:text-[#006948] transition-colors">
                  {featuredCourt1.name}
                </h2>
              </div>

              {/* Bottom Revenue & Invoices */}
              <div className="flex items-end justify-between pt-4 border-t border-[#dce9ff]/60">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
                    Doanh thu hôm nay
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#006948] tracking-tight mt-0.5">
                    {formatCurrency(featuredCourt1.revenueToday)} đ
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30] shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-[#006948]" />
                  <span>{featuredCourt1.invoicesCount} Hóa đơn</span>
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Cầu lông 5 */}
          {featuredCourt2 && (
            <div
              onClick={() => onSelectCourt(featuredCourt2)}
              className="group bg-gradient-to-br from-[#eff4ff] to-white p-5 rounded-3xl border border-[#dce9ff] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[210px] relative overflow-hidden"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#dce9ff] text-[#0051d5] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <RacketIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#545c72] uppercase tracking-wider">
                    {featuredCourt2.subType || 'CẦU LÔNG THẢM PVC'}
                  </span>
                  <span className="text-xs text-[#545c72] font-medium mt-0.5">
                    {featuredCourt2.description}
                  </span>
                </div>
              </div>

              <div className="my-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight group-hover:text-[#0051d5] transition-colors">
                  {featuredCourt2.name}
                </h2>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-[#dce9ff]/60">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
                    Doanh thu hôm nay
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-0.5">
                    {formatCurrency(featuredCourt2.revenueToday)} đ
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30] shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>{featuredCourt2.invoicesCount} Hóa đơn</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: List of other courts */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {listCourts.map((court) => {
            const isPickleball = court.type === 'pickleball';

            return (
              <div
                key={court.id}
                onClick={() => onSelectCourt(court)}
                className={`group p-3 sm:p-4 rounded-2xl border hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 ${isPickleball
                  ? 'bg-gradient-to-br from-[#f0fbf7] to-white border-[#c6f6df] hover:border-[#85f8c4]'
                  : 'bg-gradient-to-br from-[#eff4ff] to-white border-[#dce9ff] hover:border-[#93c5fd]'
                  }`}
              >
                {/* Left: Icon & Court Name */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform group-hover:scale-105 ${isPickleball
                      ? 'bg-[#85f8c4]/60 text-[#006948]'
                      : 'bg-[#dce9ff] text-[#0051d5]'
                      }`}
                  >
                    <RacketIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className={`text-base sm:text-lg font-bold text-[#0b1c30] transition-colors ${isPickleball ? 'group-hover:text-[#006948]' : 'group-hover:text-[#0051d5]'
                      }`}>
                      {court.name}
                    </h3>
                    <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
                      {court.subType}
                    </span>
                  </div>
                </div>

                {/* Right: Revenue & Bill Count */}
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-[#6d7a72] font-medium">
                    Doanh thu hôm nay
                  </span>
                  <span className={`text-base sm:text-lg font-extrabold ${isPickleball ? 'text-[#006948]' : 'text-[#0b1c30]'}`}>
                    {formatCurrency(court.revenueToday)} đ
                  </span>
                  <span className="text-[11px] font-semibold text-[#545c72] bg-[#eff4ff] px-2 py-0.5 rounded-md mt-1 border border-[#dce9ff]">
                    {court.invoicesCount} hóa đơn
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
