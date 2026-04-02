"use client";

import { useRef } from "react";

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
};

export default function HtmlSnippetEditor({
  name,
  label,
  defaultValue = "",
  placeholder = "",
  rows = 10,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function insertSnippet(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const current = textarea.value;

    const nextValue =
      current.slice(0, start) + snippet + current.slice(end);

    textarea.value = nextValue;

    const nextCursor = start + snippet.length;
    textarea.focus();
    textarea.setSelectionRange(nextCursor, nextCursor);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function askImage() {
    const url = window.prompt("ضع رابط الصورة المباشر");
    if (!url) return;

    insertSnippet(
      `\n\n<img src="${url}" alt="" class="mx-auto my-4 rounded-2xl max-w-full" />\n\n`,
    );
  }

  function askVideo() {
    const url = window.prompt("ضع رابط فيديو مباشر أو رابط يوتيوب");
    if (!url) return;

    let embed = url;

    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtube.com")) {
        const v = parsed.searchParams.get("v");
        if (v) embed = `https://www.youtube.com/embed/${v}`;
      } else if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.replace("/", "");
        if (id) embed = `https://www.youtube.com/embed/${id}`;
      }
    } catch {}

    if (embed.includes("youtube.com/embed/")) {
      insertSnippet(
        `\n\n<iframe src="${embed}" class="w-full max-w-3xl aspect-video rounded-2xl mx-auto my-4" allowfullscreen></iframe>\n\n`,
      );
      return;
    }

    insertSnippet(
      `\n\n<video controls preload="metadata" src="${url}" class="w-full max-w-3xl rounded-2xl mx-auto my-4"></video>\n\n`,
    );
  }

  function askAudio() {
    const url = window.prompt("ضع رابط المقطع الصوتي المباشر");
    if (!url) return;

    insertSnippet(
      `\n\n<audio controls preload="metadata" src="${url}" class="w-full max-w-3xl mx-auto my-4"></audio>\n\n`,
    );
  }

  function askLink() {
    const url = window.prompt("ضع الرابط");
    if (!url) return;

    const text = window.prompt("النص الظاهر للرابط", url) || url;

    insertSnippet(
      `\n<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>\n`,
    );
  }

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
      <label className="mb-3 block text-lg font-black text-white">
        {label}
      </label>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => insertSnippet("<strong>نص عريض</strong>")}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          عريض
        </button>

        <button
          type="button"
          onClick={askImage}
          className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
        >
          إدراج صورة
        </button>

        <button
          type="button"
          onClick={askVideo}
          className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
        >
          إدراج فيديو
        </button>

        <button
          type="button"
          onClick={askAudio}
          className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
        >
          إدراج صوتي
        </button>

        <button
          type="button"
          onClick={askLink}
          className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
        >
          إدراج رابط
        </button>

        <button
          type="button"
          onClick={() => insertSnippet("")}
          className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
        >
          إزالة التنسيق
        </button>
      </div>

      <textarea
        ref={textareaRef}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className="min-h-[220px] w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm leading-8 text-white outline-none placeholder:text-slate-500 transition focus:border-cyan-400"
      />

      <p className="mt-3 text-xs text-slate-400">
        اكتب النص بشكل عادي، ويمكنك إدراج HTML بسيط مثل صورة أو فيديو أو رابط
        أو ملف صوتي داخل المحتوى.
      </p>
    </div>
  );
}