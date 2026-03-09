import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

async function registerAction(formData: FormData) {
  "use server";

  const fullName = String(formData.get("full_name") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!fullName || !username || !phone || !email || !password) {
    redirect("/register?error=يرجى تعبئة جميع الحقول");
  }

  if (password.length < 6) {
    redirect("/register?error=كلمة المرور يجب أن تكون 6 أحرف على الأقل");
  }

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    redirect(
      "/register?error=اسم المستخدم يجب أن يكون 3 أحرف على الأقل ويحتوي فقط على حروف إنجليزية صغيرة أو أرقام أو _"
    );
  }

  if (!/^\+?[0-9]{8,15}$/.test(phone)) {
    redirect("/register?error=رقم الهاتف غير صالح");
  }

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username,
        phone,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("user already registered")) {
      redirect("/register?error=هذا البريد الإلكتروني مستخدم بالفعل");
    }

    if (
      msg.includes("duplicate") ||
      msg.includes("unique") ||
      msg.includes("database error saving new user")
    ) {
      redirect(
        "/register?error=تأكد أن البريد الإلكتروني واسم المستخدم ورقم الهاتف غير مستخدمة مسبقًا"
      );
    }

    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user) {
    redirect("/register?error=تعذر إنشاء الحساب");
  }

  const loginResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginResult.error) {
    redirect(
      "/login?error=تم إنشاء الحساب لكن تعذر تسجيل الدخول مباشرة. تأكد من تعطيل Confirm Email في Supabase"
    );
  }

  redirect("/");
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h1 className="text-4xl font-black">إنشاء حساب جديد</h1>
          <p className="mt-3 text-slate-300">
            أنشئ حسابك وابدأ مباشرة
          </p>

          {params.error ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
              {params.error}
            </div>
          ) : null}

          <form action={registerAction} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                الاسم الكامل
              </label>
              <input
                name="full_name"
                placeholder="اسمك الكامل"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                اسم المستخدم
              </label>
              <input
                name="username"
                placeholder="username"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                رقم الهاتف
              </label>
              <input
                name="phone"
                placeholder="05xxxxxxxx أو +971..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                البريد الإلكتروني
              </label>
              <input
                name="email"
                type="email"
                placeholder="name@email.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                كلمة المرور
              </label>
              <input
                name="password"
                type="password"
                placeholder="******"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950"
            >
              إنشاء الحساب
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-300">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-bold text-cyan-300">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}