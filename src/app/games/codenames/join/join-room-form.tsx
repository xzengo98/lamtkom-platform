"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  roomCodeValue: string;
};

export default function JoinFormClient({ action, roomCodeValue }: Props) {
  const submitLockedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submitLockedRef.current || isSubmitting) {
      event.preventDefault();
      return;
    }

    submitLockedRef.current = true;
    setIsSubmitting(true);
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="mx-auto mt-6 max-w-2xl space-y-4"
    >
      <div className="rounded-[26px] border border-white/10 bg-white/5 p-4 text-right shadow-inner">
        <label
          htmlFor="guest_name"
          className="mb-2 block text-sm font-black text-white/80"
        >
          اسمك
        </label>
        <input
          id="guest_name"
          name="guest_name"
          type="text"
          required
          placeholder="اكتب اسمك"
          className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-right text-lg font-black text-black outline-none placeholder:text-black/35"
        />
      </div>

      <div className="rounded-[26px] border border-white/10 bg-white/5 p-4 text-right shadow-inner">
        <label
          htmlFor="room_code"
          className="mb-2 block text-sm font-black text-white/80"
        >
          رمز الغرفة
        </label>
        <input
          id="room_code"
          name="room_code"
          type="text"
          required
          defaultValue={roomCodeValue}
          placeholder="مثال: ABC123"
          className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-right text-lg font-black uppercase text-black outline-none placeholder:normal-case placeholder:text-black/35"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "جارٍ الدخول..." : "دخول الغرفة"}
        </button>

        <Link
          href="/games/codenames"
          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center text-lg font-black text-white hover:bg-white/10"
        >
          رجوع
        </Link>
      </div>
    </form>
  );
}