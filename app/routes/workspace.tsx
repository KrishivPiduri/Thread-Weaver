import { useEffect, useState } from 'react';
import Graph from '../../components/Graph';
import Overlay from '../../components/Overlay';
import 'vis-network/styles/vis-network.css';
import React, { Suspense } from 'react';
import { useTopic } from '../../context/TopicContext';

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
    const [nodesData, setNodesData] = useState<NodeType[]>([]);
    const [edgesData, setEdgesData] = useState<EdgeType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [key, setKey] = useState<string>(''); // This will hold the generated or fetched key for the graph.
    const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(null);
    const [fullNodesData, setFullNodesData] = useState<NodeType[]>([]);
    const [fullEdgesData, setFullEdgesData] = useState<EdgeType[]>([]);
    const [topic] = useTopic();

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

    useEffect(() => {
        const baseUrl = 'https://automindbucket.hackyourgrade.com/';
        const sanitizeKey = (str: string) => str.replace(/\s+/g, '').toLowerCase();

        const startJob = async (): Promise<string> => {
            const response = await fetch('https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ root_topic: topic }),
            });

            if (!response.ok) throw new Error('Failed to start mindmap generation');
            const result = await response.json();
            if (!result.s3_key) throw new Error('Missing s3_key in Lambda response');
            return result.s3_key;
        };

        const pollForResult = async (filename: string) => {
            const fileUrl = `${baseUrl}${filename}`;
            const maxTimeout = 600000;
            const initialInterval = 2000;
            const maxInterval = 30000;
            const startTime = Date.now();
            let attempt = 0;

            while (Date.now() - startTime < maxTimeout) {
                try {
                    const res = await fetch(fileUrl, { cache: 'no-store' });
                    if (res.ok) {
                        const json = await res.json();
                        filterRootAndNeighbors(json.nodesData, json.edgesData);
                        return;
                    }
                } catch {}
                const delay = Math.min(initialInterval * 2 ** attempt, maxInterval);
                await new Promise((resolve) => setTimeout(resolve, delay));
                attempt++;
            }

            throw new Error('Timed out waiting for mindmap file to be available.');
        };

        const fetchData = async () => {
            if (!topic) {
                setError('No topic provided.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const sanitized = sanitizeKey(topic);
                const defaultKey = `${sanitized}.json`;
                setKey(defaultKey);
                const fileUrl = `${baseUrl}${defaultKey}`;

                const checkRes = await fetch(fileUrl, { method: 'HEAD', cache: 'no-store' });

                if (checkRes.ok) {
                    await pollForResult(defaultKey);
                } else {
                    const generatedKey = await startJob();
                    await pollForResult(generatedKey);
                    setKey(generatedKey);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load mindmap. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [topic]);

    const filterRootAndNeighbors = (nodes: NodeType[], edges: EdgeType[]) => {
        setFullNodesData(nodes);
        setFullEdgesData(edges);

        const rootNode = nodes.find((node) => node.id === 1);
        if (!rootNode) return;

        const neighbors = new Set<number | string>();
        edges.forEach((edge) => {
            if (edge.from === 1) neighbors.add(edge.to);
            if (edge.to === 1) neighbors.add(edge.from);
        });

        const filteredNodes = nodes.filter((node) => node.id === 1 || neighbors.has(node.id));
        const filteredEdges = edges.filter(
            (edge) => neighbors.has(edge.from) || neighbors.has(edge.to)
        );

        setNodesData(filteredNodes);
        setEdgesData(filteredEdges);
    };

    const reloadGraph = async () => {
        try {
            const fileUrl = `https://automindbucket.hackyourgrade.com/${key}`;
            const res = await fetch(fileUrl, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to reload graph');
            const json = await res.json();

            setFullNodesData(json.nodesData);
            setFullEdgesData(json.edgesData);

            setNodesData((current) => {
                const have = new Set(current.map((n) => String(n.id)));
                const add = json.nodesData
                    .filter((n: NodeType) => !have.has(String(n.id)))
                    .map((n: NodeType) => ({ ...n, id: String(n.id) }));
                return [...current, ...add];
            });

            setEdgesData((current) => {
                const haveEdge = new Set(current.map((e) => `${e.from}->${e.to}`));
                const addEdge = json.edgesData
                    .filter((e: EdgeType) => !haveEdge.has(`${e.from}->${e.to}`))
                    .map((e: EdgeType) => ({ from: String(e.from), to: String(e.to) }));
                return [...current, ...addEdge];
            });
        } catch (err) {
            console.error('Reload error:', err);
        }
    };

    const handleLocalExpand = (nodeId: number | string, missingNeighborIds: string[]) => {
        const newNodes = fullNodesData
            .filter((n) => missingNeighborIds.includes(String(n.id)))
            .map((n) => ({
                ...n,
                id: String(n.id),
                label: n.label || String(n.id),
            }));

        setNodesData((nd) => [...nd, ...newNodes]);
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
            ) : error ? (
                <div className="flex items-center justify-center h-full text-red-600">
                    <p>{error}</p>
                </div>
            ) : (
                <Graph
                    nodesData={nodesData}
                    edgesData={edgesData}
                    graphKey={key}
                    reloadGraph={reloadGraph}
                    selectedNodeId={selectedNodeId}
                    onLocalExpand={handleLocalExpand}
                    setSelectedNodeId={setSelectedNodeId}
                    findPath={findPath}
                    fullEdgesData={fullEdgesData}
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
