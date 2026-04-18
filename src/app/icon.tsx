import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRadius: 120,
          background:
            "linear-gradient(135deg, #040816 0%, #0b1430 55%, #071d2b 100%)",
          color: "#ffffff",
          fontSize: 210,
          fontWeight: 900,
          letterSpacing: "-0.08em",
          border: "16px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 52,
            width: 120,
            height: 120,
            borderRadius: 9999,
            background: "rgba(34,211,238,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 52,
            right: 52,
            width: 120,
            height: 120,
            borderRadius: 9999,
            background: "rgba(249,115,22,0.18)",
          }}
        />
        <div
          style={{
            position: "relative",
            textShadow: "0 18px 36px rgba(0,0,0,0.35)",
          }}
        >
          LM
        </div>
      </div>
    ),
    size,
  );
}