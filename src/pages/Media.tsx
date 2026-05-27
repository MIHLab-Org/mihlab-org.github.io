import { Layout } from '@/components/Layout';
import { Gamepad2, BookOpen, Calendar, ExternalLink, Play, FileText } from 'lucide-react';

const gameReviews = [
{
  title: "The Last of Us Part II",
  description: "An exploration of moral complexity through player choice and consequence.",
  tags: ["Narrative Ethics", "Player Agency"]
},
{
  title: "Undertale",
  description: "How pacifist gameplay challenges traditional gaming morality.",
  tags: ["Non-Violence", "Empathy"]
},
{
  title: "Spec Ops: The Line",
  description: "Confronting the player with the weight of virtual violence.",
  tags: ["War Ethics", "Moral Discomfort"]
}];


const bookReviews = [
{
  title: "Games: Agency as Art",
  author: "C. Thi Nguyen",
  description: "A philosophical examination of games as a unique art form."
},
{
  title: "The Art of Game Design",
  author: "Jesse Schell",
  description: "Understanding design choices through an ethical lens."
}];


const events = [
{
  title: "Philosophy & Games Symposium",
  date: "Spring 2025",
  type: "Conference"
},
{
  title: "Art & Ethics Workshop Series",
  date: "Monthly",
  type: "Workshop"
},
{
  title: "Public Philosophy Night",
  date: "Quarterly",
  type: "Public Event"
}];


export default function Media() {
  return (
    <Layout>
      {/* Hero */}
      <section data-ev-id="ev_58ac182500" className="bg-gradient-to-b from-[#8ED4E6] via-[#5DBCD2] to-[#4A9EB5] py-20">
        <div data-ev-id="ev_34b90b37c2" className="max-w-4xl mx-auto px-6 text-center">
          <h1 data-ev-id="ev_bc2e7a82cd" className="text-4xl md:text-5xl font-semibold text-[#1A3A47] mb-6">
            Media
          </h1>
          <p data-ev-id="ev_11e4721cb4" className="text-xl text-[#2C5565] max-w-2xl mx-auto">
            Reviews, papers, and announcements from the lab
          </p>
        </div>
      </section>

      {/* Game Reviews */}
      <section data-ev-id="ev_0b693a4ed4" className="py-20 bg-gradient-to-b from-[#4A9EB5] to-[#5DBCD2]">
        <div data-ev-id="ev_a3f4738ba0" className="max-w-6xl mx-auto px-6">
          <div data-ev-id="ev_7f9d4d0fd5" className="flex items-center justify-center gap-3 mb-12">
            <Gamepad2 className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_ebb9d40c88" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Game Reviews
            </h2>
          </div>
          <p data-ev-id="ev_1390bcef66" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Games with interesting approaches to ethical play
          </p>
          
          <div data-ev-id="ev_84ca75e86d" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameReviews.map((game, index) =>
            <div data-ev-id="ev_18635b7e8c"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg hover:bg-white transition-colors">

                <div data-ev-id="ev_6cb2de0e3c" className="w-12 h-12 bg-[#E8F4F8] rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-[#3AA8C4]" />
                </div>
                <h3 data-ev-id="ev_da1d18b62a" className="text-lg font-semibold text-[#1A3A47] mb-2">
                  {game.title}
                </h3>
                <p data-ev-id="ev_81727191bd" className="text-sm text-[#4A6B78] mb-4">
                  {game.description}
                </p>
                <div data-ev-id="ev_412110f7ed" className="flex flex-wrap gap-2">
                  {game.tags.map((tag, i) =>
                <span data-ev-id="ev_fc9b632c37"
                key={i}
                className="px-2 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded">

                      {tag}
                    </span>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Book Reviews */}
      <section data-ev-id="ev_818843243c" className="py-20 bg-[#5DBCD2]">
        <div data-ev-id="ev_fbac7740d6" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_2dc7276aa7" className="flex items-center justify-center gap-3 mb-12">
            <BookOpen className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_3f361e0598" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Book Reviews
            </h2>
          </div>
          <p data-ev-id="ev_89c2c3581e" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Books on games, music, and identity
          </p>
          
          <div data-ev-id="ev_ae51062064" className="flex flex-col gap-4">
            {bookReviews.map((book, index) =>
            <div data-ev-id="ev_669c52f3f7"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg flex items-start gap-4">

                <FileText className="w-6 h-6 text-[#3AA8C4] flex-shrink-0 mt-1" />
                <div data-ev-id="ev_d62e9d7e82">
                  <h3 data-ev-id="ev_a2dca08665" className="text-lg font-semibold text-[#1A3A47]">
                    {book.title}
                  </h3>
                  <p data-ev-id="ev_0c006aaa36" className="text-sm text-[#3AA8C4] font-medium">
                    by {book.author}
                  </p>
                  <p data-ev-id="ev_d08855a8bd" className="text-sm text-[#4A6B78] mt-2">
                    {book.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Events */}
      <section data-ev-id="ev_8ba4f129ff" className="py-20 bg-gradient-to-b from-[#5DBCD2] to-[#4A9EB5]">
        <div data-ev-id="ev_d28a61a779" className="max-w-4xl mx-auto px-6">
          <div data-ev-id="ev_90b009d271" className="flex items-center justify-center gap-3 mb-12">
            <Calendar className="w-8 h-8 text-[#1A3A47]" />
            <h2 data-ev-id="ev_2bff03d971" className="text-2xl md:text-3xl font-semibold text-[#1A3A47]">
              Events
            </h2>
          </div>
          <p data-ev-id="ev_48253f478a" className="text-center text-[#2C5565] mb-10 max-w-xl mx-auto">
            Conferences, workshops, and gatherings related to art and identity
          </p>
          
          <div data-ev-id="ev_2e096ca0b8" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, index) =>
            <div data-ev-id="ev_94ec6ee932"
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg text-center">

                <span data-ev-id="ev_f258471cf5" className="inline-block px-3 py-1 bg-[#E8F4F8] text-[#3AA8C4] text-xs font-medium rounded-full mb-4">
                  {event.type}
                </span>
                <h3 data-ev-id="ev_d8b7d3559e" className="text-lg font-semibold text-[#1A3A47] mb-2">
                  {event.title}
                </h3>
                <p data-ev-id="ev_a85ffa84d2" className="text-sm text-[#4A6B78]">
                  {event.date}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>);

}