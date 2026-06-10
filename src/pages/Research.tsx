import { Layout } from '@/components/Layout';
import { Sparkles, Gamepad2, Music, Palette, BookOpen, FileText } from 'lucide-react';
import fleetImage from '@/assets/uploads/fleet-ringed-planet.jpg';

const researchAreas = [
{
  icon: Sparkles,
  title: "Ethical Reflection in Art",
  description: "Art's capacity to ignite ethical reflection on our deepest bonds—family, friendship, love—and the meaningful paths toward union with God.",
  topics: ["Moral narratives in literature", "Visual art and ethical contemplation", "Religious imagery and moral development"]
},
{
  icon: Gamepad2,
  title: "Interactive Ethics",
  description: "How video games create moral dilemmas that force players to confront their values in ways traditional philosophy cannot.",
  topics: ["Moral choices in RPGs", "Player agency and ethical responsibility", "Virtual consequences and real emotions"]
},
{
  icon: Music,
  title: "Music & Moral Identity",
  description: "How artists use narrative to help listeners process emotions and imagine ethical commitments.",
  topics: ["Lyrics as moral philosophy", "Musical narratives and identity", "Emotional resonance and values"]
},
{
  icon: Palette,
  title: "Aesthetic Sentimentalism",
  description: "Bridging aesthetics and ethics to understand how beauty, emotion, and moral knowledge intertwine in popular art forms.",
  topics: ["Beauty and moral truth", "Emotional response to art", "Pop culture and ethics"]
}];


const publications = [
{
  title: "The Moral Weight of Virtual Choices",
  authors: "MIHLab Research Team",
  year: "2024",
  type: "Paper"
},
{
  title: "Music as Moral Philosophy: A Framework",
  authors: "MIHLab Research Team",
  year: "2023",
  type: "Paper"
},
{
  title: "Art, Identity, and Ethical Becoming",
  authors: "MIHLab Research Team",
  year: "2023",
  type: "Book Chapter"
}];


export default function Research() {
  return (
    <Layout>
      {/* Hero */}
      <section data-ev-id="ev_7c4f516d32" className="relative py-32 overflow-hidden">
        <div data-ev-id="ev_699d4ae8a5"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${fleetImage})` }} />

        <div data-ev-id="ev_cdcb3294fa" className="absolute inset-0 bg-gradient-to-b from-[#0a2a3a]/80 via-[#0a2a3a]/70 to-[#1a3a47]/90" />
        
        <div data-ev-id="ev_06d2a23655" className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_25fab94ecb" className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Research
          </h1>
          <p data-ev-id="ev_d896bd0b14" className="text-xl text-[#7DD3E8] max-w-2xl mx-auto">
            Modeling Moral Attachments in Art — exploring how creative works shape our ethical understanding
          </p>
        </div>
      </section>

      {/* Research Areas */}
      <section data-ev-id="ev_aa4bba921f" className="py-20 bg-gradient-to-b from-[#1a3a47] to-[#0a2a3a]">
        <div data-ev-id="ev_a3a3a842ab" className="max-w-7xl mx-auto px-6">
          <h2 data-ev-id="ev_a4600d6bd7" className="text-2xl md:text-3xl font-semibold text-white text-center mb-12">
            Research Areas
          </h2>
          
          <div data-ev-id="ev_7af6181b97" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {researchAreas.map((area, index) =>
            <div data-ev-id="ev_6ad7a2a80b"
            key={index}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20">

                <area.icon className="w-10 h-10 text-[#7DD3E8] mb-4" />
                <h3 data-ev-id="ev_674b8b72be" className="text-xl font-semibold text-white mb-3">
                  {area.title}
                </h3>
                <p data-ev-id="ev_3a1908d917" className="text-white/70 mb-6">
                  {area.description}
                </p>
                <div data-ev-id="ev_98f94865f2">
                  <h4 data-ev-id="ev_27b970c2bc" className="text-sm font-semibold text-[#7DD3E8] mb-2">Key Topics:</h4>
                  <ul data-ev-id="ev_dd7c02ce26" className="flex flex-col gap-2">
                    {area.topics.map((topic, i) =>
                  <li data-ev-id="ev_f7a9183c67" key={i} className="flex items-center gap-2 text-sm text-white/60">
                        <span data-ev-id="ev_8762be5918" className="w-1.5 h-1.5 bg-[#7DD3E8] rounded-full" />
                        {topic}
                      </li>
                  )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Selected Publications */}
      <section data-ev-id="ev_96e36302d0" className="py-20 bg-[#0a2a3a]">
        <div data-ev-id="ev_fbf1cf7687" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_697bef97fe" className="flex items-center justify-center gap-3 mb-12">
            <BookOpen className="w-8 h-8 text-[#7DD3E8]" />
            <h2 data-ev-id="ev_6da8fcd2c9" className="text-2xl md:text-3xl font-semibold text-white">
              Selected Publications
            </h2>
          </div>
          
          <div data-ev-id="ev_6334430ec0" className="flex flex-col gap-4">
            {publications.map((pub, index) =>
            <div data-ev-id="ev_dc17e988d7"
            key={index}
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 flex items-start gap-4">

                <FileText className="w-6 h-6 text-[#7DD3E8] flex-shrink-0 mt-1" />
                <div data-ev-id="ev_fd909ab070">
                  <h3 data-ev-id="ev_0255a94654" className="text-lg font-semibold text-white">
                    {pub.title}
                  </h3>
                  <p data-ev-id="ev_b20cac9cb4" className="text-sm text-white/60">
                    {pub.authors} • {pub.year}
                  </p>
                  <span data-ev-id="ev_c14b43af5f" className="inline-block mt-2 px-3 py-1 bg-[#7DD3E8]/20 text-[#7DD3E8] text-xs font-medium rounded-full">
                    {pub.type}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>);

}