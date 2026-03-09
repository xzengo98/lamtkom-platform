"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Props = {
  categories: Category[];
};

export default function StartGameForm({ categories }: Props) {
  const router = useRouter();

  const [gameName, setGameName] = useState("");
  const [teamOne, setTeamOne] = useState("");
  const [teamTwo, setTeamTwo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug]
    );
  }

  const selectedCount = useMemo(
    () => selectedCategories.length,
    [selectedCategories]
  );

  function handleStartGame() {
    setErrorMessage("");

    const cleanGameName = gameName.trim();
    const cleanTeamOne = teamOne.trim();
    const cleanTeamTwo = teamTwo.trim();

    if (!cleanGameName || !cleanTeamOne || !cleanTeamTwo) {
      setErrorMessage("اسم اللعبة واسم الفريق الأول واسم الفريق الثاني مطلوبة.");
      return;
    }

    if (selectedCategories.length < 3) {
      setErrorMessage("اختر 3 فئات على الأقل.");
      return;
    }

    const params = new URLSearchParams({
      gameName: cleanGameName,
      teamOne: cleanTeamOne,
      teamTwo: cleanTeamTwo,
      categories: selectedCategories.join(","),
    });

    router.push(`/game/board?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
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
              اختر الفئات التي ستظهر داخل لوحة اللعبة.
            </p>
          </div>

          <div className="rounded-full bg-cyan-400/15 px-4 py-2 text-sm font-bold text-cyan-300">
            تم اختيار {selectedCount} فئات
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const active = selectedCategories.includes(category.slug);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.slug)}
                className={`rounded-[2rem] border p-5 text-right transition ${
                  active
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-white/10 bg-slate-900/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black">{category.name}</div>
                    <div className="mt-2 text-sm text-cyan-300">
                      {category.slug}
                    </div>
                  </div>

                  <div
                    className={`mt-1 h-5 w-5 rounded-full border ${
                      active
                        ? "border-cyan-400 bg-cyan-400"
                        : "border-white/20"
                    }`}
                  />
                </div>

                <p className="mt-4 min-h-[48px] text-sm leading-7 text-slate-300">
                  {category.description || "بدون وصف"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleStartGame}
          className="rounded-[2rem] bg-cyan-400 px-10 py-5 text-2xl font-black text-slate-950"
        >
          ابدأ اللعبة
        </button>
      </div>
    </div>
  );
}