'use client';

// pages/index.js
import { useState } from 'react';
import Graph from '../components/Graph';
import Overlay from "../components/Overlay";
import '@/app/globals.css'        // Tailwind first
import 'vis-network/styles/vis-network.css' // vis styles override Tailwind


const Home = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const toggleOverlay = () => {
    setIsOverlayVisible(!isOverlayVisible);
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

  return (
      <div className='relative h-screen w-screen overflow-hidden'>
        {/* Graph component */}
        <Graph nodesData={nodesData} edgesData={edgesData}/>
        {/* Button to open the overlay */}
        <button
            onClick={toggleOverlay}
            className="absolute top-4 left-4 bg-transparent text-gray-500 w-16 h-16 rounded hover:bg-gray-200 flex items-center justify-center text-5xl font-thin"
        >
          {isOverlayVisible ? '‹‹' : '››'}
        </button>


        {/* Overlay */}
        {isOverlayVisible && (
            <Overlay/>
        )}
      </div>
  );
};

export default Home;
