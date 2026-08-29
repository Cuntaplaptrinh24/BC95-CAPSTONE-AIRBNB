import type { Comment } from "@/types/comment";
import SafeImage from "@/components/common/safe-image";
import EmptyState from "@/components/common/empty-state";
import DataErrorState from "@/components/common/data-error-state";

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

function StarRating({ count }: { count: number }) {
  const clamped = parseRating(count);
  return (
    <span aria-label={`${clamped} trên 5 sao`} className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < clamped ? "#FF385C" : "none"}
          stroke={i < clamped ? "#FF385C" : "#717171"}
          strokeWidth="2"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const dateLabel = parseDateLabel(comment.ngayBinhLuan);
  const name = comment.tenNguoiBinhLuan?.trim() ? comment.tenNguoiBinhLuan : "Người bình luận";
  const avatarSrc = comment.avatarNguoiBinhLuan?.trim()
    ? comment.avatarNguoiBinhLuan
    : "/placeholder-avatar.svg";

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <SafeImage
          src={avatarSrc}
          alt={name}
          fallbackSrc="/placeholder-avatar.svg"
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            <StarRating count={comment.saoBinhLuan} />
          </div>
          {dateLabel && <p className="mt-0.5 text-xs text-secondary">{dateLabel}</p>}
          <p className="mt-1 text-sm text-foreground">{comment.noiDung}</p>
        </div>
      </div>
    </div>
  );
}

interface CommentListProps {
  comments: Comment[];
  failed: boolean;
}

export default function CommentList({ comments, failed }: CommentListProps) {
  if (failed) {
    return <DataErrorState title="Không thể tải bình luận." />;
  }

  if (comments.length === 0) {
    return <EmptyState title="Chưa có đánh giá nào." />;
  }

  return (
    <div>
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} />
      ))}
    </div>
  );
}
