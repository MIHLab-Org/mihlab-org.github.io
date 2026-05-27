import { Client } from 'npm:@notionhq/client@2.2.15';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotionPage {
  id: string;
  properties: Record<string, unknown>;
  url: string;
  created_time: string;
}

interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'post' | 'video' | 'link';
  url: string;
  embedUrl?: string;
  date: string;
  tags: string[];
}

function getPropertyValue(property: unknown): string {
  if (!property || typeof property !== 'object') return '';
  
  const prop = property as Record<string, unknown>;
  
  if (prop.type === 'title' && Array.isArray(prop.title)) {
    return prop.title.map((t: { plain_text?: string }) => t.plain_text || '').join('');
  }
  if (prop.type === 'rich_text' && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t: { plain_text?: string }) => t.plain_text || '').join('');
  }
  if (prop.type === 'select' && prop.select) {
    return (prop.select as { name?: string }).name || '';
  }
  if (prop.type === 'multi_select' && Array.isArray(prop.multi_select)) {
    return prop.multi_select.map((s: { name?: string }) => s.name || '').join(',');
  }
  if (prop.type === 'url') {
    return (prop.url as string) || '';
  }
  if (prop.type === 'date' && prop.date) {
    return (prop.date as { start?: string }).start || '';
  }
  
  return '';
}

function transformNotionPage(page: NotionPage): MediaItem {
  const props = page.properties;
  
  return {
    id: page.id,
    title: getPropertyValue(props.Title || props.Name || props.title),
    description: getPropertyValue(props.Description || props.Summary || props.description),
    type: (getPropertyValue(props.Type || props.type) as MediaItem['type']) || 'post',
    url: getPropertyValue(props.URL || props.Link || props.url) || page.url,
    embedUrl: getPropertyValue(props.EmbedURL || props.Embed || props.embedUrl),
    date: page.created_time,
    tags: getPropertyValue(props.Tags || props.tags).split(',').filter(Boolean),
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const notionToken = Deno.env.get('NOTION_TOKEN');
    const mediaDatabaseId = Deno.env.get('NOTION_MEDIA_DB');

    if (!notionToken || !mediaDatabaseId) {
      console.error('Missing Notion configuration');
      return new Response(
        JSON.stringify({ error: 'Notion not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notion = new Client({ auth: notionToken });

    const response = await notion.databases.query({
      database_id: mediaDatabaseId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    const mediaItems: MediaItem[] = response.results
      .filter((page): page is NotionPage => 'properties' in page)
      .map(transformNotionPage);

    return new Response(
      JSON.stringify({ items: mediaItems }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching from Notion:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch media content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
