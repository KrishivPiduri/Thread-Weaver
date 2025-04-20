import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Explore Any Topic Visually" },
    { name: "description", content: "Take a self-guided tour through any topic with interactive visual mind maps." },
  ];
}

export default function LandingPage() {
  return (
      <div className="w-full overflow-x-hidden text-gray-800">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-24 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Take a Self-Guided Tour Through Any Topic</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Whether you're diving into history, science, or any subject in between — explore, discover, and learn through interactive mind maps built just for you.
          </p>
          <Link to="/generate">
          <span className="mt-8 px-6 py-3 text-lg font-semibold bg-white text-indigo-700 hover:bg-gray-100 rounded-md inline-block">
            Begin Your Tour →
          </span>
          </Link>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">How Your Tour Works</h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-2">🔍 Choose a Topic</h3>
                <p>
                  Start your journey by entering a topic you're curious about — anything from the Renaissance to quantum mechanics.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">🗺️ Get Your Map</h3>
                <p>
                  Instantly receive a personalized visual map, breaking the topic down into key concepts, themes, and connections.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">🧭 Navigate Deeper</h3>
                <p>
                  Click on nodes to dive deeper, uncovering layers of detail and insights as you explore at your own pace.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">🎓 Learn by Exploring</h3>
                <p>
                  This isn't studying — it's an adventure. Visualize knowledge, connect ideas, and absorb information naturally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10">Who It's For</h2>
            <ul className="grid md:grid-cols-3 gap-6 text-left text-lg font-medium">
              <li>🎒 Curious learners charting their own path</li>
              <li>🧠 Students prepping for exams or deep dives</li>
              <li>🗂️ Professionals unpacking complex topics</li>
              <li>🧑‍🏫 Educators building visual lesson journeys</li>
              <li>🔍 Researchers making sense of big ideas</li>
              <li>🌐 Anyone who learns by seeing and exploring</li>
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 px-6 bg-indigo-100 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Tour Today</h2>
          <p className="text-lg mb-6">
            Generate interactive maps that guide you through any subject — one idea at a time.
          </p>
          <Link to="/generate">
          <span className="text-lg px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md inline-block">
            Explore a Topic
          </span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="bg-gray-100 text-gray-600 text-sm text-center py-6 border-t">
          <p>
            Created by <a href="https://krishivpiduri.com" target="_blank"
                          className="text-indigo-600 hover:underline">Krishiv</a> and <a
              href="https://www.linkedin.com/in/deepika-nathany-a5a96638/" target="_blank"
              className="text-indigo-600 hover:underline">Deepika</a> • © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
  );
}
