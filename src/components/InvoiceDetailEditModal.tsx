import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  QrCode,
  Banknote,
  Clock,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Invoice, Court, CatalogItem, BillItem } from '../types';
import { TimeRangePicker } from './TimeRangePicker';
import { CurrencyInput } from './CurrencyInput';
import { ConfirmModal } from './ConfirmModal';

interface InvoiceDetailEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  courts?: Court[];
  catalogItems?: CatalogItem[];
  onSave: (updatedInvoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
}

export const InvoiceDetailEditModal: React.FC<InvoiceDetailEditModalProps> = ({
  isOpen,
  onClose,
  invoice,
  courts = [],
  catalogItems = [],
  onSave,
  onDelete,
}) => {
  if (!isOpen || !invoice) return null;

  // Form states initialized with invoice data
  const [selectedCourtId, setSelectedCourtId] = useState(invoice.courtId);
  const [customerName, setCustomerName] = useState(invoice.customerName || '');
  const [timeSlot, setTimeSlot] = useState(invoice.timeSlot || '');
  const [note, setNote] = useState(invoice.note || '');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash'>(invoice.paymentMethod || 'qr');
  const [courtFee, setCourtFee] = useState<number>(invoice.courtFee || 0);

  // Separate court items and addon items
  const [serviceItems, setServiceItems] = useState<BillItem[]>(() => {
    return (invoice.items || []).filter((it) => it.category !== 'court');
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Sync state when invoice changes
  useEffect(() => {
    if (invoice) {
      setSelectedCourtId(invoice.courtId);
      setCustomerName(invoice.customerName || '');
      setTimeSlot(invoice.timeSlot || '');
      setNote(invoice.note || '');
      setPaymentMethod(invoice.paymentMethod || 'qr');
      setCourtFee(invoice.courtFee || 0);
      setServiceItems((invoice.items || []).filter((it) => it.category !== 'court'));
      setConfirmDelete(false);
      setShowCatalogDropdown(false);
    }
  }, [invoice]);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);
  const courtName = selectedCourt ? selectedCourt.name : invoice.courtName;

  // Calculate totals
  const serviceFee = serviceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = courtFee + serviceFee;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

  // Quantity helpers
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setServiceItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setServiceItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleAddCatalogItem = (catalogItem: CatalogItem) => {
    setServiceItems((prev) => {
      const existing = prev.find((it) => it.name.toLowerCase() === catalogItem.name.toLowerCase());
      if (existing) {
        return prev.map((it) =>
          it.id === existing.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      const newItem: BillItem = {
        id: `svc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: catalogItem.name,
        price: catalogItem.price,
        quantity: 1,
        category: catalogItem.category,
      };
      return [...prev, newItem];
    });
    setShowCatalogDropdown(false);
  };

  const handleSave = () => {
    // Find or create court item
    const existingCourtItem = (invoice.items || []).find((it) => it.category === 'court');
    const courtItem: BillItem = existingCourtItem
      ? {
        ...existingCourtItem,
        price: courtFee,
        manualTotal: courtFee,
        rentalTime: timeSlot,
      }
      : {
        id: `court-${Date.now()}`,
        name: `Tiền giờ thuê sân (${timeSlot})`,
        price: courtFee,
        quantity: 1,
        category: 'court',
        manualTotal: courtFee,
        rentalTime: timeSlot,
      };

    const updatedInvoice: Invoice = {
      ...invoice,
      courtId: selectedCourtId,
      courtName,
      customerName: customerName.trim() || 'Khách vãng lai',
      timeSlot: timeSlot.trim() || 'Trong ngày',
      note: note.trim() || undefined,
      paymentMethod,
      courtFee,
      serviceFee,
      totalAmount,
      items: [courtItem, ...serviceItems],
    };

    onSave(updatedInvoice);
    onClose();
  };

  const handleDelete = () => {
    onDelete(invoice.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0b1c30]/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-[#e5eeff] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eff4ff] bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006948]/10 text-[#006948] flex items-center justify-center font-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0b1c30]">Xem & Sửa Hóa Đơn</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] border border-[#dce9ff] text-xs font-black text-[#0051d5]">
                  {invoice.id}
                </span>
              </div>
              <p className="text-xs text-[#6d7a72] mt-0.5">
                Lập lúc {invoice.createdAt} • Trạng thái:{' '}
                <span className="font-bold text-[#006948]">Đã thanh toán</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-[#eff4ff] text-[#545c72] hover:text-[#0b1c30] transition-colors border border-[#dce9ff]/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-[#eff4ff]">
          {/* Group 1: General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Court Selection */}
            <div>
              <label className="block text-xs font-bold text-[#3d4a42] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#006948]" /> Sân thi đấu
              </label>
              {courts.length > 0 ? (
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-sm font-bold text-[#0b1c30] focus:bg-white focus:border-[#006948] focus:outline-none transition-all cursor-pointer"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'pickleball' ? 'Pickleball' : 'Cầu lông'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={courtName}
                  disabled
                  className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-sm font-bold text-[#0b1c30]"
                />
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-[#3d4a42] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#006948]" /> Tên khách hàng
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="VD: Anh Tuấn, Chị Mai..."
                className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-sm font-bold text-[#0b1c30] focus:bg-white focus:border-[#006948] focus:outline-none transition-all"
              />
            </div>

            {/* Time slot */}
            <div>
              <label className="block text-xs font-bold text-[#3d4a42] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#006948]" /> Khung giờ chơi
              </label>
              <TimeRangePicker
                value={timeSlot}
                onChange={(val) => setTimeSlot(val)}
                placeholder="VD: 17:00 - 19:00"
                className="w-full px-3 py-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-sm font-medium text-[#0b1c30] focus:bg-white focus:border-[#006948] focus:outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-[#3d4a42] uppercase tracking-wider mb-1.5">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${paymentMethod === 'qr'
                      ? 'bg-[#eff4ff] border-[#0051d5] text-[#0051d5] shadow-xs'
                      : 'bg-white border-[#dce9ff] text-[#545c72] hover:bg-[#eff4ff]'
                    }`}
                >
                  <QrCode className="w-4 h-4" /> Chuyển khoản QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${paymentMethod === 'cash'
                      ? 'bg-[#85f8c4]/20 border-[#006948] text-[#006948] shadow-xs'
                      : 'bg-white border-[#dce9ff] text-[#545c72] hover:bg-[#eff4ff]'
                    }`}
                >
                  <Banknote className="w-4 h-4" /> Tiền mặt
                </button>
              </div>
            </div>
          </div>

          {/* Group 2: Court Fee */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#3d4a42] uppercase tracking-wider">
                Tiền giờ thuê sân (VNĐ)
              </label>
              <span className="text-xs text-[#6d7a72]">Chỉnh sửa trực tiếp số tiền</span>
            </div>
            <div className="relative">
              <CurrencyInput
                value={courtFee}
                onChange={(val) => setCourtFee(Math.max(0, Number(val) || 0))}
                className="w-full px-4 py-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-base font-extrabold text-[#006948] focus:bg-white focus:border-[#006948] focus:outline-none transition-all pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6d7a72]">
                đ
              </span>
            </div>
          </div>

          {/* Group 3: Services and Addon items */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-[#3d4a42] uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#006948]" /> Dịch vụ & Đồ uống bổ trợ
                </h3>
                <p className="text-[11px] text-[#6d7a72] mt-0.5">
                  Nước uống, thuê vợt, cầu, bóng sử dụng trong ca chơi
                </p>
              </div>

              {/* Add item button / dropdown */}
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
                  <div className="absolute right-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-white rounded-2xl shadow-xl border border-[#dce9ff] z-20 p-2 divide-y divide-[#eff4ff] animate-fadeIn">
                    <div className="px-2 py-1 text-[11px] font-bold text-[#6d7a72] uppercase">
                      Chọn từ danh mục
                    </div>
                    {catalogItems.length > 0 ? (
                      catalogItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddCatalogItem(item)}
                          className="w-full text-left px-2.5 py-2 hover:bg-[#f8f9ff] rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="text-xs font-bold text-[#0b1c30]">{item.name}</div>
                            <div className="text-[10px] text-[#6d7a72]">
                              {formatCurrency(item.price)} đ / {item.unit}
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#006948] bg-[#eff4ff] px-2 py-1 rounded-lg">
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

            {/* Items List */}
            {serviceItems.length === 0 ? (
              <div className="bg-[#eff4ff]/60 border border-dashed border-[#dce9ff] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#6d7a72]">Chưa có dịch vụ nào trong hóa đơn này.</p>
                <button
                  type="button"
                  onClick={() => setShowCatalogDropdown(true)}
                  className="text-xs font-bold text-[#006948] hover:underline mt-1 cursor-pointer"
                >
                  + Bấm vào đây để thêm nước hoặc phụ kiện
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {serviceItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-[#eff4ff]/50 hover:bg-[#eff4ff] border border-[#dce9ff] rounded-xl transition-all"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-xs font-bold text-[#0b1c30] truncate">{item.name}</div>
                      <div className="text-[11px] text-[#6d7a72]">
                        Đơn giá: {formatCurrency(item.price)} đ
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center bg-white border border-[#dce9ff] rounded-lg p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-[#545c72] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-extrabold text-[#0b1c30]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#545c72] hover:text-[#006948] hover:bg-[#eff4ff] rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="w-24 text-right text-xs font-bold text-[#006948]">
                        {formatCurrency(item.price * item.quantity)} đ
                      </div>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors cursor-pointer"
                        title="Xóa món này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group 4: Note */}
          <div className="pt-4">
            <label className="block text-xs font-bold text-[#3d4a42] uppercase tracking-wider mb-1.5">
              Ghi chú hóa đơn (tùy chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Khách trả trước, còn nợ vỏ chai..."
              className="w-full px-3 py-2 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs text-[#0b1c30] focus:bg-white focus:border-[#006948] focus:outline-none transition-all"
            />
          </div>

          {/* Group 5: Total Summary Box */}
          <div className="pt-4">
            <div className="bg-[#f8f9ff] border border-[#dce9ff] rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-[#545c72]">
                <span>Tiền giờ thuê sân:</span>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(courtFee)} đ</span>
              </div>
              <div className="flex justify-between text-xs text-[#545c72]">
                <span>Tiền dịch vụ & đồ uống:</span>
                <span className="font-bold text-[#0b1c30]">{formatCurrency(serviceFee)} đ</span>
              </div>
              <div className="h-px bg-[#dce9ff] my-1" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-extrabold text-[#0b1c30]">Tổng thanh toán:</span>
                <span className="text-lg font-black text-[#006948]">
                  {formatCurrency(totalAmount)} đ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#f8f9ff] border-t border-[#eff4ff] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors cursor-pointer w-full sm:w-auto justify-center"
            title="Xóa vĩnh viễn hóa đơn này khỏi hệ thống"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Hóa Đơn</span>
          </button>

          {/* Cancel & Save Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#eff4ff] text-[#545c72] font-bold text-xs rounded-xl border border-[#dce9ff] transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Xác nhận xóa hóa đơn"
        message={`Bạn có chắc chắn muốn xóa hóa đơn này không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa hóa đơn"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};
