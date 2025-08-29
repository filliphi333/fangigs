
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading article...</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
        <div className="text-gray-400 text-6xl mb-4">
          <i className="fas fa-newspaper"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-6">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <i className="fas fa-home mr-2"></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("news_articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        const matched = data?.find((item) => slugify(item.title) === slug);
        
        if (!matched) {
          setError("not_found");
          return;
        }

        setArticle(matched);

        // Fetch related articles (exclude current article)
        const related = data
          ?.filter(item => item.id !== matched.id)
          .slice(0, 4) || [];
        
        setRelatedArticles(related);

        // Update view count (optional enhancement)
        await supabase
          .from("news_articles")
          .update({ views: (matched.views || 0) + 1 })
          .eq("id", matched.id);

      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("fetch_error");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (error === "not_found" || !article) return <NotFoundPage />;

  if (error === "fetch_error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Article</h1>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading the article. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} | FanGigs News</title>
        <meta name="description" content={article.summary || `Read ${article.title} on FanGigs`} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary || `Read ${article.title} on FanGigs`} />
        <meta property="og:image" content={article.image_url || '/images/logo.png'} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                <i className="fas fa-home mr-1"></i>
                Home
              </Link>
              <i className="fas fa-chevron-right text-gray-400"></i>
              <Link href="/#news" className="hover:text-blue-600 transition-colors">
                News
              </Link>
              <i className="fas fa-chevron-right text-gray-400"></i>
              <span className="text-gray-900 font-medium truncate">
                {article.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Article Header */}
            <div className="relative">
              {article.image_url ? (
                <div className="relative h-64 md:h-80">
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              ) : (
                <div className="h-64 md:h-80 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <i className="fas fa-newspaper text-white text-6xl opacity-50"></i>
                </div>
              )}
              
              {/* Priority Badge */}
              {article.priority > 1 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                    <i className="fas fa-star mr-1"></i>
                    Featured
                  </span>
                </div>
              )}
            </div>

            {/* Article Meta and Content */}
            <div className="p-6 md:p-8">
              {/* Article Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <i className="fas fa-calendar mr-2 text-blue-500"></i>
                  <span>Published: {formatDate(article.created_at)}</span>
                </div>
                {article.source && (
                  <div className="flex items-center">
                    <i className="fas fa-source mr-2 text-blue-500"></i>
                    <span>Source: {article.source}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <i className="fas fa-eye mr-2 text-blue-500"></i>
                  <span>{article.views || 0} views</span>
                </div>
              </div>

              {/* Article Summary */}
              {article.summary && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                  <p className="text-gray-700 font-medium italic">
                    {article.summary}
                  </p>
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {article.full_article || "Content not available."}
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      const text = encodeURIComponent(article.title);
                      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fab fa-twitter mr-2"></i>
                    Twitter
                  </button>
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <i className="fab fa-facebook mr-2"></i>
                    Facebook
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <i className="fas fa-link mr-2"></i>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    href={`/news/${slugify(relatedArticle.title)}`}
                    className="group"
                  >
                    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        {relatedArticle.image_url ? (
                          <Image
                            src={relatedArticle.image_url}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <i className="fas fa-newspaper text-gray-400 text-3xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedArticle.summary || "Click to read more..."}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to News Button */}
          <div className="mt-8 text-center">
            <Link
              href="/#news"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to News
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
