import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div data-ev-id="ev_b9a37e6829" className="min-h-screen flex flex-col bg-[#0a1929]">
      <Header />
      <main data-ev-id="ev_30be924e2b" className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>);

}