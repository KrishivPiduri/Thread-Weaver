'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Graph from '../../components/Graph';
import Overlay from '../../components/Overlay';
import '@/app/globals.css';
import 'vis-network/styles/vis-network.css';
import React, { Suspense } from 'react';



const Workspace = () => {
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [nodesData, setNodesData] = useState([]);
    const [edgesData, setEdgesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [key, setKey] = useState(''); // This will hold the generated or fetched key for the graph.
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [fullNodesData, setFullNodesData] = useState([]);
    const [fullEdgesData, setFullEdgesData] = useState([]);

    function findPath(edges, targetId, rootId = 1, nodes = []) {
        const graph = {};
        const idToLabel = {};

        nodes.forEach(({ id, label }) => {
            idToLabel[id] = label;
        });

        edges.forEach(({ from, to }) => {
            if (!graph[from]) graph[from] = [];
            if (!graph[to]) graph[to] = [];
            graph[from].push(to);
            graph[to].push(from); // undirected graph
        });

        const queue = [[rootId]];
        const visited = new Set();

        while (queue.length > 0) {
            const path = queue.shift();
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

    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');

    const toggleOverlay = () => {
        setIsOverlayVisible(prev => !prev);
    };

    useEffect(() => {

        const baseUrl = 'https://automindbucket.hackyourgrade.com/';
        const sanitizeKey = (str) => str.replace(/\s+/g, '').toLowerCase();

        const startJob = async () => {
            try {
                const response = await fetch('https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ root_topic: topic }),
                });

                if (!response.ok) throw new Error('Failed to start mindmap generation');
                const result = await response.json();
                console.log('Mindmap job started:', result);

                if (!result.s3_key) throw new Error('Missing s3_key in Lambda response');
                return result.s3_key;
            } catch (err) {
                console.error('Error triggering Lambda:', err);
                throw err;
            }
        };

        const pollForResult = async (filename) => {
            const fileUrl = `${baseUrl}${filename}`;
            const maxTimeout = 600000; // 10 minutes
            const initialInterval = 2000; // 2 seconds
            const maxInterval = 30000; // cap backoff at 30 seconds
            const startTime = Date.now();

            let attempt = 0;

            while (Date.now() - startTime < maxTimeout) {
                try {
                    const res = await fetch(fileUrl, { cache: 'no-store' });
                    if (res.ok) {
                        const json = await res.json();
                        // Only keep root node and its immediate neighbors
                        filterRootAndNeighbors(json.nodesData, json.edgesData);
                        return;
                    }
                } catch (e) {
                    // Log if needed: console.warn('Fetch attempt failed', e);
                }

                // Exponential backoff with cap
                const delay = Math.min(initialInterval * (2 ** attempt), maxInterval);
                await new Promise(resolve => setTimeout(resolve, delay));
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

                var key = `${sanitizeKey(topic)}.json`; // Generate the key here
                setKey(key); // Store the key for use later
                const fileUrl = `${baseUrl}${key}`;

                // 🔍 Check if file already exists
                const checkRes = await fetch(fileUrl, { method: 'HEAD', cache: 'no-store' });

                if (checkRes.ok) {
                    // File already exists — just poll and use it
                    console.log('Mindmap already exists, skipping Lambda call.');
                    await pollForResult(key);
                } else {
                    // File doesn't exist — trigger Lambda and poll
                    const generatedKey = await startJob();
                    await pollForResult(generatedKey);
                    setKey(generatedKey); // Set the new key
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

    // Function to filter out root node and its immediate neighbors
    const filterRootAndNeighbors = (nodes, edges) => {
        setFullNodesData(nodes)
        setFullEdgesData(edges)
        // Find root node (assuming root node id = 1)
        const rootNode = nodes.find((node) => node.id === 1);
        if (!rootNode) return; // If no root node, return early

        // Get all the neighbors of the root node
        const neighbors = new Set();
        edges.forEach(edge => {
            if (edge.from === 1) neighbors.add(edge.to);
            if (edge.to === 1) neighbors.add(edge.from);
        });

        // Filter nodes to only include the root node and its immediate neighbors
        const filteredNodes = nodes.filter(node => node.id === 1 || neighbors.has(node.id));
        const filteredEdges = edges.filter(
            edge => neighbors.has(edge.from) || neighbors.has(edge.to)
        );

        setNodesData(filteredNodes);
        setEdgesData(filteredEdges);
    };

    const reloadGraph = async () => {
        try {
            const fileUrl = `https://automindbucket.hackyourgrade.com/${key}`;
            const res     = await fetch(fileUrl, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to reload graph');
            const json = await res.json();

            // Update full references
            setFullNodesData(json.nodesData);
            setFullEdgesData(json.edgesData);

            // Merge new nodes
            setNodesData(current => {
                const have = new Set(current.map(n => String(n.id)));
                const add  = json.nodesData
                    .filter(n => !have.has(String(n.id)))
                    .map(n => ({ ...n, id: String(n.id) }));
                return [...current, ...add];
            });

            // Merge new edges
            setEdgesData(current => {
                const haveEdge = new Set(current.map(e => `${e.from}->${e.to}`));
                const addEdge = json.edgesData
                    .filter(e => !haveEdge.has(`${e.from}->${e.to}`))
                    .map(e => ({ from: String(e.from), to: String(e.to) }));
                return [...current, ...addEdge];
            });
        } catch (err) {
            console.error('Reload error:', err);
        }
    };

    // inside Workspace component, alongside reloadGraph:
    const handleLocalExpand = (nodeId, missingNeighborIds) => {
        // 1) pull just those nodes & edges out of the “full” sets
        const newNodes = fullNodesData
            .filter(n => missingNeighborIds.includes(String(n.id)))
            .map(n => ({
                ...n,
                id: String(n.id),
                label: n.label || String(n.id),
            }));

        // 2) merge into the existing state
        setNodesData(nd => [...nd, ...newNodes]);
    };

    return (
        <div className="flex flex-col h-screen p-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"/>
                    <p className="text-lg font-medium text-gray-700">
                        Generating graph for "<span className="font-semibold text-blue-600">{topic}</span>"...
                    </p>
                    <p className="mt-2 text-base text-gray-600 max-w-md">
                        This will take a few minutes depending on the size of the map.<br/>
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
                    graphKey={key} // Pass the key here to the Graph component
                    reloadGraph={reloadGraph}
                    selectedNodeId={selectedNodeId}
                    onLocalExpand={handleLocalExpand}
                    setSelectedNodeId={setSelectedNodeId}
                    findPath={findPath}
                    fullEdgesData={fullEdgesData}
                />
            )}
            {isOverlayVisible && <Overlay onClose={toggleOverlay}/>}
        </div>
    );
};

export default function WorkspacePage() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading workspace...</div>}>
            <Workspace />
        </Suspense>
    );
}
