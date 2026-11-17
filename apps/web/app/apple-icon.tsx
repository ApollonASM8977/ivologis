import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0B5FFF", borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 L20 9.5 V20 H4 V9.5 Z" />
          <path d="M9.5 20 V14.5 H14.5 V20" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
