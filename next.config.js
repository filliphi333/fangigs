/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "unsplash.com",
      "cdn.example.com",
      "images.avn.com",
      "images.unsplash.com",
      "xeqkvaqpgqyjlybexxmm.supabase.co" // ← Add this line
    ]
  },
};

module.exports = nextConfig;
