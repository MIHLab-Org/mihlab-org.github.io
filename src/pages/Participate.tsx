import { Layout } from '@/components/Layout';
import { Users, GraduationCap, Microscope, Heart, ArrowRight } from 'lucide-react';
import stationEarth from '@/assets/uploads/station-earth.jpg';

const opportunities = [
{
  icon: GraduationCap,
  title: "Graduate Researchers",
  description: "Join us as a PhD student exploring the intersection of philosophy, art, and ethics.",
  requirements: [
  "Background in philosophy, psychology, or related field",
  "Interest in art, games, or music",
  "Curiosity about moral psychology"]

},
{
  icon: Microscope,
  title: "Postdoctoral Researchers",
  description: "Contribute your expertise to our interdisciplinary research program.",
  requirements: [
  "PhD in philosophy, psychology, or related discipline",
  "Research experience in ethics or aesthetics",
  "Publication record in relevant areas"]

},
{
  icon: Users,
  title: "Research Collaborators",
  description: "Partner with us on projects exploring art and moral imagination.",
  requirements: [
  "Expertise in relevant creative or academic field",
  "Shared interest in ethical questions in art",
  "Willingness to engage in interdisciplinary work"]

},
{
  icon: Heart,
  title: "Research Participants",
  description: "Participate in our studies exploring how art shapes moral understanding.",
  requirements: [
  "Interest in games, music, or visual art",
  "Willingness to share your experiences",
  "No academic background required"]

}];


export default function Participate() {
  return (
    <Layout>
      {/* Hero */}
      <section data-ev-id="ev_06ab37e3f5" className="relative py-32 overflow-hidden">
        <div data-ev-id="ev_5cdaf97cd2"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${stationEarth})` }} />

        <div data-ev-id="ev_4c87abbd7f" className="absolute inset-0 bg-gradient-to-b from-[#0a2a3a]/80 via-[#0a2a3a]/70 to-[#1a3a47]/90" />
        
        <div data-ev-id="ev_38f1502145" className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_68803723c9" className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Participate
          </h1>
          <p data-ev-id="ev_8511258634" className="text-xl text-[#7DD3E8] max-w-2xl mx-auto">
            We are always looking for curious minds to join us in exploring how art shapes who we become
          </p>
        </div>
      </section>

      {/* Opportunities */}
      <section data-ev-id="ev_58a701fabb" className="py-20 bg-gradient-to-b from-[#1a3a47] to-[#0a2a3a]">
        <div data-ev-id="ev_20f5591561" className="max-w-6xl mx-auto px-6">
          <h2 data-ev-id="ev_d4f91879a3" className="text-2xl md:text-3xl font-semibold text-white text-center mb-12">
            Opportunities
          </h2>
          
          <div data-ev-id="ev_591b89e140" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {opportunities.map((opp, index) =>
            <div data-ev-id="ev_0336bdb04b"
            key={index}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20">

                <opp.icon className="w-10 h-10 text-[#7DD3E8] mb-4" />
                <h3 data-ev-id="ev_382c479736" className="text-xl font-semibold text-white mb-3">
                  {opp.title}
                </h3>
                <p data-ev-id="ev_72fa384373" className="text-white/70 mb-6">
                  {opp.description}
                </p>
                <div data-ev-id="ev_88121f0172">
                  <h4 data-ev-id="ev_938184d50c" className="text-sm font-semibold text-[#7DD3E8] mb-3">What we're looking for:</h4>
                  <ul data-ev-id="ev_16d97ebb6a" className="flex flex-col gap-2">
                    {opp.requirements.map((req, i) =>
                  <li data-ev-id="ev_ff2372a341" key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span data-ev-id="ev_d9d49440d3" className="w-1.5 h-1.5 bg-[#7DD3E8] rounded-full mt-1.5 flex-shrink-0" />
                        {req}
                      </li>
                  )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section data-ev-id="ev_02bab8ace8" className="py-20 bg-[#0a2a3a]">
        <div data-ev-id="ev_340c536177" className="max-w-4xl mx-auto px-6">
          <h2 data-ev-id="ev_edd42f64fa" className="text-2xl md:text-3xl font-semibold text-white text-center mb-12">
            How to Get Involved
          </h2>
          
          <div data-ev-id="ev_91f0be57cf" className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20">
            <div data-ev-id="ev_e7300bd78b" className="flex flex-col gap-6">
              <div data-ev-id="ev_b062a0decb" className="flex items-start gap-4">
                <div data-ev-id="ev_ee8285b826" className="w-8 h-8 bg-[#7DD3E8] text-[#0a2a3a] rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div data-ev-id="ev_2e5791777b">
                  <h3 data-ev-id="ev_13372c36fb" className="font-semibold text-white mb-1">Reach Out</h3>
                  <p data-ev-id="ev_b8986aab60" className="text-sm text-white/70">
                    Send us an email introducing yourself and your interests. Tell us why you're curious about the intersection of art and ethics.
                  </p>
                </div>
              </div>
              
              <div data-ev-id="ev_9bada61f1c" className="flex items-start gap-4">
                <div data-ev-id="ev_e69945d7a1" className="w-8 h-8 bg-[#7DD3E8] text-[#0a2a3a] rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div data-ev-id="ev_cc0982abcd">
                  <h3 data-ev-id="ev_e86768a248" className="font-semibold text-white mb-1">Share Your Work</h3>
                  <p data-ev-id="ev_f44b326c96" className="text-sm text-white/70">
                    Include any relevant work, projects, or ideas you've been exploring. We value diverse perspectives and creative approaches.
                  </p>
                </div>
              </div>
              
              <div data-ev-id="ev_3d4eb0b7e6" className="flex items-start gap-4">
                <div data-ev-id="ev_d84bf7a41e" className="w-8 h-8 bg-[#7DD3E8] text-[#0a2a3a] rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div data-ev-id="ev_50551bc952">
                  <h3 data-ev-id="ev_be0f9ea5ca" className="font-semibold text-white mb-1">Connect</h3>
                  <p data-ev-id="ev_fa324ee0ca" className="text-sm text-white/70">
                    We'll schedule a conversation to discuss potential collaboration and how your interests align with our ongoing work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-ev-id="ev_ffa4029342" className="py-20 bg-gradient-to-b from-[#0a2a3a] to-[#1a3a47]">
        <div data-ev-id="ev_1d50418d91" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_9e7510a3e5" className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to Join?
          </h2>
          <p data-ev-id="ev_bff1716ba4" className="text-white/70 mb-8 max-w-xl mx-auto">
            We'd love to hear from you. Reach out and let's explore these questions together.
          </p>
          <a data-ev-id="ev_4c1036b74a"
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#7DD3E8] text-[#0a2a3a] font-medium rounded-full hover:bg-[#5DBCD2] transition-colors duration-300">

            Contact Us
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </Layout>);

}