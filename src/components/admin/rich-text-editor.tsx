"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: number;
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}

export default function RichTextEditor({
  name,
  label,
  defaultValue = "",
  placeholder = "",
  minHeight = 220,
}: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState(defaultValue);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== defaultValue) {
      editorRef.current.innerHTML = defaultValue || "";
      setHtml(defaultValue || "");
    }
  }, [defaultValue]);

  function syncContent() {
    const nextHtml = editorRef.current?.innerHTML ?? "";
    setHtml(nextHtml);
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  }

  function insertImage() {
    const url = window.prompt("ضع رابط الصورة المباشر");
    if (!url) return;

    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${url}" alt="image" style="max-width:100%;height:auto;border-radius:16px;margin:12px auto;display:block;" />`
    );
    syncContent();
  }

  function insertVideo() {
    const url = window.prompt("ضع رابط الفيديو المباشر أو يوتيوب");
    if (!url) return;

    const youtube = getYouTubeEmbedUrl(url);

    editorRef.current?.focus();

    if (youtube) {
      document.execCommand(
        "insertHTML",
        false,
        `
          <div style="margin:16px 0;">
            <div style="position:relative;width:100%;padding-top:56.25%;overflow:hidden;border-radius:16px;">
              <iframe
                src="${youtube}"
                style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:16px;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        `
      );
    } else {
      document.execCommand(
        "insertHTML",
        false,
        `
          <video controls style="width:100%;max-width:100%;border-radius:16px;margin:12px 0;">
            <source src="${url}" />
          </video>
        `
      );
    }

    syncContent();
  }

  function insertLink() {
    const url = window.prompt("ضع الرابط");
    if (!url) return;

    const text = window.prompt("النص الظاهر للرابط", url) || url;

    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#22d3ee;text-decoration:underline;">${text}</a>`
    );
    syncContent();
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-white">{label}</label>

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runCommand("bold")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            عريض
          </button>

          <button
            type="button"
            onClick={() => runCommand("italic")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            مائل
          </button>

          <button
            type="button"
            onClick={() => runCommand("insertUnorderedList")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            نقاط
          </button>

          <button
            type="button"
            onClick={() => runCommand("formatBlock", "<h2>")}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white"
          >
            عنوان
          </button>

          <button
            type="button"
            onClick={insertImage}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
          >
            إدراج صورة
          </button>

          <button
            type="button"
            onClick={insertVideo}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
          >
            إدراج فيديو
          </button>

          <button
            type="button"
            onClick={insertLink}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-300"
          >
            إدراج رابط
          </button>

          <button
            type="button"
            onClick={() => runCommand("removeFormat")}
            className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300"
          >
            إزالة التنسيق
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          data-placeholder={placeholder}
          className="rich-editor min-h-[220px] rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: defaultValue || "" }}
        />

        <textarea name={name} value={html} readOnly hidden />

        <p className="mt-3 text-xs text-slate-400">
          يمكنك كتابة نص عادي، أو إدراج صورة وفيديو وروابط مباشرة داخل المحتوى.
        </p>
      </div>

      <style jsx>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        .rich-editor :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          display: block;
          margin: 12px auto;
        }

        .rich-editor :global(video) {
          width: 100%;
          border-radius: 16px;
          margin: 12px 0;
        }

        .rich-editor :global(iframe) {
          width: 100%;
          min-height: 280px;
          border: 0;
          border-radius: 16px;
        }

        .rich-editor :global(ul) {
          padding-right: 22px;
          list-style: disc;
        }

        .rich-editor :global(h2) {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 10px 0;
        }

        .rich-editor :global(a) {
          color: #22d3ee;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}