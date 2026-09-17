'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  EnvelopeSimple, 
  ArrowLeft, 
  Sparkle, 
  WarningCircle, 
  CheckCircle,
  CircleNotch,
  PaperPlaneTilt
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message || 'Gagal mengirim instruksi reset kata sandi.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi gangguan koneksi. Coba lagi nanti.');
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
            Lupa Kata Sandi?
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 max-w-xs">
            Masukkan email akun Onward Anda untuk menerima tautan pemulihan kata sandi.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-card rounded-2xl border border-border-subtle p-7 sm:p-8 card-spec shadow-[0_8px_30px_rgba(124,92,252,0.06)]">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-status-completed-tint text-status-completed mx-auto flex items-center justify-center">
                <CheckCircle size={36} weight="bold" />
              </div>
              <h2 className="font-display font-bold text-lg text-text-primary">
                Tautan Pemulihan Dikirim!
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke alamat <strong className="text-text-primary">{email}</strong>.
                Buka tautan tersebut untuk membuat kata sandi baru.
              </p>
              <div className="pt-3 space-y-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all"
                >
                  <ArrowLeft size={16} weight="bold" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="w-full text-xs text-text-secondary hover:text-text-primary py-2 transition-colors"
                >
                  Kirim ulang email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-semantic-urgent-tint border border-semantic-urgent/20 flex items-start gap-3 text-xs text-semantic-urgent font-medium animate-in fade-in duration-200">
                  <WarningCircle size={18} className="shrink-0 mt-0.5" weight="bold" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5" htmlFor="reset-email">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <EnvelopeSimple
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    id="reset-email"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-[0_4px_16px_rgba(124,92,252,0.25)] transition-all active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={18} className="animate-spin" />
                    <span>Mengirim Instruksi...</span>
                  </>
                ) : (
                  <>
                    <PaperPlaneTilt size={16} weight="bold" />
                    <span>Kirim Tautan Pemulihan</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-secondary">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
