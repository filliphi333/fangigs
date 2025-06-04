import "./globals.css";

export const metadata = {
  title: "FanGigs",
  description: "Find and post adult casting gigs professionally",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
