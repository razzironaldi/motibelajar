import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotiBelajar — Ruang tumbuh siswa",
  description: "Ruang belajar yang tumbuh bersama rasa ingin tahu, arah, dan dukungan yang aman.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
