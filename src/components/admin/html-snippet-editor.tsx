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

    const nextValue = current.slice(0, start) + snippet + current.slice(end);
    textarea.value = nextValue;

    const nextCursor = start + snippet.length;
    textarea.focus();
    textarea.setSelectionRange(nextCursor, nextCursor);

    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function askImage() {
    const url = window.prompt("ضع رابط الصورة المباشر");
    if (!url) return;
    insertSnippet(`\n<img src="${url}" alt="image" />\n`);
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
        `\n<div class="video-wrap"><iframe src="${embed}" allowfullscreen></iframe></div>\n`
      );
      return;
    }

    insertSnippet(
      `\n<video controls><source src="${url}" /></video>\n`
    );
  }

  function askLink() {
    const url = window.prompt("ضع الرابط");
    if (!url) return;
    const text = window.prompt("النص الظاهر للرابط", url) || url;
    insertSnippet(`\n<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>\n`);
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-white">{label}</label>

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => insertSnippet("<strong>نص عريض</strong>")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            عريض
          </button>

          <button
            type="button"
            onClick={() => insertSnippet("<em>نص مائل</em>")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            مائل
          </button>

          <button
            type="button"
            onClick={() => insertSnippet("<h2>عنوان</h2>")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            عنوان
          </button>

          <button
            type="button"
            onClick={() => insertSnippet("<ul><li>عنصر 1</li><li>عنصر 2</li></ul>")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            نقاط
          </button>

          <button
            type="button"
            onClick={askImage}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
          >
            إدراج صورة
          </button>

          <button
            type="button"
            onClick={askVideo}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
          >
            إدراج فيديو
          </button>

          <button
            type="button"
            onClick={askLink}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
          >
            إدراج رابط
          </button>

          <button
            type="button"
            onClick={() => insertSnippet("")}
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300"
          >
            إزالة التنسيق
          </button>
        </div>

        <textarea
          ref={textareaRef}
          name={name}
          defaultValue={defaultValue}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none"
        />

        <p className="mt-3 text-xs text-slate-400">
          اكتب النص بشكل عادي، ويمكنك إدراج HTML بسيط مثل صورة أو فيديو أو رابط داخل المحتوى.
        </p>
      </div>
    </div>
  );
}