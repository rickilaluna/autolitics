import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Book from './pages/Book';
import Later from './pages/Later';
import Scheduled from './pages/Scheduled';
import CoreAdvisory from './pages/CoreAdvisory';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<Book />} />
                <Route path="/later" element={<Later />} />
                <Route path="/scheduled" element={<Scheduled />} />
                <Route path="/core-advisory" element={<CoreAdvisory />} />
            </Routes>
        </Router>
    );
}

export default App;
