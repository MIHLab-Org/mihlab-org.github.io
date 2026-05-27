import { Link } from 'react-router';
import { Layout } from '@/components/Layout';
import { ArrowRight, Sparkles, Gamepad2, Music, Palette } from 'lucide-react';

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
      <section data-ev-id="ev_269f1ff726" className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5]">
        {/* Decorative background */}
        <div data-ev-id="ev_3ee6a1410d" className="absolute inset-0 overflow-hidden">
          <div data-ev-id="ev_908966b9c6" className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#4A9EB5]/50 to-transparent" />
          <div data-ev-id="ev_0334cb3e22" className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div data-ev-id="ev_b30d5587aa" className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div data-ev-id="ev_739f504cbd" className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_e9dbea47ed" className="text-lg md:text-xl font-medium text-[#1A3A47]/80 mb-4">
            The Experience Machines
          </h1>
          <p data-ev-id="ev_d042b59cbc" className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1A3A47] leading-tight mb-8 text-balance">
            The <span data-ev-id="ev_2100e1cd28" className="font-semibold">Moral Imagination and Hope Laboratory.</span> Most philosophy is done analytically, we take seriously the idea that philosophy may also be typological. 
          </p>
          <p data-ev-id="ev_879bbc7189" className="text-lg md:text-xl text-[#2C5565] mb-10 max-w-2xl mx-auto">
            A philosophical laboratory where we invite the public into virtual worlds to explore these issues with us.
          </p>
          <Link
            to="/research"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#1A3A47] text-[#1A3A47] font-medium rounded-full hover:bg-[#1A3A47] hover:text-white transition-all duration-300">

            LEARN MORE
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Research Areas Section */}
      <section data-ev-id="ev_062523a928" className="py-20 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_c79e4db1c3" className="max-w-7xl mx-auto px-6">
          <h2 data-ev-id="ev_3d1fe74664" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] text-center mb-4">
            Philosophy for the Real World
          </h2>
          <p data-ev-id="ev_4f47b5b8a3" className="text-[#2C5565] text-center mb-12 max-w-2xl mx-auto">
            Exploring the intersection of art, ethics, and human experience
          </p>
          
          <div data-ev-id="ev_18275a40dc" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchAreas.map((area, index) =>
            <div data-ev-id="ev_0bf564cfeb"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg hover:bg-white transition-colors duration-300">

                <area.icon className="w-8 h-8 text-[#3AA8C4] mb-4" />
                <h3 data-ev-id="ev_dcc8908198" className="text-lg font-semibold text-[#1A3A47] mb-3">
                  {area.title}
                </h3>
                <p data-ev-id="ev_7f9c4b78c8" className="text-sm text-[#4A6B78] leading-relaxed">
                  {area.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What We Share Section */}
      <section data-ev-id="ev_876667220e" className="py-20 bg-[#5DBCD2]">
        <div data-ev-id="ev_881b3269eb" className="max-w-4xl mx-auto px-6">
          <h2 data-ev-id="ev_6ab12bd974" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] text-center mb-12">
            What We Share
          </h2>
          <div data-ev-id="ev_70bc56e2dd" className="bg-white/80 backdrop-blur-sm rounded-lg p-8">
            <ul data-ev-id="ev_a3125e4943" className="flex flex-col gap-4 text-[#2C5565]">
              <li data-ev-id="ev_448ba3cd2e" className="flex items-start gap-3">
                <span data-ev-id="ev_130057ca93" className="w-2 h-2 mt-2 bg-[#3AA8C4] rounded-full flex-shrink-0" />
                Links to papers (past or present) on music, identity, games and ethics
              </li>
              <li data-ev-id="ev_575fd49e5f" className="flex items-start gap-3">
                <span data-ev-id="ev_adeef57244" className="w-2 h-2 mt-2 bg-[#3AA8C4] rounded-full flex-shrink-0" />
                Reviews of games with interesting approaches to ethical play
              </li>
              <li data-ev-id="ev_54279c7868" className="flex items-start gap-3">
                <span data-ev-id="ev_08746307bb" className="w-2 h-2 mt-2 bg-[#3AA8C4] rounded-full flex-shrink-0" />
                Reviews of books on games, music and identity
              </li>
              <li data-ev-id="ev_ed30bfb5b2" className="flex items-start gap-3">
                <span data-ev-id="ev_a96c47486f" className="w-2 h-2 mt-2 bg-[#3AA8C4] rounded-full flex-shrink-0" />
                Announcements of events (conferences, workshops etc.) related to art and identity
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-ev-id="ev_095797998e" className="py-20 bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5]">
        <div data-ev-id="ev_dd782fd717" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_89057bf212" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] mb-4">
            Join Us
          </h2>
          <p data-ev-id="ev_eeab43adcd" className="text-[#2C5565] mb-8 max-w-xl mx-auto">
            We are always looking for collaborators, researchers, and curious minds to explore these questions with us.
          </p>
          <Link
            to="/participate"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1A3A47] text-white font-medium rounded-full hover:bg-[#2C5565] transition-colors duration-300">

            Get Involved
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </Layout>);

}