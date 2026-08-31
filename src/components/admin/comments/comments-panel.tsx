'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/data-table';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import SafeImage from '@/components/common/safe-image';
import CommentFormModal from './comment-form-modal';
import { deleteComment } from '@/services/comment-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import type { Comment } from '@/types';

interface CommentsPanelProps {
  comments: Comment[];
  roomNameByCode: Record<number, string>;
}

// Phần tương tác của trang Bình luận: bảng dữ liệu + kiểm duyệt (sửa/xóa).
// Không có form tạo mới vì bình luận luôn phát sinh từ hành động của User.
export default function CommentsPanel({ comments, roomNameByCode }: CommentsPanelProps) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleFormSaved() {
    setEditingComment(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !accessToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteComment(deleteTarget.id, buildAuthHeaders(accessToken));
      showToast('success', 'Đã xóa bình luận.');
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
      <DataTable
        columns={[
          {
            key: 'nguoiBinhLuan',
            header: 'Người bình luận',
            render: (row) => (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                  <SafeImage
                    src={row.avatarNguoiBinhLuan ?? ''}
                    alt={row.tenNguoiBinhLuan ?? 'Người dùng'}
                    fallbackSrc="/placeholder-avatar.svg"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="font-medium text-foreground">
                  {row.tenNguoiBinhLuan ?? `Mã người dùng ${row.maNguoiBinhLuan}`}
                </p>
              </div>
            ),
          },
          {
            key: 'room',
            header: 'Phòng',
            render: (row) => roomNameByCode[row.maPhong] ?? `Mã phòng ${row.maPhong}`,
          },
          {
            key: 'noiDung',
            header: 'Nội dung',
            render: (row) => <p className="max-w-xs truncate">{row.noiDung}</p>,
          },
          {
            key: 'sao',
            header: 'Sao',
            render: (row) => `${row.saoBinhLuan} ★`,
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (row) => (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingComment(row)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-surface"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>
            ),
          },
        ]}
        data={comments}
        rowKey={(row) => row.id}
        emptyMessage="Chưa có bình luận nào."
      />

      {editingComment && (
        <CommentFormModal
          comment={editingComment}
          roomName={roomNameByCode[editingComment.maPhong] ?? `Mã phòng ${editingComment.maPhong}`}
          onClose={() => setEditingComment(null)}
          onSaved={handleFormSaved}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xóa bình luận này?"
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
