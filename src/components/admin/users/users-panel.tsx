'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/data-table';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import SafeImage from '@/components/common/safe-image';
import UserFormModal from './user-form-modal';
import { deleteUser } from '@/services/user-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import type { User } from '@/types';

interface UsersPanelProps {
  users: User[];
}

// Phần tương tác của trang Người dùng: vẽ bảng và xử lý thêm, sửa, xóa.
// Danh sách không tự gọi API mà nhận sẵn từ trang cha đã chạy ở máy chủ.
// Xong việc thì gọi router.refresh() để trang cha chạy lại và lấy dữ liệu mới.
export default function UsersPanel({ users }: UsersPanelProps) {
  // Dùng để bảo Next.js tải lại dữ liệu của trang sau khi thêm, sửa hoặc xóa xong.
  const router = useRouter();

  // Token của người đang đăng nhập. Các thao tác ghi dữ liệu đều phải kèm token này.
  const accessToken = useAuthStore((s) => s.accessToken);
  // Thông tin chính người đang đăng nhập, dùng để chặn tự xóa tài khoản của mình.
  const currentUser = useAuthStore((s) => s.user);

  // formOpen: đang mở form hay không.
  // editingUser: đang sửa ai. Để trống nghĩa là đang thêm mới chứ không phải sửa.
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // deleteTarget: dòng đang chờ xác nhận xóa. Khác rỗng thì hộp xác nhận hiện lên.
  // isDeleting: đang gọi API xóa, dùng để khóa nút tránh bấm hai lần.
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mở form ở chế độ thêm mới: xóa trống người đang sửa rồi mở form.
  function openCreateForm() {
    setEditingUser(null);
    setFormOpen(true);
  }

  // Mở form ở chế độ sửa: ghi nhớ dòng được chọn rồi mở form.
  function openEditForm(target: User) {
    setEditingUser(target);
    setFormOpen(true);
  }

  // Form báo đã lưu xong: đóng form và bảo trang tải lại danh sách.
  function handleFormSaved() {
    setFormOpen(false);
    setEditingUser(null);
    router.refresh();
  }

  // Chạy khi người dùng bấm Xóa trong hộp xác nhận.
  async function handleConfirmDelete() {
    // Không có dòng nào đang chọn, hoặc không có token đăng nhập thì bỏ qua.
    if (!deleteTarget || !accessToken) {
      return;
    }

    // Bật cờ đang xóa để nút chuyển sang chữ "Đang xử lý" và không bấm được hai lần.
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id, buildAuthHeaders(accessToken));
      // Xóa xong thì báo một câu, đóng hộp xác nhận, rồi bảo trang tải lại danh sách.
      showToast('success', 'Đã xóa người dùng.');
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      // Xóa hỏng thì hiện câu thông báo lấy từ lỗi server trả về.
      showToast('error', normalizeApiError(error).message);
    } finally {
      // Chạy dù thành công hay thất bại, để nút không kẹt ở trạng thái đang xử lý.
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="mt-4">
        <DataTable
          // Mô tả bốn cột của bảng. Cột cuối không có tiêu đề, chứa hai nút Sửa và Xóa.
          columns={[
            {
              key: 'user',
              header: 'Người dùng',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                    <SafeImage
                      src={row.avatar ?? ''}
                      alt={row.name}
                      fallbackSrc="/placeholder-avatar.svg"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{row.name}</p>
                    <p className="truncate text-xs text-secondary">{row.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'phone',
              header: 'Điện thoại',
              render: (row) => row.phone || '—',
            },
            {
              key: 'role',
              header: 'Vai trò',
              render: (row) => (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    row.role === 'ADMIN' ? 'bg-brand/10 text-brand' : 'bg-surface text-secondary'
                  }`}
                >
                  {row.role}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              className: 'text-right',
              render: (row) => {
                // Đang đăng nhập bằng chính tài khoản này thì khóa nút Xóa,
                // tránh việc tự xóa mình rồi mất quyền vào khu quản trị.
                const isSelf = row.id === currentUser?.id;
                return (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(row)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-surface"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      disabled={isSelf}
                      title={isSelf ? 'Không thể tự xóa tài khoản đang đăng nhập.' : undefined}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Xóa
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={users}
          rowKey={(row) => row.id}
          emptyMessage="Chưa có người dùng nào."
        />
      </div>

      {/* Form chỉ được vẽ khi đang mở, đóng thì gỡ hẳn khỏi màn hình */}
      {formOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}

      {/* Hộp xác nhận luôn có mặt, tự ẩn hiện theo việc deleteTarget có dòng nào hay không */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Xóa người dùng "${deleteTarget?.name ?? ''}"?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
