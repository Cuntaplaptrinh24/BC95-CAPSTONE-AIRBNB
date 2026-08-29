export const AUTH_MODAL_OPEN_EVENT = "airbnb:open-auth";

// Yêu cầu Header mở AuthModal hiện có (client-only, an toàn trong lifecycle trình duyệt).
export function requestAuthModal(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_MODAL_OPEN_EVENT));
}
