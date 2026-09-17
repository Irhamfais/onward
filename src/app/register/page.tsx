'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  GraduationCap, 
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

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!fullName.trim()) {
      setErrorMessage('Harap masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            major: major.trim() || 'Mahasiswa',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Gagal mendaftarkan akun. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      // Try inserting into public.profiles if table exists
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: fullName.trim(),
            email: email.trim(),
            major: major.trim() || 'Mahasiswa',
            is_wa_verified: false,
          });
        } catch {
          // Schema might be in setup, user metadata is already saved in auth.users
        }
      }

      // If user session is created immediately (no confirmation needed)
      if (data?.session) {
        router.push('/');
        router.refresh();
      } else {
        // Confirmation email was sent
        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi gangguan jaringan. Coba lagi.');
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
            Daftar Akun Baru ✨
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 max-w-xs">
            Mulai kelola seluruh jadwal dan target aktivitas kampusmu secara teratur.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card rounded-2xl border border-border-subtle p-7 sm:p-8 card-spec shadow-[0_8px_30px_rgba(124,92,252,0.06)]">
          {isSuccess ? (
            /* Success confirmation screen */
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-status-completed-tint text-status-completed mx-auto flex items-center justify-center">
                <CheckCircle size={36} weight="bold" />
              </div>
              <h2 className="font-display font-bold text-lg text-text-primary">
                Pendaftaran Berhasil!
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Tautan konfirmasi telah dikirimkan ke <strong className="text-text-primary">{email}</strong>. 
                Harap periksa kotak masuk atau folder spam email Anda untuk mengaktifkan akun.
              </p>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all"
                >
                  <span>Kembali ke Halaman Masuk</span>
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-semantic-urgent-tint border border-semantic-urgent/20 flex items-start gap-3 text-xs text-semantic-urgent font-medium animate-in fade-in duration-200">
                  <WarningCircle size={18} className="shrink-0 mt-0.5" weight="bold" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="register-name">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="mis. Alya Rahmawati"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary placeholder:text-text-secondary/70 transition-all"
                  />
                </div>
              </div>

              {/* Major / Study Program */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="register-major">
                  Program Studi / Fakultas <span className="text-text-secondary font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <GraduationCap
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    id="register-major"
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="mis. Ilmu Komputer • Sem 5"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-page-background border border-border-subtle focus:border-primary focus:bg-white focus:outline-none text-sm text-text-primary placeholder:text-text-secondary/70 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="register-email">
                  Email Kampus / Pribadi
                </label>
                <div className="relative">
                  <EnvelopeSimple
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    id="register-email"
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

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="register-password">
                  Kata Sandi (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <LockSimple
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    id="register-password"
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
                <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="register-confirm-password">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <LockSimple
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    id="register-confirm-password"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={18} className="animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun</span>
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-secondary">
            <span>Sudah memiliki akun? </span>
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
