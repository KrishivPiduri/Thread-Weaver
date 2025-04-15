// components/Graph.js
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

const Graph = ({ nodesData, edgesData }) => {
    const networkContainerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    useEffect(() => {
        // Build graphology graph for clustering
        const g = new Graphology();

        nodesData.forEach((node) => g.addNode(node.id));
        edgesData.forEach((edge) => g.addEdge(edge.from, edge.to));

        const communityMap = louvain(g);

        // Assign each node a group based on its community
        const coloredNodes = nodesData.map((node) => ({
            ...node,
            label: node.label || node.id,
            group: `community-${communityMap[node.id]}`,
        }));

        // Generate a list of distinct colors for communities
        const numCommunities = new Set(Object.values(communityMap)).size;
        const dynamicColorList = generateDistinctColors(numCommunities);

        // Create a color mapping for communities
        const communityColors = {};
        let colorIndex = 0;

        // Assign a distinct color to each community
        coloredNodes.forEach((node) => {
            const group = node.group;
            if (!communityColors[group]) {
                communityColors[group] = dynamicColorList[colorIndex];
                colorIndex++;
            }
            node.color = {
                background: communityColors[group],
                border: '#333333',
            };
        });

        nodesRef.current = new DataSet();
        edgesRef.current = new DataSet();

        const data = {
            nodes: nodesRef.current,
            edges: edgesRef.current,
        };

        const options = {
            layout: {
                improvedLayout: true,
            },
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
                smooth: {
                    enabled: true,
                    type: 'dynamic',
                },
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

        networkRef.current.on('selectNode', (event) => {
            const selectedNodeId = event.nodes[0];
            window.dispatchEvent(new CustomEvent('nodeSelected', { detail: selectedNodeId }));
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

        // Update data
        nodesRef.current.add(coloredNodes);
        edgesRef.current.add(edgesData);

        return () => {
            networkRef.current?.destroy();
        };
    }, [nodesData, edgesData]);

    return <div ref={networkContainerRef} className="relative h-full w-full flex-4"></div>;
};

export default Graph;
