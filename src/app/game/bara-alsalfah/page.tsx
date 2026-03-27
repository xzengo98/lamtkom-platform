"use client";

import { useState } from "react";

type Player = {
  id: number;
  name: string;
  score: number;
};

export default function BaraAlsalfahGame() {
  const [step, setStep] = useState(1);

  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [outsider, setOutsider] = useState<number | null>(null);

  // ======================
  // إضافة لاعب
  // ======================
  const addPlayer = () => {
    if (!newPlayer) return;

    setPlayers([
      ...players,
      {
        id: Date.now(),
        name: newPlayer,
        score: 0,
      },
    ]);

    setNewPlayer("");
  };

  // ======================
  // بدء اللعبة
  // ======================
  const startGame = () => {
    const random = Math.floor(Math.random() * players.length);
    setOutsider(players[random].id);
    setStep(5);
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-black">برا السالفة</h1>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-green-500 py-4 rounded-xl text-xl font-bold"
            >
              ابدأ اللعبة
            </button>
          </div>
        )}

        {/* STEP 2 - الفئات */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">اختر الفئة</h2>

            {["مشاهير", "أكل", "رياضة"].map(cat => (
              <div
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-4 rounded-xl cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-black"
                    : "bg-white/5"
                }`}
              >
                {cat}
              </div>
            ))}

            <button
              onClick={() => setStep(3)}
              className="w-full bg-green-500 py-3 rounded-xl"
            >
              التالي
            </button>
          </div>
        )}

        {/* STEP 4 - اللاعبين */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">إضافة اللاعبين</h2>

            <div className="flex gap-2">
              <input
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                className="flex-1 bg-white/10 p-3 rounded-xl"
                placeholder="اسم اللاعب"
              />

              <button
                onClick={addPlayer}
                className="bg-cyan-500 px-4 rounded-xl"
              >
                +
              </button>
            </div>

            {players.map(p => (
              <div key={p.id} className="bg-white/5 p-3 rounded-xl">
                {p.name}
              </div>
            ))}

            <button
              onClick={startGame}
              className="w-full bg-green-500 py-3 rounded-xl"
            >
              بدء اللعبة
            </button>
          </div>
        )}

        {/* STEP 5 - توزيع */}
        {step === 5 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">
              أعطوا الجوال للاعب
            </h2>

            <button
              onClick={() => setStep(6)}
              className="bg-green-500 px-6 py-3 rounded-xl"
            >
              التالي
            </button>
          </div>
        )}

        {/* STEP 6 - كشف الدور */}
        {step === 6 && (
          <div className="text-center space-y-6">
            <h2 className="text-xl font-bold">
              هل أنت داخل السالفة؟
            </h2>

            <button className="bg-cyan-500 px-6 py-3 rounded-xl">
              عرض
            </button>

            <button
              onClick={() => setStep(7)}
              className="bg-green-500 px-6 py-3 rounded-xl"
            >
              التالي
            </button>
          </div>
        )}

        {/* STEP 7 - التصويت */}
        {step === 7 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold">صوّت</h2>

            {players.map(p => (
              <div key={p.id} className="bg-white/5 p-3 rounded-xl">
                {p.name}
              </div>
            ))}

            <button
              onClick={() => setStep(8)}
              className="w-full bg-green-500 py-3 rounded-xl"
            >
              النتائج
            </button>
          </div>
        )}

        {/* STEP 8 - النتائج */}
        {step === 8 && (
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold">النتائج</h2>

            {players.map(p => (
              <div key={p.id}>
                {p.name} - {p.score}
              </div>
            ))}

            <button
              onClick={() => setStep(1)}
              className="bg-green-500 px-6 py-3 rounded-xl"
            >
              إعادة
            </button>
          </div>
        )}

      </div>
    </div>
  );
}