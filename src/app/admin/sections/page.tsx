import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import AdminEmptyState from "@/components/admin/admin-empty-state";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    redirect("/");
  }

  return supabase;
}

async function deleteSectionAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect(
      "/admin/sections?error=" + encodeURIComponent("معرّف القسم مفقود.")
    );
  }

  const supabase = await requireAdmin();

  const { error: unlinkError } = await supabase
    .from("categories")
    .update({ section_id: null })
    .eq("section_id", id);

  if (unlinkError) {
    redirect(
      "/admin/sections?error=" +
        encodeURIComponent(`فشل فك ربط الفئات من القسم: ${unlinkError.message}`)
    );
  }

  const { error: deleteError } = await supabase
    .from("category_sections")
    .delete()
    .eq("id", id);

  if (deleteError) {
    redirect(
      "/admin/sections?error=" +
        encodeURIComponent(`فشل حذف القسم: ${deleteError.message}`)
    );
  }

  revalidatePath("/admin/sections");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/games");
  revalidatePath("/game/start");

  redirect(
    "/admin/sections?success=" + encodeURIComponent("تم حذف القسم بنجاح.")
  );
}

export default async function AdminSectionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("category_sections")
    .select("id, name, slug, description, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <main dir="rtl" className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          فشل تحميل الأقسام: {error.message}
        </div>
      </main>
    );
  }

  const sections = (data ?? []) as SectionRow[];

  const sectionColors = [
    { bar: "bg-cyan-400",    badge: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300" },
    { bar: "bg-orange-400",  badge: "border-orange-400/20 bg-orange-400/8 text-orange-300" },
    { bar: "bg-violet-400",  badge: "border-violet-400/20 bg-violet-400/8 text-violet-300" },
    { bar: "bg-emerald-400", badge: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300" },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
        <AdminPageHeader
          title="إدارة الأقسام"
          description="إضافة وتعديل وحذف أقسام الفئات الرئيسية."
          action={
            <Link
              href="/admin/sections/new"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_3px_14px_rgba(34,211,238,0.20)] transition hover:bg-cyan-400 active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              إضافة قسم جديد
            </Link>
          }
        />

        {params.success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-4 py-3.5 text-sm font-bold text-emerald-300">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
            {params.success}
          </div>
        )}

        {params.error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-400/25 bg-red-400/8 px-4 py-3.5 text-sm font-bold text-red-300">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>
            {params.error}
          </div>
        )}

        {sections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section, idx) => {
              const color = sectionColors[idx % sectionColors.length];
              return (
                <div
                  key={section.id}
                  className="group overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(160deg,rgba(14,22,48,0.94)_0%,rgba(6,12,28,0.98)_100%)] transition duration-200 hover:border-white/12 hover:-translate-y-0.5"
                >
                  <div className={`h-[2px] w-full ${color.bar} opacity-60`} />
                  <div className="p-5 space-y-3">
                    {/* Name + slug */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl font-black text-white">{section.name}</h3>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black ${color.badge}`}>
                          {section.is_active ? "مفعّل" : "معطّل"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-white/35">{section.slug}</p>
                    </div>

                    {/* Description */}
                    <p className="min-h-[44px] text-sm leading-7 text-white/55">
                      {section.description || "بدون وصف"}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] font-bold text-white/40">
                        ترتيب: {section.sort_order ?? 0}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/admin/sections/edit/${section.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-black text-cyan-200 transition hover:bg-cyan-400/18 active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>
                        تعديل
                      </Link>

                      <form action={deleteSectionAction}>
                        <input type="hidden" name="id" value={section.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-2.5 text-xs font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98]"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>
                          حذف
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <AdminEmptyState
              title="لا توجد أقسام بعد"
              description="ابدأ بإضافة أول قسم لعرضه هنا."
              buttonText="إضافة قسم جديد"
            />
            <div className="text-center">
              <Link
                href="/admin/sections/new"
                className="inline-flex rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98]"
              >
                إضافة قسم جديد
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}