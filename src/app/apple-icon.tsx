import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 48,
          background:
            "linear-gradient(135deg, #040816 0%, #0b1430 55%, #071d2b 100%)",
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: "-0.08em",
          border: "6px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            width: 34,
            height: 34,
            borderRadius: 9999,
            background: "rgba(34,211,238,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 18,
            right: 18,
            width: 34,
            height: 34,
            borderRadius: 9999,
            background: "rgba(249,115,22,0.18)",
          }}
        />
        <div style={{ position: "relative" }}>LM</div>
      </div>
    ),
    size,
  );
}