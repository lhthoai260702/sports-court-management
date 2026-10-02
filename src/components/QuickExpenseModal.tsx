import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { Expense } from '../types';
import { CurrencyInput } from './CurrencyInput';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<Expense['category']>('water');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);

    let hasError = false;
    if (!title.trim()) {
      setTitleError('Vui lòng nhập nội dung chi!');
      hasError = true;
    } else {
      setTitleError(null);
    }

    if (isNaN(num) || num <= 0) {
      setAmountError('Vui lòng nhập số tiền chi!');
      hasError = true;
    } else {
      setAmountError(null);
    }

    if (hasError) return;

    const newExp: Expense = {
      id: `PC-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      amount: num,
      category,
      creator: 'Thu ngân ca trực',
      date: new Date().toISOString().slice(0, 10),
    };

    onAddExpense(newExp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#dce9ff] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#ba1a1a]" />
            <h2 className="text-lg font-bold text-[#0b1c30]">Nhập Thu Chi Vận Hành Sân</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#545c72] hover:text-[#0b1c30] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-[#3d4a42]">
              Nội dung chi / Khoản chi *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="Vd: Mua đá lạnh ca sáng, Thay bóng đèn sân 3..."
              className={`px-3.5 py-2 bg-[#f8f9ff] border ${titleError ? 'border-red-500 focus:border-red-500' : 'border-[#dce9ff] focus:border-[#ba1a1a]'} rounded-xl text-sm focus:outline-none`}
            />
            {titleError && <span className="text-[10px] text-red-500 font-bold">{titleError}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-[#3d4a42]">
              Số tiền chi (VNĐ) *
            </label>
            <CurrencyInput
              value={amount}
              onChange={(val) => {
                setAmount(val);
                if (amountError) setAmountError(null);
              }}
              placeholder="Vd: 150.000"
              className={`px-3.5 py-2 bg-[#f8f9ff] border ${amountError ? 'border-red-500 focus:border-red-500' : 'border-[#dce9ff] focus:border-[#ba1a1a]'} rounded-xl text-sm focus:outline-none w-full`}
            />
            {amountError && <span className="text-[10px] text-red-500 font-bold">{amountError}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-[#3d4a42]">
              Phân loại chi phí
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#ba1a1a]"
            >
              <option value="water">Tiền nước sinh hoạt & nước đá</option>
              <option value="maintenance">Bảo trì mặt sân, thay bóng đèn, lưới</option>
              <option value="electricity">Tiền điện chiếu sáng sân</option>
              <option value="salary">Lương nhân sự & trực ca</option>
              <option value="other">Chi phí khác</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#eff4ff] text-[#3d4a42] rounded-xl text-sm font-bold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-sm font-bold shadow-sm"
            >
              Ghi Nhận Phiếu Chi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
