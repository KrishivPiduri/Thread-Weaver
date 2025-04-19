import React, { createContext, useContext, useState } from 'react';

export type Node = {
    id: string | number;
    label?: string;
};

export type Edge = {
    from: string | number;
    to: string | number;
};

type GraphDataContextType = {
    nodesData: Node[];
    edgesData: Edge[];
    setNodesData: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdgesData: React.Dispatch<React.SetStateAction<Edge[]>>;
};

const GraphDataContext = createContext<GraphDataContextType | undefined>(undefined);

export const useGraphData = (): GraphDataContextType => {
    const context = useContext(GraphDataContext);
    if (!context) throw new Error('useGraphData must be used within a GraphDataProvider');
    return context;
};

export const GraphDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [nodesData, setNodesData] = useState<Node[]>([]);
    const [edgesData, setEdgesData] = useState<Edge[]>([]);

    return (
        <GraphDataContext.Provider value={{ nodesData, setNodesData, edgesData, setEdgesData }}>
    {children}
    </GraphDataContext.Provider>
);
};
