import { Layout } from '@/components/Layout';
import { Gamepad2, BookOpen, Calendar, Play, FileText, Video, Loader2, RefreshCw, ExternalLink, Radio } from 'lucide-react';
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

interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
}

const gameReviews = [
{
  title: "The Last of Us Part II",
  description: "An exploration of moral complexity through player choice and consequence.",
  tags: ["Narrative Ethics", "Player Agency"]
},
{
  title: "Undertale",
  description: "How pacifist gameplay challenges traditional gaming morality.",
  tags: ["Non-Violence", "Empathy"]
},
{
  title: "Spec Ops: The Line",
  description: "Confronting the player with the weight of virtual violence.",
  tags: ["War Ethics", "Moral Discomfort"]
}];


const bookReviews = [
{
  title: "Games: Agency as Art",
  author: "C. Thi Nguyen",
  description: "A philosophical examination of games as a unique art form."
},
{
  title: "The Art of Game Design",
  author: "Jesse Schell",
  description: "Understanding design choices through an ethical lens."
}];


const events = [
{
  title: "Philosophy & Games Symposium",
  date: "Spring 2025",
  type: "Conference"
},
{
  title: "Art & Ethics Workshop Series",
  date: "Monthly",
  type: "Workshop"
},
{
  title: "Public Philosophy Night",
  date: "Quarterly",
  type: "Public Event"
}];


// Substack Feed Section
function SubstackSection() {
  const [posts, setPosts] = useState<SubstackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!supabase) {
      setError('Backend not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('substack-feed');

      if (fnError) throw fnError;
      setPosts(data?.posts ?? []);
    } catch (err) {
      console.error('Failed to fetch Substack posts:', err);
      setError('Unable to load Substack posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div data-ev-id="ev_df495b895d" className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#3AA8C4] animate-spin" />
        <span data-ev-id="ev_8a917cdee5" className="ml-3 text-[#2C5565]">Loading Substack posts...</span>
      </div>);

  }

  if (error || posts.length === 0) {
    return (
      <div data-ev-id="ev_8f60fa82fc" className="text-center py-12">
        <p data-ev-id="ev_53987f0961" className="text-[#4A6B78] mb-4">{error || 'No posts available yet.'}</p>
        <a data-ev-id="ev_3fb55bed05"
        href="https://mihlab.substack.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6719] text-white rounded-lg hover:bg-[#e55a0f] transition-colors">

          Visit our Substack
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>);

  }

  return (
    <div data-ev-id="ev_3e78999d4e" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) =>
      <a data-ev-id="ev_81d5f5ebe3"
      key={index}
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/80 backdrop-blur-sm p-6 rounded-lg hover:bg-white transition-colors group">

          <div data-ev-id="ev_da60c3943b" className="flex items-start justify-between mb-3">
            <div data-ev-id="ev_eac2f746d9" className="w-10 h-10 bg-[#FF6719]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#FF6719]" />
            </div>
            <span data-ev-id="ev_6fdb90b02c" className="text-xs text-[#6B8A99]">{formatDate(post.pubDate)}</span>
          </div>
          
          <h3 data-ev-id="ev_75ed79d68a" className="text-lg font-semibold text-[#1A3A47] mb-2 group-hover:text-[#3AA8C4] transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p data-ev-id="ev_cc55366fe1" className="text-sm text-[#4A6B78] mb-4 line-clamp-3">
            {post.description}
          </p>
          
          <span data-ev-id="ev_e4381caf4e" className="inline-flex items-center gap-1 text-sm text-[#FF6719] font-medium">
            Read on Substack
            <ExternalLink className="w-3 h-3" />
          </span>
        </a>
      )}
    </div>);

}

// YouTube Videos Section
function YouTubeSection() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fetchVideos = async () => {
    if (!supabase) {
      setError('Backend not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-videos');

      if (fnError) throw fnError;
      setVideos(data?.videos ?? []);
    } catch (err) {
      console.error('Failed to fetch YouTube videos:', err);
      setError('Unable to load YouTube videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div data-ev-id="ev_9049e1cb29" className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#3AA8C4] animate-spin" />
        <span data-ev-id="ev_b1bf4ef0e2" className="ml-3 text-[#2C5565]">Loading YouTube videos...</span>
      </div>);

  }

  if (error || videos.length === 0) {
    return (
      <div data-ev-id="ev_2c3759bc32" className="text-center py-12">
        <p data-ev-id="ev_087ae098aa" className="text-[#4A6B78] mb-4">{error || 'No videos available yet.'}</p>
        <a data-ev-id="ev_b255f0abad"
        href="https://www.youtube.com/@mihlab-workshop"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors">

          Visit our YouTube Channel
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>);

  }

  return (
    <div data-ev-id="ev_651bbd43a0" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) =>
      <div data-ev-id="ev_bed4f7eef6"
      key={video.id}
      className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white transition-colors">

          {playingId === video.id ?
        <div data-ev-id="ev_916c500a20" className="aspect-video">
              <iframe data-ev-id="ev_2fd3340707"
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title} />

            </div> :

        <button data-ev-id="ev_e8971326e7"
        onClick={() => setPlayingId(video.id)}
        className="relative w-full aspect-video bg-[#1A3A47]/10 group">

              {video.thumbnail &&
          <img data-ev-id="ev_02888bdd14"
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover" />

          }
              <div data-ev-id="ev_927fb83704" className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div data-ev-id="ev_cf817c8793" className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>
            </button>
        }
          
          <div data-ev-id="ev_f5e3cfd6a1" className="p-4">
            <div data-ev-id="ev_bc749c2fff" className="flex items-center justify-between mb-2">
              <span data-ev-id="ev_f44fd82357" className="text-xs text-[#6B8A99]">{formatDate(video.publishedAt)}</span>
            </div>
            <h3 data-ev-id="ev_89bd8070f2" className="text-base font-semibold text-[#1A3A47] line-clamp-2">
              {video.title}
            </h3>
          </div>
        </div>
      )}
    </div>);

}

