import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
{ name: 'PEOPLE', path: '/people' },
{ name: 'RESEARCH', path: '/research' },
{ name: 'MEDIA', path: '/media' },
{ name: 'PARTICIPATE', path: '/participate' },
{ name: 'CONTACT', path: '/contact' }];


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header data-ev-id="ev_fcca49e93e" className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#8ED4E6] to-[#5DBCD2]">
      <div data-ev-id="ev_74fa3aea84" className="max-w-7xl mx-auto px-6 py-4">
        <div data-ev-id="ev_cae15b3aff" className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div data-ev-id="ev_77d08f6fce" className="w-12 h-12 flex items-center justify-center">
              <svg data-ev-id="ev_f515688d47" viewBox="0 0 50 50" className="w-full h-full text-[#1A3A47]">
                <circle data-ev-id="ev_073e812482" cx="25" cy="25" r="4" fill="currentColor" />
                <circle data-ev-id="ev_fa4801206b" cx="25" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle data-ev-id="ev_10b2dbe715" cx="25" cy="25" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle data-ev-id="ev_179823e983" cx="25" cy="25" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
                <line data-ev-id="ev_48795cba89" x1="25" y1="3" x2="25" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span data-ev-id="ev_67ed2c76a2" className="text-xl font-semibold text-[#1A3A47]">MIHLab</span>
          </Link>

          {/* Desktop Navigation */}
          <nav data-ev-id="ev_ad46b0cfc6" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-[#1A3A47] ${
              location.pathname === link.path ?
              'text-[#1A3A47]' :
              'text-[#2C5565]'}`
              }>

                {link.name}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button data-ev-id="ev_b8b1bf8aee"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-[#1A3A47]">

            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen &&
        <nav data-ev-id="ev_5f2e49e59b" className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            {navLinks.map((link) =>
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#1A3A47] ${
            location.pathname === link.path ?
            'text-[#1A3A47]' :
            'text-[#2C5565]'}`
            }>

                {link.name}
              </Link>
          )}
          </nav>
        }
      </div>
    </header>);

}