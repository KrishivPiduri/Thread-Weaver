// components/Graph.js
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-network/standalone/esm/vis-network';

const Graph = ({ nodesData, edgesData }) => {
    const networkContainerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(null);
    const edgesRef = useRef(null);

    useEffect(() => {
        nodesRef.current = new DataSet();
        edgesRef.current = new DataSet();

        const data = {
            nodes: nodesRef.current,
            edges: edgesRef.current,
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 16,
                font: { size: 14, color: '#000000' }, // Initial font size for nodes
                borderWidth: 2,
                labelHighlightBold: true,
                title: 'node',
            },
            edges: {
                font: { size: 12, color: '#000000' }, // Initial font size for edge labels
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            },
            physics: {
                enabled: true,
                stabilization: {
                    iterations: 200,
                    updateInterval: 25,
                    fit: true,
                },
            },
            interaction: { tooltipDelay: 200 },
        };

        networkRef.current = new Network(networkContainerRef.current, data, options);

        // Dispatch a custom event when a node is selected
        networkRef.current.on('selectNode', (event) => {
            const selectedNodeId = event.nodes[0];
            window.dispatchEvent(new CustomEvent('nodeSelected', { detail: selectedNodeId }));
        });

        // Listen for the zoom event and adjust font size accordingly for both nodes and edges
        networkRef.current.on('zoom', (params) => {
            const scale = params.scale;
            const nodeFontSize = 14 / scale; // Inverted scaling for node font size
            const edgeFontSize = 12 / scale; // Inverted scaling for edge font size

            networkRef.current.setOptions({
                nodes: {
                    font: {
                        size: nodeFontSize, // Update the node font size based on scale
                    },
                },
                edges: {
                    font: {
                        size: edgeFontSize, // Update the edge font size based on scale
                    },
                },
            });
        });

        // Optional: disable physics after stabilization so the layout doesn't change
        networkRef.current.once('stabilizationIterationsDone', () => {
            networkRef.current.setOptions({ physics: false });
        });

        return () => {
            networkRef.current?.destroy();
        };
    }, [nodesData, edgesData]);

    // Update the graph's data when nodesData/edgesData change
    useEffect(() => {
        if (nodesRef.current && edgesRef.current) {
            nodesRef.current.clear();
            edgesRef.current.clear();
            nodesRef.current.add(
                nodesData.map((node) => ({
                    ...node,
                    label: node.label || node.id,
                }))
            );
            edgesRef.current.add(edgesData);
        }
    }, [nodesData, edgesData]);

    return <div ref={networkContainerRef} className="relative h-full w-full flex-4"></div>;
};

export default Graph;
