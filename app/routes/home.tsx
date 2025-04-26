import { useEffect, useState } from "react";
import {addDoc, collection, Timestamp} from "firebase/firestore";
import {db} from "../../firebase";
import {useTopic} from "../../context/TopicContext";
import {useGraphData} from "../../context/GraphDataContext";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";

const rotatingTopics = [
  "Machine Learning",
  "Quantum Computing",
  "World War 2",
  "Stoic Philosophy",
  "The Renaissance",
  "Black Holes",
  "Game Theory",
];

export default function HeroStarfield() {
  const [topic, setTopic] = useTopic();
  const { setNodesData, setEdgesData } = useGraphData();
  const { setGraphKey } = useGraphData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placeholder, setPlaceholder] = useState(rotatingTopics[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => {
        const currentIndex = rotatingTopics.indexOf(prev);
        return rotatingTopics[(currentIndex + 1) % rotatingTopics.length];
      });
    }, 2000); // every 2 seconds

    return () => clearInterval(interval);
  }, []);
  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);

    try {
      const response = await fetch('https://siy5vls6ul.execute-api.us-east-1.amazonaws.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ root_topic: topic }),
      });

      if (!response.ok) throw new Error('Failed to generate mindmap');

      const result = await response.json();

      if (!result.nodesData || !result.edgesData) {
        throw new Error('Invalid response: missing nodes or edges data');
      }

      setNodesData(result.nodesData);
      setEdgesData(result.edgesData);

      // @ts-ignore
      if (!user.uid) return;

      const docRef = await addDoc(collection(db, 'mindmaps'), {
        topic,
        nodesData: result.nodesData,
        edgesData: result.edgesData,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
      });

      setGraphKey(docRef.id);
      navigate(`/embed/${docRef.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <section className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden text-white">
        {/* Starfield background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[radial-gradient(circle,_#ffffff11,_transparent)] blur-sm animate-pulse" />
        </div>

        {/* Overlay content */}
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Take a Self-Guided Tour Through Any Topic</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <input
                className="flex-1 min-w-[280px] px-6 py-3 text-lg text-white rounded-md outline-none shadow-lg border-[1px] border-white bg-transparent placeholder-white/60 focus:border-2"
                type="text"
                placeholder={placeholder}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />
            <button
                className="bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-gray-200 shadow-lg cursor-pointer"
                onClick={handleGenerate}
            >
              {loading ? "Generating map..." : "Try it →"}
            </button>
          </div>
        </div>
      </section>
  );
}
