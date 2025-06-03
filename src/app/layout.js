import "./globals.css";

export const metadata = {
  title: "FanGigs",
  description: "Find and post adult casting gigs professionally",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <title>FanGigs</title>
        <meta name="description" content="Find and post adult casting gigs professionally" />
      </head>
      <body>{children}</body>
    </html>
  );
}
