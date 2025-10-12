// services/auth.ts

const BASE_URL = 'http://localhost:3000/auth';

export interface ApiResponse {
  success: boolean;
  message: string;
  [key: string]: any; // for optional fields like otp or userId
}

/**
 * Send forgot password request (generate OTP)
 */
export async function forgotPassword(email: string): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to send OTP');
  }

  return res.json();
}

/**
 * Verify OTP code
 */
export async function verifyOtp(email: string, code: string): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to verify OTP');
  }

  return res.json();
}

/**
 * Reset password
 */
export async function resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to reset password');
  }

  return res.json();
}
