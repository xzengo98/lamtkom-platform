"use client";

import { usePathname } from "next/navigation";

export default function CodenamesTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <div key={pathname} className="codenames-page-transition">
        {children}
      </div>

      <style>{`
        .codenames-page-transition {
          animation: codenamesPageEnter 380ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform, filter;
        }

        @keyframes codenamesPageEnter {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.992);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </>
  );
}