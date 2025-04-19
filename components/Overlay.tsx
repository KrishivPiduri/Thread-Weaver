export default function Overlay() {
    return (
        <div className="fixed left-4 top-32 bottom-8 w-64 flex items-center pointer-events-none">
            <div className="max-h-full w-full p-4 rounded-lg shadow-lg z-10 bg-amber-50 border-2 border-amber-500 overflow-hidden flex flex-col pointer-events-auto m-auto">
                <h2 className="text-xl font-bold mb-4 shrink-0">Overlay Links</h2>
                <div className="overflow-y-auto flex-1">
                    <ul className="space-y-2">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <li key={i}>
                                <a
                                    href="#"
                                    className="block text-black hover:bg-amber-500 hover:text-white py-2 rounded-lg text-center hover:font-bold"
                                >
                                    Link {i + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
