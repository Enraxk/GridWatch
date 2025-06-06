/**
 * @fileoverview
 * This file defines the `Clock` React component, which displays the current system time and date.
 * The component updates every second to reflect the current time, and formats the time in 12-hour format
 * and the date in DD/MM/YYYY format. It is intended for use in the UI as a live clock display.
 */
    
import { useState, useEffect } from 'react';

/**
 * Clock component that displays the current system time and date.
 *
 * - Updates every second using a timer.
 * - Time is formatted in 12-hour format (e.g., 3:45:12 PM).
 * - Date is formatted as DD/MM/YYYY.
 *
 * @component
 * @returns {JSX.Element} The rendered clock component.
 */
const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        // Clean up on unmount
        return () => clearInterval(timer);
    }, []);

    // Format time in 12h format
    const formattedTime = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    // Format date as DD/MM/YY
    const formattedDate = time.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground">
            <span>{formattedTime}</span>
            <span className="text-muted-foreground">|</span>
            <span>{formattedDate}</span>
        </div>
    );
};

export { Clock };