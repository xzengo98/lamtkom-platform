import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data: sections, error } = await supabase
    .from("bara_sections")
    .select(`
      id,
      name,
      slug,
      description,
      sort_order,
      is_active,
      bara_categories (
        id,
        name,
        slug,
        description,
        sort_order,
        is_active
      )
    `)
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        فشل تحميل الأقسام والفئات: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#071126] p-6 rounded-3xl border border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">إدارة الفئات</h1>
            <p className="mt-3 text-white/70">
              من هنا تعدل الأقسام والفئات الخاصة بلعبة برا السالفة.
            </p>
          </div>

          <Link
            href="/admin/bara-alsalfah/categories/new"
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            إضافة قسم / فئة
          </Link>
        </div>
      </div>

      {sections?.map((section: any) => (
        <div
          key={section.id}
          className="bg-[#071126] p-5 rounded-3xl border border-white/10 space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-cyan-300">{section.name}</h2>
              <p className="mt-2 text-white/70">
                {section.description || "بدون وصف"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
                  الترتيب: {section.sort_order ?? 0}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
                  {section.is_active ? "مفعّل" : "غير مفعّل"}
                </span>
              </div>
            </div>

            <Link
              href={`/admin/bara-alsalfah/categories/edit-section/${section.id}`}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              تعديل القسم
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {section.bara_categories?.map((cat: any) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-white">
                      {cat.name}
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      {cat.description || "بدون وصف"}
                    </p>
                  </div>

                  <Link
                    href={`/admin/bara-alsalfah/categories/edit-category/${cat.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                  >
                    تعديل
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-xs text-white">
                    الترتيب: {cat.sort_order ?? 0}
                  </span>
                  <span className="rounded-full border border-white/10 bg-[#0f1b3d] px-3 py-1 text-xs text-white">
                    {cat.is_active ? "مفعّلة" : "غير مفعّلة"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}