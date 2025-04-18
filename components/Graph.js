'use client';

import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-network/standalone/esm/vis-network';
import Graphology from 'graphology';
import louvain from 'graphology-communities-louvain';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

function generateDistinctColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.round((360 * i) / n);
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

const Graph = ({ nodesData, edgesData, findPath, graphKey, reloadGraph, fullEdgesData, onLocalExpand }) => {
    const networkContainerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);


    useEffect(() => {
        const normalizedNodes = nodesData.map(n => ({ ...n, id: String(n.id) }));
        const normalizedEdges = edgesData.map(e => ({ ...e, from: String(e.from), to: String(e.to), label: "" }));

        const g = new Graphology({ type: 'undirected', multi: true });
        normalizedNodes.forEach(node => node.id && g.addNode(node.id));
        normalizedEdges.forEach(edge => {
            const key = `${edge.from}->${edge.to}`;
            if (g.hasNode(edge.from) && g.hasNode(edge.to) && !g.hasEdge(key)) {
                g.addEdgeWithKey(key, edge.from, edge.to);
            }
        });

        const communityMap = louvain(g);
        const count = new Set(Object.values(communityMap)).size;
        const palette = generateDistinctColors(count);
        const communityColors = {};
        normalizedNodes.forEach((node, idx) => {
            const cid = communityMap[node.id];
            if (!communityColors[cid]) communityColors[cid] = palette[idx % palette.length];
        });

        const styledNodes = normalizedNodes.map(node => ({
            ...node,
            label: node.label || node.id,
            color: {
                background: node.id === '1' ? '#FFD700' : communityColors[communityMap[node.id]],
                border: node.id === '1' ? '#FF8C00' : '#333333'
            },
            size: node.id === '1' ? 28 : 16,
            font: { size: node.id === '1' ? 18 : 14, color: '#000', bold: node.id === '1' }
        }));

        nodesRef.current = new DataSet(styledNodes);
        edgesRef.current = new DataSet(normalizedEdges);

        const data = { nodes: nodesRef.current, edges: edgesRef.current };
        const options = {
            layout: { improvedLayout: true },
            nodes: { shape: 'dot', borderWidth: 2 },
            edges: { smooth: { type: 'dynamic' }, arrows: { to: { enabled: true, scaleFactor: 0.5 } } },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: { gravitationalConstant: -50, centralGravity: 0.01, springLength: 150, springConstant: 0.08, damping: 0.4, avoidOverlap: 1 },
                stabilization: { enabled: true, iterations: 300, updateInterval: 25, fit: true }
            },
            interaction: {
                tooltipDelay: 200,
                dragNodes: true,
                dragView: true
            },
        };

        if (networkRef.current) networkRef.current.destroy();
        networkRef.current = new Network(networkContainerRef.current, data, options);

        networkRef.current.on('selectNode', ({ nodes }) => {
            const sel = nodes[0];
            if (sel !== selectedNode) {
                setSelectedNode(sel);
            }
        });

        networkRef.current.on('zoom', ({ scale }) => {
            networkRef.current.setOptions({ nodes: { font: { size: 14 / scale } } });
        });

        return () => networkRef.current?.destroy();
    }, [nodesData, edgesData, findPath]);

    useEffect(() => {
        if (!selectedNode || !findPath) return;

        networkRef.current.selectNodes([selectedNode]);
        const neighbors = networkRef.current.getConnectedNodes(selectedNode);
        networkRef.current.fit({ nodes: [selectedNode, ...neighbors], animation: { duration: 800, easingFunction: 'easeInOutQuad' } });

        const nodeIdToLabel = {};
        nodesData.forEach(({ id, label }) => nodeIdToLabel[id] = label);

        const path = findPath(edgesRef.current.get(), selectedNode);
        if (path?.length) {
            const labelPath = path.map(id => nodeIdToLabel[id] || id);
            setIsSummaryLoading(true);
            fetch(`https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/summerize?path=${encodeURIComponent(labelPath.join(','))}`)
                .then(res => res.json())
                .then(data => setSummaryData({ node: selectedNode, summary: data.summary, path: labelPath }))
                .catch(err => console.error(err))
                .finally(() => setIsSummaryLoading(false));
        }
    }, [selectedNode]);

    const handleExpand = async () => {
        if (!selectedNode || !summaryData) return;
        setIsLoading(true);

        const fullNeighbors = fullEdgesData.reduce((acc, edge) => {
            const from = String(edge.from), to = String(edge.to);
            if (from === selectedNode) acc.add(to);
            else if (to === selectedNode) acc.add(from);
            return acc;
        }, new Set());

        const currentIds = new Set(nodesData.map(n => String(n.id)));
        const missing = [...fullNeighbors].filter(id => !currentIds.has(id));

        if (missing.length > 0) {
            // Check if the edges already exist before expanding
            const existingEdges = new Set(edgesData.map(e => `${e.from}->${e.to}`));
            const newEdges = missing.filter(id => {
                const newEdges = fullEdgesData.filter(e => e.from === selectedNode && e.to === id || e.to === selectedNode && e.from === id);
                return newEdges.every(e => !existingEdges.has(`${e.from}->${e.to}`));
            });

            if (newEdges.length > 0) {
                onLocalExpand(selectedNode, missing);
                setIsLoading(false);
                return;
            }
        }

        try {
            const url = new URL("https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/expand");
            url.searchParams.set("topic_path", summaryData.path.join(" > "));
            url.searchParams.set("expand_node_id", selectedNode);
            url.searchParams.set("key", graphKey);
            onLocalExpand(selectedNode, missing);

            const res = await fetch(url.toString());
            if (!res.ok) console.error("Expand API error", res.status);
            else await reloadGraph();
        } catch (err) {
            console.error("Expand failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full w-full relative">
            <div ref={networkContainerRef} className="flex-1 h-full" />

            <button onClick={() => setSidebarOpen(o => !o)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow border hover:bg-gray-100">
                {sidebarOpen ? <ChevronRight /> : <ChevronLeft />}
            </button>

            <div className={`fixed right-0 top-0 h-full w-80 bg-white p-4 shadow-lg border-l transform transition ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Summary</h2>
                    <Link href="/" className="text-blue-600 hover:underline text-sm flex items-center gap-1"><Home className="w-4 h-4"/>Back</Link>
                </div>

                {isSummaryLoading ? (
                    <div className="text-center text-gray-600">Loading summary...</div>
                ) : summaryData ? (
                    <>
                        <h3 className="font-medium mb-2">Node {summaryData.node}</h3>
                        <p className="text-sm whitespace-pre-wrap mb-2">{summaryData.summary}</p>
                        <div className="text-xs text-gray-500 mb-4"><strong>Path:</strong> {summaryData.path.join(' → ')}</div>
                        {!edgesData.some(e =>
                            String(e.from) === selectedNode &&
                            nodesData.some(n => String(n.id) === String(e.to))
                        ) && (
                            <button
                                onClick={handleExpand}
                                disabled={isLoading}
                                className={`w-full py-2 rounded-lg text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} cursor-pointer`}
                            >
                                {isLoading ? 'Expanding...' : 'Expand'}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="italic text-gray-500 text-sm">Select a node start expanding the mind map and to see
                        details.</div>
                )}
            </div>
        </div>
    );
};

export default Graph;