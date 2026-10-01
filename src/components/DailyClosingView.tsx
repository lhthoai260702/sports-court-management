import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  QrCode,
  Banknote,
  Search,
  Edit3,
  Trash2,
  Printer,
  Sparkles,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Receipt,
  RotateCcw,
  Clock,
  User,
  Coffee,
} from 'lucide-react';
import { Court, Invoice, Expense, CatalogItem } from '../types';
import { DailyClosingSummaryModal } from './DailyClosingSummaryModal';
import { InvoiceDetailEditModal } from './InvoiceDetailEditModal';

interface DailyClosingViewProps {
  courts: Court[];
  invoices: Invoice[];
  expenses: Expense[];
  catalogItems: CatalogItem[];
  onSaveInvoice: (invoice: Invoice) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onOpenQuickExpense: () => void;
}

export const DailyClosingView: React.FC<DailyClosingViewProps> = ({
  courts,
  invoices,
  expenses,
  catalogItems,
  onSaveInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onPrintInvoice,
  onOpenQuickExpense,
}) => {
  // Date state
  const [selectedDate, setSelectedDate] = useState('2024-10-24');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Rapid Bill Entry Form State
  const [selectedCourtId, setSelectedCourtId] = useState<string>(courts[0]?.id || 'pb-01');
  const [timeSlotPreset, setTimeSlotPreset] = useState('18:00 - 20:00');
  const [customTimeSlot, setCustomTimeSlot] = useState('');
  const [courtFee, setCourtFee] = useState<number>(360000);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash'>('qr');

  // Fast consumable quantities
  const [waterQty, setWaterQty] = useState(0);
  const [reviveQty, setReviveQty] = useState(0);
  const [energyDrinkQty, setEnergyDrinkQty] = useState(0);
  const [ballQty, setBallQty] = useState(0);
  const [racketRentQty, setRacketRentQty] = useState(0);
  const [gripQty, setGripQty] = useState(0);

  // Table filters & interaction states
  const [searchTerm, setSearchTerm] = useState('');
  const [courtFilter, setCourtFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'qr' | 'cash'>('all');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [confirmDeleteRowId, setConfirmDeleteRowId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  // Calculate prices
  const waterTotal = waterQty * 15000;
  const reviveTotal = reviveQty * 20000;
  const energyTotal = energyDrinkQty * 25000;
  const ballTotal = ballQty * 35000;
  const racketTotal = racketRentQty * 40000;
  const gripTotal = gripQty * 20000;
  const totalServiceFee = waterTotal + reviveTotal + energyTotal + ballTotal + racketTotal + gripTotal;
  const totalBillAmount = courtFee + totalServiceFee;

  // Format currency helper
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  // Financial tallies for selected date
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCourtFeeSum = invoices.reduce((sum, inv) => sum + inv.courtFee, 0);
  const totalServiceFeeSum = invoices.reduce((sum, inv) => sum + inv.serviceFee, 0);
  const cashTotal = invoices
    .filter((inv) => inv.paymentMethod === 'cash')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const qrTotal = invoices
    .filter((inv) => inv.paymentMethod === 'qr')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalDailyExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netDailyProfit = totalRevenue - totalDailyExpense;

  // Filter invoices for table
  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.courtName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourt = courtFilter === 'all' || inv.courtId === courtFilter;
    const matchPayment = paymentFilter === 'all' || inv.paymentMethod === paymentFilter;
    return matchSearch && matchCourt && matchPayment;
  });

  // Handle court change: update court fee according to hourly rate
  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtId(courtId);
    const court = courts.find((c) => c.id === courtId);
    if (court) {
      // Default standard 2-hour rental
      setCourtFee(court.hourlyRate * 2);
    }
  };

  // Handle time preset change
  const handleSelectTimePreset = (time: string, durationHours: number) => {
    setTimeSlotPreset(time);
    setCustomTimeSlot('');
    if (selectedCourt) {
      setCourtFee(selectedCourt.hourlyRate * durationHours);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setCustomerName('');
    setWaterQty(0);
    setReviveQty(0);
    setEnergyDrinkQty(0);
    setBallQty(0);
    setRacketRentQty(0);
    setGripQty(0);
    if (selectedCourt) {
      setCourtFee(selectedCourt.hourlyRate * 2);
    }
  };

  // Submit bill: "Lưu & Nhập Tiếp"
  const handleSaveAndNext = (andPrint: boolean = false) => {
    const effectiveTime = customTimeSlot.trim() || timeSlotPreset;

    const items = [
      {
        id: `court-${Date.now()}`,
        name: `Tiền giờ thuê sân (${effectiveTime})`,
        price: courtFee,
        quantity: 1,
        category: 'court' as const,
        manualTotal: courtFee,
        rentalTime: effectiveTime,
      },
      ...(waterQty > 0
        ? [
            {
              id: `w-${Date.now()}`,
              name: 'Nước suối Aquafina 500ml',
              price: 15000,
              quantity: waterQty,
              category: 'drink' as const,
            },
          ]
        : []),
      ...(reviveQty > 0
        ? [
            {
              id: `r-${Date.now()}`,
              name: 'Revive chanh muối bù khoáng',
              price: 20000,
              quantity: reviveQty,
              category: 'drink' as const,
            },
          ]
        : []),
      ...(energyDrinkQty > 0
        ? [
            {
              id: `e-${Date.now()}`,
              name: 'Bò Húc Red Bull / Nước Yến',
              price: 25000,
              quantity: energyDrinkQty,
              category: 'drink' as const,
            },
          ]
        : []),
      ...(ballQty > 0
        ? [
            {
              id: `b-${Date.now()}`,
              name: selectedCourt?.type === 'pickleball' ? 'Bóng Pickleball Franklin X-40' : 'Cầu lông Yonex Aerosensa',
              price: 35000,
              quantity: ballQty,
              category: 'accessory' as const,
            },
          ]
        : []),
      ...(racketRentQty > 0
        ? [
            {
              id: `rk-${Date.now()}`,
              name: 'Thuê vợt tập Carbon',
              price: 40000,
              quantity: racketRentQty,
              category: 'accessory' as const,
            },
          ]
        : []),
      ...(gripQty > 0
        ? [
            {
              id: `g-${Date.now()}`,
              name: 'Quấn cán vợt thể thao',
              price: 20000,
              quantity: gripQty,
              category: 'accessory' as const,
            },
          ]
        : []),
    ];

    const newBillId = `#BILL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInv: Invoice = {
      id: newBillId,
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      timeSlot: effectiveTime,
      customerName: customerName.trim() || 'Khách Vãng Lai',
      items,
      courtFee,
      serviceFee: totalServiceFee,
      totalAmount: totalBillAmount,
      paymentMethod,
      status: 'paid',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    onSaveInvoice(newInv);

    if (andPrint) {
      onPrintInvoice(newInv);
    }

    // Success notification
    setToastMessage(`✓ Đã thêm ${newBillId} (${formatCurrency(totalBillAmount)} đ) vào sổ! Sẵn sàng nhập bill tiếp theo.`);
    setTimeout(() => setToastMessage(null), 3500);

    // Reset items for seamless next entry
    setCustomerName('');
    setWaterQty(0);
    setReviveQty(0);
    setEnergyDrinkQty(0);
    setBallQty(0);
    setRacketRentQty(0);
    setGripQty(0);
  };

  const handleDeleteBill = (id: string) => {
    onDeleteInvoice(id);
    setConfirmDeleteRowId(null);
    setToastMessage(`Đã xóa bill ${id} khỏi sổ.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* TOP WORKFLOW BANNER */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Left: Date & Workflow Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-2xl p-1">
            <button
              type="button"
              onClick={() => {
                setSelectedDate('2024-10-23');
                setToastMessage('Đã chuyển sang sổ ngày 23/10/2024');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="p-2 rounded-xl hover:bg-white text-[#545c72] hover:text-[#0b1c30] transition-colors cursor-pointer"
              title="Hôm qua"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3.5 py-1 text-xs sm:text-sm font-bold text-[#0b1c30]">
              <Calendar className="w-4 h-4 text-[#006948]" />
              <span>Hôm nay, 24/10/2024</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDate('2024-10-25');
                setToastMessage('Đã chuyển sang sổ ngày 25/10/2024');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="p-2 rounded-xl hover:bg-white text-[#545c72] hover:text-[#0b1c30] transition-colors cursor-pointer"
              title="Ngày mai"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#545c72] font-semibold bg-[#f8f9ff] px-3.5 py-2 rounded-xl border border-[#e5eeff]">
            <Sparkles className="w-3.5 h-3.5 text-[#006948]" />
            <span>Chế độ chốt sổ 1 người dùng: Nhập từng bill & đối soát tiền cuối ngày</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenQuickExpense}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] font-bold text-xs sm:text-sm rounded-xl border border-[#dce9ff] transition-all cursor-pointer shadow-2xs"
          >
            <Receipt className="w-4 h-4 text-[#0051d5]" />
            <span>+ Ghi Chi Phí Ngày</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClosingModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Chốt Sổ & In Bảng Kê</span>
          </button>
        </div>
      </div>

      {/* 4 KEY RECONCILIATION SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Thực Thu Ròng */}
        <div className="bg-gradient-to-br from-[#006948] to-[#005137] text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[120px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#85f8c4]">
              Thực Thu Ròng (Lợi Nhuận Ngày)
            </span>
            <span className="text-[11px] font-extrabold bg-white/20 px-2 py-0.5 rounded-lg">
              Sau chi phí
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatCurrency(netDailyProfit)} đ
            </span>
          </div>
          <div className="text-[11px] text-[#c6f6df] font-medium flex items-center gap-1">
            <span>Doanh thu {formatCurrency(totalRevenue)} đ - Chi phí {formatCurrency(totalDailyExpense)} đ</span>
          </div>
        </div>

        {/* Card 2: Doanh Thu Tổng */}
        <div className="bg-white p-5 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d7a72]">
              Tổng Doanh Thu Thu Được
            </span>
            <span className="text-xs font-extrabold text-[#006948] bg-[#f0fbf7] px-2 py-0.5 rounded-lg border border-[#c6f6df]">
              {invoices.length} bill
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight">
              {formatCurrency(totalRevenue)} đ
            </span>
          </div>
          <div className="text-[11px] text-[#545c72] font-medium flex items-center justify-between">
            <span>Tiền sân: <strong>{formatCurrency(totalCourtFeeSum)} đ</strong></span>
            <span>Dịch vụ: <strong>{formatCurrency(totalServiceFeeSum)} đ</strong></span>
          </div>
        </div>

        {/* Card 3: Đối Soát Tiền Mặt vs Chuyển Khoản (CRUCIAL FOR CLOSING BOOKS) */}
        <div className="bg-white p-5 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d7a72]">
              Đối Soát Két Tiền & Ngân Hàng
            </span>
            <span className="text-[10px] font-bold text-[#0051d5] bg-[#eff4ff] px-2 py-0.5 rounded-md">
              Đối chiếu
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#006948] flex items-center gap-1">
                <Banknote className="w-3 h-3" /> Tiền mặt (Két)
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#0b1c30]">
                {formatCurrency(cashTotal)} đ
              </span>
            </div>
            <div className="flex flex-col border-l border-[#e5eeff] pl-2">
              <span className="text-[10px] font-bold text-[#0051d5] flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Chuyển khoản QR
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#0051d5]">
                {formatCurrency(qrTotal)} đ
              </span>
            </div>
          </div>
          <div className="text-[10px] text-[#6d7a72]">
            Đếm tiền két khớp <strong>{formatCurrency(cashTotal)} đ</strong> & kiểm tra app NH
          </div>
        </div>

        {/* Card 4: Chi Phí Vận Hành Ngày */}
        <div className="bg-white p-5 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d7a72]">
              Chi Phí Vận Hành Hôm Nay
            </span>
            <button
              onClick={onOpenQuickExpense}
              className="text-[11px] font-bold text-[#ba1a1a] hover:underline cursor-pointer"
            >
              + Thêm chi
            </button>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-[#ba1a1a] tracking-tight">
              -{formatCurrency(totalDailyExpense)} đ
            </span>
          </div>
          <div className="text-[11px] text-[#545c72] font-medium flex items-center justify-between">
            <span>{expenses.length} khoản chi</span>
            <span className="text-[#6d7a72]">Tiền điện, nước, phụ kiện...</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 Cols): FAST BATCH ENTRY FORM */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col gap-5 sticky top-20">
            {/* Form Title */}
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0b1c30] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                  Thêm Từng Bill Vào Sổ
                </h2>
                <p className="text-xs text-[#6d7a72] mt-0.5">
                  Nhập lần lượt các phiếu chơi & dịch vụ trong ngày
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1 text-xs text-[#545c72] hover:text-[#0b1c30] p-1.5 rounded-lg hover:bg-[#eff4ff] cursor-pointer"
                title="Làm mới form"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>

            {/* Step 1: Court Selection Buttons */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
                1. Chọn sân chơi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {courts.map((c) => {
                  const isSelected = c.id === selectedCourtId;
                  const isPB = c.type === 'pickleball';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCourt(c.id)}
                      className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                        isSelected
                          ? 'bg-[#006948] text-white border-[#006948] shadow-sm shadow-[#006948]/20 font-bold'
                          : 'bg-[#f8f9ff] text-[#0b1c30] border-[#dce9ff] hover:border-[#85f8c4]'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{c.name}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isSelected ? 'text-[#c6f6df]' : isPB ? 'text-[#006948]' : 'text-[#0051d5]'
                        }`}
                      >
                        {formatCurrency(c.hourlyRate)}đ/h
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Slot & Court Fee */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3d4a42] flex items-center justify-between">
                <span>2. Khung giờ & Tiền sân</span>
                <span className="text-[11px] text-[#006948] font-bold">
                  Đơn giá: {formatCurrency(selectedCourt?.hourlyRate || 180000)} đ/h
                </span>
              </label>

              {/* Quick Time Presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '17:00 - 19:00 (2h)', time: '17:00 - 19:00', h: 2 },
                  { label: '18:00 - 20:00 (2h)', time: '18:00 - 20:00', h: 2 },
                  { label: '19:00 - 21:00 (2h)', time: '19:00 - 21:00', h: 2 },
                  { label: '20:00 - 22:00 (2h)', time: '20:00 - 22:00', h: 2 },
                  { label: '08:00 - 10:00 (2h)', time: '08:00 - 10:00', h: 2 },
                  { label: '1 tiếng', time: '17:00 - 18:00', h: 1 },
                ].map((preset) => {
                  const isActive = timeSlotPreset === preset.time && !customTimeSlot;
                  return (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => handleSelectTimePreset(preset.time, preset.h)}
                      className={`px-2.5 py-1 text-xs rounded-xl font-semibold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#006948] text-white border-[#006948]'
                          : 'bg-[#eff4ff] text-[#3d4a42] border-[#dce9ff] hover:bg-[#dce9ff]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom time & Court fee manual input */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  value={customTimeSlot}
                  onChange={(e) => setCustomTimeSlot(e.target.value)}
                  placeholder={`Hoặc nhập giờ (${timeSlotPreset})`}
                  className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                />

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={courtFee === 0 ? '' : courtFee}
                    onChange={(e) => setCourtFee(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                    placeholder="Tiền giờ sân"
                    className="w-full pl-3 pr-7 py-2 bg-[#f0fbf7] border border-[#85f8c4] rounded-xl text-xs font-black text-[#006948] focus:outline-none focus:border-[#006948] text-right"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#006948]">
                    đ
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Customer Name & Tags */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
                3. Tên khách / Ghi chú
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách (vd: Anh Minh, CLB Chiều...)"
                className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
              />
              <div className="flex flex-wrap gap-1">
                {['Khách vãng lai', 'Khách cố định', 'CLB Chiều', 'CLB Tối', 'Nhóm bạn trẻ'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCustomerName(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-[#eff4ff] text-[#545c72] hover:text-[#006948] hover:bg-[#dce9ff] cursor-pointer"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Quick F&B / Consumables (1-Click +/- Counters) */}
            <div className="flex flex-col gap-2 bg-[#f8f9ff] p-3.5 rounded-2xl border border-[#e5eeff]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#006948] flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" />
                  4. Dịch vụ dùng thêm
                </label>
                <span className="text-xs font-extrabold text-[#0051d5]">
                  +{formatCurrency(totalServiceFee)} đ
                </span>
              </div>

              {/* Items Grid */}
              <div className="flex flex-col gap-2 text-xs">
                {/* Aquafina */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0b1c30]">Aquafina 500ml (15k)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setWaterQty(Math.max(0, waterQty - 1))}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{waterQty}</span>
                    <button
                      type="button"
                      onClick={() => setWaterQty(waterQty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Revive */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0b1c30]">Revive chanh muối (20k)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReviveQty(Math.max(0, reviveQty - 1))}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{reviveQty}</span>
                    <button
                      type="button"
                      onClick={() => setReviveQty(reviveQty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Red Bull / Energy */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0b1c30]">Bò Húc / Nước Yến (25k)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEnergyDrinkQty(Math.max(0, energyDrinkQty - 1))}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{energyDrinkQty}</span>
                    <button
                      type="button"
                      onClick={() => setEnergyDrinkQty(energyDrinkQty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Ball / Shuttlecock */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0b1c30]">
                    {selectedCourt?.type === 'pickleball' ? 'Bóng Franklin X-40 (35k)' : 'Cầu lông Yonex (35k)'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBallQty(Math.max(0, ballQty - 1))}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{ballQty}</span>
                    <button
                      type="button"
                      onClick={() => setBallQty(ballQty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Racket Rent */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0b1c30]">Thuê vợt Carbon (40k)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRacketRentQty(Math.max(0, racketRentQty - 1))}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{racketRentQty}</span>
                    <button
                      type="button"
                      onClick={() => setRacketRentQty(racketRentQty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Grip */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0b1c30]">Quấn cán vợt (20k)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGripQty(Math.max(0, gripQty - 1))}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{gripQty}</span>
                    <button
                      type="button"
                      onClick={() => setGripQty(gripQty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#dce9ff] text-xs font-bold hover:bg-[#eff4ff] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Payment Method */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3d4a42]">
                5. Hình thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === 'qr'
                      ? 'bg-[#0051d5] text-white border-[#0051d5] shadow-xs'
                      : 'bg-[#eff4ff] text-[#3d4a42] border-[#dce9ff] hover:bg-[#dce9ff]'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Chuyển khoản QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                      : 'bg-[#eff4ff] text-[#3d4a42] border-[#dce9ff] hover:bg-[#dce9ff]'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tiền mặt (Két)</span>
                </button>
              </div>
            </div>

            {/* Total Strip */}
            <div className="p-3.5 bg-[#f0fbf7] rounded-2xl border border-[#c6f6df] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#006948] uppercase tracking-wider">
                  Tổng tiền bill này
                </span>
                <span className="text-[10px] text-[#6d7a72]">
                  Sân: {formatCurrency(courtFee)} đ + Dịch vụ: {formatCurrency(totalServiceFee)} đ
                </span>
              </div>
              <span className="text-2xl font-black text-[#006948]">
                {formatCurrency(totalBillAmount)} đ
              </span>
            </div>

            {/* Submit Action: Lưu & Nhập Tiếp */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleSaveAndNext(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#006948] hover:bg-[#00855d] text-white font-extrabold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                <span>💾 Lưu & Nhập Tiếp Bill Sau</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAndNext(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006948] font-bold text-xs rounded-2xl border border-[#85f8c4] transition-all cursor-pointer"
                title="Lưu bill và mở bản in"
              >
                <Printer className="w-4 h-4" />
                <span>Lưu & In</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): DAILY BILLS LEDGER TABLE */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col gap-4">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eff4ff]">
              <div>
                <h3 className="text-base font-extrabold text-[#0b1c30] flex items-center gap-2">
                  <span>Sổ Bill Đã Ghi Nhận Hôm Nay</span>
                  <span className="text-xs font-bold text-[#006948] bg-[#f0fbf7] px-2.5 py-0.5 rounded-full border border-[#c6f6df]">
                    {filteredInvoices.length} bill
                  </span>
                </h3>
                <p className="text-xs text-[#6d7a72] mt-0.5">
                  Kiểm tra, sửa thông tin hoặc xóa các bill đã nhập
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#6d7a72] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên khách, mã bill..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={courtFilter}
                  onChange={(e) => setCourtFilter(e.target.value)}
                  className="px-2.5 py-1 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30] focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả sân</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('all')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                      paymentFilter === 'all'
                        ? 'bg-[#006948] text-white font-bold'
                        : 'text-[#545c72] hover:text-[#0b1c30]'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('qr')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                      paymentFilter === 'qr'
                        ? 'bg-[#006948] text-white font-bold'
                        : 'text-[#545c72] hover:text-[#0b1c30]'
                    }`}
                  >
                    QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('cash')}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                      paymentFilter === 'cash'
                        ? 'bg-[#006948] text-white font-bold'
                        : 'text-[#545c72] hover:text-[#0b1c30]'
                    }`}
                  >
                    Tiền mặt
                  </button>
                </div>
              </div>

              <span className="text-xs font-extrabold text-[#006948]">
                Tổng lọc: {formatCurrency(filteredInvoices.reduce((s, i) => s + i.totalAmount, 0))} đ
              </span>
            </div>

            {/* Invoices List / Table */}
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center bg-[#f8f9ff] rounded-2xl border border-dashed border-[#dce9ff] flex flex-col items-center justify-center gap-2">
                <span className="text-sm font-bold text-[#0b1c30]">Chưa có hóa đơn nào phù hợp</span>
                <p className="text-xs text-[#6d7a72]">
                  Sử dụng khung bên trái để nhập các bill trong ngày vào sổ.
                </p>
              </div>
            ) : (
              <div className="border border-[#e5eeff] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#eff4ff] text-[#3d4a42] font-bold">
                      <tr>
                        <th className="px-3.5 py-3">Mã HĐ</th>
                        <th className="px-3.5 py-3">Sân & Giờ</th>
                        <th className="px-3.5 py-3">Khách hàng</th>
                        <th className="px-3.5 py-3">Thanh toán</th>
                        <th className="px-3.5 py-3 text-right">Dịch vụ</th>
                        <th className="px-3.5 py-3 text-right">Tổng tiền</th>
                        <th className="px-3.5 py-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eff4ff]">
                      {filteredInvoices.map((inv) => {
                        const isQR = inv.paymentMethod === 'qr';
                        const itemsSummary = inv.items
                          .filter((i) => i.category !== 'court')
                          .map((i) => `${i.name} (x${i.quantity})`)
                          .join(', ');

                        return (
                          <tr key={inv.id} className="hover:bg-[#f8f9ff] transition-colors">
                            <td className="px-3.5 py-3 font-extrabold text-[#0b1c30]">
                              {inv.id}
                            </td>
                            <td className="px-3.5 py-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#006948]">{inv.courtName}</span>
                                <span className="text-[10px] text-[#6d7a72]">{inv.timeSlot}</span>
                              </div>
                            </td>
                            <td className="px-3.5 py-3 font-bold text-[#0b1c30]">
                              {inv.customerName}
                            </td>
                            <td className="px-3.5 py-3">
                              {isQR ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#0051d5] font-bold bg-[#eff4ff] px-2 py-0.5 rounded-md border border-[#dce9ff]">
                                  <QrCode className="w-3 h-3" /> QR
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#006948] font-bold bg-[#85f8c4]/30 px-2 py-0.5 rounded-md border border-[#85f8c4]/60">
                                  <Banknote className="w-3 h-3" /> Tiền mặt
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-3 text-right font-medium text-[#545c72]">
                              {inv.serviceFee > 0 ? (
                                <span title={itemsSummary} className="text-[#0051d5] font-semibold">
                                  {formatCurrency(inv.serviceFee)} đ
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-3.5 py-3 text-right font-black text-[#006948]">
                              {formatCurrency(inv.totalAmount)} đ
                            </td>
                            <td className="px-3.5 py-3 text-center whitespace-nowrap">
                              {confirmDeleteRowId === inv.id ? (
                                <div className="inline-flex items-center gap-1 bg-[#ffdad6] px-2 py-0.5 rounded-lg border border-[#ffb4ab]">
                                  <span className="text-[10px] font-bold text-[#ba1a1a]">Xóa?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBill(inv.id)}
                                    className="px-1.5 py-0.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold rounded text-[10px] cursor-pointer"
                                  >
                                    Có
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteRowId(null)}
                                    className="px-1 py-0.5 bg-white text-[#3d4a42] font-bold rounded text-[10px] cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingInvoice(inv)}
                                    className="w-7 h-7 flex items-center justify-center bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] rounded-lg border border-[#dce9ff] transition-colors cursor-pointer"
                                    title="Xem & Sửa bill"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onPrintInvoice(inv)}
                                    className="w-7 h-7 flex items-center justify-center bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#006948] rounded-lg border border-[#e5eeff] transition-colors cursor-pointer"
                                    title="In hóa đơn lẻ"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteRowId(inv.id)}
                                    className="w-7 h-7 flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors cursor-pointer"
                                    title="Xóa bill"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#85f8c4] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Daily Closing Printable Statement Modal */}
      <DailyClosingSummaryModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        dateStr="24/10/2024 (Hôm nay)"
        invoices={invoices}
        expenses={expenses}
        courts={courts}
      />

      {/* Edit Bill Modal */}
      <InvoiceDetailEditModal
        isOpen={!!editingInvoice}
        invoice={editingInvoice}
        courts={courts}
        catalogItems={catalogItems}
        onClose={() => setEditingInvoice(null)}
        onSave={(updated) => {
          onUpdateInvoice(updated);
          setEditingInvoice(null);
          setToastMessage(`Đã cập nhật hóa đơn ${updated.id}`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
        onDelete={(invId) => {
          handleDeleteBill(invId);
          setEditingInvoice(null);
        }}
      />
    </div>
  );
};
