"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPhone || !cleanEmail || !cleanPassword) {
      setErrorMessage("يرجى تعبئة جميع الحقول.");
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          username: cleanUsername,
          phone: cleanPhone,
        },
      },
    });

    if (error) {
      setLoading(false);
      setErrorMessage(
        "تعذر إنشاء الحساب. تأكد أن البريد الإلكتروني واسم المستخدم ورقم الهاتف غير مستخدمة مسبقًا."
      );
      return;
    }

    if (!data.user) {
      setLoading(false);
      setErrorMessage("تمت العملية بشكل غير مكتمل. حاول مرة أخرى.");
      return;
    }

    const loginResult = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (loginResult.error) {
      setErrorMessage("تم إنشاء الحساب لكن تعذر تسجيل الدخول مباشرة.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10">
        <section className="order-2 rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.10),transparent_22%),linear-gradient(135deg,#020617_0%,#09122b_46%,#020617_100%)] p-6 sm:p-8 lg:order-1">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200 sm:text-sm">
            إنشاء حساب جديد
          </span>

          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
            ابدأ استخدام SeenJeem
            <span className="block text-cyan-300">بخطوات بسيطة وواضحة</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            أنشئ حسابك وابدأ مباشرة بتنظيم الألعاب والجولات، مع تجربة مريحة
            ومناسبة للهاتف وجميع مقاسات الشاشة.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "تسجيل سريع وواضح",
              "واجهة مرتبة وسهلة",
              "إدارة الفئات والأسئلة",
              "بدء اللعبة خلال لحظات",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                  <CheckIcon />
                </span>
                <span className="text-sm font-bold text-white">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold text-cyan-300">معلومة سريعة</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              بعد التسجيل يمكنك الدخول مباشرة والبدء بإنشاء أول لعبة من حسابك،
              ثم متابعة الجولات غير المكتملة لاحقًا من صفحة الحساب.
            </p>
          </div>
        </section>

        <section className="order-1 flex items-center lg:order-2">
          <div className="w-full rounded-[2.25rem] border border-white/10 bg-white/5 p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                إنشاء الحساب
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                أدخل بياناتك الأساسية للبدء.
              </p>
            </div>

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  اسم المستخدم
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:px-5 md:py-4 md:text-base"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  رقم الهاتف
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx أو +971..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:px-5 md:py-4 md:text-base"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  البريد الإلكتروني
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@email.com"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:px-5 md:py-4 md:text-base"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  كلمة المرور
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="******"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:px-5 md:py-4 md:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-base font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                {!loading ? <ArrowLeftIcon /> : null}
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4 text-sm text-slate-300">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="font-black text-cyan-300 hover:text-cyan-200">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}