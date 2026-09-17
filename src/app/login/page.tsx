'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  EnvelopeSimple, 
  LockSimple, 
  Eye, 
  EyeSlash, 
  ArrowRight, 
  Sparkle, 
  WarningCircle, 
  CheckCircle,
  CircleNotch
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const queryError = searchParams.get('error');
  const queryMessage = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    queryError === 'auth_callback_failed'
      ? 'Gagal memverifikasi tautan masuk. Silakan coba masuk kembali.'
      : null
  );

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Harap masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Email atau kata sandi yang Anda masukkan salah.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Email Anda belum dikonfirmasi. Harap periksa kotak masuk atau spam email Anda.');
        } else {
          setErrorMessage(error.message || 'Terjadi kesalahan saat masuk. Coba lagi.');
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi gangguan koneksi. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  return (
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
        <p className="text-sm text-text-secondary mt-1.5 max-w-xs">
          Satu tempat terpadu untuk mengelola kuliah, kompetisi, dan kepanitiaanmu.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle p-7 sm:p-8 card-spec shadow-[0_8px_30px_rgba(124,92,252,0.06)]">
        {/* Messages */}
        {queryMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-status-completed-tint border border-status-completed/20 flex items-start gap-3 text-xs text-status-completed font-medium">
            <CheckCircle size={18} className="shrink-0 mt-0.5" weight="bold" />
            <span>{queryMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-semantic-urgent-tint border border-semantic-urgent/20 flex items-start gap-3 text-xs text-semantic-urgent font-medium animate-in fade-in duration-200">
            <WarningCircle size={18} className="shrink-0 mt-0.5" weight="bold" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="login-email">
              Email Kampus / Pribadi
            </label>
            <div className="relative">
              <EnvelopeSimple
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@kampus.ac.id"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary placeholder:text-text-secondary/70 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-text-primary" htmlFor="login-password">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <LockSimple
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Akun</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-secondary">
          <span>Belum memiliki akun? </span>
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-page-background flex items-center justify-center p-4 md:p-8">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto flex items-center justify-center py-20">
          <CircleNotch size={32} className="animate-spin text-primary" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
