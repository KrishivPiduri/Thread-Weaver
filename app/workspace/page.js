'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Graph from '../../components/Graph';
import Overlay from '../../components/Overlay';
import '@/app/globals.css';
import 'vis-network/styles/vis-network.css';
import React, { Suspense } from 'react';

const Workspace = () => {
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [nodesData, setNodesData] = useState([]);
    const [edgesData, setEdgesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');

    const toggleOverlay = () => {
        setIsOverlayVisible(prev => !prev);
    };

    useEffect(() => {
        const baseUrl = 'https://automindbucket.hackyourgrade.com/';
        const sanitizeKey = (str) => str.replace(/\s+/g, '').toLowerCase();

        const startJob = async () => {
            try {
                const response = await fetch('https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ root_topic: topic }),
                });

                if (!response.ok) throw new Error('Failed to start mindmap generation');
                const result = await response.json();
                console.log('Mindmap job started:', result);

                if (!result.s3_key) throw new Error('Missing s3_key in Lambda response');
                return result.s3_key;
            } catch (err) {
                console.error('Error triggering Lambda:', err);
                throw err;
            }
        };

        const pollForResult = async (filename) => {
            const fileUrl = `${baseUrl}${filename}`;
            const timeout = 60000; // 1 minute
            const interval = 3000; // poll every 3 seconds
            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                try {
                    const res = await fetch(fileUrl, { cache: 'no-store' });
                    if (res.ok) {
                        const json = await res.json();
                        setNodesData(json.nodesData || []);
                        setEdgesData(json.edgesData || []);
                        return;
                    }
                } catch (e) {
                    // Ignore and retry
                }

                await new Promise(resolve => setTimeout(resolve, interval));
            }

            throw new Error('Timed out waiting for mindmap file to be available.');
        };

        const fetchData = async () => {
            if (!topic) {
                setError('No topic provided.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const key = `${sanitizeKey(topic)}.json`;
                const fileUrl = `${baseUrl}${key}`;

                // 🔍 Check if file already exists
                const checkRes = await fetch(fileUrl, { method: 'HEAD', cache: 'no-store' });

                if (checkRes.ok) {
                    // File already exists — just poll and use it
                    console.log('Mindmap already exists, skipping Lambda call.');
                    await pollForResult(key);
                } else {
                    // File doesn't exist — trigger Lambda and poll
                    const generatedKey = await startJob();
                    await pollForResult(generatedKey);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load mindmap. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [topic]);
    function findPathBFS(edges, target) {
        const graph = {};

        // Build adjacency list
        edges.forEach(({ from, to }) => {
            if (!graph[from]) graph[from] = [];
            graph[from].push(to);
        });

        const visited = new Set();
        const queue = [[1]];

        while (queue.length) {
            const path = queue.shift();
            const node = path[path.length - 1];

            if (node === target) return path;

            if (!visited.has(node)) {
                visited.add(node);
                (graph[node] || []).forEach((neighbor) => {
                    queue.push([...path, neighbor]);
                });
            }
        }

        return null; // No path found
    }


    return (
        <div className="flex flex-col h-screen p-4">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
                    <span className="ml-4 text-lg">Generating graph for "{topic}"...</span>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-full text-red-600">
                    <p>{error}</p>
                </div>
            ) : (
                <Graph nodesData={nodesData} edgesData={edgesData} />
            )}
            {isOverlayVisible && <Overlay onClose={toggleOverlay} />}
        </div>
    );
};

export default function WorkspacePage() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading workspace...</div>}>
            <Workspace />
        </Suspense>
    );
}
