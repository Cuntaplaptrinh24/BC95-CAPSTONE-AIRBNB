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

// Phần tương tác của trang Người dùng: bảng dữ liệu + thêm/sửa/xóa.
// Dữ liệu danh sách được Server Component cha tải sẵn qua props; sau khi
// thêm/sửa/xóa thành công, gọi router.refresh() để tải lại từ server.
export default function UsersPanel({ users }: UsersPanelProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUser = useAuthStore((s) => s.user);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreateForm() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEditForm(target: User) {
    setEditingUser(target);
    setFormOpen(true);
  }

  function handleFormSaved() {
    setFormOpen(false);
    setEditingUser(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !accessToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id, buildAuthHeaders(accessToken));
      showToast('success', 'Đã xóa người dùng.');
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    } finally {
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

      {formOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}

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
