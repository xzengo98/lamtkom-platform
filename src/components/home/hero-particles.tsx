"use client";

const PARTICLES = [
  { left: "6%", size: 6, delay: "0s", duration: "8s" },
  { left: "12%", size: 10, delay: "1.2s", duration: "10s" },
  { left: "19%", size: 5, delay: "0.8s", duration: "7.5s" },
  { left: "27%", size: 8, delay: "2.1s", duration: "9s" },
  { left: "35%", size: 12, delay: "1.6s", duration: "11s" },
  { left: "44%", size: 6, delay: "0.4s", duration: "8.5s" },
  { left: "52%", size: 9, delay: "2.8s", duration: "10.5s" },
  { left: "61%", size: 7, delay: "1.1s", duration: "7.8s" },
  { left: "69%", size: 11, delay: "3s", duration: "12s" },
  { left: "78%", size: 6, delay: "0.6s", duration: "8.8s" },
  { left: "86%", size: 8, delay: "2.4s", duration: "9.8s" },
  { left: "93%", size: 5, delay: "1.7s", duration: "7.2s" },
] as const;

type HeroParticlesProps = {
  className?: string;
};

export default function HeroParticles({ className = "" }: HeroParticlesProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.08),transparent_24%)]" />

        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="lamtkom-hero-particle absolute bottom-[-24px] rounded-full"
            style={{
              left: particle.left,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <style>{`
        .lamtkom-hero-particle {
          background: radial-gradient(circle, rgba(34, 211, 238, 0.95) 0%, rgba(34, 211, 238, 0.22) 55%, transparent 100%);
          box-shadow: 0 0 14px rgba(34, 211, 238, 0.22), 0 0 26px rgba(59, 130, 246, 0.12);
          opacity: 0;
          animation-name: lamtkomFloatParticle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        @keyframes lamtkomFloatParticle {
          0% {
            transform: translate3d(0, 0, 0) scale(0.72);
            opacity: 0;
          }
          12% {
            opacity: 0.38;
          }
          50% {
            transform: translate3d(14px, -180px, 0) scale(1);
            opacity: 0.75;
          }
          100% {
            transform: translate3d(-10px, -360px, 0) scale(0.7);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lamtkom-hero-particle {
            animation: none;
            opacity: 0.22;
          }
        }
      `}</style>
    </>
  );
}
