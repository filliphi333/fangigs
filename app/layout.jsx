import Head from "next/head";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "FanGigs",
  description: "Find and post adult casting gigs professionally",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-paplfGeN03XvEiSyzgrR8LqMDiCJ2xF1fZC0f9Un3lPMmEQPSKqC+WRUqf3rGVlBCLxWRr7NHE3kdP2c9CkCjw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <body className="flex flex-col min-h-screen scroll-smooth">
        <Header />
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
