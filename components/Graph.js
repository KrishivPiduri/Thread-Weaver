'use client';

import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-network/standalone/esm/vis-network';
import Graphology from 'graphology';
import louvain from 'graphology-communities-louvain';

// Function to generate distinct colors using HSL
function generateDistinctColors(n) {
    const colors = [];
    const saturation = 70; // %
    const lightness = 50;  // %

    for (let i = 0; i < n; i++) {
        const hue = Math.round((360 * i) / n); // even hue steps
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
}

const Graph = ({ nodesData, edgesData, findPath }) => {
    const networkContainerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    useEffect(() => {
        // Normalize node IDs to strings
        const normalizedNodes = nodesData.map((n) => ({
            ...n,
            id: String(n.id),
        }));

        const normalizedEdges = edgesData.map((e) => ({
            ...e,
            from: String(e.from),
            to: String(e.to),
        }));

        // Use a multigraph to allow multiple edges between same nodes (if needed)
        const g = new Graphology({ type: 'undirected', multi: true });

        // Add nodes
        normalizedNodes.forEach((node) => {
            if (node.id) g.addNode(node.id);
        });

        // Add edges with unique IDs
        normalizedEdges.forEach((edge) => {
            const from = edge.from;
            const to = edge.to;

            if (g.hasNode(from) && g.hasNode(to)) {
                const edgeId = `${from}->${to}`;
                if (!g.hasEdge(edgeId)) {
                    try {
                        g.addEdgeWithKey(edgeId, from, to);
                    } catch (e) {
                        console.warn(`Failed to add edge ${edgeId}:`, e);
                    }
                }
            } else {
                console.warn('Skipping edge due to missing node:', edge);
            }
        });

        // Detect communities
        const communityMap = louvain(g);
        const numCommunities = new Set(Object.values(communityMap)).size;
        const dynamicColorList = generateDistinctColors(numCommunities);

        // Assign colors to each community
        const communityColors = {};
        let colorIndex = 0;
        Object.values(communityMap).forEach((communityId) => {
            const group = `community-${communityId}`;
            if (!communityColors[group]) {
                communityColors[group] = dynamicColorList[colorIndex];
                colorIndex++;
            }
        });

        // Build coloredNodes
        const coloredNodes = normalizedNodes.map((node) => {
            const group = `community-${communityMap[node.id]}`;
            const isHighlighted = node.id === '1'; // ID is a string

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
                title: 'node',
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

        // Create network
        networkRef.current = new Network(networkContainerRef.current, data, options);

        // Attach event listeners
        networkRef.current.on('selectNode', async (event) => {
            const selectedNodeId = event.nodes[0];
            const path = findPath(edgesData, selectedNodeId);

            if (!path || path.length === 0) {
                console.warn('No path found to selected node.');
                return;
            }

            // Convert path to a string for API call
            const pathString = path.join(',');

            try {
                // Replace this with your actual API Gateway URL
                const response = await fetch(`https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/summerize?path=${encodeURIComponent(pathString)}`);
                const data = await response.json();

                console.log('Summary from OpenAI:', data.summary);

                window.dispatchEvent(new CustomEvent('nodeSelected', {
                    detail: { selectedNodeId, pathFromRoot: path, summary: data.summary },
                }));
            } catch (err) {
                console.error('Error fetching summary:', err);
            }
        });

        networkRef.current.on('zoom', (params) => {
            const scale = params.scale;
            const nodeFontSize = 14 / scale;
            const edgeFontSize = 12 / scale;

            networkRef.current.setOptions({
                nodes: {
                    font: { size: nodeFontSize },
                },
                edges: {
                    font: { size: edgeFontSize },
                },
            });
        });

        networkRef.current.once('stabilizationIterationsDone', () => {
            networkRef.current.setOptions({ physics: false });
        });

        // Populate data
        nodesRef.current.add(coloredNodes);
        edgesRef.current.add(normalizedEdges);

        return () => {
            networkRef.current?.destroy();
        };
    }, [nodesData, edgesData, findPath]);

    return <div ref={networkContainerRef} className="relative h-full w-full flex-4"></div>;
};

export default Graph;
