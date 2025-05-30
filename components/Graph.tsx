import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-network/standalone/esm/vis-network';
import Graphology from 'graphology';
import louvain from 'graphology-communities-louvain';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import {doc, updateDoc} from "firebase/firestore";
import {db} from "../firebase";
import innerText from "react-innertext"
import {useGraphData} from "../context/GraphDataContext";

type Node = {
    id: string | number;
    label?: string;
};

type Edge = {
    from: string | number;
    to: string | number;
};

type GraphProps = {
    nodesData: Node[];
    edgesData: Edge[];
    findPath?: (edges: Edge[], nodeId: string) => string[];
    graphKey: string;
    reloadGraph: () => Promise<void>;
    fullEdgesData: Edge[];
    onLocalExpand: (nodeId: string, newIds: string[]) => void;
};

const generateDistinctColors = (n: number): string[] => {
    const colors: string[] = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.round((360 * i) / n);
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
};

const Graph: React.FC<GraphProps> = ({
                                         findPath,
                                     }) => {
    const { nodesData, setNodesData, edgesData, setEdgesData, graphKey } = useGraphData();
    const networkContainerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const nodesRef = useRef<DataSet<any> | null>(null);
    const edgesRef = useRef<DataSet<any> | null>(null);
	const editRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<{
        node: string;
        summary: string;
        path: string[];
    } | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [isGrabbing, setIsGrabbing] = useState(false);
	const [changedLabels, setChangedLabels] = useState({})
	const [formerLabels, setFormerLabels] = useState({})

    useEffect(() => {
        const normalizedNodes = nodesData.map((n) => ({ ...n, id: String(n.id) }));
        const normalizedEdges = edgesData.map((e) => ({
            ...e,
            from: String(e.from),
            to: String(e.to),
            label: '',
        }));

        // @ts-ignore
        const g = new Graphology({ type: 'undirected', multi: true });
        // @ts-ignore
        normalizedNodes.forEach((node) => {
            const id = String(node.id);

            if (!id || g.hasNode(id)) {
                console.warn('Skipped adding invalid or duplicate node:', node);
                return;
            }

            g.addNode(id);
        });

        normalizedEdges.forEach((edge) => {
            const key = `${edge.from}->${edge.to}`;
            // @ts-ignore
            if (g.hasNode(edge.from) && g.hasNode(edge.to) && !g.hasEdge(key)) {
                // @ts-ignore
                g.addEdgeWithKey(key, edge.from, edge.to);
            }
        });

        const communityMap = louvain(g);
        const count = new Set(Object.values(communityMap)).size;
        const palette = generateDistinctColors(count);
        const communityColors: Record<string | number, string> = {};
        normalizedNodes.forEach((node, idx) => {
            const cid = communityMap[node.id];
            if (!communityColors[cid]) {
                communityColors[cid] = palette[idx % palette.length];
            }
        });
		console.log(normalizedNodes, nodesData)
        const styledNodes = normalizedNodes.map((node) => ({
            ...node,
            label: formerLabels[node.id] ?? (node.label || node.id),
            color: {
                background: node.id === '1' ? '#FFD700' : communityColors[communityMap[node.id]],
                border: node.id === '1' ? '#FF8C00' : '#333333',
            },
            size: node.id === '1' ? 28 : 16,
            font: { size: node.id === '1' ? 18 : 14, color: '#000', bold: node.id === '1' },
        }));


        nodesRef.current = new DataSet(styledNodes);
        edgesRef.current = new DataSet(normalizedEdges);

        const data = { nodes: nodesRef.current, edges: edgesRef.current };
        const options = {
            layout: { improvedLayout: true },
            nodes: { shape: 'dot', borderWidth: 2 },
            edges: {
                smooth: { type: 'dynamic' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.01,
                    springLength: 150,
                    springConstant: 0.08,
                    damping: 0.4,
                    avoidOverlap: 1,
                },
                stabilization: { enabled: true, iterations: 300, updateInterval: 25, fit: true },
            },
            interaction: {
                tooltipDelay: 200,
                dragNodes: true,
                dragView: true,
            },
        };

        if (networkRef.current) networkRef.current.destroy();
        // @ts-ignore
        networkRef.current = new Network(networkContainerRef.current!, data, options);

        networkRef.current.on('selectNode', ({ nodes }) => {
            const sel = nodes[0];
            if (sel !== selectedNode) {
                setSelectedNode(sel);
            }
        });

        networkRef.current.on('zoom', ({ scale }) => {
            networkRef.current?.setOptions({
                nodes: { font: { size: 14 / scale } },
            });
        });

		networkRef.current.on("oncontext", ({nodes, event, pointer}) => {
			console.log("pain perdue")
			event.preventDefault();
			const priorSel = selectedNode
			const net = networkRef.current
			net.unselectAll()
			console.log(pointer)
			net.selectNodes([net.getNodeAt(pointer.DOM)])
			net?.deleteSelected();
			net.unselectAll()
			net.selectNodes([selectedNode])
		})

        return () => networkRef.current?.destroy();
    }, [nodesData, edgesData, findPath]);

    useEffect(() => {
        if (!selectedNode || !findPath) return;

        networkRef.current?.selectNodes([selectedNode]);
        const neighbors = networkRef.current?.getConnectedNodes(selectedNode);
        networkRef.current?.fit({
            nodes: [selectedNode, ...(neighbors as string[])],
            animation: { duration: 800, easingFunction: 'easeInOutQuad' },
        });

        const nodeIdToLabel: Record<string, string> = {};
		const nodeIdToSublabel: Record<string, string> = {};
        nodesData.forEach(({ id, label }) => {
            nodeIdToLabel[String(id)] = label || String(id);
			nodeIdToSublabel[String(id)] = changedLabels[id] ?? nodeIdToLabel[String(id)]
        });

        const path = findPath(edgesRef.current!.get(), selectedNode);
        if (path?.length) {
            const labelPath = path.map((id) => nodeIdToSublabel[id] || id);
			console.log(labelPath, nodeIdToSublabel, changedLabels);
            setIsSummaryLoading(true);
            fetch(
                `https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/summerize?path=${encodeURIComponent(
                    labelPath.join(',')
                )}`
            )
                .then((res) => res.json())
                .then((data) =>
                    setSummaryData({
                        node: selectedNode,
                        summary: data.summary,
                        path: labelPath,
                    })
                )
                .catch((err) => console.error(err))
                .finally(() => setIsSummaryLoading(false));
        }
    }, [selectedNode]);

    const handleExpand = async () => {
        if (!selectedNode || !summaryData) return;
        setIsLoading(true);

        try {
            const topicPath = summaryData.path.slice(0,-1).map(a=>a+" > ");
            const url = new URL("https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/expand");
            url.searchParams.set("topic_path", topicPath);
            url.searchParams.set("expand_node_id", selectedNode);
            url.searchParams.set("key", graphKey);

            const res = await fetch(url.toString());
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Expand API error:", res.status, errorData);
                return;
            }

            const data = await res.json();
            const newNodeNames: string[] = data.new_node_names || [];

            const newNodes = newNodeNames.map((name) => ({
                id: name,
                label: name,
            }));

            const newEdges = newNodeNames.map((name) => ({
                from: selectedNode,
                to: name,
            }));

// Filter out duplicates
            setNodesData((prev) => {
                const existingIds = new Set(prev.map((node) => node.id));
                const filteredNewNodes = newNodes.filter((node) => !existingIds.has(node.id));
                return [...prev, ...filteredNewNodes];
            });

            setEdgesData((prev) => {
                const existingEdgeSet = new Set(prev.map((e) => `${e.from}->${e.to}`));
                const filteredNewEdges = newEdges.filter((e) => !existingEdgeSet.has(`${e.from}->${e.to}`));
                return [...prev, ...filteredNewEdges];
            });
            console.log('Graph key:', graphKey);
            try {
                const ref = doc(db, 'mindmaps', graphKey);
                await updateDoc(ref, {
                    nodesData: [...nodesData, ...newNodes],
                    edgesData: [...edgesData, ...newEdges]
                });
            } catch (err) {
                console.error('Firestore update error:', err);
            }
        } catch (err) {
            console.error("Expand failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

	const getNodeById = (id: string)=>{
		return nodesData.find(a=>String(a.id) == id);
	}

	const handleEdit = ()=>{
		console.log("rab")
		const label = editRef.current.innerText
		setChangedLabels({...changedLabels, [selectedNode]: getNodeById(selectedNode).label})
		console.log([label, Number(selectedNode)])
		networkRef.current.updateClusteredNode(selectedNode, {"label": label})
		console.log(nodesData, nodesData[Number(selectedNode)-1], changedLabels)
		setFormerLabels({...formerLabels, [selectedNode]: label})
		console.log(changedLabels[selectedNode], summaryData.path.at(-1))
		
	}

    return (
        <div
            className={`flex flex-col md:flex-row h-full w-full ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={() => setIsGrabbing(true)}
            onMouseUp={() => setIsGrabbing(false)}
            onMouseLeave={() => setIsGrabbing(false)}
        >
            <div
                ref={networkContainerRef}
                className="flex-grow md:basis-2/3 min-h-[300px] h-full md:h-auto overflow-hidden bg-white"
            />

            <div className="md:flex-shrink md:basis-1/3 w-full bg-white p-4 border-l flex flex-col relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Summary</h2>
                    <Link to="/" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                        <Home className="w-4 h-4"/>
                        Back
                    </Link>
                </div>
                {isSummaryLoading ? (
                    <div className="text-center text-gray-600">Loading summary...</div>
                ) : summaryData ? (
                    <div className='bg-white'>
                        <h3 className="font-medium mb-2 text-black">Node {summaryData.node}</h3>
                        <p className="text-sm whitespace-pre-wrap mb-2 text-black">{summaryData.summary}</p>
                        <div className="text-xs text-gray-500">
                            <strong>Path:</strong> {summaryData.path.join(' → ')} 	
                        </div>
						<div className="text-xs text-gray-500 mb-4">
							<strong>Label: </strong>
							<span onBlur={handleEdit} className="d-inline" suppressContentEditableWarning={true} contentEditable role="textbox" ref={editRef}>{formerLabels[selectedNode] ?? summaryData.path.at(-1)}</span>
						</div>
                        <button
                            onClick={handleExpand}
                            disabled={isLoading}
                            className={`w-full py-2 rounded-lg text-white ${
                                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isLoading ? 'Expanding...' : 'Expand'}
                        </button>

                    </div>
				) : (
					<>
						<div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md p-3 text-sm shadow-sm animate-pulse">
							<strong>Tip:</strong> Click on any circle (node) in the graph to explore it. Then hit <em>“Expand”</em> to grow your mind map with related concepts.
						</div>
						<div className="bg-blue-100 border border-blue-300 text-yellow-800 rounded-md p-3 text-sm shadow-sm animate-pulse my-2">
							<strong>Tip:</strong> Right click on any node to delete it.
						</div>
                    <div className="sticky bottom-0 left-0 right-0 bg-white p-3 border-t mt-auto">
                    <button
                        className="w-full py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
                        onClick={() => {
                            const shareURL = `${window.location.origin}/embed/${graphKey}`;
                            navigator.clipboard.writeText(shareURL)
                                .then(() => alert('Link copied to clipboard!'))
                                .catch((err) => console.error('Clipboard copy failed:', err));
                        }}
                    >
                        Copy Shareable Link
                    </button>
                </div>
					</>
				)}
            </div>
        </div>
    );
};

export default Graph;
