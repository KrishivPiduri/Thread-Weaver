import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Graph from '../../components/Graph';
import {useGraphData} from "../../context/GraphDataContext";
import type {EdgeType} from "vis-network/declarations/network/modules/components/edges";

const EmbedPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const {nodesData, edgesData, setNodesData, setEdgesData} = useGraphData();
    const [error, setError] = useState<string | null>(null);
    const [showSurveyPrompt, setShowSurveyPrompt] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSurveyPrompt(true);
        }, 10000); // 10 seconds
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const loadGraph = async () => {
            try {
                const ref = doc(db, 'mindmaps', id!);
                const snapshot = await getDoc(ref);
                if (!snapshot.exists()) {
                    setError('Mind map not found.');
                    return;
                }

                const data = snapshot.data();
                if (!data?.nodesData || !data?.edgesData) {
                    setError('Incomplete map data.');
                    return;
                }

                setNodesData(data.nodesData);
                setEdgesData(data.edgesData);
            } catch (err) {
                setError('Error loading mind map.');
                console.error(err);
            }
        };

        loadGraph();
    }, [id]);

    function findPath(
        edges: EdgeType[],
        targetId: number | string,
        rootId: number | string = 1,
        nodes: NodeType[] = []
    ): string[] | null {
        const graph: Record<string | number, (string | number)[]> = {};
        const idToLabel: Record<string | number, string> = {};

        nodes.forEach(({ id, label }) => {
            idToLabel[id] = label || String(id);
        });

        edges.forEach(({ from, to }) => {
            if (!graph[from]) graph[from] = [];
            if (!graph[to]) graph[to] = [];
            graph[from].push(to);
            graph[to].push(from);
        });

        const queue: (string | number)[][] = [[rootId]];
        const visited = new Set<string | number>();

        while (queue.length > 0) {
            const path = queue.shift()!;
            const node = path[path.length - 1];

            if (node === targetId) {
                return path.map((id) => idToLabel[id] || String(id));
            }

            if (!visited.has(node)) {
                visited.add(node);
                (graph[node] || []).forEach((neighbor) => {
                    if (!visited.has(neighbor)) {
                        queue.push([...path, neighbor]);
                    }
                });
            }
        }

        return null;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;
    }

    if (!nodesData && !edgesData) {
        return <div className="p-8 text-center text-gray-500">Loading mind map...</div>;
    }

    return (
        <div className="w-full h-screen bg-white">
            <Graph findPath={findPath} />
            {showSurveyPrompt && (
                <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-lg rounded-xl px-6 py-4 z-50 max-w-xs animate-fade-in">
                    <h3 className="text-lg font-semibold mb-1">Got 30 seconds?</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Take a short survey to help improve AutoMind!
                    </p>
                    <div className="flex justify-end space-x-3">
                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSfiSjiRQjmxPQ04jLAtuiS3cKYqxPYIiLVInJfjx3QoOGScjA/viewform?usp=dialog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md text-sm"
                        >
                            Sure
                        </a>
                        <button
                            onClick={() => setShowSurveyPrompt(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            No thanks
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmbedPage;
