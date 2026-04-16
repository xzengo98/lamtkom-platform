import { redirect } from "next/navigation";
import BaraAlsalfahClient from "./bara-alsalfah-client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BaraSection = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type BaraCategory = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  section_id: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type BaraItem = {
  id: string;
  category_id: string;
  correct_answer: string;
  wrong_option_1: string | null;
  wrong_option_2: string | null;
  wrong_option_3: string | null;
  wrong_option_4: string | null;
  is_active: boolean;
};

function ErrorState({ message }: { message: string }) {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
        <section className="w-full rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-red-400/25 bg-red-500/15 text-3xl">
            !
          </div>
          <h1 className="mt-6 text-3xl font-black text-white">تعذر تحميل اللعبة</h1>
          <p className="mt-4 text-base leading-8 text-red-100/90">{message}</p>
        </section>
      </div>
    </main>
  );
}

export default async function BaraAlsalfahPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: sectionsData, error: sectionsError },
    { data: categoriesData, error: categoriesError },
    { data: itemsData, error: itemsError },
  ] = await Promise.all([
    supabase
      .from("bara_sections")
      .select("id, name, slug, description, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("bara_categories")
      .select(
        "id, name, slug, description, image_url, section_id, sort_order, is_active",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("bara_items")
      .select(
        "id, category_id, correct_answer, wrong_option_1, wrong_option_2, wrong_option_3, wrong_option_4, is_active",
      )
      .eq("is_active", true),
  ]);

  if (sectionsError || categoriesError || itemsError) {
    return (
      <ErrorState
        message={
          sectionsError?.message ||
          categoriesError?.message ||
          itemsError?.message ||
          "فشل تحميل بيانات اللعبة."
        }
      />
    );
  }

  const sections = (sectionsData ?? []) as BaraSection[];
  const categories = (categoriesData ?? []) as BaraCategory[];
  const items = (itemsData ?? []) as BaraItem[];

  const activeSectionIds = new Set(sections.map((section) => section.id));
  const filteredCategories = categories.filter(
    (category) =>
      typeof category.section_id === "string" &&
      activeSectionIds.has(category.section_id),
  );
  const filteredCategoryIds = new Set(filteredCategories.map((category) => category.id));
  const filteredItems = items.filter((item) => filteredCategoryIds.has(item.category_id));

  return (
    <BaraAlsalfahClient
      initialSections={sections}
      initialCategories={filteredCategories}
      initialItems={filteredItems}
    />
  );
}
