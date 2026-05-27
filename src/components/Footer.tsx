import { Link } from 'react-router';
import { Mail, Twitter, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer data-ev-id="ev_ce84c34fae" className="bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5] text-[#1A3A47]">
      <div data-ev-id="ev_2b7b685a19" className="max-w-7xl mx-auto px-6 py-16">
        <div data-ev-id="ev_e5d8e7dded" className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Lab Info */}
          <div data-ev-id="ev_1ea444df2f">
            <div data-ev-id="ev_b8e5c114e8" className="flex items-center gap-3 mb-4">
              <svg data-ev-id="ev_1590297965" viewBox="0 0 50 50" className="w-10 h-10 text-[#1A3A47]">
                <circle data-ev-id="ev_69098bdd50" cx="25" cy="25" r="4" fill="currentColor" />
                <circle data-ev-id="ev_4fcfad1f9e" cx="25" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle data-ev-id="ev_7d62420bd1" cx="25" cy="25" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle data-ev-id="ev_1b6da81220" cx="25" cy="25" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
                <line data-ev-id="ev_abfddd6463" x1="25" y1="3" x2="25" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span data-ev-id="ev_a3ed971686" className="text-lg font-semibold">MIHLab</span>
            </div>
            <p data-ev-id="ev_2d5e68bd3d" className="text-sm text-[#2C5565] leading-relaxed">
              The Moral Imagination and Hope Laboratory
            </p>
            <p data-ev-id="ev_e97edaad17" className="text-sm text-[#2C5565] mt-2">
              Philosophy for the Real World
            </p>
          </div>

          {/* Contact */}
          <div data-ev-id="ev_3e42f8220f">
            <h3 data-ev-id="ev_b0fd9121d1" className="text-lg font-semibold mb-4">Contact Us</h3>
            <div data-ev-id="ev_dfccffcd89" className="flex flex-col gap-3 text-sm text-[#2C5565]">
              <a data-ev-id="ev_090d5b0d55" href="mailto:contact@mihlab.org" className="hover:text-[#1A3A47] transition-colors flex items-center gap-2">
                <Mail size={16} />
                contact@mihlab.org
              </a>
              <div data-ev-id="ev_b3f8fd4d81" className="flex items-center gap-4 mt-2">
                <a data-ev-id="ev_9e81843ae4" href="#" className="hover:text-[#1A3A47] transition-colors">
                  <Twitter size={20} />
                </a>
                <a data-ev-id="ev_7520dd6b8c" href="#" className="hover:text-[#1A3A47] transition-colors">
                  <Github size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Get Involved */}
          <div data-ev-id="ev_da500c8d53">
            <h3 data-ev-id="ev_ea2006cae0" className="text-lg font-semibold mb-4">Get Involved</h3>
            <div data-ev-id="ev_77e138fcce" className="flex flex-col gap-2 text-sm">
              <Link to="/participate" className="text-[#2C5565] hover:text-[#1A3A47] transition-colors">
                Join as a researcher
              </Link>
              <Link to="/participate" className="text-[#2C5565] hover:text-[#1A3A47] transition-colors">
                Collaborate with us
              </Link>
              <Link to="/participate" className="text-[#2C5565] hover:text-[#1A3A47] transition-colors">
                Participate in research
              </Link>
            </div>
          </div>
        </div>

        <div data-ev-id="ev_dabd54a6cb" className="border-t border-[#4A9EB5] mt-12 pt-8 text-center text-sm text-[#2C5565]">
          <p data-ev-id="ev_3cd571d3c9">© {new Date().getFullYear()} The Moral Imagination and Hope Laboratory. All rights reserved.</p>
        </div>
      </div>
    </footer>);

}