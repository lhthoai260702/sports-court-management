import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Banknote, Clock, Plus, Calendar } from 'lucide-react';
import { Court, CatalogItem, Invoice } from '../types';
import { TimeRangePicker } from './TimeRangePicker';
import { CurrencyInput } from './CurrencyInput';
import { CustomCalendar } from './CustomCalendar';

interface QuickBillModalProps {
  courts: Court[];
  catalogItems: CatalogItem[];
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

export const QuickBillModal: React.FC<QuickBillModalProps> = ({
  courts,
  catalogItems = [],
  isOpen,
  onClose,
  onSaveInvoice,
  onPrintInvoice,
}) => {
  if (!isOpen) return null;

  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id || 'pb-01');
  const [customerName, setCustomerName] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [courtFeeManual, setCourtFeeManual] = useState<number | ''>('');
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);
  const [selectedExtraItems, setSelectedExtraItems] = useState<
    { id: string; name: string; price: number; quantity: number; category: any }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash'>('qr');
  const [courtFeeError, setCourtFeeError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultCatalogItems = catalogItems.filter(c => c.isDefault);
      const defaults: { id: string; name: string; price: number; quantity: number; category: any }[] = [];
      const now = Date.now();
      defaultCatalogItems.forEach((found, idx) => {
        defaults.push({
          id: `default-extra-${found.id}-${now}-${idx}`,
          name: found.name,
          price: found.price,
          quantity: 0,
          category: found.category,
        });
      });
      setSelectedExtraItems(defaults);
      setCourtFeeManual('');
      setCustomerName('');
      setTimeSlot('');
      setPaymentMethod('qr');
    }
  }, [isOpen, catalogItems]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideDate = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutsideDate);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideDate);
  }, [showDatePicker]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCatalogDropdown(false);
      }
    };
    if (showCatalogDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCatalogDropdown]);

  const activeCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  const getCatalogItem = (nameKeywords: string[], defaultName: string, defaultPrice: number, fallbackId?: string) => {
    const item = catalogItems.find(i =>
      (fallbackId && i.id === fallbackId) ||
      nameKeywords.some(kw => i.name.toLowerCase().includes(kw.toLowerCase()))
    );
    return item ? item : { id: `w-${Math.random().toString(36).substr(2, 5)}`, name: defaultName, price: defaultPrice, category: 'drink' };
  };

  const extraFee = selectedExtraItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceFee = extraFee;
  const totalAmount = (courtFeeManual || 0) + serviceFee;

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const handleCreateBill = () => {
    if (!courtFeeManual || courtFeeManual <= 0) {
      setCourtFeeError('Vui lòng nhập tiền giờ thuê sân!');
      return;
    }
    setCourtFeeError(null);

    const items = [
      {
        id: `court-${Date.now()}`,
        name: `Tiền giờ thuê sân (${timeSlot})`,
        price: courtFeeManual || 0,
        quantity: 1,
        category: 'court' as const,
        manualTotal: courtFeeManual || 0,
        rentalTime: timeSlot,
      },
      ...selectedExtraItems
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          id: `extra-${Date.now()}-${item.id}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category as any,
        })),
    ];

    const newInv: Invoice = {
      id: `#BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      courtId: activeCourt.id,
      courtName: activeCourt.name,
      timeSlot,
      customerName: customerName.trim() || 'Khách Vãng Lai',
      items,
      courtFee: courtFeeManual || 0,
      serviceFee,
      totalAmount,
      paymentMethod,
      status: 'paid',
      createdAt: (function () {
        const d = new Date();
        const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return `${selectedDate} ${time}`;
      })(),
    };

    onSaveInvoice(newInv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full min-h-[630px] h-[80vh] p-6 shadow-2xl border border-[#dce9ff] flex flex-col gap-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-[#0b1c30]">Tạo Hóa Đơn Nhanh</h2>
            <span className="text-xs text-[#6d7a72]">Chỉnh giờ thuê sân, tự nhập tiền sân & dịch vụ</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#545c72] hover:text-[#0b1c30] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Choose Court */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">Chọn Sân</label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#006948]"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">Giờ thuê sân</label>
                <TimeRangePicker
                  value={timeSlot}
                  onChange={(val) => setTimeSlot(val)}
                  placeholder="17:00 - 19:00"
                  className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm font-bold text-[#006948] focus:outline-none focus:border-[#006948] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date Input */}
              <div className="flex flex-col gap-1 relative" ref={datePickerRef}>
                <label className="text-xs font-bold uppercase text-[#3d4a42]">Ngày tạo</label>
                <div
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm font-semibold text-[#0b1c30] cursor-pointer hover:border-[#006948] transition-colors"
                >
                  <Calendar className="w-4 h-4 text-[#006948]" />
                  <span>
                    {selectedDate.split('-').reverse().join('/')}
                  </span>
                </div>

                {showDatePicker && (
                  <CustomCalendar
                    selectedDate={new Date(selectedDate)}
                    onSelect={(date) => {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setSelectedDate(`${yyyy}-${mm}-${dd}`);
                    }}
                    onClose={() => setShowDatePicker(false)}
                    position="left"
                  />
                )}
              </div>

              {/* Customer */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-[#3d4a42]">Tên Khách Hàng</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập tên khách..."
                  className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#006948]"
                />
              </div>
            </div>

            {/* Court Fee Manual Input */}
            <div className="bg-[#f0fbf7] p-3.5 rounded-2xl border border-[#85f8c4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#006948]" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                    Tiền giờ thuê sân
                  </span>
                  <span className="text-[11px] text-[#6d7a72]">Khung giờ: {timeSlot}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="inline-flex items-center gap-1.5">
                  <CurrencyInput
                    value={courtFeeManual}
                    onChange={(val) => {
                      setCourtFeeManual(val === '' ? '' : Number(val) || 0);
                      if (courtFeeError) setCourtFeeError(null);
                    }}
                    placeholder="Ví dụ: 360.000"
                    className={`w-40 px-3 py-1.5 bg-white border ${courtFeeError ? 'border-red-500 focus:border-red-500' : 'border-[#85f8c4] focus:border-[#006948]'} rounded-xl text-right font-extrabold text-sm text-[#006948] focus:outline-none shadow-2xs placeholder:font-normal placeholder:text-[#a0aab2] placeholder:text-xs transition-colors`}
                  />
                  <span className="text-xs font-bold text-[#006948]">đ</span>
                </div>
                {courtFeeError && <span className="text-[10px] text-red-500 font-bold">{courtFeeError}</span>}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* Quick Quantities for F&B */}
            <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#dce9ff] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006948]">
                  Nước uống & Phụ kiện
                </span>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowCatalogDropdown(!showCatalogDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#006948] hover:bg-[#00855d] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>thêm món</span>
                  </button>

                  {showCatalogDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 max-h-56 overflow-y-auto bg-white rounded-2xl shadow-xl border border-[#dce9ff] z-50 p-2 divide-y divide-[#eff4ff]">
                      <div className="px-2 py-1 text-[11px] font-bold text-[#6d7a72] uppercase">
                        Chọn từ danh mục
                      </div>
                      {catalogItems.filter(i =>
                        i.category !== 'court' &&
                        !selectedExtraItems.some(extra => extra.id === i.id)
                      ).length > 0 ? (
                        catalogItems
                          .filter(i =>
                            i.category !== 'court' &&
                            !selectedExtraItems.some(extra => extra.id === i.id)
                          )
                          .map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                const exists = selectedExtraItems.find((i) => i.id === item.id);
                                if (exists) {
                                  setSelectedExtraItems(
                                    selectedExtraItems.map((i) =>
                                      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                                    )
                                  );
                                } else {
                                  setSelectedExtraItems([
                                    {
                                      id: item.id,
                                      name: item.name,
                                      price: item.price,
                                      quantity: 1,
                                      category: item.category,
                                    },
                                    ...selectedExtraItems,
                                  ]);
                                }
                                setShowCatalogDropdown(false);
                              }}
                              className="w-full text-left px-2.5 py-2 hover:bg-[#f8f9ff] rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer"
                            >
                              <div className="truncate">
                                <div className="text-xs font-bold text-[#0b1c30] truncate">{item.name}</div>
                                <div className="text-[10px] text-[#6d7a72]">
                                  {formatCurrency(item.price)} đ
                                </div>
                              </div>
                              <span className="text-xs font-black text-[#006948] bg-[#eff4ff] px-2 py-1 rounded-lg shrink-0">
                                thêm
                              </span>
                            </button>
                          ))
                      ) : (
                        <div className="p-3 text-xs text-center text-[#6d7a72]">
                          Không có sản phẩm sẵn
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedExtraItems.length > 0 && (
                <div className="flex flex-col gap-2">
                  {selectedExtraItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#0b1c30] flex-1 truncate pr-2">{item.name} ({formatCurrency(item.price)}đ):</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedExtraItems(
                              selectedExtraItems.map((i) =>
                                i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
                              )
                            )
                          }
                          className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedExtraItems(
                              selectedExtraItems.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                              )
                            )
                          }
                          className="w-7 h-7 bg-white rounded-lg font-bold border border-[#dce9ff]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col gap-4 pt-2">
          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#6d7a72]">Thanh toán:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${paymentMethod === 'qr'
                  ? 'bg-[#006948] text-white'
                  : 'bg-[#eff4ff] text-[#3d4a42]'
                  }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${paymentMethod === 'cash'
                  ? 'bg-[#006948] text-white'
                  : 'bg-[#eff4ff] text-[#3d4a42]'
                  }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Tiền mặt</span>
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#6d7a72]">Tổng thanh toán:</span>
            <span className="text-2xl font-extrabold text-[#006948]">
              {formatCurrency(totalAmount)} đ
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#eff4ff] text-[#3d4a42] font-bold text-sm rounded-xl cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => handleCreateBill()}
            className="px-6 py-2.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
