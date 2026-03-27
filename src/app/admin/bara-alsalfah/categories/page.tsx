import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const supabase = await getSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data: sections } = await supabase
    .from("bara_sections")
    .select(`
      id,
      name,
      bara_categories (
        id,
        name
      )
    `)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div className="bg-[#071126] p-6 rounded-3xl border border-white/10">
        <h1 className="text-3xl font-black text-white">
          إدارة الفئات
        </h1>

        <Link
          href="/admin/bara-alsalfah/categories/new"
          className="mt-4 inline-block bg-cyan-500 px-5 py-3 rounded-xl text-black font-bold"
        >
          إضافة قسم / فئة
        </Link>
      </div>

      {sections?.map(section => (
        <div
          key={section.id}
          className="bg-[#071126] p-5 rounded-3xl border border-white/10"
        >
          <h2 className="text-xl font-bold text-cyan-300">
            {section.name}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {section.bara_categories?.map(cat => (
              <div
                key={cat.id}
                className="bg-white/5 p-3 rounded-xl text-white"
              >
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}