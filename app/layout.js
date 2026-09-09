import "./globals.css";

export const metadata = {
  title: "Streamo AI",
  description: "Musik yang dibuat dengan AI Pro.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
