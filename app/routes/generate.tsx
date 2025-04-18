import React, {type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTopic } from '../../context/TopicContext';

const HomePage: React.FC = () => {
    const [topic, setTopic] = useTopic();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">
                    AutoMind - Topic Mind Map Generator
                </h1>
                <h5 className="text-xs font-medium text-gray-600 mb-6 text-center">
                    The more general the topic, the better the map. E.g. Search "Civil war" rather than "Battle of Gettysburg"
                </h5>
                <div className="mb-4">
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                        Enter a Topic
                    </label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={handleChange}
                        name="topic"
                        className="w-full p-3 mt-2 border border-gray-300 rounded-md text-gray-400"
                        placeholder="E.g. Feminism, Industrial Revolution, Existentialism"
                    />
                </div>
                <Link to="/workspace">
                    <button
                        type="button"
                        className="w-full py-3 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                        Generate Mind Map
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
