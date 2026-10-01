import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { Expense } from '../types';

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
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('water');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-[#3d4a42]">
              Nội dung chi / Khoản chi *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vd: Mua đá lạnh ca sáng, Thay bóng đèn sân 3..."
              className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#ba1a1a]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-[#3d4a42]">
              Số tiền chi (VNĐ) *
            </label>
            <input
              type="number"
              required
              min="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Vd: 150000"
              className="px-3.5 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-sm focus:outline-none focus:border-[#ba1a1a]"
            />
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
              type="submit"
              className="px-5 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-sm font-bold shadow-sm"
            >
              Ghi Nhận Phiếu Chi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
