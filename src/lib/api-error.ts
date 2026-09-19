import axios from 'axios';
import type { ApiErrorShape } from '@/types/api';

// Server trả lỗi không theo một dạng cố định: có lúc là chuỗi, có lúc là
// object có trường message. Khai báo này gom các dạng đó lại để đọc cho tiện.
interface RawErrorBody {
  content?: string | { message?: string };
  contentText?: string;
}

// Đưa mọi loại lỗi về cùng một dạng gồm mã lỗi và một câu thông báo,
// để các form chỉ việc lấy câu đó hiện lên cho người dùng.
export function normalizeApiError(error: unknown): ApiErrorShape {
  // Trường hợp một: gọi API được nhưng server trả về lỗi.
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as RawErrorBody | undefined;

    // Lần lượt thử các chỗ server hay đặt câu thông báo, chỗ nào có thì lấy.
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

  // Trường hợp hai: lỗi phát sinh ngay trong code, chưa gọi tới server.
  if (error instanceof Error) {
    return {
      statusCode: 0,
      message: error.message,
    };
  }

  // Trường hợp ba: lỗi không rõ nguồn gốc, vẫn phải trả về một câu để hiện lên.
  return {
    statusCode: 0,
    message: 'Đã xảy ra lỗi không xác định.',
  };
}
