import { useState, useEffect, useRef } from "react";

export const useThrottle = (value, limit = 300) => {
    const [throttled, setThrottled] = useState(value);
    const lastRan = useRef(0);

    useEffect(() => {
        const now = Date.now();
        if(now - lastRan.current >= limit) {
            setThrottled(value);
            lastRan.current = Date.now();
        }
    }, [value, limit]);

    return throttled;
}