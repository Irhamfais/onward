'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LockSimple, 
  Eye, 
  EyeSlash, 
  ArrowRight, 
  CheckCircle,
  WarningCircle, 
  CircleNotch
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Kata sandi baru harus terdiri dari minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Gagal memperbarui kata sandi. Silakan coba kembali.');
        setIsLoading(false);
        return;
      }

      // Success: redirect to login with a friendly message
      router.push('/login?message=Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem. Coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group cursor-pointer" title="Onward">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgb(143, 127, 255) 0%, rgb(124, 92, 252) 100%)',
                boxShadow: 'rgba(124, 92, 252, 0.25) 0px 4px 12px',
              }}
            >
              <CheckCircle size={24} weight="bold" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-text-primary">
              Onward
            </span>
          </Link>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text-primary">
            Perbarui Kata Sandi
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 max-w-xs">
            Masukkan kata sandi baru yang aman untuk akun Onward Anda.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card rounded-2xl border border-border-subtle p-7 sm:p-8 card-spec shadow-[0_8px_30px_rgba(124,92,252,0.06)]">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-semantic-urgent-tint border border-semantic-urgent/20 flex items-start gap-3 text-xs text-semantic-urgent font-medium animate-in fade-in duration-200">
                <WarningCircle size={18} className="shrink-0 mt-0.5" weight="bold" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="new-password">
                Kata Sandi Baru (Min. 6 Karakter)
              </label>
              <div className="relative">
                <LockSimple
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary placeholder:text-text-secondary/70 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="confirm-new-password">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <LockSimple
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                />
                <input
                  id="confirm-new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary placeholder:text-text-secondary/70 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <CircleNotch size={18} className="animate-spin" />
                  <span>Menyimpan Kata Sandi...</span>
                </>
              ) : (
                <>
                  <span>Simpan & Masuk</span>
                  <ArrowRight size={16} weight="bold" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
