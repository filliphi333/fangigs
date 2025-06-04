import "./globals.css";

export const metadata = {
  title: "FanGigs",
  description: "Find and post adult casting gigs professionally",
  viewport: "width=device-width, initial-scale=1", // ✅ this line adds mobile scaling
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
