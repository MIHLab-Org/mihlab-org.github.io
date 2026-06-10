const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function extractTextContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tagName}>|<${tagName}[^>]*>([^<]*)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  if (match) {
    return (match[1] || match[2] || '').trim();
  }
  return '';
}

function parseRSS(xml: string): SubstackPost[] {
  const posts: SubstackPost[] = [];
  
  // Split by <item> tags
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const title = extractTextContent(itemXml, 'title');
    const link = extractTextContent(itemXml, 'link');
    const pubDate = extractTextContent(itemXml, 'pubDate');
    let description = extractTextContent(itemXml, 'description');
    
    // Strip HTML tags and truncate description
    description = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    
    if (description.length > 200) {
      description = description.substring(0, 200).trim() + '...';
    }
    
    if (title && link) {
      posts.push({ title, link, pubDate, description });
    }
  }
  
  return posts;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Fetch RSS from Substack
    const rssUrl = 'https://mihlab.substack.com/feed';
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MIHLab/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch RSS:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch RSS feed', posts: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const xml = await response.text();
    const posts = parseRSS(xml);
    
    // Return only the 6 most recent posts
    const recentPosts = posts.slice(0, 6);

    return new Response(
      JSON.stringify({ posts: recentPosts }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Substack RSS:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch RSS feed', posts: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
