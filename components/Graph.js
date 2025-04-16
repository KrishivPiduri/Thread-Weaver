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
    const saturation = 70;
    const lightness = 50;

    for (let i = 0; i < n; i++) {
        const hue = Math.round((360 * i) / n);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
}

const Graph = ({ nodesData, edgesData, findPath }) => {
    const networkContainerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    const [summaryData, setSummaryData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const normalizedNodes = nodesData.map((n) => ({
            ...n,
            id: String(n.id),
        }));

        const normalizedEdges = edgesData.map((e) => ({
            ...e,
            from: String(e.from),
            to: String(e.to),
        }));

        const g = new Graphology({ type: 'undirected', multi: true });

        normalizedNodes.forEach((node) => {
            if (node.id) g.addNode(node.id);
        });

        normalizedEdges.forEach((edge) => {
            const from = edge.from;
            const to = edge.to;
            const edgeId = `${from}->${to}`;

            if (g.hasNode(from) && g.hasNode(to)) {
                if (!g.hasEdge(edgeId)) {
                    try {
                        g.addEdgeWithKey(edgeId, from, to);
                    } catch (e) {
                        console.warn(`Failed to add edge ${edgeId}:`, e);
                    }
                }
            }
        });

        const communityMap = louvain(g);
        const numCommunities = new Set(Object.values(communityMap)).size;
        const dynamicColorList = generateDistinctColors(numCommunities);

        const communityColors = {};
        let colorIndex = 0;
        Object.values(communityMap).forEach((communityId) => {
            const group = `community-${communityId}`;
            if (!communityColors[group]) {
                communityColors[group] = dynamicColorList[colorIndex];
                colorIndex++;
            }
        });

        const coloredNodes = normalizedNodes.map((node) => {
            const group = `community-${communityMap[node.id]}`;
            const isHighlighted = node.id === '1';

            return {
                ...node,
                label: node.label || node.id,
                group,
                color: {
                    background: isHighlighted ? '#FFD700' : communityColors[group],
                    border: isHighlighted ? '#FF8C00' : '#333333',
                },
                size: isHighlighted ? 28 : 16,
                font: {
                    size: isHighlighted ? 18 : 14,
                    color: '#000000',
                    bold: isHighlighted,
                },
            };
        });

        nodesRef.current = new DataSet();
        edgesRef.current = new DataSet();

        const data = {
            nodes: nodesRef.current,
            edges: edgesRef.current,
        };

        const options = {
            layout: { improvedLayout: true },
            nodes: {
                shape: 'dot',
                size: 16,
                font: { size: 14, color: '#000000' },
                borderWidth: 2,
                labelHighlightBold: true,
            },
            edges: {
                font: { size: 12, color: '#000000' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                smooth: { enabled: true, type: 'dynamic' },
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.01,
                    springLength: 150,
                    springConstant: 0.08,
                    damping: 0.4,
                    avoidOverlap: 1,
                },
                stabilization: {
                    enabled: true,
                    iterations: 300,
                    updateInterval: 25,
                    fit: true,
                },
            },
            interaction: {
                tooltipDelay: 200,
                hideEdgesOnDrag: false,
                hideNodesOnDrag: false,
            },
        };

        networkRef.current = new Network(networkContainerRef.current, data, options);

        networkRef.current.on('selectNode', async (event) => {
            const selectedNodeId = event.nodes[0];
            const path = findPath(edgesData, selectedNodeId);

            if (!path || path.length === 0) {
                console.warn('No path found to selected node.');
                return;
            }

            const pathString = path.join(',');

            try {
                const response = await fetch(`https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/summerize?path=${encodeURIComponent(pathString)}`);
                const data = await response.json();

                setSummaryData({
                    node: selectedNodeId,
                    summary: data.summary,
                    path,
                });
            } catch (err) {
                console.error('Error fetching summary:', err);
            }
        });

        networkRef.current.on('zoom', (params) => {
            const scale = params.scale;
            networkRef.current.setOptions({
                nodes: { font: { size: 14 / scale } },
                edges: { font: { size: 12 / scale } },
            });
        });

        networkRef.current.once('stabilizationIterationsDone', () => {
            networkRef.current.setOptions({ physics: false });
        });

        nodesRef.current.add(coloredNodes);
        edgesRef.current.add(normalizedEdges);

        return () => {
            networkRef.current?.destroy();
        };
    }, [nodesData, edgesData, findPath]);

    return (
        <div className="flex h-full w-full relative">
            <div ref={networkContainerRef} className="flex-1 h-full relative z-0" />

            {/* Sidebar toggle button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow-md border border-gray-300 hover:bg-gray-100 transition"
            >
                {sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed right-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out z-10 bg-white border-l border-gray-300 shadow-xl p-4 overflow-y-auto ${
                    sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Summary</h2>
                    <Link
                        href="/"
                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                {summaryData ? (
                    <>
                        <h3 className="text-md font-medium mb-1 text-gray-700">Node {summaryData.node}</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{summaryData.summary}</p>
                        <div className="mt-4 text-xs text-gray-500">
                            <strong>Path:</strong> {summaryData.path.join(' → ')}
                        </div>
                    </>
                ) : (
                    <div className="text-sm text-gray-500 italic">Select a node to see its summary.</div>
                )}
            </div>
        </div>
    );
};

export default Graph;
