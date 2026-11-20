import type { Metadata } from "next";
import { Antonio, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-antonio",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MotiBelajar — Ruang tumbuh siswa",
  description:
    "Ruang belajar yang tumbuh bersama rasa ingin tahu, arah, dan pendampingan BK yang aman.",
  openGraph: {
    title: "MotiBelajar — Ruang tumbuh siswa",
    description:
      "Ruang belajar yang tumbuh bersama rasa ingin tahu, arah, dan pendampingan BK yang aman.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${manrope.variable} ${antonio.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf5f1] text-[#0e0f0a] selection:bg-[#e1f079] selection:text-[#0e0f0a]">
        {children}
      </body>
    </html>
  );
}
