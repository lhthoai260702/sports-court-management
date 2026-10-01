import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, FileText } from 'lucide-react';
import { Court } from '../types';

interface CourtOverviewViewProps {
  courts: Court[];
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
  onSelectCourt,
  onQuickBillClick,
  onQuickExpenseClick,
}) => {
  const featuredCourt1 = courts.find((c) => c.id === 'pb-02') || courts[0];
  const featuredCourt2 = courts.find((c) => c.id === 'cl-05') || courts[1];

  const listCourts = courts.filter(
    (c) => c.id !== featuredCourt1?.id && c.id !== featuredCourt2?.id
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-1">
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-white text-[#545c72] hover:text-[#0b1c30] transition-colors cursor-pointer"
              title="Hôm qua"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 text-xs sm:text-sm font-bold text-[#0b1c30]">
              <Calendar className="w-4 h-4 text-[#006948]" />
              <span>Hôm nay, 24/10/2024</span>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-white text-[#545c72] hover:text-[#0b1c30] transition-colors cursor-pointer"
              title="Ngày mai"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2 bg-[#f8f9ff] px-3 py-1.5 rounded-lg border border-[#e5eeff]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
            <span className="text-[#6d7a72] font-medium">Tiền sân:</span>
            <span className="font-bold text-[#006948]">5.110.000 đ</span>
          </div>

          <div className="flex items-center gap-2 bg-[#f8f9ff] px-3 py-1.5 rounded-lg border border-[#e5eeff]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#316bf3]"></span>
            <span className="text-[#6d7a72] font-medium">Dịch vụ (nước, cầu):</span>
            <span className="font-bold text-[#316bf3]">1.450.000 đ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onQuickBillClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bill Nhanh</span>
          </button>

          <button
            type="button"
            onClick={onQuickExpenseClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] font-bold text-xs sm:text-sm rounded-xl border border-[#dce9ff] transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#0051d5]" />
            <span>Nhập Thu Chi Sân</span>
          </button>
        </div>
      </div>

      {/* Main Court Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 2 Large Featured Courts (Pickleball 2 & Cầu lông 5) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Pickleball 2 */}
          {featuredCourt1 && (
            <div
              onClick={() => onSelectCourt(featuredCourt1)}
              className="group bg-gradient-to-br from-[#f0fbf7] to-white p-6 sm:p-7 rounded-3xl border border-[#c6f6df] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[290px] relative overflow-hidden"
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
              <div className="my-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight group-hover:text-[#006948] transition-colors">
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
              className="group bg-gradient-to-br from-[#f8faff] to-white p-6 sm:p-7 rounded-3xl border border-[#dce9ff] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[290px] relative overflow-hidden"
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

              <div className="my-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] tracking-tight group-hover:text-[#0051d5] transition-colors">
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
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          {listCourts.map((court) => {
            const isPickleball = court.type === 'pickleball';

            return (
              <div
                key={court.id}
                onClick={() => onSelectCourt(court)}
                className="group bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] hover:border-[#85f8c4] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                {/* Left: Icon & Court Name */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                      isPickleball
                        ? 'bg-[#85f8c4]/60 text-[#006948]'
                        : 'bg-[#dce9ff] text-[#0051d5]'
                    }`}
                  >
                    <RacketIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] group-hover:text-[#006948] transition-colors">
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
                  <span className="text-base sm:text-lg font-extrabold text-[#006948]">
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
