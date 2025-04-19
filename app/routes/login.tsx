// AuthPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";

export default function AuthPage() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("User signed in:", user);

            // Optionally save user data somewhere (like context, Zustand, localStorage, etc.)
            // localStorage.setItem('user', JSON.stringify(user));

            navigate("/generate"); // ✅ Redirect after successful login
        } catch (err) {
            console.error("Firebase sign-in error:", err);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm">
                <h1 className="text-2xl font-semibold mb-6">Welcome to the Learning App</h1>
                <button
                    onClick={handleLogin}
                    className="flex items-center justify-center border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors mx-auto"
                >
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ901eAwCHJkZ_K-vjQz9vX-WNgASX8gisXw&s"
                        alt="Google"
                        className="w-6 h-6 mr-3"
                    />
                    <span className="text-gray-700 font-medium">Sign in with Google</span>
                </button>
            </div>
        </div>
    );
}
