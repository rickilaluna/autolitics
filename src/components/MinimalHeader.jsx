import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MinimalHeader() {
    const { user } = useAuth();
    
    return (
        <div
            className="w-full min-w-0 flex justify-between items-center gap-2 py-3 sm:py-4 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:px-6 md:px-12 pt-[max(0.75rem,env(safe-area-inset-top))] fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-text/5"
        >
            <Link
                to="/"
                className="flex items-center gap-2 sm:gap-3 min-w-0 transition-opacity duration-300 hover:opacity-80"
            >
                <img
                    src="/img/autolitics%203x%20yellow.png"
                    alt="Autolitics Studio logo"
                    className="h-5 w-auto shrink-0"
                />
                <span className="text-sm sm:text-base font-bold tracking-tight text-primary truncate">
                    Autolitics Studio
                </span>
            </Link>

            <Link
                to={user ? "/dashboard/resources" : "/"}
                aria-label={user ? "Back to Resources" : "Back to Home"}
                className="inline-flex items-center justify-center gap-1 shrink-0 min-h-[44px] px-2 sm:px-1 sm:min-h-0 text-sm font-medium text-text/60 hover:text-primary transition-colors touch-manipulation"
            >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{user ? "Back to Resources" : "Back to Home"}</span>
            </Link>
        </div>
    );
}
