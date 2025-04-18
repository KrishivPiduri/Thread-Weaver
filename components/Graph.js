'use client';

import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-network/standalone/esm/vis-network';
import Graphology from 'graphology';
import louvain from 'graphology-communities-louvain';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

// Generate distinct HSL colors for communities
function generateDistinctColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.round((360 * i) / n);
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
}

const Graph = ({ nodesData, edgesData, findPath, graphKey, reloadGraph }) => {
    const networkContainerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Initialize network once when data changes
    useEffect(() => {
        // Normalize node/edge IDs to strings
        const normalizedNodes = nodesData.map(n => ({ ...n, id: String(n.id) }));
        const normalizedEdges = edgesData.map(e => ({ ...e, from: String(e.from), to: String(e.to) }));

        // Build graphology graph
        const g = new Graphology({ type: 'undirected', multi: true });
        normalizedNodes.forEach(node => node.id && g.addNode(node.id));
        normalizedEdges.forEach(edge => {
            const key = `${edge.from}->${edge.to}`;
            if (g.hasNode(edge.from) && g.hasNode(edge.to) && !g.hasEdge(key)) {
                g.addEdgeWithKey(key, edge.from, edge.to);
            }
        });

        // Community detection
        const communityMap = louvain(g);
        const count = new Set(Object.values(communityMap)).size;
        const palette = generateDistinctColors(count);
        const communityColors = {};
        normalizedNodes.forEach((node, idx) => {
            const cid = communityMap[node.id];
            if (!communityColors[cid]) communityColors[cid] = palette[idx % palette.length];
        });

        // Prepare nodes with styles
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

        // Initialize vis DataSets
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

        // Destroy previous network
        if (networkRef.current) networkRef.current.destroy();
        // Create new network
        networkRef.current = new Network(networkContainerRef.current, data, options);

        // Node selection event
        networkRef.current.on('selectNode', ({ nodes }) => {
            const sel = nodes[0];
            if (sel !== selectedNode) {
                setSelectedNode(sel);
            }
        });

        // Zoom event for dynamic font
        networkRef.current.on('zoom', ({ scale }) => {
            networkRef.current.setOptions({ nodes: { font: { size: 14 / scale } } });
        });


        // Cleanup
        return () => networkRef.current?.destroy();
    }, [nodesData, edgesData, findPath]);

    // Handle selection: focus and fetch summary
    useEffect(() => {
        if (!selectedNode) return;

        // Focus on selected + neighbors
        networkRef.current.selectNodes([selectedNode]);
        const neighbors = networkRef.current.getConnectedNodes(selectedNode);
        networkRef.current.fit({ nodes: [selectedNode, ...neighbors], animation: { duration: 800, easingFunction: 'easeInOutQuad' } });

        // Fetch summary
        const path = findPath(edgesData, selectedNode);
        if (path?.length) {
            setIsSummaryLoading(true);
            fetch(`https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/summerize?path=${encodeURIComponent(path.join(','))}`)
                .then(res => res.json())
                .then(data => setSummaryData({ node: selectedNode, summary: data.summary, path }))
                .catch(err => console.error(err))
                .finally(() => setIsSummaryLoading(false));
        }
    }, [selectedNode]);

    return (
        <div className="flex h-full w-full relative">
            <div ref={networkContainerRef} className="flex-1 h-full" />

            {/* Sidebar toggle */}
            <button onClick={() => setSidebarOpen(o => !o)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow border hover:bg-gray-100">
                {sidebarOpen ? <ChevronRight /> : <ChevronLeft />}
            </button>

            {/* Summary sidebar */}
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
                        <button
                            onClick={async () => {
                                setIsLoading(true);
                                await fetch(
                                    `https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/expand?topic_path=${encodeURIComponent(summaryData.path.join(' > '))}&expand_node_id=${summaryData.node}&key=${graphKey}`
                                );
                                await reloadGraph();
                                setIsLoading(false);
                            }}
                            disabled={isLoading}
                            className={`w-full py-2 rounded-lg text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? 'Expanding...' : 'Expand'}
                        </button>
                    </>
                ) : (
                    <div className="italic text-gray-500 text-sm">Select a node start expanding the mind map and to see details.</div>
                )}
            </div>
        </div>
    );
};

export default Graph;