// components/Graph.js
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-network/standalone/esm/vis-network';

const Graph = ({ nodesData, edgesData }) => {
    const networkContainerRef = useRef(null);

    useEffect(() => {
        const nodes = new DataSet(nodesData);
        const edges = new DataSet(edgesData);

        const data = {
            nodes: nodes,
            edges: edges,
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 16,
                font: { size: 14, color: '#ffffff' },
                borderWidth: 2,
            },
            edges: {
                font: { size: 12, color: '#000000' }, // Customize edge labels
                arrows: { to: { enabled: true, scaleFactor: 0.5 } }, // Optional: add arrow on edges
            },
            physics: {
                enabled: true,
            },
        };

        new Network(networkContainerRef.current, data, options);
    }, [nodesData, edgesData]);

    return <div ref={networkContainerRef} className='relative h-full w-full'></div>;
};

export default Graph;
