"use client";

// Khối bình luận ở trang chi tiết phòng: xem danh sách, viết mới,
// và sửa hoặc xóa bình luận của chính mình.
// Danh sách ban đầu do trang cha lấy sẵn ở máy chủ, sau mỗi thao tác thì gọi
// lại API để lấy bản mới.

import { useState } from "react";
import type { Comment } from "@/types/comment";
import { useAuthStore } from "@/store/auth-store";
import { buildAuthHeaders } from "@/lib/api-client";
import { normalizeApiError } from "@/lib/api-error";
import { requestAuthModal } from "@/lib/auth-events";
import { showToast } from "@/components/common/toast";
import SafeImage from "@/components/common/safe-image";
import EmptyState from "@/components/common/empty-state";
import DataErrorState from "@/components/common/data-error-state";
import {
  createComment,
  deleteComment,
  getCommentsByRoom,
  updateComment,
} from "@/services/comment-service";

interface CommentSectionProps {
  roomId: number;
  initialComments: Comment[];
  failed: boolean;
}

function parseRating(value: number): number {
  const n = Number.isFinite(value) ? value : 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

function parseDateLabel(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface EditableComment extends Comment {
  _localName?: string;
}

// Sắp bình luận mới nhất lên đầu.
// API trả về theo thứ tự cũ trước, nên viết xong bình luận mới rơi xuống tận cuối
// danh sách, người viết tưởng là không gửi được.
// Cùng ngày thì cái có mã lớn hơn coi như mới hơn, để thứ tự luôn cố định.
function sortNewestFirst<T extends Comment>(list: T[]): T[] {
  return [...list].sort((first, second) => {
    const firstTime = new Date(first.ngayBinhLuan).getTime() || 0;
    const secondTime = new Date(second.ngayBinhLuan).getTime() || 0;

    if (firstTime !== secondTime) {
      return secondTime - firstTime;
    }

    return second.id - first.id;
  });
}

export default function CommentSection({
  roomId,
  initialComments,
  failed: initialFailed,
}: CommentSectionProps) {
  const { user, accessToken, isAuthenticated, hasHydrated } = useAuthStore();
  const [comments, setComments] = useState<EditableComment[]>(
    sortNewestFirst(initialComments),
  );
  const [failed, setFailed] = useState(initialFailed);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  // Chỉ chủ bình luận mới thấy nút Sửa và Xóa của bình luận đó.
  const isOwnComment = (comment: Comment) =>
    !!user && comment.maNguoiBinhLuan === user.id;

  // Gọi lại API lấy danh sách bình luận mới nhất của phòng này.
  const refresh = async () => {
    try {
      const fresh = await getCommentsByRoom(roomId);
      setComments(sortNewestFirst(fresh ?? []));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };

  // Kiểm tra đã đăng nhập chưa. Chưa thì báo và mở cửa sổ đăng nhập,
  // trả về false để chỗ gọi dừng lại.
  const requireAuth = (): boolean => {
    if (!hasHydrated || !isAuthenticated || !user || !accessToken) {
      showToast("error", "Vui lòng đăng nhập để bình luận.");
      requestAuthModal();
      return false;
    }
    return true;
  };

  // Gửi bình luận mới: kiểm tra nội dung và số sao trước, rồi mới gọi API.
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const trimmed = content.trim();
    if (!trimmed) {
      setFormError("Nội dung bình luận không được để trống.");
      return;
    }
    const stars = Math.round(rating);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      setFormError("Số sao phải từ 1 đến 5.");
      return;
    }
    if (!requireAuth() || !user || !accessToken) return;

    setSubmitting(true);
    try {
      // Giữ lại bình luận vừa tạo do server trả về, phòng trường hợp lần gọi lại
      // danh sách ngay sau đó chưa kịp có nó.
      const created = await createComment(
        {
          id: 0,
          maPhong: roomId,
          maNguoiBinhLuan: user.id,
          ngayBinhLuan: new Date().toISOString(),
          noiDung: trimmed,
          saoBinhLuan: stars,
        },
        buildAuthHeaders(accessToken),
      );
      setContent("");
      setRating(5);
      showToast("success", "Đã thêm bình luận.");

      try {
        const fresh = await getCommentsByRoom(roomId);
        const list = fresh ?? [];

        // Danh sách mới chưa có bình luận vừa viết thì tự chèn vào đầu,
        // để người viết thấy ngay thay vì tưởng gửi hỏng.
        const hasCreated = list.some(
          (item) => item.id === created.id,
        );

        setComments(
          sortNewestFirst(
            hasCreated ? list : [created, ...list],
          ),
        );

        setFailed(false);
      } catch {
        setFailed(true);
      }
    } catch (err: unknown) {
      const apiError = normalizeApiError(err);
      setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở chế độ sửa cho một bình luận: chép nội dung và số sao hiện tại vào ô nhập.
  const startEdit = (comment: EditableComment) => {
    setEditingId(comment.id);
    setEditContent(comment.noiDung);
    setEditRating(parseRating(comment.saoBinhLuan));
    setFormError("");
  };

  // Lưu bình luận đã sửa. busyId giữ mã bình luận đang xử lý, để khóa nút của
  // đúng dòng đó và tránh bấm hai lần.
  const handleUpdate = async (comment: EditableComment) => {
    if (busyId !== null) return;
    const trimmed = editContent.trim();
    if (!trimmed) {
      setFormError("Nội dung bình luận không được để trống.");
      return;
    }
    const stars = Math.round(editRating);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      setFormError("Số sao phải từ 1 đến 5.");
      return;
    }
    if (!user || !accessToken) return;

    setBusyId(comment.id);
    try {
      await updateComment(
        comment.id,
        {
          id: comment.id,
          maPhong: comment.maPhong,
          maNguoiBinhLuan: comment.maNguoiBinhLuan,
          ngayBinhLuan: comment.ngayBinhLuan,
          noiDung: trimmed,
          saoBinhLuan: stars,
        },
        buildAuthHeaders(accessToken),
      );
      setEditingId(null);
      showToast("success", "Đã cập nhật bình luận.");
      await refresh();
    } catch (err: unknown) {
      const apiError = normalizeApiError(err);
      showToast("error", apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  // Xóa bình luận. Trước đó người dùng phải bấm xác nhận, trạng thái chờ xác nhận
  // giữ trong confirmDeleteId.
  const handleDelete = async (comment: EditableComment) => {
    if (busyId !== null || !user || !accessToken) return;
    setBusyId(comment.id);
    try {
      await deleteComment(comment.id, buildAuthHeaders(accessToken));
      setConfirmDeleteId(null);
      showToast("success", "Đã xóa bình luận.");
      await refresh();
    } catch (err: unknown) {
      const apiError = normalizeApiError(err);
      showToast("error", apiError.message);
    } finally {
      setBusyId(null);
    }
  };

  const starPicker = (
    value: number,
    onChange: (v: number) => void,
    labelPrefix: string,
  ) => (
    <div className="flex items-center gap-1">
      <span className="sr-only">{labelPrefix}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${labelPrefix} ${n} sao`}
          className="p-0.5"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={n <= value ? "#FF385C" : "none"}
            stroke={n <= value ? "#FF385C" : "#717171"}
            strokeWidth="2"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );

  if (failed) {
    return <DataErrorState title="Không thể tải bình luận." />;
  }

  return (
    <div>
      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Viết đánh giá</h3>
        <label htmlFor="cm-content" className="sr-only">
          Nội dung bình luận
        </label>
        <textarea
          id="cm-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {starPicker(rating, setRating, "Số sao")}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
        {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
      </form>

      {/* List */}
      {comments.length === 0 ? (
        <EmptyState title="Chưa có đánh giá nào." />
      ) : (
        <div>
          {comments.map((c) => {
            const dateLabel = parseDateLabel(c.ngayBinhLuan);
            const name = c.tenNguoiBinhLuan?.trim()
              ? c.tenNguoiBinhLuan
              : c._localName?.trim()
                ? c._localName
                : "Người bình luận";
            const avatarSrc = c.avatarNguoiBinhLuan?.trim()
              ? c.avatarNguoiBinhLuan
              : "/placeholder-avatar.svg";
            const own = isOwnComment(c);
            const opening = editingId === c.id;

            return (
              <div key={c.id} className="border-b border-border py-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <SafeImage
                    src={avatarSrc}
                    alt={name}
                    fallbackSrc="/placeholder-avatar.svg"
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    {opening ? (
                      <div className="rounded-lg border border-border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {starPicker(editRating, setEditRating, "Chỉnh sửa số sao")}
                        </div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(c)}
                            disabled={busyId !== null}
                            className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                          >
                            {busyId === c.id ? "Đang lưu..." : "Lưu"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingId(null); setFormError(""); }}
                            disabled={busyId !== null}
                            className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-surface"
                          >
                            Hủy
                          </button>
                        </div>
                        {formError && editingId === c.id && (
                          <p className="mt-2 text-xs text-red-600">{formError}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{name}</span>
                          <span aria-label={`${parseRating(c.saoBinhLuan)} trên 5 sao`} className="text-sm text-foreground">
                            {parseRating(c.saoBinhLuan)}★
                          </span>
                        </div>
                        {dateLabel && (
                          <p className="mt-0.5 text-xs text-secondary">{dateLabel}</p>
                        )}
                        <p className="mt-1 text-sm text-foreground">{c.noiDung}</p>
                        {own && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(c)}
                              className="text-xs font-medium text-brand hover:underline"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(c.id)}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {confirmDeleteId === c.id && (
                  <div className="mt-3 rounded-lg border border-border bg-surface p-3 text-sm">
                    <p className="text-foreground">Bạn có chắc muốn xóa bình luận này?</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={busyId !== null}
                        className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {busyId === c.id ? "Đang xóa..." : "Xóa"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={busyId !== null}
                        className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-white"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
