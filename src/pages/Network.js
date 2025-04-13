import React, { useEffect, useState, useRef } from "react";
import { Network } from "vis-network/standalone";

const NetworkGraph = () => {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sample data for nodes and edges
    const nodes = new Array(5).fill(null).map((_, index) => ({
        id: index + 1,
        label: `Node ${index + 1}`,
        shape: "circle",
        color: "#97C2FC", // Optional: Color of the node
    }));

    const edges = [
        { from: 1, to: 2, label: "Link 1" }, // Edge with label
        { from: 2, to: 3, label: "Link 2" },
        { from: 3, to: 4, label: "Link 3" },
        { from: 4, to: 5, label: "Link 4" },
        { from: 5, to: 1, label: "Link 5" }, // Connecting the last node back to the first
        { from: 1, to: 3, label: "Link 6" }, // Additional edge to make the graph interesting
    ];

    useEffect(() => {
        // Create a new network graph after the component has mounted
        const data = {
            nodes: nodes,
            edges: edges,
        };

        const options = {
            physics: {
                enabled: true, // Enable physics for dynamic layout
            },
            nodes: {
                font: {
                    size: 14,
                    color: "#ffffff", // Node text color
                },
                size: 20, // Size of the nodes
            },
            edges: {
                color: "#2B7CE9", // Edge color
                width: 2, // Width of the edges
                font: {
                    size: 12,
                    align: 'top', // Position the label at the top of the edge
                },
            },
        };

        if (containerRef.current) {
            const network = new Network(containerRef.current, data, options);

            // Once the graph is rendered, set loading to false
            network.once("stabilized", () => {
                setIsLoading(false);
            });
        }

        // Cleanup the network instance on unmount to avoid memory leaks
        return () => {
            setIsLoading(true);
        };
    }, [nodes, edges]);

    return (
        <div style={{ position: "relative", width: "100%", height: "500px" }}>
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "20px",
                        color: "#333",
                    }}
                >
                    Loading Graph...
                </div>
            )}
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
};

export default NetworkGraph;
