import { Layout } from '@/components/Layout';
import { Users, GraduationCap, Microscope, Heart, ArrowRight } from 'lucide-react';

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
      <section data-ev-id="ev_13fd53e604" className="bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5] py-20">
        <div data-ev-id="ev_40e2274e02" className="max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_6d24b59d4a" className="text-4xl md:text-5xl font-semibold text-[#1A3A47] mb-6">
            Participate
          </h1>
          <p data-ev-id="ev_6e431ef3b3" className="text-xl text-[#2C5565] max-w-2xl mx-auto">
            We are always looking for curious minds to join us in exploring how art shapes who we become
          </p>
        </div>
      </section>

      {/* Opportunities */}
      <section data-ev-id="ev_d8a981d6e9" className="py-20 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_04d4aab52d" className="max-w-6xl mx-auto px-6">
          <h2 data-ev-id="ev_86f63311fe" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] text-center mb-12">
            Opportunities
          </h2>
          
          <div data-ev-id="ev_0bf0961a83" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {opportunities.map((opp, index) =>
            <div data-ev-id="ev_298aa95481"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-lg">

                <opp.icon className="w-10 h-10 text-[#3AA8C4] mb-4" />
                <h3 data-ev-id="ev_d5d8b4e32c" className="text-xl font-semibold text-[#1A3A47] mb-3">
                  {opp.title}
                </h3>
                <p data-ev-id="ev_d06966eb99" className="text-[#4A6B78] mb-6">
                  {opp.description}
                </p>
                <div data-ev-id="ev_e801bfbf0e">
                  <h4 data-ev-id="ev_c539ad97c5" className="text-sm font-semibold text-[#2C5565] mb-3">What we're looking for:</h4>
                  <ul data-ev-id="ev_4192c3c10a" className="flex flex-col gap-2">
                    {opp.requirements.map((req, i) =>
                  <li data-ev-id="ev_c90049fc64" key={i} className="flex items-start gap-2 text-sm text-[#4A6B78]">
                        <span data-ev-id="ev_c9da74f040" className="w-1.5 h-1.5 bg-[#3AA8C4] rounded-full mt-1.5 flex-shrink-0" />
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
      <section data-ev-id="ev_24c8701168" className="py-20 bg-[#5DBCD2]">
        <div data-ev-id="ev_237bff81f8" className="max-w-4xl mx-auto px-6">
          <h2 data-ev-id="ev_ebaa25f096" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] text-center mb-12">
            How to Get Involved
          </h2>
          
          <div data-ev-id="ev_7a6266808c" className="bg-white/80 backdrop-blur-sm p-8 rounded-lg">
            <div data-ev-id="ev_b98f00d133" className="flex flex-col gap-6">
              <div data-ev-id="ev_8133a4ba3b" className="flex items-start gap-4">
                <div data-ev-id="ev_677b4b2a14" className="w-8 h-8 bg-[#3AA8C4] text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div data-ev-id="ev_4a810acecb">
                  <h3 data-ev-id="ev_ae7fdb452d" className="font-semibold text-[#1A3A47] mb-1">Reach Out</h3>
                  <p data-ev-id="ev_6c35869dcc" className="text-sm text-[#4A6B78]">
                    Send us an email introducing yourself and your interests. Tell us why you're curious about the intersection of art and ethics.
                  </p>
                </div>
              </div>
              
              <div data-ev-id="ev_c356a017e9" className="flex items-start gap-4">
                <div data-ev-id="ev_d948aeeebd" className="w-8 h-8 bg-[#3AA8C4] text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div data-ev-id="ev_bc3825c77e">
                  <h3 data-ev-id="ev_211dea3c29" className="font-semibold text-[#1A3A47] mb-1">Share Your Work</h3>
                  <p data-ev-id="ev_fcac5b6081" className="text-sm text-[#4A6B78]">
                    Include any relevant work, projects, or ideas you've been exploring. We value diverse perspectives and creative approaches.
                  </p>
                </div>
              </div>
              
              <div data-ev-id="ev_91f8314b93" className="flex items-start gap-4">
                <div data-ev-id="ev_436c0616bf" className="w-8 h-8 bg-[#3AA8C4] text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div data-ev-id="ev_1f9110f8d4">
                  <h3 data-ev-id="ev_69978d8725" className="font-semibold text-[#1A3A47] mb-1">Connect</h3>
                  <p data-ev-id="ev_24132a580d" className="text-sm text-[#4A6B78]">
                    We'll schedule a conversation to discuss potential collaboration and how your interests align with our ongoing work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-ev-id="ev_0286640699" className="py-20 bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5]">
        <div data-ev-id="ev_6fe24c6409" className="max-w-4xl mx-auto px-6 text-center">
          <h2 data-ev-id="ev_eda39bdb28" className="text-2xl md:text-3xl font-semibold text-[#1A3A47] mb-4">
            Ready to Join?
          </h2>
          <p data-ev-id="ev_13a6c98463" className="text-[#2C5565] mb-8 max-w-xl mx-auto">
            We'd love to hear from you. Reach out and let's explore these questions together.
          </p>
          <a data-ev-id="ev_fe3c1c91c5"
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#1A3A47] text-white font-medium rounded-full hover:bg-[#2C5565] transition-colors duration-300">

            Contact Us
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </Layout>);

}