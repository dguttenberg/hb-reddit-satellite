import "./globals.css";
export const metadata = { title: "Hamilton Beach — Reddit Content", description: "Reddit Content Satellite for Hamilton Beach Brand Nucleus" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
