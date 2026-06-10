import { Layout } from '@/components/Layout';
import { Gamepad2, BookOpen, Calendar, Play, FileText, Video, Loader2, ExternalLink, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import fleetMoonImage from '@/assets/uploads/fleet-moon.jpg';

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
        <Loader2 className="w-8 h-8 text-[#7DD3E8] animate-spin" />
        <span data-ev-id="ev_8a917cdee5" className="ml-3 text-[#a0c4d4]">Loading Substack posts...</span>
      </div>);

  }

  if (error || posts.length === 0) {
    return (
      <div data-ev-id="ev_8f60fa82fc" className="text-center py-12">
        <p data-ev-id="ev_53987f0961" className="text-[#a0c4d4] mb-4">{error || 'No posts available yet.'}</p>
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
      className="bg-[#112240] border border-[#7DD3E8]/20 p-6 rounded-lg hover:border-[#7DD3E8]/40 transition-colors group">

          <div data-ev-id="ev_da60c3943b" className="flex items-start justify-between mb-3">
            <div data-ev-id="ev_eac2f746d9" className="w-10 h-10 bg-[#FF6719]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#FF6719]" />
            </div>
            <span data-ev-id="ev_6fdb90b02c" className="text-xs text-[#6b8a99]">{formatDate(post.pubDate)}</span>
          </div>
          <h3 data-ev-id="ev_68c3a636e4" className="text-lg font-semibold text-white mb-2 group-hover:text-[#7DD3E8] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p data-ev-id="ev_e9dede205f" className="text-sm text-[#a0c4d4] mb-4 line-clamp-3">
            {post.description}
          </p>
          <span data-ev-id="ev_63de0e2dfc" className="inline-flex items-center gap-1 text-sm text-[#FF6719] font-medium">
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
      <div data-ev-id="ev_273204ff4c" className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#7DD3E8] animate-spin" />
        <span data-ev-id="ev_6b2c288fb0" className="ml-3 text-[#a0c4d4]">Loading YouTube videos...</span>
      </div>);

  }

  if (error || videos.length === 0) {
    return (
      <div data-ev-id="ev_b32f74777a" className="text-center py-12">
        <p data-ev-id="ev_0b4dd8550a" className="text-[#a0c4d4] mb-4">{error || 'No videos available yet.'}</p>
        <a data-ev-id="ev_e67818247c"
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
    <div data-ev-id="ev_fc1b1bc25d" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) =>
      <div data-ev-id="ev_deeaa15cb2"
      key={video.id}
      className="bg-[#112240] border border-[#7DD3E8]/20 rounded-lg overflow-hidden hover:border-[#7DD3E8]/40 transition-colors">

          {playingId === video.id ?
        <div data-ev-id="ev_14bc75fa76" className="aspect-video">
              <iframe data-ev-id="ev_07eed90a29"
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title} />

            </div> :

        <button data-ev-id="ev_81513c0d7f"
        onClick={() => setPlayingId(video.id)}
        className="relative w-full aspect-video bg-[#0a1929] group">

              {video.thumbnail &&
          <img data-ev-id="ev_15dcac4806"
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover" />

          }
              <div data-ev-id="ev_8ebe8082f3" className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                <div data-ev-id="ev_7697eed60a" className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>
            </button>
        }
          <div data-ev-id="ev_1408d6b1b6" className="p-4">
            <span data-ev-id="ev_ddde6b5804" className="text-xs text-[#6b8a99]">{formatDate(video.publishedAt)}</span>
            <h3 data-ev-id="ev_b86502557c" className="text-base font-semibold text-white line-clamp-2 mt-1">
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
    <div data-ev-id="ev_3622f1baf8" className="max-w-4xl mx-auto">
      <div data-ev-id="ev_aeb9930281" className="bg-[#112240] border border-[#7DD3E8]/20 rounded-lg p-8 text-center">
        <div data-ev-id="ev_d4ceeb52af" className="w-20 h-20 bg-[#9146FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Radio className="w-10 h-10 text-[#9146FF]" />
        </div>
        <h3 data-ev-id="ev_efee21945a" className="text-2xl font-semibold text-white mb-3">Watch us Live on Twitch</h3>
        <p data-ev-id="ev_0860db7d47" className="text-[#a0c4d4] mb-6 max-w-md mx-auto">Join our live workshops, philosophical discussions, and community events</p>
        <a data-ev-id="ev_ad9484460f"
        href={`https://www.twitch.tv/${channelName}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-8 py-4 bg-[#9146FF] text-white rounded-lg hover:bg-[#7c3aed] transition-colors font-medium text-lg">

          <Radio className="w-5 h-5" />
          Open Twitch Channel
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>);

}

// Notion Media Section
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
      <div data-ev-id="ev_f13f785922" className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#7DD3E8] animate-spin" />
        <span data-ev-id="ev_8cad75b9df" className="ml-3 text-[#a0c4d4]">Loading content from Notion...</span>
      </div>);

  }

  if (error || mediaItems.length === 0) {
    return null;
  }

  return (
    <div data-ev-id="ev_2bacb8451e" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mediaItems.map((item) =>
      <a data-ev-id="ev_b8fabd273c"
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#112240] border border-[#7DD3E8]/20 p-6 rounded-lg hover:border-[#7DD3E8]/40 transition-colors group">

          <div data-ev-id="ev_0fe7507ae3" className="flex items-start justify-between mb-3">
            <div data-ev-id="ev_b1521f7d00" className="w-10 h-10 bg-[#7DD3E8]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#7DD3E8]" />
            </div>
            <span data-ev-id="ev_3ddffa8f1d" className="text-xs text-[#6b8a99]">{formatDate(item.date)}</span>
          </div>
          <h3 data-ev-id="ev_b342971b59" className="text-lg font-semibold text-white mb-2 group-hover:text-[#7DD3E8] transition-colors">
            {item.title}
          </h3>
          {item.description &&
        <p data-ev-id="ev_38d150661e" className="text-sm text-[#a0c4d4] mb-4 line-clamp-3">
              {item.description}
            </p>
        }
          {item.tags.length > 0 &&
        <div data-ev-id="ev_9cabbd7693" className="flex flex-wrap gap-2">
              {item.tags.map((tag, i) =>
          <span data-ev-id="ev_27c5970017" key={i} className="px-2 py-1 bg-[#7DD3E8]/10 text-[#7DD3E8] text-xs font-medium rounded">
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
      <section data-ev-id="ev_f5fbe455c6" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div data-ev-id="ev_dc1e2f2034" className="absolute inset-0">
          <img data-ev-id="ev_4c2214f284" src={fleetMoonImage} alt="" className="w-full h-full object-cover" />
          <div data-ev-id="ev_7e497999ce" className="absolute inset-0 bg-gradient-to-b from-[#0a1929]/80 via-[#0a1929]/60 to-[#0a1929]" />
        </div>
        <div data-ev-id="ev_5204322b1d" className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <h1 data-ev-id="ev_71c9593ed6" className="text-4xl md:text-5xl font-semibold text-white mb-6">Media</h1>
          <p data-ev-id="ev_d0ac3d8c87" className="text-xl text-[#a0c4d4] max-w-2xl mx-auto">
            Reviews, papers, streams, and announcements from the lab
          </p>
        </div>
      </section>

      {/* Twitch Live Stream */}
      <section data-ev-id="ev_18f2a43b04" className="py-16 bg-[#0a1929]">
        <div data-ev-id="ev_2b71cdf8fb" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_180d214937" className="flex items-center justify-center gap-3 mb-8">
            <Radio className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_3a98cea7b4" className="text-2xl md:text-3xl font-semibold text-white">Live Stream</h2>
          </div>
          <p data-ev-id="ev_9600c122f9" className="text-center text-[#a0c4d4] mb-10 max-w-xl mx-auto">
            Catch our live workshops and philosophical discussions
          </p>
          <TwitchSection />
        </div>
      </section>

      {/* YouTube Videos */}
      <section data-ev-id="ev_4e0bb7861f" className="py-16 bg-[#112240]">
        <div data-ev-id="ev_104efa7cbc" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_33f78ba330" className="flex items-center justify-center gap-3 mb-8">
            <Video className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_ac7e81c908" className="text-2xl md:text-3xl font-semibold text-white">Latest Videos</h2>
          </div>
          <p data-ev-id="ev_8cdce6e69c" className="text-center text-[#a0c4d4] mb-10 max-w-xl mx-auto">
            Recorded sessions and video essays from our workshop
          </p>
          <YouTubeSection />
        </div>
      </section>

      {/* Substack Posts */}
      <section data-ev-id="ev_0c3df897e1" className="py-16 bg-[#0a1929]">
        <div data-ev-id="ev_5d320fe5dc" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_4fa92178ec" className="flex items-center justify-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_e12cb8fcb7" className="text-2xl md:text-3xl font-semibold text-white">Latest from Substack</h2>
          </div>
          <p data-ev-id="ev_58558952ce" className="text-center text-[#a0c4d4] mb-10 max-w-xl mx-auto">
            Essays, reflections, and updates from our newsletter
          </p>
          <SubstackSection />
        </div>
      </section>

      {/* Notion Content Feed */}
      <section data-ev-id="ev_3eab9f4799" className="py-16 bg-[#112240]">
        <div data-ev-id="ev_ecb5707872" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_117e6e470c" className="flex items-center justify-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_7c2bb8ffa0" className="text-2xl md:text-3xl font-semibold text-white">Additional Resources</h2>
          </div>
          <p data-ev-id="ev_e184852e1f" className="text-center text-[#a0c4d4] mb-10 max-w-xl mx-auto">
            Curated content from our research database
          </p>
          <NotionMediaSection />
        </div>
      </section>

      {/* Game Reviews */}
      <section data-ev-id="ev_3b174f1f47" className="py-16 bg-[#0a1929]">
        <div data-ev-id="ev_56a93244a2" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_2558fada1c" className="flex items-center justify-center gap-3 mb-8">
            <Gamepad2 className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_dd258665dd" className="text-2xl md:text-3xl font-semibold text-white">Game Reviews</h2>
          </div>
          <p data-ev-id="ev_da9a2171fa" className="text-center text-[#a0c4d4] mb-10 max-w-xl mx-auto">
            Games with interesting approaches to ethical play
          </p>
          <div data-ev-id="ev_c3c572b5e0" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameReviews.map((game, index) =>
            <div data-ev-id="ev_608c7f980a" key={index} className="bg-[#112240] border border-[#7DD3E8]/20 p-6 rounded-lg hover:border-[#7DD3E8]/40 transition-colors">
                <div data-ev-id="ev_8add3321a7" className="w-12 h-12 bg-[#7DD3E8]/10 rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-[#7DD3E8]" />
                </div>
                <h3 data-ev-id="ev_9b9615a2d9" className="text-lg font-semibold text-white mb-2">{game.title}</h3>
                <p data-ev-id="ev_7b94db41bb" className="text-sm text-[#a0c4d4] mb-4">{game.description}</p>
                <div data-ev-id="ev_7ed12bbc8e" className="flex flex-wrap gap-2">
                  {game.tags.map((tag, i) =>
                <span data-ev-id="ev_6b7ad43303" key={i} className="px-2 py-1 bg-[#7DD3E8]/10 text-[#7DD3E8] text-xs font-medium rounded">{tag}</span>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Book Reviews */}
      <section data-ev-id="ev_2c3a599ddb" className="py-16 bg-[#112240]">
        <div data-ev-id="ev_bdf4383a54" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_d65b31f71a" className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_8966eb01ea" className="text-2xl md:text-3xl font-semibold text-white">Book Reviews</h2>
          </div>
          <p data-ev-id="ev_fc6aaabe59" className="text-center text-[#a0c4d4] mb-10 max-w-xl mx-auto">
            Books on games, music, and identity
          </p>
          <div data-ev-id="ev_9476111108" className="flex flex-col gap-4">
            {bookReviews.map((book, index) =>
            <div data-ev-id="ev_d147236c49" key={index} className="bg-[#0a1929] border border-[#7DD3E8]/20 p-6 rounded-lg flex items-start gap-4 hover:border-[#7DD3E8]/40 transition-colors">
                <FileText className="w-6 h-6 text-[#7DD3E8] flex-shrink-0 mt-1" />
                <div data-ev-id="ev_345fbe9173">
                  <h3 data-ev-id="ev_736f3a963b" className="text-lg font-semibold text-white">{book.title}</h3>
                  <p data-ev-id="ev_adb76bc53b" className="text-sm text-[#7DD3E8] font-medium">by {book.author}</p>
                  <p data-ev-id="ev_93d5964573" className="text-sm text-[#a0c4d4] mt-2">{book.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events */}
      <section data-ev-id="ev_036f5af520" className="py-16 bg-[#0a1929]">
        <div data-ev-id="ev_e06536ec6c" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_7be87f533b" className="flex items-center justify-center gap-3 mb-8">
            <Calendar className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_a381939c7c" className="text-2xl md:text-3xl font-semibold text-white">Events</h2>
          </div>
          <p data-ev-id="ev_14430fd7a9" className="text-center text-[#a0c4d4] mb-10 max-w-xl mx-auto">
            Conferences, workshops, and gatherings related to art and identity
          </p>
          <div data-ev-id="ev_523ffae638" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) =>
            <div data-ev-id="ev_3c54204dda" key={index} className="bg-[#112240] border border-[#7DD3E8]/20 p-6 rounded-lg text-center hover:border-[#7DD3E8]/40 transition-colors">
                <span data-ev-id="ev_fc2a3ce547" className="inline-block px-3 py-1 bg-[#7DD3E8]/10 text-[#7DD3E8] text-xs font-medium rounded-full mb-4">{event.type}</span>
                <h3 data-ev-id="ev_82e5692b37" className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                <p data-ev-id="ev_d7695dce48" className="text-sm text-[#a0c4d4]">{event.date}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>);

}