import "./globals.css";

export const metadata = {
  title: "FanGigs",
  description: "Find and post adult casting gigs professionally",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}

