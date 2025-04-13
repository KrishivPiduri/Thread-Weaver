// components/Graph.js
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-network/standalone/esm/vis-network';

const Graph = ({ nodesData, edgesData }) => {
    const networkContainerRef = useRef(null);

    useEffect(() => {
        // Ensure nodesData contains label for each node
        const nodes = new DataSet(
            nodesData.map(node => ({
                ...node,
                label: node.label || node.id, // Ensure each node has a label
            }))
        );

        const edges = new DataSet(edgesData);

        const data = {
            nodes: nodes,
            edges: edges,
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 16,
                font: {
                    size: 14,
                    color: '#000000', // Set label color explicitly to black (or any color)
                },
                borderWidth: 2,
                labelHighlightBold: true,
                title: 'node', // Tooltip on hover to show node's label
            },
            edges: {
                font: {
                    size: 12,
                    color: '#000000',
                }, // Customize edge labels
                arrows: { to: { enabled: true, scaleFactor: 0.5 } }, // Optional: add arrow on edges
            },
            physics: {
                enabled: true,
            },
            interaction: {
                tooltipDelay: 200, // Delay before showing the tooltip
            },
        };

        new Network(networkContainerRef.current, data, options);
    }, [nodesData, edgesData]);

    return <div ref={networkContainerRef} className="relative h-full w-full"></div>;
};

export default Graph;
