import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // ✅ adjust path if needed
import Image from "next/image";

export default function NewsSection() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      // Fetch internal articles
      const { data: internalArticles, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("priority", { ascending: false });

      if (error) {
        console.error("Error fetching internal articles:", error);
      }

      // Fetch external articles from API
      let externalArticles = [];
      try {
        const res = await fetch("/api/rss");
        externalArticles = await res.json();

        // Ensure it's an array
        if (!Array.isArray(externalArticles)) {
          externalArticles = [];
        }
      } catch (err) {
        console.error("Error fetching RSS feed:", err);
      }

      // Combine both
      const combined = [
        ...(internalArticles || []).map((item) => ({
          title: item.title,
          summary: item.summary,
          url: item.url,
          image_url: item.image_url,
          isExternal: false,
        })),
        ...externalArticles.map((item) => ({
          title: item.title,
          summary: item.summary,
          url: item.link,
          image_url: item.image_url || "", // might be missing
          isExternal: true,
        })),
      ];

      setArticles(combined);
    };

    fetchArticles();
  }, []);

  const maxSummaryLength = 150; // Adjust this value to control teaser length

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Industry News</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            {article.image_url && (
              <Image
                src={article.image_url || '/path/to/placeholder-image.jpg'}
                alt={article.title}
                width={600}
                height={300}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-gray-800"
                >
                  {article.title}
                </a>
              </h3>
              <p className="text-sm text-gray-600">
                {article.summary.length > maxSummaryLength
                  ? article.summary.substring(0, maxSummaryLength) + "..."
                  : article.summary}
              </p>
              {article.summary.length > maxSummaryLength && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Read More
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
