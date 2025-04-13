// components/Summary.js
import React, { useEffect, useState } from 'react';

const Summary = ({ nodesData, nodeSummaries }) => {
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        const handleNodeSelected = (event) => {
            setSelectedNode(event.detail);
        };

        window.addEventListener('nodeSelected', handleNodeSelected);
        return () => {
            window.removeEventListener('nodeSelected', handleNodeSelected);
        };
    }, []);

    if (!selectedNode) {
        return null; // or render a placeholder if no node is selected
    }

    const nodeInfo = nodesData.find((node) => node.id === selectedNode);

    return (
        <div>
            <h2 className="text-2xl font-semibold">{nodeInfo?.label}</h2>
            <p>{nodeSummaries[selectedNode]}</p>
        </div>
    );
};

export default React.memo(Summary);
