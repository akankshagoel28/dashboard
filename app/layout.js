import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Masterlist Setup",
  description: "Masterlist setup and management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
