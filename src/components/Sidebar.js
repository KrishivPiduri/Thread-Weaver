import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '200px',
                height: '100%',
                backgroundColor: '#f4f4f4',
                padding: '20px',
                boxShadow: '2px 0px 5px rgba(0,0,0,0.2)',
            }}
        >
            <h2>Sidebar</h2>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/network">Network Graph</Link></li>
                <li><Link to="/about">About</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;
