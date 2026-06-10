import { Layout } from '@/components/Layout';
import { Mail, MapPin, Twitter, Github, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import earthOrbit from '@/assets/uploads/earth-orbit.jpg';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      {/* Hero */}
      <section data-ev-id="ev_dbeb87ee85" className="relative py-32 overflow-hidden">
        <div data-ev-id="ev_d2779da84e"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${earthOrbit})` }} />

        <div data-ev-id="ev_fb2ecb1792" className="absolute inset-0 bg-gradient-to-b from-[#0a2a3a]/80 via-[#0a2a3a]/70 to-[#1a3a47]/90" />
        
        <div data-ev-id="ev_a2d1d4724e" className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_5fa3f0c831" className="text-4xl md:text-5xl font-semibold text-white mb-6">
            Contact
          </h1>
          <p data-ev-id="ev_9099c03808" className="text-xl text-[#7DD3E8] max-w-2xl mx-auto">
            Get in touch with the MIHLab team
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section data-ev-id="ev_ea1d5de379" className="py-20 bg-gradient-to-b from-[#1a3a47] to-[#0a2a3a]">
        <div data-ev-id="ev_e6deecaf32" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_892202f6f4" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div data-ev-id="ev_ea7beef372">
              <h2 data-ev-id="ev_feaff4367f" className="text-2xl font-semibold text-white mb-8">
                Get in Touch
              </h2>
              
              <div data-ev-id="ev_28a36c4abb" className="flex flex-col gap-6">
                <div data-ev-id="ev_bd2d397d8e" className="flex items-start gap-4">
                  <div data-ev-id="ev_e672a4c14e" className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                    <Mail className="w-6 h-6 text-[#7DD3E8]" />
                  </div>
                  <div data-ev-id="ev_73fda9d387">
                    <h3 data-ev-id="ev_3921b60374" className="font-semibold text-white mb-1">Email</h3>
                    <a data-ev-id="ev_60632e9af2" href="mailto:contact@mihlab.org" className="text-white/70 hover:text-[#7DD3E8] transition-colors">
                      contact@mihlab.org
                    </a>
                  </div>
                </div>
                
                <div data-ev-id="ev_ab5a694c73" className="flex items-start gap-4">
                  <div data-ev-id="ev_74187d5067" className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                    <MessageCircle className="w-6 h-6 text-[#7DD3E8]" />
                  </div>
                  <div data-ev-id="ev_6a28a1f20f">
                    <h3 data-ev-id="ev_8e1b75cbbb" className="font-semibold text-white mb-1">Discord</h3>
                    <p data-ev-id="ev_43a8ebbd3a" className="text-white/70">
                      Join our community for discussions
                    </p>
                  </div>
                </div>
                
                <div data-ev-id="ev_3961880d1d" className="flex items-start gap-4">
                  <div data-ev-id="ev_6292c3ec90" className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20">
                    <MapPin className="w-6 h-6 text-[#7DD3E8]" />
                  </div>
                  <div data-ev-id="ev_fce468ee2c">
                    <h3 data-ev-id="ev_f38d3a409e" className="font-semibold text-white mb-1">Location</h3>
                    <p data-ev-id="ev_52def5e934" className="text-white/70">
                      Virtual lab with global collaborators
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div data-ev-id="ev_a76dda4295" className="mt-10">
                <h3 data-ev-id="ev_d251b5b2ef" className="font-semibold text-white mb-4">Follow Us</h3>
                <div data-ev-id="ev_ae36727610" className="flex items-center gap-4">
                  <a data-ev-id="ev_e9a0a37804"
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-[#7DD3E8] hover:bg-white/20 transition-colors border border-white/20">

                    <Twitter size={20} />
                  </a>
                  <a data-ev-id="ev_ef7265a219"
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-[#7DD3E8] hover:bg-white/20 transition-colors border border-white/20">

                    <Github size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div data-ev-id="ev_8629934918" className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-white/20">
              <h2 data-ev-id="ev_ef21e1eeb1" className="text-2xl font-semibold text-white mb-6">
                Send a Message
              </h2>
              
              <form data-ev-id="ev_b2309bd2f5" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div data-ev-id="ev_086e9ce26d">
                  <label data-ev-id="ev_a4699404e2" htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                    Name
                  </label>
                  <input data-ev-id="ev_4da6cc9613"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD3E8] focus:border-transparent text-white placeholder-white/40"
                  placeholder="Your name" />

                </div>
                
                <div data-ev-id="ev_850d6abb72">
                  <label data-ev-id="ev_1529b48ada" htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Email
                  </label>
                  <input data-ev-id="ev_2209d8bf7e"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD3E8] focus:border-transparent text-white placeholder-white/40"
                  placeholder="your@email.com" />

                </div>
                
                <div data-ev-id="ev_75df73cc1d">
                  <label data-ev-id="ev_64252a6d86" htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                    Subject
                  </label>
                  <select data-ev-id="ev_fc6003c0e0"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD3E8] focus:border-transparent text-white">

                    <option data-ev-id="ev_2bd439d118" value="" className="bg-[#1a3a47]">Select a topic</option>
                    <option data-ev-id="ev_0e24019b7f" value="collaboration" className="bg-[#1a3a47]">Research Collaboration</option>
                    <option data-ev-id="ev_dc852ba779" value="join" className="bg-[#1a3a47]">Join the Lab</option>
                    <option data-ev-id="ev_0f6d5bfafb" value="participate" className="bg-[#1a3a47]">Research Participation</option>
                    <option data-ev-id="ev_afd49bad5e" value="media" className="bg-[#1a3a47]">Media Inquiry</option>
                    <option data-ev-id="ev_b756bc32f8" value="other" className="bg-[#1a3a47]">Other</option>
                  </select>
                </div>
                
                <div data-ev-id="ev_a8dc967da6">
                  <label data-ev-id="ev_6b099fd302" htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                    Message
                  </label>
                  <textarea data-ev-id="ev_2a320a9ac2"
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7DD3E8] focus:border-transparent text-white placeholder-white/40 resize-none"
                  placeholder="Tell us about your interest in MIHLab..." />

                </div>
                
                <button data-ev-id="ev_64d6d65f50"
                type="submit"
                className="w-full py-3 bg-[#7DD3E8] text-[#0a2a3a] font-medium rounded-lg hover:bg-[#5DBCD2] transition-colors">

                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>);

}