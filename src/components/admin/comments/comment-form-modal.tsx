'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adminCommentSchema,
  type AdminCommentFormValues,
} from '@/lib/validations/admin-schema';
import { updateComment } from '@/services/comment-service';
import { buildAuthHeaders } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { showToast } from '@/components/common/toast';
import { normalizeApiError } from '@/lib/api-error';
import type { Comment } from '@/types';

interface CommentFormModalProps {
  comment: Comment;
  roomName: string;
  onClose: () => void;
  onSaved: () => void;
}

// Modal kiểm duyệt bình luận: chỉ chỉnh nội dung và số sao.
export default function CommentFormModal({
  comment,
  roomName,
  onClose,
  onSaved,
}: CommentFormModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminCommentFormValues>({
    resolver: zodResolver(adminCommentSchema),
    defaultValues: {
      noiDung: comment.noiDung,
      saoBinhLuan: comment.saoBinhLuan,
    },
  });

  const onSubmit = async (values: AdminCommentFormValues) => {
    if (!accessToken) {
      return;
    }

    try {
      await updateComment(
        comment.id,
        {
          id: comment.id,
          maPhong: comment.maPhong,
          maNguoiBinhLuan: comment.maNguoiBinhLuan,
          ngayBinhLuan: comment.ngayBinhLuan,
          ...values,
        },
        buildAuthHeaders(accessToken),
      );
      showToast('success', 'Đã cập nhật bình luận.');
      onSaved();
    } catch (error) {
      showToast('error', normalizeApiError(error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Chỉnh sửa bình luận</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm text-secondary">
          Phòng: <span className="font-medium text-foreground">{roomName}</span>
          {comment.tenNguoiBinhLuan && ` · Người bình luận: ${comment.tenNguoiBinhLuan}`}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div>
            <label
              htmlFor="comment-noidung"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Nội dung
            </label>
            <textarea
              id="comment-noidung"
              rows={4}
              {...register('noiDung')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.noiDung && (
              <p className="mt-1 text-xs text-red-600">{errors.noiDung.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="comment-sao"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Số sao (1-5)
            </label>
            <input
              id="comment-sao"
              type="number"
              min={1}
              max={5}
              {...register('saoBinhLuan', { valueAsNumber: true })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {errors.saoBinhLuan && (
              <p className="mt-1 text-xs text-red-600">{errors.saoBinhLuan.message}</p>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
