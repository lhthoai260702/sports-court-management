import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  QrCode,
  Banknote,
  Clock,
  Droplet,
  Coffee,
  Sandwich,
  CircleDot,
  Receipt,
  FileCheck,
  CheckCircle2,
  Package,
  ChevronDown,
  Check,
  X,
  Save,
} from 'lucide-react';
import { Court, BillItem, Invoice, CatalogItem } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { ConfirmModal } from './ConfirmModal';

const formatTimeRangeInput = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  let formatted = '';

  if (numbers.length > 0) {
    formatted += numbers.substring(0, 2);
  }
  if (numbers.length > 2) {
    formatted += ':' + numbers.substring(2, 4);
  }
  if (numbers.length > 4) {
    formatted += ' - ' + numbers.substring(4, 6);
  }
  if (numbers.length > 6) {
    formatted += ':' + numbers.substring(6, 8);
  }

  return formatted;
};

interface CourtDetailViewProps {
  court: Court;
  invoices: Invoice[];
  catalogItems: CatalogItem[];
  onBack: () => void;
  onSaveInvoice: (invoice: Invoice) => void;
  onUpdateInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onPrintInvoice?: (invoice: Invoice) => void;
  onNavigateToProducts?: () => void;
}

export const CourtDetailView: React.FC<CourtDetailViewProps> = ({
  court,
  invoices,
  catalogItems,
  onBack,
  onSaveInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onPrintInvoice,
  onNavigateToProducts,
}) => {
  // Helper to create default items: ONLY court rental fee is default, everything else empty!
  const createDefaultItems = (courtData: Court): BillItem[] => {
    const now = Date.now();
    const items: BillItem[] = [
      {
        id: `court-rent-${courtData.id}-${now}`,
        name: `Tiền giờ thuê sân`,
        price: 0,
        quantity: 0,
        category: 'court',
        rentalTime: '',
        manualTotal: undefined,
      },
    ];

    const defaultCatalogItems = catalogItems.filter(c => c.isDefault);
    defaultCatalogItems.forEach((found, idx) => {
      items.push({
        id: `default-item-${found.id}-${now}-${idx}`,
        invoiceId: '', // Draft items don't have invoiceId yet
        name: found.name,
        price: found.price,
        quantity: 0,
        category: found.category,
      });
    });

    return items;
  };

  // Current active draft items matching the user's requirements
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash'>('qr');
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [courtFeeError, setCourtFeeError] = useState<string | null>(null);
  const [draftCourtFeeError, setDraftCourtFeeError] = useState<string | null>(null);

  // Helper to calculate next receipt code based on court and count of invoices
  const calculateNextReceiptCode = (courtObj: Court, currentInvoices: Invoice[]) => {
    const courtNum = courtObj.id.match(/\d+/)?.[0] || '01';
    const prefix = `PB${courtNum.padStart(2, '0')}`;
    const nextSeq = currentInvoices.length + 1;
    return `${prefix}-${String(nextSeq).padStart(2, '0')}`;
  };

  const currentReceiptCode = calculateNextReceiptCode(court, invoices);

  // Expandable invoice editing state
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Invoice | null>(null);
  const [showDraftCatalogDropdown, setShowDraftCatalogDropdown] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const draftDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (draftDropdownRef.current && !draftDropdownRef.current.contains(event.target as Node)) {
        setShowDraftCatalogDropdown(false);
      }
    };
    if (showDraftCatalogDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDraftCatalogDropdown]);

  // Initial items: first and only default row is Court rental!
  const [items, setItems] = useState<BillItem[]>(() => createDefaultItems(court));

  // Reset to default court rental row whenever the user clicks into a court
  useEffect(() => {
    setEditingInvoiceId(null);
    setCustomerName('');
    setNote('');
    setPaymentMethod('qr');
    setItems(createDefaultItems(court));
  }, [court.id, court.timeSlot, court.hourlyRate]);

  const updateCourtRentalTime = (id: string, rawTime: string) => {
    const newTime = formatTimeRangeInput(rawTime);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            rentalTime: newTime,
            name: newTime ? `Tiền giờ thuê sân (${newTime})` : 'Tiền giờ thuê sân',
          };
        }
        return item;
      })
    );
  };

  const updateCourtManualTotal = (id: string, newTotal: number | undefined) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            manualTotal: newTotal === undefined || isNaN(newTotal) ? undefined : Math.max(0, newTotal),
          };
        }
        return item;
      })
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const setItemQuantity = (id: string, value: number) => {
    const safeQty = Math.max(0, isNaN(value) ? 0 : value);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: safeQty } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItemFromCatalog = (catItem: CatalogItem) => {
    const existing = items.find((it) => it.name === catItem.name);
    if (existing) {
      updateQuantity(existing.id, 1);
    } else {
      setItems((prev) => {
        const courtItems = prev.filter(i => i.category === 'court');
        const otherItems = prev.filter(i => i.category !== 'court');
        return [
          ...courtItems,
          {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: catItem.name,
            price: catItem.price,
            quantity: 1,
            category: catItem.category,
          },
          ...otherItems,
        ];
      });
    }
    setShowCatalogModal(false);
  };

  const handleResetForm = () => {
    setEditingInvoiceId(null);
    setCustomerName('');
    setNote('');
    setPaymentMethod('qr');
    setItems(createDefaultItems(court));
  };

  const handleLoadInvoiceToMainForm = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setCustomerName(inv.customerName);
    setPaymentMethod(inv.paymentMethod);
    setNote(inv.note || '');

    const loadedItems: BillItem[] = (inv.items || []).map((it) => {
      if (it.category === 'court') {
        return {
          ...it,
          rentalTime: it.rentalTime || inv.timeSlot,
          manualTotal: it.price || inv.courtFee,
        };
      }
      return { ...it };
    });

    setItems(loadedItems);
    setSuccessToast(`Đã chuyển hóa đơn ${inv.id} lên bảng trên để chỉnh sửa!`);
    setTimeout(() => setSuccessToast(null), 3000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getItemLineTotal = (item: BillItem) => {
    if (item.category === 'court') {
      return item.manualTotal ?? 0;
    }
    return item.price * item.quantity;
  };

  // Nút Lưu lại: lưu hóa đơn, clear lại dữ liệu bảng thu tiền nhanh, và cập nhật mã phiếu
  const handleSaveNew = () => {
    const courtItem = items.find((it) => it.category === 'court');
    if (!courtItem || courtItem.manualTotal === undefined || courtItem.manualTotal <= 0) {
      setCourtFeeError('Vui lòng nhập tiền giờ thuê sân!');
      return;
    }
    setCourtFeeError(null);

    const total = items.reduce((sum, item) => sum + getItemLineTotal(item), 0);
    const courtItemsTotal = courtItem ? getItemLineTotal(courtItem) : 0;
    const serviceItemsTotal = total - courtItemsTotal;
    const rentalTimeSlot = courtItem?.rentalTime || '';

    if (editingInvoiceId) {
      const updatedInvoice: Invoice = {
        id: editingInvoiceId,
        courtId: court.id,
        courtName: court.name,
        timeSlot: rentalTimeSlot,
        customerName: customerName.trim() || 'Khách Vãng Lai',
        note: note.trim() || undefined,
        items: items
          .filter((it) => (it.category === 'court' ? (it.manualTotal ?? 0) >= 0 : it.quantity > 0))
          .map((it) => {
            if (it.category === 'court') {
              const timeStr = it.rentalTime || rentalTimeSlot;
              return {
                ...it,
                name: timeStr ? `Tiền giờ thuê sân (${timeStr})` : `Tiền giờ thuê sân`,
                price: it.manualTotal || 0,
                quantity: 1,
              };
            }
            return it;
          }),
        totalAmount: total,
        courtFee: courtItemsTotal,
        serviceFee: serviceItemsTotal,
        paymentMethod,
        status: 'paid',
        createdAt: (function () {
          const d = new Date();
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          return `${yyyy}-${mm}-${dd} ${time}`;
        })(),
      };

      if (onUpdateInvoice) {
        onUpdateInvoice(updatedInvoice);
      }
      setSuccessToast(`Đã lưu lại hóa đơn ${editingInvoiceId} thành công!`);
    } else {
      const newInvoiceId = `#${currentReceiptCode}`;
      const newInvoice: Invoice = {
        id: newInvoiceId,
        courtId: court.id,
        courtName: court.name,
        timeSlot: rentalTimeSlot,
        customerName: customerName.trim() || 'Khách Vãng Lai',
        note: note.trim() || undefined,
        items: items
          .filter((it) => (it.category === 'court' ? (it.manualTotal ?? 0) >= 0 : it.quantity > 0))
          .map((it) => {
            if (it.category === 'court') {
              const timeStr = it.rentalTime || rentalTimeSlot;
              return {
                ...it,
                name: timeStr ? `Tiền giờ thuê sân (${timeStr})` : `Tiền giờ thuê sân`,
                price: it.manualTotal || 0,
                quantity: 1,
              };
            }
            return it;
          }),
        totalAmount: total,
        courtFee: courtItemsTotal,
        serviceFee: serviceItemsTotal,
        paymentMethod,
        status: 'paid',
        createdAt: (function () {
          const d = new Date();
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          return `${yyyy}-${mm}-${dd} ${time}`;
        })(),
      };

      onSaveInvoice(newInvoice);
      const nextCode = calculateNextReceiptCode(court, [newInvoice, ...invoices]);
      setSuccessToast(`Đã lưu lại hóa đơn ${newInvoiceId} thành công! Mã phiếu tiếp theo: ${nextCode}`);
    }

    // Clear toàn bộ dữ liệu bảng thu tiền nhanh theo yêu cầu
    setEditingInvoiceId(null);
    setCustomerName('');
    setNote('');
    setPaymentMethod('qr');
    setItems(createDefaultItems(court));

    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Handlers for expandable invoice inline editing
  const handleToggleExpand = (inv: Invoice) => {
    if (expandedInvoiceId === inv.id) {
      setExpandedInvoiceId(null);
      setEditingDraft(null);
      setShowDraftCatalogDropdown(false);
    } else {
      setExpandedInvoiceId(inv.id);
      const clonedItems: BillItem[] = (inv.items || []).map((it) => ({
        ...it,
        manualTotal: it.category === 'court' ? (it.manualTotal ?? it.price) : undefined,
        rentalTime: it.category === 'court' ? (it.rentalTime ?? inv.timeSlot) : undefined,
      }));
      setEditingDraft({
        ...inv,
        items: clonedItems,
      });
      setShowDraftCatalogDropdown(false);
    }
  };

  const updateDraftCustomerName = (val: string) => {
    if (!editingDraft) return;
    setEditingDraft({ ...editingDraft, customerName: val });
  };

  const updateDraftTimeSlot = (rawVal: string) => {
    if (!editingDraft) return;
    const val = formatTimeRangeInput(rawVal);
    const updatedItems = editingDraft.items.map((it) =>
      it.category === 'court'
        ? { ...it, name: val ? `Tiền giờ thuê sân (${val})` : 'Tiền giờ thuê sân', rentalTime: val }
        : it
    );
    setEditingDraft({
      ...editingDraft,
      timeSlot: val,
      items: updatedItems,
    });
  };

  const updateDraftCourtFee = (fee: number) => {
    if (!editingDraft) return;
    const safeFee = Math.max(0, isNaN(fee) ? 0 : fee);
    const updatedItems = editingDraft.items.map((it) =>
      it.category === 'court'
        ? { ...it, manualTotal: safeFee, price: safeFee }
        : it
    );
    const courtFee = safeFee;
    const serviceFee = updatedItems
      .filter((it) => it.category !== 'court')
      .reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalAmount = courtFee + serviceFee;

    setEditingDraft({
      ...editingDraft,
      courtFee,
      serviceFee,
      totalAmount,
      items: updatedItems,
    });
  };

  const updateDraftQuantity = (itemId: string, delta: number) => {
    if (!editingDraft) return;
    const updatedItems = editingDraft.items
      .map((it) => {
        if (it.id === itemId) {
          const newQ = Math.max(0, it.quantity + delta);
          return { ...it, quantity: newQ };
        }
        return it;
      })
      .filter((it) => it.category === 'court' || it.quantity > 0);

    const courtFee =
      updatedItems.find((it) => it.category === 'court')?.manualTotal ?? editingDraft.courtFee;
    const serviceFee = updatedItems
      .filter((it) => it.category !== 'court')
      .reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalAmount = courtFee + serviceFee;

    setEditingDraft({
      ...editingDraft,
      items: updatedItems,
      courtFee,
      serviceFee,
      totalAmount,
    });
  };

  const removeDraftItem = (itemId: string) => {
    if (!editingDraft) return;
    const updatedItems = editingDraft.items.filter((it) => it.id !== itemId);
    const courtFee =
      updatedItems.find((it) => it.category === 'court')?.manualTotal ?? editingDraft.courtFee;
    const serviceFee = updatedItems
      .filter((it) => it.category !== 'court')
      .reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalAmount = courtFee + serviceFee;

    setEditingDraft({
      ...editingDraft,
      items: updatedItems,
      courtFee,
      serviceFee,
      totalAmount,
    });
  };

  const addDraftCatalogItem = (cat: CatalogItem) => {
    if (!editingDraft) return;
    const existingIndex = editingDraft.items.findIndex(
      (it) => it.name.toLowerCase() === cat.name.toLowerCase()
    );
    let updatedItems: BillItem[];
    if (existingIndex >= 0) {
      updatedItems = editingDraft.items.map((it, idx) =>
        idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it
      );
    } else {
      const courtItems = editingDraft.items.filter(i => i.category === 'court');
      const otherItems = editingDraft.items.filter(i => i.category !== 'court');
      updatedItems = [
        ...courtItems,
        {
          id: `draft-item-${Date.now()}-${Math.random()}`,
          name: cat.name,
          price: cat.price,
          quantity: 1,
          category: cat.category,
        },
        ...otherItems,
      ];
    }
    const courtFee =
      updatedItems.find((it) => it.category === 'court')?.manualTotal ?? editingDraft.courtFee;
    const serviceFee = updatedItems
      .filter((it) => it.category !== 'court')
      .reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalAmount = courtFee + serviceFee;

    setEditingDraft({
      ...editingDraft,
      items: updatedItems,
      courtFee,
      serviceFee,
      totalAmount,
    });
    setShowDraftCatalogDropdown(false);
  };

  const handleSaveDraftChanges = () => {
    if (!editingDraft) return;
    if (editingDraft.courtFee === undefined || editingDraft.courtFee <= 0) {
      setDraftCourtFeeError('Vui lòng nhập tiền giờ thuê sân!');
      return;
    }
    setDraftCourtFeeError(null);
    if (onUpdateInvoice) {
      onUpdateInvoice(editingDraft);
    }
    setSuccessToast(`Đã cập nhật hóa đơn ${editingDraft.id} thành công!`);
    setTimeout(() => setSuccessToast(null), 3000);
    setExpandedInvoiceId(null);
    setEditingDraft(null);
    setConfirmDeleteId(null);
    setShowDraftCatalogDropdown(false);
  };

  const handleDeleteDraftInvoice = (invoiceId: string) => {
    if (onDeleteInvoice) {
      onDeleteInvoice(invoiceId);
    }
    if (editingInvoiceId === invoiceId) {
      handleResetForm();
    }
    setExpandedInvoiceId(null);
    setEditingDraft(null);
    setConfirmDeleteId(null);
    setSuccessToast(`Đã xóa hóa đơn ${invoiceId} thành công!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Real-time calculations
  const totalAmount = items.reduce((sum, item) => sum + getItemLineTotal(item), 0);
  const courtFeeToday = invoices.reduce((sum, inv) => sum + (inv.courtFee || 0), 0);
  const serviceFeeToday = invoices.reduce((sum, inv) => sum + (inv.serviceFee || 0), 0);
  const totalRevenueToday = courtFeeToday + serviceFeeToday;

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const getItemIcon = (name: string, category: string) => {
    if (category === 'court' || name.toLowerCase().includes('tiền giờ')) {
      return <Clock className="w-4 h-4 text-[#006948]" />;
    }
    if (name.toLowerCase().includes('nước suối') || category === 'drink') {
      return <Droplet className="w-4 h-4 text-[#316bf3]" />;
    }
    if (name.toLowerCase().includes('revive') || name.toLowerCase().includes('redbull')) {
      return <Coffee className="w-4 h-4 text-[#f59e0b]" />;
    }
    if (name.toLowerCase().includes('bánh mì') || category === 'food') {
      return <Sandwich className="w-4 h-4 text-[#ea580c]" />;
    }
    return <CircleDot className="w-4 h-4 text-[#006948]" />;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Toast feedback */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#006948] text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Navigation & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] flex items-center justify-center transition-colors cursor-pointer border border-[#dce9ff]"
            title="Quay lại sơ đồ sân"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                Chi tiết Sân: {court.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-[#eff4ff] border border-[#dce9ff] text-xs font-bold text-[#545c72]">
                {court.code}
              </span>
            </div>
            <p className="text-xs text-[#6d7a72] font-medium mt-0.5">
              Thu ngân ca trực • Thao tác lập bill và đối soát nhanh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-bold text-[#0b1c30]">
            <Calendar className="w-4 h-4 text-[#545c72]" />
            <span>Hôm nay (24/10/2024)</span>
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bill mới</span>
          </button>
        </div>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Tổng thu sân hôm nay */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
              Tổng thu sân hôm nay
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006948] tracking-tight mt-1">
              {formatCurrency(totalRevenueToday)} đ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#85f8c4]/50 text-[#006948] flex items-center justify-center shadow-2xs">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tiền giờ thuê sân */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
              Tiền giờ thuê sân
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0051d5] tracking-tight mt-1">
              {formatCurrency(courtFeeToday)} đ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#dce9ff] text-[#0051d5] flex items-center justify-center shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Tiền nước, bánh & phụ kiện */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#6d7a72] uppercase tracking-wider">
              Tiền nước, bánh & phụ kiện
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-1">
              {formatCurrency(serviceFeeToday)} đ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center shadow-2xs">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Billing Card: "Bảng Thu Tiền Nhanh" */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden flex flex-col">
        {/* Header of Section */}
        <div className="p-5 sm:p-6 border-b border-[#eff4ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#85f8c4]/40 text-[#006948] flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">
                Bảng Thu Tiền Nhanh ({court.name})
              </h2>
              <p className="text-xs text-[#6d7a72]">
                Nhập tên khách, kiểm tra số lượng và xác nhận thanh toán trực tiếp
              </p>
            </div>
          </div>

          {editingInvoiceId ? (
            <div className="flex items-center gap-2.5 bg-[#dce9ff] text-[#0051d5] px-3.5 py-1.5 rounded-xl border border-[#b2d0ff] text-xs font-bold animate-fadeIn">
              <span>Đang sửa HĐ: {editingInvoiceId}</span>
              <button
                type="button"
                onClick={handleResetForm}
                className="p-0.5 hover:bg-[#b2d0ff] rounded text-[#0051d5] hover:text-[#ba1a1a] cursor-pointer transition-colors"
                title="Hủy chế độ sửa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-[#006948] bg-[#eff4ff] px-3.5 py-1.5 rounded-xl border border-[#b2d0ff] flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
              <span>Mã phiếu:</span>
              <span className="font-extrabold text-[#005137] bg-[#85f8c4]/40 px-2 py-0.5 rounded-md">
                {currentReceiptCode}
              </span>
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-6">
          {/* Inputs for Customer Name & Quick Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3d4a42] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
                Tên khách hàng / Đội nhóm
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng (vd: Anh Nam, CLB Pickleball Sunshine...)"
                className="w-full px-4 py-2.5 rounded-xl border border-[#bccac0]/60 bg-[#f8f9ff] text-sm text-[#0b1c30] focus:outline-none focus:border-[#006948] focus:bg-white transition-all placeholder:text-[#6d7a72]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3d4a42] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#316bf3]"></span>
                Ghi chú nhanh
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Vd: Ca tối, khách mượn rổ banh..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#bccac0]/60 bg-[#f8f9ff] text-sm text-[#0b1c30] focus:outline-none focus:border-[#006948] focus:bg-white transition-all placeholder:text-[#6d7a72]"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#e5eeff]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#eff4ff] text-[#3d4a42]">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">
                    Tên mục / Dịch vụ
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">
                    Đơn giá (đ)
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">
                    Tổng tiền (đ)
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center w-12">
                    Xóa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {items.map((item) => {
                  const isCourtItem = item.category === 'court';
                  const lineTotal = getItemLineTotal(item);

                  if (isCourtItem) {
                    return (
                      <tr key={item.id} className="bg-[#f0fbf7]/60 hover:bg-[#f0fbf7] transition-colors">
                        {/* Hàng đầu tiên: TÊN MỤC / DỊCH VỤ - Chỉ cho chỉnh giờ thuê sân */}
                        <td className="px-4 py-3.5 text-sm text-[#0b1c30]">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#006948]" />
                              <span className="font-bold text-[#006948] whitespace-nowrap">
                                Tiền giờ thuê sân:
                              </span>
                            </div>
                            <input
                              type="text"
                              value={item.rentalTime ?? ''}
                              onChange={(e) => updateCourtRentalTime(item.id, e.target.value)}
                              placeholder="08:00 - 10:00"
                              className="w-44 px-2.5 py-1 text-xs sm:text-sm font-bold text-[#0b1c30] bg-white border border-[#85f8c4] focus:border-[#006948] rounded-lg focus:outline-none shadow-2xs"
                            />
                          </div>
                        </td>

                        {/* ĐƠN GIÁ (Đ) - Bỏ trống */}
                        <td className="px-4 py-3.5 text-sm text-center text-[#bccac0]"></td>

                        {/* SỐ LƯỢNG - Bỏ trống */}
                        <td className="px-4 py-3.5 text-sm text-center text-[#bccac0]"></td>

                        {/* TỔNG TIỀN (Đ) - Tự nhập tay */}
                        <td className="px-4 py-3.5 text-right align-top">
                          <div className="flex flex-col items-end gap-1">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <CurrencyInput
                                value={item.manualTotal ?? ''}
                                onChange={(val) => {
                                  updateCourtManualTotal(
                                    item.id,
                                    val === '' ? undefined : Number(val)
                                  );
                                  if (courtFeeError) setCourtFeeError(null);
                                }}
                                placeholder="Ví dụ: 360.000"
                                className={`w-40 px-3 py-1.5 bg-white border-2 ${courtFeeError ? 'border-red-500 focus:border-red-500' : 'border-[#85f8c4] focus:border-[#006948]'} rounded-xl text-right font-extrabold text-sm text-[#006948] focus:outline-none shadow-2xs placeholder:font-normal placeholder:text-[#a0aab2] placeholder:text-xs transition-colors`}
                                title="Tự nhập tay tổng tiền giờ sân"
                              />
                              <span className="text-xs font-bold text-[#006948]">đ</span>
                            </div>
                            {courtFeeError && <span className="text-[10px] text-red-500 font-bold">{courtFeeError}</span>}
                          </div>
                        </td>

                        {/* XÓA */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => updateCourtManualTotal(item.id, 0)}
                            className="p-1.5 rounded-lg text-[#6d7a72] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                            title="Đặt lại tiền sân về 0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="px-4 py-3 text-sm text-[#0b1c30]">
                        <div className="flex items-center gap-2.5">
                          {getItemIcon(item.name, item.category)}
                          <span className="font-semibold">{item.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-[#3d4a42] text-right">
                        {formatCurrency(item.price)} <span className="text-xs">đ</span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-xl p-1 gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-[#dce9ff] text-[#0b1c30] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => setItemQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-10 text-center font-bold text-sm text-[#0b1c30] bg-transparent focus:outline-none"
                            min="0"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-[#dce9ff] text-[#0b1c30] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm font-bold text-right text-[#006948]">
                        {formatCurrency(lineTotal)} <span className="text-xs">đ</span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-[#6d7a72] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                          title="Xóa mục này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Khi chỉ có hàng tiền giờ sân, hiển thị thông báo nhẹ nhàng */}
                {items.filter((it) => it.category !== 'court').length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-5 text-center text-xs text-[#6d7a72] bg-[#f8f9ff]/40 border-t border-dashed border-[#dce9ff]"
                    >
                      <span>
                        Chưa có thêm món / dịch vụ nào. Bấm nút{' '}
                        <strong className="text-[#006948] font-bold">thêm món / dịch vụ khác</strong> bên
                        dưới để chọn nước uống, đồ ăn hoặc phụ kiện từ danh mục.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add item button & instruction hint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowCatalogModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006948] font-bold text-xs sm:text-sm rounded-xl border border-[#85f8c4] transition-all cursor-pointer w-fit shadow-2xs"
              >
                <Plus className="w-4 h-4 text-[#006948]" />
                <span>thêm món / dịch vụ khác</span>
              </button>

              {onNavigateToProducts && (
                <button
                  type="button"
                  onClick={onNavigateToProducts}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#eff4ff] text-[#545c72] hover:text-[#006948] font-semibold text-xs rounded-xl border border-[#dce9ff] transition-all cursor-pointer"
                  title="Đi đến tab quản lý các sản phẩm và giá bán"
                >
                  <Package className="w-3.5 h-3.5 text-[#006948]" />
                  <span>Quản lý danh mục & giá</span>
                </button>
              )}
            </div>

            <span className="text-xs italic text-[#6d7a72]">
              Tiền giờ sân tự nhập tay; Nước & phụ kiện tính theo số lượng
            </span>
          </div>

          {/* Bottom Payment Bar */}
          <div className="pt-5 border-t border-[#eff4ff] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6d7a72]">
                Phương thức thanh toán
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer font-bold text-sm ${paymentMethod === 'qr'
                    ? 'border-[#006948] bg-[#85f8c4]/15 text-[#006948]'
                    : 'border-[#dce9ff] bg-white text-[#545c72] hover:bg-[#eff4ff]'
                    }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Chuyển khoản</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer font-bold text-sm ${paymentMethod === 'cash'
                    ? 'border-[#006948] bg-[#85f8c4]/15 text-[#006948]'
                    : 'border-[#dce9ff] bg-white text-[#545c72] hover:bg-[#eff4ff]'
                    }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tiền mặt</span>
                </button>
              </div>
            </div>

            {/* Total Due & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-end">
              <div className="flex flex-col sm:items-end">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6d7a72]">
                  Tổng tiền cần thu
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#006948] tracking-tight">
                  {formatCurrency(totalAmount)} đ
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-bold text-sm border border-[#dce9ff] transition-all cursor-pointer"
                >
                  {editingInvoiceId ? 'Hủy sửa' : 'Hủy / Tạo mới'}
                </button>

                {/* Nút: Lưu */}
                <button
                  type="button"
                  onClick={handleSaveNew}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
                  title="Lưu lại hóa đơn vào hệ thống, cập nhật mã phiếu và làm mới bảng thu tiền"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Invoices List: "Danh sách Hóa Đơn trong ngày (Pickleball 1)" */}
      <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 border-b border-[#eff4ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#0b1c30]">
              Danh sách Hóa Đơn trong ngày ({court.name})
            </h2>
            <p className="text-xs text-[#6d7a72]">
              Đối soát doanh thu các lượt chơi đã lập hóa đơn hôm nay
            </p>
          </div>
          <span className="text-xs font-bold text-[#006948] bg-[#eff4ff] px-3 py-1 rounded-full border border-[#dce9ff]">
            Đã lập {invoices.length} hóa đơn
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eff4ff] text-[#3d4a42]">
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Số HĐ</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Khung giờ</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Tên khách hàng</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-right">Tổng tiền (VNĐ)</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff]">
              {invoices.map((inv) => {
                const isExpanded = expandedInvoiceId === inv.id;
                return (
                  <React.Fragment key={inv.id}>
                    <tr
                      onClick={() => handleToggleExpand(inv)}
                      className={`hover:bg-[#f8f9ff] transition-colors cursor-pointer ${isExpanded ? 'bg-[#eff4ff]/70 font-semibold' : ''
                        }`}
                    >
                      <td className="px-5 py-3.5 text-sm font-bold text-[#0b1c30]">
                        {inv.id}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#545c72] font-medium">
                        {inv.timeSlot}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-[#0b1c30]">
                        {inv.customerName}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-extrabold text-right text-[#006948]">
                        {formatCurrency(inv.totalAmount)} đ
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpand(inv);
                          }}
                          className={`w-8 h-8 inline-flex items-center justify-center rounded-xl transition-all cursor-pointer border shadow-2xs ${isExpanded
                            ? 'bg-[#006948] text-white border-[#006948]'
                            : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006948] border-[#dce9ff]'
                            }`}
                          title={isExpanded ? 'Thu gọn' : 'Xem & Sửa hóa đơn'}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : 'text-[#006948]'
                              }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {/* Sổ xuống 1 bảng như ở tạo bill ở trên nhưng nhỏ đơn giản hơn có thể chỉnh sửa */}
                    {isExpanded && editingDraft && (
                      <tr className="bg-[#f8faff]">
                        <td colSpan={5} className="p-3 sm:p-5 border-t border-b border-[#dce9ff]">
                          <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-sm p-4 flex flex-col gap-3.5">
                            {/* Header of mini bill */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eff4ff]">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-extrabold text-[#006948] bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#dce9ff]">
                                  Hóa đơn {editingDraft.id}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[#3d4a42]">Khách hàng:</span>
                                  <input
                                    type="text"
                                    value={editingDraft.customerName}
                                    onChange={(e) => updateDraftCustomerName(e.target.value)}
                                    placeholder="Tên khách hàng"
                                    className="px-2.5 py-1 bg-[#f8f9ff] border border-[#dce9ff] rounded-lg text-xs font-bold text-[#0b1c30] focus:border-[#006948] focus:bg-white focus:outline-none w-48"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleLoadInvoiceToMainForm(inv)}
                                  className="text-xs font-bold text-[#0051d5] hover:text-[#003da1] flex items-center gap-1 cursor-pointer bg-[#eff4ff] hover:bg-[#dce9ff] px-2.5 py-1 rounded-lg border border-[#b2d0ff] transition-colors"
                                  title="Chuyển hóa đơn này lên biểu mẫu chính bên trên để chỉnh sửa"
                                >
                                  <span>Đưa lên bảng chính</span>
                                </button>

                                {/* Nút Xóa bill ở thanh header */}
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(inv.id)}
                                  className="text-xs font-bold text-[#ba1a1a] hover:text-[#93000a] flex items-center gap-1 cursor-pointer bg-[#ffdad6]/70 hover:bg-[#ffdad6] px-2.5 py-1 rounded-lg border border-[#ffb4ab]/60 transition-colors"
                                  title="Xóa vĩnh viễn hóa đơn này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa bill</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmDeleteId(null);
                                    handleToggleExpand(inv);
                                  }}
                                  className="text-xs font-bold text-[#545c72] hover:text-[#0b1c30] flex items-center gap-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Thu gọn</span>
                                </button>
                              </div>
                            </div>

                            {/* Mini Items Table: giống tạo bill ở trên nhưng nhỏ gọn */}
                            <div className="overflow-x-auto rounded-xl border border-[#e5eeff]">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-[#eff4ff] text-[#3d4a42]">
                                  <tr>
                                    <th className="px-3.5 py-2 font-bold uppercase tracking-wider">Tên mục / Dịch vụ</th>
                                    <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">Đơn giá (đ)</th>
                                    <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-center">Số lượng</th>
                                    <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">Tổng tiền (đ)</th>
                                    <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-center w-12">Xóa</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eff4ff]">
                                  {/* Row 1: Tiền giờ thuê sân */}
                                  <tr className="bg-[#eff4ff]/40">
                                    <td className="px-3.5 py-2.5 text-[#0b1c30]">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#006948] flex-shrink-0" />
                                        <span className="font-bold text-[#006948]">Tiền giờ thuê sân:</span>
                                        <input
                                          type="text"
                                          value={editingDraft.timeSlot}
                                          onChange={(e) => updateDraftTimeSlot(e.target.value)}
                                          placeholder="08:00 - 10:00"
                                          className="px-2 py-0.5 bg-white border border-[#dce9ff] rounded text-xs font-bold text-[#0b1c30] w-32 focus:outline-none focus:border-[#006948]"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-3.5 py-2.5 text-center text-[#6d7a72] italic">
                                      -
                                    </td>
                                    <td className="px-3.5 py-2.5 text-center text-[#6d7a72] italic">
                                      -
                                    </td>
                                    <td className="px-3.5 py-2.5 text-right align-top">
                                      <div className="flex flex-col items-end gap-1">
                                        <div className="inline-flex items-center justify-end gap-1">
                                          <CurrencyInput
                                            value={editingDraft.courtFee}
                                            onChange={(val) => {
                                              updateDraftCourtFee(Number(val) || 0);
                                              if (draftCourtFeeError) setDraftCourtFeeError(null);
                                            }}
                                            className={`w-24 px-2 py-0.5 bg-white border ${draftCourtFeeError ? 'border-red-500 focus:border-red-500' : 'border-[#dce9ff] focus:border-[#006948]'} rounded text-xs font-extrabold text-[#006948] text-right focus:outline-none transition-colors`}
                                          />
                                          <span className="font-bold text-[#006948]">đ</span>
                                        </div>
                                        {draftCourtFeeError && <span className="text-[10px] text-red-500 font-bold">{draftCourtFeeError}</span>}
                                      </div>
                                    </td>
                                    <td className="px-3.5 py-2.5 text-center text-[#6d7a72] italic">
                                      -
                                    </td>
                                  </tr>

                                  {/* Additional items: drinks, snacks, accessories */}
                                  {editingDraft.items
                                    .filter((it) => it.category !== 'court')
                                    .map((it) => (
                                      <tr key={it.id} className="hover:bg-[#f8f9ff]">
                                        <td className="px-3.5 py-2 text-[#0b1c30]">
                                          <div className="flex items-center gap-2">
                                            {getItemIcon(it.name, it.category)}
                                            <span className="font-semibold">{it.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-3.5 py-2 text-right font-medium text-[#3d4a42]">
                                          {formatCurrency(it.price)} <span className="text-xs">đ</span>
                                        </td>
                                        <td className="px-3.5 py-2 text-center">
                                          <div className="inline-flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded-lg p-0.5 gap-1">
                                            <button
                                              type="button"
                                              onClick={() => updateDraftQuantity(it.id, -1)}
                                              className="w-5 h-5 rounded bg-white hover:bg-[#dce9ff] font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                                            >
                                              -
                                            </button>
                                            <span className="w-5 text-center font-bold text-xs">
                                              {it.quantity}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => updateDraftQuantity(it.id, 1)}
                                              className="w-5 h-5 rounded bg-white hover:bg-[#dce9ff] font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </td>
                                        <td className="px-3.5 py-2 text-right font-bold text-[#006948]">
                                          {formatCurrency(it.price * it.quantity)} <span className="text-xs">đ</span>
                                        </td>
                                        <td className="px-3.5 py-2 text-center">
                                          <button
                                            type="button"
                                            onClick={() => removeDraftItem(it.id)}
                                            className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                                            title="Xóa món"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mini actions & footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                              {/* Left: Quick add item button */}
                              <div className="relative" ref={draftDropdownRef}>
                                <button
                                  type="button"
                                  onClick={() => setShowDraftCatalogDropdown(!showDraftCatalogDropdown)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006948] font-bold text-xs rounded-xl border border-[#85f8c4] transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>thêm món / nước</span>
                                </button>

                                {/* Dropdown menu for catalog */}
                                {showDraftCatalogDropdown && (
                                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#dce9ff] z-50 p-2 max-h-56 overflow-y-auto flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-[#6d7a72] px-2 py-1">
                                      Chọn món thêm vào:
                                    </span>
                                    {catalogItems
                                      .filter((c) => c.category !== 'court' && !editingDraft?.items.some(it => it.name === c.name))
                                      .map((cat) => (
                                        <button
                                          key={cat.id}
                                          type="button"
                                          onClick={() => addDraftCatalogItem(cat)}
                                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#eff4ff] text-left text-xs transition-colors cursor-pointer"
                                        >
                                          <div className="flex items-center gap-2">
                                            {getItemIcon(cat.name, cat.category)}
                                            <span className="font-semibold text-[#0b1c30]">{cat.name}</span>
                                          </div>
                                          <span className="font-bold text-[#006948] text-[11px]">
                                            {formatCurrency(cat.price)} đ
                                          </span>
                                        </button>
                                      ))}
                                  </div>
                                )}
                              </div>

                              {/* Right: Payment Method, Total, Save */}
                              <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                                {/* Payment method toggle */}
                                <div className="flex items-center bg-[#eff4ff] p-0.5 rounded-xl border border-[#dce9ff] text-xs font-semibold">
                                  <button
                                    type="button"
                                    onClick={() => setEditingDraft({ ...editingDraft, paymentMethod: 'qr' })}
                                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${editingDraft.paymentMethod === 'qr'
                                      ? 'bg-[#006948] text-white font-bold shadow-2xs'
                                      : 'text-[#545c72] hover:text-[#0b1c30]'
                                      }`}
                                  >
                                    QR
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingDraft({ ...editingDraft, paymentMethod: 'cash' })}
                                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${editingDraft.paymentMethod === 'cash'
                                      ? 'bg-[#006948] text-white font-bold shadow-2xs'
                                      : 'text-[#545c72] hover:text-[#0b1c30]'
                                      }`}
                                  >
                                    Tiền mặt
                                  </button>
                                </div>

                                {/* Total Amount */}
                                <div className="flex items-baseline gap-1 px-2">
                                  <span className="text-xs text-[#6d7a72]">Tổng:</span>
                                  <span className="text-sm font-extrabold text-[#006948]">
                                    {formatCurrency(editingDraft.totalAmount)} đ
                                  </span>
                                </div>

                                {/* Nút Xóa bill ở thanh thao tác dưới */}
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(inv.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffdad6]/70 hover:bg-[#ffdad6] text-[#ba1a1a] font-bold text-xs rounded-xl border border-[#ffb4ab]/60 transition-colors cursor-pointer"
                                  title="Xóa vĩnh viễn hóa đơn này khỏi hệ thống"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa bill</span>
                                </button>

                                {/* Save & Cancel */}
                                <button
                                  type="button"
                                  onClick={handleSaveDraftChanges}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006948] hover:bg-[#00855d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Lưu</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmDeleteId(null);
                                    handleToggleExpand(inv);
                                  }}
                                  className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#545c72] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                                >
                                  Đóng
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Item Catalog Selector */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#dce9ff] flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30]">Chọn món / Dịch vụ thêm vào bill</h3>
                <span className="text-xs text-[#6d7a72]">Nhấp để thêm sản phẩm vào bảng thanh toán</span>
              </div>
              <div className="flex items-center gap-2">
                {onNavigateToProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCatalogModal(false);
                      onNavigateToProducts();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#006948] bg-[#eff4ff] hover:bg-[#dce9ff] rounded-xl border border-[#85f8c4] transition-colors cursor-pointer"
                    title="Chuyển đến tab quản lý sản phẩm và bảng giá"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Quản lý giá</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#545c72] hover:text-[#0b1c30] flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex flex-col gap-2 pr-1 max-h-[50vh]">
              {catalogItems
                .filter((cat) => cat.category !== 'court' && !items.some(it => it.name === cat.name))
                .map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => addItemFromCatalog(cat)}
                    className="p-3 rounded-xl border border-[#e5eeff] hover:border-[#006948] hover:bg-[#eff4ff]/60 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {getItemIcon(cat.name, cat.category)}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#0b1c30]">{cat.name}</span>
                        <span className="text-xs text-[#6d7a72]">Đơn vị tính: {cat.unit}</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-[#006948]">
                      {formatCurrency(cat.price)} đ
                    </span>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCatalogModal(false)}
              className="mt-2 w-full py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Xác nhận xóa hóa đơn"
        message="Bạn có chắc chắn muốn xóa hóa đơn nháp này không? Thao tác này không thể hoàn tác."
        confirmText="Xóa hóa đơn"
        onConfirm={() => {
          if (confirmDeleteId) {
            handleDeleteDraftInvoice(confirmDeleteId);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
