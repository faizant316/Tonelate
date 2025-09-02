import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO, isValid } from "date-fns";

const TimeAgo = ({ dateString }) => {
    const calculateTimeAgo = React.useCallback(() => {
        if (!dateString) return "recently";
        try {
            let date = parseISO(dateString);
            if (!isValid(date)) {
                date = new Date(dateString);
                if (!isValid(date)) return "recently";
            }
            
            const now = new Date();
            if (date > now) {
                date = now;
            }
            
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            console.warn("Error formatting date in TimeAgo:", error);
            return "recently";
        }
    }, [dateString]);

    const [timeAgo, setTimeAgo] = useState(calculateTimeAgo);

    useEffect(() => {
        // Update immediately when component mounts or dateString changes
        setTimeAgo(calculateTimeAgo());
        
        // Update every 30 seconds to keep the time fresh
        const interval = setInterval(() => {
            setTimeAgo(calculateTimeAgo());
        }, 30000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [calculateTimeAgo]);

    return <>{timeAgo}</>;
};

export default TimeAgo;
