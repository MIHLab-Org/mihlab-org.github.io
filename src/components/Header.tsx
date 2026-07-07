import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
{ name: 'PEOPLE', path: '/people' },
{ name: 'RESEARCH', path: '/research' },
{ name: 'THE EXPERIENCE', path: '/media' },
{ name: 'PARTICIPATE', path: '/participate' },
{ name: 'CONTACT', path: '/contact' }];


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header data-ev-id="ev_fcca49e93e" className="fixed top-0 left-0 right-0 z-50 bg-[#0a1929]/90 backdrop-blur-md border-b border-[#7DD3E8]/10">
      <div data-ev-id="ev_74fa3aea84" className="max-w-7xl mx-auto px-6 py-4">
        <div data-ev-id="ev_cae15b3aff" className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/mihlab-logo-transparent.svg" alt="MIHLab.org" className="h-12" />
          </Link>

          {/* Desktop Navigation */}
          <nav data-ev-id="ev_ad46b0cfc6" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-[#7DD3E8] ${
              location.pathname === link.path ?
              'text-[#7DD3E8]' :
              'text-[#a0c4d4]'}`
              }>

                {link.name}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button data-ev-id="ev_b8b1bf8aee"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-[#7DD3E8]">

            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen &&
        <nav data-ev-id="ev_5f2e49e59b" className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-[#7DD3E8]/10 pt-4">
            {navLinks.map((link) =>
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#7DD3E8] ${
            location.pathname === link.path ?
            'text-[#7DD3E8]' :
            'text-[#a0c4d4]'}`
            }>

                {link.name}
              </Link>
          )}
          </nav>
        }
      </div>
    </header>);

}
