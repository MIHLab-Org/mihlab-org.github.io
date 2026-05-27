import { Layout } from '@/components/Layout';
import { Sparkles, Gamepad2, Music, Palette, BookOpen, FileText } from 'lucide-react';

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
      <section data-ev-id="ev_764aaf55ad" className="bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5] py-20">
        <div data-ev-id="ev_2e5ab7ab69" className="max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_ad5be06792" className="text-4xl md:text-5xl font-semibold text-[#1A3A47] mb-6">
            Research
          </h1>
          <p data-ev-id="ev_c53d569548" className="text-xl text-[#2C5565] max-w-2xl mx-auto">
            Modeling Moral Attachments in Art — exploring how creative works shape our ethical understanding
          </p>
        </div>
      </section>

      {/* Research Areas */}
      <section data-ev-id="ev_43a7ab872a" className="py-20 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_e534461756" className="max-w-7xl mx-auto px-6">
          <h2 data-ev-id="ev_43a87ebd8b" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] text-center mb-12">
            Research Areas
          </h2>
          
          <div data-ev-id="ev_fca2e6352f" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {researchAreas.map((area, index) =>
            <div data-ev-id="ev_bb588fc117"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-lg">

                <area.icon className="w-10 h-10 text-[#3AA8C4] mb-4" />
                <h3 data-ev-id="ev_6b51d79000" className="text-xl font-semibold text-[#1A3A47] mb-3">
                  {area.title}
                </h3>
                <p data-ev-id="ev_313b18620a" className="text-[#4A6B78] mb-6">
                  {area.description}
                </p>
                <div data-ev-id="ev_e15b438c8f">
                  <h4 data-ev-id="ev_8702658df3" className="text-sm font-semibold text-[#2C5565] mb-2">Key Topics:</h4>
                  <ul data-ev-id="ev_baf7978fe4" className="flex flex-col gap-2">
                    {area.topics.map((topic, i) =>
                  <li data-ev-id="ev_98bc0cef50" key={i} className="flex items-center gap-2 text-sm text-[#4A6B78]">
                        <span data-ev-id="ev_95f915a584" className="w-1.5 h-1.5 bg-[#3AA8C4] rounded-full" />
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
      <section data-ev-id="ev_e9509862d0" className="py-20 bg-[#5DBCD2]">
        <div data-ev-id="ev_cc6b7f39c1" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_d83242eb46" className="flex items-center justify-center gap-3 mb-12">
            <BookOpen className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_226dc03af2" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Selected Publications
            </h2>
          </div>
          
          <div data-ev-id="ev_697bef97fe" className="flex flex-col gap-4">
            {publications.map((pub, index) =>
            <div data-ev-id="ev_fcb3a22bd3"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg flex items-start gap-4">

                <FileText className="w-6 h-6 text-[#3AA8C4] flex-shrink-0 mt-1" />
                <div data-ev-id="ev_8450868ba1">
                  <h3 data-ev-id="ev_0a61e5c7af" className="text-lg font-semibold text-[#1A3A47]">
                    {pub.title}
                  </h3>
                  <p data-ev-id="ev_191988bd24" className="text-sm text-[#4A6B78]">
                    {pub.authors} • {pub.year}
                  </p>
                  <span data-ev-id="ev_aa256f1b2f" className="inline-block mt-2 px-3 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded-full">
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