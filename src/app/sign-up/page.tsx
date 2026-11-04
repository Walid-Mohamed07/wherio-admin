"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ADMIN_API_BASE, saveAdminSession } from "@/lib/admin-auth";

export default function AdminSignUpPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+97150");
  const [countryCode, setCountryCode] = useState<"AE" | "SA" | "EG">("AE");
  const [role, setRole] = useState<
    "SUPER_ADMIN" | "CONTENT_EDITOR" | "MODERATOR"
  >("SUPER_ADMIN");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCountryChange = (c: "AE" | "SA" | "EG") => {
    setCountryCode(c);
    if (c === "AE" && (phone === "+96650" || phone === "+2010")) {
      setPhone("+97150");
    } else if (c === "SA" && (phone === "+97150" || phone === "+2010")) {
      setPhone("+96650");
    } else if (c === "EG" && (phone === "+97150" || phone === "+96650")) {
      setPhone("+2010");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg(
        isAr
          ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."
          : "Password must be at least 6 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        isAr
          ? "كلمتا المرور غير متطابقتين."
          : "Password and Confirm Password do not match.",
      );
      return;
    }

    if (!adminKey.trim()) {
      setErrorMsg(
        isAr
          ? "مفتاح وصول المشرف (ADMIN_API_KEY) مطلوب لإتمام التسجيل."
          : "A valid Admin Access Key (ADMIN_API_KEY) is required to register.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/admin/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          countryCode,
          role,
          password,
          adminKey: adminKey.trim(),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.token || !data?.user) {
        setErrorMsg(
          (isAr ? data?.messageAr : data?.messageEn) ||
            data?.message ||
            (isAr
              ? "تعذر إنشاء الحساب. تأكد من صحة مفتاح المشرف (ADMIN_API_KEY) والبيانات المدخلة."
              : "Registration failed. Please verify your ADMIN_API_KEY and form fields."),
        );
        setLoading(false);
        return;
      }

      saveAdminSession(data.token, data.user, adminKey.trim());
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
              {isAr ? "تسجيل مشرف جديد" : "ADMIN REGISTRATION & KEY CHECK"}
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
      <div className="mx-auto my-6 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl lg:grid-cols-12">
        {/* Left Security Info Panel */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-[#072549] to-[#0072DC] p-6 sm:p-8 text-white lg:col-span-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF991F]/20 px-3 py-1 text-[11px] font-extrabold text-[#FF991F]">
              <KeyRound className="h-3.5 w-3.5" />
              {isAr
                ? "محمي بمفتاح المشرف السري"
                : "ADMIN KEY VERIFICATION REQUIRED"}
            </span>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
              {isAr
                ? "إنشاء حساب مشرف معتمد في ويريو"
                : "Register Wherio Admin Account"}
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-sky-100/90">
              {isAr
                ? "لضمان عدم وصول أي شخص غير مصرح له إلى لوحة التحكم، يتطلب التسجيل إدخال مفتاح المشرف السري (ADMIN_API_KEY) المطابق للخادم."
                : "To ensure only authorized team members can register, creating an admin account requires verifying the master ADMIN_API_KEY configured on the backend."}
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-sky-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00D2B4]" />
                <span>
                  {isAr
                    ? "تحقق فوري من مفتاح ADMIN_API_KEY"
                    : "Cryptographic ADMIN_API_KEY verification"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00D2B4]" />
                <span>
                  {isAr
                    ? "تحديد الصلاحية الإدارية (مدير عام، محرر محتوى، مشرف)"
                    : "Role-based governance (Super Admin, Editor, Moderator)"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00D2B4]" />
                <span>
                  {isAr
                    ? "تسجيل تلقائي في سجل التدقيق والحوكمة"
                    : "Automatic governance audit trail logging"}
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-4 text-xs">
            <p className="text-sky-100">
              {isAr
                ? "لديك حساب مشرف مسجل بالفعل؟"
                : "Already have a registered admin account?"}
            </p>
            <Link
              href="/login"
              className="mt-1.5 inline-flex items-center gap-1.5 font-extrabold text-[#00D2B4] hover:underline"
            >
              {isAr ? "تسجيل الدخول من هنا ←" : "Sign In to Dashboard →"}
            </Link>
          </div>
        </div>

        {/* Right Sign-Up Form */}
        <div className="p-6 sm:p-10 lg:col-span-7">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-[#072549]">
              {isAr
                ? "بيانات حساب المشرف الجديد"
                : "New Administrator Registration"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {isAr
                ? "أكمل الحقول التالية وأدخل مفتاح المشرف السري للتفعيل الفوري"
                : "Complete your profile and provide the master Admin Key to activate your account"}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Master Admin Key Box */}
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-3.5">
              <label className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                {isAr
                  ? "مفتاح وصول المشرف السري (ADMIN_API_KEY) *"
                  : "Master Admin Access Key (ADMIN_API_KEY) *"}
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-amber-700" />
                <input
                  type={showAdminKey ? "text" : "password"}
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder={
                    isAr
                      ? "أدخل ADMIN_API_KEY للتحقق..."
                      : "Enter backend ADMIN_API_KEY..."
                  }
                  className="w-full rounded-xl border border-amber-300 bg-white py-2.5 pr-10 pl-10 text-xs font-bold text-slate-900 outline-none focus:border-[#0072DC]"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminKey((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-amber-700 hover:text-amber-900"
                >
                  {showAdminKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  {isAr ? "الاسم الكامل *" : "Full Name *"}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      isAr ? "مثال: أحمد المنصوري" : "e.g. Tariq Al-Mansoori"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  {isAr ? "البريد الإلكتروني الرسمي *" : "Work Email *"}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@wherio.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  {isAr ? "الدولة" : "Country"}
                </label>
                <select
                  value={countryCode}
                  onChange={(e) =>
                    handleCountryChange(e.target.value as "AE" | "SA" | "EG")
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0072DC] focus:bg-white"
                >
                  <option value="AE">🇦🇪 UAE (+971)</option>
                  <option value="SA">🇸🇦 KSA (+966)</option>
                  <option value="EG">🇪🇬 Egypt (+20)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  {isAr ? "رقم الهاتف *" : "Phone Number *"}
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971501234567"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  {isAr ? "الدور الإداري *" : "Governance Role *"}
                </label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value as
                        | "SUPER_ADMIN"
                        | "CONTENT_EDITOR"
                        | "MODERATOR",
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0072DC] focus:bg-white"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="CONTENT_EDITOR">CONTENT_EDITOR</option>
                  <option value="MODERATOR">MODERATOR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  {isAr ? "كلمة المرور *" : "Password *"}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isAr ? "6 أحرف على الأقل" : "Min 6 characters"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC] focus:bg-white"
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

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  {isAr ? "تأكيد كلمة المرور *" : "Confirm Password *"}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={
                      isAr ? "أعد كتابة كلمة المرور" : "Repeat password"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-xs font-semibold text-slate-900 outline-none focus:border-[#0072DC] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00B89C] px-5 py-3 text-xs font-extrabold text-white shadow-md transition hover:bg-[#072549] disabled:opacity-60"
            >
              <span>
                {loading
                  ? isAr
                    ? "جاري التحقق من المفتاح وإنشاء الحساب..."
                    : "Verifying Admin Key & Creating Account..."
                  : isAr
                    ? "التحقق من المفتاح وإنشاء حساب المشرف"
                    : "Verify Admin Key & Register Account"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            {isAr ? "لديك حساب بالفعل؟ " : "Already registered? "}
            <Link
              href="/login"
              className="font-extrabold text-[#0072DC] hover:underline"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-slate-400">
        Wherio Governance & Content Quality Portal • Protected by ADMIN_API_KEY
      </p>
    </div>
  );
}
