interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
}

// Bảng dữ liệu dùng chung cho các trang quản lý (Người dùng, Vị trí, Phòng thuê...).
export default function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = 'Không có dữ liệu.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-medium text-secondary ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-secondary"
              >
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-secondary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-border last:border-b-0 hover:bg-surface/60"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-foreground ${column.className ?? ''}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
