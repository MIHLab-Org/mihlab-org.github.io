import { Layout } from '@/components/Layout';
import { Mail, MapPin, Twitter, Github, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission would be handled here
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
      <section data-ev-id="ev_dbeb87ee85" className="bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5] py-20">
        <div data-ev-id="ev_d2779da84e" className="max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_f07c713981" className="text-4xl md:text-5xl font-semibold text-[#1A3A47] mb-6">
            Contact
          </h1>
          <p data-ev-id="ev_61783e3052" className="text-xl text-[#2C5565] max-w-2xl mx-auto">
            Get in touch with the MIHLab team
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section data-ev-id="ev_e5329662c2" className="py-20 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_71629799de" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_36bf7a1d04" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div data-ev-id="ev_026c24d783">
              <h2 data-ev-id="ev_decc3c7d2e" className="text-2xl font-semibold text-[#1A3A47] mb-8">
                Get in Touch
              </h2>
              
              <div data-ev-id="ev_85826c4491" className="flex flex-col gap-6">
                <div data-ev-id="ev_1deddbad37" className="flex items-start gap-4">
                  <div data-ev-id="ev_0ca802e021" className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#3AA8C4]" />
                  </div>
                  <div data-ev-id="ev_19ec24aeb0">
                    <h3 data-ev-id="ev_2b4ad5396c" className="font-semibold text-[#1A3A47] mb-1">Email</h3>
                    <a data-ev-id="ev_cbe083f6e0" href="mailto:contact@mihlab.org" className="text-[#2C5565] hover:text-[#1A3A47] transition-colors">
                      contact@mihlab.org
                    </a>
                  </div>
                </div>
                
                <div data-ev-id="ev_0dd4c48d6c" className="flex items-start gap-4">
                  <div data-ev-id="ev_995dcc3371" className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-[#3AA8C4]" />
                  </div>
                  <div data-ev-id="ev_61e78bf5f3">
                    <h3 data-ev-id="ev_2964ce2f92" className="font-semibold text-[#1A3A47] mb-1">Discord</h3>
                    <p data-ev-id="ev_8ee9923807" className="text-[#2C5565]">
                      Join our community for discussions
                    </p>
                  </div>
                </div>
                
                <div data-ev-id="ev_a65059da77" className="flex items-start gap-4">
                  <div data-ev-id="ev_e5aed7d8f2" className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#3AA8C4]" />
                  </div>
                  <div data-ev-id="ev_5758e5f213">
                    <h3 data-ev-id="ev_f770f5b771" className="font-semibold text-[#1A3A47] mb-1">Location</h3>
                    <p data-ev-id="ev_e1ff9d9179" className="text-[#2C5565]">
                      Virtual lab with global collaborators
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div data-ev-id="ev_2bd1ff25b6" className="mt-10">
                <h3 data-ev-id="ev_1700ba3992" className="font-semibold text-[#1A3A47] mb-4">Follow Us</h3>
                <div data-ev-id="ev_aa181d3888" className="flex items-center gap-4">
                  <a data-ev-id="ev_7068c54624"
                  href="#"
                  className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center text-[#3AA8C4] hover:bg-white transition-colors">

                    <Twitter size={20} />
                  </a>
                  <a data-ev-id="ev_e9a0a37804"
                  href="#"
                  className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center text-[#3AA8C4] hover:bg-white transition-colors">

                    <Github size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div data-ev-id="ev_297752c231" className="bg-white/80 backdrop-blur-sm p-8 rounded-lg">
              <h2 data-ev-id="ev_81b64648fb" className="text-2xl font-semibold text-[#1A3A47] mb-6">
                Send a Message
              </h2>
              
              <form data-ev-id="ev_1a27e94ce7" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div data-ev-id="ev_18315f2271">
                  <label data-ev-id="ev_a282417bcd" htmlFor="name" className="block text-sm font-medium text-[#2C5565] mb-2">
                    Name
                  </label>
                  <input data-ev-id="ev_e411e6c1b3"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#C5DEE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3AA8C4] focus:border-transparent bg-white"
                  placeholder="Your name" />

                </div>
                
                <div data-ev-id="ev_ff37ce1170">
                  <label data-ev-id="ev_8a4c750263" htmlFor="email" className="block text-sm font-medium text-[#2C5565] mb-2">
                    Email
                  </label>
                  <input data-ev-id="ev_c63579bca6"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#C5DEE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3AA8C4] focus:border-transparent bg-white"
                  placeholder="your@email.com" />

                </div>
                
                <div data-ev-id="ev_eccfd1fc5f">
                  <label data-ev-id="ev_e611d67012" htmlFor="subject" className="block text-sm font-medium text-[#2C5565] mb-2">
                    Subject
                  </label>
                  <select data-ev-id="ev_de3dd852f1"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#C5DEE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3AA8C4] focus:border-transparent bg-white">

                    <option data-ev-id="ev_7fdea1e82b" value="">Select a topic</option>
                    <option data-ev-id="ev_121e930b4b" value="collaboration">Research Collaboration</option>
                    <option data-ev-id="ev_6c9af60848" value="join">Join the Lab</option>
                    <option data-ev-id="ev_5fe8661eec" value="participate">Research Participation</option>
                    <option data-ev-id="ev_cbac0ed269" value="media">Media Inquiry</option>
                    <option data-ev-id="ev_af7f6d6881" value="other">Other</option>
                  </select>
                </div>
                
                <div data-ev-id="ev_1bb2b301e5">
                  <label data-ev-id="ev_0a91dfb29a" htmlFor="message" className="block text-sm font-medium text-[#2C5565] mb-2">
                    Message
                  </label>
                  <textarea data-ev-id="ev_47f2036a2c"
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-[#C5DEE6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3AA8C4] focus:border-transparent bg-white resize-none"
                  placeholder="Tell us about your interest in MIHLab..." />

                </div>
                
                <button data-ev-id="ev_d4521341be"
                type="submit"
                className="w-full py-3 bg-[#1A3A47] text-white font-medium rounded-lg hover:bg-[#2C5565] transition-colors">

                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>);

}