import React, {type ChangeEvent, useEffect, useState} from 'react';
import {useGraphData} from "../../context/GraphDataContext";
import { useTopic } from '../../context/TopicContext';
import {Link} from "react-router";
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, where} from "firebase/firestore";
import {db} from "../../firebase";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";


const HomePage: React.FC = () => {
    const [topic, setTopic] = useTopic();
    const { setNodesData, setEdgesData } = useGraphData();
    const { setGraphKey } = useGraphData();
    const { user } = useAuth();
    const [userGraphs, setUserGraphs] = useState<any[]>([]);
    const navigate = useNavigate();
    const handleDeleteGraph = async (graphId: string) => {
        try {
            await deleteDoc(doc(db, 'mindmaps', graphId));
            setUserGraphs(prev => prev.filter(graph => graph.id !== graphId));
        } catch (err) {
            console.error('Error deleting graph:', err);
        }
    };
    const handleGraphSelect = async (graphId: string) => {
        try {
            const ref = doc(db, 'mindmaps', graphId);
            const snapshot = await getDoc(ref);

            if (!snapshot.exists()) throw new Error('Graph not found');

            const data = snapshot.data();

            if (!data?.nodesData || !data?.edgesData) {
                throw new Error('Invalid graph data');
            }

            setNodesData(data.nodesData);
            setEdgesData(data.edgesData);
            setGraphKey(graphId); // NEW
            setTopic(data.topic || '');

            navigate('/workspace');
        } catch (err) {
            console.error('Error loading graph:', err);
        }
    };


    useEffect(() => {
        const fetchUserGraphs = async () => {
            if (!user.uid) return;

            try {
                console.log(user);
                const q = query(collection(db, 'mindmaps'), where('createdBy', '==', user.uid));
                const snapshot = await getDocs(q);
                const graphs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserGraphs(graphs);
            } catch (err) {
                console.error('Error fetching user graphs:', err);
            }
        };

        fetchUserGraphs();
    }, [user]);


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTopic(e.target.value);
    };

    const handleGenerate = () => {
        const fetchData = async () => {
            if (!topic) return;

            try {
                const response = await fetch('https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ root_topic: topic }),
                });

                if (!response.ok) throw new Error('Failed to generate mindmap');

                const result = await response.json();

                if (!result.nodesData || !result.edgesData) {
                    throw new Error('Invalid response: missing nodes or edges data');
                }

                setNodesData(result.nodesData);
                setEdgesData(result.edgesData);

                // Save to Firestore
                const docRef = await addDoc(collection(db, 'mindmaps'), {
                    topic,
                    nodesData: result.nodesData,
                    edgesData: result.edgesData,
                    createdAt: Timestamp.now(),
                    createdBy: user ? user.uid : 'anonymous',
                });

                setGraphKey(docRef.id); // <- Store the key for later use
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    AutoMind
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Generate a mind map from any topic. The more general the topic, the better the results.
                    <br/>
                    <span className="italic">E.g. "Civil War" instead of "Battle of Gettysburg"</span>
                </p>

                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter a Topic
                </label>
                <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={handleChange}
                    name="topic"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="E.g. Feminism, Industrial Revolution, Existentialism"
                />

                <Link to="/workspace">
                    <button
                        type="button"
                        className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-200"
                        onClick={handleGenerate}
                    >
                        Generate Mind Map
                    </button>
                </Link>
            </div>

            {userGraphs.length > 0 && (
                <div className="w-full max-w-md mt-10">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Your Mind Maps</h3>
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {userGraphs.map((graph) => (
                            <li
                                key={graph.id}
                                className="bg-white p-4 rounded-lg shadow border border-gray-200 transition duration-150 hover:bg-gray-50"
                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() => handleGraphSelect(graph.id)}
                                >
                                    <div className="font-medium text-gray-800">{graph.topic || 'Untitled Topic'}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Created {graph.createdAt?.toDate().toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteGraph(graph.id)}
                                    className="mt-2 text-red-500 text-sm hover:underline cursor-pointer"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

    );
};

export default HomePage;
