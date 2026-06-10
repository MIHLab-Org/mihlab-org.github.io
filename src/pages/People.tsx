import { Layout } from '@/components/Layout';
import { User, ExternalLink } from 'lucide-react';
import soldiersImage from '@/assets/uploads/soldiers-horizon.jpg';

const teamMembers = [
{
  name: "Lab Director",
  role: "Principal Investigator",
  bio: "Leading research on moral imagination and the ethics of art and media.",
  interests: ["Philosophy of Art", "Moral Psychology", "Game Studies"]
},
{
  name: "Research Associate",
  role: "Postdoctoral Researcher",
  bio: "Exploring the intersection of interactive media and ethical development.",
  interests: ["Interactive Ethics", "Virtual Reality", "Narrative Theory"]
},
{
  name: "Graduate Researcher",
  role: "PhD Student",
  bio: "Investigating music's role in shaping moral identity and emotional intelligence.",
  interests: ["Music Philosophy", "Identity Formation", "Aesthetics"]
},
{
  name: "Research Assistant",
  role: "Research Coordinator",
  bio: "Supporting lab operations and community engagement initiatives.",
  interests: ["Public Philosophy", "Art Education", "Community Building"]
}];


const collaborators = [
"Philosophers",
"Game Designers",
"Musicians",
"Visual Artists",
"Writers",
"Educators"];


export default function People() {
  return (
    <Layout>
      {/* Hero */}
      <section data-ev-id="ev_58d73b6080" className="relative py-32 overflow-hidden">
        <div data-ev-id="ev_afc324e7a6"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${soldiersImage})` }} />

        <div data-ev-id="ev_172f47095c" className="absolute inset-0 bg-gradient-to-b from-[#0a2a3a]/80 via-[#0a2a3a]/70 to-[#1a3a47]/90" />
        
        <div data-ev-id="ev_1b3967aa6e" className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_cad5cbee65" className="text-4xl md:text-5xl font-semibold text-white mb-6">
            People
          </h1>
          <p data-ev-id="ev_02e2409776" className="text-xl text-[#7DD3E8] max-w-2xl mx-auto">
            Artists, academics, and creative types united by curiosity about art and ethics
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section data-ev-id="ev_a9872e53f6" className="py-20 bg-gradient-to-b from-[#1a3a47] to-[#0a2a3a]">
        <div data-ev-id="ev_94b90b9bbd" className="max-w-6xl mx-auto px-6">
          <h2 data-ev-id="ev_898097020e" className="text-2xl md:text-3xl font-semibold text-white text-center mb-12">
            Our Team
          </h2>
          
          <div data-ev-id="ev_ed0f3b66f0" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) =>
            <div data-ev-id="ev_7bdc82c9bf"
            key={index}
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">

                <div data-ev-id="ev_ff2f745cf1" className="flex items-start gap-4">
                  <div data-ev-id="ev_234d043010" className="w-16 h-16 bg-gradient-to-br from-[#5DBCD2] to-[#3AA8C4] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div data-ev-id="ev_e90be970de" className="flex-1">
                    <h3 data-ev-id="ev_0d4723f361" className="text-lg font-semibold text-white">
                      {member.name}
                    </h3>
                    <p data-ev-id="ev_b78f40472e" className="text-sm text-[#7DD3E8] font-medium mb-2">
                      {member.role}
                    </p>
                    <p data-ev-id="ev_9cf6c284bf" className="text-sm text-white/70 mb-4">
                      {member.bio}
                    </p>
                    <div data-ev-id="ev_8020b2a7fa" className="flex flex-wrap gap-2">
                      {member.interests.map((interest, i) =>
                    <span data-ev-id="ev_98c0ebd760"
                    key={i}
                    className="px-3 py-1 bg-[#7DD3E8]/20 text-[#7DD3E8] text-xs font-medium rounded-full">

                          {interest}
                        </span>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Collaborators */}
      <section data-ev-id="ev_7e48f4e545" className="py-20 bg-[#0a2a3a]">
        <div data-ev-id="ev_628228662d" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_f7dc234713" className="text-2xl md:text-3xl font-semibold text-white mb-6">
            We Collaborate With
          </h2>
          <p data-ev-id="ev_eabe16fc95" className="text-white/70 mb-10 max-w-xl mx-auto">
            Our interdisciplinary approach brings together diverse perspectives
          </p>
          
          <div data-ev-id="ev_2160ff15c1" className="flex flex-wrap justify-center gap-4">
            {collaborators.map((collab, index) =>
            <span data-ev-id="ev_c5d6b22017"
            key={index}
            className="px-6 py-3 bg-white/10 text-white font-medium rounded-full border border-white/20">

                {collab}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section data-ev-id="ev_d56df90278" className="py-16 bg-gradient-to-b from-[#0a2a3a] to-[#1a3a47]">
        <div data-ev-id="ev_bec23bb7d0" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_d3416717ec" className="text-xl md:text-2xl font-semibold text-white mb-4">
            Interested in joining our team?
          </h2>
          <a data-ev-id="ev_589370feee"
          href="/participate"
          className="inline-flex items-center gap-2 text-[#7DD3E8] font-medium hover:underline">

            Learn about opportunities
            <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </Layout>);

}