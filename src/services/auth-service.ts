// Hai lời gọi API về tài khoản: đăng nhập và đăng ký.
// Đây là hai API duy nhất không cần token người dùng, vì lúc gọi thì chưa ai đăng nhập.

import { apiClient } from '@/lib/api-client';
import type { CyberSoftEnvelope, AuthResult, SignInPayload, SignUpPayload, User } from '@/types';

const RESOURCE = '/auth';

// Đăng nhập. Server trả về thông tin người dùng kèm token.
// Trang đăng nhập quản trị dùng hàm này, rồi tự kiểm tra quyền ADMIN.
export async function signIn(payload: SignInPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<CyberSoftEnvelope<AuthResult>>(
    `${RESOURCE}/signin`,
    payload,
  );
  return data.content;
}

// Đăng ký tài khoản mới. Phía quản trị không dùng, chỉ phần người dùng dùng.
export async function signUp(payload: SignUpPayload): Promise<User> {
  const { data } = await apiClient.post<CyberSoftEnvelope<User>>(
    `${RESOURCE}/signup`,
    payload,
  );
  return data.content;
}
