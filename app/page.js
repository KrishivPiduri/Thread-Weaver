'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/globals.css';
import { FileText, Map } from 'lucide-react';
import { useFileContext } from '@/context/FileContext';

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(false);
    const { pdfFiles, setPdfFiles } = useFileContext();
    const router = useRouter();

    const handleFileChange = (e) => {
        setPdfFiles(Array.from(e.target.files));
    };

    const handleCreateMap = () => {
        if (pdfFiles.length === 0) return;
        setIsLoading(true);
        // Simulate upload and processing delay
        setTimeout(() => {
            setIsLoading(false);
            // Redirect to workspace page after processing is complete
            router.push('/workspace');
        }, 2000);
    };

    return (
        <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-8">
            {/* Starfield background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a,_#000000)] z-0">
                <div className="w-full h-full animate-pulse opacity-20 bg-[url('/stars.svg')] bg-cover"></div>
            </div>

            {/* UI Content */}
            <div className="relative z-10 bg-white/5 backdrop-blur-lg rounded-2xl p-10 w-full max-w-3xl shadow-2xl border border-white/10">
                <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-purple-300" />
                    Upload PDFs to Create Your Knowledge Map
                </h1>

                <div className="flex flex-col gap-6">
                    <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileChange}
                        className="text-white file:bg-purple-600 file:border-none file:rounded-lg file:px-4 file:py-2 file:text-white hover:file:bg-purple-700 cursor-pointer"
                    />

                    <button
                        onClick={handleCreateMap}
                        disabled={pdfFiles.length === 0 || isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Map className="w-5 h-5" />
                        {isLoading ? 'Creating...' : 'Create Map'}
                    </button>

                    {pdfFiles.length > 0 && (
                        <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-white max-h-40 overflow-y-auto">
                            <p className="font-semibold mb-2">Selected Files:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {pdfFiles.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
