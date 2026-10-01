import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar as CalendarIcon,
  Filter,
  ChevronRight,
  ChevronLeft,
  Receipt,
  Zap,
  UserCheck,
  Wrench,
  Droplets,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { DAILY_REPORTS } from '../data/mockData';

export const ReportsView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'today' | 'this-week' | 'this-month' | 'last-month' | 'custom'>('this-month');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    '2024-10-24': true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-10-31');

  const toggleRow = (date: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* TOP BAR & FILTER TOOLBAR */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#006948] text-xs uppercase tracking-wider font-extrabold">
            <BarChart3 className="w-4 h-4" />
            <span>Báo Cáo Hoạt Động & Tài Chính</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Báo Cáo & Thống Kê Doanh Thu Sân
          </h1>
          <p className="text-xs sm:text-sm text-[#6d7a72]">
            Theo dõi sát sao hiệu suất doanh số tiền sân, chi phí vận hành và tỷ suất sinh lời
          </p>
        </div>

        {/* Minimal Filter Bar Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Quick Range Presets */}
          <div className="flex flex-wrap items-center gap-1.5" id="range-presets">
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'this-week', label: 'Tuần này' },
              { id: 'this-month', label: 'Tháng này' },
              { id: 'last-month', label: 'Tháng trước' },
              { id: 'custom', label: 'Tùy chọn' },
            ].map((p) => {
              const isActive = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPreset(p.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#006948] text-white font-bold shadow-sm'
                      : 'bg-[#eff4ff] text-[#3d4a42] hover:bg-[#dce9ff]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Date Pickers & Filter Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-xl px-3 py-1.5 gap-2 shadow-inner text-xs sm:text-sm">
              <CalendarIcon className="w-4 h-4 text-[#545c72]" />
              <span className="text-[#6d7a72] font-medium">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[#0b1c30] font-semibold focus:outline-none cursor-pointer"
              />
              <span className="text-[#bccac0] px-1">-</span>
              <span className="text-[#6d7a72] font-medium">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[#0b1c30] font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#006948] hover:bg-[#00855d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Áp Dụng</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI SUMMARY CARDS: 3 CLEAN CARDS (TỔNG THU, TỔNG CHI, LỢI NHUẬN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. TỔNG THU */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-24 h-24 rounded-full bg-[#006948]/5 pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#85f8c4]/50 flex items-center justify-center text-[#006948]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wide">
                TỔNG THU
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#85f8c4] text-[#005137] text-xs font-extrabold">
              +12%
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl xl:text-4xl text-[#006948] font-extrabold tracking-tight">
              68.900.000<span className="text-xl ml-1 font-semibold text-[#6d7a72]">đ</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-center justify-between text-xs">
            <span className="text-[#6d7a72]">Bao gồm tiền sân & dịch vụ F&B</span>
            <span className="font-bold text-[#006948]">840 lượt đặt</span>
          </div>
        </div>

        {/* 2. TỔNG CHI */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-24 h-24 rounded-full bg-[#ba1a1a]/5 pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wide">
                TỔNG CHI
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-extrabold">
              35.3% DT
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl xl:text-4xl text-[#ba1a1a] font-extrabold tracking-tight">
              24.350.000<span className="text-xl ml-1 font-semibold text-[#6d7a72]">đ</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-center justify-between text-xs">
            <span className="text-[#6d7a72]">Điện, nước, nhân sự & bảo trì</span>
            <span className="font-bold text-[#ba1a1a]">31 phiếu chi</span>
          </div>
        </div>

        {/* 3. LỢI NHUẬN RÒNG */}
        <div className="bg-gradient-to-br from-white to-[#eff4ff] p-5 sm:p-6 rounded-3xl border border-[#006948]/20 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-3 -bottom-3 w-24 h-24 rounded-full bg-[#006948]/10 pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#006948] text-white flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#006948] uppercase tracking-wide">
                LỢI NHUẬN RÒNG
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#85f8c4]/80 text-[#005137] text-xs font-extrabold">
              Tỷ suất: 64.7%
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl xl:text-4xl text-[#006948] font-extrabold tracking-tight">
              +44.550.000<span className="text-xl ml-1 font-semibold text-[#006948]">đ</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-center justify-between text-xs">
            <span className="text-[#6d7a72]">Thu ròng thực tế tích lũy</span>
            <span className="font-bold text-[#006948]">Đạt 118% chỉ tiêu</span>
          </div>
        </div>
      </div>

      {/* 4 FOCUSED CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* BIỂU ĐỒ 1: DOANH SỐ CỦA CÁC SÂN */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                <h2 className="text-base font-bold text-[#0b1c30]">Doanh số của các sân</h2>
              </div>
              <span className="text-xs text-[#006948] bg-[#85f8c4]/50 px-2.5 py-0.5 rounded-full font-bold">
                Tháng 10/2024
              </span>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1">
              Đóng góp doanh thu chi tiết từ từng cụm sân Pickleball & Cầu lông
            </p>
          </div>

          <div className="flex flex-col gap-3.5 my-auto">
            {/* Pickleball 1 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0b1c30]">Pickleball 01 (Sân trung tâm)</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">88% công suất</span>
                  <span className="font-extrabold text-[#006948]">11.850.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#006948] h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>

            {/* Pickleball 2 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0b1c30]">Pickleball 02</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">82% công suất</span>
                  <span className="font-extrabold text-[#006948]">10.200.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#006948]/85 h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Cầu Lông 1 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0b1c30]">Cầu Lông 01 (VIP Thảm Yonex)</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">74% công suất</span>
                  <span className="font-bold text-[#0b1c30]">7.450.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#0051d5] h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Cầu Lông 2 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0b1c30]">Cầu Lông 02</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">68% công suất</span>
                  <span className="font-bold text-[#0b1c30]">6.800.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#0051d5]/80 h-full rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>

            {/* Cầu Lông 3 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0b1c30]">Cầu Lông 03</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">52% công suất</span>
                  <span className="font-bold text-[#0b1c30]">5.100.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#0051d5]/65 h-full rounded-full" style={{ width: '41%' }}></div>
              </div>
            </div>

            {/* Cầu Lông 4 & 5 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0b1c30]">Cầu Lông 04 & 05 (Sân đôi)</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">Tổng 2 sân</span>
                  <span className="font-bold text-[#0b1c30]">8.100.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#545c72] h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
            <span className="text-[#6d7a72]">Tổng tiền sân khai thác:</span>
            <span className="text-sm font-extrabold text-[#006948]">49.500.000 đ</span>
          </div>
        </div>

        {/* BIỂU ĐỒ 2: CƠ CẤU DOANH SỐ TIỀN THU (Donut Chart) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                <h2 className="text-base font-bold text-[#0b1c30]">Cơ cấu doanh số tiền thu</h2>
              </div>
              <span className="text-xs text-[#6d7a72] font-semibold">Tổng: 68.900.000 đ</span>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1">
              Phân bổ nguồn tiền vào từ tiền thuê giờ sân và dịch vụ bổ trợ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* 1. Tiền giờ sân (71.8% = 270.6 of 377) */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#006948"
                  strokeDasharray="270.6 377"
                  strokeDashoffset="0"
                  strokeWidth="22"
                />
                {/* 2. Nước giải khát (14.5% = 54.6) */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#316bf3"
                  strokeDasharray="54.6 377"
                  strokeDashoffset="-270.6"
                  strokeWidth="22"
                />
                {/* 3. Cầu & Bóng thể thao (9.2% = 34.6) */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#68dba9"
                  strokeDasharray="34.6 377"
                  strokeDashoffset="-325.2"
                  strokeWidth="22"
                />
                {/* 4. Dịch vụ khác / Đồ ăn vặt (4.5% = 17.0) */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#bec6e0"
                  strokeDasharray="17.0 377"
                  strokeDashoffset="-359.8"
                  strokeWidth="22"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-[#6d7a72]">Tổng Thu</span>
                <span className="text-xl font-extrabold text-[#0b1c30] leading-tight">68.9M</span>
              </div>
            </div>

            {/* Legend Detail */}
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#006948] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Tiền sân</span>
                </div>
                <span className="font-extrabold text-[#006948]">49.5M (71.8%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#316bf3] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Nước giải khát</span>
                </div>
                <span className="font-bold text-[#0b1c30]">10.0M (14.5%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#68dba9] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Cầu / Bóng</span>
                </div>
                <span className="font-bold text-[#0b1c30]">6.3M (9.2%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#bec6e0] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Dịch vụ khác</span>
                </div>
                <span className="font-bold text-[#0b1c30]">3.1M (4.5%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
            <span className="text-[#6d7a72]">Tỷ trọng F&B ngoài giờ sân:</span>
            <span className="text-sm font-bold text-[#0b1c30]">28.2% (19.400.000 đ)</span>
          </div>
        </div>

        {/* BIỂU ĐỒ 3: CƠ CẤU DOANH SỐ CHI PHÍ */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                <h2 className="text-base font-bold text-[#0b1c30]">Cơ cấu doanh số chi phí</h2>
              </div>
              <span className="text-xs text-[#ba1a1a] bg-[#ffdad6]/60 px-2.5 py-0.5 rounded-full font-bold">
                Tổng: 24.350.000 đ
              </span>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1">
              Phân bổ chi tiết các khoản tiêu hao vận hành sân bãi trong tháng
            </p>
          </div>

          <div className="flex flex-col gap-3.5 my-auto">
            {/* Chi Tiền điện chiếu sáng */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#ba1a1a]" />
                  Tiền điện chiếu sáng sân
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">41.8%</span>
                  <span className="font-bold text-[#ba1a1a]">10.200.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '41.8%' }}></div>
              </div>
            </div>

            {/* Lương & vật phẩm vận hành */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#545c72]" />
                  Lương nhân sự ca trực & vệ sinh
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">32.8%</span>
                  <span className="font-bold text-[#ba1a1a]">8.000.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#ba1a1a]/75 h-full rounded-full" style={{ width: '32.8%' }}></div>
              </div>
            </div>

            {/* Bảo trì sửa chữa sân */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#6d7a72]" />
                  Bảo trì mặt sân, thay bóng đèn, lưới
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">16.4%</span>
                  <span className="font-bold text-[#0b1c30]">4.000.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#545c72] h-full rounded-full" style={{ width: '16.4%' }}></div>
              </div>
            </div>

            {/* Tiền nước sinh hoạt & khác */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#0051d5]" />
                  Tiền nước sinh hoạt & nước đá
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6d7a72]">9.0%</span>
                  <span className="font-bold text-[#0b1c30]">2.150.000 đ</span>
                </div>
              </div>
              <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#316bf3] h-full rounded-full" style={{ width: '9%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
            <span className="text-[#6d7a72]">Tỷ suất chi / doanh thu:</span>
            <span className="text-sm font-bold text-[#ba1a1a]">35.3% (Kiểm soát định mức tốt)</span>
          </div>
        </div>

        {/* BIỂU ĐỒ 4: TỔNG THU CHI TỪNG NGÀY (Bar Chart) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                <h2 className="text-base font-bold text-[#0b1c30]">Tổng thu chi từng ngày</h2>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#006948]"></span>
                  <span className="font-bold text-[#0b1c30]">Thu</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#ba1a1a]"></span>
                  <span className="font-bold text-[#0b1c30]">Chi</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1">
              So sánh song song tiền thu vào và chi ra các ngày trong tuần
            </p>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-44 w-full flex items-end justify-between gap-2 px-2 pt-2 border-b border-[#eff4ff]">
            {/* Day 1: 18/10 */}
            <div className="flex flex-col items-center flex-1 gap-1 h-full justify-end group cursor-pointer">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '62%' }}
                  title="Thu: 2.800.000đ"
                ></div>
                <div
                  className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '20%' }}
                  title="Chi: 500.000đ"
                ></div>
              </div>
              <span className="text-[10px] text-[#6d7a72] font-semibold">18/10</span>
            </div>

            {/* Day 2: 19/10 */}
            <div className="flex flex-col items-center flex-1 gap-1 h-full justify-end group cursor-pointer">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '68%' }}
                  title="Thu: 3.100.000đ"
                ></div>
                <div
                  className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '18%' }}
                  title="Chi: 450.000đ"
                ></div>
              </div>
              <span className="text-[10px] text-[#6d7a72] font-semibold">19/10</span>
            </div>

            {/* Day 3: 20/10 */}
            <div className="flex flex-col items-center flex-1 gap-1 h-full justify-end group cursor-pointer">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '75%' }}
                  title="Thu: 3.400.000đ"
                ></div>
                <div
                  className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '25%' }}
                  title="Chi: 620.000đ"
                ></div>
              </div>
              <span className="text-[10px] text-[#6d7a72] font-semibold">20/10</span>
            </div>

            {/* Day 4: 21/10 (T7) */}
            <div className="flex flex-col items-center flex-1 gap-1 h-full justify-end group cursor-pointer">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '88%' }}
                  title="Thu: 4.150.000đ"
                ></div>
                <div
                  className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '22%' }}
                  title="Chi: 480.000đ"
                ></div>
              </div>
              <span className="text-[10px] text-[#006948] font-bold">21/10</span>
            </div>

            {/* Day 5: 22/10 (CN) */}
            <div className="flex flex-col items-center flex-1 gap-1 h-full justify-end group cursor-pointer">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '98%' }}
                  title="Thu: 4.650.000đ"
                ></div>
                <div
                  className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '38%' }}
                  title="Chi: 950.000đ"
                ></div>
              </div>
              <span className="text-[10px] text-[#006948] font-bold">22/10</span>
            </div>

            {/* Day 6: 23/10 */}
            <div className="flex flex-col items-center flex-1 gap-1 h-full justify-end group cursor-pointer">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '64%' }}
                  title="Thu: 2.930.000đ"
                ></div>
                <div
                  className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '15%' }}
                  title="Chi: 310.000đ"
                ></div>
              </div>
              <span className="text-[10px] text-[#6d7a72] font-semibold">23/10</span>
            </div>

            {/* Day 7: 24/10 (Hôm nay highlighted) */}
            <div className="flex flex-col items-center flex-1 gap-1 h-full justify-end bg-[#85f8c4]/25 rounded-t-xl pt-1 group cursor-pointer">
              <div className="flex items-end gap-1 h-full w-full justify-center">
                <div
                  className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '82%' }}
                  title="Thu: 3.850.000đ"
                ></div>
                <div
                  className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                  style={{ height: '18%' }}
                  title="Chi: 420.000đ"
                ></div>
              </div>
              <span className="text-[10px] text-[#006948] font-bold">24/10</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
            <span className="text-[#6d7a72]">Lợi nhuận ròng trung bình:</span>
            <span className="text-sm font-extrabold text-[#006948]">+1.437.000 đ / ngày</span>
          </div>
        </div>
      </div>

      {/* TABLE: DAILY BREAKDOWN (Expandable rows matching Image 9) */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eff4ff]">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[#0b1c30]">
              Bảng Chi Tiết Thu - Chi Theo Ngày
            </h2>
            <p className="text-xs text-[#6d7a72]">
              Tổng hợp chi tiết theo từng ngày trong kỳ đối soát
            </p>
          </div>
          <span className="text-xs text-[#6d7a72] font-semibold">Hiển thị 4 ngày gần nhất</span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eff4ff] text-[#3d4a42]">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider w-10 text-center"></th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Ngày</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center">
                  Lượt Đặt
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">
                  Tổng Thu
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">
                  Tổng Chi
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">
                  Lợi Nhuận
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center">
                  Trạng Thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {DAILY_REPORTS.map((report) => {
                const isExpanded = !!expandedRows[report.date];

                return (
                  <React.Fragment key={report.date}>
                    <tr
                      onClick={() => toggleRow(report.date)}
                      className="hover:bg-[#eff4ff]/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 text-center">
                        <ChevronRight
                          className={`w-5 h-5 text-[#545c72] transition-transform duration-200 mx-auto ${
                            isExpanded ? 'transform rotate-90' : ''
                          }`}
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0b1c30]">
                            {report.dateLabel}
                          </span>
                          {report.isToday && (
                            <span className="px-2 py-0.5 rounded-md bg-[#85f8c4]/60 text-[#005137] text-[11px] font-bold">
                              Hôm nay
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs font-semibold text-[#0b1c30]">
                        {report.bookingsCount} Lượt
                      </td>

                      <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#006948]">
                        {formatCurrency(report.totalRevenue)} đ
                      </td>

                      <td className="px-4 py-3.5 text-right text-sm font-bold text-[#ba1a1a]">
                        {formatCurrency(report.totalExpense)} đ
                      </td>

                      <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#006948]">
                        +{formatCurrency(report.netProfit)} đ
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#85f8c4]/50 text-[#005137] text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                          {report.status}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Detail View */}
                    {isExpanded && (
                      <tr className="bg-[#eff4ff]/30">
                        <td className="p-4" colSpan={7}>
                          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#dce9ff] shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                              <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                                <Receipt className="w-4 h-4 text-[#006948]" />
                                Hóa đơn & Phiếu chi ngày {report.dateLabel}
                              </span>
                              <span className="text-xs text-[#6d7a72]">
                                Đã thanh toán: {report.bookingsCount}/{report.bookingsCount} đơn
                              </span>
                            </div>

                            {report.bills && report.bills.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {report.bills.map((bill) => (
                                  <div
                                    key={bill.id}
                                    className="p-3 bg-[#eff4ff]/60 rounded-xl border border-[#dce9ff] flex flex-col gap-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-[#0b1c30]">
                                        {bill.id} ({bill.time})
                                      </span>
                                      <span className="text-xs font-extrabold text-[#006948]">
                                        {formatCurrency(bill.total)} đ
                                      </span>
                                    </div>
                                    <span className="text-xs text-[#545c72]">
                                      {bill.court} • Khách: {bill.customer}
                                    </span>
                                    <span className="text-[11px] text-[#6d7a72]">
                                      Tiền sân: {formatCurrency(bill.courtFee)}đ | Dịch vụ:{' '}
                                      {formatCurrency(bill.serviceFee)}đ
                                    </span>
                                  </div>
                                ))}

                                {report.expenses.map((exp) => (
                                  <div
                                    key={exp.id}
                                    className="p-3 bg-[#ffdad6]/35 rounded-xl border border-[#ffdad6] flex flex-col gap-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-[#ba1a1a]">
                                        Phiếu chi: {exp.id}
                                      </span>
                                      <span className="text-xs font-extrabold text-[#ba1a1a]">
                                        -{formatCurrency(exp.amount)} đ
                                      </span>
                                    </div>
                                    <span className="text-xs text-[#545c72]">{exp.title}</span>
                                    <span className="text-[11px] text-[#6d7a72]">
                                      Người tạo: {exp.creator}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#3d4a42] italic py-1">
                                {report.summaryText || 'Chi tiết các lượt đặt sân đã đối soát hoàn tất.'}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Table Footer Total */}
            <tfoot className="bg-[#eff4ff] font-bold text-[#0b1c30]">
              <tr>
                <td className="px-4 py-3.5 text-sm" colSpan={2}>
                  Tổng Cộng Tháng 10
                </td>
                <td className="px-4 py-3.5 text-center text-xs font-extrabold">840 Lượt</td>
                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#006948]">
                  68.900.000 đ
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#ba1a1a]">
                  24.350.000 đ
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#006948]">
                  +44.550.000 đ
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="text-xs font-extrabold text-[#006948] uppercase">Hoàn Tất</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-white border-t border-[#eff4ff] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#6d7a72]">
            Đang xem trang {currentPage} trên 4 (Tổng 31 ngày)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3d4a42] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#006948] text-white'
                    : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === 4}
              onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
              className="p-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3d4a42] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
