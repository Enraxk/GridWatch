/**
 * @fileoverview FullscreenButton component for toggling fullscreen mode in a map UI.
 * Renders a button that switches between "enter fullscreen" and "exit fullscreen" states,
 * displaying the appropriate icon and accessible label.
 */

import { Button } from "@/components/ui/button"

interface FullscreenButtonProps {
    /** Indicates whether the map is currently in fullscreen mode */
    isFullscreen: boolean;
    /** Callback to toggle fullscreen mode */
    toggleFullscreen: () => void;
}

/**
 * FullscreenButton component.
 *
 * @param {FullscreenButtonProps} props - The props for the component.
 * @returns {JSX.Element} The rendered button for toggling fullscreen mode.
 */
export function FullscreenButton({ isFullscreen, toggleFullscreen }: FullscreenButtonProps) {
    return (
        <div>
            <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="icon"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="absolute top-2 left-2 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-300/60 dark:border-gray-700/60 rounded-full shadow-sm transition-colors w-12 h-12 flex items-center justify-center text-white"
            >
                {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                )}
            </Button>
        </div>
    );
}