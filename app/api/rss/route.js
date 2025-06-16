import Parser from "rss-parser";

export async function GET() {
  const parser = new Parser();

  const sources = [
    "https://www.xbiz.com/rss",
    "https://www.theguardian.com/uk/technology/rss",
    // Add more URLs here (avoid AVN unless proxied)
  ];

  try {
    const articles = [];

    for (const url of sources) {
      try {
        const feed = await parser.parseURL(url);
        const parsedArticles = feed.items.slice(0, 5).map((item) => {
          let imageUrl = "";

          // Attempt to extract image URL (can be adjusted depending on feed structure)
          if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url; // Most common image URL field
          } else if (item["media:content"] && item["media:content"]["@attributes"] && item["media:content"]["@attributes"].url) {
            imageUrl = item["media:content"]["@attributes"].url; // Some feeds might use this
          } else if (item["content:encoded"]) {
            const content = item["content:encoded"];
            const regex = /<img[^>]+src="([^">]+)"/; // Extract image from HTML content
            const match = content.match(regex);
            if (match) {
              imageUrl = match[1]; // Extract the first image
            }
          }

 // Debugging: Log the extracted image URL
          console.log("Extracted image URL for", item.title, ":", imageUrl);

          // Fallback to a placeholder if no image is found
          if (!imageUrl) {
            imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Set to your default image path
          }

          return {
            title: item.title,
            summary: item.contentSnippet || item.description || "",
            link: item.link,
            date: new Date(item.pubDate),
            image_url: imageUrl,
          };
        });
        articles.push(...parsedArticles);
      } catch (e) {
        console.warn(`Failed to fetch from ${url}:`, e.message);
      }
    }

    // Sort by date descending
    const sorted = articles
      .filter((a) => a.date)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10); // limit to top 10

    return new Response(JSON.stringify(sorted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
