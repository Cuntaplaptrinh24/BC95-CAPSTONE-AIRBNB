import axios from 'axios';
import type { ApiErrorShape } from '@/types/api';

interface RawErrorBody {
  content?: string | { message?: string };
  contentText?: string;
}

// Chuẩn hóa lỗi Axios thành thông báo dễ dùng ở UI.
export function normalizeApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as RawErrorBody | undefined;

    const message =
      data?.content && typeof data.content !== 'string'
        ? data.content.message
        : (data?.content as string | undefined) ??
          (data?.contentText as string | undefined) ??
          error.message;

    return {
      statusCode: status,
      message: message ?? 'Đã xảy ra lỗi không xác định.',
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 0,
      message: error.message,
    };
  }

  return {
    statusCode: 0,
    message: 'Đã xảy ra lỗi không xác định.',
  };
}
