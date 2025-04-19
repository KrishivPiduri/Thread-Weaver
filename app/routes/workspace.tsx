import { useState } from 'react';
import Graph from '../../components/Graph';
import Overlay from '../../components/Overlay';
import 'vis-network/styles/vis-network.css';
import React, { Suspense } from 'react';
import { useTopic } from '../../context/TopicContext';
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
    const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
    const [loading] = useState<boolean>(false);
    const [topic] = useTopic();
    const { setNodesData, setEdgesData } = useGraphData();

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
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                        Generating graph for "<span className="font-semibold text-blue-600">{topic}</span>"...
                    </p>
                    <p className="mt-2 text-base text-gray-600 max-w-md">
                        This will take a few minutes depending on the size of the map.
                        <br />
                        <span className="font-bold text-red-600">DO NOT RELOAD!</span> Just trust the process.
                    </p>
                </div>
            ) : (
                <Graph
                    findPath={findPath}
                />
            )}
            {isOverlayVisible && <Overlay onClose={toggleOverlay} />}
        </div>
    );
};

const WorkspacePage: React.FC = () => {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading workspace...</div>}>
            <Workspace />
        </Suspense>
    );
};

export default WorkspacePage;
