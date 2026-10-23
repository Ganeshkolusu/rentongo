
import React from 'react';
import { X } from 'lucide-react';
import { BlockedRecord } from '../types';

interface BlockedListModalProps {
    onClose: () => void;
    records: BlockedRecord[];
    onEdit: (record: BlockedRecord) => void;
    onDelete: (id: string, type?: string) => void;
    loading: boolean;
}

export const BlockedListModal: React.FC<BlockedListModalProps> = ({
    onClose,
    records,
    onEdit,
    onDelete,
    loading
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-base sm:text-lg">Your Blocked Dates</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                {records.length === 0 ? (
                    <p className="text-gray-500">No blocked dates</p>
                ) : (
                    <div className="space-y-2">
                        {records.map(record => (
                            <div key={record.id} className="border rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold">{record.from} → {record.to}</p>
                                        <p className="text-xs text-gray-500">{record.fromTime} - {record.toTime}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => onEdit(record)} className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200">
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(record.id, record.type)} disabled={loading} className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 disabled:opacity-50">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
