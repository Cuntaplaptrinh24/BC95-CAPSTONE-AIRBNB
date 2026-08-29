'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SignInForm from './sign-in-form';
import SignUpForm from './sign-up-form';

type AuthView = 'signin' | 'signup';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export default function AuthModal({ open, onClose, initialView = 'signin' }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h1 id="auth-modal-title" className="sr-only">
          {view === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </h1>

        {view === 'signin' ? (
          <SignInForm
            onSuccess={onClose}
            onSwitchToSignUp={() => setView('signup')}
          />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setView('signin')} />
        )}
      </div>
    </div>
  );
}
