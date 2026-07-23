/**
 * ⚠️ ROUTING RULES:
 * - This file defines ALL routes using <Routes> and <Route>
 * - BrowserRouter is in main.tsx — do NOT add another router here
 * - Use static imports only — no React.lazy()
 */

import { Routes, Route } from 'react-router';
import Index from '@/pages/Index';
import Research from '@/pages/Research';
import People from '@/pages/People';
import Media from '@/pages/Media';
import Participate from '@/pages/Participate';
import Contact from '@/pages/Contact';
import CVPage from './pages/CVPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/research" element={<Research />} />
      <Route path="/people" element={<People />} />
      <Route path="/media" element={<Media />} />
      <Route path="/participate" element={<Participate />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cv" element={<CVPage />} />
    </Routes>
  );
}
