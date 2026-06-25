import { Layout } from '@/components/Layout';
import { ArrowRight } from 'lucide-react';

interface Tier {
  name: string;
  price: string;
  blurb: string;
  perks: string[];
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    blurb: 'Create an account at the door and look inside.',
    perks: ['One free question', 'One room in each hall', 'One thought-experiment to play'],
  },
  {
    name: 'Supporter',
    price: '$5/mo',
    blurb: 'Half covers your conversations; half funds the lab.',
    perks: ['Up to $2.50 of questions / month', 'Every room', 'Every thought-experiment'],
    highlight: true,
  },
  {
    name: 'Patron',
    price: '$10/mo',
    blurb: 'More room to think, more support for the work.',
    perks: ['Up to $5.00 of questions / month', 'Every room', 'Every thought-experiment'],
  },
  {
    name: 'Benefactor',
    price: '$20/mo',
    blurb: 'For those who want to carry the project.',
    perks: ['Up to $10.00 of questions / month', 'Every room', 'Every thought-experiment'],
  },
];

export default function Media() {
  return (
    <Layout>
      <div className="flex flex-col gap-16 pb-20">

        {/* hero */}
        <section className="flex flex-col gap-3 px-6 pt-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">The Experience Machine</h1>
          <p className="text-lg text-[#9DC6D8] max-w-2xl mx-auto">
            Walk into a house in the woods and meet philosophers who will not answer your question —
            they will press it until you can see it more clearly. A project of the Moral Imagination
            and Hope Laboratory.
          </p>
        </section>

        {/* the experience — launched as its own page, not embedded.
            An iframe sandboxes the game's login and blocks Stripe Checkout
            (which refuses to load in a frame), so we open it full-window instead. */}
        <section className="px-4 max-w-6xl w-full mx-auto flex flex-col gap-3">
          <a
            href="/experience-machine.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center gap-5 rounded-xl border border-[#1d4256] bg-gradient-to-b from-[#0e2433] to-[#06121b] shadow-2xl h-[60vh] min-h-[420px] overflow-hidden text-center px-6"
          >
            <span className="text-6xl" aria-hidden="true">🏚️</span>
            <div className="flex flex-col gap-2">
              <span className="text-2xl md:text-3xl font-bold text-white">Step into the woods</span>
              <span className="text-[#9DC6D8] max-w-md mx-auto">
                A path, a house, and the thinkers who live there. The experience opens in its own window.
              </span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#1c87a8] group-hover:bg-[#23a3c9] text-white font-medium px-6 py-3 transition-colors">
              Enter the Experience Machine <ArrowRight className="w-5 h-5" />
            </span>
          </a>
          <p className="text-sm text-[#6B8A99] text-center">
            Opens full-screen in a new tab · Click to look around · WASD to move · E to interact · you'll be asked to make an account when you knock on the door.
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
              opening it directly to the people it's for. A subscription here is really a way of saying
              <em> keep building this</em>. Half of every subscription pays for the conversations you
              have inside — the actual cost of running the philosophers — and the other half goes to the
              lab: developing the curriculum behind the Experience Machine, and funding the community
              philosophy projects MIHLab exists to run.
            </p>
            <p>
              You can always look inside for free. One free question is enough to feel what this is.
              If it's worth more than that to you, the rest is up to you.
            </p>
          </div>
        </section>

        {/* tiers */}
        <section className="px-6 max-w-5xl w-full mx-auto flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white text-center">Choose how you take part</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(TIERS ?? []).map((t) => (
              <div
                key={t.name}
                className={
                  'flex flex-col gap-4 rounded-xl p-6 border ' +
                  (t.highlight ? 'border-[#4DBDD9] bg-[#0e2433]' : 'border-[#1d4256] bg-[#0c1d2a]')
                }
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm uppercase tracking-wide text-[#6ECAE8]">{t.name}</span>
                  <span className="text-2xl font-bold text-white">{t.price}</span>
                </div>
                <p className="text-sm text-[#9DC6D8]">{t.blurb}</p>
                <ul className="flex flex-col gap-2 text-sm text-[#C2D9E4]">
                  {(t.perks ?? []).map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-[#4DBDD9]">·</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="mt-auto rounded-lg px-4 py-2 text-sm font-medium bg-[#163041] text-[#6B8A99] cursor-not-allowed"
                >
                  {t.name === 'Free' ? 'Make an account at the door' : 'Coming soon'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#6B8A99] text-center">
            Paid tiers open once checkout is connected. Your token allowance is a monthly budget — most
            questions cost only a few cents, so the allowance goes a long way.
          </p>
        </section>

      </div>
    </Layout>
  );
}
