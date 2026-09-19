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

// Phần tương tác của trang Bình luận: vẽ bảng, sửa nội dung và số sao, xóa bình luận.
// Không có nút thêm mới, vì bình luận chỉ phát sinh khi người dùng tự viết.
export default function CommentsPanel({ comments, roomNameByCode }: CommentsPanelProps) {
  // Dùng để bảo Next.js tải lại dữ liệu của trang sau khi thêm, sửa hoặc xóa xong.
  const router = useRouter();

  // Token của người đang đăng nhập. Các thao tác ghi dữ liệu đều phải kèm token này.
  const accessToken = useAuthStore((s) => s.accessToken);

  // editingComment: bình luận đang mở form sửa. deleteTarget: bình luận đang chờ xác nhận xóa.
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleFormSaved() {
    setEditingComment(null);
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
      await deleteComment(deleteTarget.id, buildAuthHeaders(accessToken));
      // Xóa xong thì báo một câu, đóng hộp xác nhận, rồi bảo trang tải lại danh sách.
      showToast('success', 'Đã xóa bình luận.');
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
