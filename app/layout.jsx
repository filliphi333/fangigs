import Head from "next/head";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: "FanGigs",
  description: "FanGigs is a professional adult casting platform connecting content creators, models, studios, and more. Find or post gigs, collaborate, and grow your career with confidence.",
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
 
      <body className="flex flex-col min-h-screen scroll-smooth">
        <Header />
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
