// File: context/FileContext.js
'use client';
import { createContext, useContext, useState } from 'react';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const [pdfFiles, setPdfFiles] = useState([]);

    return (
        <FileContext.Provider value={{ pdfFiles, setPdfFiles }}>
            {children}
        </FileContext.Provider>
    );
};

// Custom hook for easy usage
export const useFileContext = () => useContext(FileContext);
