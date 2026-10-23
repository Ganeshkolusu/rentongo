import React from "react";
import Button from '../ui/Button';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCall: () => void;
  vehicleName: string;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, onCall, vehicleName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 relative shadow-lg">
        <h2 className="text-xl font-bold mb-4">Booking Confirmation</h2>
        <p className="mb-4">
          Do you want to call the owner of <strong>{vehicleName}</strong>?
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="white" onClick={onClose}>No</Button>
          <Button gradient onClick={() => { onCall(); onClose(); }}>Yes</Button>
        </div>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default CallModal;
