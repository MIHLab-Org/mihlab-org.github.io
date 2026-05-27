import { Layout } from '@/components/Layout';
import { User, Mail, ExternalLink } from 'lucide-react';

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
      <section data-ev-id="ev_59c24923dd" className="bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5] py-20">
        <div data-ev-id="ev_fa9b8cefc9" className="max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_e014f88371" className="text-4xl md:text-5xl font-semibold text-[#1A3A47] mb-6">
            People
          </h1>
          <p data-ev-id="ev_c4e54ea8c3" className="text-xl text-[#2C5565] max-w-2xl mx-auto">
            Artists, academics, and creative types united by curiosity about art and ethics
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section data-ev-id="ev_d6f8eb3e7c" className="py-20 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_902911dd04" className="max-w-6xl mx-auto px-6">
          <h2 data-ev-id="ev_0a0dfb98f7" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] text-center mb-12">
            Our Team
          </h2>
          
          <div data-ev-id="ev_4e934fe443" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) =>
            <div data-ev-id="ev_1bd02594bb"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg">

                <div data-ev-id="ev_b091fc4726" className="flex items-start gap-4">
                  <div data-ev-id="ev_effd184d88" className="w-16 h-16 bg-gradient-to-br from-[#5DBCD2] to-[#3AA8C4] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div data-ev-id="ev_70eca48c72" className="flex-1">
                    <h3 data-ev-id="ev_b892ed7cea" className="text-lg font-semibold text-[#1A3A47]">
                      {member.name}
                    </h3>
                    <p data-ev-id="ev_fccba9df57" className="text-sm text-[#3AA8C4] font-medium mb-2">
                      {member.role}
                    </p>
                    <p data-ev-id="ev_e2e696d74a" className="text-sm text-[#4A6B78] mb-4">
                      {member.bio}
                    </p>
                    <div data-ev-id="ev_b2c19d8e1b" className="flex flex-wrap gap-2">
                      {member.interests.map((interest, i) =>
                    <span data-ev-id="ev_f0e2eb8f2e"
                    key={i}
                    className="px-3 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded-full">

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
      <section data-ev-id="ev_39e40c9459" className="py-20 bg-[#5DBCD2]">
        <div data-ev-id="ev_a89c66b7c8" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_d328773184" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] mb-6">
            We Collaborate With
          </h2>
          <p data-ev-id="ev_10e8df7e0a" className="text-[#2C5565] mb-10 max-w-xl mx-auto">
            Our interdisciplinary approach brings together diverse perspectives
          </p>
          
          <div data-ev-id="ev_f6aa49a7e3" className="flex flex-wrap justify-center gap-4">
            {collaborators.map((collab, index) =>
            <span data-ev-id="ev_4aa2a8dac1"
            key={index}
            className="px-6 py-3 bg-white/80 text-[#1A3A47] font-medium rounded-full">

                {collab}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section data-ev-id="ev_8394f50da6" className="py-16 bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5]">
        <div data-ev-id="ev_a9e22eed42" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_1fcabdfa45" className="text-xl md:text-2xl font-semibold text-[#1A3A47] mb-4">
            Interested in joining our team?
          </h2>
          <a data-ev-id="ev_2b256009e7"
          href="/participate"
          className="inline-flex items-center gap-2 text-[#1A3A47] font-medium hover:underline">

            Learn about opportunities
            <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </Layout>);

}