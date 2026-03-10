"use client";

import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  section_id: string | null;
};

type CategorySection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type Props = {
  sections?: CategorySection[];
  categories?: Category[];
  action: (formData: FormData) => void;
};

const sectionColors: Record<string, string> = {
  general: "from-orange-400/20 via-orange-300/10 to-transparent",
  islamic: "from-emerald-400/20 via-lime-300/10 to-transparent",
  entertainment: "from-fuchsia-400/20 via-pink-300/10 to-transparent",
  sports: "from-cyan-400/20 via-sky-300/10 to-transparent",
};

export default function StartGameForm({
  sections = [],
  categories = [],
  action,
}: Props) {
  const [gameName, setGameName] = useState("");
  const [teamOne, setTeamOne] = useState("");
  const [teamTwo, setTeamTwo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const safeSections = Array.isArray(sections) ? sections : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const groupedSections = useMemo(() => {
    return safeSections
      .map((section) => ({
        ...section,
        categories: safeCategories.filter(
          (category) => category.section_id === section.id
        ),
      }))
      .filter((section) => section.categories.length > 0);
  }, [safeSections, safeCategories]);

  const uncategorized = useMemo(() => {
    return safeCategories.filter((category) => !category.section_id);
  }, [safeCategories]);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function validateBeforeSubmit(event: React.FormEvent<HTMLFormElement>) {
    const cleanGameName = gameName.trim();
    const cleanTeamOne = teamOne.trim();
    const cleanTeamTwo = teamTwo.trim();

    if (!cleanGameName || !cleanTeamOne || !cleanTeamTwo) {
      event.preventDefault();
      setErrorMessage("اسم اللعبة واسم الفريق الأول واسم الفريق الثاني مطلوبة.");
      return;
    }

    if (selectedCategories.length < 3) {
      event.preventDefault();
      setErrorMessage("اختر 3 فئات على الأقل.");
      return;
    }

    setErrorMessage("");
  }

  return (
    <form action={action} onSubmit={validateBeforeSubmit} className="space-y-8">
      <input type="hidden" name="gameName" value={gameName} />
      <input type="hidden" name="teamOne" value={teamOne} />
      <input type="hidden" name="teamTwo" value={teamTwo} />
      <input
        type="hidden"
        name="selectedCategories"
        value={selectedCategories.join(",")}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <label className="mb-3 block text-lg font-bold">اسم اللعبة</label>
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="مثال: تحدي المعلومات"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none"
          />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <label className="mb-3 block text-lg font-bold">الفريق الأول</label>
          <input
            value={teamOne}
            onChange={(e) => setTeamOne(e.target.value)}
            placeholder="اسم الفريق الأول"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none"
          />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <label className="mb-3 block text-lg font-bold">الفريق الثاني</label>
          <input
            value={teamTwo}
            onChange={(e) => setTeamTwo(e.target.value)}
            placeholder="اسم الفريق الثاني"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none"
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">اختر الفئات</h2>
            <p className="mt-2 text-slate-300">
              الفئات مرتبة تحت أقسام رئيسية لتسهيل الاختيار.
            </p>
          </div>

          <div className="rounded-full bg-cyan-400/15 px-4 py-2 text-sm font-bold text-cyan-300">
            تم اختيار {selectedCategories.length} فئات
          </div>
        </div>

        <div className="space-y-8">
          {groupedSections.length > 0
            ? groupedSections.map((section) => {
                const sectionGradient =
                  sectionColors[section.slug] ??
                  "from-slate-300/20 via-slate-400/10 to-transparent";

                return (
                  <section
                    key={section.id}
                    className="rounded-[2rem] border border-white/10 bg-slate-900/40 p-5"
                  >
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-3xl font-black">{section.name}</div>
                        <div className="mt-2 text-slate-300">
                          {section.description || "قسم رئيسي للفئات"}
                        </div>
                      </div>

                      <div
                        className={`rounded-full border border-white/10 bg-gradient-to-r ${sectionGradient} px-5 py-2 text-sm font-bold text-white`}
                      >
                        {section.slug}
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                      {section.categories.map((category) => {
                        const active = selectedCategories.includes(category.id);

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className={`overflow-hidden rounded-[2rem] border text-right transition ${
                              active
                                ? "border-cyan-400 bg-cyan-400/10"
                                : "border-white/10 bg-slate-950/60 hover:border-white/20"
                            }`}
                          >
                            <div
                              className={`relative h-44 bg-gradient-to-br ${
                                active
                                  ? "from-cyan-400/20 via-sky-400/10 to-transparent"
                                  : "from-white/10 via-white/5 to-transparent"
                              }`}
                            >
                              <div className="absolute left-4 top-4">
                                <div
                                  className={`h-6 w-6 rounded-full border ${
                                    active
                                      ? "border-cyan-400 bg-cyan-400"
                                      : "border-white/20"
                                  }`}
                                />
                              </div>

                              <div className="relative flex h-full items-center justify-center px-6">
                                {category.image_url ? (
                                  <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="h-28 w-28 object-contain"
                                  />
                                ) : (
                                  <div className="text-6xl opacity-80">✨</div>
                                )}
                              </div>
                            </div>

                            <div className="border-t border-white/10 px-5 py-5">
                              <div className="text-2xl font-black">
                                {category.name}
                              </div>
                              <p className="mt-3 min-h-[48px] text-sm leading-7 text-slate-300">
                                {category.description || "بدون وصف"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            : null}

          {uncategorized.length > 0 ? (
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/40 p-5">
              <div className="mb-5">
                <div className="text-3xl font-black">فئات بدون قسم</div>
                <div className="mt-2 text-slate-300">
                  هذه الفئات غير مربوطة بقسم رئيسي.
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {uncategorized.map((category) => {
                  const active = selectedCategories.includes(category.id);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`overflow-hidden rounded-[2rem] border text-right transition ${
                        active
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-white/10 bg-slate-950/60 hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`relative h-44 bg-gradient-to-br ${
                          active
                            ? "from-cyan-400/20 via-sky-400/10 to-transparent"
                            : "from-white/10 via-white/5 to-transparent"
                        }`}
                      >
                        <div className="absolute left-4 top-4">
                          <div
                            className={`h-6 w-6 rounded-full border ${
                              active
                                ? "border-cyan-400 bg-cyan-400"
                                : "border-white/20"
                            }`}
                          />
                        </div>

                        <div className="relative flex h-full items-center justify-center px-6">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="h-28 w-28 object-contain"
                            />
                          ) : (
                            <div className="text-6xl opacity-80">✨</div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-white/10 px-5 py-5">
                        <div className="text-2xl font-black">{category.name}</div>
                        <p className="mt-3 min-h-[48px] text-sm leading-7 text-slate-300">
                          {category.description || "بدون وصف"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {groupedSections.length === 0 && uncategorized.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-slate-300">
              لا توجد أقسام أو فئات جاهزة حاليًا.
            </div>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-center">
        <button
          type="submit"
          className="rounded-[2rem] bg-cyan-400 px-10 py-5 text-2xl font-black text-slate-950"
        >
          ابدأ اللعبة
        </button>
      </div>
    </form>
  );
}