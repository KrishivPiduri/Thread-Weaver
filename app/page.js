'use client';

import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="w-full overflow-x-hidden text-gray-800">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-24 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">Master Any Subject with Visual Mind Maps</h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto">
                    Struggling with complex topics? Our app helps you visualize key concepts, relationships, and details to enhance your understanding and learning process.
                </p>
                <Link href="/generate.html">
          <span className="mt-8 px-6 py-3 text-lg font-semibold bg-white text-indigo-700 hover:bg-gray-100 rounded-md inline-block">
            Try It Now →
          </span>
                </Link>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">📚 Enter a Topic</h3>
                            <p>
                                Whether it's a historical event, scientific concept, or any subject you're studying, simply type the topic into the app.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">🧠 Visualize Key Concepts</h3>
                            <p>
                                Instantly generate a mind map that breaks down the topic into its essential concepts, definitions, and relationships.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">📌 Explore Details</h3>
                            <p>
                                Click on any node in the mind map to explore more detailed information about that concept, helping you understand the material better.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">🚀 Boost Your Learning</h3>
                            <p>
                                By seeing topics visually and understanding how ideas are connected, you can retain information faster and more effectively.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-10">Perfect for:</h2>
                    <ul className="grid md:grid-cols-3 gap-6 text-left text-lg font-medium">
                        <li>📚 Students studying for exams</li>
                        <li>🔬 Learners tackling complex subjects</li>
                        <li>🌍 Anyone looking to break down intricate topics</li>
                        <li>🧑‍🏫 Teachers creating interactive lesson plans</li>
                        <li>🔍 Researchers connecting ideas and theories</li>
                        <li>⚙️ Anyone interested in visual learning</li>
                    </ul>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 px-6 bg-indigo-100 text-center">
                <h2 className="text-3xl font-bold mb-4">See Your Learning Come to Life</h2>
                <p className="text-lg mb-6">Easily generate mind maps to help you grasp any subject, from historical events to scientific principles.</p>
                <Link href="/generate.html">
          <span className="text-lg px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md inline-block">
            Start Exploring Now
          </span>
                </Link>
            </section>

            {/* Testimonials */}
            {/*<section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-10">What Students are Saying</h2>
                    <blockquote className="italic text-gray-700 text-lg mb-4">“This mind map helped me better understand the causes of the Civil War in my APUSH class. The visual layout made everything click!”</blockquote>
                    <p className="text-sm text-gray-500">– Sarah L., APUSH Student</p>
                </div>
            </section>*/}

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
