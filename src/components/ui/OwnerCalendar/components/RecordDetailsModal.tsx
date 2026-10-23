
import React from 'react';
import { X } from 'lucide-react';
import { BlockedRecord } from '../types';

interface RecordDetailsModalProps {
    record: BlockedRecord;
    onClose: () => void;
    onEdit: (record: BlockedRecord) => void;
    onDelete: (id: string, type?: string) => void;
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
    record,
    onClose,
    onEdit,
    onDelete
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-4 sm:p-6 max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-base sm:text-lg">
                        {record.type === "booking" ? "Customer Booking" : "Manage Block"}
                    </h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="mb-4">
                    <p className="text-sm text-gray-500">Selected Period:</p>
                    <p className="font-semibold">{record.from} → {record.to}</p>
                    <p className="text-xs text-gray-500 mt-1">{record.fromTime} - {record.toTime}</p>

                    {record.type === "booking" && (
                        <p className="text-xs text-green-600 mt-2 bg-green-50 p-2 rounded">
                            This is a customer booking and cannot be modified by the owner.
                        </p>
                    )}
                </div>

                {record.type === "booking" ? (
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300"
                    >
                        Close
                    </button>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={() => onEdit(record)}
                            className="w-full sm:flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(record.id, record.type)}
                            className="w-full sm:flex-1 bg-red-100 text-red-700 py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-red-200"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
