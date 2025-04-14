'use client';

import React, { useState } from 'react';
import { redirect } from 'next/navigation'

function HomePage() {
    const [topic, setTopic] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (topic.trim()) {
            // Redirect to /workspace with the topic as a URL parameter
            redirect(`/workspace?topic=${encodeURIComponent(topic)}`);
        } else {
            alert('Please enter a topic!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">AutoMind - Topic Mind Map Generator</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Enter a Topic</label>
                        <input
                            type="text"
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                            placeholder="E.g. Feminism, Industrial Revolution, Existentialism"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                        Generate Mind Map
                    </button>
                </form>
            </div>
        </div>
    );
}

export default HomePage;
