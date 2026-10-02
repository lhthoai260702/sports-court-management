import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#dce9ff] flex flex-col gap-4 animate-fadeIn">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full flex-shrink-0 ${isDestructive ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#eff4ff] text-[#0051d5]'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <h3 className="text-lg font-bold text-[#0b1c30]">{title}</h3>
            <p className="text-sm text-[#545c72] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eff4ff]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3d4a42] font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-white font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer ${
              isDestructive 
                ? 'bg-[#ba1a1a] hover:bg-[#93000a]' 
                : 'bg-[#006948] hover:bg-[#00855d]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
