import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    Timestamp,
    getFirestore,
    deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

export const deleteGraph = async (uid: string, graphId: string) => {
    const db = getFirestore();
    const graphRef = doc(db, `users/${uid}/graphs/${graphId}`);
    await deleteDoc(graphRef);
};

// Save or update a graph
export const saveGraph = async (userId: string, graphId: string, data: any) => {
    const graphRef = doc(db, "graphs", graphId);
    await setDoc(graphRef, {
        ...data,
        userId,
        updatedAt: Timestamp.now(),
    });

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const existing = userSnap.data().graphs || [];
        if (!existing.includes(graphId)) {
            await updateDoc(userRef, {
                graphs: [...existing, graphId]
            });
        }
    } else {
        await setDoc(userRef, {
            graphs: [graphId]
        });
    }
};

// Get all graphs for a user
export const getUserGraphs = async (userId: string) => {
    const q = query(collection(db, "graphs"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Load a single graph
export const loadGraph = async (graphId: string) => {
    const ref = doc(db, "graphs", graphId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Graph not found");
    return snap.data();
};
