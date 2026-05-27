import { Layout } from '@/components/Layout';
import { Gamepad2, BookOpen, Calendar, Play, FileText, Video, Link2, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

const SUBSTACK_URL = 'https://substack.com/@mihlab'
const TWITCH_CHANNEL = 'https://www.twitch.tv/mihlab'

function NotionMediaSection() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    if (!supabase) {
      setError('Backend not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('notion-media');

      if (fnError) {
        throw fnError;
      }

      setMediaItems(data?.items ?? []);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Unable to load content from Notion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const getTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'video':return <Video className="w-5 h-5" />;
      case 'link':return <Link2 className="w-5 h-5" />;
      default:return <FileText className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div data-ev-id="ev_43bd50a183" className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#3AA8C4] animate-spin" />
        <span data-ev-id="ev_409a23a11b" className="ml-3 text-[#2C5565]">Loading content from Notion...</span>
      </div>);

  }

  if (error) {
    return (
      <div data-ev-id="ev_0949bdacd9" className="text-center py-12">
        <p data-ev-id="ev_d86af8bb27" className="text-[#4A6B78] mb-4">{error}</p>
        <button data-ev-id="ev_e5db539cb6"
        onClick={fetchMedia}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 text-[#3AA8C4] rounded-lg hover:bg-white transition-colors">

          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>);

  }

  if (mediaItems.length === 0) {
    return (
      <div data-ev-id="ev_65daf75c52" className="text-center py-12">
        <p data-ev-id="ev_35128c69cb" className="text-[#4A6B78]">No content available yet. Add items to your Notion database to see them here.</p>
      </div>);

  }

  return (
    <div data-ev-id="ev_3e78999d4e" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mediaItems.map((item) =>
      <a data-ev-id="ev_81d5f5ebe3"
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/80 backdrop-blur-sm p-6 rounded-lg hover:bg-white transition-colors group">

          <div data-ev-id="ev_da60c3943b" className="flex items-start justify-between mb-3">
            <div data-ev-id="ev_eac2f746d9" className="w-10 h-10 bg-[#E8F4F8] rounded-lg flex items-center justify-center text-[#3AA8C4]">
              {getTypeIcon(item.type)}
            </div>
            <span data-ev-id="ev_6fdb90b02c" className="text-xs text-[#6B8A99]">{formatDate(item.date)}</span>
          </div>
          
          <h3 data-ev-id="ev_75ed79d68a" className="text-lg font-semibold text-[#1A3A47] mb-2 group-hover:text-[#3AA8C4] transition-colors">
            {item.title}
          </h3>
          
          {item.description &&
        <p data-ev-id="ev_b0eeaab0c3" className="text-sm text-[#4A6B78] mb-4 line-clamp-3">
              {item.description}
            </p>
        }
          
          {item.embedUrl && item.type === 'video' &&
        <div data-ev-id="ev_ff8ab75074" className="aspect-video bg-[#1A3A47]/10 rounded-lg mb-4 overflow-hidden">
              <iframe data-ev-id="ev_680bb73536"
          src={item.embedUrl}
          className="w-full h-full"
          allowFullScreen
          title={item.title} />

            </div>
        }
          
          {item.tags.length > 0 &&
        <div data-ev-id="ev_b54b5d6031" className="flex flex-wrap gap-2">
              {item.tags.map((tag, i) =>
          <span data-ev-id="ev_2be9209f46"
          key={i}
          className="px-2 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded">

                  {tag}
                </span>
          )}
            </div>
        }
        </a>
      )}
    </div>);

}

