"use client";

import { useMemo, useState } from "react";

type Props = {
  roomCode: string;
};

export default function CodenamesInviteLink({ roomCode }: Props) {
  const [copied, setCopied] = useState<"none" | "link" | "code">("none");

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/games/codenames/join?room_code=${encodeURIComponent(
      roomCode
    )}`;
  }, [roomCode]);

  async function copyText(value: string, type: "link" | "code") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied("none"), 1800);
    } catch {
      setCopied("none");
    }
  }

  async function shareInvite() {
    if (!inviteLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Codenames Invite",
          text: `انضم إلى غرفة Codenames الخاصة بي. الكود: ${roomCode}`,
          url: inviteLink,
        });
        return;
      } catch {
        // fallback to copy below
      }
    }

    await copyText(inviteLink, "link");
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
      <div className="text-sm font-black uppercase tracking-[0.16em] text-white/60">
        Invite
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/85">
          <div className="text-[11px] uppercase tracking-wide text-white/45">
            Direct Invite Link
          </div>
          <div className="mt-1 break-all">{inviteLink || "..."}</div>
        </div>

        <button
          type="button"
          onClick={() => copyText(inviteLink, "link")}
          className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-400"
        >
          {copied === "link" ? "تم نسخ الرابط" : "نسخ الرابط"}
        </button>

        <button
          type="button"
          onClick={() => copyText(roomCode, "code")}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white hover:bg-white/10"
        >
          {copied === "code" ? "تم نسخ الكود" : "نسخ الكود"}
        </button>

        <button
          type="button"
          onClick={shareInvite}
          className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-500/20"
        >
          مشاركة
        </button>
      </div>
    </div>
  );
}