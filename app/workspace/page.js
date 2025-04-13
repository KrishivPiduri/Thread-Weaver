// pages/workspace.js (or similar file path)
'use client';

import { useFileContext } from '@/context/FileContext';
import {useEffect, useState} from 'react';
import Graph from '../../components/Graph';
import Summary from '../../components/Summary';
import Overlay from '../../components/Overlay';
import '@/app/globals.css';
import 'vis-network/styles/vis-network.css';

const Workspace = () => {
    const { pdfFiles } = useFileContext();

    // For demonstration, you might log the files; in production,
    // pass these files to your fetchNetworkData function as needed.
    useEffect(() => {
        if (pdfFiles.length > 0) {
            console.log('Files available in workspace:', pdfFiles);
            // Example: fetchNetworkData(pdfFiles);
        }
    }, [pdfFiles]);

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const toggleOverlay = () => {
        setIsOverlayVisible((prev) => !prev);
    };

    const nodesData = [
        { id: 1, label: 'Note 1' },
        { id: 2, label: 'Note 2' },
        { id: 3, label: 'Note 3' },
        { id: 4, label: 'Note 4' },
    ];

    const edgesData = [
        { from: 1, to: 2, label: 'Link 1-2' },
        { from: 1, to: 3, label: 'Link 1-3' },
        { from: 2, to: 4, label: 'Link 2-4' },
    ];

    const nodeSummaries = {
        1: 'Summary for Note 1: This is a detailed description of Note 1.',
        2: 'Summary for Note 2: This is a detailed description of Note 2.',
        3: 'Summary for Note 3: This is a detailed description of Note 3.',
        4: 'Summary for Note 4: This is a detailed description of Note 4.',
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden flex">
            {/* Graph component */}
            <Graph nodesData={nodesData} edgesData={edgesData} />

            {/* Button to open the overlay */}
            <button
                onClick={toggleOverlay}
                className="absolute top-4 left-4 bg-transparent text-gray-500 w-16 h-16 rounded hover:bg-gray-200 flex items-center justify-center text-5xl font-thin"
            >
                {isOverlayVisible ? '‹‹' : '››'}
            </button>

            {/* Overlay */}
            {isOverlayVisible && <Overlay />}

            {/* Summary Section */}
            <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
                <Summary nodesData={nodesData} nodeSummaries={nodeSummaries} />
            </div>
        </div>
    );
};

export default Workspace;
