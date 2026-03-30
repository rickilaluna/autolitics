import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MinimalHeader() {
    return (
        <div className="w-full flex justify-between items-center py-4 px-6 md:px-12 fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-text/5">
            <Link to="/" className="flex items-center gap-3 transition-opacity duration-300 hover:opacity-80">
                <img
                    src="/img/autolitics%203x%20yellow.png"
                    alt="Autolitics Studio logo"
                    className="h-5 w-auto"
                />
                <span className="text-base font-bold tracking-tight text-primary">
                    Autolitics Studio
                </span>
            </Link>

            <Link to="/" className="inline-flex items-center text-sm font-medium text-text/60 hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Home
            </Link>
        </div>
    );
}
