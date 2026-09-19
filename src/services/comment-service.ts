import {
  apiClient,
  type AuthHeader,
} from "@/lib/api-client";

import type {
  CyberSoftEnvelope,
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "@/types";

// Các lời gọi API về bình luận.
// Khu quản trị dùng getComments để lấy toàn bộ, updateComment để kiểm duyệt,
// deleteComment để gỡ bình luận. Hai hàm còn lại là của phần người dùng.

const RESOURCE = "/binh-luan";

// Lấy toàn bộ bình luận. API không có sẵn phân trang nên trang quản lý
// phải tải hết rồi tự lọc và tự cắt trang.
export async function getComments(): Promise<
  Comment[]
> {
  const { data } =
    await apiClient.get<
      CyberSoftEnvelope<
        Comment[]
      >
    >(RESOURCE);

  return data.content;
}

// Lấy bình luận theo phòng
export async function getCommentsByRoom(
  maPhong: number,
): Promise<Comment[]> {
  const { data } =
    await apiClient.get<
      CyberSoftEnvelope<
        Comment[]
      >
    >(
      `${RESOURCE}/lay-binh-luan-theo-phong/${encodeURIComponent(
        maPhong,
      )}`,
    );

  return data.content;
}

// Thêm bình luận
export async function createComment(
  payload: CreateCommentPayload,
  authHeader: AuthHeader,
): Promise<Comment> {
  const { data } =
    await apiClient.post<
      CyberSoftEnvelope<Comment>
    >(
      RESOURCE,
      payload,
      {
        headers: authHeader,
      },
    );

  return data.content;
}

// Cập nhật bình luận
export async function updateComment(
  id: number,
  payload: UpdateCommentPayload,
  authHeader: AuthHeader,
): Promise<Comment> {
  const { data } =
    await apiClient.put<
      CyberSoftEnvelope<Comment>
    >(
      `${RESOURCE}/${encodeURIComponent(
        id,
      )}`,
      payload,
      {
        headers: authHeader,
      },
    );

  return data.content;
}

// Xóa bình luận
export async function deleteComment(
  id: number,
  authHeader: AuthHeader,
): Promise<unknown> {
  const { data } =
    await apiClient.delete<
      CyberSoftEnvelope<unknown>
    >(
      `${RESOURCE}/${encodeURIComponent(
        id,
      )}`,
      {
        headers: authHeader,
      },
    );

  return data.content;
}