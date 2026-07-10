import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

// Replaces the default Next.js favicon with the brand mark — Hostinger
// violet rounded square + white chat-square glyph — matching the
// sidebar logo in `src/components/layout/sidebar.tsx`. Next.js renders
// this at build time and auto-injects <link rel="icon"> into <head>.
//
// This route takes precedence over src/app/favicon.ico, which is the
// Next.js default and can stay on disk harmlessly (or be removed).

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const logoPath = path.join(process.cwd(), "src/assets/companyLogo.png");
  const logoBuffer = await readFile(logoPath);
  const logoBase64 = logoBuffer.toString("base64");
  const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={logoDataUrl}
          style={{
            width: "100%",
            height: "100%",
          }}
          alt="NeedMet logo"
        />
      </div>
    ),
    { ...size },
  );
}
