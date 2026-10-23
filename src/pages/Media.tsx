import { useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ArrowRight, Heart } from 'lucide-react';

// Where the "Leave a tip" button goes (a Stripe Payment Link, Ko-fi, PayPal.me, etc.).
// Empty = the button shows "Tip link coming soon" and points people to email instead.
// Subscriptions come later, once the business licensing is in place.
const TIP_URL = '';

export default function Media() {
  // The Unity build (served from /play/) loads only when the visitor clicks the box:
  // it is ~54 MB and needs ~1 GB of memory, so it shouldn't load just from viewing the page.
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const goFullscreen = () => {
    const frame = frameRef.current;
    if (frame && frame.requestFullscreen) frame.requestFullscreen().catch(() => {});
  };

  return (
    <Layout>
      <div className="flex flex-col gap-16 pb-20">

        {/* hero */}
        <section className="flex flex-col gap-3 px-6 pt-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">The Experience Machine</h1>
          <p className="text-lg text-[#9DC6D8] max-w-2xl mx-auto">
            The Experience Machine is a game about thinking well. You walk through a forest with
            Socrates and meet philosophers who won't hand you answers; they press your questions until
            you can see them more clearly. The first conversation is drawn from Plato's{' '}
            <em>Phaedrus</em>, which we read as a defense of critical reflection: not a habit for the
            classroom alone, but a lens for everything, from what we love to whom we trust and how we
            are persuaded. From there the map opens onto metaphysics, knowledge, mind and value, laid out
            the way philosophers organize the field. A project of the Moral Imagination and Hope
            Laboratory.
          </p>
        </section>

        {/* the experience — the Unity WebGL build from /play/, embedded in this box.
            (The earlier browser-built version, /experience-machine.html, opened in its own
            window because a frame blocked its login and Stripe Checkout; the Unity build
            has neither.) ?embed=1 makes the Unity page fill the frame. */}
        <section className="px-4 max-w-6xl w-full mx-auto flex flex-col gap-3">
          {playing ? (
            <div className="relative rounded-xl border border-[#1d4256] bg-[#06121b] shadow-2xl h-[60vh] min-h-[420px] overflow-hidden">
              <iframe
                ref={frameRef}
                src="/play/?embed=1"
                title="The Experience Machine"
                className="absolute inset-0 w-full h-full border-0"
                allow="fullscreen; autoplay; gamepad; xr-spatial-tracking"
                allowFullScreen
              />
            </div>
          ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative flex flex-col items-center justify-center gap-5 rounded-xl border border-[#1d4256] bg-gradient-to-b from-[#0e2433] to-[#06121b] shadow-2xl h-[60vh] min-h-[420px] overflow-hidden text-center px-6 w-full cursor-pointer"
          >
            <span className="text-6xl" aria-hidden="true">🏚️</span>
            <div className="flex flex-col gap-2">
              <span className="text-2xl md:text-3xl font-bold text-white">Step into the woods</span>
              <span className="text-[#9DC6D8] max-w-md mx-auto">
                A path, a house, and the thinkers who live there. The experience loads right here.
              </span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#1c87a8] group-hover:bg-[#23a3c9] text-white font-medium px-6 py-3 transition-colors">
              Enter the Experience Machine <ArrowRight className="w-5 h-5" />
            </span>
          </button>
          )}
          <p className="text-sm text-[#6B8A99] text-center">
            Click inside to look around · WASD to move · arrow keys to turn · E to talk · F to continue the conversation
            {playing && (
              <>
                {' · '}
                <button type="button" onClick={goFullscreen} className="underline hover:text-[#9DC6D8] cursor-pointer">
                  Full screen
                </button>
              </>
            )}
            {' · '}
            <a href="/play/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#9DC6D8]">
              Open in a new tab
            </a>
          </p>
        </section>

        {/* why support it */}
        <section className="px-6 max-w-3xl mx-auto flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-white">Why this is asking for your support</h2>
          <div className="flex flex-col gap-4 text-[#C2D9E4] leading-relaxed">
            <p>
              The Experience Machine grew out of a simple idea: that the best way to learn to think
              philosophically isn't to be lectured at, but to be dropped inside a living question and
              given good company to think alongside. We first tried this by teaching philosophy through
              games — building courses around virtual worlds — and the response convinced us it was
              worth doing for real.
            </p>
            <p>
              We have not been able to fund that work through the usual routes. Rather than wait, we're
              opening it directly to the people it's for. A tip here is really a way of saying
              <em> keep building this</em>. Tips go to the lab: developing the curriculum behind the
              Experience Machine, and funding the community philosophy projects MIHLab exists to run.
            </p>
            <p>
              The Experience Machine is free to play. If it's worth something to you, the rest is up
              to you.
            </p>
          </div>
        </section>

        {/* tip */}
        <section className="px-6 max-w-3xl w-full mx-auto flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold text-white">Leave a tip</h2>
          <p className="text-[#9DC6D8] max-w-xl">
            Any amount helps keep the Experience Machine growing. There are no tiers and nothing is
            locked; everyone gets the whole game.
          </p>
          {TIP_URL ? (
            <a
              href={TIP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1c87a8] hover:bg-[#23a3c9] text-white font-medium px-6 py-3 transition-colors"
            >
              <Heart className="w-5 h-5" /> Leave a tip
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium bg-[#163041] text-[#6B8A99] cursor-not-allowed">
              <Heart className="w-5 h-5" /> Tip link coming soon
            </span>
          )}
          <p className="text-xs text-[#6B8A99]">
            Questions or another way to help? Email{' '}
            <a href="mailto:montaque@mihlab.org" className="underline hover:text-[#9DC6D8]">montaque@mihlab.org</a>.
          </p>
        </section>

      </div>
    </Layout>
  );
}
