import { apiClient } from '@/lib/api-client';
import type { CyberSoftEnvelope, AuthResult, SignInPayload, SignUpPayload, User } from '@/types';

const RESOURCE = '/auth';

export async function signIn(payload: SignInPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<CyberSoftEnvelope<AuthResult>>(
    `${RESOURCE}/signin`,
    payload,
  );
  return data.content;
}

export async function signUp(payload: SignUpPayload): Promise<User> {
  const { data } = await apiClient.post<CyberSoftEnvelope<User>>(
    `${RESOURCE}/signup`,
    payload,
  );
  return data.content;
}
