import { apiClient, buildAuthHeaders, type AuthHeader } from '@/lib/api-client';
import type {
  CyberSoftEnvelope,
  PaginatedContent,
  PaginationParams,
  User,
  UpdateUserPayload,
  CreateUserPayload,
} from '@/types';

// Các lời gọi API về người dùng.
// Mỗi hàm chỉ làm hai việc: gọi API rồi bóc lấy phần content trong gói trả về,
// nên phần còn lại của dự án không phải biết tới lớp vỏ của API CyberSoft.
//
// Những hàm có tham số authHeader là việc chỉ người đăng nhập mới làm được,
// token đi kèm để server biết ai đang thao tác và có đủ quyền hay không.

const RESOURCE = '/users';

// Lấy một trang danh sách người dùng, có thể kèm từ khóa tìm kiếm.
// Trang quản lý Người dùng gọi hàm này.
export async function getUsersPaged(
  params: PaginationParams,
): Promise<PaginatedContent<User>> {
  const { data } = await apiClient.get<CyberSoftEnvelope<PaginatedContent<User>>>(
    `${RESOURCE}/phan-trang-tim-kiem`,
    { params },
  );
  return data.content;
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await apiClient.get<CyberSoftEnvelope<User>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
  );
  return data.content;
}

// Thêm người dùng mới, form thêm mới ở khu quản trị gọi hàm này.
export async function createUser(
  payload: CreateUserPayload,
  authHeader: AuthHeader,
): Promise<User> {
  const { data } = await apiClient.post<CyberSoftEnvelope<User>>(RESOURCE, payload, {
    headers: authHeader,
  });
  return data.content;
}

// Xóa người dùng. Lưu ý API này nhận mã người dùng ở phần sau dấu hỏi trên địa chỉ
// chứ không phải trong đường dẫn, khác với API xóa vị trí và xóa phòng.
export async function deleteUser(id: number, authHeader: AuthHeader): Promise<void> {
  await apiClient.delete(RESOURCE, {
    params: { id },
    headers: authHeader,
  });
}

// Cập nhật người dùng. Gửi kèm cả mã người dùng trong nội dung vì API đòi như vậy.
export async function updateUser(
  id: number,
  payload: UpdateUserPayload,
  authHeader: AuthHeader,
): Promise<User> {
  const { data } = await apiClient.put<CyberSoftEnvelope<User>>(
    `${RESOURCE}/${encodeURIComponent(id)}`,
    { ...payload, id },
    { headers: authHeader },
  );
  return data.content;
}

// Đổi ảnh đại diện. Ảnh không gửi như dữ liệu thường mà đóng vào FormData,
// đây là cách trình duyệt gửi file lên server.
export async function uploadAvatar(
  file: File,
  accessToken: string,
): Promise<User> {
  const formData = new FormData();
  formData.append('formFile', file);

  const { data } = await apiClient.post<CyberSoftEnvelope<User>>(
    `${RESOURCE}/upload-avatar`,
    formData,
    { headers: buildAuthHeaders(accessToken) },
  );
  return data.content;
}