export default function Media() {
  return (
    <Layout>
      {/* Hero */}
      <section data-ev-id="ev_d6ad03894b" className="bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5] py-20">
        <div data-ev-id="ev_0a23729b44" className="max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_62b181c4b2" className="text-4xl md:text-5xl font-semibold text-[#1A3A47] mb-6">
            Media
          </h1>
          <p data-ev-id="ev_2aafb4c762" className="text-xl text-[#2C5565] max-w-2xl mx-auto">
            Reviews, papers, and announcements from the lab
          </p>
        </div>
      </section>

      {/* Notion Content Feed */}
      <section data-ev-id="ev_ce45e4a2cd" className="py-20 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_269280fe75" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_42caf0a99e" className="flex items-center justify-center gap-3 mb-12">
            <FileText className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_d8bfe19991" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Latest Posts & Updates
            </h2>
          </div>
          <p data-ev-id="ev_badf865704" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Fresh content from our research and community
          </p>
          
          <NotionMediaSection />
        </div>
      </section>

      {/* Game Reviews */}
      <section data-ev-id="ev_201a4b43b0" className="py-20 bg-[#5DBCD2]">
        <div data-ev-id="ev_5780555426" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_fafd49e239" className="flex items-center justify-center gap-3 mb-12">
            <Gamepad2 className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_fec28653c2" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Game Reviews
            </h2>
          </div>
          <p data-ev-id="ev_7b0625e7a4" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Games with interesting approaches to ethical play
          </p>
          
          <div data-ev-id="ev_9e9f5fad58" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameReviews.map((game, index) =>
            <div data-ev-id="ev_351ef82781"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg hover:bg-white transition-colors">

                <div data-ev-id="ev_da18ec15b1" className="w-12 h-12 bg-[#E8F4F8] rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-[#3AA8C4]" />
                </div>
                <h3 data-ev-id="ev_a16774c936" className="text-lg font-semibold text-[#1A3A47] mb-2">
                  {game.title}
                </h3>
                <p data-ev-id="ev_b7d4414b7c" className="text-sm text-[#4A6B78] mb-4">
                  {game.description}
                </p>
                <div data-ev-id="ev_34940f69bf" className="flex flex-wrap gap-2">
                  {game.tags.map((tag, i) =>
                <span data-ev-id="ev_6f70bfae49"
                key={i}
                className="px-2 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded">

                      {tag}
                    </span>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Book Reviews */}
      <section data-ev-id="ev_dfc977a080" className="py-20 bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5]">
        <div data-ev-id="ev_363c9f081b" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_37b53d9362" className="flex items-center justify-center gap-3 mb-12">
            <BookOpen className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_db152eb8a4" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Book Reviews
            </h2>
          </div>
          <p data-ev-id="ev_ff8c9fb82c" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Books on games, music, and identity
          </p>
          
          <div data-ev-id="ev_f4014d80f6" className="flex flex-col gap-4">
            {bookReviews.map((book, index) =>
            <div data-ev-id="ev_c41db9268a"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg flex items-start gap-4">

                <FileText className="w-6 h-6 text-[#3AA8C4] flex-shrink-0 mt-1" />
                <div data-ev-id="ev_4382ae31af">
                  <h3 data-ev-id="ev_c0e4f4da18" className="text-lg font-semibold text-[#1A3A47]">
                    {book.title}
                  </h3>
                  <p data-ev-id="ev_16d86f3322" className="text-sm text-[#3AA8C4] font-medium">
                    by {book.author}
                  </p>
                  <p data-ev-id="ev_b37f0df1a4" className="text-sm text-[#4A6B78] mt-2">
                    {book.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events */}
      <section data-ev-id="ev_3f10af45c6" className="py-20 bg-[#4A9EB5]">
        <div data-ev-id="ev_c8179b20f0" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_783f442de3" className="flex items-center justify-center gap-3 mb-12">
            <Calendar className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_c30d1de550" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Events
            </h2>
          </div>
          <p data-ev-id="ev_880aaa678f" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Conferences, workshops, and gatherings related to art and identity
          </p>
          
          <div data-ev-id="ev_dfebbdb4b1" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) =>
            <div data-ev-id="ev_5f7fc6b124"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg text-center">

                <span data-ev-id="ev_e8ff2f8162" className="inline-block px-3 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded-full mb-4">
                  {event.type}
                </span>
                <h3 data-ev-id="ev_cfd8838391" className="text-lg font-semibold text-[#1A3A47] mb-2">
                  {event.title}
                </h3>
                <p data-ev-id="ev_a41af5024e" className="text-sm text-[#4A6B78]">
                  {event.date}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>);

}