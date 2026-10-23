import React from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-[320px] p-6 text-center">
        <h2 className="text-lg font-semibold mb-3">Are You Sure?</h2>
        <p className="text-gray-600 text-sm mb-6">Do you want to delete this vehicle?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="flex items-center justify-center w-[80px] h-[36px] rounded-full bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-medium hover:opacity-90 transition-all"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-[80px] h-[36px] rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-all"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
