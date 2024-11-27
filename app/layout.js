import "./globals.css";

export const metadata = {
  title: "Masterlist Setup",
  description: "Masterlist setup and management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
