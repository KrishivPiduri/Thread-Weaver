import React from "react";
import Graph from "react-vis-network-graph";
import "vis-network/styles/vis-network.css"; // Ensure this line exists!

export default function App() {
    const graph = {
        nodes: [
            { id: 1, label: "Node 1", title: "Tooltip 1" },
            { id: 2, label: "Node 2", title: "Tooltip 2" }
        ],
        edges: [{ from: 1, to: 2 }]
    };

    const options = {
        layout: {
            hierarchical: false
        },
        nodes: {
            shape: "dot",
            size: 25,
            font: {
                color: "#000000",
                size: 20,
                face: "arial"
            }
        },
        edges: {
            color: "#0077aa"
        },
        height: "500px"
    };

    return (
        <div style={{ height: "100vh", background: "#f0f0f0" }}>
            <Graph
                graph={graph}
                options={options}
                events={{}}
                getNetwork={(network) => {
                    // Optional access to vis.js API
                }}
            />
        </div>
    );
}
