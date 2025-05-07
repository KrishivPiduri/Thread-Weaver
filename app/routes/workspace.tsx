import {useEffect, useState} from 'react';
import Graph from '../../components/Graph';
import Overlay from '../../components/Overlay';
import 'vis-network/styles/vis-network.css';
import React, { Suspense } from 'react';
import { useTopic } from '../../context/TopicContext';
import {Link} from "react-router";
import {useParams} from "react-router-dom";
import {useGraphData} from "../../context/GraphDataContext";

interface NodeType {
    id: number | string;
    label?: string;
    [key: string]: any;
}

interface EdgeType {
    from: number | string;
    to: number | string;
    [key: string]: any;
}

const Workspace: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
    const [loading] = useState<boolean>(false);
    const [topic] = useTopic();
    const {setGraphKey}=useGraphData();
    const [showSurveyPrompt, setShowSurveyPrompt] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSurveyPrompt(true);
        }, 10000); // 10 seconds
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // @ts-ignore
        setGraphKey(id);
    }, []);

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

    const toggleOverlay = () => {
        setIsOverlayVisible((prev) => !prev);
    };

    return (
        <div className="flex flex-col h-screen p-4">
            <nav
                className="fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 flex justify-between items-center z-10">
                <Link to="/generate">
                    <div className="text-xl font-bold text-green-600">
                        AutoMind
                    </div>
                </Link>
                <div className="space-x-6">
                    <Link to="https://www.hackyourgrade.com"
                          className="text-gray-700 hover:text-green-600 font-medium transition">
                        Feynman Helper
                    </Link>
                    <Link to="https://weakspot.hackyourgrade.com" className="text-gray-700 hover:text-green-600 font-medium transition">
                        FlixAI
                    </Link>
                </div>
            </nav>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"/>
                    <p className="text-lg font-medium text-gray-700">
                        Generating graph for "<span className="font-semibold text-blue-600">{topic}</span>"...
                    </p>
                    <p className="mt-2 text-base text-gray-600 max-w-md">
                        This will take a few minutes depending on the size of the map.
                        <br/>
                        <span className="font-bold text-red-600">DO NOT RELOAD!</span> Just trust the process.
                    </p>
                </div>
            ) : (
                <Graph
                    findPath={findPath}
                />
            )}
            {showSurveyPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center">
                        <h2 className="text-xl font-semibold mb-2">Got 30 seconds?</h2>
                        <p className="text-gray-600 mb-4">Help me improve this app by answering 3 quick questions.</p>
                        <div className="flex justify-center space-x-4">
                            <a
                                href="https://your-survey-link.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Sure
                            </a>
                            <button
                                onClick={() => setShowSurveyPrompt(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                            >
                                Maybe later
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isOverlayVisible && <Overlay onClose={toggleOverlay}/>}
        </div>
    );
};

const WorkspacePage: React.FC = () => {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading workspace...</div>}>
            <Workspace/>
        </Suspense>
    );
};

export default WorkspacePage;
