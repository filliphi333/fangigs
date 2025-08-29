import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // ✅ adjust path if needed
import Image from "next/image";
import Link from "next/link";

export default function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch internal articles
        const { data: internalArticles, error: supabaseError } = await supabase
          .from("news_articles")
          .select("*")
          .order("priority", { ascending: false });

        if (supabaseError) {
          console.error("Error fetching internal articles:", supabaseError);
        }

        // Fetch external articles from API with timeout and retry
        let externalArticles = [];
        try {
          console.log("🔄 Fetching external articles from RSS API...");
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          const res = await fetch("/api/rss", {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Accept': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`RSS API returned ${res.status}: ${res.statusText}`);
          }

          const data = await res.json();
          
          if (data.error) {
            console.error("RSS API returned error:", data.error);
            throw new Error(data.error);
          }
          
          externalArticles = Array.isArray(data) ? data : [];
          
          console.log(`✅ Successfully fetched ${externalArticles.length} external articles`);
          
          // Debug: Log first article to check image URLs
          if (externalArticles.length > 0) {
            console.log("Sample article:", {
              title: externalArticles[0].title,
              source: externalArticles[0].source,
              image_url: externalArticles[0].image_url,
              has_image: !!externalArticles[0].image_url
            });
          }
          
        } catch (err) {
          console.error("❌ Error fetching RSS feed:", {
            message: err.message,
            name: err.name
          });
          // Don't throw here - we still want to show internal articles
        }

        // Combine both sources
        const combined = [
          ...(internalArticles || []).map((item) => ({
            id: `internal-${item.id}`,
            title: item.title,
            summary: item.summary,
            url: `/news/${slugify(item.title)}`,
            image_url: item.image_url,
            isExternal: false,
            source: 'FanGigs',
            priority: item.priority || 1
          })),
          ...externalArticles.map((item, idx) => ({
            id: `external-${idx}`,
            title: item.title,
            summary: item.summary,
            url: item.link,
            image_url: item.image_url || "", 
            isExternal: true,
            source: item.source || 'External',
            priority: 0
          })),
        ];

        // Sort by priority (internal articles first if same priority)
        combined.sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return a.isExternal - b.isExternal; // internal articles first
        });

        setArticles(combined);
        
      } catch (err) {
        console.error("Fatal error fetching articles:", err);
        setError("Failed to load news articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const maxSummaryLength = 150; // Adjust this value to control teaser length

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Industry News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-40 bg-gray-300 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Industry News</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Latest Articles</h3>
          <p className="text-gray-600">
            {articles.length > 0 ? `${articles.length} articles available` : 'No articles available'}
          </p>
        </div>
        {articles.length > 0 && (
          <Link 
            href="/news" 
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
          >
            View All <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 6).map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
          >
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
              {article.image_url ? (
                <Image
                  src={article.image_url}
                  alt={article.title}
                  width={600}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fas fa-newspaper text-6xl text-gray-300"></i>
                </div>
              )}
              <div className="absolute top-3 right-3">
                {article.isExternal ? (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    <i className="fas fa-external-link-alt mr-1"></i>
                    External
                  </span>
                ) : (
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    <i className="fas fa-home mr-1"></i>
                    FanGigs
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">
                  {article.source}
                </span>
                {!article.isExternal && article.priority > 1 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    <i className="fas fa-star mr-1"></i>
                    Featured
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                <a
                  href={article.url}
                  target={article.isExternal ? "_blank" : "_self"}
                  rel={article.isExternal ? "noopener noreferrer" : undefined}
                  className="hover:underline"
                >
                  {article.title}
                </a>
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {article.summary && article.summary.length > maxSummaryLength
                  ? article.summary.substring(0, maxSummaryLength) + "..."
                  : article.summary || "Click to read the full article and stay updated with industry news."}
              </p>
              
              <div className="flex items-center justify-between">
                <a
                  href={article.url}
                  target={article.isExternal ? "_blank" : "_self"}
                  rel={article.isExternal ? "noopener noreferrer" : undefined}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center group-hover:translate-x-1 transition-transform"
                >
                  Read Article
                  <i className="fas fa-arrow-right ml-2 text-xs"></i>
                </a>
                <div className="text-xs text-gray-400">
                  <i className="fas fa-clock mr-1"></i>
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
