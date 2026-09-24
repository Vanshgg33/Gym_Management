'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyOtp } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true);
    try {
      await sendOtp(`+91${phone}`);
      setStep('otp');
      setResendTimer(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await verifyOtp(`+91${phone}`, otp);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await sendOtp(`+91${phone}`);
      setResendTimer(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-orange-500">Gym</span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">Desk</span>
          <p className="mt-1 text-sm text-gray-500">Gym Management</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent">
                <span className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm border-r border-gray-300 dark:border-gray-600 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-3 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Code sent to <span className="font-medium text-gray-900 dark:text-white">+91 {phone}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                6-digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent tracking-widest text-center text-lg"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
            >
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>

            <div className="text-center text-sm text-gray-500">
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button type="button" onClick={handleResend} className="text-orange-500 hover:underline">
                  Resend OTP
                </button>
              )}
              {' · '}
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="text-gray-500 hover:underline">
                Change number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
