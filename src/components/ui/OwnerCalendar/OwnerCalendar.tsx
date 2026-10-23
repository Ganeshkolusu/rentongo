
import React from 'react';
import { X } from 'lucide-react';
import { OwnerCalendarProps } from './types';
import { useOwnerAvailability } from './hooks/useOwnerAvailability';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { BlockLegend } from './components/BlockLegend';
import { SelectedRange } from './components/SelectedRange';
import { BlockedListModal } from './components/BlockedListModal';
import { RecordDetailsModal } from './components/RecordDetailsModal';

export default function OwnerCalendar(props: OwnerCalendarProps) {
    const { isOpen, onClose, VechileId, vechileType, userId } = props;

    const { state, actions } = useOwnerAvailability(isOpen, VechileId, vechileType, userId);

    if (!isOpen) return null;

    // Filter records to only show owner blocks in the list
    const ownerBlockRecords = state.blockedRecords.filter(r => r.type === "notavailable");

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-200 z-10">
                    <X size={20} />
                </button>

                <div className="bg-gradient-to-br from-slate-100 to-blue-100 p-2 sm:p-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

                        <CalendarHeader
                            currentMonth={state.currentMonth}
                            onPrevMonth={() => actions.setCurrentMonth(new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1))}
                            onNextMonth={() => actions.setCurrentMonth(new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1))}
                            loading={state.loading}
                            blockedCount={ownerBlockRecords.length}
                            onShowBlocked={() => actions.setShowBlockedDates(true)}
                            message={state.message}
                        />

                        <CalendarGrid
                            currentMonth={state.currentMonth}
                            selectedStart={state.selectedStart}
                            selectedEnd={state.selectedEnd}
                            ownerBlockedDates={state.ownerBlockedDates}
                            customerBookedDates={state.customerBookedDates}
                            onDateClick={actions.handleDateClick}
                            formatDate={actions.formatDate}
                        />

                        <BlockLegend />

                        <SelectedRange
                            selectedStart={state.selectedStart}
                            selectedEnd={state.selectedEnd}
                            startTime={state.startTime}
                            endTime={state.endTime}
                            setStartTime={actions.setStartTime}
                            setEndTime={actions.setEndTime}
                            selectedRecord={state.selectedRecord}
                            handleUpdateBlock={actions.handleUpdateBlock}
                            handleCreateBlock={actions.handleCreateBlock}
                            handleCancel={() => {
                                actions.setSelectedRecord(null);
                                actions.setSelectedStart(null);
                                actions.setSelectedEnd(null);
                            }}
                            loading={state.loading}
                        />
                    </div>
                </div>
            </div>

            {state.showBlockedDates && (
                <BlockedListModal
                    onClose={() => actions.setShowBlockedDates(false)}
                    records={ownerBlockRecords}
                    onEdit={actions.handleEditBlock}
                    onDelete={actions.handleDeleteBlock}
                    loading={state.loading}
                />
            )}

            {state.clickedBlockRecord && (
                <RecordDetailsModal
                    record={state.clickedBlockRecord}
                    onClose={() => actions.setClickedBlockRecord(null)}
                    onEdit={(record) => {
                        actions.handleEditBlock(record);
                        actions.setClickedBlockRecord(null);
                    }}
                    onDelete={(id, type) => {
                        actions.handleDeleteBlock(id, type);
                        actions.setClickedBlockRecord(null);
                    }}
                />
            )}
        </div>
    );
}
