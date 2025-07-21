// app/news/[slug]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}


export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch articles:", error);
        return;
      }

      const matched = data.find((item) => slugify(item.title) === slug);
      if (!matched) return router.push("/");
      setArticle(matched);
    };

    fetchArticle();
  }, [slug]);

  if (!article) return <div className="p-6 text-lg">Loading article...</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <img src={article.image_url} alt="Banner" className="w-full h-64 object-cover rounded mb-4" />
      <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
      <p className="text-sm text-gray-600 mb-2">
     Published: {formatDate(article.published_at)} | Source: {article.source_name}
    </p>
    <div className="prose max-w-none whitespace-pre-wrap">
  {article.full_article}
</div>
    </main>
  );
}
