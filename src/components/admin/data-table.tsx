// Bảng dữ liệu dùng chung cho cả năm màn hình quản lý.
// Mỗi màn hình chỉ mô tả bảng của mình gồm những cột nào, còn phần vẽ bảng,
// trạng thái đang tải và trạng thái không có dữ liệu thì dùng chung ở đây.

// Mô tả một cột:
//   key       tên riêng của cột, dùng để React phân biệt các cột với nhau
//   header    chữ hiện ở dòng tiêu đề
//   render    hàm nhận vào một dòng dữ liệu và trả về nội dung ô của cột đó
//   className lớp trang trí thêm, có thể bỏ trống
// Chữ T là kiểu dữ liệu của một dòng, để trống cho nơi gọi quyết định:
// màn hình Người dùng truyền vào kiểu người dùng, màn hình Phòng truyền kiểu phòng.
interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

// Những thứ màn hình gọi bảng phải truyền vào:
//   columns      danh sách cột
//   data         danh sách dòng
//   rowKey       hàm lấy ra mã riêng của mỗi dòng, thường là id
//   isLoading    đang tải dữ liệu hay không
//   emptyMessage câu hiện khi danh sách rỗng
interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
}

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
        {/* Dòng tiêu đề: vẽ ra từ danh sách cột */}
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

        {/* Phần thân bảng có ba trạng thái: đang tải, không có dữ liệu, và có dữ liệu */}
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
            // Mỗi dòng dữ liệu vẽ ra một hàng, trong hàng lại vẽ từng ô theo danh sách cột.
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
