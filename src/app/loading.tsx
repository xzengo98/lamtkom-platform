import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020817]">
      <div className="relative flex flex-col items-center gap-4">
        <div className="absolute h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />

        <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-cyan-400/15 bg-white/[0.03] shadow-[0_0_40px_rgba(34,211,238,0.10)]">
          <Image
            src="/logo.png"
            alt="لمتكم"
            width={96}
            height={96}
            priority
            className="h-auto w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.2s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-400 [animation-delay:-0.1s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300" />
        </div>
      </div>
    </div>
  );
}