// Twitch Embed Section
function TwitchSection() {
  const channelName = 'mihlab';

  return (
    <div data-ev-id="ev_9a397bd95e" className="max-w-4xl mx-auto">
      <div data-ev-id="ev_1b21e359c1" className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden">
        <div data-ev-id="ev_c2eff6a239" className="aspect-video">
          <iframe data-ev-id="ev_fb7a0b3fa2"
          src={`https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}&muted=true`}
          className="w-full h-full"
          allowFullScreen
          title="MIHLab Twitch Stream" />

        </div>
        <div data-ev-id="ev_fa3e46c956" className="p-4 flex items-center justify-between">
          <div data-ev-id="ev_04bfb96640" className="flex items-center gap-3">
            <div data-ev-id="ev_a7bfe80683" className="w-10 h-10 bg-[#9146FF]/10 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#9146FF]" />
            </div>
            <div data-ev-id="ev_81d39550ae">
              <p data-ev-id="ev_7e438b9ecd" className="font-semibold text-[#1A3A47]">MIHLab on Twitch</p>
              <p data-ev-id="ev_eedc90ff9a" className="text-sm text-[#4A6B78]">Live workshops & discussions</p>
            </div>
          </div>
          <a data-ev-id="ev_bed53e7a8e"
          href={`https://www.twitch.tv/${channelName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#9146FF] text-white rounded-lg hover:bg-[#7c3aed] transition-colors text-sm font-medium">

            Follow on Twitch
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>);

}

// Notion Media Section (existing)
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

      if (fnError) throw fnError;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div data-ev-id="ev_1b497e291f" className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#3AA8C4] animate-spin" />
        <span data-ev-id="ev_9e3af29e6f" className="ml-3 text-[#2C5565]">Loading content from Notion...</span>
      </div>);

  }

  if (error || mediaItems.length === 0) {
    return null; // Hide section if no Notion content
  }

  return (
    <div data-ev-id="ev_d80b8d9874" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mediaItems.map((item) =>
      <a data-ev-id="ev_d2a4f6f9e5"
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white/80 backdrop-blur-sm p-6 rounded-lg hover:bg-white transition-colors group">

          <div data-ev-id="ev_77f138ccf5" className="flex items-start justify-between mb-3">
            <div data-ev-id="ev_61510b544e" className="w-10 h-10 bg-[#E8F4F8] rounded-lg flex items-center justify-center text-[#3AA8C4]">
              <FileText className="w-5 h-5" />
            </div>
            <span data-ev-id="ev_4d2309eb97" className="text-xs text-[#6B8A99]">{formatDate(item.date)}</span>
          </div>
          
          <h3 data-ev-id="ev_a4b2d1b9ea" className="text-lg font-semibold text-[#1A3A47] mb-2 group-hover:text-[#3AA8C4] transition-colors">
            {item.title}
          </h3>
          
          {item.description &&
        <p data-ev-id="ev_c5cd47f5e6" className="text-sm text-[#4A6B78] mb-4 line-clamp-3">
              {item.description}
            </p>
        }
          
          {item.tags.length > 0 &&
        <div data-ev-id="ev_029c342db6" className="flex flex-wrap gap-2">
              {item.tags.map((tag, i) =>
          <span data-ev-id="ev_6ad6a640ce"
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
      <section data-ev-id="ev_210c912df3" className="bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5] py-20">
        <div data-ev-id="ev_5041c22085" className="max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_899d0f9155" className="text-4xl md:text-5xl font-semibold text-[#1A3A47] mb-6">
            Media
          </h1>
          <p data-ev-id="ev_b3d399e57a" className="text-xl text-[#2C5565] max-w-2xl mx-auto">
            Reviews, papers, streams, and announcements from the lab
          </p>
        </div>
      </section>

      {/* Twitch Live Stream */}
      <section data-ev-id="ev_67f8fae050" className="py-16 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_41c304887d" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_2b336657e7" className="flex items-center justify-center gap-3 mb-8">
            <Radio className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_adcbc657c0" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Live Stream
            </h2>
          </div>
          <p data-ev-id="ev_4b909fd3b6" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Catch our live workshops and philosophical discussions
          </p>
          
          <TwitchSection />
        </div>
      </section>

      {/* YouTube Videos */}
      <section data-ev-id="ev_3eab9f4799" className="py-16 bg-[#5DBCD2]">
        <div data-ev-id="ev_ecb5707872" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_117e6e470c" className="flex items-center justify-center gap-3 mb-8">
            <Video className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_7c2bb8ffa0" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Latest Videos
            </h2>
          </div>
          <p data-ev-id="ev_1d5b277656" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Recorded sessions and video essays from our workshop
          </p>
          
          <YouTubeSection />
        </div>
      </section>

      {/* Substack Posts */}
      <section data-ev-id="ev_4c8bc3c512" className="py-16 bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5]">
        <div data-ev-id="ev_a9707d0df4" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_eb63d01428" className="flex items-center justify-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_e4246a83e5" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Latest from Substack
            </h2>
          </div>
          <p data-ev-id="ev_cecc0e6f37" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Essays, reflections, and updates from our newsletter
          </p>
          
          <SubstackSection />
        </div>
      </section>

      {/* Notion Content Feed */}
      <section data-ev-id="ev_e667a77b68" className="py-16 bg-[#4A9EB5]">
        <div data-ev-id="ev_a66ccd2358" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_07a506ca4e" className="flex items-center justify-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_28e6fb2ba2" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Additional Resources
            </h2>
          </div>
          <p data-ev-id="ev_405d579828" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Curated content from our research database
          </p>
          
          <NotionMediaSection />
        </div>
      </section>

      {/* Game Reviews */}
      <section data-ev-id="ev_bdc7e5b54d" className="py-16 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_e7122ddeab" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_4c8cbc86c1" className="flex items-center justify-center gap-3 mb-8">
            <Gamepad2 className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_533c9b1747" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Game Reviews
            </h2>
          </div>
          <p data-ev-id="ev_062d73528c" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Games with interesting approaches to ethical play
          </p>
          
          <div data-ev-id="ev_bd4c3ab3e3" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameReviews.map((game, index) =>
            <div data-ev-id="ev_924c2ef9d1"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg hover:bg-white transition-colors">

                <div data-ev-id="ev_64b0b5e7b4" className="w-12 h-12 bg-[#E8F4F8] rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-[#3AA8C4]" />
                </div>
                <h3 data-ev-id="ev_a6fb2205c3" className="text-lg font-semibold text-[#1A3A47] mb-2">
                  {game.title}
                </h3>
                <p data-ev-id="ev_b0eff55038" className="text-sm text-[#4A6B78] mb-4">
                  {game.description}
                </p>
                <div data-ev-id="ev_a2f09e653e" className="flex flex-wrap gap-2">
                  {game.tags.map((tag, i) =>
                <span data-ev-id="ev_c4a1efbf61"
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
      <section data-ev-id="ev_8b14844c4e" className="py-16 bg-[#5DBCD2]">
        <div data-ev-id="ev_d6f958fa21" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_26201449bb" className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_1916eb74fa" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Book Reviews
            </h2>
          </div>
          <p data-ev-id="ev_71729c82c4" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Books on games, music, and identity
          </p>
          
          <div data-ev-id="ev_cb6c17db66" className="flex flex-col gap-4">
            {bookReviews.map((book, index) =>
            <div data-ev-id="ev_a656a8915d"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg flex items-start gap-4">

                <FileText className="w-6 h-6 text-[#3AA8C4] flex-shrink-0 mt-1" />
                <div data-ev-id="ev_45e1c21faa">
                  <h3 data-ev-id="ev_e5de93154a" className="text-lg font-semibold text-[#1A3A47]">
                    {book.title}
                  </h3>
                  <p data-ev-id="ev_702f0a7dbc" className="text-sm text-[#3AA8C4] font-medium">
                    by {book.author}
                  </p>
                  <p data-ev-id="ev_b83bfe6987" className="text-sm text-[#4A6B78] mt-2">
                    {book.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events */}
      <section data-ev-id="ev_3c7be7cbd7" className="py-16 bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5]">
        <div data-ev-id="ev_2690315741" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_0cce55db36" className="flex items-center justify-center gap-3 mb-8">
            <Calendar className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_9164f4814e" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Events
            </h2>
          </div>
          <p data-ev-id="ev_e6cc211413" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Conferences, workshops, and gatherings related to art and identity
          </p>
          
          <div data-ev-id="ev_feed6990cb" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) =>
            <div data-ev-id="ev_6390c469b9"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg text-center">

                <span data-ev-id="ev_eac531e034" className="inline-block px-3 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded-full mb-4">
                  {event.type}
                </span>
                <h3 data-ev-id="ev_932cd4b759" className="text-lg font-semibold text-[#1A3A47] mb-2">
                  {event.title}
                </h3>
                <p data-ev-id="ev_e3b7600da8" className="text-sm text-[#4A6B78]">
                  {event.date}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>);

}