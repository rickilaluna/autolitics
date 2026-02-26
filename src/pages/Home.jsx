import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Philosophy from '../components/Philosophy';
import Protocol from '../components/Protocol';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function Home() {
    return (
        <div className="bg-background min-h-screen text-text relative w-full">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Philosophy />
                <Protocol />
                <Pricing />
            </main>
            <Footer />
        </div>
    );
}
