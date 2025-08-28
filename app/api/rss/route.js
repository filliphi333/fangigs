import Parser from "rss-parser";

export async function GET() {
  const parser = new Parser({
    timeout: 12000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache'
    },
    customFields: {
      item: [
        ['media:content', 'mediaContent'],
        ['media:thumbnail', 'mediaThumbnail'],
        ['enclosure', 'enclosure'],
        ['content:encoded', 'contentEncoded'],
        ['description', 'description'],
        ['itunes:image', 'itunesImage']
      ]
    }
  });

  const sources = [
    { 
      url: "https://feeds.feedburner.com/xbiz/news", 
      name: "XBIZ",
      headers: {
        'Referer': 'https://www.xbiz.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; FanGigs/1.0; +https://fangigs.com)'
      }
    },
    { 
      url: "https://www.xbiz.com/rss", 
      name: "XBIZ Direct",
      headers: {
        'Referer': 'https://www.xbiz.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; FanGigs/1.0)'
      }
    },
    // Try alternative adult industry sources
    {
      url: "https://www.adultfilmdatabase.com/rss/news.xml",
      name: "Adult Film Database",
      headers: {
        'Referer': 'https://www.adultfilmdatabase.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; NewsReader/1.0)'
      }
    },
    // Fallback general tech news
    { 
      url: "https://feeds.feedburner.com/venturebeat/SZYF", 
      name: "VentureBeat",
      headers: {}
    },
    {
      url: "https://techcrunch.com/feed/",
      name: "TechCrunch",
      headers: {}
    }
  ];

  // Helper function to extract image from various RSS formats
  function extractImage(item) {
    let imageUrl = "";

    try {
      // Method 1: Enclosure (most common for podcasts/media)
      if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
        imageUrl = item.enclosure.url;
        console.log(`Found image via enclosure: ${imageUrl}`);
        return imageUrl;
      }

      // Method 2: Media RSS namespace
      if (item.mediaContent && Array.isArray(item.mediaContent)) {
        const imageMedia = item.mediaContent.find(media => 
          media.$ && media.$.type && media.$.type.startsWith('image/')
        );
        if (imageMedia && imageMedia.$.url) {
          imageUrl = imageMedia.$.url;
          console.log(`Found image via media:content: ${imageUrl}`);
          return imageUrl;
        }
      }

      // Method 3: Media thumbnail
      if (item.mediaThumbnail && item.mediaThumbnail.$) {
        imageUrl = item.mediaThumbnail.$.url;
        console.log(`Found image via media:thumbnail: ${imageUrl}`);
        return imageUrl;
      }

      // Method 4: iTunes image
      if (item.itunesImage && typeof item.itunesImage === 'string') {
        imageUrl = item.itunesImage;
        console.log(`Found image via itunes:image: ${imageUrl}`);
        return imageUrl;
      }

      // Method 5: Extract from HTML content
      if (item.contentEncoded || item.content || item.description) {
        const htmlContent = item.contentEncoded || item.content || item.description;
        
        // Try multiple image regex patterns
        const imagePatterns = [
          /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
          /<img[^>]+src=([^>\s]+)[^>]*>/gi,
          /src=["']([^"']+\.(?:jpg|jpeg|png|gif|webp))["']/gi,
          /https?:\/\/[^\s<>"]+\.(?:jpg|jpeg|png|gif|webp)/gi
        ];

        for (const pattern of imagePatterns) {
          const matches = htmlContent.match(pattern);
          if (matches && matches.length > 0) {
            // Extract URL from the first match
            const match = matches[0].match(/(?:src=["']?|https?:\/\/)([^"'\s<>]+)/);
            if (match) {
              imageUrl = match[1].startsWith('http') ? match[1] : `https:${match[1]}`;
              console.log(`Found image via HTML parsing: ${imageUrl}`);
              return imageUrl;
            }
          }
        }
      }

      // Method 6: Look for image in link or guid
      if (item.link && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.link)) {
        imageUrl = item.link;
        console.log(`Found image via link: ${imageUrl}`);
        return imageUrl;
      }

    } catch (e) {
      console.warn('Error extracting image:', e.message);
    }

    return imageUrl;
  }

  try {
    const articles = [];

    // Process sources with individual error handling
    const fetchPromises = sources.map(async (source) => {
      try {
        console.log(`Attempting to fetch from ${source.name} (${source.url})...`);
        
        // Use custom headers if specified
        const customParser = new Parser({
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': source.url.includes('xbiz') ? 'https://www.xbiz.com/' : undefined,
            ...source.headers
          },
          customFields: {
            item: [
              ['media:content', 'mediaContent'],
              ['media:thumbnail', 'mediaThumbnail'],
              ['enclosure', 'enclosure'],
              ['content:encoded', 'contentEncoded'],
              ['description', 'description'],
              ['itunes:image', 'itunesImage']
            ]
          }
        });

        const feed = await customParser.parseURL(source.url);
        console.log(`✅ Successfully fetched ${feed.items?.length || 0} items from ${source.name}`);
        
        if (!feed.items || feed.items.length === 0) {
          console.warn(`${source.name} returned no items`);
          return [];
        }
        
        const parsedArticles = feed.items.slice(0, 5).map((item) => {
          const imageUrl = extractImage(item) || 
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=400&auto=format&fit=crop';

          return {
            title: item.title || "Untitled Article",
            summary: item.contentSnippet || item.summary || item.description || "No summary available",
            link: item.link || "#",
            date: new Date(item.pubDate || item.isoDate || Date.now()),
            image_url: imageUrl,
            source: source.name,
          };
        });
        
        return parsedArticles;
      } catch (error) {
        console.error(`❌ Failed to fetch from ${source.name}:`, {
          message: error.message,
          code: error.code,
          url: source.url
        });
        return [];
      }
    });

    // Wait for all sources to complete
    const results = await Promise.allSettled(fetchPromises);
    
    // Combine all successful results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const sourceArticles = result.value;
        if (sourceArticles.length > 0) {
          console.log(`✅ Added ${sourceArticles.length} articles from ${sources[index].name}`);
          articles.push(...sourceArticles);
        }
      } else {
        console.error(`❌ Source ${sources[index].name} promise rejected:`, result.reason?.message);
      }
    });

    if (articles.length === 0) {
      console.warn('No articles fetched from any source');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300" // 5 minute cache
        },
      });
    }

    // Sort by date descending and limit
    const sorted = articles
      .filter(article => article.date && article.title)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12); // Increased limit

    console.log(`📰 Returning ${sorted.length} total articles`);

    return new Response(JSON.stringify(sorted), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300" // 5 minute cache to reduce API calls
      },
    });

  } catch (error) {
    console.error('Fatal RSS API error:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch news articles",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}