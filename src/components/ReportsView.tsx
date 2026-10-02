import React, { useState, useEffect } from 'react';
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
import { DailyReportDetail } from '../types';

export const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<DailyReportDetail[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<'today' | 'this-week' | 'this-month' | 'last-month' | 'custom'>('this-month');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    '2024-10-24': true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-10-31');

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(reports.length / ITEMS_PER_PAGE));
  const paginatedReports = reports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchReports = (start: string, end: string) => {
    const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
    fetch(`${API_BASE}/reports?startDate=${start}&endDate=${end}`)
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setCurrentPage(1);
      })
      .catch(err => console.error("Failed to fetch reports", err));
  };

  useEffect(() => {
    // Initial fetch based on current state (default is this-month)
    handlePresetSelect('this-month');
  }, []);

  const handlePresetSelect = (preset: 'today' | 'this-week' | 'this-month' | 'last-month' | 'custom') => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startStr = '';
    let endStr = '';

    if (preset === 'today') {
      startStr = formatDate(today);
      endStr = formatDate(today);
    } else if (preset === 'this-week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diff);
      const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
      startStr = formatDate(startOfWeek);
      endStr = formatDate(endOfWeek);
    } else if (preset === 'this-month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startStr = formatDate(startOfMonth);
      endStr = formatDate(endOfMonth);
    } else if (preset === 'last-month') {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      startStr = formatDate(startOfLastMonth);
      endStr = formatDate(endOfLastMonth);
    }

    setStartDate(startStr);
    setEndDate(endStr);
    fetchReports(startStr, endStr);
  };

  const toggleRow = (date: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const totalRevenue = reports.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
  const totalExpense = reports.reduce((sum, r) => sum + (r.totalExpense || 0), 0);
  const netProfit = totalRevenue - totalExpense;
  const totalBookings = reports.reduce((sum, r) => sum + (r.bookingsCount || 0), 0);
  const totalExpensesCount = reports.reduce((sum, r) => sum + (r.expenses?.length || 0), 0);
  const expenseRatio = totalRevenue > 0 ? ((totalExpense / totalRevenue) * 100).toFixed(1) : '0.0';
  const profitRatio = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  const courtRevenues: Record<string, { total: number; count: number }> = {};
  reports.forEach(r => {
    r.bills?.forEach(b => {
      const cName = b.court || 'Sân Khác';
      if (!courtRevenues[cName]) courtRevenues[cName] = { total: 0, count: 0 };
      courtRevenues[cName].total += (b.total || 0);
      courtRevenues[cName].count += 1;
    });
  });

  const sortedCourts = Object.entries(courtRevenues)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);
    
  const totalCourtRevenue = sortedCourts.reduce((sum, c) => sum + c.total, 0);
  const maxCourtRevenue = sortedCourts.length > 0 ? sortedCourts[0].total : 1;

  let sumCourt = 0;
  let sumDrink = 0;
  let sumAccessory = 0;
  let sumFood = 0;

  reports.forEach(r => {
    r.bills?.forEach((b: any) => {
      if (b.items && b.items.length > 0) {
        b.items.forEach((item: any) => {
          const amt = item.manualTotal !== null && item.manualTotal !== undefined ? item.manualTotal : (item.price * item.quantity);
          if (item.category === 'court') sumCourt += amt;
          else if (item.category === 'drink') sumDrink += amt;
          else if (item.category === 'accessory') sumAccessory += amt;
          else sumFood += amt;
        });
      } else {
        // Fallback if no items array
        sumCourt += b.courtFee || 0;
        sumFood += b.serviceFee || 0;
      }
    });
  });

  const fbTotal = sumDrink + sumAccessory + sumFood;
  const fbRatio = totalRevenue > 0 ? ((fbTotal / totalRevenue) * 100).toFixed(1) : '0.0';

  const pctCourt = totalRevenue > 0 ? (sumCourt / totalRevenue) * 100 : 0;
  const pctDrink = totalRevenue > 0 ? (sumDrink / totalRevenue) * 100 : 0;
  const pctAccessory = totalRevenue > 0 ? (sumAccessory / totalRevenue) * 100 : 0;
  const pctFood = totalRevenue > 0 ? (sumFood / totalRevenue) * 100 : 0;

  const C = 377; // Circumference
  const dashCourt = (pctCourt / 100) * C;
  const dashDrink = (pctDrink / 100) * C;
  const dashAccessory = (pctAccessory / 100) * C;
  const dashFood = (pctFood / 100) * C;

  let expMaintenance = 0;
  let expWater = 0;
  let expOther = 0;
  reports.forEach(r => {
    r.expenses?.forEach((exp: any) => {
      const amt = exp.amount || 0;
      if (exp.category === 'maintenance') expMaintenance += amt;
      else if (exp.category === 'water') expWater += amt;
      else expOther += amt;
    });
  });

  const pctMaintenance = totalExpense > 0 ? (expMaintenance / totalExpense) * 100 : 0;
  const pctWater = totalExpense > 0 ? (expWater / totalExpense) * 100 : 0;
  const pctOther = totalExpense > 0 ? (expOther / totalExpense) * 100 : 0;

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
                  onClick={() => handlePresetSelect(p.id as any)}
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
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedPreset('custom');
                }}
                className="bg-transparent text-[#0b1c30] font-semibold focus:outline-none cursor-pointer"
              />
              <span className="text-[#bccac0] px-1">-</span>
              <span className="text-[#6d7a72] font-medium">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedPreset('custom');
                }}
                className="bg-transparent text-[#0b1c30] font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => fetchReports(startDate, endDate)}
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
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0051d5] text-xs font-extrabold">
              Toàn bộ
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl xl:text-4xl text-[#006948] font-extrabold tracking-tight">
              {formatCurrency(totalRevenue)}<span className="text-xl ml-1 font-semibold text-[#6d7a72]">đ</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-center justify-between text-xs">
            <span className="text-[#6d7a72]">Bao gồm tiền sân & dịch vụ F&B</span>
            <span className="font-bold text-[#006948]">{totalBookings} lượt đặt</span>
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
              {expenseRatio}% DT
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl xl:text-4xl text-[#ba1a1a] font-extrabold tracking-tight">
              {formatCurrency(totalExpense)}<span className="text-xl ml-1 font-semibold text-[#6d7a72]">đ</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-center justify-between text-xs">
            <span className="text-[#6d7a72]">Điện, nước, nhân sự & bảo trì</span>
            <span className="font-bold text-[#ba1a1a]">{totalExpensesCount} phiếu chi</span>
          </div>
        </div>

        {/* 3. LỢI NHUẬN RÒNG */}
        <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-white to-[#eff4ff] border-[#006948]/20' : 'from-white to-[#ffdad6]/30 border-[#ba1a1a]/20'} p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between relative overflow-hidden`}>
          <div className={`absolute -right-3 -bottom-3 w-24 h-24 rounded-full ${netProfit >= 0 ? 'bg-[#006948]/10' : 'bg-[#ba1a1a]/10'} pointer-events-none`} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl ${netProfit >= 0 ? 'bg-[#006948]' : 'bg-[#ba1a1a]'} text-white flex items-center justify-center shadow-xs`}>
                <Wallet className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${netProfit >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'} uppercase tracking-wide`}>
                LỢI NHUẬN RÒNG
              </span>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${netProfit >= 0 ? 'bg-[#85f8c4]/80 text-[#005137]' : 'bg-[#ffdad6] text-[#ba1a1a]'} text-xs font-extrabold`}>
              Tỷ suất: {profitRatio}%
            </span>
          </div>

          <div className="mt-4">
            <div className={`text-3xl xl:text-4xl ${netProfit >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'} font-extrabold tracking-tight`}>
              {netProfit > 0 ? '+' : ''}{formatCurrency(netProfit)}<span className={`text-xl ml-1 font-semibold ${netProfit >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>đ</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#eff4ff] flex items-center justify-between text-xs">
            <span className="text-[#6d7a72]">Thu ròng thực tế tích lũy</span>
            <span className={`font-bold ${netProfit >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>Hoàn Tất</span>
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
            {sortedCourts.length > 0 ? (
              sortedCourts.map((court, idx) => {
                const widthPercent = (court.total / maxCourtRevenue) * 100;
                const barColor = idx % 2 === 0 ? 'bg-[#006948]' : 'bg-[#0051d5]';
                
                return (
                  <div key={court.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0b1c30]">{court.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#6d7a72]">{court.count} lượt</span>
                        <span className="font-extrabold text-[#006948]">{formatCurrency(court.total)} đ</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                      <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${widthPercent}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-[#6d7a72] py-4">Chưa có dữ liệu sân</div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
            <span className="text-[#6d7a72]">Tổng tiền sân khai thác:</span>
            <span className="text-sm font-extrabold text-[#006948]">{formatCurrency(totalCourtRevenue)} đ</span>
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
              <span className="text-xs text-[#6d7a72] font-semibold">Tổng: {formatCurrency(totalRevenue)} đ</span>
            </div>
            <p className="text-xs text-[#6d7a72] mt-1">
              Phân bổ nguồn tiền vào từ tiền thuê giờ sân và dịch vụ bổ trợ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* 1. Tiền giờ sân */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#006948"
                  strokeDasharray={`${dashCourt} ${C}`}
                  strokeDashoffset="0"
                  strokeWidth="22"
                />
                {/* 2. Nước giải khát */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#316bf3"
                  strokeDasharray={`${dashDrink} ${C}`}
                  strokeDashoffset={-dashCourt}
                  strokeWidth="22"
                />
                {/* 3. Cầu & Bóng thể thao */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#68dba9"
                  strokeDasharray={`${dashAccessory} ${C}`}
                  strokeDashoffset={-(dashCourt + dashDrink)}
                  strokeWidth="22"
                />
                {/* 4. Dịch vụ khác / Đồ ăn vặt */}
                <circle
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="60"
                  stroke="#bec6e0"
                  strokeDasharray={`${dashFood} ${C}`}
                  strokeDashoffset={-(dashCourt + dashDrink + dashAccessory)}
                  strokeWidth="22"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-[#6d7a72]">Tổng Thu</span>
                <span className="text-xl font-extrabold text-[#0b1c30] leading-tight">
                  {(totalRevenue / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            {/* Legend Detail */}
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#006948] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Tiền sân</span>
                </div>
                <span className="font-extrabold text-[#006948]">{formatCurrency(sumCourt)} đ ({pctCourt.toFixed(1)}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#316bf3] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Nước giải khát</span>
                </div>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(sumDrink)} đ ({pctDrink.toFixed(1)}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#68dba9] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Cầu / Bóng</span>
                </div>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(sumAccessory)} đ ({pctAccessory.toFixed(1)}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#bec6e0] flex-shrink-0"></span>
                  <span className="font-semibold text-[#0b1c30]">Dịch vụ khác</span>
                </div>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(sumFood)} đ ({pctFood.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
            <span className="text-[#6d7a72]">Tỷ trọng F&B ngoài giờ sân:</span>
            <span className="text-sm font-bold text-[#0b1c30]">{fbRatio}% ({formatCurrency(fbTotal)} đ)</span>
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
              Tổng: {formatCurrency(totalExpense)} đ
            </span>
          </div>
          <p className="text-xs text-[#6d7a72] mt-1">
            Phân bổ chi tiết các khoản tiêu hao vận hành sân bãi trong tháng
          </p>
        </div>

        <div className="flex flex-col gap-3.5 my-auto">
          {/* Bảo trì sửa chữa sân */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#6d7a72]" />
                Bảo trì mặt sân, thay bóng đèn, lưới
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#6d7a72]">{pctMaintenance.toFixed(1)}%</span>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(expMaintenance)} đ</span>
              </div>
            </div>
            <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#545c72] h-full rounded-full transition-all" style={{ width: `${pctMaintenance}%` }}></div>
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
                <span className="text-[#6d7a72]">{pctWater.toFixed(1)}%</span>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(expWater)} đ</span>
              </div>
            </div>
            <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#316bf3] h-full rounded-full transition-all" style={{ width: `${pctWater}%` }}></div>
            </div>
          </div>

          {/* Khác */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#ba1a1a]" />
                Chi phí khác (Phần mềm, điện, lương)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#6d7a72]">{pctOther.toFixed(1)}%</span>
                <span className="font-bold text-[#ba1a1a]">{formatCurrency(expOther)} đ</span>
              </div>
            </div>
            <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#ba1a1a] h-full rounded-full transition-all" style={{ width: `${pctOther}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
          <span className="text-[#6d7a72]">Tỷ suất chi / doanh thu:</span>
          <span className="text-sm font-bold text-[#ba1a1a]">{expenseRatio}% (Kiểm soát định mức tốt)</span>
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
            {reports.slice(0, 7).reverse().map((report, idx) => {
              const maxDayVal = Math.max(...reports.map(r => Math.max(r.totalRevenue, r.totalExpense)), 1);
              const heightThu = (report.totalRevenue / maxDayVal) * 98; // max 98%
              const heightChi = (report.totalExpense / maxDayVal) * 98;

              return (
                <div key={report.date} className={`flex flex-col items-center flex-1 gap-1 h-full justify-end group cursor-pointer ${report.isToday ? 'bg-[#85f8c4]/25 rounded-t-xl pt-1' : ''}`}>
                  <div className="flex items-end gap-1 h-full w-full justify-center">
                    <div
                      className="w-3 bg-[#006948] rounded-t-sm group-hover:opacity-80 transition-all"
                      style={{ height: `${heightThu}%` }}
                      title={`Thu: ${formatCurrency(report.totalRevenue)}đ`}
                    ></div>
                    <div
                      className="w-3 bg-[#ba1a1a] rounded-t-sm group-hover:opacity-80 transition-all"
                      style={{ height: `${heightChi}%` }}
                      title={`Chi: ${formatCurrency(report.totalExpense)}đ`}
                    ></div>
                  </div>
                  <span className={`text-[10px] ${report.isToday ? 'text-[#006948] font-bold' : 'text-[#6d7a72] font-semibold'}`}>
                    {report.dateLabel.substring(0, 5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff] text-xs">
            <span className="text-[#6d7a72]">Lợi nhuận ròng trung bình:</span>
            <span className="text-sm font-extrabold text-[#006948]">+{formatCurrency(Math.round(reports.length > 0 ? netProfit / reports.length : 0))} đ / ngày</span>
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
          <span className="text-xs text-[#6d7a72] font-semibold">Hiển thị trang {currentPage}/{totalPages}</span>
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
              {paginatedReports.map((report) => {
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
                  Tổng Cộng
                </td>
                <td className="px-4 py-3.5 text-center text-xs font-extrabold">{totalBookings} Lượt</td>
                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#006948]">
                  {formatCurrency(totalRevenue)} đ
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#ba1a1a]">
                  {formatCurrency(totalExpense)} đ
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-[#006948]">
                  +{formatCurrency(netProfit)} đ
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
            Đang xem trang {currentPage} trên {totalPages} (Tổng {reports.length} ngày)
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
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
