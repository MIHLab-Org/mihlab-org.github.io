import { Link } from 'react-router';
import { Layout } from '@/components/Layout';
import { ArrowRight, Sparkles, Gamepad2, Music, Palette } from 'lucide-react';
import heroSpaceStation from '@/assets/uploads/red-ship-hanger.jpg';
import futuristicCity from '@/assets/uploads/futuristic-city.jpg';

const researchAreas = [
{
  icon: Sparkles,
  title: "Ethical Reflection in Art",
  description: "Art's capacity to ignite ethical reflection on our deepest bonds—family, friendship, love—and the meaningful paths toward union with God."
},
{
  icon: Gamepad2,
  title: "Interactive Ethics",
  description: "How video games create moral dilemmas that force players to confront their values in ways traditional philosophy cannot."
},
{
  icon: Music,
  title: "Music & Moral Identity",
  description: "How artists use narrative to help listeners process emotions and imagine ethical commitments."
},
{
  icon: Palette,
  title: "Aesthetic Sentimentalism",
  description: "Bridging aesthetics and ethics to understand how beauty, emotion, and moral knowledge intertwine in popular art forms."
}];


export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section data-ev-id="ev_be6056e56b" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div data-ev-id="ev_8c23d5743f"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroSpaceStation})` }} />

        {/* Overlay for text readability */}
        <div data-ev-id="ev_9de03f00ac" className="absolute inset-0 bg-gradient-to-b from-[#0a2a3a]/70 via-[#0a2a3a]/50 to-[#1a4a5a]/80" />
        <div data-ev-id="ev_68fd800613" className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_610f62f454" className="text-lg md:text-xl font-medium text-[#7DD3E8] mb-4 tracking-wider">
            THE EXPERIENCE MACHINES
          </h1>
          <p data-ev-id="ev_879bbc7189" className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight mb-8 text-balance">
            The <span data-ev-id="ev_c59043b1e3" className="font-semibold text-[#7DD3E8]">Moral Imagination and Hope Laboratory</span> explores how art shapes who we become.
          </p>
          <p data-ev-id="ev_b7260388ad" className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            A philosophical laboratory where we invite the public into virtual worlds to explore questions of ethics, identity, and meaning.
          </p>
          <Link
            to="/research"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#7DD3E8] text-[#7DD3E8] font-medium rounded-full hover:bg-[#7DD3E8] hover:text-[#0a2a3a] transition-all duration-300">

            LEARN MORE
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Research Areas Section */}
      <section data-ev-id="ev_cbf0652f28" className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div data-ev-id="ev_bba4417994"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${futuristicCity})` }} />

        <div data-ev-id="ev_ba57e616cb" className="absolute inset-0 bg-[#1a3a47]/85" />
        <div data-ev-id="ev_ff1e00a19d" className="relative z-10 max-w-7xl mx-auto px-6">
          <h2 data-ev-id="ev_5f9a514b61" className="text-2xl md:text-3xl font-semibold text-white text-center mb-4">
            Philosophy for the Real World
          </h2>
          <p data-ev-id="ev_8938b192c9" className="text-[#7DD3E8] text-center mb-12 max-w-2xl mx-auto">
            Exploring the intersection of art, ethics, and human experience
          </p>
          <div data-ev-id="ev_5394ecbba3" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchAreas.map((area, index) =>
            <div data-ev-id="ev_d5084c2ddb"
            key={index}
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-colors duration-300">

                <area.icon className="w-8 h-8 text-[#7DD3E8] mb-4" />
                <h3 data-ev-id="ev_a0bd547efd" className="text-lg font-semibold text-white mb-3">
                  {area.title}
                </h3>
                <p data-ev-id="ev_19d9d2bf27" className="text-sm text-white/70 leading-relaxed">
                  {area.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What We Share Section */}
      <section data-ev-id="ev_ad27935b3d" className="py-20 bg-gradient-to-b from-[#1a3a47] to-[#0a2a3a]">
        <div data-ev-id="ev_bc0a99e408" className="max-w-4xl mx-auto px-6">
          <h2 data-ev-id="ev_97fc2ac790" className="text-2xl md:text-3xl font-semibold text-white text-center mb-12">
            What We Share
          </h2>
          <div data-ev-id="ev_9c17fa9e58" className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <ul data-ev-id="ev_39a534076c" className="flex flex-col gap-4 text-white/80">
              <li data-ev-id="ev_c076972965" className="flex items-start gap-3">
                <span data-ev-id="ev_901a800e36" className="w-2 h-2 mt-2 bg-[#7DD3E8] rounded-full flex-shrink-0" />
                Links to papers (past or present) on music, identity, games and ethics
              </li>
              <li data-ev-id="ev_49a84c1598" className="flex items-start gap-3">
                <span data-ev-id="ev_7fdc70c850" className="w-2 h-2 mt-2 bg-[#7DD3E8] rounded-full flex-shrink-0" />
                Reviews of games with interesting approaches to ethical play
              </li>
              <li data-ev-id="ev_a22583bb48" className="flex items-start gap-3">
                <span data-ev-id="ev_96b96c45a0" className="w-2 h-2 mt-2 bg-[#7DD3E8] rounded-full flex-shrink-0" />
                Reviews of books on games, music and identity
              </li>
              <li data-ev-id="ev_7a91e7d040" className="flex items-start gap-3">
                <span data-ev-id="ev_65b1d975d7" className="w-2 h-2 mt-2 bg-[#7DD3E8] rounded-full flex-shrink-0" />
                Announcements of events (conferences, workshops etc.) related to art and identity
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-ev-id="ev_0e164ea3b6" className="py-20 bg-[#0a2a3a]">
        <div data-ev-id="ev_05fd112db7" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_1bda6e60da" className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Join Us
          </h2>
          <p data-ev-id="ev_71028a881b" className="text-white/70 mb-8 max-w-xl mx-auto">
            We are always looking for collaborators, researchers, and curious minds to explore these questions with us.
          </p>
          <Link
            to="/participate"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#7DD3E8] text-[#0a2a3a] font-medium rounded-full hover:bg-[#5DBCD2] transition-colors duration-300">

            Get Involved
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </Layout>);
}

