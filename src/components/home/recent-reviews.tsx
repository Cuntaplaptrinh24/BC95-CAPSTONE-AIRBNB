import Link from "next/link";

import DataErrorState from "@/components/common/data-error-state";
import EmptyState from "@/components/common/empty-state";
import SafeImage from "@/components/common/safe-image";

import {
  getComments,
} from "@/services/comment-service";

import type {
  Comment,
} from "@/types/comment";

// Khối đánh giá gần đây ở trang chủ. Chạy ở máy chủ, tự gọi API lấy bình luận.

// Chỉ hiện 6 đánh giá mới nhất.
const REVIEW_LIMIT = 6;

// Ép số sao về khoảng 1 tới 5, phòng khi dữ liệu trả về là 0 hoặc số lạ.
function parseRating(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(
    5,
    Math.max(
      1,
      Math.round(value),
    ),
  );
}

// Đổi chuỗi ngày thành số để so sánh. Ngày hỏng thì trả về 0 nên bị xếp xuống cuối.
function parseDate(
  value: string,
): number {
  const time =
    new Date(value).getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}

function formatDate(
  value: string,
): string | null {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.toLocaleDateString(
    "vi-VN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

// Sắp xếp mới nhất lên đầu. Hai bình luận cùng ngày thì cái có mã lớn hơn
// coi như mới hơn, để thứ tự luôn cố định chứ không đảo lộn mỗi lần tải lại.
// Dùng [...comments] để sắp trên một bản sao, không sửa vào danh sách gốc.
function sortLatest(
  comments: Comment[],
): Comment[] {
  return [...comments].sort(
    (first, second) => {
      const dateDifference =
        parseDate(
          second.ngayBinhLuan,
        ) -
        parseDate(
          first.ngayBinhLuan,
        );

      if (
        dateDifference !== 0
      ) {
        return dateDifference;
      }

      return (
        second.id - first.id
      );
    },
  );
}

export default async function RecentReviews() {
  // Gọi API hỏng thì chỉ khối này báo lỗi, các khối khác của trang chủ vẫn hiện.
  let comments: Comment[] = [];
  let failed = false;

  try {
    comments =
      await getComments();
  } catch {
    failed = true;
  }

  if (failed) {
    return (
      <section className="container-airbnb py-8 sm:py-10">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Đánh giá gần đây
        </h2>

        <div className="mt-6">
          <DataErrorState title="Không thể tải đánh giá gần đây." />
        </div>
      </section>
    );
  }

  const latestComments =
    sortLatest(comments).slice(
      0,
      REVIEW_LIMIT,
    );

  return (
    <section className="container-airbnb py-8 sm:py-10">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
        Đánh giá gần đây
      </h2>

      <p className="mt-1 text-sm text-secondary">
        Chia sẻ mới nhất từ cộng
        đồng khách hàng.
      </p>

      {latestComments.length ===
      0 ? (
        <div className="mt-6">
          <EmptyState title="Chưa có đánh giá nào." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latestComments.map(
            (comment) => {
              const name =
                comment.tenNguoiBinhLuan?.trim() ||
                "Người bình luận";

              const avatar =
                comment.avatarNguoiBinhLuan?.trim() ||
                "/placeholder-avatar.svg";

              const dateLabel =
                formatDate(
                  comment.ngayBinhLuan,
                );

              const rating =
                parseRating(
                  comment.saoBinhLuan,
                );

              return (
                <Link
                  key={comment.id}
                  href={`/rooms/${comment.maPhong}`}
                  className="rounded-xl border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={avatar}
                      alt={name}
                      fallbackSrc="/placeholder-avatar.svg"
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {name}
                      </p>

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-secondary">
                        <span
                          className="font-medium text-brand"
                          aria-label={`${rating} trên 5 sao`}
                        >
                          {rating} ★
                        </span>

                        {dateLabel && (
                          <span>
                            {dateLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground">
                    {comment.noiDung?.trim() ||
                      "Người dùng chưa viết nội dung đánh giá."}
                  </p>

                  <p className="mt-3 text-xs font-medium text-brand">
                    Xem phòng #
                    {comment.maPhong}
                  </p>
                </Link>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}