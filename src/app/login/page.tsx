"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { ADMIN_API_BASE, saveAdminSession } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch(`${ADMIN_API_BASE}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.token || !data?.user) {
        setErrorMsg(
          (isAr ? data?.messageAr : data?.messageEn) ||
            data?.message ||
            (isAr
              ? "فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور."
              : "Sign in failed. Please check your credentials or register first."),
        );
        setLoading(false);
        return;
      }

      saveAdminSession(data.token, data.user);
      router.replace("/");
    } catch {
      setErrorMsg(
        isAr
          ? "تعذر الاتصال بالخادم الخلفي. تأكد من تشغيل الخادم."
          : "Unable to reach the Wherio backend server. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="admin-auth-page flex min-h-screen flex-col justify-between bg-gradient-to-br from-[#072549] via-[#0A2E5C] to-[#04172E] p-4 sm:p-8 text-white"
    >
      {/* Top Bar */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 80 80" fill="none" className="h-10 w-10 shrink-0">
            <path
              d="M40 7C29.5 7 21 15.5 21 26C21 36.2 40 53 40 53C40 53 59 36.2 59 26C59 15.5 50.5 7 40 7ZM40 32.5C36.1 32.5 33 29.4 33 25.5C33 21.6 36.1 18.5 40 18.5C43.9 18.5 47 21.6 47 25.5C47 29.4 43.9 32.5 40 32.5Z"
              fill="#0088FF"
            />
            <path
              d="M8 29C13 28 19 36 26 57L40 39L34 31L26 44C21 32 15 25 8 29Z"
              fill="#00D2B4"
            />
            <path
              d="M72 29C67 28 61 36 54 57L40 39L46 31L54 44C59 32 65 25 72 29Z"
              fill="#00B89C"
            />
          </svg>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              wherio
            </span>
            <p className="text-[10px] font-bold tracking-widest text-[#00D2B4]">
              {isAr ? "بوابة الإدارة والحوكمة" : "ADMIN GOVERNANCE PORTAL"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLang(isAr ? "en" : "ar")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20"
        >
          <Globe className="h-3.5 w-3.5 text-[#00D2B4]" />
          {isAr ? "English" : "العربية"}
        </button>
      </div>

      {/* Main Card */}
      <div className="mx-auto my-8 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl lg:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#072549] to-[#0072DC] p-6 sm:p-8 text-white lg:col-span-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00D2B4]/20 px-3 py-1 text-[11px] font-extrabold text-[#00D2B4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isAr ? "وصول مقيد للمشرفين" : "RESTRICTED ADMIN ACCESS"}
            </span>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
              {isAr
                ? "تسجيل دخول المشرفين المعتمدين"
                : "Sign in to Wherio Governance"}
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-sky-100/90">
              {isAr
                ? "لوحة التحكم محمية ومخصصة فقط للمشرفين المسجلين لإدارة جودة البيانات، التقييمات الموثقة، وتفعيل المدن."
                : "This portal is strictly restricted to registered Wherio administrators, content editors, and moderators."}
            </p>
          </div>

          <div className="mt-8 space-y-3 rounded-2xl bg-white/10 p-4 text-xs backdrop-blur-xs">
            <div className="flex items-center gap-2 font-extrabold text-[#00D2B4]">
              <KeyRound className="h-4 w-4 shrink-0" />
              <span>
                {isAr ? "مشرف جديد؟" : "First time setting up your account?"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-sky-100">
              {isAr
                ? "استخدم صفحة تسجيل مشرف جديد مع مفتاح المشرف السري (ADMIN_API_KEY) لإنشاء حسابك."
                : "Register a new administrator account using your master ADMIN_API_KEY on the Sign-Up page."}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 font-extrabold text-white underline decoration-[#00D2B4] underline-offset-4 hover:text-[#00D2B4]"
            >
              {isAr
                ? "الانتقال إلى إنشاء حساب مشرف ←"
                : "Create Admin Account with Key →"}
            </Link>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 sm:p-10 lg:col-span-7">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-[#072549]">
              {isAr ? "تسجيل الدخول" : "Administrator Sign In"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {isAr
                ? "أدخل بريدك الإلكتروني أو رقم هاتفك المسجل وكلمة المرور"
                : "Enter your registered administrator email (or phone) and password"}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                {isAr
                  ? "البريد الإلكتروني أو رقم الهاتف"
                  : "Email Address or Phone"}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@wherio.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-900 outline-none transition focus:border-[#0072DC] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-xs font-semibold text-slate-900 outline-none transition focus:border-[#0072DC] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#072549] px-5 py-3 text-xs font-extrabold text-white shadow-md transition hover:bg-[#0072DC] disabled:opacity-60"
            >
              <span>
                {loading
                  ? isAr
                    ? "جاري التحقق..."
                    : "Authenticating..."
                  : isAr
                    ? "دخول إلى لوحة التحكم"
                    : "Sign In to Dashboard"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
            {isAr ? "ليس لديك حساب مشرف بعد؟ " : "Don't have an admin account? "}
            <Link
              href="/sign-up"
              className="font-extrabold text-[#0072DC] hover:underline"
            >
              {isAr
                ? "إنشاء حساب مشرف جديد (يتطلب مفتاح المشرف)"
                : "Sign Up with Admin Key"}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-slate-400">
        Wherio Governance & Content Quality Portal • Protected Route
      </p>
    </div>
  );
}
