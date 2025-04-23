// UserMenu.js
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function UserMenu({ user, onLogout }) {
    const handleLogout = async () => {
        try {
            await signOut(auth); // Properly end the session
            onLogout(); // Notify the parent to update UI
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="absolute top-0 right-4 bg-white shadow-md px-4 py-2 rounded-lg flex items-center space-x-3 z-20 mt-10">
            <img
                src={user.photoURL}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
            <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline"
            >
                Log out
            </button>
        </div>
    );
}
