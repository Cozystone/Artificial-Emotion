import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inner Weather",
  description: "Local LLM response-pattern visualization",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='black'/%3E%3Ccircle cx='16' cy='16' r='9' fill='%23dff7ff' fill-opacity='.9'/%3E%3Ccircle cx='18' cy='14' r='5' fill='%236ce7ff' fill-opacity='.45'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
