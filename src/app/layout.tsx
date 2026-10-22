import type { Metadata } from "next";
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import "./aw0.css";

const sourceSerif = Source_Serif_4({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-code",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Agentic World Action Models",
  description:
    "AW-0 is an agentic world action model that jointly denoises skill programs, future video, and robot actions in one mixture-of-transformers, with an agentic pipeline that labels robot and human demonstrations with programs and distills reusable skills.",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/seo/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <body className={`${sourceSerif.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
