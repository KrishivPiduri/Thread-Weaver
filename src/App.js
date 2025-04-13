import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import NetworkGraph from './pages/Network';
import About from './pages/About';

const App = () => {
    return (
        <BrowserRouter>
            <Header />
            <Sidebar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/network" element={<NetworkGraph />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
