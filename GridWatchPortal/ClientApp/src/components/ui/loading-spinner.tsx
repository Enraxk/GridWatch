/**
 * @fileoverview
 * LoadingSpinner is a React functional component that displays a centered, animated spinner overlay.
 * It is typically used to indicate loading states in the UI.
 */

export function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/70 z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        </div>
    );
}