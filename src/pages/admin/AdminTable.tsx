import React from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading: boolean;
  error: string | null;
  emptyLabel?: string;
  total: number;
  skip: number;
  limit: number;
  onPageChange: (nextSkip: number) => void;
}

function AdminTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  emptyLabel = "Nothing here yet.",
  total,
  skip,
  limit,
  onPageChange,
}: AdminTableProps<T>) {
  return (
    <div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">{emptyLabel}</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col.header} className="px-4 py-3 whitespace-nowrap">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={rowKey(row)} className="border-t border-gray-100">
                    {columns.map((col) => (
                      <td key={col.header} className="px-4 py-3">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>
              {skip + 1}–{Math.min(skip + limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(Math.max(0, skip - limit))}
                disabled={skip === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(skip + limit)}
                disabled={skip + limit >= total}
                className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminTable;
